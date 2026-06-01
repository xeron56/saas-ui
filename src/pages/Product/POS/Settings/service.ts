import { request } from '@umijs/max';
import type { RetailSettings, RetailSettingsRequest } from './types';

const settingsBase = '/v1/retail/settings';

export async function getRetailSettings() {
  return request<RetailSettings>(settingsBase);
}

export async function updateRetailSettings(data: RetailSettingsRequest) {
  return request<RetailSettings>(settingsBase, {
    method: 'PUT',
    data,
  });
}
