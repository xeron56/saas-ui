import { request } from '@umijs/max';
import type { RetailTableListReply, RetailTableRecord, RetailTableRequest } from './types';

const tableBase = '/v1/retail/tables';

export async function listRetailTables(params: Record<string, any>) {
  return request<RetailTableListReply>(tableBase, { params });
}

export async function getRetailTable(id: string) {
  return request<RetailTableRecord>(`${tableBase}/${encodeURIComponent(id)}`);
}

export async function createRetailTable(data: RetailTableRequest) {
  return request<RetailTableRecord>(tableBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailTable(id: string, data: RetailTableRequest) {
  return request<RetailTableRecord>(`${tableBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailTable(id: string) {
  return request<{ id: string }>(`${tableBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
