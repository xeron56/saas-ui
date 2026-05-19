import {
  AppstoreOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DollarCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
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

type DailySummary = {
  day?: string;
  total?: number | string;
};

type MonthlyOrderSummary = {
  mainData?: DailySummary[];
  days?: string[];
  amount?: Record<string, number | string>;
  price?: Record<string, number | string>;
};

type DashboardResponse = {
  totalUser?: number | string;
  totalAdmin?: number | string;
  activePackage?: number | string;
  totalCurrentSubscription?: number | string;
  monthlyRevenue?: number | string;
  monthlyRevenueFormatted?: string;
  monthlyOrderSummary?: MonthlyOrderSummary;
};

type DailyRow = {
  key: string;
  day: string;
  total: number;
};

type Metric = {
  key: string;
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
};

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

function summaryRows(summary?: MonthlyOrderSummary): DailyRow[] {
  if (Array.isArray(summary?.mainData) && summary.mainData.length > 0) {
    return summary.mainData
      .map((row, index) => ({
        key: `${row.day || index}`,
        day: row.day || `Day ${index + 1}`,
        total: toNumber(row.total),
      }))
      .filter((row) => row.total > 0);
  }
  const totals = summary?.amount || summary?.price || {};
  return (summary?.days || [])
    .map((day) => ({
      key: day,
      day,
      total: toNumber(totals[day]),
    }))
    .filter((row) => row.total > 0);
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    request<DashboardResponse>('/super-admin/dashboard')
      .then((response) => setData(response || {}))
      .catch((err) => setError(err?.message || 'Unable to load dashboard.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const rows = useMemo(() => summaryRows(data.monthlyOrderSummary), [data.monthlyOrderSummary]);
  const maxDailyTotal = Math.max(...rows.map((row) => row.total), 0);
  const monthlyRevenue =
    data.monthlyRevenueFormatted && data.monthlyRevenueFormatted.trim()
      ? data.monthlyRevenueFormatted
      : formatNumber(data.monthlyRevenue, 2);

  const metrics: Metric[] = [
    {
      key: 'admins',
      label: 'Tenant Admins',
      value: formatNumber(data.totalUser ?? data.totalAdmin),
      icon: <TeamOutlined />,
      color: '#1677ff',
    },
    {
      key: 'packages',
      label: 'Active Packages',
      value: formatNumber(data.activePackage),
      icon: <AppstoreOutlined />,
      color: '#13a8a8',
    },
    {
      key: 'subscriptions',
      label: 'Current Subscriptions',
      value: formatNumber(data.totalCurrentSubscription),
      icon: <DashboardOutlined />,
      color: '#52c41a',
    },
    {
      key: 'revenue',
      label: 'Monthly Revenue',
      value: monthlyRevenue,
      icon: <DollarCircleOutlined />,
      color: '#fa8c16',
    },
  ];

  const columns: ColumnsType<DailyRow> = [
    {
      title: 'Day',
      dataIndex: 'day',
      width: 160,
    },
    {
      title: 'Subscription Revenue',
      dataIndex: 'total',
      width: 180,
      render: (value) => formatNumber(value, 2),
    },
    {
      title: 'Share',
      dataIndex: 'total',
      render: (value) => (
        <Progress
          percent={maxDailyTotal > 0 ? Math.round((toNumber(value) / maxDailyTotal) * 100) : 0}
          showInfo={false}
          strokeColor="#1677ff"
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Super Admin Dashboard"
      extra={
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadDashboard}>
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Row gutter={[16, 16]}>
          {metrics.map((metric) => (
            <Col xs={24} sm={12} xl={6} key={metric.key}>
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
        <Card
          title={
            <Space>
              <CalendarOutlined />
              <span>Monthly Order Summary</span>
            </Space>
          }
          extra={<Typography.Text type="secondary">Current month</Typography.Text>}
        >
          <Table<DailyRow>
            rowKey="key"
            loading={loading}
            dataSource={rows}
            columns={columns}
            pagination={false}
            locale={{ emptyText: 'No subscription revenue recorded this month.' }}
          />
        </Card>
      </Space>
    </PageContainer>
  );
}
