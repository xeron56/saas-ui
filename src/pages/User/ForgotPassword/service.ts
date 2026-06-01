import { request } from '@umijs/max';
import type {
  PasswordResetReply,
  PasswordResetRequest,
  SendResetCodeRequest,
  VerifyResetCodeRequest,
} from './types';

export async function sendResetCode(data: SendResetCodeRequest) {
  return request<PasswordResetReply>('/v1/auth/send-reset-code', {
    method: 'POST',
    data,
  });
}

export async function verifyResetCode(data: VerifyResetCodeRequest) {
  return request<PasswordResetReply>('/v1/auth/verify-reset-code', {
    method: 'POST',
    data,
  });
}

export async function resetPassword(data: PasswordResetRequest) {
  return request<PasswordResetReply>('/v1/auth/password-reset', {
    method: 'POST',
    data,
  });
}
