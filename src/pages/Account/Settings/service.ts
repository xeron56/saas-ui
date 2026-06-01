import { request } from '@umijs/max';
import type { AccountProfileReply, AccountProfileUpdate } from './types';

const accountProfileSettingsPath = '/v1/account/profile-settings';

export async function getAccountProfile() {
  return request<AccountProfileReply>(accountProfileSettingsPath);
}

export async function updateAccountProfile(data: AccountProfileUpdate) {
  return request<AccountProfileReply>(accountProfileSettingsPath, {
    method: 'PUT',
    data,
  });
}
