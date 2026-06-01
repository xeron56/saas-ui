import { request } from '@umijs/max';
import type {
  AdminBusinessListReply,
  AdminBusinessMetaReply,
  AdminBusinessReply,
  BusinessUpgradePayload,
} from './types';

const basePath = '/v1/saas/businesses';

export async function listAdminBusinesses(params?: Record<string, unknown>) {
  return request<AdminBusinessListReply>(basePath, { method: 'GET', params });
}

export async function getAdminBusiness(id: string) {
  return request<AdminBusinessReply>(`${basePath}/${id}`, { method: 'GET' });
}

export async function getAdminBusinessesMeta() {
  return request<AdminBusinessMetaReply>(`${basePath}/meta`, { method: 'GET' });
}

export async function createAdminBusiness(data: Record<string, unknown>) {
  return request<AdminBusinessReply>(basePath, { method: 'POST', data });
}

export async function updateAdminBusiness(id: string, data: Record<string, unknown>) {
  return request<AdminBusinessReply>(`${basePath}/${id}`, { method: 'PUT', data });
}

export async function updateAdminBusinessStatus(id: string, status: boolean) {
  return request<AdminBusinessReply>(`${basePath}/status/${id}`, {
    method: 'POST',
    data: { status },
  });
}

export async function upgradeAdminBusinessPlan(id: string, data: BusinessUpgradePayload) {
  return request<AdminBusinessReply>(`${basePath}/upgrade-plan/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteAdminBusiness(id: string) {
  return request(`${basePath}/${id}`, { method: 'DELETE' });
}

export async function deleteAdminBusinesses(ids: string[]) {
  return request(`${basePath}/delete-all`, {
    method: 'POST',
    data: { ids },
  });
}
