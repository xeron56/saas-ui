import { request } from '@umijs/max';
import type {
  CatalogItem,
  CatalogItemRequest,
  CatalogListReply,
  CatalogStockListReply,
  CatalogStockAdjustmentRequest,
  CatalogStockLot,
  CatalogLookupReply,
  CatalogImportReply,
} from './types';

const catalogBase = '/v1/retail/catalog';

export async function listCatalogItems(params: Record<string, any>) {
  return request<CatalogListReply>(`${catalogBase}/items`, { params });
}

export async function listCatalogStock(params: Record<string, any>) {
  return request<CatalogStockListReply>(`${catalogBase}/stock`, { params });
}

export async function getCatalogItem(id: string) {
  return request<CatalogItem>(`${catalogBase}/items/${encodeURIComponent(id)}`);
}

export async function createCatalogItem(data: CatalogItemRequest) {
  return request<CatalogItem>(`${catalogBase}/items`, {
    method: 'POST',
    data,
  });
}

export async function importCatalogItems(file: File) {
  const data = new FormData();
  data.append('file', file);
  return request<CatalogImportReply>(`${catalogBase}/items/import`, {
    method: 'POST',
    data,
  });
}

export async function updateCatalogItem(id: string, data: CatalogItemRequest) {
  return request<CatalogItem>(`${catalogBase}/items/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCatalogItem(id: string) {
  return request<{ id: string }>(`${catalogBase}/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function getCatalogLookups() {
  return request<CatalogLookupReply>(`${catalogBase}/lookups`);
}

export async function getNextCatalogCode() {
  return request<{ item_code?: string }>(`${catalogBase}/items/next-code`);
}

export async function adjustCatalogLot(id: string, data: CatalogStockAdjustmentRequest) {
  return request<CatalogStockLot>(`${catalogBase}/lots/${encodeURIComponent(id)}/adjust`, {
    method: 'POST',
    data,
  });
}
