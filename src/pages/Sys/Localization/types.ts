export type CurrencyRecord = {
  id: string;
  name?: string;
  country_name?: string;
  countryName?: string;
  code?: string;
  rate?: number;
  symbol?: string;
  position?: string;
  status?: boolean;
  is_default?: boolean;
  isDefault?: boolean;
  created_at?: string;
  createdAt?: string;
};

export type LanguageRecord = {
  id: string;
  name?: string;
  locale_code?: string;
  localeCode?: string;
  code?: string;
  icon?: string;
  icon_ref?: string;
  iconRef?: string;
  status?: boolean;
  created_at?: string;
  createdAt?: string;
};

export type AdminListReply<T> = {
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

export type CurrencyReply = {
  message?: string;
  data?: CurrencyRecord;
};

export type LanguageReply = {
  message?: string;
  data?: LanguageRecord;
};
