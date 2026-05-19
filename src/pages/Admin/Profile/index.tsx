import {
  KeyOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  QRCode,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  Upload,
  message as toast,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useCallback, useEffect, useState } from 'react';

type LegacyRecord = Record<string, any>;

type ProfileResponse = {
  status?: boolean;
  message?: string;
  profile?: LegacyRecord;
  user?: LegacyRecord;
  account?: LegacyRecord;
  google2fa?: TwoFactorState;
  twoFactor?: TwoFactorState;
  qr_code?: string;
  google2fa_secret?: string;
  data?: {
    profile?: LegacyRecord;
  };
};

type TwoFactorState = {
  enabled?: boolean;
  two_factor_enabled?: boolean;
  google_auth_status?: number | string | boolean;
  google2fa_secret?: string;
  secret?: string;
  qr_code?: string;
  enableRoute?: string;
  disableRoute?: string;
};

type ProfileFormValues = {
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
  image?: UploadFile[];
};

type PasswordFormValues = {
  password?: string;
  password_confirmation?: string;
};

type SecurityFormValues = {
  one_time_password?: string;
};

type ProfileSettingsPageProps = {
  basePath?: string;
  title?: string;
};

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function selectedFile(files?: UploadFile[]) {
  return files?.[0]?.originFileObj as File | undefined;
}

function profileFromResponse(response: ProfileResponse) {
  return response.data?.profile || response.profile || response.user || response.account || {};
}

function profileFormValues(profile: LegacyRecord): ProfileFormValues {
  return {
    name: textValue(profile.name),
    email: textValue(profile.email),
    mobile: textValue(profile.mobile || profile.phone),
    address: textValue(profile.address),
    image: [],
  };
}

function enabledFlag(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }
  const normalized = textValue(value).toLowerCase();
  return ['1', 'true', 'yes', 'on', 'active', 'enabled'].includes(normalized);
}

function twoFactorFromResponse(response: ProfileResponse): TwoFactorState {
  const profile = profileFromResponse(response);
  const source =
    response.google2fa || response.twoFactor || profile.google2fa || profile.twoFactor || {};
  const enabled =
    enabledFlag(source.enabled) ||
    enabledFlag(source.two_factor_enabled) ||
    enabledFlag(source.google_auth_status) ||
    enabledFlag(profile.google_auth_status) ||
    enabledFlag(profile.two_factor_enabled);
  const secret =
    textValue(source.google2fa_secret) ||
    textValue(source.secret) ||
    textValue(response.google2fa_secret) ||
    textValue(profile.google2fa_secret);
  return {
    ...source,
    enabled,
    google_auth_status: enabled ? 1 : 0,
    google2fa_secret: secret,
    qr_code: textValue(source.qr_code) || textValue(response.qr_code),
    enableRoute: textValue(source.enableRoute) || '/google2fa/authenticate/enable',
    disableRoute: textValue(source.disableRoute) || '/google2fa/authenticate/disable',
  };
}

function buildProfileBody(values: ProfileFormValues) {
  const payload = {
    name: textValue(values.name),
    email: textValue(values.email),
    mobile: textValue(values.mobile),
    address: textValue(values.address),
  };
  const file = selectedFile(values.image);
  if (!file) {
    return payload;
  }
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('profile_image', file);
  return formData;
}

function validImageFile(file: File) {
  const allowed = /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!allowed) {
    toast.error('Use a JPG, PNG, or WEBP image.');
    return Upload.LIST_IGNORE;
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Profile image must be 2 MB or smaller.');
    return Upload.LIST_IGNORE;
  }
  return false;
}

