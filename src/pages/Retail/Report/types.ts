export type ReportDuration =
  | 'today'
  | 'yesterday'
  | 'last_seven_days'
  | 'last_thirty_days'
  | 'current_month'
  | 'last_month'
  | 'current_year'
  | 'custom_date';

export type ReportSummary = {
  sales_total?: number;
  sale_return_total?: number;
  net_sales?: number;
  purchase_total?: number;
  purchase_return_total?: number;
  net_purchases?: number;
  income_total?: number;
  expense_total?: number;
  gross_profit?: number;
  gross_loss?: number;
  net_profit?: number;
  due_collection_total?: number;
  due_payment_total?: number;
  pending_cheque_total?: number;
  cash_balance?: number;
  bank_balance?: number;
  stock_value?: number;
  receivable_due?: number;
  payable_due?: number;
  item_count?: number;
  category_count?: number;
  customer_count?: number;
  supplier_count?: number;
  low_stock_count?: number;
};

export type ReportSeriesPoint = {
  date: string;
  sales?: number;
  sale_returns?: number;
  purchases?: number;
  purchase_returns?: number;
  income?: number;
  expense?: number;
  profit?: number;
};

export type ReportItemMetric = {
  item_id: string;
  item_name?: string;
  item_code?: string;
  quantity?: number;
  sales_total?: number;
  profit?: number;
};

export type ReportStockWarning = {
  item_id: string;
  item_name?: string;
  item_code?: string;
  quantity?: number;
  alert_quantity?: number;
  stock_value?: number;
};

export type ReportOverview = {
  from_date?: string;
  to_date?: string;
  bucket?: 'day' | 'month';
  summary?: ReportSummary;
  series?: ReportSeriesPoint[];
  top_items?: ReportItemMetric[];
  low_stock_items?: ReportStockWarning[];
};

export type ReportTaxDocument = {
  id: string;
  source?: 'sale' | 'purchase';
  document_no?: string;
  partner_id?: string;
  partner_name?: string;
  partner_kind?: string;
  occurred_at?: string;
  subtotal_amount?: number;
  discount_amount?: number;
  total_amount?: number;
  actual_amount?: number;
  tax_amount?: number;
  tax_percent?: number;
};

export type ReportTaxReport = {
  from_date?: string;
  to_date?: string;
  sales?: ReportTaxDocument[];
  purchases?: ReportTaxDocument[];
  sales_total_amount?: number;
  sales_total_discount?: number;
  sales_total_tax?: number;
  purchases_total_amount?: number;
  purchases_total_discount?: number;
  purchases_total_tax?: number;
  net_tax?: number;
};

export type ReportCashFlowRow = {
  id: string;
  movement_no?: string;
  platform?: string;
  transaction_type?: string;
  type?: 'credit' | 'debit';
  amount?: number;
  date?: string;
  payment_type_id?: string;
  payment_type_name?: string;
  from_bank?: string;
  from_bank_name?: string;
  to_bank?: string;
  to_bank_name?: string;
  reference_id?: string;
  reference_kind?: string;
  reference_no?: string;
  invoice_no?: string;
  image?: string;
  note?: string;
  running_balance?: number;
};

export type ReportCashFlow = {
  from_date?: string;
  to_date?: string;
  cash_in?: number;
  cash_out?: number;
  running_cash?: number;
  initial_running_cash?: number;
  data?: ReportCashFlowRow[];
};

export type ReportBalanceSheetAsset = {
  id: string;
  source?: 'product' | 'bank';
  name?: string;
  item_code?: string;
  item_kind?: string;
  created_at?: string;
  quantity?: number;
  stock_value?: number;
  account_kind?: string;
  balance?: number;
  opening_balance?: number;
  opening_date?: string;
};

export type ReportBalanceSheet = {
  from_date?: string;
  to_date?: string;
  asset_datas?: ReportBalanceSheetAsset[];
  total_stock_value?: number;
  total_bank_balance?: number;
  total_asset?: number;
};

export type ReportBillWiseProfitLine = {
  id: string;
  item_id?: string;
  item_name?: string;
  item_code?: string;
  quantity?: number;
  unit_price?: number;
  purchase_cost?: number;
  line_subtotal?: number;
  profit_amount?: number;
};

