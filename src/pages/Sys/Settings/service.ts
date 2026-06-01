import { request } from '@umijs/max';
import type {
  ManageSettingsReply,
  OptionSettingReply,
  SettingsAssetReply,
  SettingsIndexReply,
  SystemSettingsReply,
} from './types';

const basePath = '/v1/sys/host-settings';

export async function getSettings() {
  return request<SettingsIndexReply>(`${basePath}/settings`);
}

export async function updateGeneralSettings(id: string, data: Record<string, any>) {
  return request<OptionSettingReply>(`${basePath}/settings/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function uploadSettingsAsset(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<SettingsAssetReply>(`${basePath}/settings/assets`, {
    method: 'POST',
    data: formData,
  });
}

export async function getManageSettings() {
  return request<ManageSettingsReply>(`${basePath}/manage-settings`);
}

export async function updateOTPSettings(data: Record<string, any>) {
  return request<OptionSettingReply>(`${basePath}/manage-settings`, {
    method: 'POST',
    data,
  });
}

export async function updateDomainSettings(data: Record<string, any>) {
  return request<OptionSettingReply>(`${basePath}/manage-settings/domain`, {
    method: 'POST',
    data,
  });
}

export async function getSystemSettings() {
  return request<SystemSettingsReply>(`${basePath}/system-settings`);
}

export async function updateSystemSettings(data: Record<string, any>) {
  return request<SystemSettingsReply>(`${basePath}/system-settings`, {
    method: 'POST',
    data,
  });
}
