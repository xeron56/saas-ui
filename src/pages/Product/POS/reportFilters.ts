export type ReportDurationFilter =
  | 'today'
  | 'yesterday'
  | 'last_seven_days'
  | 'last_thirty_days'
  | 'current_month'
  | 'last_month'
  | 'current_year'
  | 'custom_date';

const reportDurations = new Set<string>([
  'today',
  'yesterday',
  'last_seven_days',
  'last_thirty_days',
  'current_month',
  'last_month',
  'current_year',
  'custom_date',
]);

export const isReportRoute = (pathname: string) => pathname.includes('/retail/reports/');

export const readReportDurationFilter = (
  pathname: string,
  search: string,
  fallback?: ReportDurationFilter,
): ReportDurationFilter | undefined => {
  const value = new URLSearchParams(search).get('duration');
  if (value && reportDurations.has(value)) {
    return value as ReportDurationFilter;
  }
  return isReportRoute(pathname) ? fallback : undefined;
};

export const reportDurationParams = (
  duration: ReportDurationFilter | undefined,
  search: string,
): Record<string, string> => {
  if (!duration) {
    return {};
  }
  const query = new URLSearchParams(search);
  const params: Record<string, string> = { duration };
  if (duration === 'custom_date') {
    const fromDate = query.get('from_date');
    const toDate = query.get('to_date');
    if (fromDate) {
      params.from_date = fromDate;
    }
    if (toDate) {
      params.to_date = toDate;
    }
  }
  const branchRef = query.get('branch_ref');
  if (branchRef) {
    params.branch_ref = branchRef;
  }
  return params;
};
