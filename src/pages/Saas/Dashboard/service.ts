import { request } from '@umijs/max';
import type {
  DashboardMonthlyReply,
  DashboardPlanReply,
  DashboardReply,
  DashboardStatsReply,
} from './types';

const basePath = '/v1/saas/dashboard';

export async function getAdminDashboard() {
  return request<DashboardReply>(basePath, { method: 'GET' });
}

export async function getDashboardStats() {
  return request<DashboardStatsReply>(`${basePath}/stats`, { method: 'GET' });
}

export async function getYearlySubscriptions(year: number) {
  return request<DashboardMonthlyReply>(`${basePath}/yearly-subscriptions`, {
    method: 'GET',
    params: { year },
  });
}

export async function getPlansOverview(year: number) {
  return request<DashboardPlanReply>(`${basePath}/plans-overview`, {
    method: 'GET',
    params: { year },
  });
}
