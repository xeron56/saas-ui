import { request } from '@umijs/max';
import type { LegacyPayload, LegacyRecord } from './types';

export function fetchPublicContent<T extends LegacyPayload = LegacyPayload>(endpoint: string) {
  return request<T>(endpoint, { method: 'GET' });
}

export function postPublicContent<T extends LegacyPayload = LegacyPayload>(
  endpoint: string,
  data: LegacyRecord | FormData,
) {
  return request<T>(endpoint, {
    method: 'POST',
    data,
  });
}

export function putPublicContent<T extends LegacyPayload = LegacyPayload>(
  endpoint: string,
  data: LegacyRecord | FormData,
) {
  return request<T>(endpoint, {
    method: 'PUT',
    data,
  });
}

export function deletePublicContent<T extends LegacyPayload = LegacyPayload>(endpoint: string) {
  return request<T>(endpoint, {
    method: 'DELETE',
  });
}
