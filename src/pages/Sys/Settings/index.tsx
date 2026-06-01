import {
  ApartmentOutlined,
  GlobalOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Upload,
  message,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  getManageSettings,
  getSettings,
  getSystemSettings,
  updateDomainSettings,
  updateGeneralSettings,
  updateOTPSettings,
  updateSystemSettings,
  uploadSettingsAsset,
} from './service';
import type {
  LanguageOption,
  ManageSettingsReply,
  SettingsIndexReply,
  SystemSettingsReply,
} from './types';

const panelStyle: React.CSSProperties = {
  padding: 16,
  background: '#fff',
  border: '1px solid #f0f0f0',
  borderRadius: 8,
};

const field = <T,>(record: Record<string, any> | undefined, snake: string, camel: string) =>
  (record?.[snake] ?? record?.[camel]) as T | undefined;

const optionValue = (record?: { value?: Record<string, any> }) => record?.value ?? {};

const nilUUID = '00000000-0000-0000-0000-000000000000';

const onOffToBool = (value?: unknown) =>
  value === true || value === 'on' || value === 'true' || value === '1';

const boolToOnOff = (value?: boolean) => (value ? 'on' : 'off');

const boolToString = (value?: boolean) => (value ? 'true' : 'false');

const languageCode = (record: LanguageOption) =>
  field<string>(record, 'locale_code', 'localeCode') ?? record.code ?? '';

const languageName = (record: LanguageOption) => record.name ?? languageCode(record);

const uploadedURL = (resp: { url?: string; data?: { url?: string } }) =>
  resp.url ?? resp.data?.url ?? '';

const readSystemBool = (settings: Record<string, any> | undefined, key: string) =>
  settings?.[key] === true ||
  settings?.[key] === 'true' ||
  settings?.[key] === '1' ||
  settings?.[key] === 'on';

