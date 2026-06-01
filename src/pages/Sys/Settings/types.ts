export type OptionSetting = {
  id?: string;
  key?: string;
  value?: Record<string, any>;
  status?: boolean;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
};

export type LanguageOption = {
  id?: string;
  name?: string;
  locale_code?: string;
  localeCode?: string;
  code?: string;
  status?: boolean;
};

export type SettingsIndexReply = {
  data?: {
    general?: OptionSetting;
    languages?: LanguageOption[];
  };
};

export type ManageSettingsReply = {
  data?: {
    otp?: OptionSetting;
    domain?: OptionSetting;
  };
};

export type SystemSettingsReply = {
  data?: {
    settings?: Record<string, any>;
    redacted?: string[];
  };
};

export type OptionSettingReply = {
  message?: string;
  data?: OptionSetting;
};

export type SettingsAssetReply = {
  url?: string;
  path?: string;
  data?: {
    url?: string;
    path?: string;
  };
};
