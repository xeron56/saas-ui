import {
  ApartmentOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DollarCircleOutlined,
  FieldTimeOutlined,
  ReloadOutlined,
  TagsOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Col, Progress, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminDashboard, getPlansOverview, getYearlySubscriptions } from './service';
import type {
  DashboardData,
  DashboardMonthlyPoint,
  DashboardPlanPoint,
  DashboardStats,
  DashboardTenant,
} from './types';

const panelStyle: React.CSSProperties = {
  padding: 16,
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
};

const metricStyle: React.CSSProperties = {
  ...panelStyle,
  minHeight: 112,
};

const sectionStyle: React.CSSProperties = {
  ...panelStyle,
  marginTop: 16,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 12,
};

const firstNumber = (...values: Array<number | undefined>) =>
  values.find((value): value is number => typeof value === 'number') ?? 0;

const firstText = (...values: Array<string | undefined>) =>
  values.find((value): value is string => Boolean(value && value.trim())) ?? '';

const formatNumber = (value?: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value || 0);

const formatMoney = (minor?: number, currencyCode?: string) =>
  new Intl.NumberFormat(undefined, {
    currency: currencyCode || 'USD',
    style: 'currency',
  }).format((minor || 0) / 100);

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const monthNumber = (record: DashboardMonthlyPoint) =>
  firstNumber(record.month_number, record.monthNumber);

const orderCount = (record: DashboardMonthlyPoint | DashboardPlanPoint) =>
  firstNumber(
    'order_count' in record ? record.order_count : undefined,
    'orderCount' in record ? record.orderCount : undefined,
    'plan_count' in record ? record.plan_count : undefined,
    'planCount' in record ? record.planCount : undefined,
  );

const paidCount = (record: DashboardMonthlyPoint | DashboardPlanPoint) =>
  firstNumber(record.paid_count, record.paidCount);

const totalAmountMinor = (record: DashboardMonthlyPoint | DashboardPlanPoint) =>
  firstNumber(record.total_amount_minor, record.totalAmountMinor);

const paidAmountMinor = (record: DashboardMonthlyPoint | DashboardPlanPoint) =>
  firstNumber(record.paid_amount_minor, record.paidAmountMinor);

const currencyCode = (record: DashboardMonthlyPoint | DashboardPlanPoint) =>
  firstText(record.currency_code, record.currencyCode) || 'USD';

const tenantName = (record: DashboardTenant) =>
  firstText(record.display_name, record.displayName, record.name, record.id);

const tenantPlan = (record: DashboardTenant) =>
  firstText(record.plan_name, record.planName, record.plan_key, record.planKey);

const tenantCreatedAt = (record: DashboardTenant) => firstText(record.created_at, record.createdAt);

const tenantExpiresAt = (record: DashboardTenant) => firstText(record.expires_at, record.expiresAt);

type Metric = {
  key: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  money?: boolean;
};

