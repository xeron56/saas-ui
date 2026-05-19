import { ReloadOutlined, SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, message as toast } from 'antd';
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

type ApplicationSettingsValues = {
  app_name?: string;
  APP_URL?: string;
  app_email?: string;
  app_contact_number?: string;
  app_location?: string;
  app_copyright?: string;
  app_developed?: string;
  app_timezone?: string;
};

const pagePath = '/super-admin/setting/application-settings';
const updatePath = '/super-admin/setting/application-settings-update';

const timezoneOptions = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dhaka',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
].map((value) => ({ label: value, value }));

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
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

function valuesFromOptions(options: Record<string, unknown>): ApplicationSettingsValues {
  return {
    app_name: textValue(options.app_name),
    APP_URL: textValue(options.APP_URL),
    app_email: textValue(options.app_email),
    app_contact_number: textValue(options.app_contact_number),
    app_location: textValue(options.app_location),
    app_copyright: textValue(options.app_copyright),
    app_developed: textValue(options.app_developed),
    app_timezone: textValue(options.app_timezone) || 'UTC',
  };
}

function payloadFromValues(values: ApplicationSettingsValues) {
  return {
    app_name: textValue(values.app_name),
    APP_URL: textValue(values.APP_URL),
    app_email: textValue(values.app_email),
    app_contact_number: textValue(values.app_contact_number),
    app_location: textValue(values.app_location),
    app_copyright: textValue(values.app_copyright),
    app_developed: textValue(values.app_developed),
    app_timezone: textValue(values.app_timezone) || 'UTC',
  };
}

export default function SuperAdminApplicationSettings() {
  const [form] = Form.useForm<ApplicationSettingsValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState('Application Setting');

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await request<SettingsPageResponse>(pagePath);
      form.setFieldsValue(valuesFromOptions(optionsFromResponse(response || {})));
      setPageTitle(textValue(response?.title) || 'Application Setting');
    } catch (err: any) {
      form.resetFields();
      setError(err?.message || 'Application settings could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const submitSettings = async (values: ApplicationSettingsValues) => {
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyResponse>(updatePath, {
        method: 'POST',
        data: payloadFromValues(values),
      });
      if (response?.status === false) {
        setError(textValue(response.message) || 'Application settings could not be saved.');
        return;
      }
      toast.success(textValue(response?.message) || 'Application settings saved.');
      await loadSettings();
    } catch (err: any) {
      setError(err?.message || 'Application settings could not be saved.');
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
              <SettingOutlined />
              <span>Application</span>
            </Space>
          }
        >
          <Form form={form} layout="vertical" disabled={loading} onFinish={submitSettings}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="app_name" label="App Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="APP_URL" label="App URL" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="app_email" label="App Email" rules={[{ type: 'email' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="app_contact_number" label="App Contact Number">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="app_location" label="App Location">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="app_copyright" label="App Copyright">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="app_developed" label="Developed By">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="app_timezone" label="Timezone">
                  <Select showSearch options={timezoneOptions} />
                </Form.Item>
              </Col>
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
