const publicRoutePatterns = [
  /^\/$/,
  /^\/local\/[^/]+\/?$/,
  /^\/all-alumni\/?$/,
  /^\/alumni\/profile\/[^/]+\/?$/,
  /^\/all-event\/?$/,
  /^\/event-view-details\/[^/]+\/?$/,
  /^\/our-news\/?$/,
  /^\/all-news\/?$/,
  /^\/news-view-details\/[^/]+\/?$/,
  /^\/news-details\/[^/]+\/?$/,
  /^\/our-notice\/?$/,
  /^\/all-notice\/?$/,
  /^\/notice-view-details\/[^/]+\/?$/,
  /^\/notice-details\/[^/]+\/?$/,
  /^\/all-membership\/?$/,
  /^\/all-job\/?$/,
  /^\/job-view-details\/[^/]+\/?$/,
  /^\/all-stories\/?$/,
  /^\/view-stories\/[^/]+\/?$/,
  /^\/page\/[^/]+\/?$/,
  /^\/contact-us\/?$/,
];

export function isPublicRoutePath(pathname?: string) {
  const path =
    pathname ?? (typeof window !== 'undefined' && window.location ? window.location.pathname : '');
  return publicRoutePatterns.some((pattern) => pattern.test(path));
}
