import { request } from '@umijs/max';
import type { RetailTransfer, RetailTransferListReply, RetailTransferRequest } from './types';

const transferBase = '/v1/retail/transfers';

export async function listRetailTransfers(params: Record<string, any>) {
  return request<RetailTransferListReply>(transferBase, { params });
}

export async function createRetailTransfer(data: RetailTransferRequest) {
  return request<RetailTransfer>(transferBase, {
    method: 'POST',
    data,
  });
}

export async function getRetailTransfer(id: string) {
  return request<RetailTransfer>(`${transferBase}/${encodeURIComponent(id)}`);
}
