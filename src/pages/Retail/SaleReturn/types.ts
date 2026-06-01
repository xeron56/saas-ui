import type { CatalogBranch } from '../Catalog/types';
import type { RetailPartner } from '../Party/types';
import type { RetailSale, RetailSaleLine } from '../Sale/types';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import type { JsonMap, RetailTender, RetailTenderRequest } from '../Sale/types';

export type RetailSaleReturnLineRequest = {
  line_id?: string;
  quantity?: number;
};

export type RetailSaleReturnRequest = {
  receipt_id?: string;
  sale_id?: string;
  returned_at?: string;
  note?: string;
  meta?: JsonMap;
  lines?: RetailSaleReturnLineRequest[];
  tenders?: RetailTenderRequest[];
};

export type RetailSaleReturnLine = {
  id: string;
  receipt_line_id?: string;
  item_id?: string;
  lot_id?: string;
  item_name?: string;
  item_code?: string;
  batch_code?: string;
  quantity?: number;
  unit_price?: number;
  purchase_cost?: number;
  gross_amount?: number;
  discount_amount?: number;
  return_amount?: number;
  profit_amount?: number;
};

export type RetailSaleReturn = {
  id: string;
  created_at?: string;
  updated_at?: string;
  return_no?: string;
  receipt_id?: string;
  receipt_no?: string;
  partner_id?: string;
  partner?: RetailPartner;
  branch_ref?: string;
  status?: 'posted' | 'voided';
  returned_at?: string;
  gross_amount?: number;
  discount_amount?: number;
  return_amount?: number;
  paid_amount?: number;
  due_reduced_amount?: number;
  wallet_credited_amount?: number;
  profit_reduced_amount?: number;
  note?: string;
  meta?: JsonMap;
  lines?: RetailSaleReturnLine[];
  tenders?: RetailTender[];
};

export type RetailSaleReturnListReply = {
  total_size?: number;
  filter_size?: number;
  return_amount?: number;
  items?: RetailSaleReturn[];
};

export type SaleReturnLookupState = {
  branches: CatalogBranch[];
  sales: RetailSale[];
  moneyAccounts: MoneyAccount[];
  paymentTypes: PaymentType[];
};

export type SaleLineByID = Record<string, RetailSaleLine>;
