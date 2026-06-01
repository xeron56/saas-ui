import { request } from '@umijs/max';
import type {
  BusinessCategoryListReply,
  BusinessSetupReply,
  BusinessSetupRequest,
  EmailSignupReply,
  EmailSignupRequest,
  ResendSignupOTPRequest,
  SignupOTPSettingsReply,
  SubmitSignupOTPRequest,
} from './types';

export async function getSignupOTPSettings() {
  return request<SignupOTPSettingsReply>('/v1/auth/otp-settings');
}

export async function signUpWithEmail(data: EmailSignupRequest) {
  return request<EmailSignupReply>('/v1/auth/sign-up', {
    method: 'POST',
    data,
  });
}

export async function submitSignupOTP(data: SubmitSignupOTPRequest) {
  return request<EmailSignupReply>('/v1/auth/submit-otp', {
    method: 'POST',
    data,
  });
}

export async function resendSignupOTP(data: ResendSignupOTPRequest) {
  return request<EmailSignupReply>('/v1/auth/resend-otp', {
    method: 'POST',
    data,
  });
}

export async function listBusinessCategories() {
  return request<BusinessCategoryListReply>('/v1/business-categories');
}

export async function businessSetup(data: BusinessSetupRequest) {
  return request<BusinessSetupReply>('/v1/business-setup', {
    method: 'POST',
    data,
  });
}
