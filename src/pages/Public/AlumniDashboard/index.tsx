import { useLocation } from '@umijs/max';
import {
  Alert,
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  List,
  Popconfirm,
  Spin,
  Statistic,
  Space,
  Table,
  Tag,
  Upload,
  message as toast,
} from 'antd';
import {
  CalendarOutlined,
  CloseOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  EditOutlined,
  HeartOutlined,
  MessageOutlined,
  SaveOutlined,
  SendOutlined,
  TeamOutlined,
  UploadOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { getUserInfo } from '@gosaas/core';
import { useEffect, useMemo, useState } from 'react';
import {
  contentSummary,
  contentTitle,
  normalizePayload,
  recordsFromPayload,
  textValue,
} from '../content';
import PublicShell from '../PublicShell';
import {
  deletePublicContent,
  fetchPublicContent,
  postPublicContent,
  putPublicContent,
} from '../services';
import type { LegacyRecord } from '../types';

function money(value: unknown) {
  const numberValue = Number(value || 0);
  if (!Number.isFinite(numberValue)) {
    return textValue(value) || '0';
  }
  return numberValue.toFixed(2);
}

function dashboardRows(value: unknown) {
  if (Array.isArray(value)) {
    return value as LegacyRecord[];
  }
  if (value && typeof value === 'object' && Array.isArray((value as LegacyRecord).mainData)) {
    return (value as LegacyRecord).mainData as LegacyRecord[];
  }
  return [];
}

function decodeLegacyText(value: unknown) {
  return textValue(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function legacyRecords(value: unknown) {
  return Array.isArray(value) ? (value as LegacyRecord[]) : [];
}

function userID(value: unknown) {
  return textValue(value);
}

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function postMediaFormData(body: string, files: any[] = [], slug = '', retained: string[] = []) {
  const formData = new FormData();
  formData.append('body', body);
  if (slug) {
    formData.append('slug', slug);
  }
  retained.forEach((id) => formData.append('oldFiles[]', id));
  files.forEach((file) => {
    const origin = file.originFileObj as File | undefined;
    if (origin) {
      formData.append('file[]', origin);
    }
  });
  return formData;
}

function mediaExtension(item: LegacyRecord) {
  const explicit = textValue(item.extension).toLowerCase();
  if (explicit) {
    return explicit;
  }
  const url = textValue(item.file_url);
  return url.split('?')[0].split('.').pop()?.toLowerCase() || '';
}

function isVideoMedia(item: LegacyRecord) {
  return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'].includes(mediaExtension(item));
}

function commentAuthor(comment: LegacyRecord) {
  return (
    textValue(comment.user_name) ||
    textValue(comment.user?.name) ||
    textValue(comment.author?.name) ||
    'Member'
  );
}

function HomeSection({
  title,
  items,
  detailBase,
}: {
  title: string;
  items: LegacyRecord[];
  detailBase?: string;
}) {
  return (
    <section className="public-section">
      <div className="public-section-heading">
        <h2>{title}</h2>
      </div>
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="public-grid">
          {items.map((item, index) => {
            const titleValue = contentTitle(item);
            const slug = textValue(item.slug) || textValue(item.id);
            return (
              <a
                className="public-card public-compact-card"
                href={detailBase && slug ? `${detailBase}/${encodeURIComponent(slug)}` : undefined}
                key={textValue(item.id) || `${title}-${index}`}
              >
                <div className="public-card-body">
                  <h2>{titleValue}</h2>
                  <div className="public-meta">
                    {textValue(item.date) ? <Tag>{textValue(item.date)}</Tag> : null}
                    {textValue(item.application_deadline) ? (
                      <Tag>{textValue(item.application_deadline)}</Tag>
                    ) : null}
                  </div>
                  {contentSummary(item) ? <p>{contentSummary(item)}</p> : null}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function AlumniDashboard() {
  const location = useLocation();
  const [postForm] = Form.useForm();
  const dashboard = location.pathname.replace(/\/$/, '') === '/dashboard';
  const [payload, setPayload] = useState<LegacyRecord>({});
  const [transactions, setTransactions] = useState<LegacyRecord[]>([]);
  const [posts, setPosts] = useState<LegacyRecord[]>([]);
  const [postPage, setPostPage] = useState(1);
  const [postLastPage, setPostLastPage] = useState(1);
  const [postDrafts, setPostDrafts] = useState<Record<string, string>>({});
  const [postEditDrafts, setPostEditDrafts] = useState<Record<string, string>>({});
  const [postEditUploads, setPostEditUploads] = useState<Record<string, any[]>>({});
  const [postRetainedMedia, setPostRetainedMedia] = useState<Record<string, string[]>>({});
  const [commentEditDrafts, setCommentEditDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [editingPost, setEditingPost] = useState('');
  const [editingComment, setEditingComment] = useState('');
  const [replyingTo, setReplyingTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const currentUser = useMemo(() => (getUserInfo() || {}) as LegacyRecord, []);
  const currentUserId = userID(currentUser.id);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPublicContent(dashboard ? '/dashboard' : '/home')
      .then((response) => setPayload(normalizePayload(response)))
      .catch((err) => setError(err?.message || 'Unable to load dashboard.'))
      .finally(() => setLoading(false));
  }, [dashboard]);

  useEffect(() => {
    if (!dashboard) {
      setTransactions([]);
      return;
    }
    setTransactionsLoading(true);
    fetchPublicContent('/dashboard?ajax=1')
      .then((response) => {
        const body = normalizePayload(response);
        setTransactions(recordsFromPayload(body, 'data'));
      })
      .catch(() => setTransactions([]))
      .finally(() => setTransactionsLoading(false));
  }, [dashboard]);

  const loadPosts = async (page = 1, append = false) => {
    setTimelineLoading(true);
    try {
      const body = normalizePayload(await fetchPublicContent(`/more-post-load?page=${page}`));
      const items = recordsFromPayload(body, 'items');
      const pagination = (body.pagination || body.posts || {}) as LegacyRecord;
      setPosts((current) => (append ? [...current, ...items] : items));
      setPostPage(Number(pagination.current_page || page));
      setPostLastPage(Number(pagination.last_page || page));
    } catch (_err) {
      if (!append) {
        setPosts([]);
      }
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    if (dashboard) {
      setPosts([]);
      return;
    }
    loadPosts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard]);

  const createPost = async (values: { body?: string; file?: any[] }) => {
    setPosting(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent(
          '/posts/store',
          postMediaFormData(textValue(values.body), values.file),
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Post could not be created.');
        return;
      }
      postForm.resetFields();
      await loadPosts(1, false);
      toast.success(textValue(response.message) || 'Post created.');
    } catch (err: any) {
      setError(err?.message || 'Post could not be created.');
    } finally {
      setPosting(false);
    }
  };

  const likePost = async (slug: string) => {
    if (!slug) {
      return;
    }
    try {
      const response = normalizePayload(await postPublicContent('/posts/like', { slug }));
      if (response.status === false) {
        setError(textValue(response.message) || 'Post like could not be updated.');
        return;
      }
      await loadPosts(1, false);
    } catch (err: any) {
      setError(err?.message || 'Post like could not be updated.');
    }
  };

  const updatePost = async (slug: string) => {
    const body = textValue(postEditDrafts[slug]);
    if (!slug || !body) {
      return;
    }
    try {
      const response = normalizePayload(
        await putPublicContent(
          '/posts/update',
          postMediaFormData(body, postEditUploads[slug], slug, postRetainedMedia[slug]),
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Post could not be updated.');
        return;
      }
      setEditingPost('');
      setPostEditDrafts((current) => ({ ...current, [slug]: '' }));
      setPostEditUploads((current) => ({ ...current, [slug]: [] }));
      setPostRetainedMedia((current) => ({ ...current, [slug]: [] }));
      await loadPosts(1, false);
      toast.success(textValue(response.message) || 'Post updated.');
    } catch (err: any) {
      setError(err?.message || 'Post could not be updated.');
    }
  };

  const deletePost = async (slug: string) => {
    if (!slug) {
      return;
    }
    try {
      const response = normalizePayload(
        await deletePublicContent(`/posts/delete?slug=${encodeURIComponent(slug)}`),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Post could not be deleted.');
        return;
      }
      await loadPosts(1, false);
      toast.success(textValue(response.message) || 'Post deleted.');
    } catch (err: any) {
      setError(err?.message || 'Post could not be deleted.');
    }
  };

  const commentPost = async (slug: string, parentId?: string) => {
    const draftKey = parentId ? `${slug}:${parentId}` : slug;
    const body = textValue(parentId ? replyDrafts[draftKey] : postDrafts[slug]);
    if (!slug || !body) {
      return;
    }
    try {
      const response = normalizePayload(
        await postPublicContent('/posts/posts/comments', {
          slug,
          body,
          parent_id: parentId,
        }),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Comment could not be saved.');
        return;
      }
      if (parentId) {
        setReplyDrafts((current) => ({ ...current, [draftKey]: '' }));
        setReplyingTo('');
      } else {
        setPostDrafts((current) => ({ ...current, [slug]: '' }));
      }
      await loadPosts(1, false);
      toast.success(textValue(response.message) || 'Comment saved.');
    } catch (err: any) {
      setError(err?.message || 'Comment could not be saved.');
    }
  };

  const updateComment = async (id: string) => {
    const body = textValue(commentEditDrafts[id]);
    if (!id || !body) {
      return;
    }
    try {
      const response = normalizePayload(
        await putPublicContent('/posts/posts/comments/update', { id, body }),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Comment could not be updated.');
        return;
      }
      setEditingComment('');
      setCommentEditDrafts((current) => ({ ...current, [id]: '' }));
      await loadPosts(1, false);
      toast.success(textValue(response.message) || 'Comment updated.');
    } catch (err: any) {
      setError(err?.message || 'Comment could not be updated.');
    }
  };

  const deleteComment = async (id: string) => {
    if (!id) {
      return;
    }
    try {
      const response = normalizePayload(
        await deletePublicContent(`/posts/posts/comments/delete?id=${encodeURIComponent(id)}`),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Comment could not be deleted.');
        return;
      }
      await loadPosts(1, false);
      toast.success(textValue(response.message) || 'Comment deleted.');
    } catch (err: any) {
      setError(err?.message || 'Comment could not be deleted.');
    }
  };

  const paymentRows = useMemo(() => dashboardRows(payload.chart), [payload.chart]);
  const ticketRows = useMemo(
    () => dashboardRows(payload.topEventTickets),
    [payload.topEventTickets],
  );

  const renderComment = (comment: LegacyRecord, slug: string, depth = 0) => {
    const id = textValue(comment.id);
    const replies = legacyRecords(comment.replies);
    const canManage = currentUserId && userID(comment.user_id) === currentUserId;
    const replyKey = `${slug}:${id}`;
    const isEditing = editingComment === id;
    return (
      <div
        className={
          depth > 0 ? 'public-timeline-comment public-timeline-reply' : 'public-timeline-comment'
        }
        key={id || `${slug}-comment-${depth}`}
      >
        <div className="public-timeline-comment-body">
          <strong>{commentAuthor(comment)}</strong>
          {isEditing ? (
            <Input.TextArea
              rows={2}
              value={commentEditDrafts[id] || ''}
              onChange={(event) =>
                setCommentEditDrafts((current) => ({
                  ...current,
                  [id]: event.target.value,
                }))
              }
            />
          ) : (
            <p>{decodeLegacyText(comment.body)}</p>
          )}
        </div>
        <Space wrap size={6}>
          {isEditing ? (
            <>
              <Button size="small" icon={<SaveOutlined />} onClick={() => updateComment(id)}>
                Save
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  setEditingComment('');
                  setCommentEditDrafts((current) => ({ ...current, [id]: '' }));
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="small" onClick={() => setReplyingTo(replyKey)}>
                Reply
              </Button>
              {canManage ? (
                <>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingComment(id);
                      setCommentEditDrafts((current) => ({
                        ...current,
                        [id]: decodeLegacyText(comment.body),
                      }));
                    }}
                  >
                    Edit
                  </Button>
                  <Popconfirm title="Delete this comment?" onConfirm={() => deleteComment(id)}>
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>
                </>
              ) : null}
            </>
          )}
        </Space>
        {replyingTo === replyKey ? (
          <div className="public-timeline-comment-form public-timeline-reply-form">
            <Input
              value={replyDrafts[replyKey] || ''}
              placeholder="Write a reply"
              onChange={(event) =>
                setReplyDrafts((current) => ({
                  ...current,
                  [replyKey]: event.target.value,
                }))
              }
            />
            <Space wrap>
              <Button icon={<SendOutlined />} onClick={() => commentPost(slug, id)}>
                Reply
              </Button>
              <Button icon={<CloseOutlined />} onClick={() => setReplyingTo('')}>
                Cancel
              </Button>
            </Space>
          </div>
        ) : null}
        {replies.length > 0 ? (
          <div className="public-timeline-replies">
            {replies.map((reply) => renderComment(reply, slug, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <PublicShell
      title={dashboard ? 'Dashboard' : 'Timeline'}
      description={dashboard ? 'Tenant activity summary' : 'Latest alumni updates'}
    >
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {dashboard ? (
          <>
            <div className="public-stats">
              <Statistic
                title="Total Alumni"
                value={Number(payload.totalAlumni || 0)}
                prefix={<TeamOutlined />}
              />
              <Statistic
                title="Current Members"
                value={Number(payload.currentMember || 0)}
                prefix={<UsergroupAddOutlined />}
              />
              <Statistic
                title="Upcoming Events"
                value={Number(payload.totalUpcomingEvent || 0)}
                prefix={<CalendarOutlined />}
              />
              <Statistic
                title="This Month"
                value={money(payload.transactionThisMonth)}
                prefix={<CreditCardOutlined />}
              />
            </div>

            <div className="public-dashboard-grid">
              <section>
                <div className="public-section-heading">
                  <h2>Membership Payments</h2>
                </div>
                <Table
                  rowKey={(record) => textValue(record.day)}
                  dataSource={paymentRows}
                  pagination={false}
                  columns={[
                    { title: 'Day', dataIndex: 'day' },
                    { title: 'Total', dataIndex: 'total', render: (value) => money(value) },
                  ]}
                />
              </section>
              <section>
                <div className="public-section-heading">
                  <h2>Top Event Tickets</h2>
                </div>
                <Table
                  rowKey={(record) => textValue(record.event_name) || textValue(record.eventName)}
                  dataSource={ticketRows}
                  pagination={false}
                  columns={[
                    {
                      title: 'Event',
                      render: (_, record) =>
                        textValue(record.event_name) || textValue(record.eventName) || '-',
                    },
                    {
                      title: 'Tickets',
                      render: (_, record) =>
                        textValue(record.total_ticket) || textValue(record.totalTicket) || '0',
                    },
                  ]}
                />
              </section>
            </div>

            <section className="public-section">
              <div className="public-section-heading">
                <h2>Latest Transactions</h2>
              </div>
              <Table
                rowKey={(record) => textValue(record.id) || textValue(record.tnxId)}
                loading={transactionsLoading}
                dataSource={transactions}
                pagination={{ pageSize: 8 }}
                columns={[
                  { title: 'Transaction', dataIndex: 'tnxId' },
                  { title: 'User', dataIndex: 'name' },
                  { title: 'Amount', dataIndex: 'amount' },
                  { title: 'Method', dataIndex: 'payment_method' },
                  { title: 'Purpose', dataIndex: 'purpose' },
                ]}
              />
            </section>
          </>
        ) : (
          <>
            <section className="public-section">
              <div className="public-section-heading">
                <h2>Timeline</h2>
              </div>
              <div className="public-timeline">
                <Form
                  className="public-form public-settings-form"
                  form={postForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={createPost}
                >
                  <Form.Item name="body" rules={[{ required: true, min: 2 }]}>
                    <Input.TextArea rows={3} placeholder="Share an update" />
                  </Form.Item>
                  <Form.Item
                    name="file"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeUploadEvent}
                  >
                    <Upload
                      beforeUpload={() => false}
                      multiple
                      accept=".png,.jpg,.svg,.jpeg,.gif,.mp4,.mov,.avi,.mkv,.webm,.flv"
                    >
                      <Button icon={<UploadOutlined />}>Attach media</Button>
                    </Upload>
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={posting}
                  >
                    Post
                  </Button>
                </Form>

                <Spin spinning={timelineLoading && posts.length === 0}>
                  {posts.length === 0 && !timelineLoading ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : null}
                  <List
                    dataSource={posts}
                    renderItem={(post) => {
                      const slug = textValue(post.slug);
                      const author = (post.author || {}) as LegacyRecord;
                      const comments = legacyRecords(post.comments);
                      const media = legacyRecords(post.media);
                      const isEditingPost = editingPost === slug;
                      const canManagePost =
                        currentUserId &&
                        (userID(post.created_by) === currentUserId ||
                          userID(currentUser.role) === '1');
                      return (
                        <List.Item
                          className="public-timeline-item"
                          key={slug || textValue(post.id)}
                        >
                          <List.Item.Meta
                            avatar={<Avatar src={textValue(author.avatar || author.image)} />}
                            title={textValue(author.name) || 'Alumni'}
                            description={textValue(post.created_at)}
                          />
                          {isEditingPost ? (
                            <Input.TextArea
                              rows={3}
                              value={postEditDrafts[slug] || ''}
                              onChange={(event) =>
                                setPostEditDrafts((current) => ({
                                  ...current,
                                  [slug]: event.target.value,
                                }))
                              }
                            />
                          ) : (
                            <p>{decodeLegacyText(post.body)}</p>
                          )}
                          {media.length > 0 ? (
                            <div className="public-timeline-media">
                              {media.map((item) => {
                                const url = textValue(item.file_url);
                                const mediaId = textValue(item.id);
                                const retained =
                                  postRetainedMedia[slug] ||
                                  media.map((entry) => textValue(entry.id)).filter(Boolean);
                                if (!url || (isEditingPost && !retained.includes(mediaId))) {
                                  return null;
                                }
                                return (
                                  <div className="public-timeline-media-item" key={mediaId || url}>
                                    <a href={url} target="_blank" rel="noreferrer">
                                      {isVideoMedia(item) ? (
                                        <video controls src={url} />
                                      ) : (
                                        <img
                                          src={url}
                                          alt={textValue(item.original_name) || 'Post media'}
                                        />
                                      )}
                                    </a>
                                    {isEditingPost ? (
                                      <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                          setPostRetainedMedia((current) => ({
                                            ...current,
                                            [slug]: retained.filter((id) => id !== mediaId),
                                          }))
                                        }
                                      />
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                          {isEditingPost ? (
                            <Upload
                              beforeUpload={() => false}
                              multiple
                              accept=".png,.jpg,.svg,.jpeg,.gif,.mp4,.mov,.avi,.mkv,.webm,.flv"
                              fileList={postEditUploads[slug] || []}
                              onChange={({ fileList }) =>
                                setPostEditUploads((current) => ({ ...current, [slug]: fileList }))
                              }
                            >
                              <Button size="small" icon={<UploadOutlined />}>
                                Attach media
                              </Button>
                            </Upload>
                          ) : null}
                          <div className="public-card-actions">
                            <Button
                              size="small"
                              type={post.liked_by_current_user ? 'primary' : 'default'}
                              icon={<HeartOutlined />}
                              onClick={() => likePost(slug)}
                            >
                              {textValue(post.likes_count) || '0'}
                            </Button>
                            <Tag icon={<MessageOutlined />}>
                              {textValue(post.replies_count) || '0'}
                            </Tag>
                            {canManagePost ? (
                              isEditingPost ? (
                                <>
                                  <Button
                                    size="small"
                                    icon={<SaveOutlined />}
                                    onClick={() => updatePost(slug)}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => {
                                      setEditingPost('');
                                      setPostEditDrafts((current) => ({ ...current, [slug]: '' }));
                                      setPostEditUploads((current) => ({ ...current, [slug]: [] }));
                                      setPostRetainedMedia((current) => ({
                                        ...current,
                                        [slug]: [],
                                      }));
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                      setEditingPost(slug);
                                      setPostEditDrafts((current) => ({
                                        ...current,
                                        [slug]: decodeLegacyText(post.body),
                                      }));
                                      setPostEditUploads((current) => ({ ...current, [slug]: [] }));
                                      setPostRetainedMedia((current) => ({
                                        ...current,
                                        [slug]: media
                                          .map((item) => textValue(item.id))
                                          .filter(Boolean),
                                      }));
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Popconfirm
                                    title="Delete this post?"
                                    onConfirm={() => deletePost(slug)}
                                  >
                                    <Button size="small" danger icon={<DeleteOutlined />}>
                                      Delete
                                    </Button>
                                  </Popconfirm>
                                </>
                              )
                            ) : null}
                          </div>
                          {comments.length > 0 ? (
                            <div className="public-timeline-comments">
                              {comments.map((comment) => renderComment(comment, slug))}
                            </div>
                          ) : null}
                          <div className="public-timeline-comment-form">
                            <Input
                              value={postDrafts[slug] || ''}
                              placeholder="Write a comment"
                              onChange={(event) =>
                                setPostDrafts((current) => ({
                                  ...current,
                                  [slug]: event.target.value,
                                }))
                              }
                            />
                            <Button icon={<SendOutlined />} onClick={() => commentPost(slug)}>
                              Comment
                            </Button>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                  {postPage < postLastPage ? (
                    <div className="public-timeline-more">
                      <Button
                        loading={timelineLoading}
                        onClick={() => loadPosts(postPage + 1, true)}
                      >
                        Load More
                      </Button>
                    </div>
                  ) : null}
                </Spin>
              </div>
            </section>
            <HomeSection
              title="Upcoming Events"
              items={recordsFromPayload(payload, 'upcomingEvents')}
              detailBase="/event-view-details"
            />
            <HomeSection
              title="Latest Jobs"
              items={recordsFromPayload(payload, 'latestJobs')}
              detailBase="/job-view-details"
            />
            <HomeSection
              title="Latest News"
              items={recordsFromPayload(payload, 'latestNews')}
              detailBase="/news-view-details"
            />
            <HomeSection
              title="Latest Notices"
              items={recordsFromPayload(payload, 'latestNotice')}
              detailBase="/notice-view-details"
            />
          </>
        )}
      </Spin>
    </PublicShell>
  );
}
