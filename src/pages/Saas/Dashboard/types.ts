export type DashboardStats = {
  total_tenants?: number;
  totalTenants?: number;
  expired_tenants?: number;
  expiredTenants?: number;
  subscription_orders?: number;
  subscriptionOrders?: number;
  business_segments?: number;
  businessSegments?: number;
  total_plans?: number;
  totalPlans?: number;
  active_plans?: number;
  activePlans?: number;
  paid_subscription_orders?: number;
  paidSubscriptionOrders?: number;
  total_revenue_minor?: number;
  totalRevenueMinor?: number;
};

export type DashboardTenant = {
  id: string;
  name?: string;
  display_name?: string;
  displayName?: string;
  region?: string;
  logo?: string;
  plan_key?: string;
  planKey?: string;
  plan_name?: string;
  planName?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  expires_at?: string;
  expiresAt?: string;
};

export type DashboardData = {
  stats?: DashboardStats;
  tenants?: DashboardTenant[];
};

export type DashboardReply = {
  data?: DashboardData;
};

export type DashboardStatsReply = {
  data?: DashboardStats;
};

export type DashboardMonthlyPoint = {
  month_number?: number;
  monthNumber?: number;
  month?: string;
  order_count?: number;
  orderCount?: number;
  paid_count?: number;
  paidCount?: number;
  total_amount_minor?: number;
  totalAmountMinor?: number;
  paid_amount_minor?: number;
  paidAmountMinor?: number;
  currency_code?: string;
  currencyCode?: string;
};

export type DashboardMonthlyReply = {
  data?: DashboardMonthlyPoint[];
};

export type DashboardPlanPoint = {
  plan_key?: string;
  planKey?: string;
  plan_name?: string;
  planName?: string;
  product_id?: string;
  productId?: string;
  plan_count?: number;
  planCount?: number;
  paid_count?: number;
  paidCount?: number;
  total_amount_minor?: number;
  totalAmountMinor?: number;
  paid_amount_minor?: number;
  paidAmountMinor?: number;
  currency_code?: string;
  currencyCode?: string;
};

export type DashboardPlanReply = {
  data?: DashboardPlanPoint[];
};
