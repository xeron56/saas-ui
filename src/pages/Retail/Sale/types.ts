import type { CatalogBranch, CatalogItem } from '../Catalog/types';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import type { RetailPartner } from '../Party/types';

export type JsonMap = Record<string, any>;

export type RetailSaleLineRequest = {
  item_id?: string;
  lot_id?: string;
  quantity?: number;
  unit_price?: number;
  discount_amount?: number;
};

export type RetailTenderRequest = {
  tender_kind?: 'cash' | 'wallet' | 'cheque' | 'bank' | 'card' | 'mobile' | 'sslcommerz';
  amount?: number;
  reference_no?: string;
  cheque_number?: string;
  payment_type_id?: string;
  payment_account_id?: string;
  meta?: JsonMap;
};

export type RetailSaleRequest = {
  partner_id?: string;
  branch_ref?: string;
  sold_at?: string;
  discount_amount?: number;
  discount_percent?: number;
  discount_mode?: 'flat' | 'percent';
  shipping_amount?: number;
  tax_amount?: number;
  tax_percent?: number;
  rounding_amount?: number;
  rounding_mode?: string;
  image_ref?: string;
  note?: string;
  meta?: JsonMap;
  lines?: RetailSaleLineRequest[];
  tenders?: RetailTenderRequest[];
};

export type RetailSaleLine = RetailSaleLineRequest & {
  id: string;
  item_name?: string;
  item_code?: string;
  batch_code?: string;
  purchase_cost?: number;
  line_subtotal?: number;
  profit_amount?: number;
};

export type RetailTender = RetailTenderRequest & {
  id: string;
  status?: string;
  paid_at?: string;
};

export type RetailSale = RetailSaleRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  receipt_no?: string;
  partner?: RetailPartner;
  status?: 'posted' | 'voided';
  subtotal_amount?: number;
  total_amount?: number;
  actual_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  change_amount?: number;
  profit_amount?: number;
  lines?: RetailSaleLine[];
  tenders?: RetailTender[];
};

export type RetailSaleListReply = {
  total_size?: number;
  filter_size?: number;
  total_amount?: number;
  due_amount?: number;
  items?: RetailSale[];
};

export type LotOption = {
  label: string;
  value: string;
  item_id: string;
  item_name: string;
  batch_code?: string;
  sale_price?: number;
  available_stock?: number;
};

export type LookupState = {
  branches: CatalogBranch[];
  items: CatalogItem[];
  partners: RetailPartner[];
  lotOptions: LotOption[];
  moneyAccounts: MoneyAccount[];
  paymentTypes: PaymentType[];
};
