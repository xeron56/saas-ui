import { request } from '@umijs/max';
import type { StaffMessageReply, StaffUserReply, StaffUserRequest, StaffUsersReply } from './types';

const staffUsersBase = '/v1/users';

export async function listStaffUsers() {
  return request<StaffUsersReply>(staffUsersBase);
}

export async function createStaffUser(data: StaffUserRequest) {
  return request<StaffUserReply>(staffUsersBase, {
    method: 'POST',
    data,
  });
}

export async function updateStaffUser(id: string, data: StaffUserRequest) {
  return request<StaffUserReply>(`${staffUsersBase}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteStaffUser(id: string) {
  return request<StaffMessageReply>(`${staffUsersBase}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
