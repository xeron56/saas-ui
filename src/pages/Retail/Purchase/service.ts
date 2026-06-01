import { request } from '@umijs/max';
import type { RetailPurchase, RetailPurchaseListReply, RetailPurchaseRequest } from './types';

const purchasesBase = '/v1/retail/purchases';

export async function listRetailPurchases(params: Record<string, any>) {
  return request<RetailPurchaseListReply>(purchasesBase, { params });
}

export async function getRetailPurchase(id: string) {
  return request<RetailPurchase>(`${purchasesBase}/${encodeURIComponent(id)}`);
}

export async function createRetailPurchase(data: RetailPurchaseRequest) {
  return request<RetailPurchase>(purchasesBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailPurchase(id: string, data: RetailPurchaseRequest) {
  return request<RetailPurchase>(`${purchasesBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function voidRetailPurchase(id: string) {
  return request<RetailPurchase>(`${purchasesBase}/${encodeURIComponent(id)}/void`, {
    method: 'POST',
  });
}
