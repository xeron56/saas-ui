import {
  Alert,
  Avatar,
  Badge,
  Button,
  Empty,
  Form,
  Input,
  List,
  Spin,
  message as toast,
} from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent, postPublicContent } from '../services';
import type { LegacyRecord } from '../types';

type ChatUser = LegacyRecord & {
  id?: string | number;
  name?: string;
  email?: string;
  avatar?: string | LegacyRecord;
  image?: string | LegacyRecord;
  last_message?: string;
  last_message_time?: string;
  unseen_message_count?: string | number;
};

type ChatMessage = LegacyRecord & {
  id?: string | number;
  sender_id?: string | number;
  receiver_id?: string | number;
  message?: string;
  created_at?: string;
  media?: LegacyRecord[];
};

function records(value: unknown): LegacyRecord[] {
  return Array.isArray(value) ? value : [];
}

function maybeUrl(value: unknown) {
  const raw =
    typeof value === 'object' && value
      ? textValue((value as LegacyRecord).url || (value as LegacyRecord).file_url)
      : textValue(value);
  if (/^(https?:|data:|\/)/.test(raw)) {
    return raw;
  }
  return undefined;
}

function userAvatar(user: ChatUser) {
  return maybeUrl(user.avatar) || maybeUrl(user.image);
}

function userName(user?: ChatUser) {
  return textValue(user?.name) || textValue(user?.email) || 'Unknown user';
}

function userInitial(user: ChatUser) {
  return userName(user).charAt(0).toUpperCase();
}