const DashboardPage: React.FC = () => {
  const intl = useIntl();
  const [year, setYear] = useState(new Date().getFullYear());
  const [dashboard, setDashboard] = useState<DashboardData>();
  const [monthly, setMonthly] = useState<DashboardMonthlyPoint[]>([]);
  const [plans, setPlans] = useState<DashboardPlanPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => ({
      label: String(currentYear - index),
      value: currentYear - index,
    }));
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResp, monthlyResp, planResp] = await Promise.all([
        getAdminDashboard(),
        getYearlySubscriptions(year),
        getPlansOverview(year),
      ]);
      setDashboard(dashboardResp.data);
      setMonthly(monthlyResp.data ?? []);
      setPlans(planResp.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats: DashboardStats = dashboard?.stats ?? {};
  const totalTenants = firstNumber(stats.total_tenants, stats.totalTenants);
  const expiredTenants = firstNumber(stats.expired_tenants, stats.expiredTenants);
  const subscriptionOrders = firstNumber(stats.subscription_orders, stats.subscriptionOrders);
  const businessSegments = firstNumber(stats.business_segments, stats.businessSegments);
  const totalPlans = firstNumber(stats.total_plans, stats.totalPlans);
  const activePlans = firstNumber(stats.active_plans, stats.activePlans);
  const paidSubscriptionOrders = firstNumber(
    stats.paid_subscription_orders,
    stats.paidSubscriptionOrders,
  );
  const totalRevenueMinorValue = firstNumber(stats.total_revenue_minor, stats.totalRevenueMinor);
  const tenantRows = dashboard?.tenants ?? [];
  const maxMonthlyAmount = Math.max(...monthly.map((row) => totalAmountMinor(row)), 1);
  const maxPlanCount = Math.max(...plans.map((row) => orderCount(row)), 1);
  const primaryCurrency =
    monthly.find((row) => firstText(row.currency_code, row.currencyCode))?.currency_code ??
    monthly.find((row) => firstText(row.currency_code, row.currencyCode))?.currencyCode ??
    'USD';

  const metrics: Metric[] = [
    {
      key: 'tenants',
      label: t('saas.dashboard.totalTenants', 'Tenants'),
      value: totalTenants,
      icon: <TeamOutlined />,
      color: '#1677ff',
    },
    {
      key: 'expired',
      label: t('saas.dashboard.expiredTenants', 'Expired tenants'),
      value: expiredTenants,
      icon: <FieldTimeOutlined />,
      color: '#cf1322',
    },
    {
      key: 'orders',
      label: t('saas.dashboard.subscriptionOrders', 'Subscription orders'),
      value: subscriptionOrders,
      icon: <BarChartOutlined />,
      color: '#08979c',
    },
    {
      key: 'paid',
      label: t('saas.dashboard.paidOrders', 'Paid orders'),
      value: paidSubscriptionOrders,
      icon: <CheckCircleOutlined />,
      color: '#389e0d',
    },
    {
      key: 'revenue',
      label: t('saas.dashboard.totalRevenue', 'Total revenue'),
      value: totalRevenueMinorValue,
      icon: <DollarCircleOutlined />,
      color: '#531dab',
      money: true,
    },
    {
      key: 'segments',
      label: t('saas.dashboard.businessSegments', 'Business segments'),
      value: businessSegments,
      icon: <ApartmentOutlined />,
      color: '#d46b08',
    },
    {
      key: 'plans',
      label: t('saas.dashboard.totalPlans', 'Plans'),
      value: totalPlans,
      icon: <TagsOutlined />,
      color: '#0958d9',
    },
    {
      key: 'activePlans',
      label: t('saas.dashboard.activePlans', 'Active plans'),
      value: activePlans,
      icon: <TagsOutlined />,
      color: '#7cb305',
    },
  ];

  const monthlyColumns: ColumnsType<DashboardMonthlyPoint> = [
    {
      title: t('saas.dashboard.month', 'Month'),
      dataIndex: 'month',
      width: 160,
      render: (value: string) => <Tag icon={<CalendarOutlined />}>{value}</Tag>,
    },
    {
      title: t('saas.dashboard.orders', 'Orders'),
      render: (_, record) => formatNumber(orderCount(record)),
      sorter: (left, right) => monthNumber(left) - monthNumber(right),
      width: 120,
    },
    {
      title: t('saas.dashboard.paidOrders', 'Paid orders'),
      render: (_, record) => formatNumber(paidCount(record)),
      width: 120,
    },
    {
      title: t('saas.dashboard.revenue', 'Revenue'),
      render: (_, record) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text>
            {formatMoney(totalAmountMinor(record), currencyCode(record))}
          </Typography.Text>
          <Progress
            showInfo={false}
            percent={Math.min((totalAmountMinor(record) / maxMonthlyAmount) * 100, 100)}
          />
        </Space>
      ),
    },
    {
      title: t('saas.dashboard.paidRevenue', 'Paid revenue'),
      align: 'right',
      render: (_, record) => formatMoney(paidAmountMinor(record), currencyCode(record)),
      width: 160,
    },
  ];

  const planColumns: ColumnsType<DashboardPlanPoint> = [
    {
      title: t('saas.dashboard.plan', 'Plan'),
      render: (_, record) =>
        firstText(record.plan_name, record.planName, record.plan_key, record.planKey),
    },
    {
      title: t('saas.dashboard.product', 'Product'),
      render: (_, record) => firstText(record.product_id, record.productId) || '-',
      width: 180,
    },
    {
      title: t('saas.dashboard.orders', 'Orders'),
      render: (_, record) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text>{formatNumber(orderCount(record))}</Typography.Text>
          <Progress
            showInfo={false}
            strokeColor="#08979c"
            percent={Math.min((orderCount(record) / maxPlanCount) * 100, 100)}
          />
        </Space>
      ),
      width: 180,
    },
    {
      title: t('saas.dashboard.paidOrders', 'Paid orders'),
      render: (_, record) => formatNumber(paidCount(record)),
      width: 120,
    },
    {
      title: t('saas.dashboard.revenue', 'Revenue'),
      align: 'right',
      render: (_, record) => formatMoney(totalAmountMinor(record), currencyCode(record)),
      width: 160,
    },
  ];

  const tenantColumns: ColumnsType<DashboardTenant> = [
    {
      title: t('saas.dashboard.tenant', 'Tenant'),
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{tenantName(record)}</Typography.Text>
          <Typography.Text type="secondary">{record.name ?? record.id}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t('saas.dashboard.plan', 'Plan'),
      render: (_, record) => tenantPlan(record) || '-',
    },
    {
      title: t('saas.dashboard.region', 'Region'),
      dataIndex: 'region',
      render: (value?: string) => value || '-',
      width: 140,
    },
    {
      title: t('common.createdAt', 'CreatedAt'),
      render: (_, record) => formatDate(tenantCreatedAt(record)),
      width: 150,
    },
    {
      title: t('saas.dashboard.expiresAt', 'Expires'),
      render: (_, record) => {
        const expiresAt = tenantExpiresAt(record);
        const expired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false;
        return <Tag color={expired ? 'red' : 'green'}>{formatDate(expiresAt)}</Tag>;
      },
      width: 150,
    },
  ];

  const renderMetric = (metric: Metric) => (
    <Col key={metric.key} xs={24} sm={12} lg={6}>
      <div style={metricStyle}>
        <Space align="start" size={12}>
          <span style={{ color: metric.color, fontSize: 22, lineHeight: 1 }}>{metric.icon}</span>
          <Statistic
            loading={loading}
            title={metric.label}
            value={metric.money ? formatMoney(metric.value, primaryCurrency) : metric.value}
            valueStyle={{ color: metric.color, fontSize: 24 }}
          />
        </Space>
      </div>
    </Col>
  );

  return (
    <PageContainer>
      <div style={panelStyle}>
        <Space size={12} wrap>
          <Select value={year} onChange={setYear} options={yearOptions} style={{ width: 128 }} />
          <Button
            icon={<ReloadOutlined />}
            type="primary"
            loading={loading}
            onClick={loadDashboard}
          >
            {t('saas.dashboard.refresh', 'Refresh')}
          </Button>
          <Tag color="blue">
            {t('saas.dashboard.year', 'Year')}: {year}
          </Tag>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        {metrics.map(renderMetric)}
      </Row>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <BarChartOutlined />
            <strong>{t('saas.dashboard.yearlySubscriptions', 'Yearly subscriptions')}</strong>
          </Space>
          <Tag>
            {formatMoney(
              monthly.reduce((sum, row) => sum + paidAmountMinor(row), 0),
              primaryCurrency,
            )}
          </Tag>
        </div>
        <Table<DashboardMonthlyPoint>
          rowKey={(record) => String(monthNumber(record) || record.month)}
          size="small"
          loading={loading}
          columns={monthlyColumns}
          dataSource={monthly}
          pagination={false}
          scroll={{ x: 760 }}
        />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={11}>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Space>
                <TagsOutlined />
                <strong>{t('saas.dashboard.plansOverview', 'Plans overview')}</strong>
              </Space>
              <Tag color="cyan">{formatNumber(plans.length)}</Tag>
            </div>
            <Table<DashboardPlanPoint>
              rowKey={(record) => firstText(record.plan_key, record.planKey)}
              size="small"
              loading={loading}
              columns={planColumns}
              dataSource={plans}
              pagination={false}
              scroll={{ x: 760 }}
            />
          </div>
        </Col>
        <Col xs={24} xl={13}>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Space>
                <TeamOutlined />
                <strong>{t('saas.dashboard.latestTenants', 'Latest tenants')}</strong>
              </Space>
              <Tag color="blue">{formatNumber(tenantRows.length)}</Tag>
            </div>
            <Table<DashboardTenant>
              rowKey="id"
              size="small"
              loading={loading}
              columns={tenantColumns}
              dataSource={tenantRows}
              pagination={false}
              scroll={{ x: 760 }}
            />
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DashboardPage;
