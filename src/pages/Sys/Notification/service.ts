import { request } from '@umijs/max';
import type {
  AdminNotificationListReply,
  AdminNotificationReadAllReply,
  AdminNotificationReply,
} from './types';

const basePath = '/v1/realtime/notification-center';

export async function listAdminNotifications(params?: Record<string, any>) {
  return request<AdminNotificationListReply>(basePath, { params });
}

export async function getAdminNotification(id: string) {
  return request<AdminNotificationReply>(`${basePath}/${id}`);
}

export async function readAllAdminNotifications() {
  return request<AdminNotificationReadAllReply>(`${basePath}/read-all`, {
    method: 'POST',
  });
}
