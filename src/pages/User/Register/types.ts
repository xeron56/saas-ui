export type SignupOTPSettings = {
  otp_status?: 'on' | 'off';
  otp_expiration_time?: string | number | null;
  otp_duration_type?: 'minute' | 'second' | null;
};

export type SignupOTPSettingsReply = {
  message?: string;
  data?: SignupOTPSettings;
  otp_required?: boolean;
  otp_expiration?: number;
};

export type EmailSignupRequest = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  web?: boolean;
};

export type SubmitSignupOTPRequest = {
  email: string;
  otp: string;
  web?: boolean;
};

export type ResendSignupOTPRequest = {
  email: string;
  name?: string;
};

export type EmailSignupReply = {
  message?: string;
  otp_required?: boolean;
  otp_expiration?: number;
  token?: string;
  access_token?: string;
};

export type BusinessCategory = {
  id: string;
  name?: string;
  display_name?: string;
  displayName?: string;
};

export type BusinessCategoryListReply = {
  data?: BusinessCategory[];
};

export type BusinessSetupRequest = {
  companyName: string;
  business_category_id: string;
  phoneNumber: string;
  address?: string;
  shopOpeningBalance?: number;
  plan_id?: string;
  plan_key?: string;
  price_id?: string;
};

export type BusinessSetupReply = {
  message?: string;
  redirect?: string | false;
  success_modal?: boolean;
  tenant?: {
    id?: string;
    name?: string;
  };
  data?: {
    tenant_id?: string;
    tenant_name?: string;
    tenant?: {
      id?: string;
      name?: string;
    };
  };
};
