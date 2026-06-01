import type { RetailPartner, RetailPartnerLedgerLine } from '../Party/types';
import type { ReportDuration } from '../Report/types';

export type { ReportDuration };

export type PartyReportParams = {
  duration?: ReportDuration;
  from_date?: string;
  to_date?: string;
  branch_ref?: string;
  search?: string;
  partner_id?: string;
  page_offset?: number;
  page_size?: number;
  limit?: number;
};

export type PartyLedgerSummary = {
  partner_count?: number;
  opening_balance?: number;
  debit_amount?: number;
  credit_amount?: number;
  closing_balance?: number;
  due_balance?: number;
  wallet_balance?: number;
};

export type PartyLedgerPartner = {
  partner_id: string;
  partner_name?: string;
  partner_code?: string;
  kind?: 'customer' | 'supplier';
  segment?: string;
  phone?: string;
  branch_ref?: string;
  opening_balance?: number;
  debit_amount?: number;
  credit_amount?: number;
  closing_balance?: number;
  due_balance?: number;
  wallet_balance?: number;
  line_count?: number;
  last_activity_at?: string;
};

export type PartyLedgerReport = {
  from_date?: string;
  to_date?: string;
  kind?: 'customer' | 'supplier';
  summary?: PartyLedgerSummary;
  partners?: PartyLedgerPartner[];
  partner?: RetailPartner;
  items?: RetailPartnerLedgerLine[];
};

export type PartyMetric = {
  partner_id: string;
  partner_name?: string;
  partner_code?: string;
  kind?: 'customer' | 'supplier';
  branch_ref?: string;
  document_count?: number;
  gross_amount?: number;
  return_amount?: number;
  net_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  profit_amount?: number;
  last_document_at?: string;
};

export type PartyMetricReport = {
  from_date?: string;
  to_date?: string;
  kind?: 'customer' | 'supplier';
  items?: PartyMetric[];
  total_amount?: number;
  total_returns?: number;
  net_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  profit_amount?: number;
};

export type PartyProfitLossRow = {
  partner_id: string;
  partner_name?: string;
  partner_code?: string;
  kind?: 'customer' | 'supplier';
  segment?: string;
  branch_ref?: string;
  document_count?: number;
  sales_amount?: number;
  sale_return_amount?: number;
  net_sales?: number;
  purchase_amount?: number;
  purchase_return_amount?: number;
  net_purchases?: number;
  profit_amount?: number;
  loss_amount?: number;
  net_profit?: number;
  due_balance?: number;
  wallet_balance?: number;
};

export type PartyProfitLossReport = {
  from_date?: string;
  to_date?: string;
  items?: PartyProfitLossRow[];
  total_sales?: number;
  total_sale_returns?: number;
  net_sales?: number;
  total_purchases?: number;
  total_purchase_returns?: number;
  net_purchases?: number;
  total_profit?: number;
  total_loss?: number;
  net_profit?: number;
  receivable_due?: number;
  payable_due?: number;
};
