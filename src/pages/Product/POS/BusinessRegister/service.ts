import { request } from '@umijs/max';
import type {
  RetailBusinessRegisterCloseRequest,
  RetailBusinessRegisterListReply,
  RetailBusinessRegisterOpenRequest,
  RetailBusinessRegisterRecord,
} from './types';

const businessRegisterBase = '/v1/retail/business-registers';

export async function listRetailBusinessRegisters(params: Record<string, any>) {
  return request<RetailBusinessRegisterListReply>(businessRegisterBase, { params });
}

export async function getRetailBusinessRegister(id: string) {
  return request<RetailBusinessRegisterRecord>(`${businessRegisterBase}/${encodeURIComponent(id)}`);
}

export async function openRetailBusinessRegister(data: RetailBusinessRegisterOpenRequest) {
  return request<RetailBusinessRegisterRecord>(`${businessRegisterBase}/open`, {
    method: 'POST',
    data,
  });
}

export async function closeRetailBusinessRegister(data: RetailBusinessRegisterCloseRequest) {
  return request<RetailBusinessRegisterRecord>(`${businessRegisterBase}/close`, {
    method: 'POST',
    data,
  });
}

export async function deleteRetailBusinessRegister(id: string) {
  return request<{ id: string }>(`${businessRegisterBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
