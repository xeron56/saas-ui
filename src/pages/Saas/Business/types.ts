export type AdminBusinessCategory = {
  id?: string;
  name?: string;
  display_name?: string;
  displayName?: string;
};

export type AdminBusinessPlan = {
  id?: string;
  key?: string;
  plan_key?: string;
  planKey?: string;
  subscriptionName?: string;
  subscription_name?: string;
  display_name?: string;
  displayName?: string;
};

export type AdminBusinessOwner = {
  email?: string;
  name?: string;
};

export type AdminBusiness = {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  tenant_name?: string;
  tenantName?: string;
  name?: string;
  companyName?: string;
  company_name?: string;
  email?: string;
  phoneNumber?: string;
  phone_number?: string;
  phone?: string;
  address?: string;
  shopOpeningBalance?: number;
  shop_opening_balance?: number;
  openingBalance?: number;
  business_category_id?: string;
  businessCategoryId?: string;
  business_category?: AdminBusinessCategory;
  plan_key?: string;
  planKey?: string;
  requested_plan_key?: string;
  requestedPlanKey?: string;
  status?: boolean;
  active?: boolean;
  owner?: AdminBusinessOwner;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type AdminBusinessListReply = {
  data?: AdminBusiness[];
  meta?: {
    current_page?: number;
    currentPage?: number;
    last_page?: number;
    lastPage?: number;
    per_page?: number;
    perPage?: number;
    total?: number;
    filter_size?: number;
    filterSize?: number;
  };
};

export type AdminBusinessMetaReply = {
  plans?: AdminBusinessPlan[];
  categories?: AdminBusinessCategory[];
  gateways?: unknown[];
  payment_gateways?: unknown[];
};

export type AdminBusinessReply = {
  message?: string;
  data?: AdminBusiness;
  owner?: AdminBusinessOwner;
};

export type BusinessUpgradePayload = {
  plan_key: string;
  notes: string;
  gateway?: string;
};
