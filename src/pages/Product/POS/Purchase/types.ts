import type { CatalogBranch, CatalogItem } from '../Catalog/types';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import type { RetailPartner } from '../Party/types';
import type { JsonMap, RetailTender, RetailTenderRequest } from '../Sale/types';

export type RetailPurchaseLineRequest = {
  item_id?: string;
  lot_id?: string;
  storage_site_id?: string;
  batch_code?: string;
  variant_name?: string;
  quantity?: number;
  unit_cost?: number;
  purchase_cost?: number;
  sale_price?: number;
  wholesale_price?: number;
  dealer_price?: number;
  profit_percent?: number;
  mfg_date?: string;
  expire_date?: string;
  variation_data?: JsonMap;
  serial_numbers?: JsonMap;
};

export type RetailPurchaseRequest = {
  supplier_id?: string;
  supplier_invoice_no?: string;
  branch_ref?: string;
  purchased_at?: string;
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
  lines?: RetailPurchaseLineRequest[];
  tenders?: RetailTenderRequest[];
};

export type RetailPurchaseLine = RetailPurchaseLineRequest & {
  id: string;
  item_name?: string;
  item_code?: string;
  line_subtotal?: number;
};

export type RetailPurchase = RetailPurchaseRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  receipt_no?: string;
  supplier?: RetailPartner;
  status?: 'posted' | 'voided';
  subtotal_amount?: number;
  total_amount?: number;
  actual_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  change_amount?: number;
  lines?: RetailPurchaseLine[];
  tenders?: RetailTender[];
};

export type RetailPurchaseListReply = {
  total_size?: number;
  filter_size?: number;
  total_amount?: number;
  due_amount?: number;
  items?: RetailPurchase[];
};

export type PurchaseLotOption = {
  label: string;
  value: string;
  item_id: string;
  item_name: string;
  batch_code?: string;
  variant_name?: string;
  unit_cost?: number;
  sale_price?: number;
  wholesale_price?: number;
  dealer_price?: number;
  profit_percent?: number;
  storage_site_id?: string;
};

export type PurchaseLookupState = {
  branches: CatalogBranch[];
  items: CatalogItem[];
  suppliers: RetailPartner[];
  lotOptions: PurchaseLotOption[];
  moneyAccounts: MoneyAccount[];
  paymentTypes: PaymentType[];
};
