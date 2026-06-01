export type GatewayProviderSpec = {
  provider: string;
  name: string;
  modes?: string[];
  secret_keys?: string[];
  secretKeys?: string[];
  supports_checkout?: boolean;
  supportsCheckout?: boolean;
  notice?: string;
};

export type GatewaySetting = {
  id: string;
  name?: string;
  display_name?: string;
  displayName?: string;
  provider: string;
  mode?: string;
  status?: boolean;
  active?: boolean;
  charge?: number;
  currency_id?: string;
  currencyId?: string;
  currency_code?: string;
  currencyCode?: string;
  phone_required?: boolean;
  phoneRequired?: boolean;
  instructions?: string;
  image?: string;
  image_ref?: string;
  imageRef?: string;
  secret_keys?: string[];
  secretKeys?: string[];
  has_secret_data?: Record<string, boolean>;
  hasSecretData?: Record<string, boolean>;
  credentials_configured?: Record<string, boolean>;
  credentialsConfigured?: Record<string, boolean>;
  supports_checkout?: boolean;
  supportsCheckout?: boolean;
  notice?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type GatewaySettingsReply = {
  data?: {
    gateways?: GatewaySetting[];
    providers?: GatewayProviderSpec[];
    currencies?: CurrencyOption[];
  };
  meta?: {
    total?: number;
    filter_size?: number;
    filterSize?: number;
  };
};

export type GatewaySettingReply = {
  message?: string;
  data?: GatewaySetting;
};

export type CurrencyOption = {
  id: string;
  name?: string;
  code?: string;
  symbol?: string;
};
