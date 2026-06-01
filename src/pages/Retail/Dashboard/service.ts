import { request } from '@umijs/max';
import type { DashboardReport, DashboardSummary } from './types';

const dashboardBase = '/v1/retail/reports';

export async function getDashboardSummary(params: Record<string, any>) {
  return request<DashboardSummary>(`${dashboardBase}/summary`, { params });
}

export async function getDashboardReport(params: Record<string, any>) {
  return request<DashboardReport>(`${dashboardBase}/dashboard`, { params });
}
