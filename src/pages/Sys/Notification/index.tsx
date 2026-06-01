import { CheckCircleOutlined, EyeOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Descriptions,
  message,
  Modal,
  Space,
  Statistic,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import { getAdminNotification, listAdminNotifications, readAllAdminNotifications } from './service';
import type { AdminNotification, AdminNotificationReply } from './types';

const field = <T,>(
  record: Record<string, any> | undefined,
  snake: string,
  camel: string,
): T | undefined => {
  if (!record) {
    return undefined;
  }
  return (record[snake] ?? record[camel]) as T | undefined;
};

const readText = (value: unknown) => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
};

const isRead = (record?: AdminNotification) =>
  field<boolean>(record, 'has_read', 'hasRead') ?? false;

const createdAt = (record?: AdminNotification) => field<string>(record, 'created_at', 'createdAt');
const readAt = (record?: AdminNotification) => field<string>(record, 'read_at', 'readAt');

const notificationMessage = (record?: AdminNotification) => {
  const payloadMessage = readText(record?.data?.message);
  return payloadMessage || readText(record?.desc) || readText(record?.title);
};

const notificationTitle = (record?: AdminNotification) => readText(record?.title);

const notificationUrl = (record?: AdminNotification, detail?: AdminNotificationReply) =>
  readText(field<string>(detail, 'redirect_url', 'redirectUrl')) ||
  readText(record?.data?.url) ||
  readText(record?.link);

const openRedirect = (url: string) => {
  if (!url) {
    return;
  }
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.href = url;
};

const statusTag = (record?: AdminNotification) =>
  isRead(record) ? <Tag>READ</Tag> : <Tag color="blue">UNREAD</Tag>;

const NotificationPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [todayOnly, setTodayOnly] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [detail, setDetail] = useState<AdminNotificationReply>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [readAllLoading, setReadAllLoading] = useState(false);

  const selectedNotification = detail?.data;
  const selectedUrl = notificationUrl(selectedNotification, detail);

  const openNotification = async (record: AdminNotification, followRedirect = false) => {
    setDetailLoading(true);
    try {
      const resp = await getAdminNotification(record.id);
      setDetail(resp);
      setDetailOpen(!followRedirect);
      if (!isRead(record)) {
        message.success(resp.message || 'Notification marked as read.');
      }
      actionRef.current?.reload();
      if (followRedirect) {
        openRedirect(notificationUrl(resp.data, resp));
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const markAllRead = async () => {
    setReadAllLoading(true);
    try {
      const resp = await readAllAdminNotifications();
      const updated = field<number>(resp, 'updated_count', 'updatedCount') ?? 0;
      message.success(resp.message || `Marked ${updated} notification${updated === 1 ? '' : 's'}.`);
      actionRef.current?.reload();
    } finally {
      setReadAllLoading(false);
    }
  };

  const columns = useMemo<ProColumns<AdminNotification>[]>(
    () => [
      {
        title: 'Search',
        dataIndex: 'search',
        hideInTable: true,
        valueType: 'text',
      },
      {
        title: 'Message',
        dataIndex: ['data', 'message'],
        ellipsis: true,
        render: (_, record) => {
          const messageText = notificationMessage(record) || '-';
          const titleText = notificationTitle(record);
          return (
            <Space direction="vertical" size={0} style={{ maxWidth: 520 }}>
              <Typography.Text strong={!isRead(record)} ellipsis>
                {messageText}
              </Typography.Text>
              {titleText && titleText !== messageText && (
                <Typography.Text type="secondary" ellipsis>
                  {titleText}
                </Typography.Text>
              )}
            </Space>
          );
        },
      },
      {
        title: 'Status',
        dataIndex: 'has_read',
        search: false,
        width: 104,
        render: (_, record) => statusTag(record),
      },
      {
        title: 'URL',
        dataIndex: ['data', 'url'],
        search: false,
        ellipsis: true,
        render: (_, record) => {
          const url = notificationUrl(record);
          return url || '-';
        },
      },
      {
        title: 'Source',
        dataIndex: 'source',
        search: false,
        width: 140,
        ellipsis: true,
      },
      {
        title: 'Created',
        dataIndex: 'created_at',
        valueType: 'dateTime',
        search: false,
        width: 176,
        renderText: (_, record) => createdAt(record),
      },
      {
        title: 'Read',
        dataIndex: 'read_at',
        valueType: 'dateTime',
        search: false,
        width: 176,
        renderText: (_, record) => readAt(record),
      },
      {
        title: 'Operate',
        valueType: 'option',
        width: 112,
        render: (_, record) => (
          <Space size={4}>
            <Tooltip title="View">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  void openNotification(record);
                }}
              />
            </Tooltip>
            {notificationUrl(record) && (
              <Tooltip title="Open link">
                <Button
                  type="text"
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    void openNotification(record, true);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer
      title={intl.formatMessage({
        id: 'sys.notifications.management',
        defaultMessage: 'Notifications',
      })}
    >
      <ProTable<AdminNotification>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 20 }}
        request={async (params) => {
          const resp = await listAdminNotifications({
            page: params.current,
            per_page: params.pageSize,
            search: params.search,
            today: todayOnly,
          });
          setUnreadCount(field<number>(resp.extra, 'unread_count', 'unreadCount') ?? 0);
          return {
            data: resp.data ?? [],
            total: resp.meta?.total ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Statistic key="unread" title="Unread" value={unreadCount} />,
          <Space key="today" size={8}>
            <span>Today</span>
            <Switch
              checked={todayOnly}
              onChange={(checked) => {
                setTodayOnly(checked);
                actionRef.current?.reload();
              }}
            />
          </Space>,
          <Button
            key="read-all"
            icon={<CheckCircleOutlined />}
            loading={readAllLoading}
            onClick={markAllRead}
          >
            Mark all read
          </Button>,
          <Tooltip key="reload" title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()} />
          </Tooltip>,
        ]}
      />
      <Modal
        title="Notification"
        open={detailOpen}
        confirmLoading={detailLoading}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Close
          </Button>,
          selectedUrl && (
            <Button
              key="open"
              type="primary"
              icon={<LinkOutlined />}
              onClick={() => openRedirect(selectedUrl)}
            >
              Open link
            </Button>
          ),
        ]}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Message">
            {notificationMessage(selectedNotification) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">{statusTag(selectedNotification)}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {createdAt(selectedNotification) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Read">{readAt(selectedNotification) || '-'}</Descriptions.Item>
          <Descriptions.Item label="URL">{selectedUrl || '-'}</Descriptions.Item>
          <Descriptions.Item label="Source">
            {selectedNotification?.source || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </PageContainer>
  );
};

export default NotificationPage;
