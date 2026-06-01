import {
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  CrownOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  LineChartOutlined,
  ReloadOutlined,
  SwapOutlined,
  WalletOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import { getCatalogLookups } from '../Catalog/service';
import type { CatalogBranch } from '../Catalog/types';
import {
  getBalanceSheetReport,
  getBillWiseProfitReport,
  getCashFlowReport,
  getProductPurchaseHistory,
  getProductSaleHistory,
  getProfitLossReport,
  getReportFieldCatalog,
  getReportOverview,
  getSubscriptionReport,
  getTaxReport,
  listProductPurchaseHistory,
  listProductSaleHistory,
} from './service';
import type {
  ReportBalanceSheet,
  ReportBalanceSheetAsset,
  ReportBillWiseProfit,
  ReportBillWiseProfitBill,
  ReportBillWiseProfitLine,
  ReportCashFlow,
  ReportCashFlowRow,
  ReportFieldCatalog,
  ReportFieldDefinition,
  ReportFieldGroup,
  ReportProductHistory,
  ReportProductHistoryDetail,
  ReportProductHistoryItem,
  ReportProductHistoryLine,
  ReportProfitLoss,
  ReportProfitLossRow,
  ReportDuration,
  ReportItemMetric,
  ReportOverview,
  ReportSeriesPoint,
  ReportStockWarning,
  ReportSubscription,
  ReportSubscriptionReport,
  ReportSummary,
  ReportTaxDocument,
  ReportTaxReport,
} from './types';

const { RangePicker } = DatePicker;

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const number = (value?: number) =>
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

const shortcutStyle: React.CSSProperties = {
  minHeight: 154,
  padding: 14,
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 10,
};

const shortcutDescriptionStyle: React.CSSProperties = {
  color: '#595959',
  minHeight: 38,
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 12,
};

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

type ProductMovementKind = 'sale' | 'purchase';

type MetricConfig = {
  key: keyof ReportSummary;
  label: string;
  color?: string;
  precision?: number;
};

type ReportShortcut = {
  key: string;
  title: string;
  description: string;
  value?: number;
  path?: string;
  anchor?: string;
  tag?: string;
};

const positiveColor = '#1677ff';
const profitColor = '#389e0d';
const warningColor = '#d46b08';
const dangerColor = '#cf1322';

const statusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'paid':
    case 'success':
    case 'active':
      return 'green';
    case 'unpaid':
    case 'pending':
      return 'gold';
    case 'failed':
    case 'rejected':
    case 'expired':
      return 'red';
    default:
      return 'blue';
  }
};

const branchLabel = (branch: CatalogBranch) =>
  branch.label || branch.name || branch.code || branch.id;

