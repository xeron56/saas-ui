import { request } from '@umijs/max';
import type {
  AdminListReply,
  CurrencyRecord,
  CurrencyReply,
  LanguageRecord,
  LanguageReply,
} from './types';

export async function listCurrencies(params?: Record<string, any>) {
  return request<AdminListReply<CurrencyRecord>>('/v1/sys/currencies', { params });
}

export async function createCurrency(data: Record<string, any>) {
  return request<CurrencyReply>('/v1/sys/currencies', { method: 'POST', data });
}

export async function updateCurrency(id: string, data: Record<string, any>) {
  return request<CurrencyReply>(`/v1/sys/currencies/${id}`, { method: 'PUT', data });
}

export async function setDefaultCurrency(id: string) {
  return request<CurrencyReply>(`/v1/sys/currencies/default/${id}`, { method: 'POST' });
}

export async function deleteCurrency(id: string) {
  return request(`/v1/sys/currencies/${id}`, { method: 'DELETE' });
}

export async function deleteCurrencies(ids: string[]) {
  return request('/v1/sys/currencies/delete-all', {
    method: 'POST',
    data: { ids },
  });
}

export async function listLanguages(params?: Record<string, any>) {
  return request<AdminListReply<LanguageRecord>>('/v1/sys/languages', { params });
}

export async function createLanguage(data: Record<string, any>) {
  return request<LanguageReply>('/v1/sys/languages', { method: 'POST', data });
}

export async function updateLanguage(id: string, data: Record<string, any>) {
  return request<LanguageReply>(`/v1/sys/languages/${id}`, { method: 'PUT', data });
}

export async function updateLanguageStatus(id: string, status: boolean) {
  return request<LanguageReply>(`/v1/sys/languages/status/${id}`, {
    method: 'POST',
    data: { status },
  });
}

export async function deleteLanguage(id: string) {
  return request(`/v1/sys/languages/${id}`, { method: 'DELETE' });
}

export async function deleteLanguages(ids: string[]) {
  return request('/v1/sys/languages/delete-all', {
    method: 'POST',
    data: { ids },
  });
}
