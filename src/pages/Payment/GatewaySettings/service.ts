import { request } from '@umijs/max';
import type { GatewaySettingReply, GatewaySettingsReply } from './types';

export async function listGatewaySettings(params?: Record<string, unknown>) {
  return request<GatewaySettingsReply>('/v1/payment/gateways', {
    method: 'GET',
    params,
  });
}

export async function updateGatewaySetting(provider: string, data: Record<string, unknown>) {
  return request<GatewaySettingReply>(`/v1/payment/gateways/${provider}`, {
    method: 'PUT',
    data,
  });
}