export function ProfileSettingsPage({
  basePath = '/admin/profile',
  title = 'Profile',
}: ProfileSettingsPageProps) {
  const location = useLocation();
  const defaultBaseTab = basePath.startsWith('/super-admin') ? 'security' : 'profile';
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [securityForm] = Form.useForm<SecurityFormValues>();
  const [activeTab, setActiveTab] = useState(
    location.pathname.endsWith('/change-password') ? 'password' : defaultBaseTab,
  );
  const [twoFactor, setTwoFactor] = useState<TwoFactorState>({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await request<ProfileResponse>(basePath);
      if (response.status === false) {
        setError(textValue(response.message) || 'Profile could not be loaded.');
        return;
      }
      profileForm.setFieldsValue(profileFormValues(profileFromResponse(response)));
      setTwoFactor(twoFactorFromResponse(response));
    } catch (err: any) {
      setError(err?.message || 'Profile could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [basePath, profileForm]);

  useEffect(() => {
    if (location.pathname.endsWith('/change-password')) {
      setActiveTab('password');
      return;
    }
    if (activeTab === 'password') {
      setActiveTab(defaultBaseTab);
    }
  }, [activeTab, defaultBaseTab, location.pathname]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const changeTab = (key: string) => {
    setActiveTab(key);
    history.replace(key === 'password' ? `${basePath}/change-password` : basePath);
  };

  const submitProfile = async (values: ProfileFormValues) => {
    setSavingProfile(true);
    setError('');
    try {
      const response = await request<ProfileResponse>(`${basePath}/update`, {
        method: 'POST',
        data: buildProfileBody(values),
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Profile could not be saved.');
        return;
      }
      profileForm.setFieldsValue(profileFormValues(profileFromResponse(response)));
      toast.success(textValue(response.message) || 'Profile saved.');
    } catch (err: any) {
      setError(err?.message || 'Profile could not be saved.');
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (values: PasswordFormValues) => {
    setSavingPassword(true);
    setError('');
    try {
      await request(`${basePath}/change-password`, {
        method: 'POST',
        data: values,
      });
      passwordForm.resetFields();
      toast.success('Password updated.');
    } catch (err: any) {
      setError(err?.message || 'Password could not be updated.');
    } finally {
      setSavingPassword(false);
    }
  };

  const submitSecurity = async (values: SecurityFormValues) => {
    const endpoint = twoFactor.enabled ? twoFactor.disableRoute : twoFactor.enableRoute;
    if (!endpoint) {
      return;
    }
    setSavingSecurity(true);
    setError('');
    try {
      const response = await request<ProfileResponse>(endpoint, {
        method: 'POST',
        data: { one_time_password: textValue(values.one_time_password) },
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Two-factor authentication could not be updated.');
        return;
      }
      const enabled = !twoFactor.enabled;
      setTwoFactor((current) => ({
        ...current,
        enabled,
        two_factor_enabled: enabled,
        google_auth_status: enabled ? 1 : 0,
      }));
      securityForm.resetFields();
      toast.success(textValue(response.message) || 'Two-factor authentication updated.');
    } catch (err: any) {
      setError(err?.message || 'Two-factor authentication could not be updated.');
    } finally {
      setSavingSecurity(false);
    }
  };

  return (
    <PageContainer
      title={title}
      extra={[
        <Button icon={<ReloadOutlined />} key="reload" onClick={loadProfile}>
          Refresh
        </Button>,
      ]}
    >
      {error ? <Alert message={error} showIcon style={{ marginBottom: 16 }} type="error" /> : null}

      <Tabs
        activeKey={activeTab}
        onChange={changeTab}
        items={[
          {
            key: 'security',
            label: (
              <Space size={8}>
                <SafetyCertificateOutlined />
                <span>Security</span>
              </Space>
            ),
            children: loading ? (
              <Spin />
            ) : (
              <Row gutter={[24, 16]}>
                <Col lg={8} md={10} xs={24}>
                  {twoFactor.qr_code ? <QRCode value={twoFactor.qr_code} size={192} /> : null}
                </Col>
                <Col lg={12} md={14} xs={24}>
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Space>
                      <span>Google Authentication</span>
                      <Tag color={twoFactor.enabled ? 'green' : 'default'}>
                        {twoFactor.enabled ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </Space>
                    <Input
                      readOnly
                      value={textValue(twoFactor.google2fa_secret || twoFactor.secret)}
                    />
                    <Form<SecurityFormValues>
                      form={securityForm}
                      layout="vertical"
                      onFinish={submitSecurity}
                    >
                      <Form.Item
                        label="Authenticator code"
                        name="one_time_password"
                        rules={[{ required: true, message: 'Authenticator code is required.' }]}
                      >
                        <Input autoComplete="one-time-code" inputMode="numeric" />
                      </Form.Item>
                      <Button
                        htmlType="submit"
                        loading={savingSecurity}
                        type={twoFactor.enabled ? 'default' : 'primary'}
                      >
                        {twoFactor.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </Form>
                  </Space>
                </Col>
              </Row>
            ),
          },
          {
            key: 'profile',
            label: (
              <Space size={8}>
                <UserOutlined />
                <span>Profile</span>
              </Space>
            ),
            children: loading ? (
              <Spin />
            ) : (
              <Form<ProfileFormValues>
                form={profileForm}
                layout="vertical"
                onFinish={submitProfile}
              >
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[
                        { required: true, message: 'Name is required.' },
                        { min: 2, message: 'Name must be at least 2 characters.' },
                        { max: 255, message: 'Name must be 255 characters or fewer.' },
                      ]}
                    >
                      <Input autoComplete="name" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[{ type: 'email', message: 'Enter a valid email.' }]}
                    >
                      <Input autoComplete="email" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      label="Mobile"
                      name="mobile"
                      rules={[
                        { required: true, message: 'Mobile is required.' },
                        { min: 2, message: 'Mobile must be at least 2 characters.' },
                        { max: 50, message: 'Mobile must be 50 characters or fewer.' },
                      ]}
                    >
                      <Input autoComplete="tel" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      getValueFromEvent={normalizeUploadEvent}
                      label="Profile image"
                      name="image"
                    >
                      <Upload
                        accept="image/jpeg,image/png,image/webp"
                        beforeUpload={validImageFile}
                        maxCount={1}
                      >
                        <Button icon={<UploadOutlined />}>Choose image</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Address"
                      name="address"
                      rules={[{ required: true, message: 'Address is required.' }]}
                    >
                      <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={savingProfile}
                  type="primary"
                >
                  Save
                </Button>
              </Form>
            ),
          },
          {
            key: 'password',
            label: (
              <Space size={8}>
                <KeyOutlined />
                <span>Password</span>
              </Space>
            ),
            children: (
              <Form<PasswordFormValues>
                form={passwordForm}
                layout="vertical"
                onFinish={submitPassword}
              >
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item
                      label="New password"
                      name="password"
                      rules={[
                        { required: true, message: 'Password is required.' },
                        { min: 6, message: 'Password must be at least 6 characters.' },
                      ]}
                    >
                      <Input.Password autoComplete="new-password" />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item
                      dependencies={['password']}
                      label="Confirm password"
                      name="password_confirmation"
                      rules={[
                        { required: true, message: 'Confirm the password.' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match.'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password autoComplete="new-password" />
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={savingPassword}
                  type="primary"
                >
                  Save
                </Button>
              </Form>
            ),
          },
        ]}
      />
    </PageContainer>
  );
}

export default function AdminProfile() {
  return <ProfileSettingsPage />;
}
