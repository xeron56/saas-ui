import { request } from '@umijs/max';
import type {
  CatalogItemListReply,
  RetailAddonGroupListReply,
  RetailAddonGroupRecord,
  RetailAddonGroupRequest,
} from './types';

const addonGroupBase = '/v1/retail/addon-groups';

export async function listRetailAddonGroups(params: Record<string, any>) {
  return request<RetailAddonGroupListReply>(addonGroupBase, { params });
}

export async function getRetailAddonGroup(id: string) {
  return request<RetailAddonGroupRecord>(`${addonGroupBase}/${encodeURIComponent(id)}`);
}

export async function createRetailAddonGroup(data: RetailAddonGroupRequest) {
  return request<RetailAddonGroupRecord>(addonGroupBase, {
    method: 'POST',
    data,
  });
}

export async function updateRetailAddonGroup(id: string, data: RetailAddonGroupRequest) {
  return request<RetailAddonGroupRecord>(`${addonGroupBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteRetailAddonGroup(id: string) {
  return request<{ id: string }>(`${addonGroupBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function listCatalogItems(params: Record<string, any>) {
  return request<CatalogItemListReply>('/v1/retail/catalog/items', { params });
}
