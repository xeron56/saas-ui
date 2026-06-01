import {
  AuditOutlined,
  FileSearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  RiseOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl, useLocation } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Input,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import { readReportDurationFilter } from '../reportFilters';
import {
  getCustomerLedgerReport,
  getPartyProfitLossReport,
  getSupplierLedgerReport,
  getTopCustomerReport,
  getTopSupplierReport,
} from './service';
import type {
  PartyLedgerPartner,
  PartyLedgerReport,
  PartyMetric,
  PartyMetricReport,
  PartyProfitLossReport,
  PartyProfitLossRow,
  PartyReportParams,
  ReportDuration,
} from './types';
import type { RetailPartnerLedgerLine } from '../Party/types';

const { RangePicker } = DatePicker;

const durationOptions: ReportDuration[] = [
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

type LedgerKind = 'customer' | 'supplier';

const PartyReportPage: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialDuration =
    (readReportDurationFilter(location.pathname, location.search, 'last_thirty_days') as
      | ReportDuration
      | undefined) || 'last_thirty_days';
  const initialCustomRange =
    initialDuration === 'custom_date' && query.get('from_date') && query.get('to_date')
      ? ([query.get('from_date') || '', query.get('to_date') || ''] as [string, string])
      : undefined;
  const [duration, setDuration] = useState<ReportDuration>(initialDuration);
  const [customRange, setCustomRange] = useState<[string, string] | undefined>(initialCustomRange);
  const [branchRef, setBranchRef] = useState(query.get('branch_ref') || '');
  const [search, setSearch] = useState('');
  const [customerLedger, setCustomerLedger] = useState<PartyLedgerReport>();
  const [supplierLedger, setSupplierLedger] = useState<PartyLedgerReport>();
  const [topCustomers, setTopCustomers] = useState<PartyMetricReport>();
  const [topSuppliers, setTopSuppliers] = useState<PartyMetricReport>();
  const [profitLoss, setProfitLoss] = useState<PartyProfitLossReport>();
  const [ledgerDetail, setLedgerDetail] = useState<PartyLedgerReport>();
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const customRangeMissing = duration === 'custom_date' && (!customRange?.[0] || !customRange?.[1]);

  const buildParams = useCallback(
    (extra?: PartyReportParams): PartyReportParams => {
      const params: PartyReportParams = {
        duration,
        page_size: 20,
        limit: 8,
        ...extra,
      };
      if (duration === 'custom_date' && customRange?.[0] && customRange?.[1]) {
        params.from_date = customRange[0];
        params.to_date = customRange[1];
      }
      if (branchRef.trim()) {
        params.branch_ref = branchRef.trim();
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      return params;
    },
    [duration, customRange, branchRef, search],
  );

  const loadReports = useCallback(async () => {
    if (customRangeMissing) {
      return;
    }
    setLoading(true);
    try {
      const params = buildParams();
      const [
        customerLedgerResp,
        supplierLedgerResp,
        topCustomerResp,
        topSupplierResp,
        profitLossResp,
      ] = await Promise.all([
        getCustomerLedgerReport(params),
        getSupplierLedgerReport(params),
        getTopCustomerReport(params),
        getTopSupplierReport(params),
        getPartyProfitLossReport(params),
      ]);
      setCustomerLedger(customerLedgerResp);
      setSupplierLedger(supplierLedgerResp);
      setTopCustomers(topCustomerResp);
      setTopSuppliers(topSupplierResp);
      setProfitLoss(profitLossResp);
    } finally {
      setLoading(false);
    }
  }, [buildParams, customRangeMissing]);

  useEffect(() => {
    if (!customRangeMissing) {
      loadReports();
    }
  }, [customRangeMissing, loadReports]);

  const openLedger = async (kind: LedgerKind, partnerID: string) => {
    setDetailLoading(true);
    setLedgerOpen(true);
    try {
      const params = buildParams({ partner_id: partnerID, page_size: 1 });
      const resp =
        kind === 'customer'
          ? await getCustomerLedgerReport(params)
          : await getSupplierLedgerReport(params);
      setLedgerDetail(resp);
    } finally {
      setDetailLoading(false);
    }
  };

  const ledgerColumns = (kind: LedgerKind): ColumnsType<PartyLedgerPartner> => [
    {
      title: t('retail.partyReport.party', 'Party'),
      dataIndex: 'partner_name',
      fixed: 'left',
      width: 180,
      render: (value, record) => (
        <Button
          type="link"
          icon={<FileSearchOutlined />}
          onClick={() => openLedger(kind, record.partner_id)}
        >
          {value || record.partner_code || record.partner_id}
        </Button>
      ),
    },
    {
      title: t('retail.report.code', 'Code'),
      dataIndex: 'partner_code',
      width: 120,
    },
    {
      title: t('retail.report.branchRef', 'Branch ref'),
      dataIndex: 'branch_ref',
      width: 120,
      render: (value) => value || '-',
    },
    {
      title: t('retail.partyReport.opening', 'Opening'),
      dataIndex: 'opening_balance',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.debit', 'Debit'),
      dataIndex: 'debit_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.credit', 'Credit'),
      dataIndex: 'credit_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.partyReport.closing', 'Closing'),
      dataIndex: 'closing_balance',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.dueAmount', 'Due'),
      dataIndex: 'due_balance',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
  ];

  const topColumns: ColumnsType<PartyMetric> = [
    {
      title: t('retail.partyReport.party', 'Party'),
      dataIndex: 'partner_name',
      width: 180,
    },
    {
      title: t('retail.partyReport.documents', 'Documents'),
      dataIndex: 'document_count',
      align: 'right',
      width: 110,
    },
    {
      title: t('retail.partyReport.grossAmount', 'Gross'),
      dataIndex: 'gross_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.partyReport.returns', 'Returns'),
      dataIndex: 'return_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.partyReport.netAmount', 'Net'),
      dataIndex: 'net_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.profit', 'Profit'),
      dataIndex: 'profit_amount',
      align: 'right',
      width: 120,
      render: (value: number) => (
        <span style={{ color: (value || 0) >= 0 ? '#389e0d' : '#cf1322' }}>{money(value)}</span>
      ),
    },
  ];

  const profitColumns: ColumnsType<PartyProfitLossRow> = [
    {
      title: t('retail.partyReport.party', 'Party'),
      dataIndex: 'partner_name',
      fixed: 'left',
      width: 180,
      render: (value, record) => (
        <Space>
          <Tag color={record.kind === 'supplier' ? 'volcano' : 'blue'}>
            {record.kind || 'customer'}
          </Tag>
          <span>{value || record.partner_code || record.partner_id}</span>
        </Space>
      ),
    },
    {
      title: t('retail.report.sales', 'Sales'),
      dataIndex: 'sales_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.saleReturns', 'Sale returns'),
      dataIndex: 'sale_return_amount',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.purchases', 'Purchases'),
      dataIndex: 'purchase_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.purchaseReturns', 'Purchase returns'),
      dataIndex: 'purchase_return_amount',
      align: 'right',
      width: 150,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.netProfit', 'Net profit'),
      dataIndex: 'net_profit',
      align: 'right',
      width: 120,
      render: (value: number) => (
        <span style={{ color: (value || 0) >= 0 ? '#389e0d' : '#cf1322' }}>{money(value)}</span>
      ),
    },
    {
      title: t('retail.report.dueAmount', 'Due'),
      dataIndex: 'due_balance',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
  ];

  const detailColumns: ColumnsType<RetailPartnerLedgerLine> = [
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'date',
      width: 180,
      render: (value) => (value ? new Date(value).toLocaleString() : ''),
    },
    {
      title: t('retail.report.source', 'Source'),
      dataIndex: 'source_kind',
      width: 130,
      render: (value) => <Tag>{String(value || '').toUpperCase()}</Tag>,
    },
    {
      title: t('retail.report.documentNo', 'Document no.'),
      dataIndex: 'reference_no',
      width: 140,
    },
    {
      title: t('retail.report.debit', 'Debit'),
      dataIndex: 'debit_amount',
      align: 'right',
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.credit', 'Credit'),
      dataIndex: 'credit_amount',
      align: 'right',
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.runningBalance', 'Running balance'),
      dataIndex: 'balance',
      align: 'right',
      render: (value: number) => money(value),
    },
  ];

  return (
    <PageContainer>
      <div style={sectionStyle}>
        <Space size={12} wrap>
          <Segmented
            value={duration}
            onChange={(value) => setDuration(value as ReportDuration)}
            options={durationOptions.map((value) => ({
              label: t(`product.report.duration.${value}`, value),
              value,
            }))}
          />
          {duration === 'custom_date' && (
            <RangePicker onChange={(_, values) => setCustomRange(values as [string, string])} />
          )}
          <Input
            allowClear
            value={branchRef}
            onChange={(event) => setBranchRef(event.target.value)}
            onPressEnter={loadReports}
            placeholder={t('retail.report.branchRef', 'Branch ref')}
            style={{ width: 180 }}
          />
          <Input
            allowClear
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPressEnter={loadReports}
            placeholder={t('retail.partyReport.search', 'Search party')}
            style={{ width: 220 }}
          />
          <Button
            icon={<FilterOutlined />}
            type="primary"
            loading={loading}
            disabled={customRangeMissing}
            onClick={loadReports}
          >
            {t('retail.report.apply', 'Apply')}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            disabled={customRangeMissing}
            onClick={loadReports}
          >
            {t('retail.report.refresh', 'Refresh')}
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12} xl={6}>
          <div style={metricStyle}>
            <Statistic
              prefix={<TeamOutlined />}
              title={t('retail.partyReport.customerAccounts', 'Customer accounts')}
              value={customerLedger?.summary?.partner_count || 0}
            />
          </div>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <div style={metricStyle}>
            <Statistic
              prefix={<WalletOutlined />}
              title={t('retail.report.receivableDue', 'Receivable due')}
              value={profitLoss?.receivable_due || 0}
              precision={2}
            />
          </div>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <div style={metricStyle}>
            <Statistic
              prefix={<AuditOutlined />}
              title={t('retail.report.payableDue', 'Payable due')}
              value={profitLoss?.payable_due || 0}
              precision={2}
            />
          </div>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <div style={metricStyle}>
            <Statistic
              prefix={<RiseOutlined />}
              title={t('retail.report.netProfit', 'Net profit')}
              value={profitLoss?.net_profit || 0}
              precision={2}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <div id="customer-ledger-report-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <strong>{t('retail.partyReport.customerLedger', 'Customer ledger')}</strong>
              <Tag color="blue">{money(customerLedger?.summary?.closing_balance)}</Tag>
            </div>
            <Table<PartyLedgerPartner>
              rowKey="partner_id"
              loading={loading}
              dataSource={customerLedger?.partners || []}
              columns={ledgerColumns('customer')}
              pagination={{ pageSize: 8 }}
              scroll={{ x: 940 }}
            />
          </div>
        </Col>
        <Col xs={24} xl={12}>
          <div id="supplier-ledger-report-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <strong>{t('retail.partyReport.supplierLedger', 'Supplier ledger')}</strong>
              <Tag color="volcano">{money(supplierLedger?.summary?.closing_balance)}</Tag>
            </div>
            <Table<PartyLedgerPartner>
              rowKey="partner_id"
              loading={loading}
              dataSource={supplierLedger?.partners || []}
              columns={ledgerColumns('supplier')}
              pagination={{ pageSize: 8 }}
              scroll={{ x: 940 }}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <div id="top-customers-report-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <strong>{t('retail.partyReport.topCustomers', 'Top customers')}</strong>
              <Tag color="green">{money(topCustomers?.net_amount)}</Tag>
            </div>
            <Table<PartyMetric>
              rowKey="partner_id"
              loading={loading}
              dataSource={topCustomers?.items || []}
              columns={topColumns}
              pagination={false}
              scroll={{ x: 770 }}
            />
          </div>
        </Col>
        <Col xs={24} xl={12}>
          <div id="top-suppliers-report-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <strong>{t('retail.partyReport.topSuppliers', 'Top suppliers')}</strong>
              <Tag color="green">{money(topSuppliers?.net_amount)}</Tag>
            </div>
            <Table<PartyMetric>
              rowKey="partner_id"
              loading={loading}
              dataSource={topSuppliers?.items || []}
              columns={topColumns}
              pagination={false}
              scroll={{ x: 770 }}
            />
          </div>
        </Col>
      </Row>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <strong>{t('retail.partyReport.profitLoss', 'Party profit and loss')}</strong>
          <Space>
            <Tag>
              {t('retail.report.netSales', 'Net sales')}: {money(profitLoss?.net_sales)}
            </Tag>
            <Tag>
              {t('retail.report.netPurchases', 'Net purchases')}: {money(profitLoss?.net_purchases)}
            </Tag>
          </Space>
        </div>
        <Table<PartyProfitLossRow>
          rowKey="partner_id"
          loading={loading}
          dataSource={profitLoss?.items || []}
          columns={profitColumns}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 940 }}
        />
      </div>

      <Drawer
        width={860}
        open={ledgerOpen}
        title={
          ledgerDetail?.partner?.display_name ||
          t('retail.partyReport.ledgerDetail', 'Ledger detail')
        }
        onClose={() => setLedgerOpen(false)}
        destroyOnClose
      >
        <Table<RetailPartnerLedgerLine>
          rowKey={(record) =>
            record.id || `${record.source_kind}-${record.created_at}-${record.reference_no}`
          }
          loading={detailLoading}
          dataSource={ledgerDetail?.items || []}
          columns={detailColumns}
          pagination={false}
          scroll={{ x: 760 }}
        />
      </Drawer>
    </PageContainer>
  );
};

export default PartyReportPage;