const readSystemNumber = (settings: Record<string, any> | undefined, key: string) => {
  const value = settings?.[key];
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const booleanSystemFields = ['APP_DEBUG', 'QUEUE_MAIL', 'FORCE_USER_TO_PURCHASE_PLAN'];

const numberSystemFields = [
  'MAIL_PORT',
  'SESSION_LIFETIME',
  'CACHE_LIFETIME',
  'UNSUBSCRIBE_AFTER_DAYS',
  'WKHTMLTOPDF_TIMEOUT',
];

const systemFieldGroups = [
  {
    title: 'Application',
    fields: ['APP_NAME', 'APP_ENV', 'APP_URL', 'DEFAULT_LANG', 'TIMEZONE'],
  },
  {
    title: 'Runtime',
    fields: [
      'APP_DEBUG',
      'QUEUE_MAIL',
      'FORCE_USER_TO_PURCHASE_PLAN',
      'CACHE_DRIVER',
      'QUEUE_CONNECTION',
      'SESSION_DRIVER',
      'SESSION_LIFETIME',
      'CACHE_LIFETIME',
      'FILESYSTEM_DISK',
      'UNSUBSCRIBE_AFTER_DAYS',
    ],
  },
  {
    title: 'Mail',
    fields: [
      'MAIL_DRIVER_TYPE',
      'MAIL_HOST',
      'MAIL_PORT',
      'MAIL_USERNAME',
      'MAIL_ENCRYPTION',
      'MAIL_FROM_ADDRESS',
      'MAIL_FROM_NAME',
    ],
  },
  {
    title: 'Storage',
    fields: [
      'AWS_ACCESS_KEY_ID',
      'AWS_DEFAULT_REGION',
      'AWS_BUCKET',
      'WAS_ACCESS_KEY_ID',
      'WAS_DEFAULT_REGION',
      'WAS_BUCKET',
      'WAS_ENDPOINT',
    ],
  },
  {
    title: 'Integrations',
    fields: [
      'GOOGLE_CLIENT_ID',
      'TWITTER_CLIENT_ID',
      'WKHTMLTOPDF_BINARY',
      'WKHTMLTOIMAGE_BINARY',
      'WKHTMLTOPDF_TIMEOUT',
      'ANALYTICS_VIEW_ID',
      'GA_MEASUREMENT_ID',
      'NOCAPTCHA_SITEKEY',
    ],
  },
];

const systemFieldNames = systemFieldGroups.flatMap((group) => group.fields);

const SettingsPage: React.FC = () => {
  const intl = useIntl();
  const [generalForm] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [domainForm] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [settings, setSettings] = useState<SettingsIndexReply>();
  const [systemSettings, setSystemSettings] = useState<SystemSettingsReply>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });
  const uploadGeneralAsset = (name: string) => (
    <Upload
      showUploadList={false}
      beforeUpload={async (file) => {
        const resp = await uploadSettingsAsset(file as File);
        const url = uploadedURL(resp);
        if (url) {
          generalForm.setFieldValue(name, url);
          message.success(t('common.uploaded', 'Uploaded'));
        }
        return Upload.LIST_IGNORE;
      }}
    >
      <Button icon={<UploadOutlined />}>{t('common.upload', 'Upload')}</Button>
    </Upload>
  );

  const languageOptions = useMemo(
    () =>
      (settings?.data?.languages ?? [])
        .map((item) => ({
          label: languageName(item),
          value: languageCode(item),
        }))
        .filter((item) => item.value),
    [settings?.data?.languages],
  );

  const applyForms = (
    settingsResp: SettingsIndexReply,
    manageResp: ManageSettingsReply,
    systemResp: SystemSettingsReply,
  ) => {
    const general = optionValue(settingsResp.data?.general);
    generalForm.setFieldsValue(general);

    const otp = optionValue(manageResp.data?.otp);
    otpForm.setFieldsValue({
      otp_status: onOffToBool(otp.otp_status),
      otp_expiration_time: otp.otp_expiration_time ? Number(otp.otp_expiration_time) : undefined,
      otp_duration_type: otp.otp_duration_type ?? 'minute',
    });

    const domain = optionValue(manageResp.data?.domain);
    domainForm.setFieldsValue({
      ssl_required: onOffToBool(domain.ssl_required),
      automatic_approve: onOffToBool(domain.automatic_approve),
    });

    const runtime = systemResp.data?.settings ?? {};
    const formValues = systemFieldNames.reduce<Record<string, any>>((acc, key) => {
      if (booleanSystemFields.includes(key)) {
        acc[key] = readSystemBool(runtime, key);
      } else if (numberSystemFields.includes(key)) {
        acc[key] = readSystemNumber(runtime, key);
      } else {
        acc[key] = runtime[key];
      }
      return acc;
    }, {});
    systemForm.setFieldsValue(formValues);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsResp, manageResp, systemResp] = await Promise.all([
        getSettings(),
        getManageSettings(),
        getSystemSettings(),
      ]);
      setSettings(settingsResp);
      setSystemSettings(systemResp);
      applyForms(settingsResp, manageResp, systemResp);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const submitGeneral = async () => {
    const values = await generalForm.validateFields();
    setSubmitting(true);
    try {
      const rawID = settings?.data?.general?.id;
      const id = rawID && rawID !== nilUUID ? rawID : settings?.data?.general?.key || 'general';
      const resp = await updateGeneralSettings(id, values);
      message.success(resp.message || t('common.updated', 'Update Successfully'));
      await loadSettings();
    } finally {
      setSubmitting(false);
    }
  };

  const submitOTP = async () => {
    const values = await otpForm.validateFields();
    setSubmitting(true);
    try {
      const resp = await updateOTPSettings({
        otp_status: boolToOnOff(values.otp_status),
        otp_expiration_time: values.otp_status ? String(values.otp_expiration_time || '') : '',
        otp_duration_type: values.otp_status ? values.otp_duration_type : '',
      });
      message.success(resp.message || t('common.updated', 'Update Successfully'));
      await loadSettings();
    } finally {
      setSubmitting(false);
    }
  };

  const submitDomain = async () => {
    const values = await domainForm.validateFields();
    setSubmitting(true);
    try {
      const resp = await updateDomainSettings({
        ssl_required: boolToOnOff(values.ssl_required),
        automatic_approve: boolToOnOff(values.automatic_approve),
      });
      message.success(resp.message || t('common.updated', 'Update Successfully'));
      await loadSettings();
    } finally {
      setSubmitting(false);
    }
  };

  const submitSystem = async () => {
    const values = await systemForm.validateFields();
    setSubmitting(true);
    try {
      const payload = { ...values };
      booleanSystemFields.forEach((key) => {
        payload[key] = boolToString(values[key]);
      });
      await updateSystemSettings(payload);
      message.success(t('common.updated', 'Update Successfully'));
      await loadSettings();
    } finally {
      setSubmitting(false);
    }
  };

  const generalTab = (
    <div style={panelStyle}>
      <Form layout="vertical" form={generalForm}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="title"
              label={t('sys.settings.title', 'Title')}
              rules={[{ required: true }]}
            >
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="default_lang"
              label={t('sys.settings.defaultLang', 'Default language')}
            >
              <Select allowClear options={languageOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="app_link" label={t('sys.settings.appLink', 'App link')}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="admin_footer_text" label={t('sys.settings.footerText', 'Footer text')}>
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="admin_footer_link_text"
              label={t('sys.settings.footerLinkText', 'Footer link text')}
            >
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="admin_footer_link" label={t('sys.settings.footerLink', 'Footer link')}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="copy_right" label={t('sys.settings.copyRight', 'Copyright')}>
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          {[
            ['logo', 'Logo'],
            ['favicon', 'Favicon'],
            ['common_header_logo', 'Header logo'],
            ['footer_logo', 'Footer logo'],
            ['admin_logo', 'Admin logo'],
            ['login_page_logo', 'Login logo'],
            ['login_page_image', 'Login image'],
          ].map(([name, label]) => (
            <Col xs={24} md={12} key={name}>
              <Form.Item label={t(`sys.settings.${name}`, label)}>
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name={name} noStyle>
                    <Input />
                  </Form.Item>
                  {uploadGeneralAsset(name)}
                </Space.Compact>
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Button type="primary" loading={submitting} onClick={submitGeneral}>
          {t('common.save', 'Save')}
        </Button>
      </Form>
    </div>
  );

  const signupTab = (
    <div style={panelStyle}>
      <Form layout="vertical" form={otpForm}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="otp_status"
              label={t('sys.settings.otpStatus', 'Email OTP')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="otp_expiration_time"
              label={t('sys.settings.otpExpiration', 'OTP expiration')}
            >
              <InputNumber min={1} max={86400} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="otp_duration_type"
              label={t('sys.settings.otpDurationType', 'Duration type')}
            >
              <Select
                options={[
                  { label: t('sys.settings.minute', 'Minute'), value: 'minute' },
                  { label: t('sys.settings.second', 'Second'), value: 'second' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" loading={submitting} onClick={submitOTP}>
          {t('common.save', 'Save')}
        </Button>
      </Form>
    </div>
  );

  const domainTab = (
    <div style={panelStyle}>
      <Form layout="vertical" form={domainForm}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="ssl_required"
              label={t('sys.settings.sslRequired', 'SSL required')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="automatic_approve"
              label={t('sys.settings.automaticApprove', 'Automatic approval')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" loading={submitting} onClick={submitDomain}>
          {t('common.save', 'Save')}
        </Button>
      </Form>
    </div>
  );

  const systemTab = (
    <div style={panelStyle}>
      <Form layout="vertical" form={systemForm}>
        <Row gutter={16}>
          {systemFieldGroups.map((group) => (
            <Col xs={24} key={group.title}>
              <div style={{ ...panelStyle, marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  <Tag color="blue">{group.title}</Tag>
                  <Row gutter={16}>
                    {group.fields.map((name) => (
                      <Col xs={24} md={booleanSystemFields.includes(name) ? 6 : 8} key={name}>
                        <Form.Item
                          name={name}
                          label={name}
                          valuePropName={booleanSystemFields.includes(name) ? 'checked' : 'value'}
                        >
                          {booleanSystemFields.includes(name) ? (
                            <Switch />
                          ) : name === 'DEFAULT_LANG' ? (
                            <Select allowClear options={languageOptions} />
                          ) : numberSystemFields.includes(name) ? (
                            <InputNumber min={0} style={{ width: '100%' }} />
                          ) : (
                            <Input />
                          )}
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                </Space>
              </div>
            </Col>
          ))}
        </Row>
        <Space wrap>
          <Button type="primary" loading={submitting} onClick={submitSystem}>
            {t('common.save', 'Save')}
          </Button>
          <Tag color="gold">
            {t('sys.settings.redacted', 'Redacted')}: {systemSettings?.data?.redacted?.length ?? 0}
          </Tag>
          {(systemSettings?.data?.redacted ?? []).map((key) => (
            <Tag key={key}>{key}</Tag>
          ))}
        </Space>
      </Form>
    </div>
  );

  return (
    <PageContainer>
      <div style={{ ...panelStyle, marginBottom: 16 }}>
        <Space wrap>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadSettings}>
            {t('common.refresh', 'Refresh')}
          </Button>
        </Space>
      </div>
      <Tabs
        items={[
          {
            key: 'general',
            label: (
              <Space>
                <SettingOutlined />
                {t('sys.settings.general', 'General')}
              </Space>
            ),
            children: generalTab,
          },
          {
            key: 'signup',
            label: (
              <Space>
                <SafetyCertificateOutlined />
                {t('sys.settings.signup', 'Signup')}
              </Space>
            ),
            children: signupTab,
          },
          {
            key: 'domain',
            label: (
              <Space>
                <GlobalOutlined />
                {t('sys.settings.domain', 'Domain')}
              </Space>
            ),
            children: domainTab,
          },
          {
            key: 'system',
            label: (
              <Space>
                <ApartmentOutlined />
                {t('sys.settings.system', 'System')}
              </Space>
            ),
            children: systemTab,
          },
        ]}
      />
    </PageContainer>
  );
};

export default SettingsPage;
