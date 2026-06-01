import { request } from '@umijs/max';
import type { RetailSetupKind, RetailSetupListReply, RetailSetupReply } from './types';

const basePath = '/v1/retail/setup';

export async function listRetailSetupRecords(kind: RetailSetupKind, params?: Record<string, any>) {
  return request<RetailSetupListReply>(`${basePath}/${kind}`, { params });
}

export async function createRetailSetupRecord(kind: RetailSetupKind, data: Record<string, any>) {
  return request<RetailSetupReply>(`${basePath}/${kind}`, {
    method: 'POST',
    data,
  });
}

export async function updateRetailSetupRecord(
  kind: RetailSetupKind,
  id: string,
  data: Record<string, any>,
) {
  return request<RetailSetupReply>(`${basePath}/${kind}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailSetupRecord(kind: RetailSetupKind, id: string) {
  return request<RetailSetupReply>(`${basePath}/${kind}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
