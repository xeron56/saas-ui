import { request } from '@umijs/max';
import type {
  RetailDiscountCodeListReply,
  RetailDiscountCodeRecord,
  RetailDiscountCodeRequest,
} from './types';

const discountCodeBase = '/v1/retail/discount-codes';

export async function listRetailDiscountCodes(params: Record<string, any>) {
  return request<RetailDiscountCodeListReply>(discountCodeBase, { params });
}

export async function getRetailDiscountCode(id: string) {
  return request<RetailDiscountCodeRecord>(`${discountCodeBase}/${encodeURIComponent(id)}`);
}

export async function createRetailDiscountCode(data: RetailDiscountCodeRequest) {
  return request<RetailDiscountCodeRecord>(discountCodeBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailDiscountCode(id: string, data: RetailDiscountCodeRequest) {
  return request<RetailDiscountCodeRecord>(`${discountCodeBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailDiscountCode(id: string) {
  return request<{ id: string }>(`${discountCodeBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
