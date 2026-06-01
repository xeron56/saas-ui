import type { V1PaymentMethod, V1Plan, V1Price } from '@gosaas/api';

export type PublicSiteMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  filter_size?: number;
};

export type PublicSiteEntry = {
  id?: string;
  kind?: string;
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  media_ref?: string;
  image?: string;
  imageUrl?: string;
  status?: boolean;
  active?: boolean;
  sort_order?: number;
  author_name?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  descriptions?: string;
  tags?: string[];
  text?: string;
  work_at?: string;
  star?: number;
  client_name?: string;
  client_image?: string;
  bg_color?: string;
  meta?: Record<string, any>;
};

export type PublicSiteComment = {
  id?: string;
  blog_id?: string;
  comment_id?: string;
  name?: string;
  email?: string;
  comment?: string;
  status?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PublicHomeReply = {
  data?: Record<string, any>;
};

export type PublicShellReply = {
  data?: {
    page_data?: Record<string, any>;
    general?: Record<string, any>;
  };
};

export type PublicContactReply = {
  data?: Record<string, any>;
  message?: string;
};

export type PublicContactStoreReply = {
  data?: Record<string, any>;
  message?: string;
  redirect?: string;
};

export type PublicGeneralPageReply = {
  data?: {
    page_data?: Record<string, any>;
    general?: Record<string, any>;
    features?: PublicSiteEntry[];
    testimonials?: PublicSiteEntry[];
    page?: {
      key?: string;
      value?: Record<string, any>;
    };
  };
};

export type PublicBlogsReply = {
  data?: {
    page_data?: Record<string, any>;
    general?: Record<string, any>;
    recent_blogs?: PublicSiteEntry[];
    blogs?: PublicSiteEntry[];
  };
  meta?: PublicSiteMeta;
};

export type PublicBlogReply = {
  data?: {
    page_data?: Record<string, any>;
    general?: Record<string, any>;
    blog?: PublicSiteEntry;
    recent_blogs?: PublicSiteEntry[];
    comments?: PublicSiteComment[];
    comment_meta?: PublicSiteMeta;
  };
};

export type PublicBlogCommentStoreReply = {
  data?: PublicSiteComment;
  message?: string;
  redirect?: string;
};

export type PublicPlansReply = {
  items?: PublicPlan[];
  data?: PublicPlan[];
};

export type PublicPlanFeature = {
  key?: string;
  label?: string;
  value?: unknown;
  enabled?: boolean;
};

export type PublicPlan = V1Plan & {
  id?: string;
  display_name?: string;
  subscriptionName?: string;
  duration?: number | string;
  subscriptionPrice?: number | string;
  offerPrice?: number | string | null;
  currency_code?: string;
  features?: PublicPlanFeature[] | Record<string, any>;
  status?: boolean;
};

export type PaymentMethodsReply = {
  methods?: V1PaymentMethod[];
};

export type CheckoutReply = {
  redirect?: string;
  redirect_url?: string;
  redirectUrl?: string;
  message?: string;
  gateway?: string;
  provider?: string;
  transaction_id?: string;
  transactionId?: string;
  payment_status?: string;
  paymentStatus?: string;
  status?: string;
  data?: Record<string, any>;
};

export type SslcommerzOrderStatus = {
  order_id?: string;
  transaction_id?: string;
  provider?: string;
  status?: string;
  amount_minor?: number;
  amount_decimal?: string;
  amount_text?: string;
  currency_code?: string;
  paid_time?: string;
};

export type SslcommerzOrderStatusReply = {
  data?: SslcommerzOrderStatus;
};

export type PlanPriceOption = {
  plan: PublicPlan;
  price: V1Price;
};