export type ReportBillWiseProfitBill = {
  id: string;
  receipt_no?: string;
  partner_id?: string;
  partner_name?: string;
  partner_kind?: string;
  sold_at?: string;
  subtotal_amount?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  actual_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  profit_amount?: number;
  bill_profit?: number;
  bill_loss?: number;
  lines?: ReportBillWiseProfitLine[];
};

export type ReportBillWiseProfit = {
  from_date?: string;
  to_date?: string;
  data?: ReportBillWiseProfitBill[];
  total_amount?: number;
  total_bill_profit?: number;
  total_bill_loss?: number;
  net_profit?: number;
  profit_bills?: number;
  loss_bills?: number;
  neutral_bills?: number;
};

export type ReportProfitLossRow = {
  type?: 'Sale' | 'Income' | 'Expense' | 'Payroll';
  date?: string;
  total_sales?: number;
  total_incomes?: number;
  total_expenses?: number;
};

export type ReportProfitLoss = {
  from_date?: string;
  to_date?: string;
  mergedIncomeSaleData?: ReportProfitLossRow[];
  mergedExpenseData?: ReportProfitLossRow[];
  grossSaleProfit?: number;
  grossIncomeProfit?: number;
  totalExpenses?: number;
  netProfit?: number;
  cardGrossProfit?: number;
  totalCardExpenses?: number;
  cardNetProfit?: number;
};

export type ReportProductHistoryItem = {
  item_id: string;
  item_name?: string;
  item_code?: string;
  sale_quantity?: number;
  purchase_quantity?: number;
  sale_amount?: number;
  purchase_amount?: number;
  profit_amount?: number;
  last_movement_at?: string;
  last_movement_no?: string;
  last_movement_source?: 'sale' | 'purchase';
};

export type ReportProductHistory = {
  from_date?: string;
  to_date?: string;
  data?: ReportProductHistoryItem[];
  total_purchase_qty?: number;
  total_sale_qty?: number;
  total_purchase_amount?: number;
  total_sale_amount?: number;
  total_profit?: number;
};

export type ReportSubscriptionPlan = {
  id?: string;
  subscriptionName?: string;
};

export type ReportSubscriptionBusiness = {
  id?: string;
  companyName?: string;
  business_category_id?: string;
  pictureUrl?: string;
  category?: {
    id?: string;
    name?: string;
  };
};

export type ReportSubscriptionGateway = {
  id?: string;
  name?: string;
};

export type ReportSubscription = {
  id: string;
  plan_id?: string;
  business_id?: string;
  gateway_id?: string;
  price?: number;
  payment_status?: string;
  duration?: number;
  allow_multibranch?: number;
  subdomain_limit?: number;
  subscriptionDate?: string;
  started_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  plan?: ReportSubscriptionPlan;
  business?: ReportSubscriptionBusiness;
  gateway?: ReportSubscriptionGateway;
};

export type ReportSubscriptionReport = {
  data?: ReportSubscription[];
};

export type ReportProductHistoryLine = {
  id: string;
  document_id?: string;
  document_no?: string;
  source?: 'sale' | 'purchase';
  partner_id?: string;
  partner_name?: string;
  partner_kind?: string;
  occurred_at?: string;
  item_id?: string;
  item_name?: string;
  item_code?: string;
  lot_id?: string;
  batch_code?: string;
  variant_name?: string;
  quantity?: number;
  unit_price?: number;
  unit_cost?: number;
  purchase_cost?: number;
  line_subtotal?: number;
  profit_amount?: number;
};

export type ReportProductHistoryDetail = {
  from_date?: string;
  to_date?: string;
  item?: ReportProductHistoryItem;
  lines?: ReportProductHistoryLine[];
  total_quantities?: number;
  total_sale_price?: number;
  total_purchase_price?: number;
  total_profit?: number;
};

export type ReportFieldDefinition = {
  key: string;
  label?: string;
  type?: string;
};

export type ReportFieldGroup = {
  key: string;
  label?: string;
  fields?: ReportFieldDefinition[];
};

export type ReportFieldCatalog = {
  groups?: ReportFieldGroup[];
};

export type ReportCustomTemplate = {
  slug: string;
  name?: string;
  description?: string;
  source_key?: string;
  source_label?: string;
  route_path?: string;
  default_fields?: string[];
  fields?: ReportFieldDefinition[];
  active?: boolean;
};

export type ReportCustomTemplateList = {
  data?: ReportCustomTemplate[];
  items?: ReportCustomTemplate[];
};

export type ReportCustomTemplateReply = {
  data?: ReportCustomTemplate;
};
