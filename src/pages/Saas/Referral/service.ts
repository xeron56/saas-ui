import { request } from '@umijs/max';
import type {
  ReferralDecision,
  ReferralListReply,
  ReferralPayoutListReply,
  ReferralReportReply,
} from './types';

export async function listAffiliates(params?: Record<string, unknown>) {
  return request<ReferralListReply>('/v1/saas/affiliates', {
    method: 'GET',
    params,
  });
}

export async function deleteAffiliate(id: string) {
  return request<{ message?: string }>(`/v1/saas/affiliates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function deleteAffiliates(ids: string[]) {
  return request<{ message?: string; deleted_count?: number }>('/v1/saas/affiliates/delete-all', {
    method: 'POST',
    data: { ids },
  });
}

export async function listAffiliatePayouts(params?: Record<string, unknown>) {
  return request<ReferralPayoutListReply>('/v1/saas/affiliate-withdrawals', {
    method: 'GET',
    params,
  });
}

export async function markAffiliatePayoutPaid(id: string, data: ReferralDecision) {
  return request(`/v1/saas/affiliate-withdrawals/paid/${encodeURIComponent(id)}`, {
    method: 'POST',
    data,
  });
}

export async function rejectAffiliatePayout(id: string, data: ReferralDecision) {
  return request(`/v1/saas/affiliate-withdrawals/reject/${encodeURIComponent(id)}`, {
    method: 'POST',
    data,
  });
}

export async function listAffiliateReports(params?: Record<string, unknown>) {
  return request<ReferralReportReply>('/v1/saas/affiliate-reports', {
    method: 'GET',
    params,
  });
}
