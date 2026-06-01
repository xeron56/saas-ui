export type SubscriptionOrderStatus = 'pending_review' | 'paid' | 'rejected';
export type SubscriptionOrderRawStatus = SubscriptionOrderStatus | 'unpaid' | 'reject' | string;

export type SubscriptionOrderTenant = {
  id?: string;
  name?: string;
  display_name?: string;
  displayName?: string;
  logo?: string;
};

export type SubscriptionOrderBusiness = {
  id?: string;
  name?: string;
  company_name?: string;
  companyName?: string;
  display_name?: string;
  displayName?: string;
};

export type SubscriptionOrderPlan = {
  id?: string;
  key?: string;
  plan_key?: string;
  planKey?: string;
  name?: string;
  subscription_name?: string;
  subscriptionName?: string;
  display_name?: string;
  displayName?: string;
  product_id?: string;
  productId?: string;
};

export type SubscriptionOrderGateway = {
  id?: string;
  key?: string;
  name?: string;
  display_name?: string;
  displayName?: string;
  provider?: string;
};

export type SubscriptionOrder = {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  tenant_name?: string;
  tenantName?: string;
  tenant?: SubscriptionOrderTenant;
  business_id?: string;
  businessId?: string;
  business_name?: string;
  businessName?: string;
  business?: SubscriptionOrderBusiness;
  plan_key?: string;
  planKey?: string;
  plan_id?: string;
  planId?: string;
  plan?: SubscriptionOrderPlan;
  plan_name?: string;
  planName?: string;
  product_id?: string;
  productId?: string;
  price_id?: string;
  priceId?: string;
  payment_status?: SubscriptionOrderRawStatus;
  paymentStatus?: SubscriptionOrderRawStatus;
  status?: SubscriptionOrderRawStatus;
  gateway?: string | SubscriptionOrderGateway;
  gateway_id?: string;
  gatewayId?: string;
  gateway_name?: string;
  gatewayName?: string;
  notes?: string;
  currency_code?: string;
  currencyCode?: string;
  currency?: string;
  amount?: number | string;
  price?: number | string;
  amount_minor?: number | string;
  amountMinor?: number | string;
  amount_text?: string;
  amountText?: string;
  duration_days?: number;
  durationDays?: number;
  duration?: number;
  started_at?: string;
  startedAt?: string;
  ends_at?: string;
  endsAt?: string;
  expires_at?: string;
  expiresAt?: string;
  subscriptionDate?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type SubscriptionOrderListReply = {
  data?: SubscriptionOrder[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    filter_size?: number;
    filterSize?: number;
  };
  extra?: {
    from_date?: string;
    to_date?: string;
    custom_days?: string;
  };
};

export type SubscriptionOrderInvoiceReply = {
  data?: {
    subscriber?: SubscriptionOrder;
    invoice?: {
      started_at?: string;
      startedAt?: string;
      ends_at?: string;
      endsAt?: string;
    };
  };
};

export type SubscriptionOrderDecision = {
  notes: string;
};

export type TenantUpgradePayload = {
  plan_key: string;
  notes: string;
  gateway?: string;
};
