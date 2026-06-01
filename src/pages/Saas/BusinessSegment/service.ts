import { request } from '@umijs/max';
import type { BusinessSegmentListReply, BusinessSegmentReply } from './types';

const basePath = '/v1/saas/business-segments';

export async function listBusinessSegments(params?: Record<string, unknown>) {
  return request<BusinessSegmentListReply>(basePath, { method: 'GET', params });
}

export async function createBusinessSegment(data: Record<string, unknown>) {
  return request<BusinessSegmentReply>(basePath, { method: 'POST', data });
}

export async function updateBusinessSegment(id: string, data: Record<string, unknown>) {
  return request<BusinessSegmentReply>(`${basePath}/${id}`, { method: 'PUT', data });
}

export async function updateBusinessSegmentStatus(id: string, status: boolean) {
  return request<BusinessSegmentReply>(`${basePath}/status/${id}`, {
    method: 'POST',
    data: { status },
  });
}

export async function deleteBusinessSegment(id: string) {
  return request(`${basePath}/${id}`, { method: 'DELETE' });
}

export async function deleteBusinessSegments(ids: string[]) {
  return request(`${basePath}/delete-all`, {
    method: 'POST',
    data: { ids },
  });
}