const ReportPage: React.FC = () => {
  const intl = useIntl();
  const [duration, setDuration] = useState<ReportDuration>('last_thirty_days');
  const [customRange, setCustomRange] = useState<[string, string]>();
  const [branchRef, setBranchRef] = useState('');
  const [branches, setBranches] = useState<CatalogBranch[]>([]);
  const [overview, setOverview] = useState<ReportOverview>();
  const [taxReport, setTaxReport] = useState<ReportTaxReport>();
  const [cashFlow, setCashFlow] = useState<ReportCashFlow>();
  const [balanceSheet, setBalanceSheet] = useState<ReportBalanceSheet>();
  const [profitLoss, setProfitLoss] = useState<ReportProfitLoss>();
  const [billProfit, setBillProfit] = useState<ReportBillWiseProfit>();
  const [subscriptionReport, setSubscriptionReport] = useState<ReportSubscriptionReport>();
  const [fieldCatalog, setFieldCatalog] = useState<ReportFieldCatalog>();
  const [saleHistory, setSaleHistory] = useState<ReportProductHistory>();
  const [purchaseHistory, setPurchaseHistory] = useState<ReportProductHistory>();
  const [movementKind, setMovementKind] = useState<ProductMovementKind>('sale');
  const [movementDetail, setMovementDetail] = useState<ReportProductHistoryDetail>();
  const [detailKind, setDetailKind] = useState<ProductMovementKind>('sale');
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });
  const branchOptions = branches.map((branch) => ({
    label: branchLabel(branch),
    value: branch.id,
  }));

  useEffect(() => {
    let active = true;
    getCatalogLookups()
      .then((resp) => {
        if (active) {
          setBranches(resp.branches || []);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const buildParams = useCallback(() => {
    const params: Record<string, any> = { duration, limit: 8 };
    if (duration === 'custom_date' && customRange?.[0] && customRange?.[1]) {
      params.from_date = customRange[0];
      params.to_date = customRange[1];
    }
    if (branchRef.trim()) {
      params.branch_ref = branchRef.trim();
    }
    return params;
  }, [duration, customRange, branchRef]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const [
        overviewResp,
        taxResp,
        cashFlowResp,
        balanceSheetResp,
        profitLossResp,
        billProfitResp,
        fieldCatalogResp,
        subscriptionResp,
        saleHistoryResp,
        purchaseHistoryResp,
      ] = await Promise.all([
        getReportOverview(params),
        getTaxReport(params),
        getCashFlowReport(params),
        getBalanceSheetReport(params),
        getProfitLossReport(params),
        getBillWiseProfitReport(params),
        getReportFieldCatalog(),
        getSubscriptionReport(params),
        listProductSaleHistory(params),
        listProductPurchaseHistory(params),
      ]);
      setOverview(overviewResp);
      setTaxReport(taxResp);
      setCashFlow(cashFlowResp);
      setBalanceSheet(balanceSheetResp);
      setProfitLoss(profitLossResp);
      setBillProfit(billProfitResp);
      setFieldCatalog(fieldCatalogResp);
      setSubscriptionReport(subscriptionResp);
      setSaleHistory(saleHistoryResp);
      setPurchaseHistory(purchaseHistoryResp);
      setMovementDetail(undefined);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    if (duration !== 'custom_date' || (customRange?.[0] && customRange?.[1])) {
      loadOverview();
    }
  }, [duration, customRange, loadOverview]);

  const summary = overview?.summary || {};
  const series = overview?.series || [];
  const topItems = overview?.top_items || [];
  const lowStockItems = overview?.low_stock_items || [];
  const taxRows = [...(taxReport?.sales || []), ...(taxReport?.purchases || [])];
  const cashFlowRows = cashFlow?.data || [];
  const balanceSheetRows = balanceSheet?.asset_datas || [];
  const profitIncomeRows = profitLoss?.mergedIncomeSaleData || [];
  const profitExpenseRows = profitLoss?.mergedExpenseData || [];
  const billProfitRows = billProfit?.data || [];
  const subscriptionRows = subscriptionReport?.data || [];
  const fieldCatalogGroups = fieldCatalog?.groups || [];
  const activeMovement = movementKind === 'sale' ? saleHistory : purchaseHistory;
  const movementRows = activeMovement?.data || [];
  const maxSeriesSales = Math.max(...series.map((point) => point.sales || 0), 1);
  const maxTopSales = Math.max(...topItems.map((item) => item.sales_total || 0), 1);
  const customRangeMissing = duration === 'custom_date' && (!customRange?.[0] || !customRange?.[1]);
  const subscriptionRevenue = subscriptionRows.reduce((sum, row) => sum + (row.price || 0), 0);
  const paidSubscriptions = subscriptionRows.filter((row) =>
    ['paid', 'success', 'active'].includes((row.payment_status || '').toLowerCase()),
  ).length;
  const pendingSubscriptions = subscriptionRows.filter((row) =>
    ['unpaid', 'pending'].includes((row.payment_status || '').toLowerCase()),
  ).length;
  const expiringSubscriptions = subscriptionRows.filter((row) => {
    if (!row.expires_at) {
      return false;
    }
    const expiresAt = new Date(row.expires_at).getTime();
    if (!Number.isFinite(expiresAt)) {
      return false;
    }
    const now = Date.now();
    return expiresAt >= now && expiresAt <= now + 30 * 24 * 60 * 60 * 1000;
  }).length;
  const fieldCatalogCount = fieldCatalogGroups.reduce(
    (sum, group) => sum + (group.fields?.length || 0),
    0,
  );
  const reportQuery = new URLSearchParams({ duration });
  if (duration === 'custom_date' && customRange?.[0] && customRange?.[1]) {
    reportQuery.set('from_date', customRange[0]);
    reportQuery.set('to_date', customRange[1]);
  }
  if (branchRef.trim()) {
    reportQuery.set('branch_ref', branchRef.trim());
  }
  const reportQueryText = reportQuery.toString();
  const withReportQuery = (path: string) => {
    const [base, hash] = path.split('#');
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}${reportQueryText}${hash ? `#${hash}` : ''}`;
  };
  const reportShortcuts: ReportShortcut[] = [
    {
      key: 'sale-report',
      title: t('retail.report.shortcut.sale', 'Sale'),
      description: t(
        'retail.report.shortcut.saleDescription',
        'Invoices, paid totals, dues, and sale status.',
      ),
      value: summary.sales_total,
      path: withReportQuery('/retail/reports/sales'),
      tag: t('retail.report.transaction', 'Transaction'),
    },
    {
      key: 'sale-return-report',
      title: t('retail.report.shortcut.saleReturn', 'Sale Return'),
      description: t(
        'retail.report.shortcut.saleReturnDescription',
        'Returned sale documents and refunded stock lines.',
      ),
      value: summary.sale_return_total,
      path: withReportQuery('/retail/reports/sale-returns'),
      tag: t('retail.report.transaction', 'Transaction'),
    },
    {
      key: 'purchase-report',
      title: t('retail.report.shortcut.purchase', 'Purchase'),
      description: t(
        'retail.report.shortcut.purchaseDescription',
        'Supplier receipts, purchase totals, and dues.',
      ),
      value: summary.purchase_total,
      path: withReportQuery('/retail/reports/purchases'),
      tag: t('retail.report.transaction', 'Transaction'),
    },
    {
      key: 'purchase-return-report',
      title: t('retail.report.shortcut.purchaseReturn', 'Purchase Return'),
      description: t(
        'retail.report.shortcut.purchaseReturnDescription',
        'Returned purchase documents and supplier adjustments.',
      ),
      value: summary.purchase_return_total,
      path: withReportQuery('/retail/reports/purchase-returns'),
      tag: t('retail.report.transaction', 'Transaction'),
    },
    {
      key: 'tax-report',
      title: t('retail.report.taxReport', 'Tax Report'),
      description: t(
        'retail.report.shortcut.taxDescription',
        'Sale and purchase tax documents with net tax.',
      ),
      value: taxReport?.net_tax,
      anchor: 'tax-report-section',
      tag: t('retail.report.accounting', 'Accounting'),
    },
    {
      key: 'income-report',
      title: t('retail.report.income', 'Income'),
      description: t(
        'retail.report.shortcut.incomeDescription',
        'Posted income records and tender settlement.',
      ),
      value: summary.income_total,
      path: withReportQuery('/retail/reports/income'),
      tag: t('retail.report.finance', 'Finance'),
    },
    {
      key: 'expense-report',
      title: t('retail.report.expense', 'Expense'),
      description: t(
        'retail.report.shortcut.expenseDescription',
        'Posted expense records and pending settlement.',
      ),
      value: summary.expense_total,
      path: withReportQuery('/retail/reports/expenses'),
      tag: t('retail.report.finance', 'Finance'),
    },
    {
      key: 'day-book-report',
      title: t('retail.report.shortcut.dayBook', 'Day Book'),
      description: t(
        'retail.report.shortcut.dayBookDescription',
        'Today cash, bank, income, expense, and due movements.',
      ),
      value: summary.cash_balance,
      path: '/retail/finance/day-book?duration=today',
      tag: t('retail.report.finance', 'Finance'),
    },
    {
      key: 'current-stock-report',
      title: t('retail.report.shortcut.currentStock', 'Current Stock'),
      description: t(
        'retail.report.shortcut.currentStockDescription',
        'On-hand lots, valuation, and low-stock warnings.',
      ),
      value: summary.stock_value,
      path: '/retail/stock',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'customer-due-report',
      title: t('retail.report.shortcut.customerDue', 'Customer Due'),
      description: t(
        'retail.report.shortcut.customerDueDescription',
        'Receivable ledger and customer closing balances.',
      ),
      value: summary.receivable_due,
      path: withReportQuery('/retail/party-reports#customer-ledger-report-section'),
      tag: t('retail.report.party', 'Party'),
    },
    {
      key: 'supplier-due-report',
      title: t('retail.report.shortcut.supplierDue', 'Supplier Due'),
      description: t(
        'retail.report.shortcut.supplierDueDescription',
        'Payable ledger and supplier closing balances.',
      ),
      value: summary.payable_due,
      path: withReportQuery('/retail/party-reports#supplier-ledger-report-section'),
      tag: t('retail.report.party', 'Party'),
    },
    {
      key: 'bill-wise-profit-report',
      title: t('retail.report.billWiseProfit', 'Bill Wise Profit & Loss'),
      description: t(
        'retail.report.shortcut.billWiseDescription',
        'Invoice-level profit, loss, paid, and due amounts.',
      ),
      value: billProfit?.net_profit,
      anchor: 'bill-wise-profit-report-section',
      tag: t('retail.report.profitability', 'Profitability'),
    },
    {
      key: 'product-wise-profit-report',
      title: t('retail.report.shortcut.productWiseProfit', 'Product Wise Profit & Loss'),
      description: t(
        'retail.report.shortcut.productWiseProfitDescription',
        'Product movement quantity, amount, and profit.',
      ),
      value: activeMovement?.total_profit,
      anchor: 'product-movement-report-section',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'due-transaction-report',
      title: t('retail.report.shortcut.dueTransaction', 'Due Transaction'),
      description: t(
        'retail.report.shortcut.dueTransactionDescription',
        'Customer collections and supplier due payments.',
      ),
      value: summary.due_collection_total,
      path: withReportQuery('/retail/reports/due-transactions'),
      tag: t('retail.report.finance', 'Finance'),
    },
    {
      key: 'subscription-report',
      title: t('retail.report.subscriptionReport', 'Subscription Report'),
      description: t(
        'retail.report.shortcut.subscriptionDescription',
        'Subscription revenue, status, and expiry.',
      ),
      value: subscriptionRevenue,
      anchor: 'subscription-report-section',
      tag: t('retail.report.saas', 'SaaS'),
    },
    {
      key: 'top-customer-report',
      title: t('retail.report.shortcut.topCustomer', 'Top 5 Customer'),
      description: t(
        'retail.report.shortcut.topCustomerDescription',
        'Highest-value customer accounts.',
      ),
      path: withReportQuery('/retail/party-reports#top-customers-report-section'),
      tag: t('retail.report.party', 'Party'),
    },
    {
      key: 'top-supplier-report',
      title: t('retail.report.shortcut.topSupplier', 'Top 5 Supplier'),
      description: t(
        'retail.report.shortcut.topSupplierDescription',
        'Highest-value supplier accounts.',
      ),
      path: withReportQuery('/retail/party-reports#top-suppliers-report-section'),
      tag: t('retail.report.party', 'Party'),
    },
    {
      key: 'top-product-report',
      title: t('retail.report.shortcut.topProduct', 'Top 5 Product'),
      description: t(
        'retail.report.shortcut.topProductDescription',
        'Best-selling items for the selected range.',
      ),
      anchor: 'top-items-report-section',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'combo-product-report',
      title: t('retail.report.shortcut.comboProduct', 'Combo Product'),
      description: t(
        'retail.report.shortcut.comboProductDescription',
        'Migrated combo products as bundle catalog items.',
      ),
      path: '/retail/products?item_kind=bundle',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'discount-product-report',
      title: t('retail.report.shortcut.discountProduct', 'Discount Product'),
      description: t(
        'retail.report.shortcut.discountProductDescription',
        'Discounted documents in tax and bill-level reporting.',
      ),
      anchor: 'tax-report-section',
      tag: t('retail.report.profitability', 'Profitability'),
    },
    {
      key: 'product-wise-purchase-report',
      title: t('retail.report.shortcut.productWisePurchase', 'Product Wise Purchase'),
      description: t(
        'retail.report.shortcut.productWisePurchaseDescription',
        'Product purchase quantities and costs.',
      ),
      anchor: 'product-movement-report-section',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'product-wise-sale-report',
      title: t('retail.report.shortcut.productWiseSale', 'Product Wise Sale'),
      description: t(
        'retail.report.shortcut.productWiseSaleDescription',
        'Product sale quantities, revenue, and profit.',
      ),
      anchor: 'product-movement-report-section',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'expired-product-report',
      title: t('retail.report.shortcut.expiredProduct', 'Expired Product'),
      description: t(
        'retail.report.shortcut.expiredProductDescription',
        'Expired inventory lots and valuation.',
      ),
      path: '/retail/stock?stock_state=expired',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'loss-profit-history-report',
      title: t('retail.report.shortcut.lossProfitHistory', 'Loss Profit History'),
      description: t(
        'retail.report.shortcut.lossProfitHistoryDescription',
        'Date-range profit and loss history.',
      ),
      anchor: 'profit-loss-report-section',
      tag: t('retail.report.profitability', 'Profitability'),
    },
    {
      key: 'product-sale-history-report',
      title: t('retail.report.productSaleHistory', 'Product Sale History'),
      description: t(
        'retail.report.shortcut.productSaleHistoryDescription',
        'Item-level sale history with drill-down lines.',
      ),
      anchor: 'product-movement-report-section',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'product-purchase-history-report',
      title: t('retail.report.productPurchaseHistory', 'Product Purchase History'),
      description: t(
        'retail.report.shortcut.productPurchaseHistoryDescription',
        'Item-level purchase history with drill-down lines.',
      ),
      anchor: 'product-movement-report-section',
      tag: t('retail.report.inventory', 'Inventory'),
    },
    {
      key: 'custom-report',
      title: t('retail.report.shortcut.customReports', 'Custom Reports'),
      description: t(
        'retail.report.shortcut.customReportsDescription',
        'Build a report from migrated retail field groups.',
      ),
      value: fieldCatalogCount,
      path: '/retail/reports/custom',
      tag: t('retail.report.builder', 'Builder'),
    },
  ];

  const openReportShortcut = (shortcut: ReportShortcut) => {
    if (shortcut.path) {
      history.push(shortcut.path);
      return;
    }
    if (shortcut.anchor) {
      document
        .getElementById(shortcut.anchor)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const loadMovementDetail = useCallback(
    async (record: ReportProductHistoryItem) => {
      if (!record.item_id || customRangeMissing) {
        return;
      }
      const kind = movementKind;
      setDetailKind(kind);
      setMovementDetail(undefined);
      setDetailLoading(true);
      try {
        const params = buildParams();
        const detail =
          kind === 'sale'
            ? await getProductSaleHistory(record.item_id, params)
            : await getProductPurchaseHistory(record.item_id, params);
        setMovementDetail(detail);
      } finally {
        setDetailLoading(false);
      }
    },
    [buildParams, customRangeMissing, movementKind],
  );

  const primaryMetrics: MetricConfig[] = [
    {
      key: 'net_sales',
      label: t('retail.report.netSales', 'Net sales'),
      color: positiveColor,
    },
    {
      key: 'gross_profit',
      label: t('retail.report.grossProfit', 'Gross profit'),
      color: profitColor,
    },
    {
      key: 'net_profit',
      label: t('retail.report.netProfit', 'Net profit'),
      color: (summary.net_profit || 0) >= 0 ? profitColor : dangerColor,
    },
    {
      key: 'net_purchases',
      label: t('retail.report.netPurchases', 'Net purchases'),
      color: warningColor,
    },
  ];

  const balanceMetrics: MetricConfig[] = [
    {
      key: 'cash_balance',
      label: t('retail.report.cashBalance', 'Cash balance'),
      color: profitColor,
    },
    {
      key: 'bank_balance',
      label: t('retail.report.bankBalance', 'Bank balance'),
      color: positiveColor,
    },
    {
      key: 'receivable_due',
      label: t('retail.report.receivableDue', 'Receivable due'),
      color: warningColor,
    },
    {
      key: 'payable_due',
      label: t('retail.report.payableDue', 'Payable due'),
      color: dangerColor,
    },
  ];

  const dueMetrics: MetricConfig[] = [
    {
      key: 'due_collection_total',
      label: t('retail.report.dueCollectionTotal', 'Due collected'),
      color: profitColor,
    },
    {
      key: 'due_payment_total',
      label: t('retail.report.duePaymentTotal', 'Due paid'),
      color: warningColor,
    },
    {
      key: 'pending_cheque_total',
      label: t('retail.report.pendingChequeTotal', 'Pending cheques'),
      color: dangerColor,
    },
    {
      key: 'gross_loss',
      label: t('retail.report.grossLoss', 'Gross loss'),
      color: dangerColor,
    },
  ];

  const stockMetrics: MetricConfig[] = [
    {
      key: 'stock_value',
      label: t('retail.report.stockValue', 'Stock value'),
      color: positiveColor,
    },
    {
      key: 'item_count',
      label: t('retail.report.itemCount', 'Items'),
      color: '#0958d9',
      precision: 0,
    },
    {
      key: 'customer_count',
      label: t('retail.report.customerCount', 'Customers'),
      color: '#531dab',
      precision: 0,
    },
    {
      key: 'low_stock_count',
      label: t('retail.report.lowStockCount', 'Low stock'),
      color: dangerColor,
      precision: 0,
    },
  ];

  const renderMetric = (metric: MetricConfig) => (
    <Col key={metric.key} xs={24} sm={12} xl={6}>
      <div style={metricStyle}>
        <Statistic
          title={metric.label}
          value={summary[metric.key] || 0}
          precision={metric.precision ?? 2}
          valueStyle={{ color: metric.color }}
        />
      </div>
    </Col>
  );

  const seriesColumns: ColumnsType<ReportSeriesPoint> = [
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'date',
      width: 110,
      fixed: 'left',
    },
    {
      title: t('retail.report.sales', 'Sales'),
      dataIndex: 'sales',
      width: 190,
      render: (value: number) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <span>{money(value)}</span>
          <Progress
            percent={Math.round(((value || 0) / maxSeriesSales) * 100)}
            showInfo={false}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: t('retail.report.saleReturns', 'Sale returns'),
      dataIndex: 'sale_returns',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.purchases', 'Purchases'),
      dataIndex: 'purchases',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.purchaseReturns', 'Purchase returns'),
      dataIndex: 'purchase_returns',
      align: 'right',
      width: 150,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.income', 'Income'),
      dataIndex: 'income',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.expense', 'Expense'),
      dataIndex: 'expense',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.profit', 'Profit'),
      dataIndex: 'profit',
      align: 'right',
      width: 120,
      render: (value: number) => (
        <span style={{ color: (value || 0) >= 0 ? profitColor : dangerColor }}>{money(value)}</span>
      ),
    },
  ];

  const topItemColumns: ColumnsType<ReportItemMetric> = [
    {
      title: t('retail.report.item', 'Item'),
      dataIndex: 'item_name',
      render: (value: string, record) => value || record.item_code || record.item_id,
    },
    {
      title: t('retail.report.code', 'Code'),
      dataIndex: 'item_code',
      width: 120,
    },
    {
      title: t('retail.report.quantity', 'Quantity'),
      dataIndex: 'quantity',
      align: 'right',
      width: 110,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.sales', 'Sales'),
      dataIndex: 'sales_total',
      width: 180,
      render: (value: number) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <span>{money(value)}</span>
          <Progress
            percent={Math.round(((value || 0) / maxTopSales) * 100)}
            showInfo={false}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: t('retail.report.profit', 'Profit'),
      dataIndex: 'profit',
      align: 'right',
      width: 120,
      render: (value: number) => (
        <span style={{ color: (value || 0) >= 0 ? profitColor : dangerColor }}>{money(value)}</span>
      ),
    },
  ];

  const lowStockColumns: ColumnsType<ReportStockWarning> = [
    {
      title: t('retail.report.item', 'Item'),
      dataIndex: 'item_name',
      render: (value: string, record) => value || record.item_code || record.item_id,
    },
    {
      title: t('retail.report.code', 'Code'),
      dataIndex: 'item_code',
      width: 120,
    },
    {
      title: t('retail.report.quantity', 'Quantity'),
      dataIndex: 'quantity',
      align: 'right',
      width: 110,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.alertQuantity', 'Alert qty'),
      dataIndex: 'alert_quantity',
      align: 'right',
      width: 110,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.stockValue', 'Stock value'),
      dataIndex: 'stock_value',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.status', 'Status'),
      width: 100,
      render: () => <Tag color="red">{t('retail.report.lowStock', 'Low stock')}</Tag>,
    },
  ];

  const taxColumns: ColumnsType<ReportTaxDocument> = [
    {
      title: t('retail.report.source', 'Source'),
      dataIndex: 'source',
      width: 110,
      render: (value: string) => (
        <Tag color={value === 'sale' ? 'green' : 'orange'}>
          {value === 'sale'
            ? t('retail.report.sale', 'Sale')
            : t('retail.report.purchase', 'Purchase')}
        </Tag>
      ),
    },
    {
      title: t('retail.report.documentNo', 'Document no.'),
      dataIndex: 'document_no',
      width: 150,
    },
    {
      title: t('retail.report.party', 'Party'),
      dataIndex: 'partner_name',
      width: 180,
    },
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'occurred_at',
      width: 150,
      render: (value: string) => value?.slice(0, 10),
    },
    {
      title: t('retail.report.amount', 'Amount'),
      dataIndex: 'total_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.discount', 'Discount'),
      dataIndex: 'discount_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.taxRate', 'Tax %'),
      dataIndex: 'tax_percent',
      align: 'right',
      width: 100,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.taxAmount', 'Tax'),
      dataIndex: 'tax_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
  ];

  const cashFlowColumns: ColumnsType<ReportCashFlowRow> = [
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'date',
      width: 130,
      fixed: 'left',
      render: (value: string) => value?.slice(0, 10),
    },
    {
      title: t('retail.report.movementNo', 'Movement no.'),
      dataIndex: 'movement_no',
      width: 150,
    },
    {
      title: t('retail.report.type', 'Type'),
      dataIndex: 'type',
      width: 100,
      render: (value: string) => (
        <Tag color={value === 'credit' ? 'green' : 'red'}>
          {value === 'credit'
            ? t('retail.report.credit', 'Credit')
            : t('retail.report.debit', 'Debit')}
        </Tag>
      ),
    },
    {
      title: t('retail.report.transactionType', 'Transaction type'),
      dataIndex: 'transaction_type',
      width: 150,
      render: (value: string) => value?.replace(/_/g, ' ') || '-',
    },
    {
      title: t('retail.report.amount', 'Amount'),
      dataIndex: 'amount',
      align: 'right',
      width: 120,
      render: (value: number, record) => (
        <span style={{ color: record.type === 'credit' ? profitColor : dangerColor }}>
          {money(value)}
        </span>
      ),
    },
    {
      title: t('retail.report.paymentType', 'Payment type'),
      dataIndex: 'payment_type_name',
      width: 170,
      render: (value: string) => value || '-',
    },
    {
      title: t('retail.report.documentNo', 'Document no.'),
      dataIndex: 'reference_no',
      width: 150,
      render: (value: string, record) => value || record.invoice_no || '-',
    },
    {
      title: t('retail.report.runningBalance', 'Running balance'),
      dataIndex: 'running_balance',
      align: 'right',
      width: 150,
      render: (value: number) => (
        <span style={{ color: (value || 0) >= 0 ? profitColor : dangerColor }}>{money(value)}</span>
      ),
    },
  ];

  const balanceSheetColumns: ColumnsType<ReportBalanceSheetAsset> = [
    {
      title: t('retail.report.assetType', 'Asset type'),
      dataIndex: 'source',
      width: 120,
      fixed: 'left',
      render: (value: string) => (
        <Tag color={value === 'bank' ? 'blue' : 'green'}>
          {value === 'bank'
            ? t('retail.report.bankAsset', 'Bank')
            : t('retail.report.stockAsset', 'Stock')}
        </Tag>
      ),
    },
    {
      title: t('retail.report.item', 'Item'),
      dataIndex: 'name',
      width: 220,
      render: (value: string, record) => value || record.item_code || record.id,
    },
    {
      title: t('retail.report.code', 'Code'),
      dataIndex: 'item_code',
      width: 110,
      render: (value: string) => value || '-',
    },
    {
      title: t('retail.report.type', 'Type'),
      dataIndex: 'item_kind',
      width: 120,
      render: (value: string, record) => record.account_kind || value || '-',
    },
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'created_at',
      width: 130,
      render: (value: string, record) => (value || record.opening_date)?.slice(0, 10),
    },
    {
      title: t('retail.report.quantity', 'Quantity'),
      dataIndex: 'quantity',
      align: 'right',
      width: 120,
      render: (value: number, record) => (record.source === 'product' ? number(value) : '-'),
    },
    {
      title: t('retail.report.stockValue', 'Stock value'),
      dataIndex: 'stock_value',
      align: 'right',
      width: 140,
      render: (value: number, record) => (record.source === 'product' ? money(value) : '-'),
    },
    {
      title: t('retail.report.openingBalance', 'Opening balance'),
      dataIndex: 'opening_balance',
      align: 'right',
      width: 150,
      render: (value: number, record) => (record.source === 'bank' ? money(value) : '-'),
    },
    {
      title: t('retail.report.bankBalance', 'Bank balance'),
      dataIndex: 'balance',
      align: 'right',
      width: 140,
      render: (value: number, record) => (record.source === 'bank' ? money(value) : '-'),
    },
  ];

  const profitIncomeColumns: ColumnsType<ReportProfitLossRow> = [
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'date',
      width: 120,
    },
    {
      title: t('retail.report.type', 'Type'),
      dataIndex: 'type',
      width: 110,
      render: (value: string) => (
        <Tag color={value === 'Sale' ? 'green' : 'blue'}>
          {value === 'Sale' ? t('retail.report.sale', 'Sale') : t('retail.report.income', 'Income')}
        </Tag>
      ),
    },
    {
      title: t('retail.report.sales', 'Sales'),
      dataIndex: 'total_sales',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.income', 'Income'),
      dataIndex: 'total_incomes',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
  ];

  const profitExpenseColumns: ColumnsType<ReportProfitLossRow> = [
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'date',
      width: 120,
    },
    {
      title: t('retail.report.type', 'Type'),
      dataIndex: 'type',
      width: 110,
      render: (value: string) => (
        <Tag color="red">{value || t('retail.report.expense', 'Expense')}</Tag>
      ),
    },
    {
      title: t('retail.report.expense', 'Expense'),
      dataIndex: 'total_expenses',
      align: 'right',
      width: 140,
      render: (value: number) => money(value),
    },
  ];

  const billLineColumns: ColumnsType<ReportBillWiseProfitLine> = [
    {
      title: t('retail.report.item', 'Item'),
      dataIndex: 'item_name',
      render: (value: string, record) => value || record.item_code || record.item_id,
    },
    {
      title: t('retail.report.code', 'Code'),
      dataIndex: 'item_code',
      width: 120,
    },
    {
      title: t('retail.report.quantity', 'Quantity'),
      dataIndex: 'quantity',
      align: 'right',
      width: 110,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.unitPrice', 'Unit price'),
      dataIndex: 'unit_price',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.purchaseCost', 'Purchase cost'),
      dataIndex: 'purchase_cost',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.lineTotal', 'Line total'),
      dataIndex: 'line_subtotal',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.profit', 'Profit'),
      dataIndex: 'profit_amount',
      align: 'right',
      width: 120,
      render: (value: number) => (
        <span style={{ color: (value || 0) >= 0 ? profitColor : dangerColor }}>{money(value)}</span>
      ),
    },
  ];

  const billProfitColumns: ColumnsType<ReportBillWiseProfitBill> = [
    {
      title: t('retail.report.documentNo', 'Document no.'),
      dataIndex: 'receipt_no',
      fixed: 'left',
      width: 150,
    },
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'sold_at',
      width: 130,
      render: (value: string) => value?.slice(0, 10),
    },
    {
      title: t('retail.report.party', 'Party'),
      dataIndex: 'partner_name',
      width: 170,
      render: (value: string) => value || t('retail.report.walkIn', 'Walk-in'),
    },
    {
      title: t('retail.report.amount', 'Amount'),
      dataIndex: 'total_amount',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.paidAmount', 'Paid'),
      dataIndex: 'paid_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.dueAmount', 'Due'),
      dataIndex: 'due_amount',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.profit', 'Profit'),
      dataIndex: 'profit_amount',
      align: 'right',
      width: 130,
      render: (value: number) => (
        <Tag color={(value || 0) >= 0 ? 'green' : 'red'}>{money(value)}</Tag>
      ),
    },
  ];

  const subscriptionColumns: ColumnsType<ReportSubscription> = [
    {
      title: t('retail.report.business', 'Business'),
      dataIndex: ['business', 'companyName'],
      fixed: 'left',
      width: 220,
      render: (_: string, record) =>
        record.business?.companyName ||
        record.business_id ||
        t('retail.report.currentBusiness', 'Current business'),
    },
    {
      title: t('retail.report.plan', 'Plan'),
      dataIndex: ['plan', 'subscriptionName'],
      width: 180,
      render: (_: string, record) => record.plan?.subscriptionName || record.plan_id || '-',
    },
    {
      title: t('retail.report.status', 'Status'),
      dataIndex: 'payment_status',
      width: 110,
      render: (value: string) => <Tag color={statusColor(value)}>{value || '-'}</Tag>,
    },
    {
      title: t('retail.report.price', 'Price'),
      dataIndex: 'price',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.durationDays', 'Duration'),
      dataIndex: 'duration',
      align: 'right',
      width: 110,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.startedAt', 'Started'),
      dataIndex: 'started_at',
      width: 130,
      render: (value: string, record) =>
        (value || record.subscriptionDate || record.created_at)?.slice(0, 10) || '-',
    },
    {
      title: t('retail.report.expiresAt', 'Expires'),
      dataIndex: 'expires_at',
      width: 130,
      render: (value: string) => value?.slice(0, 10) || '-',
    },
    {
      title: t('retail.report.gateway', 'Gateway'),
      dataIndex: ['gateway', 'name'],
      width: 150,
      render: (_: string, record) => record.gateway?.name || record.gateway_id || '-',
    },
  ];

  const fieldCatalogColumns: ColumnsType<ReportFieldGroup> = [
    {
      title: t('retail.report.fieldGroup', 'Group'),
      dataIndex: 'label',
      width: 220,
      fixed: 'left',
      render: (value: string, record) => value || record.key,
    },
    {
      title: t('retail.report.key', 'Key'),
      dataIndex: 'key',
      width: 260,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: t('retail.report.fields', 'Fields'),
      dataIndex: 'fields',
      align: 'right',
      width: 110,
      render: (value: ReportFieldDefinition[]) => number(value?.length || 0),
    },
    {
      title: t('retail.report.sampleFields', 'Sample fields'),
      dataIndex: 'fields',
      render: (value: ReportFieldDefinition[]) => (
        <Space size={4} wrap>
          {(value || []).slice(0, 4).map((field) => (
            <Tag key={field.key}>{field.key}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  const fieldColumns: ColumnsType<ReportFieldDefinition> = [
    {
      title: t('retail.report.field', 'Field'),
      dataIndex: 'label',
      width: 220,
      render: (value: string, record) => value || record.key,
    },
    {
      title: t('retail.report.key', 'Key'),
      dataIndex: 'key',
      width: 260,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: t('retail.report.type', 'Type'),
      dataIndex: 'type',
      width: 140,
      render: (value: string) => <Tag color="geekblue">{value || 'string'}</Tag>,
    },
  ];

  const movementColumns: ColumnsType<ReportProductHistoryItem> = [
    {
      title: t('retail.report.item', 'Item'),
      dataIndex: 'item_name',
      fixed: 'left',
      width: 220,
      render: (value: string, record) => value || record.item_code || record.item_id,
    },
    {
      title: t('retail.report.code', 'Code'),
      dataIndex: 'item_code',
      width: 120,
    },
    {
      title: t('retail.report.saleQty', 'Sale qty'),
      dataIndex: 'sale_quantity',
      align: 'right',
      width: 110,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.saleAmount', 'Sale amount'),
      dataIndex: 'sale_amount',
      align: 'right',
      width: 140,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.purchaseQty', 'Purchase qty'),
      dataIndex: 'purchase_quantity',
      align: 'right',
      width: 120,
      render: (value: number) => number(value),
    },
    {
      title: t('retail.report.purchaseAmount', 'Purchase amount'),
      dataIndex: 'purchase_amount',
      align: 'right',
      width: 150,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.profit', 'Profit'),
      dataIndex: 'profit_amount',
      align: 'right',
      width: 120,
      render: (value: number) => (
        <span style={{ color: (value || 0) >= 0 ? profitColor : dangerColor }}>{money(value)}</span>
      ),
    },
    {
      title: t('retail.report.lastMovement', 'Last movement'),
      dataIndex: 'last_movement_at',
      width: 150,
      render: (value: string, record) => (
        <Space size={4}>
          <span>{value?.slice(0, 10) || '-'}</span>
          {record.last_movement_source && (
            <Tag color={record.last_movement_source === 'sale' ? 'green' : 'orange'}>
              {record.last_movement_source === 'sale'
                ? t('retail.report.sale', 'Sale')
                : t('retail.report.purchase', 'Purchase')}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('retail.report.operate', 'Operate'),
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => loadMovementDetail(record)}
        >
          {t('retail.report.view', 'View')}
        </Button>
      ),
    },
  ];

  const movementDetailColumns: ColumnsType<ReportProductHistoryLine> = [
    {
      title: t('retail.report.documentNo', 'Document no.'),
      dataIndex: 'document_no',
      fixed: 'left',
      width: 150,
    },
    {
      title: t('retail.report.date', 'Date'),
      dataIndex: 'occurred_at',
      width: 130,
      render: (value: string) => value?.slice(0, 10),
    },
    {
      title: t('retail.report.party', 'Party'),
      dataIndex: 'partner_name',
      width: 160,
    },
    {
      title: t('retail.report.batch', 'Batch'),
      dataIndex: 'batch_code',
      width: 120,
    },
    {
      title: t('retail.report.quantity', 'Quantity'),
      dataIndex: 'quantity',
      align: 'right',
      width: 110,
      render: (value: number) => number(value),
    },
    {
      title:
        detailKind === 'sale'
          ? t('retail.report.unitPrice', 'Unit price')
          : t('retail.report.unitCost', 'Unit cost'),
      dataIndex: detailKind === 'sale' ? 'unit_price' : 'unit_cost',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.lineTotal', 'Line total'),
      dataIndex: 'line_subtotal',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.report.profit', 'Profit'),
      dataIndex: 'profit_amount',
      align: 'right',
      width: 120,
      render: (value: number) =>
        detailKind === 'sale' ? (
          <span style={{ color: (value || 0) >= 0 ? profitColor : dangerColor }}>
            {money(value)}
          </span>
        ) : (
          '-'
        ),
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
            <RangePicker
              key="custom-range"
              onChange={(_, dateStrings) => setCustomRange(dateStrings as [string, string])}
            />
          )}
          <Select
            allowClear
            value={branchRef}
            showSearch
            optionFilterProp="label"
            onChange={(value) => setBranchRef(value || '')}
            options={branchOptions}
            placeholder={t('retail.report.branchRef', 'Branch ref')}
            style={{ width: 180 }}
          />
          <Button
            icon={<FilterOutlined />}
            type="primary"
            loading={loading}
            disabled={customRangeMissing}
            onClick={loadOverview}
          >
            {t('retail.report.apply', 'Apply')}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            disabled={customRangeMissing}
            onClick={loadOverview}
          >
            {t('retail.report.refresh', 'Refresh')}
          </Button>
        </Space>
      </div>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        {primaryMetrics.map(renderMetric)}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {balanceMetrics.map(renderMetric)}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {dueMetrics.map(renderMetric)}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        {stockMetrics.map(renderMetric)}
      </Row>

      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <FileTextOutlined />
            <strong>{t('retail.report.directory', 'Report directory')}</strong>
          </Space>
          <Tag color="blue">{reportShortcuts.length}</Tag>
        </div>
        <Row gutter={[12, 12]}>
          {reportShortcuts.map((shortcut) => (
            <Col key={shortcut.key} xs={24} sm={12} lg={8} xl={6}>
              <div style={shortcutStyle}>
                <Space direction="vertical" size={6}>
                  <Space>
                    <FileTextOutlined />
                    <strong>{shortcut.title}</strong>
                  </Space>
                  <div style={shortcutDescriptionStyle}>{shortcut.description}</div>
                  <Space size={6} wrap>
                    {shortcut.tag && <Tag color="geekblue">{shortcut.tag}</Tag>}
                    {typeof shortcut.value === 'number' && <Tag>{money(shortcut.value)}</Tag>}
                  </Space>
                </Space>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => openReportShortcut(shortcut)}
                >
                  {t('retail.report.open', 'Open')}
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div id="profit-loss-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <LineChartOutlined />
            <strong>{t('retail.report.profitLoss', 'Profit and loss')}</strong>
          </Space>
          <span>
            {profitLoss?.from_date?.slice(0, 10)} - {profitLoss?.to_date?.slice(0, 10)}
          </span>
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.grossSales', 'Gross sales')}
              value={profitLoss?.grossSaleProfit || 0}
              precision={2}
              valueStyle={{ color: positiveColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.grossIncomeProfit', 'Gross income')}
              value={profitLoss?.grossIncomeProfit || 0}
              precision={2}
              valueStyle={{ color: profitColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.totalExpenses', 'Total expenses')}
              value={profitLoss?.totalExpenses || 0}
              precision={2}
              valueStyle={{ color: dangerColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.netProfit', 'Net profit')}
              value={profitLoss?.netProfit || 0}
              precision={2}
              valueStyle={{ color: (profitLoss?.netProfit || 0) >= 0 ? profitColor : dangerColor }}
            />
          </Col>
        </Row>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={8}>
            <Statistic
              title={t('retail.report.cardGrossProfit', 'All-time gross')}
              value={profitLoss?.cardGrossProfit || 0}
              precision={2}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={t('retail.report.totalCardExpenses', 'All-time expenses')}
              value={profitLoss?.totalCardExpenses || 0}
              precision={2}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title={t('retail.report.cardNetProfit', 'All-time net')}
              value={profitLoss?.cardNetProfit || 0}
              precision={2}
              valueStyle={{
                color: (profitLoss?.cardNetProfit || 0) >= 0 ? profitColor : dangerColor,
              }}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={13}>
            <Table<ReportProfitLossRow>
              rowKey={(record) => `${record.date || 'date'}-${record.type || 'row'}`}
              size="small"
              loading={loading}
              columns={profitIncomeColumns}
              dataSource={profitIncomeRows}
              pagination={false}
              scroll={{ x: 520 }}
            />
          </Col>
          <Col xs={24} xl={11}>
            <Table<ReportProfitLossRow>
              rowKey={(record) => `${record.date || 'date'}-${record.type || 'row'}`}
              size="small"
              loading={loading}
              columns={profitExpenseColumns}
              dataSource={profitExpenseRows}
              pagination={false}
              scroll={{ x: 420 }}
            />
          </Col>
        </Row>
      </div>

      <div id="cash-flow-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <WalletOutlined />
            <strong>{t('retail.report.cashFlow', 'Cash flow')}</strong>
          </Space>
          <span>
            {cashFlow?.from_date?.slice(0, 10)} - {cashFlow?.to_date?.slice(0, 10)}
          </span>
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.cashIn', 'Cash in')}
              value={cashFlow?.cash_in || 0}
              precision={2}
              valueStyle={{ color: profitColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.cashOut', 'Cash out')}
              value={cashFlow?.cash_out || 0}
              precision={2}
              valueStyle={{ color: dangerColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.runningCash', 'Running cash')}
              value={cashFlow?.running_cash || 0}
              precision={2}
              valueStyle={{ color: (cashFlow?.running_cash || 0) >= 0 ? profitColor : dangerColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.openingBalance', 'Opening balance')}
              value={cashFlow?.initial_running_cash || 0}
              precision={2}
            />
          </Col>
        </Row>
        <Table<ReportCashFlowRow>
          rowKey="id"
          size="small"
          loading={loading}
          columns={cashFlowColumns}
          dataSource={cashFlowRows}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1120 }}
        />
      </div>

      <div id="balance-sheet-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <BankOutlined />
            <strong>{t('retail.report.balanceSheet', 'Balance sheet')}</strong>
          </Space>
          <span>
            {balanceSheet?.from_date?.slice(0, 10)} - {balanceSheet?.to_date?.slice(0, 10)}
          </span>
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.totalAssets', 'Total assets')}
              value={balanceSheet?.total_asset || 0}
              precision={2}
              valueStyle={{ color: positiveColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.stockAssets', 'Stock assets')}
              value={balanceSheet?.total_stock_value || 0}
              precision={2}
              valueStyle={{ color: profitColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.bankAssets', 'Bank assets')}
              value={balanceSheet?.total_bank_balance || 0}
              precision={2}
              valueStyle={{ color: positiveColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.assetRows', 'Asset rows')}
              value={balanceSheetRows.length}
            />
          </Col>
        </Row>
        <Table<ReportBalanceSheetAsset>
          rowKey={(record) => `${record.source || 'asset'}-${record.id}`}
          size="small"
          loading={loading}
          columns={balanceSheetColumns}
          dataSource={balanceSheetRows}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1230 }}
        />
      </div>

      <div id="trend-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <BarChartOutlined />
            <strong>{t('retail.report.trend', 'Trend')}</strong>
          </Space>
          <span>
            {overview?.from_date?.slice(0, 10)} - {overview?.to_date?.slice(0, 10)}
          </span>
        </div>
        <Table<ReportSeriesPoint>
          rowKey="date"
          size="small"
          loading={loading}
          columns={seriesColumns}
          dataSource={series}
          pagination={false}
          scroll={{ x: 1080 }}
        />
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={13}>
          <div id="top-items-report-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Space>
                <BarChartOutlined />
                <strong>{t('retail.report.topItems', 'Top items')}</strong>
              </Space>
              <Tag color="blue">{money(summary.sales_total)}</Tag>
            </div>
            <Table<ReportItemMetric>
              rowKey="item_id"
              size="small"
              loading={loading}
              columns={topItemColumns}
              dataSource={topItems}
              pagination={false}
              scroll={{ x: 720 }}
            />
          </div>
        </Col>
        <Col xs={24} xl={11}>
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Space>
                <WarningOutlined />
                <strong>{t('retail.report.lowStockItems', 'Low-stock items')}</strong>
              </Space>
              <Tag color={lowStockItems.length ? 'red' : 'green'}>{lowStockItems.length}</Tag>
            </div>
            <Table<ReportStockWarning>
              rowKey="item_id"
              size="small"
              loading={loading}
              columns={lowStockColumns}
              dataSource={lowStockItems}
              pagination={false}
              scroll={{ x: 720 }}
            />
          </div>
        </Col>
      </Row>

      <div id="bill-wise-profit-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <FileTextOutlined />
            <strong>{t('retail.report.billWiseProfit', 'Bill-wise profit')}</strong>
          </Space>
          <span>
            {billProfit?.from_date?.slice(0, 10)} - {billProfit?.to_date?.slice(0, 10)}
          </span>
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.totalSalesAmount', 'Total sales amount')}
              value={billProfit?.total_amount || 0}
              precision={2}
              valueStyle={{ color: positiveColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.billProfit', 'Bill profit')}
              value={billProfit?.total_bill_profit || 0}
              precision={2}
              valueStyle={{ color: profitColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.billLoss', 'Bill loss')}
              value={billProfit?.total_bill_loss || 0}
              precision={2}
              valueStyle={{ color: dangerColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.netProfit', 'Net profit')}
              value={billProfit?.net_profit || 0}
              precision={2}
              valueStyle={{ color: (billProfit?.net_profit || 0) >= 0 ? profitColor : dangerColor }}
            />
          </Col>
        </Row>
        <Table<ReportBillWiseProfitBill>
          rowKey="id"
          size="small"
          loading={loading}
          columns={billProfitColumns}
          dataSource={billProfitRows}
          expandable={{
            expandedRowRender: (record) => (
              <Table<ReportBillWiseProfitLine>
                rowKey="id"
                size="small"
                columns={billLineColumns}
                dataSource={record.lines || []}
                pagination={false}
                scroll={{ x: 840 }}
              />
            ),
            rowExpandable: (record) => !!record.lines?.length,
          }}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 950 }}
        />
      </div>

      <div id="subscription-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <CrownOutlined />
            <strong>{t('retail.report.subscriptionReport', 'Subscription report')}</strong>
          </Space>
          <Tag color="blue">{subscriptionRows.length}</Tag>
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.subscriptionRevenue', 'Subscription revenue')}
              value={subscriptionRevenue}
              precision={2}
              valueStyle={{ color: positiveColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.paidSubscriptions', 'Paid subscriptions')}
              value={paidSubscriptions}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.pendingSubscriptions', 'Pending subscriptions')}
              value={pendingSubscriptions}
              valueStyle={{ color: pendingSubscriptions ? warningColor : undefined }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.expiringSubscriptions', 'Expiring soon')}
              value={expiringSubscriptions}
              valueStyle={{ color: expiringSubscriptions ? dangerColor : undefined }}
            />
          </Col>
        </Row>
        <Table<ReportSubscription>
          rowKey="id"
          size="small"
          loading={loading}
          columns={subscriptionColumns}
          dataSource={subscriptionRows}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1150 }}
        />
      </div>

      <div id="field-catalog-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <FileTextOutlined />
            <strong>{t('retail.report.fieldCatalog', 'Field catalog')}</strong>
          </Space>
          <Space>
            <Tag color="blue">{fieldCatalogGroups.length}</Tag>
            <Tag color="geekblue">{fieldCatalogCount}</Tag>
          </Space>
        </div>
        <Table<ReportFieldGroup>
          rowKey="key"
          size="small"
          loading={loading}
          columns={fieldCatalogColumns}
          dataSource={fieldCatalogGroups}
          expandable={{
            expandedRowRender: (record) => (
              <Table<ReportFieldDefinition>
                rowKey={(field) => `${record.key}-${field.key}`}
                size="small"
                columns={fieldColumns}
                dataSource={record.fields || []}
                pagination={false}
                scroll={{ x: 620 }}
              />
            ),
            rowExpandable: (record) => !!record.fields?.length,
          }}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 920 }}
        />
      </div>

      <div id="product-movement-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <SwapOutlined />
            <strong>{t('retail.report.productMovementHistory', 'Product movement history')}</strong>
          </Space>
          <Segmented
            value={movementKind}
            onChange={(value) => setMovementKind(value as ProductMovementKind)}
            options={[
              { label: t('retail.report.sale', 'Sale'), value: 'sale' },
              { label: t('retail.report.purchase', 'Purchase'), value: 'purchase' },
            ]}
          />
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.saleQty', 'Sale qty')}
              value={activeMovement?.total_sale_qty || 0}
              precision={2}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.saleAmount', 'Sale amount')}
              value={activeMovement?.total_sale_amount || 0}
              precision={2}
              valueStyle={{ color: profitColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.purchaseQty', 'Purchase qty')}
              value={activeMovement?.total_purchase_qty || 0}
              precision={2}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.purchaseAmount', 'Purchase amount')}
              value={activeMovement?.total_purchase_amount || 0}
              precision={2}
              valueStyle={{ color: warningColor }}
            />
          </Col>
        </Row>
        <Table<ReportProductHistoryItem>
          rowKey="item_id"
          size="small"
          loading={loading}
          columns={movementColumns}
          dataSource={movementRows}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1220 }}
        />
      </div>

      <div id="tax-report-section" style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <Space>
            <AuditOutlined />
            <strong>{t('retail.report.taxReport', 'Tax report')}</strong>
          </Space>
          <span>
            {taxReport?.from_date?.slice(0, 10)} - {taxReport?.to_date?.slice(0, 10)}
          </span>
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.salesTax', 'Sales tax')}
              value={taxReport?.sales_total_tax || 0}
              precision={2}
              valueStyle={{ color: profitColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.purchaseTax', 'Purchase tax')}
              value={taxReport?.purchases_total_tax || 0}
              precision={2}
              valueStyle={{ color: warningColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.netTax', 'Net tax')}
              value={taxReport?.net_tax || 0}
              precision={2}
              valueStyle={{ color: (taxReport?.net_tax || 0) >= 0 ? profitColor : dangerColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.taxableDocuments', 'Taxable documents')}
              value={taxRows.length}
            />
          </Col>
        </Row>
        <Table<ReportTaxDocument>
          rowKey={(record) => `${record.source || 'tax'}-${record.id}`}
          size="small"
          loading={loading}
          columns={taxColumns}
          dataSource={taxRows}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1060 }}
        />
      </div>

      <Drawer
        width={920}
        open={!!movementDetail}
        onClose={() => setMovementDetail(undefined)}
        title={
          <Space>
            <SwapOutlined />
            <span>{movementDetail?.item?.item_name || movementDetail?.item?.item_code}</span>
            <Tag color={detailKind === 'sale' ? 'green' : 'orange'}>
              {detailKind === 'sale'
                ? t('retail.report.sale', 'Sale')
                : t('retail.report.purchase', 'Purchase')}
            </Tag>
          </Space>
        }
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.quantity', 'Quantity')}
              value={movementDetail?.total_quantities || 0}
              precision={2}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.saleAmount', 'Sale amount')}
              value={movementDetail?.total_sale_price || 0}
              precision={2}
              valueStyle={{ color: profitColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.purchaseAmount', 'Purchase amount')}
              value={movementDetail?.total_purchase_price || 0}
              precision={2}
              valueStyle={{ color: warningColor }}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <Statistic
              title={t('retail.report.profit', 'Profit')}
              value={movementDetail?.total_profit || 0}
              precision={2}
              valueStyle={{
                color: (movementDetail?.total_profit || 0) >= 0 ? profitColor : dangerColor,
              }}
            />
          </Col>
        </Row>
        <Table<ReportProductHistoryLine>
          rowKey="id"
          size="small"
          loading={detailLoading}
          columns={movementDetailColumns}
          dataSource={movementDetail?.lines || []}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 960 }}
        />
      </Drawer>
    </PageContainer>
  );
};

export default ReportPage;