function formatDate(value: unknown) {
  const raw = textValue(value);
  if (!raw) {
    return '';
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return date.toLocaleString();
}

function mediaLabel(media: LegacyRecord) {
  return (
    textValue(media.original_name) ||
    textValue(media.name) ||
    textValue(media.file_name) ||
    `Attachment ${textValue(media.file) || textValue(media.id)}`
  );
}

function isImageMedia(media: LegacyRecord, url: string) {
  const extension = textValue(media.extension).toLowerCase();
  return (
    /\.(avif|gif|jpe?g|png|webp)$/i.test(url) ||
    ['avif', 'gif', 'jpg', 'jpeg', 'png', 'webp'].includes(extension)
  );
}

export default function Chats() {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const selectedUser = useMemo(
    () => users.find((user) => textValue(user.id) === selectedUserId),
    [selectedUserId, users],
  );

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setError('');
    try {
      const body = normalizePayload(await fetchPublicContent('/chats'));
      if (body.status === false) {
        setError(textValue(body.message) || 'Unable to load chat contacts.');
        setUsers([]);
        return;
      }
      setUsers(records(body.users) as ChatUser[]);
    } catch (err: any) {
      setError(err?.message || 'Unable to load chat contacts.');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadThread = useCallback(async (receiverId: string) => {
    if (!receiverId) {
      setMessages([]);
      return;
    }
    setThreadLoading(true);
    setError('');
    try {
      const body = normalizePayload(
        await fetchPublicContent(
          `/chats/single-user-chat?receiver_id=${encodeURIComponent(receiverId)}`,
        ),
      );
      if (body.status === false) {
        setError(textValue(body.message) || 'Unable to load this conversation.');
        setMessages([]);
        return;
      }
      setMessages(records(body.chats) as ChatMessage[]);
    } catch (err: any) {
      setError(err?.message || 'Unable to load this conversation.');
      setMessages([]);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId('');
      return;
    }
    if (!selectedUserId || !users.some((user) => textValue(user.id) === selectedUserId)) {
      setSelectedUserId(textValue(users[0].id));
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    loadThread(selectedUserId);
  }, [loadThread, selectedUserId]);

  const submit = async (values: { message?: string }) => {
    const bodyMessage = textValue(values.message);
    if (!selectedUserId || !bodyMessage) {
      return;
    }
    setSending(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent('/chats/send-message', {
          receiver_id: selectedUserId,
          message: bodyMessage,
        }),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Message could not be sent.');
        return;
      }
      form.resetFields();
      await Promise.all([loadThread(selectedUserId), loadUsers()]);
      toast.success(textValue(response.message) || 'Message sent.');
    } catch (err: any) {
      setError(err?.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicShell title="Messages" description="Tenant member conversations">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <div className="public-chat">
        <aside className="public-chat-users" aria-label="Chat contacts">
          <Spin spinning={usersLoading}>
            <List
              dataSource={users}
              locale={{ emptyText: <Empty description="No chat contacts" /> }}
              renderItem={(user) => {
                const id = textValue(user.id);
                const active = id === selectedUserId;
                const unread = Number(user.unseen_message_count || 0);
                return (
                  <List.Item>
                    <button
                      type="button"
                      className={`public-chat-user${active ? ' public-chat-user-active' : ''}`}
                      onClick={() => setSelectedUserId(id)}
                    >
                      <Badge count={unread} overflowCount={99} size="small">
                        <Avatar src={userAvatar(user)} icon={<UserOutlined />}>
                          {userInitial(user)}
                        </Avatar>
                      </Badge>
                      <span className="public-chat-user-main">
                        <strong>{userName(user)}</strong>
                        <span>{textValue(user.last_message) || 'No messages yet'}</span>
                      </span>
                      <time>{formatDate(user.last_message_time)}</time>
                    </button>
                  </List.Item>
                );
              }}
            />
          </Spin>
        </aside>

        <section className="public-chat-thread" aria-label="Conversation">
          <header className="public-chat-thread-head">
            {selectedUser ? (
              <>
                <Avatar src={userAvatar(selectedUser)} icon={<UserOutlined />}>
                  {userInitial(selectedUser)}
                </Avatar>
                <div>
                  <h2>{userName(selectedUser)}</h2>
                  {textValue(selectedUser.last_seen) ? (
                    <p>Last seen {formatDate(selectedUser.last_seen)}</p>
                  ) : null}
                </div>
              </>
            ) : (
              <h2>Select a conversation</h2>
            )}
          </header>

          <Spin spinning={threadLoading}>
            <div className="public-chat-messages">
              {!selectedUser ? <Empty description="Choose a contact to start messaging" /> : null}
              {selectedUser && messages.length === 0 && !threadLoading ? (
                <Empty description="No messages in this conversation" />
              ) : null}
              {messages.map((chat) => {
                const inbound = textValue(chat.sender_id) === selectedUserId;
                const media = records(chat.media);
                return (
                  <article
                    className={`public-chat-message ${
                      inbound ? 'public-chat-message-in' : 'public-chat-message-out'
                    }`}
                    key={textValue(chat.id) || `${chat.sender_id}-${chat.created_at}`}
                  >
                    <div className="public-chat-bubble">
                      {textValue(chat.message) ? <p>{textValue(chat.message)}</p> : null}
                      {media.length > 0 ? (
                        <div className="public-chat-attachments">
                          {media.map((item) => {
                            const url = maybeUrl(item.file_url || item.url || item.path) || '#';
                            const label = mediaLabel(item);
                            return (
                              <a
                                className="public-chat-attachment"
                                href={url}
                                key={textValue(item.id) || `${label}-${url}`}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {url !== '#' && isImageMedia(item, url) ? (
                                  <img src={url} alt={label} />
                                ) : (
                                  label
                                )}
                              </a>
                            );
                          })}
                        </div>
                      ) : null}
                      {formatDate(chat.created_at) ? (
                        <time>{formatDate(chat.created_at)}</time>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </Spin>

          <Form className="public-chat-composer" form={form} onFinish={submit}>
            <Form.Item name="message" rules={[{ required: true, message: 'Enter a message.' }]}>
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 4 }}
                disabled={!selectedUser || sending}
                placeholder="Message"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              disabled={!selectedUser}
              loading={sending}
            >
              Send
            </Button>
          </Form>
        </section>
      </div>
    </PublicShell>
  );
}
