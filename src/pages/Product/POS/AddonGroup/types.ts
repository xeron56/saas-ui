import type { CatalogItem } from '../Catalog/types';

export type RetailAddonGroupStatus = 'active' | 'inactive';

export type RetailAddonProduct = {
  id: string;
  slack?: string;
  product_id: string;
  product_slack?: string;
  product_code?: string;
  name?: string;
  display_name?: string;
  price?: number;
  quantity?: number;
  alert_quantity?: number;
  low_stock?: boolean;
};

export type RetailAddonGroupRecord = {
  id: string;
  slack?: string;
  label: string;
  code: string;
  addon_group_code?: string;
  multiple_selection?: boolean;
  products?: RetailAddonProduct[];
  status: RetailAddonGroupStatus;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RetailAddonGroupRequest = {
  label: string;
  code?: string;
  multiple_selection?: boolean;
  product_ids?: string[];
  status?: RetailAddonGroupStatus;
};

export type RetailAddonGroupListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailAddonGroupRecord[];
  data?: RetailAddonGroupRecord[];
};

export type CatalogItemListReply = {
  items?: CatalogItem[];
  data?: CatalogItem[];
};
