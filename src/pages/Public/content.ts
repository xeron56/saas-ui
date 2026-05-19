import type { LegacyPayload, LegacyRecord, PublicDetailConfig, PublicListConfig } from './types';

export const publicListConfigs: PublicListConfig[] = [
  {
    path: '/all-alumni',
    endpoint: '/all-alumni',
    responseKey: 'allAlumni',
    title: 'Alumni',
    description: 'Browse active alumni profiles for this tenant.',
    detailBase: '/alumni/profile',
  },
  {
    path: '/all-event',
    endpoint: '/all-event',
    responseKey: 'allEvent',
    title: 'Events',
    description: 'Upcoming and published events.',
    detailBase: '/event-view-details',
    dateKey: 'date',
  },
  {
    path: '/our-news',
    endpoint: '/our-news',
    responseKey: 'allNews',
    title: 'News',
    description: 'Latest tenant news and announcements.',
    detailBase: '/news-view-details',
    dateKey: 'created_at',
  },
  {
    path: '/all-news',
    endpoint: '/all-news',
    responseKey: 'allNews',
    title: 'News',
    description: 'Latest tenant news and announcements.',
    detailBase: '/news-details',
    dateKey: 'created_at',
  },
  {
    path: '/our-notice',
    endpoint: '/our-notice',
    responseKey: 'allNotice',
    title: 'Notices',
    description: 'Published notices and official updates.',
    detailBase: '/notice-view-details',
    dateKey: 'created_at',
  },
  {
    path: '/all-notice',
    endpoint: '/all-notice',
    responseKey: 'allNotice',
    title: 'Notices',
    description: 'Published notices and official updates.',
    detailBase: '/notice-details',
    dateKey: 'created_at',
  },
  {
    path: '/all-job',
    endpoint: '/all-job',
    responseKey: 'allJob',
    title: 'Jobs',
    description: 'Approved career opportunities from the tenant network.',
    detailBase: '/job-view-details',
    dateKey: 'application_deadline',
  },
  {
    path: '/all-stories',
    endpoint: '/all-stories',
    responseKey: 'stories',
    title: 'Stories',
    description: 'Member stories and featured updates.',
    detailBase: '/view-stories',
    dateKey: 'created_at',
  },
];

export const publicDetailConfigs: PublicDetailConfig[] = [
  {
    match: /^\/event-view-details\/[^/]+\/?$/,
    endpointBase: '/event-view-details',
    responseKey: 'event',
    title: 'Event',
    listPath: '/all-event',
  },
  {
    match: /^\/news-view-details\/[^/]+\/?$/,
    endpointBase: '/news-view-details',
    responseKey: 'news',
    title: 'News',
    listPath: '/our-news',
  },
  {
    match: /^\/news-details\/[^/]+\/?$/,
    endpointBase: '/news-details',
    responseKey: 'news',
    title: 'News',
    listPath: '/all-news',
  },
  {
    match: /^\/notice-view-details\/[^/]+\/?$/,
    endpointBase: '/notice-view-details',
    responseKey: 'notice',
    title: 'Notice',
    listPath: '/our-notice',
  },
  {
    match: /^\/notice-details\/[^/]+\/?$/,
    endpointBase: '/notice-details',
    responseKey: 'notice',
    title: 'Notice',
    listPath: '/all-notice',
  },
  {
    match: /^\/job-view-details\/[^/]+\/?$/,
    endpointBase: '/job-view-details',
    responseKey: 'jobPostData',
    title: 'Job',
    listPath: '/all-job',
  },
  {
    match: /^\/view-stories\/[^/]+\/?$/,
    endpointBase: '/view-stories',
    responseKey: 'story',
    title: 'Story',
    listPath: '/all-stories',
  },
];

export function findListConfig(pathname: string) {
  return publicListConfigs.find((config) => config.path === pathname.replace(/\/$/, ''));
}

export function findDetailConfig(pathname: string) {
  return publicDetailConfigs.find((config) => config.match.test(pathname));
}

export function normalizePayload(payload: LegacyPayload): LegacyRecord {
  if (!payload) {
    return {};
  }
  if (Array.isArray(payload)) {
    return { items: payload };
  }
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return { ...payload, ...payload.data };
  }
  return payload;
}

export function recordsFromPayload(payload: LegacyPayload, responseKey: string): LegacyRecord[] {
  const body = normalizePayload(payload);
  const value = body[responseKey] ?? body.items ?? body.data;
  if (Array.isArray(value)) {
    return value;
  }
  if (value && typeof value === 'object' && Array.isArray(value.items)) {
    return value.items;
  }
  return [];
}

export function recordFromPayload(
  payload: LegacyPayload,
  responseKey: string,
): LegacyRecord | undefined {
  const body = normalizePayload(payload);
  const value = body[responseKey] ?? body.item ?? body.data;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  return undefined;
}

export function textValue(value: any) {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return String(value).trim();
}

export function contentTitle(record?: LegacyRecord) {
  return (
    textValue(record?.title) ||
    textValue(record?.name) ||
    textValue(record?.caption) ||
    textValue(record?.email) ||
    'Untitled'
  );
}

export function contentSummary(record?: LegacyRecord) {
  const value =
    record?.details ??
    record?.description ??
    record?.body ??
    record?.job_context ??
    record?.message ??
    record?.location ??
    '';
  return textValue(value)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 220);
}

export function contentCategory(record?: LegacyRecord) {
  return textValue(record?.category?.name) || textValue(record?.category_name);
}

export function contentAuthor(record?: LegacyRecord) {
  return (
    textValue(record?.author?.name) ||
    textValue(record?.user?.name) ||
    textValue(record?.author_name) ||
    textValue(record?.user_name)
  );
}

export function contentImage(record?: LegacyRecord) {
  return (
    textValue(record?.thumbnail_url) ||
    textValue(record?.image_url) ||
    textValue(record?.company_logo_url) ||
    textValue(record?.badge_url) ||
    textValue(record?.photo_url) ||
    textValue(record?.avatar_url) ||
    textValue(record?.avatar) ||
    ''
  );
}

export function contentSlug(record?: LegacyRecord) {
  return textValue(record?.slug) || textValue(record?.id);
}
