import { request } from '@umijs/max';
import type { RetailTargetListReply, RetailTargetRecord, RetailTargetRequest } from './types';

const targetBase = '/v1/retail/targets';

export async function listRetailTargets(params: Record<string, any>) {
  return request<RetailTargetListReply>(targetBase, { params });
}

export async function getRetailTarget(id: string) {
  return request<RetailTargetRecord>(`${targetBase}/${encodeURIComponent(id)}`);
}

export async function createRetailTarget(data: RetailTargetRequest) {
  return request<RetailTargetRecord>(targetBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailTarget(id: string, data: RetailTargetRequest) {
  return request<RetailTargetRecord>(`${targetBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailTarget(id: string) {
  return request<{ id: string }>(`${targetBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
