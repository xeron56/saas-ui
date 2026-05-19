import { ReloadOutlined, SaveOutlined, ToolOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Alert, Button, Card, Col, Form, Row, Space, Switch, message as toast } from 'antd';
import { useEffect, useState } from 'react';

type SettingsPageResponse = {
  title?: string;
  options?: Record<string, unknown>;
  settings?: { option_key?: string; option_value?: string }[];
};

type LegacyResponse = {
  status?: boolean;
  message?: string;
  data?: unknown;
};

type ConfigurationValues = Record<string, boolean>;

type ToggleField = {
  name: string;
  label: string;
};

const pagePath = '/super-admin/setting/configuration-settings';
const updatePath = '/super-admin/setting/configuration-settings-update';

const toggleFields: ToggleField[] = [
  { name: 'email_verification_status', label: 'Email Verification' },
  { name: 'app_mail_status', label: 'Mail Notifications' },
  { name: 'app_sms_status', label: 'SMS Notifications' },
  { name: 'pusher_status', label: 'Pusher' },
  { name: 'google_login_status', label: 'Google Login' },
  { name: 'facebook_login_status', label: 'Facebook Login' },
  { name: 'google_recaptcha_status', label: 'Google reCAPTCHA' },
  { name: 'google_analytics_status', label: 'Google Analytics' },
  { name: 'cookie_status', label: 'Cookie Consent' },
  { name: 'two_factor_googleauth_status', label: 'Google 2FA' },
  { name: 'app_preloader_status', label: 'Preloader' },
  { name: 'disable_registration', label: 'Disable Registration' },
  { name: 'registration_approval', label: 'Registration Approval' },
  { name: 'show_language_switcher', label: 'Language Switcher' },
  { name: 'app_debug', label: 'Debug Mode' },
  { name: 'force_ssl', label: 'Force SSL' },
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

function valuesFromOptions(options: Record<string, unknown>): ConfigurationValues {
  return toggleFields.reduce<ConfigurationValues>((values, field) => {
    values[field.name] = enabledValue(options[field.name]);
    return values;
  }, {});
}

function payloadFromValues(values: ConfigurationValues) {
  return toggleFields.reduce<Record<string, string>>((payload, field) => {
    payload[field.name] = values[field.name] ? '1' : '0';
    return payload;
  }, {});
}

export default function SuperAdminConfigurationSettings() {
  const [form] = Form.useForm<ConfigurationValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState('Configuration Settings');

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await request<SettingsPageResponse>(pagePath);
      form.setFieldsValue(valuesFromOptions(optionsFromResponse(response || {})));
      setPageTitle(textValue(response?.title) || 'Configuration Settings');
    } catch (err: any) {
      form.resetFields();
      setError(err?.message || 'Configuration settings could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const submitSettings = async (values: ConfigurationValues) => {
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyResponse>(updatePath, {
        method: 'POST',
        data: payloadFromValues(values),
      });
      if (response?.status === false) {
        setError(textValue(response.message) || 'Configuration settings could not be saved.');
        return;
      }
      toast.success(textValue(response?.message) || 'Configuration settings saved.');
      await loadSettings();
    } catch (err: any) {
      setError(err?.message || 'Configuration settings could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title={pageTitle}
      extra={
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadSettings}>
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Card
          title={
            <Space>
              <ToolOutlined />
              <span>Configuration</span>
            </Space>
          }
        >
          <Form form={form} layout="vertical" disabled={loading} onFinish={submitSettings}>
            <Row gutter={16}>
              {toggleFields.map((field) => (
                <Col key={field.name} xs={24} md={12} lg={8}>
                  <Form.Item name={field.name} label={field.label} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              ))}
            </Row>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                Save
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadSettings}>
                Reset
              </Button>
            </Space>
          </Form>
        </Card>
      </Space>
    </PageContainer>
  );
}
