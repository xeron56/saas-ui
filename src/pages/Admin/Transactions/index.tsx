import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

type TabKey = 'pending' | 'all' | 'event' | 'membership';

type TransactionRow = {
  id?: number | string;
  uuid?: string;
  user?: string;
  name?: string;
  tnxId?: string;
  amount?: string | number;
  amount_raw?: string | number;
  purpose?: string;
  payment_method?: string;
  type?: string;
  payment_info?: string;
  created_at?: string;
  status?: string;
  status_id?: number | string;
  status_name?: string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type TransactionTab = {
  key: TabKey;
  label: string;
  title: string;
  path: string;
  endpoint: string;
};

const tabs: TransactionTab[] = [
  {
    key: 'pending',
    label: 'Pending',
    title: 'Pending Transactions',
    path: '/admin/transactions/pending-list',
    endpoint: '/admin/transactions/pending-list',
  },
  {
    key: 'all',
    label: 'All',
    title: 'All Transactions',
    path: '/admin/transactions/all-transactions',
    endpoint: '/admin/transactions/all-transactions',
  },
  {
    key: 'event',
    label: 'Events',
    title: 'Event Transactions',
    path: '/admin/transactions/event-transaction',
    endpoint: '/admin/transactions/event-transaction',
  },
  {
    key: 'membership',
    label: 'Memberships',
    title: 'Membership Transactions',
    path: '/admin/transactions/membership-transaction',
    endpoint: '/admin/transactions/membership-transaction',
  },
];

const emptyRows: Record<TabKey, TransactionRow[]> = {
  pending: [],
  all: [],
  event: [],
  membership: [],
};

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rowID(record?: TransactionRow) {
  return textValue(record?.id);
}

function activeTabFromPath(pathname: string): TabKey {
  if (pathname.includes('/admin/transactions/all-transactions')) {
    return 'all';
  }
  if (pathname.includes('/admin/transactions/event-transaction')) {
    return 'event';
  }
  if (pathname.includes('/admin/transactions/membership-transaction')) {
    return 'membership';
  }
  return 'pending';
}

function tabByKey(key: TabKey) {
  return tabs.find((tab) => tab.key === key) || tabs[0];
}

function extractHref(value: unknown) {
  const match = textValue(value).match(/\bhref=["']([^"']+)["']/i);
  return match?.[1] || '';
}

function statusColor(record: TransactionRow) {
  const status = cleanDisplay(record.status_name || record.status).toLowerCase();
  if (status.includes('approved') || status.includes('accepted') || status.includes('paid')) {
    return 'green';
  }
  if (status.includes('reject') || status.includes('cancel')) {
    return 'red';
  }
  return 'gold';
}

async function changePendingStatus(id: string, status: 1 | 2) {
  return request<LegacyTableResponse<TransactionRow>>(
    '/admin/transactions/change-transaction-status',
    {
      method: 'POST',
      data: { id, status },
    },
  );
}

export default function AdminTransactions() {
  const location = useLocation();
  const activeKey = activeTabFromPath(location.pathname);
  const activeTab = tabByKey(activeKey);
  const [rows, setRows] = useState<Record<TabKey, TransactionRow[]>>(emptyRows);
  const [loading, setLoading] = useState(false);
  const [savingID, setSavingID] = useState('');
  const [error, setError] = useState('');

  const loadRows = async (key: TabKey = activeKey) => {
    const tab = tabByKey(key);
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<TransactionRow>>(`${tab.endpoint}?ajax=1`);
      setRows((previous) => ({
        ...previous,
        [key]: Array.isArray(body.data) ? body.data : [],
      }));
    } catch (err: any) {
      setRows((previous) => ({ ...previous, [key]: [] }));
      setError(err?.message || `${tab.title} could not be loaded.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(activeKey);
  }, [activeKey]);

  const switchTab = (key: string) => {
    setError('');
    history.push(tabByKey(key as TabKey).path);
  };

  const updateStatus = async (record: TransactionRow, status: 1 | 2) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    setSavingID(`${id}:${status}`);
    setError('');
    try {
      const response = await changePendingStatus(id, status);
      if (response.status === false) {
        setError(textValue(response.message) || 'Transaction status could not be changed.');
        return;
      }
      toast.success(textValue(response.message) || 'Transaction status changed.');
      await loadRows(activeKey);
    } catch (err: any) {
      setError(err?.message || 'Transaction status could not be changed.');
    } finally {
      setSavingID('');
    }
  };

  const pendingColumns: ColumnsType<TransactionRow> = [
    {
      title: 'User',
      dataIndex: 'user',
      width: 180,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 140,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Payment Info',
      dataIndex: 'payment_info',
      render: (value) => {
        const href = extractHref(value);
        return (
          <Space direction="vertical" size={2}>
            <Typography.Text>{cleanDisplay(value) || '-'}</Typography.Text>
            {href ? (
              <Button href={href} size="small" target="_blank">
                View slip
              </Button>
            ) : null}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={statusColor(record)}>{cleanDisplay(record.status_name || record.status)}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      width: 180,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Review',
      key: 'review',
      width: 180,
      align: 'right',
      render: (_, record) => {
        const id = rowID(record);
        return (
          <Space>
            <Popconfirm
              title="Approve payment?"
              okText="Approve"
              onConfirm={() => updateStatus(record, 1)}
            >
              <Button
                icon={<CheckCircleOutlined />}
                loading={savingID === `${id}:1`}
                size="small"
                type="primary"
              >
                Approve
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Reject payment?"
              okText="Reject"
              okButtonProps={{ danger: true }}
              onConfirm={() => updateStatus(record, 2)}
            >
              <Button
                danger
                icon={<CloseCircleOutlined />}
                loading={savingID === `${id}:2`}
                size="small"
              >
                Reject
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const transactionColumns: ColumnsType<TransactionRow> = [
    {
      title: 'Transaction',
      dataIndex: 'tnxId',
      width: 160,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'User',
      dataIndex: 'user',
      width: 180,
      render: (value, record) => cleanDisplay(value || record.name) || '-',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 140,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Method',
      dataIndex: 'payment_method',
      width: 160,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      width: 180,
      render: (value) => cleanDisplay(value) || '-',
    },
  ];

  return (
    <PageContainer
      title={activeTab.title}
      extra={
        <Button icon={<ReloadOutlined />} onClick={() => loadRows(activeKey)}>
          Refresh
        </Button>
      }
    >
      {error ? (
        <Alert
          closable
          message={error}
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
          type="error"
        />
      ) : null}

      <Tabs
        activeKey={activeKey}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: (
            <Space>
              <CreditCardOutlined />
              {tab.label}
            </Space>
          ),
        }))}
        onChange={switchTab}
      />

      <Table<TransactionRow>
        columns={activeKey === 'pending' ? pendingColumns : transactionColumns}
        dataSource={rows[activeKey]}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowKey={(record) => rowID(record) || textValue(record.uuid) || textValue(record.tnxId)}
        scroll={{ x: activeKey === 'pending' ? 1080 : 860 }}
      />
    </PageContainer>
  );
}
