import { request } from '@umijs/max';
import type {
  RetailDueCollection,
  RetailDueCollectionListReply,
  RetailDueCollectionRequest,
  RetailOpenDueInvoiceReply,
} from './types';

const dueCollectionBase = '/v1/retail/due-collections';

export async function listRetailDueCollections(params: Record<string, any>) {
  return request<RetailDueCollectionListReply>(dueCollectionBase, { params });
}

export async function getRetailDueCollection(id: string) {
  return request<RetailDueCollection>(`${dueCollectionBase}/${encodeURIComponent(id)}`);
}

export async function createRetailDueCollection(data: RetailDueCollectionRequest) {
  return request<RetailDueCollection>(dueCollectionBase, {
    method: 'POST',
    data,
  });
}

export async function listRetailOpenDueInvoices(params: Record<string, any>) {
  return request<RetailOpenDueInvoiceReply>(`${dueCollectionBase}/open-invoices`, { params });
}
