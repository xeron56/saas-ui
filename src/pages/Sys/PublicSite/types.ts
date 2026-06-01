export type PublicSiteEntryKind = 'banner' | 'feature' | 'interface' | 'testimonial' | 'blog';

export type PublicSiteEntry = {
  id: string;
  kind: PublicSiteEntryKind;
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  media_ref?: string;
  mediaRef?: string;
  image?: string;
  imageUrl?: string;
  status?: boolean;
  active?: boolean;
  sort_order?: number;
  sortOrder?: number;
  author_name?: string;
  authorName?: string;
  published_at?: string;
  publishedAt?: string;
  meta?: Record<string, any>;
  bg_color?: string;
  bgColor?: string;
  text?: string;
  work_at?: string;
  workAt?: string;
  star?: number;
  client_name?: string;
  clientName?: string;
  client_image?: string;
  clientImage?: string;
  descriptions?: string;
  tags?: string[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type PublicSiteListReply<T> = {
  data?: T[];
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

export type PublicSiteEntryReply = {
  message?: string;
  data?: PublicSiteEntry;
};

export type PublicSiteDeleteReply = {
  message?: string;
  deleted_count?: number;
  deletedCount?: number;
};

export type PublicSiteAssetReply = {
  url?: string;
  path?: string;
  data?: {
    url?: string;
    path?: string;
  };
};

export type PublicSiteSettingReply = {
  data?: {
    key?: string;
    value?: Record<string, any>;
  };
};

export type PublicSitePageReply = {
  message?: string;
  data?: Record<string, any>;
};

export type PublicSiteMessage = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  company_name?: string;
  companyName?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
};

export type PublicSiteComment = {
  id: string;
  blog_id?: string;
  blogId?: string;
  name?: string;
  email?: string;
  comment?: string;
  status?: boolean;
  created_at?: string;
  createdAt?: string;
};
