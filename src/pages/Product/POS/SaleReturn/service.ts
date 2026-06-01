import { request } from '@umijs/max';
import type { RetailSaleReturn, RetailSaleReturnListReply, RetailSaleReturnRequest } from './types';

const saleReturnsBase = '/v1/retail/sale-returns';

export async function listRetailSaleReturns(params: Record<string, any>) {
  return request<RetailSaleReturnListReply>(saleReturnsBase, { params });
}

export async function getRetailSaleReturn(id: string) {
  return request<RetailSaleReturn>(`${saleReturnsBase}/${encodeURIComponent(id)}`);
}

export async function createRetailSaleReturn(data: RetailSaleReturnRequest) {
  return request<RetailSaleReturn>(saleReturnsBase, {
    method: 'POST',
    data,
  });
}
