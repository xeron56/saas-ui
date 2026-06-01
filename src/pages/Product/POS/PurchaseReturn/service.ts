import { request } from '@umijs/max';
import type {
  RetailPurchaseReturn,
  RetailPurchaseReturnListReply,
  RetailPurchaseReturnRequest,
} from './types';

const purchaseReturnsBase = '/v1/retail/purchase-returns';

export async function listRetailPurchaseReturns(params: Record<string, any>) {
  return request<RetailPurchaseReturnListReply>(purchaseReturnsBase, { params });
}

export async function getRetailPurchaseReturn(id: string) {
  return request<RetailPurchaseReturn>(`${purchaseReturnsBase}/${encodeURIComponent(id)}`);
}

export async function createRetailPurchaseReturn(data: RetailPurchaseReturnRequest) {
  return request<RetailPurchaseReturn>(purchaseReturnsBase, {
    method: 'POST',
    data,
  });
}
