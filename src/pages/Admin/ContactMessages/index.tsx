import { EyeOutlined, MailOutlined, PhoneOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Alert, Button, Descriptions, Drawer, Input, Space, Table, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useEffect, useState } from 'react';

type ContactMessage = {
  id?: number | string;
  DT_RowIndex?: number;
  name?: string;
  email?: string;
  message?: string;
  issue?: string;
  phone?: string;
  created_at?: string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

const endpoint = '/admin/setting/website-settings/contact-us';

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ');
}

function rowID(record: ContactMessage) {
  return textValue(record.id || record.email || record.name);
}

function formatDate(value: unknown) {
  const raw = textValue(value);
  if (!raw) {
    return '-';
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return date.toLocaleString();
}

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState<ContactMessage | null>(null);

  const loadMessages = async (nextPage = page, nextPageSize = pageSize, nextSearch = search) => {
    setLoading(true);
    setError('');
    try {
      const response = await request<LegacyTableResponse<ContactMessage>>(endpoint, {
        params: {
          ajax: 1,
          draw: Date.now(),
          start: (nextPage - 1) * nextPageSize,
          length: nextPageSize,
          'search[value]': nextSearch,
        },
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Contact messages could not be loaded.');
        return;
      }
      setMessages(response.data || []);
      setTotal(response.recordsFiltered ?? response.recordsTotal ?? response.data?.length ?? 0);
      setPage(nextPage);
      setPageSize(nextPageSize);
      setSearch(nextSearch);
    } catch (err: any) {
      setError(err?.message || 'Contact messages could not be loaded.');
      setMessages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(1, pageSize, '');
  }, []);

  const columns: ColumnsType<ContactMessage> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 64,
      render: (value) => value || '-',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 180,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 220,
      render: (value) => {
        const email = cleanDisplay(value);
        return email ? (
          <a href={`mailto:${encodeURIComponent(email)}`}>
            <MailOutlined /> {email}
          </a>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Issue',
      dataIndex: 'issue',
      width: 180,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 160,
      render: (value) => {
        const phone = cleanDisplay(value);
        return phone && phone !== 'N/A' ? (
          <span>
            <PhoneOutlined /> {phone}
          </span>
        ) : (
          phone || '-'
        );
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      render: (value) => (
        <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {cleanDisplay(value) || '-'}
        </Typography.Paragraph>
      ),
    },
    {
      title: 'Received',
      dataIndex: 'created_at',
      width: 190,
      render: formatDate,
    },
    {
      title: 'Action',
      key: 'action',
      width: 96,
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => setCurrent(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <PageContainer title="Contact Us">
      {error ? <Alert style={{ marginBottom: 16 }} type="error" showIcon message={error} /> : null}

      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
          <Input.Search
            allowClear
            placeholder="Search messages"
            style={{ width: 320, maxWidth: '100%' }}
            onSearch={(value) => loadMessages(1, pageSize, value)}
          />
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => loadMessages()}>
            Refresh
          </Button>
        </Space>

        <Table<ContactMessage>
          columns={columns}
          dataSource={messages}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
          }}
          rowKey={(record) => rowID(record)}
          scroll={{ x: 1180 }}
          onChange={(pagination: TablePaginationConfig) => {
            loadMessages(pagination.current || 1, pagination.pageSize || pageSize, search);
          }}
        />
      </div>

      <Drawer
        title={cleanDisplay(current?.name) || 'Contact Message'}
        open={!!current}
        width={560}
        onClose={() => setCurrent(null)}
      >
        {current ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Name">{cleanDisplay(current.name) || '-'}</Descriptions.Item>
            <Descriptions.Item label="Email">
              {cleanDisplay(current.email) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Issue">
              {cleanDisplay(current.issue) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {cleanDisplay(current.phone) || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Received">{formatDate(current.created_at)}</Descriptions.Item>
            <Descriptions.Item label="Message">
              <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                {cleanDisplay(current.message) || '-'}
              </Typography.Paragraph>
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </PageContainer>
  );
}
