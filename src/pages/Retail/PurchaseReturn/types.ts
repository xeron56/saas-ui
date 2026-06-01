import type { CatalogBranch } from '../Catalog/types';
import type { RetailPartner } from '../Party/types';
import type { RetailPurchase, RetailPurchaseLine } from '../Purchase/types';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import type { JsonMap, RetailTender, RetailTenderRequest } from '../Sale/types';

export type RetailPurchaseReturnLineRequest = {
  line_id?: string;
  quantity?: number;
};

export type RetailPurchaseReturnRequest = {
  receipt_id?: string;
  purchase_id?: string;
  returned_at?: string;
  note?: string;
  meta?: JsonMap;
  lines?: RetailPurchaseReturnLineRequest[];
  tenders?: RetailTenderRequest[];
};

export type RetailPurchaseReturnLine = {
  id: string;
  receipt_line_id?: string;
  item_id?: string;
  lot_id?: string;
  item_name?: string;
  item_code?: string;
  batch_code?: string;
  variant_name?: string;
  quantity?: number;
  unit_cost?: number;
  gross_amount?: number;
  discount_amount?: number;
  return_amount?: number;
};

export type RetailPurchaseReturn = {
  id: string;
  created_at?: string;
  updated_at?: string;
  return_no?: string;
  receipt_id?: string;
  receipt_no?: string;
  supplier_id?: string;
  supplier?: RetailPartner;
  branch_ref?: string;
  status?: 'posted' | 'voided';
  returned_at?: string;
  gross_amount?: number;
  discount_amount?: number;
  return_amount?: number;
  paid_amount?: number;
  due_reduced_amount?: number;
  wallet_reduced_amount?: number;
  note?: string;
  meta?: JsonMap;
  lines?: RetailPurchaseReturnLine[];
  tenders?: RetailTender[];
};

export type RetailPurchaseReturnListReply = {
  total_size?: number;
  filter_size?: number;
  return_amount?: number;
  items?: RetailPurchaseReturn[];
};

export type PurchaseReturnLineOption = {
  label: string;
  value: string;
  receipt_id: string;
  item_name?: string;
  batch_code?: string;
  quantity?: number;
  unit_cost?: number;
};

export type PurchaseReturnLookupState = {
  branches: CatalogBranch[];
  purchases: RetailPurchase[];
  lineOptions: PurchaseReturnLineOption[];
  moneyAccounts: MoneyAccount[];
  paymentTypes: PaymentType[];
};

export type PurchaseLineByID = Record<string, RetailPurchaseLine>;
