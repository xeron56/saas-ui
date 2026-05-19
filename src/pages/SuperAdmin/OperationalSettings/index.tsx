import {
  CloudOutlined,
  FormatPainterOutlined,
  MailOutlined,
  MessageOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tabs,
  message as toast,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type TabKey = 'appearance' | 'storage' | 'mail' | 'sms' | 'maintenance' | 'cache';
type FieldType = 'text' | 'email' | 'textarea' | 'password' | 'switch' | 'select' | 'color';

type FieldSpec = {
  name: string;
  label: string;
  type?: FieldType;
  options?: { label: string; value: string }[];
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

const basePath = '/super-admin/setting';

const storageOptions = [
  { label: 'Public', value: 'public' },
  { label: 'AWS S3', value: 'aws' },
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
  { label: 'Clear Views', endpoint: `${basePath}/cache-update/1` },
  { label: 'Clear Routes', endpoint: `${basePath}/cache-update/2` },
  { label: 'Clear Config', endpoint: `${basePath}/cache-update/3` },
  { label: 'Clear Application Cache', endpoint: `${basePath}/cache-update/4` },
  { label: 'Storage Link', endpoint: `${basePath}/storage-link` },
];

const tabs: SettingsTab[] = [
  {
    key: 'appearance',
    label: 'Appearance',
    path: `${basePath}/color-settings`,
    pagePath: `${basePath}/color-settings`,
    updatePath: `${basePath}/common-settings-update`,
    icon: <FormatPainterOutlined />,
    fields: [
      {
        name: 'sa_app_color_design_type',
        label: 'System Color',
        type: 'select',
        options: [
          { label: 'Default', value: '1' },
          { label: 'Custom', value: '2' },
        ],
      },
      { name: 'sa_app_primary_color', label: 'Primary Color', type: 'color' },
      { name: 'sa_app_hover_color', label: 'Hover Color', type: 'color' },
      { name: 'sa_app_text_color', label: 'Text Color', type: 'color' },
      { name: 'sa_app_text_body_color', label: 'Text Body Color', type: 'color' },
      { name: 'sa_app_sidebar_bg_color', label: 'Sidebar Background', type: 'color' },
      { name: 'sa_app_sidebar_text_color', label: 'Sidebar Text', type: 'color' },
      { name: 'sa_app_gradiant1_color1', label: 'Landing Gradient Start', type: 'color' },
      { name: 'sa_app_gradiant1_color2', label: 'Landing Gradient End', type: 'color' },
      { name: 'sa_gradiant1_color', label: 'Landing Header Gradient', span: 24 },
      { name: 'sa_inner_gradient_color_1', label: 'Inner Gradient Start', type: 'color' },
      { name: 'sa_inner_gradient_color_2', label: 'Inner Gradient End', type: 'color' },
      { name: 'sa_inner_gradient_color', label: 'Landing Middle Gradient', span: 24 },
      { name: 'sa_custom_css', label: 'Custom CSS', type: 'textarea', rows: 5, span: 24 },
      { name: 'sa_custom_js', label: 'Custom JS', type: 'textarea', rows: 5, span: 24 },
    ],
  },
  {
    key: 'storage',
    label: 'Storage',
    path: `${basePath}/storage-settings`,
    pagePath: `${basePath}/storage-settings`,
    updatePath: `${basePath}/storage-settings`,
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
    actions: [{ label: 'Storage Link', endpoint: `${basePath}/storage-link` }],
  },
  {
    key: 'mail',
    label: 'Mail',
    path: `${basePath}/mail-configuration`,
    pagePath: `${basePath}/mail-configuration`,
    updatePath: `${basePath}/mail-configuration`,
    icon: <MailOutlined />,
    fields: [
      { name: 'MAIL_MAILER', label: 'Mailer' },
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
    actions: [{ label: 'Test Mail', endpoint: `${basePath}/mail-test`, method: 'POST' }],
  },
  {
    key: 'sms',
    label: 'SMS',
    path: `${basePath}/sms-configuration`,
    pagePath: `${basePath}/sms-configuration`,
    updatePath: `${basePath}/sms-configuration`,
    icon: <MessageOutlined />,
    fields: [
      { name: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID' },
      { name: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token', type: 'password', secret: true },
      { name: 'TWILIO_PHONE_NUMBER', label: 'Twilio Phone Number' },
    ],
    actions: [{ label: 'Test SMS', endpoint: `${basePath}/sms-test`, method: 'POST' }],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    path: `${basePath}/maintenance-mode-changes`,
    pagePath: `${basePath}/maintenance-mode-changes`,
    updatePath: `${basePath}/maintenance-mode-changes`,
    icon: <SafetyCertificateOutlined />,
    fields: [
      {
        name: 'maintenance_mode',
        label: 'Maintenance Mode',
        type: 'select',
        options: [
          { label: 'On', value: '1' },
          { label: 'Live', value: '2' },
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
    key: 'cache',
    label: 'Cache',
    path: `${basePath}/cache-settings`,
    pagePath: `${basePath}/cache-settings`,
    icon: <ReloadOutlined />,
    fields: [],
    actions: cacheActions,
  },
];

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function activeTabFromPath(pathname: string): TabKey {
  if (pathname.startsWith(`${basePath}/cache-update`)) {
    return 'cache';
  }
  if (pathname === `${basePath}/storage-link`) {
    return 'storage';
  }
  return tabs.find((tab) => pathname.startsWith(tab.path))?.key || 'storage';
}

function tabByKey(key: TabKey) {
  return tabs.find((tab) => tab.key === key) || tabs[1];
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
    } else {
      values[field.name] = textValue(options[field.name]);
    }
    return values;
  }, {});
}

function buildPayload(fields: FieldSpec[], values: Record<string, unknown>) {
  return fields.reduce<Record<string, unknown>>((payload, field) => {
    const value = values[field.name];
    if (field.secret && !textValue(value)) {
      return payload;
    }
    payload[field.name] = textValue(value);
    return payload;
  }, {});
}

function renderField(field: FieldSpec) {
  if (field.type === 'textarea') {
    return <Input.TextArea rows={field.rows || 4} />;
  }
  if (field.type === 'password') {
    return <Input.Password autoComplete="new-password" placeholder="Stored value preserved" />;
  }
  if (field.type === 'select') {
    return <Select options={field.options || []} />;
  }
  if (field.type === 'color') {
    return <Input type="color" />;
  }
  return <Input type={field.type || 'text'} />;
}

export default function SuperAdminOperationalSettings() {
  const location = useLocation();
  const activeKey = activeTabFromPath(location.pathname);
  const activeTab = tabByKey(activeKey);
  const [form] = Form.useForm<Record<string, unknown>>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState(activeTab.label);
  const directActionRef = useRef('');
  const directAction = activeTab.actions?.find((action) => action.endpoint === location.pathname);

  const loadSettings = async (key: TabKey = activeKey) => {
    const tab = tabByKey(key);
    setLoading(true);
    setError('');
    try {
      const response = await request<SettingsPageResponse>(`${tab.pagePath}?ajax=1`);
      form.setFieldsValue(valuesFromOptions(tab.fields, optionsFromResponse(response || {})));
      setPageTitle(textValue(response?.title) || tab.label);
    } catch (err: any) {
      setError(err?.message || `${tab.label} settings could not be loaded.`);
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.resetFields();
    loadSettings(activeKey);
  }, [activeKey]);

  const submitSettings = async (values: Record<string, unknown>) => {
    if (!activeTab.updatePath) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyResponse>(activeTab.updatePath, {
        method: 'POST',
        data: buildPayload(activeTab.fields, values),
      });
      if (response.status === false) {
        setError(textValue(response.message) || `${activeTab.label} settings could not be saved.`);
        return;
      }
      toast.success(textValue(response.message) || `${activeTab.label} settings saved.`);
      await loadSettings(activeKey);
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
      await loadSettings(activeKey);
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
    <PageContainer title="Operational Settings">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
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
        <Card
          title={
            <Space>
              {activeTab.icon}
              <span>{pageTitle}</span>
            </Space>
          }
          extra={
            <Button icon={<ReloadOutlined />} loading={loading} onClick={() => loadSettings()}>
              Refresh
            </Button>
          }
        >
          {activeTab.actions?.length ? (
            <Space wrap style={{ marginBottom: activeTab.fields.length ? 16 : 0 }}>
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
          ) : null}
          {activeTab.fields.length ? (
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
                      valuePropName="value"
                      rules={
                        field.required
                          ? [{ required: true, message: `${field.label} is required.` }]
                          : []
                      }
                    >
                      {renderField(field)}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  Save
                </Button>
                <Button icon={<ReloadOutlined />} onClick={() => loadSettings()}>
                  Reset
                </Button>
              </Space>
            </Form>
          ) : null}
        </Card>
      </Space>
    </PageContainer>
  );
}
