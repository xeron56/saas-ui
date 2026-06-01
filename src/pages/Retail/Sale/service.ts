import { request } from '@umijs/max';
import type { RetailSale, RetailSaleListReply, RetailSaleRequest } from './types';

const salesBase = '/v1/retail/sales';

export async function listRetailSales(params: Record<string, any>) {
  return request<RetailSaleListReply>(salesBase, { params });
}

export async function getRetailSale(id: string) {
  return request<RetailSale>(`${salesBase}/${encodeURIComponent(id)}`);
}

export async function createRetailSale(data: RetailSaleRequest) {
  return request<RetailSale>(salesBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailSale(id: string, data: RetailSaleRequest) {
  return request<RetailSale>(`${salesBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function voidRetailSale(id: string) {
  return request<RetailSale>(`${salesBase}/${encodeURIComponent(id)}/void`, {
    method: 'POST',
  });
}
