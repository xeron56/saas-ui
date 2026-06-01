import { request } from '@umijs/max';
import type { LegacyPlanFormValues, LegacyPlanListReply, LegacyPlanReply } from './types';

const basePath = '/v1/saas/subscription-plans';

export async function listAdminPlans(params?: Record<string, unknown>) {
  return request<LegacyPlanListReply>(basePath, { params });
}

export async function getAdminPlan(id: string) {
  return request<LegacyPlanReply>(`${basePath}/${encodeURIComponent(id)}`);
}

export async function createAdminPlan(data: LegacyPlanFormValues) {
  return request<LegacyPlanReply>(basePath, { method: 'POST', data });
}

export async function updateAdminPlan(id: string, data: LegacyPlanFormValues) {
  return request<LegacyPlanReply>(`${basePath}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteAdminPlan(id: string) {
  return request<{ message?: string }>(`${basePath}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
