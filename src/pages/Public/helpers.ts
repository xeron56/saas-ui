import type { V1PaymentMethod, V1Price } from '@gosaas/api';
import type {
  PlanPriceOption,
  PublicPlan,
  PublicPlanFeature,
  PublicPlansReply,
  PublicSiteEntry,
} from './types';

export const listFromReply = <T>(reply?: { items?: T[]; data?: T[] }) =>
  reply?.items ?? reply?.data ?? [];

export const getHomeValue = (
  data: Record<string, any> | undefined,
  keys: string[],
  fallback: string,
) => {
  const headings = data?.page_data?.headings ?? data?.pageData?.headings;
  for (const key of keys) {
    const value =
      data?.[key] ??
      data?.page_data?.[key] ??
      data?.pageData?.[key] ??
      data?.general?.[key] ??
      headings?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return fallback;
};

export const getPlanOptions = (reply?: PublicPlansReply): PlanPriceOption[] => {
  return listFromReply<PublicPlan>(reply).map((plan) => {
    const prices = plan.prices ?? [];
    if (!prices.length) {
      return { plan, price: {} as V1Price };
    }
    return { plan, price: prices[0] };
  });
};

export const priceText = (price?: V1Price) =>
  price?.discounted?.text ?? price?.default?.text ?? 'Contact sales';

export const planTitle = (plan?: PublicPlan) =>
  plan?.displayName ?? plan?.display_name ?? plan?.subscriptionName ?? plan?.key ?? 'Plan';

export const planDurationDays = (plan?: PublicPlan, price?: V1Price) => {
  const legacy = Number(plan?.duration || 0);
  if (legacy > 0) {
    return legacy;
  }
  if (price?.recurring?.interval === 'day') {
    return Number(price.recurring.intervalCount || 0);
  }
  return 0;
};

export const planPriceText = (plan?: PublicPlan, price?: V1Price) => {
  const fromPrice = priceText(price);
  if (fromPrice !== 'Contact sales') {
    return fromPrice;
  }
  const raw = plan?.offerPrice ?? plan?.subscriptionPrice;
  if (raw === null || raw === undefined || raw === '') {
    return 'Contact sales';
  }
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Free';
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: plan?.currency_code || price?.currencyCode || 'BDT',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const planDefaultPriceText = (plan?: PublicPlan, price?: V1Price) => {
  const text = price?.default?.text;
  if (text) {
    return text;
  }
  const raw = plan?.subscriptionPrice;
  if (raw === null || raw === undefined || raw === '') {
    return '';
  }
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return '';
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: plan?.currency_code || price?.currencyCode || 'BDT',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const planFeatureItems = (plan?: PublicPlan): PublicPlanFeature[] => {
  const raw = plan?.features;
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw
      .map((item: any) => {
        if (Array.isArray(item)) {
          return { label: String(item[0] || '').trim(), enabled: item[1] !== undefined };
        }
        if (typeof item === 'string') {
          return { label: item, enabled: true };
        }
        return {
          key: item?.key,
          label: String(item?.label || item?.name || item?.title || '').trim(),
          value: item?.value,
          enabled: item?.enabled !== false,
        };
      })
      .filter((item) => item.label);
  }
  if (typeof raw === 'object') {
    return Object.entries(raw)
      .map(([key, value]: [string, any]) => {
        if (Array.isArray(value)) {
          return { key, label: String(value[0] || '').trim(), enabled: value[1] !== undefined };
        }
        return {
          key,
          label: key.replace(/_/g, ' '),
          value,
          enabled: value !== false && value !== 0,
        };
      })
      .filter((item) => item.label);
  }
  return [];
};

export const billingText = (price?: V1Price) => {
  if (!price?.recurring?.interval) {
    return price?.type === 'one_time' ? 'One-time' : 'Flexible billing';
  }
  const count = price.recurring.intervalCount;
  return count && count !== '1'
    ? `Every ${count} ${price.recurring.interval}s`
    : `Per ${price.recurring.interval}`;
};

export const hasSslcommerz = (methods?: V1PaymentMethod[]) =>
  (methods ?? []).some((method) => (method.name ?? '').toLowerCase() === 'sslcommerz');

export const methodByName = (methods: V1PaymentMethod[] | undefined, name: string) =>
  (methods ?? []).find((method) => (method.name ?? '').toLowerCase() === name.toLowerCase());

export const entryImage = (entry?: PublicSiteEntry) =>
  publicAsset(entry?.imageUrl ?? entry?.image ?? entry?.media_ref ?? '');

export const entryText = (entry?: PublicSiteEntry) => entry?.body ?? entry?.descriptions ?? '';

export const publicAsset = (value?: string) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return '';
  }
  if (/^(https?:|data:|blob:|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\.?\//, '')}`;
};

export const publicHref = (value?: string, fallback = '/') => {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return fallback;
  }
  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed;
  }
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (normalized === '/login') {
    return '/user/login';
  }
  return normalized;
};

export const isExternalHref = (value?: string) => /^(https?:|mailto:|tel:)/i.test(value || '');

export const formatPublicDate = (value?: string) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const legalPageValue = (replyData: Record<string, any> | undefined) => {
  const value = replyData?.page?.value;
  return value && typeof value === 'object' ? value : {};
};
