export type RetailDiscountCodeStatus = 'active' | 'inactive';

export type RetailDiscountCodeRecord = {
  id: string;
  slack?: string;
  label: string;
  code: string;
  discount_code?: string;
  discount_percentage: number;
  description?: string;
  status: RetailDiscountCodeStatus;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RetailDiscountCodeRequest = {
  label: string;
  code: string;
  discount_percentage: number;
  description?: string;
  status?: RetailDiscountCodeStatus;
};

export type RetailDiscountCodeListReply = {
  total_size?: number;
  filter_size?: number;
  items?: RetailDiscountCodeRecord[];
  data?: RetailDiscountCodeRecord[];
};
