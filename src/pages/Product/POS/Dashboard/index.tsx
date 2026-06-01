import {
  AppstoreOutlined,
  BarChartOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  LineChartOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  WalletOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Progress,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getDashboardReport, getDashboardSummary } from './service';
import type {
  DashboardDuration,
  DashboardReport,
  DashboardSeriesPoint,
  DashboardSummary,
} from './types';

const { RangePicker } = DatePicker;

const durationOptions: DashboardDuration[] = [
  'today',
  'yesterday',
  'last_seven_days',
  'last_thirty_days',
  'current_month',
  'last_month',
  'current_year',
  'custom_date',
];

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const compactNumber = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value || 0);

const metricStyle: React.CSSProperties = {
  minHeight: 112,
  padding: 16,
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
};

const sectionStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 12,
};

type SeriesRow = {
  date: string;
  sales: number;
  purchases: number;
};

type Metric = {
  key: string;
  label: string;
  value?: number;
  color: string;
  icon: React.ReactNode;
  precision?: number;
};

const DashboardPage: React.FC = () => {
  const intl = useIntl();
  const [duration, setDuration] = useState<DashboardDuration>('today');
  const [customRange, setCustomRange] = useState<[string, string]>();
  const [summary, setSummary] = useState<DashboardSummary>();
  const [report, setReport] = useState<DashboardReport>();
  const [loading, setLoading] = useState(false);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const customRangeMissing = duration === 'custom_date' && (!customRange?.[0] || !customRange?.[1]);

  const buildParams = useCallback(() => {
    const params: Record<string, any> = { duration };
    if (duration === 'custom_date' && customRange?.[0] && customRange?.[1]) {
      params.from_date = customRange[0];
      params.to_date = customRange[1];
    }
    return params;
  }, [customRange, duration]);

  const loadDashboard = useCallback(async () => {
    if (customRangeMissing) {
      return;
    }
    setLoading(true);
    try {
      const [summaryResp, reportResp] = await Promise.all([
        getDashboardSummary({}),
        getDashboardReport(buildParams()),
      ]);
      setSummary(summaryResp);
      setReport(reportResp);
    } finally {
      setLoading(false);
    }
  }, [buildParams, customRangeMissing]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const seriesRows = useMemo(() => {
    const rows = new Map<string, SeriesRow>();
    const apply = (points: DashboardSeriesPoint[] | undefined, field: 'sales' | 'purchases') => {
      (points || []).forEach((point) => {
        const current = rows.get(point.date) || { date: point.date, sales: 0, purchases: 0 };
        current[field] = point.amount || 0;
        rows.set(point.date, current);
      });
    };
    apply(report?.sales, 'sales');
    apply(report?.purchases, 'purchases');
    return Array.from(rows.values()).sort((left, right) => left.date.localeCompare(right.date));
  }, [report?.purchases, report?.sales]);

  const maxSeries = Math.max(...seriesRows.map((row) => Math.max(row.sales, row.purchases)), 1);
  const rangeLabel =
    report?.from_date && report?.to_date
      ? `${report.from_date.slice(0, 10)} - ${report.to_date.slice(0, 10)}`
      : '';

  const todayMetrics: Metric[] = [
    {
      key: 'summary-sales',
      label: t('product.dashboard.todaySales', 'Today sales'),
      value: summary?.sales,
      color: '#1677ff',
      icon: <ShoppingCartOutlined />,
    },
    {
      key: 'summary-income',
      label: t('product.dashboard.todayIncome', 'Today income'),
      value: summary?.income,
      color: '#389e0d',
      icon: <DollarCircleOutlined />,
    },
    {
      key: 'summary-expense',
      label: t('product.dashboard.todayExpense', 'Today expense'),
      value: summary?.expense,
      color: '#cf1322',
      icon: <WalletOutlined />,
    },
    {
      key: 'summary-purchase',
      label: t('product.dashboard.todayPurchase', 'Today purchase'),
      value: summary?.purchase,
      color: '#d46b08',
      icon: <TagsOutlined />,
    },
  ];

  const rangeMetrics: Metric[] = [
    {
      key: 'income',
      label: t('product.dashboard.totalIncome', 'Total income'),
      value: report?.total_income,
      color: '#389e0d',
      icon: <LineChartOutlined />,
    },
    {
      key: 'expense',
      label: t('product.dashboard.totalExpense', 'Total expense'),
      value: report?.total_expense,
      color: '#cf1322',
      icon: <WarningOutlined />,
    },
    {
      key: 'due',
      label: t('product.dashboard.totalDue', 'Sales due'),
      value: report?.total_due,
      color: '#0958d9',
      icon: <WalletOutlined />,
    },
    {
      key: 'stock',
      label: t('product.dashboard.stockValue', 'Stock value'),
      value: report?.stock_value,
      color: '#531dab',
      icon: <AppstoreOutlined />,
    },
  ];

  const countMetrics: Metric[] = [
    {
      key: 'items',
      label: t('product.dashboard.totalItems', 'Items'),
      value: report?.total_items,
      color: '#08979c',
      icon: <AppstoreOutlined />,
      precision: 0,
    },
    {
      key: 'categories',
      label: t('product.dashboard.totalCategories', 'Categories'),
      value: report?.total_categories,
      color: '#7cb305',
      icon: <TagsOutlined />,
      precision: 0,
    },
    {
      key: 'profit',
      label: t('product.dashboard.totalProfit', 'Sale profit'),
      value: report?.total_profit,
      color: '#389e0d',
      icon: <BarChartOutlined />,
    },
    {
      key: 'loss',
      label: t('product.dashboard.totalLoss', 'Sale loss'),
      value: report?.total_loss,
      color: '#cf1322',
      icon: <WarningOutlined />,
    },
  ];

  const renderMetric = (metric: Metric) => (
    <Col key={metric.key} xs={24} sm={12} lg={6}>
      <div style={metricStyle}>
        <Space align="start" size={12}>
          <span style={{ color: metric.color, fontSize: 22, lineHeight: 1 }}>{metric.icon}</span>
          <Statistic
            title={metric.label}
            value={metric.value || 0}
            precision={metric.precision ?? 2}
            valueStyle={{ color: metric.color, fontSize: 24 }}
          />
        </Space>
      </div>
    </Col>
  );

  const seriesColumns: ColumnsType<SeriesRow> = [
    {
      title: t('product.dashboard.period', 'Period'),
      dataIndex: 'date',
      width: 140,
      render: (value: string) => <Tag icon={<CalendarOutlined />}>{value}</Tag>,
    },
    {
      title: t('product.dashboard.sales', 'Sales'),
      dataIndex: 'sales',
      render: (value: number) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <span>{money(value)}</span>
          <Progress showInfo={false} percent={Math.min((value / maxSeries) * 100, 100)} />
        </Space>
      ),
    },
    {
      title: t('product.dashboard.purchases', 'Purchases'),
      dataIndex: 'purchases',
      render: (value: number) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <span>{money(value)}</span>
          <Progress
            showInfo={false}
            strokeColor="#d46b08"
            percent={Math.min((value / maxSeries) * 100, 100)}
          />
        </Space>
      ),
    },
    {
      title: t('product.dashboard.netMovement', 'Net movement'),
      key: 'net',
      align: 'right',
      render: (_, record) => {
        const net = record.sales - record.purchases;
        return <Tag color={net >= 0 ? 'green' : 'red'}>{money(net)}</Tag>;
      },
    },
  ];

  return (
    <PageContainer>
      <div style={sectionStyle}>
        <Space size={12} wrap>
          <Segmented
            value={duration}
            onChange={(value) => setDuration(value as DashboardDuration)}
            options={durationOptions.map((value) => ({
              label: t(`product.report.duration.${value}`, value),
              value,
            }))}
          />
          {duration === 'custom_date' && (
            <RangePicker
              key="dashboard-range"
              onChange={(_, dateStrings) => setCustomRange(dateStrings as [string, string])}
            />
          )}
          <Button
            icon={<ReloadOutlined />}
            type="primary"
            loading={loading}
            disabled={customRangeMissing}
            onClick={loadDashboard}
          >
            {t('product.dashboard.refresh', 'Refresh')}
          </Button>
          {rangeLabel && <Tag>{rangeLabel}</Tag>}
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        {todayMetrics.map(renderMetric)}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {rangeMetrics.map(renderMetric)}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {countMetrics.map(renderMetric)}
      </Row>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <BarChartOutlined />
            <strong>{t('product.dashboard.series', 'Sales and purchases')}</strong>
          </Space>
          <Space wrap>
            <Tag color={(report?.net_profit || 0) >= 0 ? 'green' : 'red'}>
              {t('product.dashboard.netProfit', 'Net profit')}: {money(report?.net_profit)}
            </Tag>
            <Tag color="blue">
              {t('product.dashboard.rows', 'Rows')}: {compactNumber(seriesRows.length)}
            </Tag>
          </Space>
        </div>
        <Table<SeriesRow>
          rowKey="date"
          size="small"
          loading={loading}
          columns={seriesColumns}
          dataSource={seriesRows}
          pagination={{ pageSize: 12, showSizeChanger: false }}
          scroll={{ x: 760 }}
        />
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
