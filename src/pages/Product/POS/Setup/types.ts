export type POSSetupKind =
  | 'units'
  | 'brands'
  | 'categories'
  | 'vats'
  | 'payment-types'
  | 'branches'
  | 'warehouses'
  | 'product-models'
  | 'variations'
  | 'shelves'
  | 'racks';

export type POSSetupRecord = {
  id: string;
  name?: string;
  label?: string;
  code?: string;
  unitName?: string;
  brandName?: string;
  categoryName?: string;
  rate?: number;
  branch_id?: string;
  branch?: { id: string; name?: string; label?: string };
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  is_main?: boolean;
  opening_balance?: number;
  balance?: number;
  current_balance?: number;
  branchOpeningBalance?: number;
  branchRemainingBalance?: number;
  opening_date?: string;
  show_in_invoice?: boolean;
  show_on_invoice?: boolean;
  sub_vat?: Array<{ id: string; name?: string; rate?: number }>;
  values?: string[] | unknown[];
  shelves?: Array<{ id: string; name?: string }>;
  variationCapacity?: number;
  variationColor?: number;
  variationSize?: number;
  variationType?: number;
  variationWeight?: number;
  status?: boolean | number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type POSSetupListReply = {
  message?: string;
  data?: POSSetupRecord[];
};

export type POSSetupReply = {
  message?: string;
  data?: POSSetupRecord;
};
