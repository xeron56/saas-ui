export type JsonMap = Record<string, any>;

export type CatalogItemKind = 'single' | 'variant' | 'bundle';

export type LookupItem = {
  id: string;
  code?: string;
  label: string;
  active?: boolean;
};

export type CatalogGroup = LookupItem & {
  track_capacity?: boolean;
  track_color?: boolean;
  track_size?: boolean;
  track_type?: boolean;
  track_weight?: boolean;
  low_stock_threshold?: number;
};

export type CatalogSite = LookupItem & {
  branch_id?: string;
  branch?: CatalogBranch;
  phone?: string;
  email?: string;
  address?: string;
};

export type CatalogBranch = LookupItem & {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  is_main?: boolean;
  status?: number;
  opening_balance?: number;
  current_balance?: number;
  branchOpeningBalance?: number;
  branchRemainingBalance?: number;
};

export type CatalogBin = LookupItem & {
  site_id?: string;
};

export type CatalogOption = LookupItem & {
  kind?: string;
  values?: JsonMap;
};

export type CatalogLot = {
  id?: string;
  storage_site_id?: string;
  batch_code?: string;
  variant_name?: string;
  variation_data?: JsonMap;
  serial_numbers?: JsonMap;
  quantity?: number;
  purchase_cost?: number;
  sale_price?: number;
  wholesale_price?: number;
  dealer_price?: number;
  profit_percent?: number;
  mfg_date?: string;
  expire_date?: string;
  active?: boolean;
};

export type CatalogStockLot = CatalogLot & {
  id: string;
  item_id: string;
  item_name?: string;
  item_code?: string;
  item_kind?: CatalogItemKind;
  unit?: LookupItem;
  brand?: LookupItem;
  group?: CatalogGroup;
  storage_site?: CatalogSite;
  item_quantity?: number;
  alert_quantity?: number;
  stock_value?: number;
  expired?: boolean;
  low_stock?: boolean;
};

export type CatalogStockAdjustmentRequest = {
  delta?: number;
};

export type CatalogImportIssue = {
  row?: number;
  code?: string;
  message?: string;
};

export type CatalogImportReply = {
  message?: string;
  rows?: number;
  created_count?: number;
  skipped_count?: number;
  errors?: CatalogImportIssue[];
};

export type CatalogKitLine = {
  id?: string;
  component_lot_id?: string;
  purchase_cost?: number;
  quantity?: number;
};

export type CatalogAddonGroup = {
  id: string;
  label: string;
  code?: string;
  addon_group_code?: string;
  active?: boolean;
};

export type CatalogItemRequest = {
  display_name?: string;
  item_code?: string;
  barcode?: string;
  item_kind?: CatalogItemKind;
  image_ref?: string;
  manufacturer?: string;
  model_name?: string;
  unit_id?: string;
  brand_id?: string;
  group_id?: string;
  storage_site_id?: string;
  storage_bin_id?: string;
  alert_quantity?: number;
  purchase_cost?: number;
  sale_price?: number;
  wholesale_price?: number;
  dealer_price?: number;
  profit_percent?: number;
  tax_mode?: 'exclusive' | 'inclusive';
  tax_rate?: number;
  size_label?: string;
  color_label?: string;
  weight_label?: string;
  capacity_label?: string;
  type_label?: string;
  has_serial?: boolean;
  is_addon_product?: boolean;
  addon_group_ids?: string[];
  variation_refs?: JsonMap;
  warranty_profile?: JsonMap;
  active?: boolean;
  lots?: CatalogLot[];
  bundle_lines?: CatalogKitLine[];
};

export type CatalogItem = CatalogItemRequest & {
  id: string;
  created_at?: string;
  updated_at?: string;
  unit?: LookupItem;
  brand?: LookupItem;
  group?: CatalogGroup;
  storage_site?: CatalogSite;
  storage_bin?: CatalogBin;
  available_stock?: number;
  stock_value?: number;
  low_stock?: boolean;
  addon_groups?: CatalogAddonGroup[];
  customizable?: boolean;
};

export type CatalogListReply = {
  total_size?: number;
  filter_size?: number;
  total_stock_value?: number;
  items?: CatalogItem[];
};

export type CatalogStockListReply = {
  total_size?: number;
  filter_size?: number;
  total_quantity?: number;
  total_stock_value?: number;
  low_stock_count?: number;
  expired_count?: number;
  items?: CatalogStockLot[];
};

export type CatalogLookupReply = {
  units?: LookupItem[];
  brands?: LookupItem[];
  groups?: CatalogGroup[];
  options?: CatalogOption[];
  branches?: CatalogBranch[];
  sites?: CatalogSite[];
  bins?: CatalogBin[];
  profile?: JsonMap;
};
