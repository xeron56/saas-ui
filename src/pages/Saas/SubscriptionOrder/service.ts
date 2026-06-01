import { request } from '@umijs/max';
import type {
  SubscriptionOrderDecision,
  SubscriptionOrderInvoiceReply,
  SubscriptionOrderListReply,
  TenantUpgradePayload,
} from './types';

export async function listSubscriptionOrders(params: Record<string, unknown>) {
  return request<SubscriptionOrderListReply>('/v1/saas/subscription-orders', {
    method: 'GET',
    params,
  });
}

export async function listSubscriptionReports(params: Record<string, unknown>) {
  return request<SubscriptionOrderListReply>('/v1/saas/subscription-reports', {
    method: 'GET',
    params,
  });
}

export async function markSubscriptionOrderPaid(id: string, data: SubscriptionOrderDecision) {
  return request(`/v1/saas/subscription-orders/${id}/paid`, {
    method: 'POST',
    data,
  });
}

export async function rejectSubscriptionOrder(id: string, data: SubscriptionOrderDecision) {
  return request(`/v1/saas/subscription-orders/${id}/reject`, {
    method: 'POST',
    data,
  });
}

export async function getSubscriptionOrderInvoice(id: string) {
  return request<SubscriptionOrderInvoiceReply>(`/v1/saas/subscription-orders/${id}/invoice`, {
    method: 'GET',
  });
}

export async function upgradeTenantPlan(tenantId: string, data: TenantUpgradePayload) {
  return request(`/v1/saas/businesses/upgrade-plan/${tenantId}`, {
    method: 'PUT',
    data,
  });
}
