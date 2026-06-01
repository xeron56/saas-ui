import type { RetailPartner } from '../Party/types';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import type { JsonMap, RetailTender, RetailTenderRequest } from '../Sale/types';

export type DueCollectionMode = 'customer' | 'supplier' | 'walk_in';

export type RetailDueCollectionRequest = {
  partner_id?: string;
  sale_id?: string;
  purchase_id?: string;
  branch_ref?: string;
  settled_at?: string;
  note?: string;
  meta?: JsonMap;
  tenders?: RetailTenderRequest[];
};

export type RetailDueInvoice = {
  id: string;
  kind?: 'sale' | 'purchase';
  invoice_no?: string;
  partner_id?: string;
  partner?: RetailPartner;
  branch_ref?: string;
  status?: string;
  invoice_date?: string;
  total_amount?: number;
  actual_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  source_caption?: string;
};

export type RetailDueCollection = {
  id: string;
  created_at?: string;
  updated_at?: string;
  settlement_no?: string;
  partner_id?: string;
  partner?: RetailPartner;
  sale_id?: string;
  purchase_id?: string;
  invoice?: RetailDueInvoice;
  branch_ref?: string;
  settlement_kind?: 'customer_collection' | 'supplier_payment';
  status?: 'posted' | 'voided';
  settled_at?: string;
  previous_due_amount?: number;
  settled_amount?: number;
  pending_amount?: number;
  remaining_due_amount?: number;
  wallet_paid_amount?: number;
  note?: string;
  meta?: JsonMap;
  tenders?: RetailTender[];
};

export type RetailDueCollectionListReply = {
  total_size?: number;
  filter_size?: number;
  settled_amount?: number;
  pending_amount?: number;
  remaining_due?: number;
  items?: RetailDueCollection[];
};

export type RetailOpenDueInvoiceReply = {
  total_receivable?: number;
  items?: RetailDueInvoice[];
};

export type DueCollectionLookupState = {
  partners: RetailPartner[];
  moneyAccounts: MoneyAccount[];
  paymentTypes: PaymentType[];
};
