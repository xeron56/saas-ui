import {
  CalendarOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

type LegacyRecord = Record<string, any>;

type ChartSummary = {
  mainData?: LegacyRecord[];
  days?: string[];
  price?: Record<string, number | string>;
};

type TicketSummary = {
  mainData?: LegacyRecord[];
  totalTicket?: Array<number | string>;
  eventName?: string[];
};

type DashboardResponse = {
  totalAlumni?: number | string;
  currentMember?: number | string;
  totalUpcomingEvent?: number | string;
  memberThisMonth?: number | string;
  transactionThisMonth?: number | string;
  chart?: ChartSummary;
  topEventTickets?: TicketSummary;
};

type TransactionResponse = {
  data?: LegacyRecord[];
  items?: LegacyRecord[];
  recordsTotal?: number | string;
  recordsFiltered?: number | string;
};

type Metric = {
  key: string;
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
};

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: unknown, fractionDigits = 0) {
  return toNumber(value).toLocaleString(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
}

function money(value: unknown) {
  const text = textValue(value);
  if (text && /[^\d.,-]/.test(text)) {
    return text;
  }
  return formatNumber(value, 2);
}

function paymentRows(summary?: ChartSummary) {
  if (Array.isArray(summary?.mainData) && summary.mainData.length > 0) {
    return summary.mainData.map((row, index) => ({
      key: textValue(row.day) || String(index),
      day: textValue(row.day) || `Day ${index + 1}`,
      total: toNumber(row.total),
    }));
  }
  const prices = summary?.price || {};
  return (summary?.days || []).map((day) => ({
    key: day,
    day,
    total: toNumber(prices[day]),
  }));
}

function ticketRows(summary?: TicketSummary) {
  if (Array.isArray(summary?.mainData) && summary.mainData.length > 0) {
    return summary.mainData.map((row, index) => ({
      key: textValue(row.event_name || row.eventName) || String(index),
      event: textValue(row.event_name || row.eventName) || '-',
      tickets: toNumber(row.total_ticket || row.totalTicket),
    }));
  }
  const totals = summary?.totalTicket || [];
  return (summary?.eventName || []).map((event, index) => ({
    key: event || String(index),
    event: event || '-',
    tickets: toNumber(totals[index]),
  }));
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardResponse>({});
  const [transactions, setTransactions] = useState<LegacyRecord[]>([]);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    request<DashboardResponse>('/admin/dashboard')
      .then((response) => setData(response || {}))
      .catch((err) => setError(err?.message || 'Dashboard could not be loaded.'))
      .finally(() => setLoading(false));
  };

  const loadTransactions = (keyword = search) => {
    const params = new URLSearchParams({ ajax: '1', draw: '1', length: '10' });
    if (keyword.trim()) {
      params.set('search[value]', keyword.trim());
    }
    setTransactionsLoading(true);
    request<TransactionResponse>(`/admin/dashboard?${params.toString()}`)
      .then((response) => {
        const rows = Array.isArray(response.data) ? response.data : response.items || [];
        setTransactions(rows);
        setTransactionTotal(toNumber(response.recordsFiltered ?? response.recordsTotal));
      })
      .catch(() => {
        setTransactions([]);
        setTransactionTotal(0);
      })
      .finally(() => setTransactionsLoading(false));
  };

  useEffect(() => {
    loadDashboard();
    loadTransactions('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const payments = useMemo(() => paymentRows(data.chart), [data.chart]);
  const tickets = useMemo(() => ticketRows(data.topEventTickets), [data.topEventTickets]);
  const maxPayment = Math.max(...payments.map((row) => row.total), 0);
  const maxTickets = Math.max(...tickets.map((row) => row.tickets), 0);

  const metrics: Metric[] = [
    {
      key: 'alumni',
      label: 'Total Alumni',
      value: formatNumber(data.totalAlumni),
      icon: <TeamOutlined />,
      color: '#1677ff',
    },
    {
      key: 'members',
      label: 'Current Members',
      value: formatNumber(data.currentMember),
      icon: <UsergroupAddOutlined />,
      color: '#13a8a8',
    },
    {
      key: 'events',
      label: 'Upcoming Events',
      value: formatNumber(data.totalUpcomingEvent),
      icon: <CalendarOutlined />,
      color: '#52c41a',
    },
    {
      key: 'monthMembers',
      label: 'Members This Month',
      value: formatNumber(data.memberThisMonth),
      icon: <CreditCardOutlined />,
      color: '#722ed1',
    },
    {
      key: 'transactions',
      label: 'Transactions This Month',
      value: money(data.transactionThisMonth),
      icon: <DollarCircleOutlined />,
      color: '#fa8c16',
    },
  ];

  const paymentColumns: ColumnsType<{ key: string; day: string; total: number }> = [
    { title: 'Day', dataIndex: 'day', width: 140 },
    { title: 'Amount', dataIndex: 'total', width: 160, render: (value) => money(value) },
    {
      title: 'Share',
      dataIndex: 'total',
      render: (value) => (
        <Progress
          percent={maxPayment > 0 ? Math.round((toNumber(value) / maxPayment) * 100) : 0}
          showInfo={false}
          strokeColor="#1677ff"
        />
      ),
    },
  ];

  const ticketColumns: ColumnsType<{ key: string; event: string; tickets: number }> = [
    { title: 'Event', dataIndex: 'event' },
    { title: 'Tickets', dataIndex: 'tickets', width: 120 },
    {
      title: 'Share',
      dataIndex: 'tickets',
      render: (value) => (
        <Progress
          percent={maxTickets > 0 ? Math.round((toNumber(value) / maxTickets) * 100) : 0}
          showInfo={false}
          strokeColor="#52c41a"
        />
      ),
    },
  ];

  const transactionColumns: ColumnsType<LegacyRecord> = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Purpose', dataIndex: 'purpose' },
    { title: 'Transaction ID', dataIndex: 'tnxId' },
    { title: 'Payment Method', dataIndex: 'payment_method' },
    { title: 'Date and Time', dataIndex: 'created_at' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      align: 'right',
      render: (_, record) => textValue(record.amount) || money(record.amount_raw),
    },
  ];

  return (
    <PageContainer
      title="Dashboard"
      extra={
        <Button
          icon={<ReloadOutlined />}
          loading={loading || transactionsLoading}
          onClick={() => {
            loadDashboard();
            loadTransactions(search);
          }}
        >
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Row gutter={[16, 16]}>
          {metrics.map((metric) => (
            <Col xs={24} sm={12} xl={metric.key === 'transactions' ? 8 : 4} key={metric.key}>
              <Card loading={loading}>
                <Space align="center" size={16}>
                  <Avatar
                    size={42}
                    icon={metric.icon}
                    style={{ background: metric.color, flex: '0 0 auto' }}
                  />
                  <Statistic title={metric.label} value={metric.value} />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <DollarCircleOutlined />
                  <span>Payment Summary</span>
                </Space>
              }
              extra={<Typography.Text type="secondary">Current month</Typography.Text>}
            >
              <Table
                rowKey="key"
                loading={loading}
                dataSource={payments}
                columns={paymentColumns}
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Event Ticket Summary</span>
                </Space>
              }
            >
              <Table
                rowKey="key"
                loading={loading}
                dataSource={tickets}
                columns={ticketColumns}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
        <Card
          title="Latest Transaction Summary"
          extra={
            <Input.Search
              allowClear
              enterButton={<SearchOutlined />}
              onChange={(event) => setSearch(event.target.value)}
              onSearch={(value) => loadTransactions(value)}
              placeholder="Search transaction"
              style={{ width: 280 }}
              value={search}
            />
          }
        >
          <Table
            rowKey={(record, index) =>
              textValue(record.id) || textValue(record.tnxId) || String(index)
            }
            loading={transactionsLoading}
            dataSource={transactions}
            columns={transactionColumns}
            pagination={{
              pageSize: 10,
              total: transactionTotal || transactions.length,
              showSizeChanger: false,
            }}
          />
        </Card>
      </Space>
    </PageContainer>
  );
}
