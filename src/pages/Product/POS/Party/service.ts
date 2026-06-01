import { request } from '@umijs/max';
import type {
  RetailPartner,
  RetailPartnerLedgerReply,
  RetailPartnerListReply,
  RetailPartnerRequest,
} from './types';

const partnerBase = '/v1/retail/partners';

export async function listRetailPartners(params: Record<string, any>) {
  return request<RetailPartnerListReply>(partnerBase, { params });
}

export async function getRetailPartner(id: string) {
  return request<RetailPartner>(`${partnerBase}/${encodeURIComponent(id)}`);
}

export async function createRetailPartner(data: RetailPartnerRequest) {
  return request<RetailPartner>(partnerBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailPartner(id: string, data: RetailPartnerRequest) {
  return request<RetailPartner>(`${partnerBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailPartner(id: string) {
  return request<{ id: string }>(`${partnerBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function getRetailPartnerLedger(id: string, params?: Record<string, any>) {
  return request<RetailPartnerLedgerReply>(`${partnerBase}/${encodeURIComponent(id)}/ledger`, {
    params,
  });
}
