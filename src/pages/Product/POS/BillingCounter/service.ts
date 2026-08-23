import { request } from '@umijs/max';
import type {
  RetailBillingCounterListReply,
  RetailBillingCounterRecord,
  RetailBillingCounterRequest,
} from './types';

const billingCounterBase = '/v1/retail/billing-counters';

export async function listRetailBillingCounters(params: Record<string, any>) {
  return request<RetailBillingCounterListReply>(billingCounterBase, { params });
}

export async function getRetailBillingCounter(id: string) {
  return request<RetailBillingCounterRecord>(`${billingCounterBase}/${encodeURIComponent(id)}`);
}

export async function createRetailBillingCounter(data: RetailBillingCounterRequest) {
  return request<RetailBillingCounterRecord>(billingCounterBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailBillingCounter(id: string, data: RetailBillingCounterRequest) {
  return request<RetailBillingCounterRecord>(`${billingCounterBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailBillingCounter(id: string) {
  return request<{ id: string }>(`${billingCounterBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
