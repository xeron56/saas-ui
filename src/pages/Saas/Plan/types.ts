export type LegacyPlan = {
  id?: string;
  key?: string;
  subscriptionName?: string;
  display_name?: string;
  duration?: number;
  subscriptionPrice?: number;
  offerPrice?: number | null;
  affiliate_commission?: number;
  affiliate_commission_rate?: number;
  status?: boolean;
  active?: boolean;
  allow_multibranch?: boolean;
  subdomain_limit?: number;
  currency_code?: string;
  created_at?: string;
  updated_at?: string;
};

export type LegacyPlanListReply = {
  data?: LegacyPlan[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

export type LegacyPlanReply = {
  message?: string;
  data?: LegacyPlan;
};

export type LegacyPlanFormValues = {
  key?: string;
  subscriptionName?: string;
  duration?: number;
  subscriptionPrice?: number;
  offerPrice?: number | null;
  affiliate_commission?: number;
  status?: boolean;
  allow_multibranch?: boolean;
  subdomain_limit?: number;
  currency_code?: string;
};
