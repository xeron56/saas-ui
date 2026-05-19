import {
  CloudOutlined,
  FormOutlined,
  GlobalOutlined,
  MailOutlined,
  MessageOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  SettingOutlined,
  ToolOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
  Upload,
  message as toast,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type TabKey =
  | 'application'
  | 'appearance'
  | 'configuration'
  | 'registration'
  | 'storage'
  | 'mail'
  | 'sms'
  | 'maintenance'
  | 'cookie'
  | 'integrations'
  | 'security'
  | 'website'
  | 'cache';

type FieldType =
  | 'text'
  | 'email'
  | 'url'
  | 'textarea'
  | 'richtext'
  | 'password'
  | 'switch'
  | 'select'
  | 'color'
  | 'file';

type FieldSpec = {
  name: string;
  label: string;
  type?: FieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  rows?: number;
  span?: number;
  secret?: boolean;
  required?: boolean;
};

type ActionSpec = {
  label: string;
  endpoint: string;
  method?: 'GET' | 'POST';
};

type SettingsTab = {
  key: TabKey;
  label: string;
  path: string;
  pagePath: string;
  updatePath?: string;
  icon: ReactNode;
  fields: FieldSpec[];
  actions?: ActionSpec[];
};

type WebsiteSectionKey =
  | 'common'
  | 'banner'
  | 'whyJoin'
  | 'about'
  | 'gallery'
  | 'privacy'
  | 'cookie'
  | 'terms'
  | 'refund'
  | 'contact';

type WebsiteSection = {
  key: WebsiteSectionKey;
  label: string;
  path: string;
  fieldNames: string[];
};

type SettingsPageResponse = {
  title?: string;
  options?: Record<string, unknown>;
  imageOptions?: Record<string, string>;
  settings?: { option_key?: string; option_value?: string }[];
};

type LegacyResponse = {
  status?: boolean;
  message?: string;
  data?: unknown;
};

const enabledOptions = [
  { label: 'Enabled', value: '1' },
  { label: 'Disabled', value: '0' },
];

const storageOptions = [
  { label: 'Public', value: 'public' },
  { label: 'AWS S3', value: 's3' },
  { label: 'Wasabi', value: 'wasabi' },
  { label: 'Vultr', value: 'vultr' },
  { label: 'DigitalOcean Spaces', value: 'do' },
];

const mailEncryptionOptions = [
  { label: 'None', value: '' },
  { label: 'TLS', value: 'tls' },
  { label: 'SSL', value: 'ssl' },
];

const cacheActions: ActionSpec[] = [
  { label: 'Clear Views', endpoint: '/admin/setting/cache-update/1' },
  { label: 'Clear Routes', endpoint: '/admin/setting/cache-update/2' },
  { label: 'Clear Config', endpoint: '/admin/setting/cache-update/3' },
  { label: 'Clear Application Cache', endpoint: '/admin/setting/cache-update/4' },
  { label: 'Storage Link', endpoint: '/admin/setting/storage-link' },
];

const tabs: SettingsTab[] = [
  {
    key: 'application',
    label: 'Application',
    path: '/admin/setting/application-settings',
    pagePath: '/admin/setting/application-settings',
    updatePath: '/admin/setting/application-settings-update',
    icon: <SettingOutlined />,
    fields: [
      { name: 'app_name', label: 'Application Name', required: true },
      { name: 'APP_URL', label: 'Application URL', type: 'url' },
      { name: 'app_email', label: 'Application Email', type: 'email' },
      { name: 'app_contact_number', label: 'Contact Number' },
      { name: 'app_location', label: 'Location', span: 24 },
      { name: 'app_copyright', label: 'Copyright Text', span: 12 },
      { name: 'app_developed', label: 'Developed By', span: 12 },
      { name: 'app_timezone', label: 'Timezone', placeholder: 'UTC' },
    ],
  },
  {
    key: 'appearance',
    label: 'Appearance',
    path: '/admin/setting/color-settings',
    pagePath: '/admin/setting/color-settings',
    updatePath: '/admin/setting/application-settings-update',
    icon: <ToolOutlined />,
    fields: [
      {
        name: 'app_color_design_type',
        label: 'Color Design Type',
        type: 'select',
        options: [
          { label: 'Default', value: '1' },
          { label: 'Custom', value: '2' },
        ],
      },
      { name: 'app_primary_color', label: 'Primary Color', type: 'color' },
      { name: 'app_hover_color', label: 'Hover Color', type: 'color' },
      { name: 'app_text_color', label: 'Text Color', type: 'color' },
      { name: 'app_text_secondary_color', label: 'Secondary Text Color', type: 'color' },
      { name: 'app_sidebar_bg_color', label: 'Sidebar Background', type: 'color' },
      { name: 'app_sidebar_text_color', label: 'Sidebar Text', type: 'color' },
      { name: 'custom_css', label: 'Custom CSS', type: 'textarea', rows: 5, span: 24 },
      { name: 'custom_js', label: 'Custom JS', type: 'textarea', rows: 5, span: 24 },
    ],
  },
  {
    key: 'configuration',
    label: 'Configuration',
    path: '/admin/setting/configuration-settings',
    pagePath: '/admin/setting/configuration-settings',
    updatePath: '/admin/setting/configuration-settings-update',
    icon: <ToolOutlined />,
    fields: [
      { name: 'email_verification_status', label: 'Email Verification', type: 'switch' },
      { name: 'app_mail_status', label: 'Mail Notifications', type: 'switch' },
      { name: 'app_sms_status', label: 'SMS Notifications', type: 'switch' },
      { name: 'pusher_status', label: 'Pusher', type: 'switch' },
      { name: 'google_login_status', label: 'Google Login', type: 'switch' },
      { name: 'facebook_login_status', label: 'Facebook Login', type: 'switch' },
      { name: 'google_recaptcha_status', label: 'Google reCAPTCHA', type: 'switch' },
      { name: 'google_analytics_status', label: 'Google Analytics', type: 'switch' },
      { name: 'cookie_status', label: 'Cookie Consent', type: 'switch' },
      { name: 'two_factor_googleauth_status', label: 'Google 2FA', type: 'switch' },
      { name: 'app_preloader_status', label: 'Preloader', type: 'switch' },
      { name: 'disable_registration', label: 'Disable Registration', type: 'switch' },
      { name: 'registration_approval', label: 'Registration Approval', type: 'switch' },
      { name: 'show_language_switcher', label: 'Language Switcher', type: 'switch' },
      { name: 'app_debug', label: 'Debug Mode', type: 'switch' },
      { name: 'force_ssl', label: 'Force SSL', type: 'switch' },
    ],
  },
  {
    key: 'registration',
    label: 'Registration Form',
    path: '/admin/setting/registration-form-settings',
    pagePath: '/admin/setting/registration-form-settings',
    updatePath: '/admin/setting/registration-form-settings',
    icon: <FormOutlined />,
    fields: [
      { name: 'enable_batch', label: 'Batch Field', type: 'switch' },
      { name: 'enable_department', label: 'Department Field', type: 'switch' },
      { name: 'enable_passing_year', label: 'Passing Year Field', type: 'switch' },
      { name: 'enable_role_number', label: 'Roll Number Field', type: 'switch' },
      { name: 'enable_attachment', label: 'Attachment Field', type: 'switch' },
      { name: 'enable_date_of_birth', label: 'Date Of Birth Field', type: 'switch' },
      { name: 'enable_gender', label: 'Gender Field', type: 'switch' },
      { name: 'custom_fields', label: 'Custom Fields JSON', type: 'textarea', rows: 5, span: 24 },
    ],
  },
  {
    key: 'storage',
    label: 'Storage',
    path: '/admin/setting/storage-settings',
    pagePath: '/admin/setting/storage-settings',
    updatePath: '/admin/setting/storage-settings',
    icon: <CloudOutlined />,
    fields: [
      { name: 'STORAGE_DRIVER', label: 'Storage Driver', type: 'select', options: storageOptions },
      { name: 'AWS_ACCESS_KEY_ID', label: 'AWS Access Key' },
      { name: 'AWS_SECRET_ACCESS_KEY', label: 'AWS Secret Key', type: 'password', secret: true },
      { name: 'AWS_DEFAULT_REGION', label: 'AWS Region' },
      { name: 'AWS_BUCKET', label: 'AWS Bucket' },
      { name: 'WASABI_ACCESS_KEY_ID', label: 'Wasabi Access Key' },
      {
        name: 'WASABI_SECRET_ACCESS_KEY',
        label: 'Wasabi Secret Key',
        type: 'password',
        secret: true,
      },
      { name: 'WASABI_DEFAULT_REGION', label: 'Wasabi Region' },
      { name: 'WASABI_BUCKET', label: 'Wasabi Bucket' },
      { name: 'VULTR_ACCESS_KEY_ID', label: 'Vultr Access Key' },
      {
        name: 'VULTR_SECRET_ACCESS_KEY',
        label: 'Vultr Secret Key',
        type: 'password',
        secret: true,
      },
      { name: 'VULTR_DEFAULT_REGION', label: 'Vultr Region' },
      { name: 'VULTR_BUCKET', label: 'Vultr Bucket' },
      { name: 'DO_ACCESS_KEY_ID', label: 'DigitalOcean Access Key' },
      {
        name: 'DO_SECRET_ACCESS_KEY',
        label: 'DigitalOcean Secret Key',
        type: 'password',
        secret: true,
      },
      { name: 'DO_DEFAULT_REGION', label: 'DigitalOcean Region' },
      { name: 'DO_BUCKET', label: 'DigitalOcean Bucket' },
      { name: 'DO_FOLDER', label: 'DigitalOcean Folder' },
      { name: 'DO_CDN_ID', label: 'DigitalOcean CDN ID' },
    ],
    actions: [{ label: 'Storage Link', endpoint: '/admin/setting/storage-link' }],
  },
  {
    key: 'mail',
    label: 'Mail',
    path: '/admin/setting/mail-configuration',
    pagePath: '/admin/setting/mail-configuration',
    updatePath: '/admin/setting/mail-configuration',
    icon: <MailOutlined />,
    fields: [
      { name: 'MAIL_MAILER', label: 'Mailer', placeholder: 'smtp' },
      { name: 'MAIL_HOST', label: 'Host' },
      { name: 'MAIL_PORT', label: 'Port' },
      { name: 'MAIL_USERNAME', label: 'Username' },
      { name: 'MAIL_PASSWORD', label: 'Password', type: 'password', secret: true },
      {
        name: 'MAIL_ENCRYPTION',
        label: 'Encryption',
        type: 'select',
        options: mailEncryptionOptions,
      },
      { name: 'MAIL_FROM_ADDRESS', label: 'From Address', type: 'email' },
      { name: 'MAIL_FROM_NAME', label: 'From Name' },
    ],
    actions: [{ label: 'Test Mail Dry Run', endpoint: '/admin/setting/mail-test', method: 'POST' }],
  },
  {
    key: 'sms',
    label: 'SMS',
    path: '/admin/setting/sms-configuration',
    pagePath: '/admin/setting/sms-configuration',
    updatePath: '/admin/setting/sms-configuration',
    icon: <MessageOutlined />,
    fields: [
      { name: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID' },
      { name: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token', type: 'password', secret: true },
      { name: 'TWILIO_PHONE_NUMBER', label: 'Twilio Phone Number' },
    ],
    actions: [{ label: 'Test SMS Dry Run', endpoint: '/admin/setting/sms-test', method: 'POST' }],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    path: '/admin/setting/maintenance-mode-changes',
    pagePath: '/admin/setting/maintenance-mode-changes',
    updatePath: '/admin/setting/maintenance-mode-changes',
    icon: <SafetyCertificateOutlined />,
    fields: [
      {
        name: 'maintenance_mode',
        label: 'Maintenance Mode',
        type: 'select',
        options: [
          { label: 'Enabled', value: '1' },
          { label: 'Disabled', value: '2' },
        ],
      },
      {
        name: 'maintenance_secret_key',
        label: 'Maintenance Secret Key',
        type: 'password',
        secret: true,
      },
    ],
  },
  {
    key: 'cookie',
    label: 'Cookie',
    path: '/admin/setting/cookie-settings',
    pagePath: '/admin/setting/cookie-settings',
    updatePath: '/admin/setting/cookie-settings-update',
    icon: <SafetyCertificateOutlined />,
    fields: [
      { name: 'cookie_status', label: 'Cookie Consent', type: 'switch' },
      { name: 'cookie_consent_text', label: 'Consent Text', type: 'textarea', rows: 5, span: 24 },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    path: '/admin/setting/google-recaptcha-settings',
    pagePath: '/admin/setting/google-recaptcha-settings',
    updatePath: '/admin/setting/common-settings-update',
    icon: <GlobalOutlined />,
    fields: [
      { name: 'google_recaptcha_status', label: 'Google reCAPTCHA', type: 'switch' },
      { name: 'google_recaptcha_site_key', label: 'reCAPTCHA Site Key' },
      {
        name: 'google_recaptcha_secret_key',
        label: 'reCAPTCHA Secret Key',
        type: 'password',
        secret: true,
      },
      { name: 'google_analytics_status', label: 'Google Analytics', type: 'switch' },
      { name: 'google_analytics_tracking_id', label: 'Analytics Tracking ID' },
      { name: 'pusher_status', label: 'Pusher', type: 'switch' },
      { name: 'pusher_app_id', label: 'Pusher App ID' },
      { name: 'pusher_app_key', label: 'Pusher App Key' },
      { name: 'pusher_app_secret', label: 'Pusher Secret', type: 'password', secret: true },
      { name: 'pusher_cluster', label: 'Pusher Cluster' },
      { name: 'google_login_status', label: 'Google Login', type: 'switch' },
      { name: 'google_client_id', label: 'Google Client ID' },
      {
        name: 'google_client_secret',
        label: 'Google Client Secret',
        type: 'password',
        secret: true,
      },
      { name: 'facebook_login_status', label: 'Facebook Login', type: 'switch' },
      { name: 'facebook_client_id', label: 'Facebook Client ID' },
      {
        name: 'facebook_client_secret',
        label: 'Facebook Client Secret',
        type: 'password',
        secret: true,
      },
    ],
  },
  {
    key: 'security',
    label: 'Security',
    path: '/admin/setting/security-settings',
    pagePath: '/admin/setting/security-settings',
    updatePath: '/admin/setting/common-settings-update',
    icon: <SafetyCertificateOutlined />,
    fields: [
      { name: 'force_ssl', label: 'Force SSL', type: 'switch' },
      { name: 'app_debug', label: 'Debug Mode', type: 'switch' },
      { name: 'two_factor_googleauth_status', label: 'Google 2FA', type: 'switch' },
      { name: 'show_language_switcher', label: 'Language Switcher', type: 'switch' },
    ],
  },
  {
    key: 'website',
    label: 'Website Content',
    path: '/admin/setting/website-settings',
    pagePath: '/admin/setting/website-settings',
    updatePath: '/admin/setting/application-settings-update',
    icon: <GlobalOutlined />,
    fields: [
      { name: 'facebook_url', label: 'Site Facebook Url', type: 'url' },
      { name: 'linkedin_url', label: 'Site Linkedin Url', type: 'url' },
      { name: 'twitter_url', label: 'Site Twitter Url', type: 'url' },
      { name: 'instagram_url', label: 'Site Instagram Url', type: 'url' },
      { name: 'sign_up_left_text_title', label: 'Auth Page Title' },
      { name: 'join_our_community_title', label: 'Join Our Community Title' },
      {
        name: 'sign_up_left_text_subtitle',
        label: 'Auth Page Subtitle',
        type: 'textarea',
        rows: 3,
        span: 24,
      },
      {
        name: 'join_our_community_text',
        label: 'Join Our Community Text',
        type: 'textarea',
        rows: 3,
        span: 24,
      },
      { name: 'footer_left_text', label: 'Footer Left Text', type: 'textarea', rows: 4, span: 24 },
      { name: 'page_breadcrumb', label: 'Page Breadcrumb Background', type: 'file' },
      { name: 'upcoming_events_background', label: 'Our Upcoming Events Background', type: 'file' },
      { name: 'banner_title', label: 'Title', type: 'textarea', rows: 2, span: 12 },
      {
        name: 'banner_description',
        label: 'Description',
        type: 'textarea',
        rows: 3,
        span: 12,
      },
      {
        name: 'banner_background_breadcrumb',
        label: 'Banner Breadcrumb Background',
        type: 'file',
      },
      { name: 'join_us_left_title', label: 'Join Us Left Title', type: 'textarea', rows: 2 },
      {
        name: 'join_us_left_description',
        label: 'Join Us Left Description',
        type: 'richtext',
        rows: 3,
      },
      { name: 'join_us_left_icon', label: 'Join Us Left Icon', type: 'file' },
      { name: 'join_us_middle_title', label: 'Join Us Middle Title', type: 'textarea', rows: 2 },
      {
        name: 'join_us_middle_description',
        label: 'Join Us Middle Description',
        type: 'richtext',
        rows: 3,
      },
      { name: 'join_us_middle_icon', label: 'Join Us Middle Icon', type: 'file' },
      { name: 'join_us_right_title', label: 'Join Us Right Title', type: 'textarea', rows: 2 },
      {
        name: 'join_us_right_description',
        label: 'Join Us Right Description',
        type: 'richtext',
        rows: 3,
      },
      { name: 'join_us_right_icon', label: 'Join Us Right Icon', type: 'file' },
      { name: 'about_us_title', label: 'Title', type: 'textarea', rows: 2, span: 12 },
      {
        name: 'about_us_description',
        label: 'Description',
        type: 'richtext',
        rows: 3,
        span: 12,
      },
      {
        name: 'about_us_background_breadcrumb',
        label: 'About Us Breadcrumb Background',
        type: 'file',
      },
      {
        name: 'privacy_policy_title',
        label: 'Title',
        type: 'textarea',
        rows: 2,
        span: 12,
      },
      {
        name: 'privacy_policy_description',
        label: 'Description',
        type: 'richtext',
        rows: 4,
        span: 12,
      },
      {
        name: 'cookie_policy_title',
        label: 'Title',
        type: 'textarea',
        rows: 2,
        span: 12,
      },
      {
        name: 'cookie_policy_description',
        label: 'Description',
        type: 'richtext',
        rows: 4,
        span: 12,
      },
      { name: 'terms_condition_title', label: 'Title', type: 'textarea', rows: 2, span: 12 },
      {
        name: 'terms_condition_description',
        label: 'Description',
        type: 'richtext',
        rows: 4,
        span: 12,
      },
      {
        name: 'refund_policy_title',
        label: 'Title',
        type: 'textarea',
        rows: 2,
        span: 12,
      },
      {
        name: 'refund_policy_description',
        label: 'Description',
        type: 'richtext',
        rows: 4,
        span: 12,
      },
    ],
  },
  {
    key: 'cache',
    label: 'Cache',
    path: '/admin/setting/cache-settings',
    pagePath: '/admin/setting/cache-settings',
    icon: <ReloadOutlined />,
    fields: [],
    actions: cacheActions,
  },
];

const websiteSections: WebsiteSection[] = [
  {
    key: 'common',
    label: 'Common Setting',
    path: '/admin/setting/website-settings',
    fieldNames: [
      'facebook_url',
      'linkedin_url',
      'twitter_url',
      'instagram_url',
      'sign_up_left_text_title',
      'join_our_community_title',
      'sign_up_left_text_subtitle',
      'join_our_community_text',
      'footer_left_text',
      'page_breadcrumb',
      'upcoming_events_background',
    ],
  },
  {
    key: 'banner',
    label: 'Banner Setting',
    path: '/admin/setting/website-settings/banner-setting',
    fieldNames: ['banner_title', 'banner_description', 'banner_background_breadcrumb'],
  },
  {
    key: 'whyJoin',
    label: 'Why Join With Us',
    path: '/admin/setting/website-settings/why-you-should-join-us',
    fieldNames: [
      'join_us_left_title',
      'join_us_left_description',
      'join_us_left_icon',
      'join_us_middle_title',
      'join_us_middle_description',
      'join_us_middle_icon',
      'join_us_right_title',
      'join_us_right_description',
      'join_us_right_icon',
    ],
  },
  {
    key: 'about',
    label: 'About Us',
    path: '/admin/setting/website-settings/about-us',
    fieldNames: ['about_us_title', 'about_us_description', 'about_us_background_breadcrumb'],
  },
  {
    key: 'gallery',
    label: 'Image Gallery',
    path: '/admin/setting/website-settings/image-galleries',
    fieldNames: [],
  },
  {
    key: 'privacy',
    label: 'Privacy Policy',
    path: '/admin/setting/website-settings/privacy-policy',
    fieldNames: ['privacy_policy_title', 'privacy_policy_description'],
  },
  {
    key: 'cookie',
    label: 'Cookie Policy',
    path: '/admin/setting/website-settings/cookie-policy',
    fieldNames: ['cookie_policy_title', 'cookie_policy_description'],
  },
  {
    key: 'terms',
    label: 'Terms And Condition',
    path: '/admin/setting/website-settings/terms-condition',
    fieldNames: ['terms_condition_title', 'terms_condition_description'],
  },
  {
    key: 'refund',
    label: 'Refund Policy',
    path: '/admin/setting/website-settings/refund-policy',
    fieldNames: ['refund_policy_title', 'refund_policy_description'],
  },
  {
    key: 'contact',
    label: 'Contact Us',
    path: '/admin/setting/website-settings/contact-us',
    fieldNames: [],
  },
];

const hiddenPathToTab: { path: string; key: TabKey }[] = [
  { path: '/admin/setting/configuration-settings/configure', key: 'configuration' },
  { path: '/admin/setting/configuration-settings/help', key: 'configuration' },
  { path: '/admin/setting/cache-update', key: 'cache' },
  { path: '/admin/setting/storage-link', key: 'storage' },
  { path: '/admin/setting/google-analytics-settings', key: 'integrations' },
  { path: '/admin/setting/live-chat-settings', key: 'integrations' },
  { path: '/admin/setting/website-settings/banner-setting', key: 'website' },
  { path: '/admin/setting/website-settings/why-you-should-join-us', key: 'website' },
  { path: '/admin/setting/website-settings/about-us', key: 'website' },
  { path: '/admin/setting/website-settings/privacy-policy', key: 'website' },
  { path: '/admin/setting/website-settings/cookie-policy', key: 'website' },
  { path: '/admin/setting/website-settings/terms-condition', key: 'website' },
  { path: '/admin/setting/website-settings/refund-policy', key: 'website' },
  { path: '/admin/setting/website-settings/contact-us', key: 'website' },
];

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function enabledValue(value: unknown) {
  const plain = textValue(value).toLowerCase();
  return plain === '1' || plain === 'true' || plain === 'enabled' || plain === 'active';
}

function tabByKey(key: TabKey) {
  return tabs.find((tab) => tab.key === key) || tabs[0];
}

function websiteSectionFromPath(pathname: string) {
  return (
    websiteSections.find(
      (section) => section.key !== 'common' && pathname.startsWith(section.path),
    ) || websiteSections[0]
  );
}

function fieldsForWebsiteSection(section: WebsiteSection) {
  const fields = tabByKey('website').fields;
  if (!section.fieldNames.length) {
    return [];
  }
  const names = new Set(section.fieldNames);
  return fields.filter((field) => names.has(field.name));
}

function tabForPath(key: TabKey, pathname: string): SettingsTab {
  const tab = tabByKey(key);
  if (key !== 'website') {
    return tab;
  }
  const section = websiteSectionFromPath(pathname);
  return {
    ...tab,
    label: section.label,
    path: section.path,
    pagePath: section.path,
    fields: fieldsForWebsiteSection(section),
  };
}

function activeTabFromPath(pathname: string): TabKey {
  const hiddenMatch = hiddenPathToTab.find((item) => pathname.startsWith(item.path));
  if (hiddenMatch) {
    return hiddenMatch.key;
  }
  return tabs.find((tab) => pathname.startsWith(tab.path))?.key || 'application';
}

function optionsFromResponse(response: SettingsPageResponse) {
  if (response.options && typeof response.options === 'object') {
    return response.options;
  }
  const options: Record<string, unknown> = {};
  (response.settings || []).forEach((row) => {
    const key = textValue(row.option_key);
    if (key) {
      options[key] = row.option_value;
    }
  });
  return options;
}

function valuesFromOptions(fields: FieldSpec[], options: Record<string, unknown>) {
  return fields.reduce<Record<string, unknown>>((values, field) => {
    if (field.secret) {
      values[field.name] = undefined;
    } else if (field.type === 'file') {
      values[field.name] = undefined;
    } else if (field.type === 'switch') {
      values[field.name] = enabledValue(options[field.name]);
    } else {
      values[field.name] = textValue(options[field.name]);
    }
    return values;
  }, {});
}

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function selectedFile(files?: UploadFile[]) {
  return files?.find((file) => file.originFileObj)?.originFileObj;
}

function buildPayload(fields: FieldSpec[], values: Record<string, unknown>) {
  const hasSelectedFile = fields.some(
    (field) => field.type === 'file' && selectedFile(values[field.name] as UploadFile[]),
  );
  if (hasSelectedFile) {
    const formData = new FormData();
    fields.forEach((field) => {
      const value = values[field.name];
      if (field.type === 'file') {
        const file = selectedFile(value as UploadFile[]);
        if (file) {
          formData.append(field.name, file);
        }
        return;
      }
      if (field.type === 'switch') {
        formData.append(field.name, value ? '1' : '0');
        return;
      }
      if (field.secret && !textValue(value)) {
        return;
      }
      formData.append(
        field.name,
        field.type === 'richtext' ? sanitizeRichText(textValue(value)) : textValue(value),
      );
    });
    return formData;
  }
  return fields.reduce<Record<string, unknown>>((payload, field) => {
    const value = values[field.name];
    if (field.type === 'file') {
      return payload;
    }
    if (field.type === 'switch') {
      payload[field.name] = value ? '1' : '0';
      return payload;
    }
    if (field.secret && !textValue(value)) {
      return payload;
    }
    payload[field.name] =
      field.type === 'richtext' ? sanitizeRichText(textValue(value)) : textValue(value);
    return payload;
  }, {});
}

function renderField(field: FieldSpec, imageOptions: Record<string, string>) {
  if (field.type === 'textarea') {
    return <Input.TextArea rows={field.rows || 4} placeholder={field.placeholder} />;
  }
  if (field.type === 'richtext') {
    return <RichTextInput rows={field.rows || 4} />;
  }
  if (field.type === 'password') {
    return (
      <Input.Password
        autoComplete="new-password"
        placeholder={field.placeholder || 'Stored value preserved'}
      />
    );
  }
  if (field.type === 'switch') {
    return <Switch />;
  }
  if (field.type === 'select') {
    return <Select options={field.options || enabledOptions} />;
  }
  if (field.type === 'color') {
    return <Input type="color" />;
  }
  if (field.type === 'file') {
    const preview = imageOptions[field.name];
    return (
      <Space direction="vertical" size={8}>
        {preview ? (
          <Image src={preview} width={96} height={64} style={{ objectFit: 'cover' }} />
        ) : null}
        <Upload
          beforeUpload={(file) => {
            const allowed = ['image/jpeg', 'image/png'].includes(file.type);
            if (!allowed) {
              toast.error('Only JPG and PNG images are supported.');
              return Upload.LIST_IGNORE;
            }
            return false;
          }}
          maxCount={1}
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        >
          <Button icon={<UploadOutlined />}>Choose image</Button>
        </Upload>
      </Space>
    );
  }
  return <Input type={field.type || 'text'} placeholder={field.placeholder} />;
}

export default function AdminGeneralSettings() {
  const location = useLocation();
  const activeKey = activeTabFromPath(location.pathname);
  const activeTab = tabForPath(activeKey, location.pathname);
  const activeWebsiteSection = websiteSectionFromPath(location.pathname);
  const [form] = Form.useForm<Record<string, unknown>>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState(activeTab.label);
  const [imageOptions, setImageOptions] = useState<Record<string, string>>({});
  const directActionRef = useRef('');
  const directAction = activeTab.actions?.find((action) => action.endpoint === location.pathname);

  const loadSettings = async (tab: SettingsTab = activeTab) => {
    setLoading(true);
    setError('');
    try {
      const response = await request<SettingsPageResponse>(`${tab.pagePath}?ajax=1`);
      const options = optionsFromResponse(response);
      form.setFieldsValue(valuesFromOptions(tab.fields, options));
      setPageTitle(tab.key === 'website' ? tab.label : textValue(response.title) || tab.label);
      setImageOptions(response.imageOptions || {});
    } catch (err: any) {
      setError(err?.message || `${tab.label} settings could not be loaded.`);
      form.resetFields();
      setImageOptions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.resetFields();
    loadSettings(activeTab);
  }, [location.pathname]);

  const submitSettings = async (values: Record<string, unknown>) => {
    if (!activeTab.updatePath) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload(activeTab.fields, values);
      const response = await request<LegacyResponse>(activeTab.updatePath, {
        method: 'POST',
        data: payload,
      });
      if (response.status === false) {
        setError(textValue(response.message) || `${activeTab.label} settings could not be saved.`);
        return;
      }
      toast.success(textValue(response.message) || `${activeTab.label} settings saved.`);
      await loadSettings(activeTab);
    } catch (err: any) {
      setError(err?.message || `${activeTab.label} settings could not be saved.`);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: ActionSpec, redirectPath?: string) => {
    setActionLoading(action.endpoint);
    setError('');
    try {
      const response = await request<LegacyResponse>(action.endpoint, {
        method: action.method || 'GET',
        data: action.method === 'POST' ? {} : undefined,
      });
      if (response.status === false) {
        setError(textValue(response.message) || `${action.label} could not be processed.`);
        return;
      }
      toast.success(textValue(response.message) || `${action.label} processed.`);
      await loadSettings(activeTab);
    } catch (err: any) {
      setError(err?.message || `${action.label} could not be processed.`);
    } finally {
      setActionLoading('');
      if (redirectPath && location.pathname === action.endpoint) {
        history.replace(redirectPath);
      }
    }
  };

  useEffect(() => {
    if (!directAction) {
      directActionRef.current = '';
      return;
    }
    if (directActionRef.current === directAction.endpoint) {
      return;
    }
    directActionRef.current = directAction.endpoint;
    void runAction(directAction, activeTab.path);
  }, [directAction?.endpoint]);

  return (
    <PageContainer title="General Settings">
      {error ? <Alert style={{ marginBottom: 16 }} type="error" showIcon message={error} /> : null}

      <Tabs
        activeKey={activeKey}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: (
            <Space size={6}>
              {tab.icon}
              {tab.label}
            </Space>
          ),
        }))}
        onChange={(key) => history.push(tabByKey(key as TabKey).path)}
      />

      {activeKey === 'website' ? (
        <Tabs
          activeKey={activeWebsiteSection.key}
          size="small"
          items={websiteSections.map((section) => ({
            key: section.key,
            label: section.label,
          }))}
          onChange={(key) => {
            const section = websiteSections.find((item) => item.key === key);
            if (section) {
              history.push(section.path);
            }
          }}
        />
      ) : null}

      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="center">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {pageTitle}
          </Typography.Title>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={() => loadSettings(activeTab)}
          >
            Refresh
          </Button>
        </Space>

        {activeTab.actions?.length ? (
          <>
            <Divider />
            <Space wrap>
              {activeTab.actions.map((action) => (
                <Button
                  key={action.endpoint}
                  icon={<ToolOutlined />}
                  loading={actionLoading === action.endpoint}
                  onClick={() => runAction(action)}
                >
                  {action.label}
                </Button>
              ))}
            </Space>
          </>
        ) : null}

        {activeTab.fields.length ? (
          <>
            <Divider />
            <Form
              form={form}
              layout="vertical"
              disabled={loading}
              onFinish={submitSettings}
              preserve={false}
            >
              <Row gutter={16}>
                {activeTab.fields.map((field) => (
                  <Col key={field.name} xs={24} md={field.span || 12}>
                    <Form.Item
                      name={field.name}
                      label={field.label}
                      valuePropName={
                        field.type === 'switch'
                          ? 'checked'
                          : field.type === 'file'
                          ? 'fileList'
                          : 'value'
                      }
                      getValueFromEvent={field.type === 'file' ? normalizeUploadEvent : undefined}
                      rules={
                        field.required
                          ? [{ required: true, message: `${field.label} is required.` }]
                          : []
                      }
                    >
                      {renderField(field, imageOptions)}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  Save
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => loadSettings(activeTab)}>
                  Reset
                </Button>
              </Space>
            </Form>
          </>
        ) : null}
      </div>
    </PageContainer>
  );
}
