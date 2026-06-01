import { request } from '@umijs/max';
import type { POSSetupKind, POSSetupListReply, POSSetupReply } from './types';

const basePath = '/v1/retail/setup';

export async function listPOSSetupRecords(kind: POSSetupKind, params?: Record<string, any>) {
  return request<POSSetupListReply>(`${basePath}/${kind}`, { params });
}

export async function createPOSSetupRecord(kind: POSSetupKind, data: Record<string, any>) {
  return request<POSSetupReply>(`${basePath}/${kind}`, {
    method: 'POST',
    data,
  });
}

export async function updatePOSSetupRecord(
  kind: POSSetupKind,
  id: string,
  data: Record<string, any>,
) {
  return request<POSSetupReply>(`${basePath}/${kind}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deletePOSSetupRecord(kind: POSSetupKind, id: string) {
  return request<POSSetupReply>(`${basePath}/${kind}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
