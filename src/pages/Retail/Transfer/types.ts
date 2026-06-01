import type { CatalogSite } from '../Catalog/types';

export type RetailTransferLine = {
  id: string;
  transfer_id?: string;
  item_id?: string;
  item_name?: string;
  item_code?: string;
  from_lot_id?: string;
  to_lot_id?: string;
  batch_code?: string;
  variant_name?: string;
  quantity?: number;
  unit_cost?: number;
  line_cost?: number;
  from_quantity?: number;
  to_quantity?: number;
};

export type RetailTransfer = {
  id: string;
  created_at?: string;
  updated_at?: string;
  transfer_no?: string;
  from_storage_site_id?: string;
  from_storage_site?: CatalogSite;
  to_storage_site_id?: string;
  to_storage_site?: CatalogSite;
  from_branch_id?: string;
  to_branch_id?: string;
  branch_ref?: string;
  status?: 'posted' | 'voided';
  transferred_at?: string;
  total_quantity?: number;
  total_cost?: number;
  note?: string;
  lines?: RetailTransferLine[];
};

export type RetailTransferListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailTransfer[];
};

export type RetailTransferLineRequest = {
  from_lot_id?: string;
  to_storage_site_id?: string;
  quantity?: number;
};

export type RetailTransferRequest = {
  transfer_no?: string;
  to_storage_site_id?: string;
  from_branch_id?: string;
  to_branch_id?: string;
  branch_ref?: string;
  note?: string;
  lines?: RetailTransferLineRequest[];
};

export type TransferFormValues = {
  from_branch_id?: string;
  to_branch_id?: string;
  branch_ref?: string;
  from_lot_id?: string;
  to_storage_site_id?: string;
  quantity?: number;
  note?: string;
};
