export type ReferralMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  filter_size?: number;
  filterSize?: number;
};

export type ReferralAccount = {
  id: string;
  user_id?: string;
  tenant_id?: string;
  business_id?: string;
  tenant_name?: string;
  business_name?: string;
  display_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  referral_code?: string;
  ref_code?: string;
  currency_code?: string;
  balance_minor?: number;
  balance?: number;
  earned_minor?: number;
  total_earn?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ReferralListReply = {
  data?: ReferralAccount[];
  meta?: ReferralMeta;
  extra?: {
    total_balance_minor?: number;
    total_earned_minor?: number;
    currency_code?: string;
  };
};

export type ReferralPayoutStatus = 'unpaid' | 'paid' | 'pending' | 'rejected';

export type ReferralAccountMini = {
  id?: string;
  name?: string;
  email?: string;
};

export type ReferralPayout = {
  id: string;
  account_id?: string;
  affiliate_id?: string;
  user_id?: string;
  user?: ReferralAccountMini;
  payout_no?: string;
  trx?: string;
  currency_code?: string;
  amount_minor?: number;
  amount?: number;
  method?: string;
  status?: ReferralPayoutStatus | string;
  note?: string;
  requested_at?: string;
  decided_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type ReferralPayoutListReply = {
  data?: ReferralPayout[];
  meta?: ReferralMeta;
  extra?: {
    total_amount_minor?: number;
    pending_minor?: number;
    paid_minor?: number;
  };
};

export type ReferralBusinessReport = {
  id?: string;
  name?: string;
  companyName?: string;
  company_name?: string;
  tenant_id?: string;
  business_id?: string;
  business_name?: string;
  subscription_plan?: string;
  plan_name?: string;
  plan_key?: string;
  enrolled_plan?: {
    id?: string;
    plan_id?: string;
    business_id?: string;
    plan?: {
      id?: string;
      subscriptionName?: string;
      subscription_name?: string;
      name?: string;
    };
  };
  category?: {
    id?: string;
    name?: string;
  };
  date_time?: string;
  duration?: string;
  will_expire?: string;
  expired_date?: string;
  status?: string | number;
  status_label?: string;
  active?: boolean;
  total_earning?: string | number;
  created_at?: string;
  updated_at?: string;
};

export type ReferralReportReply = {
  data?: ReferralBusinessReport[];
  meta?: ReferralMeta;
  extra?: Record<string, never>;
};

export type ReferralDecision = {
  note?: string;
  notes?: string;
};
