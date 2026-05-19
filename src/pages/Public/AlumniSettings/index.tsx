import {
  Alert,
  Button,
  Empty,
  Form,
  Input,
  List,
  QRCode,
  Select,
  Spin,
  Switch,
  Tag,
  message as toast,
} from 'antd';
import { CheckCircleOutlined, PlusOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent, postPublicContent } from '../services';
import type { LegacyRecord } from '../types';

type ProfileField = {
  name: string;
  label: string;
  source?: 'user' | 'alumni';
  required?: boolean;
  textarea?: boolean;
  select?: boolean;
  inputType?: string;
};

const profileFields: ProfileField[] = [
  { name: 'name', label: 'Full Name', source: 'user', required: true },
  { name: 'nick_name', label: 'Nick Name' },
  { name: 'mobile', label: 'Phone Number', source: 'user', required: true },
  { name: 'blood_group', label: 'Blood Group', select: true },
  { name: 'date_of_birth', label: 'Birth Date', inputType: 'date', required: true },
  { name: 'about_me', label: 'About Me', textarea: true },
  { name: 'linkedin_url', label: 'LinkedIn', inputType: 'url' },
  { name: 'facebook_url', label: 'Facebook', inputType: 'url' },
  { name: 'twitter_url', label: 'Twitter', inputType: 'url' },
  { name: 'instagram_url', label: 'Instagram', inputType: 'url' },
  { name: 'company', label: 'Company' },
  { name: 'company_designation', label: 'Designation' },
  { name: 'company_address', label: 'Company Address' },
  { name: 'city', label: 'City', required: true },
  { name: 'state', label: 'State', required: true },
  { name: 'country', label: 'Country', required: true },
  { name: 'zip', label: 'Zip', required: true },
  { name: 'address', label: 'Address', required: true },
];

const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((value) => ({
  label: value,
  value,
}));

function dynamicValue(value: any): any {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if ('stringValue' in value) {
    return value.stringValue;
  }
  if ('boolValue' in value) {
    return value.boolValue;
  }
  if ('intValue' in value) {
    return value.intValue;
  }
  if ('longValue' in value) {
    return value.longValue;
  }
  if ('floatValue' in value) {
    return value.floatValue;
  }
  if ('doubleValue' in value) {
    return value.doubleValue;
  }
  if ('jsonValue' in value) {
    return value.jsonValue;
  }
  return value;
}

function settingsMap(rows: unknown) {
  const map: LegacyRecord = {};
  if (!Array.isArray(rows)) {
    return map;
  }
  rows.forEach((row) => {
    const key = textValue(row?.key);
    if (key) {
      map[key] = dynamicValue(row.value);
    }
  });
  return map;
}

function institutionRows(settings: LegacyRecord) {
  const value = settings.legacy_institutions;
  if (value && typeof value === 'object' && Array.isArray(value.items)) {
    return value.items as LegacyRecord[];
  }
  return [];
}

function profileRecord(payload: LegacyRecord) {
  return ((payload.profile || payload.user || {}) as LegacyRecord) || {};
}

function alumniRecord(payload: LegacyRecord) {
  const profile = profileRecord(payload);
  return ((profile.alumni || payload.alumni || {}) as LegacyRecord) || {};
}

function profileFieldValue(payload: LegacyRecord, settings: LegacyRecord, field: ProfileField) {
  const profile = profileRecord(payload);
  const alumni = alumniRecord(payload);
  if (field.source === 'user') {
    return textValue(profile[field.name] ?? settings[`legacy_profile.${field.name}`]);
  }
  return textValue(
    alumni[field.name] ?? profile[field.name] ?? settings[`legacy_profile.${field.name}`],
  );
}

function activeFlag(value: any) {
  if (typeof value === 'boolean') {
    return value;
  }
  const normalized = textValue(value).toLowerCase();
  return ['1', 'true', 'yes', 'on', 'active', 'enabled'].includes(normalized);
}

function twoFactorRecord(payload: LegacyRecord) {
  const profile = profileRecord(payload);
  const source =
    ((payload.google2fa || payload.twoFactor || profile.google2fa || {}) as LegacyRecord) || {};
  const enabled =
    activeFlag(source.enabled) ||
    activeFlag(source.two_factor_enabled) ||
    activeFlag(source.google_auth_status) ||
    activeFlag(profile.google_auth_status) ||
    activeFlag(profile.two_factor_enabled);
  const secret =
    textValue(source.google2fa_secret) ||
    textValue(source.secret) ||
    textValue(payload.google2fa_secret) ||
    textValue(profile.google2fa_secret);
  return {
    ...source,
    enabled,
    google_auth_status: enabled ? 1 : 0,
    google2fa_secret: secret,
    qr_code: textValue(source.qr_code) || textValue(payload.qr_code),
    enableRoute: textValue(source.enableRoute) || '/google2fa/authenticate/enable',
    disableRoute: textValue(source.disableRoute) || '/google2fa/authenticate/disable',
  };
}

export default function AlumniSettings() {
  const [profileForm] = Form.useForm();
  const [institutionForm] = Form.useForm();
  const [phoneForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [payload, setPayload] = useState<LegacyRecord>({});
  const [twoFactor, setTwoFactor] = useState<LegacyRecord>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [sendingPhone, setSendingPhone] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState('');
  const [error, setError] = useState('');

  const settings = useMemo(() => settingsMap(payload.settings), [payload.settings]);
  const institutions = useMemo(() => {
    if (Array.isArray(payload.institutions)) {
      return payload.institutions as LegacyRecord[];
    }
    const profile = profileRecord(payload);
    if (Array.isArray(profile.institutions)) {
      return profile.institutions as LegacyRecord[];
    }
    return institutionRows(settings);
  }, [payload, settings]);
  const profile = profileRecord(payload);
  const phone = textValue(profile.phone || profile.mobile);
  const email = textValue(profile.email);
  const phoneVerified =
    profile.phoneConfirmed === true ||
    profile.phone_confirmed === true ||
    profile.phone_verification_status === true ||
    profile.phone_verification_status === 1;
  const showEmail = activeFlag(profile.show_email_in_public);
  const showPhone = activeFlag(profile.show_phone_in_public);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const body = normalizePayload(await fetchPublicContent('/settings'));
      const bodySettings = settingsMap(body.settings);
      setPayload(body);
      setTwoFactor(twoFactorRecord(body));
      const nextValues = profileFields.reduce<LegacyRecord>((acc, field) => {
        acc[field.name] = profileFieldValue(body, bodySettings, field);
        return acc;
      }, {});
      profileForm.setFieldsValue(nextValues);
    } catch (err: any) {
      setError(err?.message || 'Unable to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitProfile = async (values: LegacyRecord) => {
    setSaving(true);
    setError('');
    try {
      const body = profileFields.reduce<LegacyRecord>((acc, field) => {
        acc[field.name] = textValue(values[field.name]);
        return acc;
      }, {});
      const response = normalizePayload(await postPublicContent('/profile-update', body));
      if (response.status === false) {
        setError(textValue(response.message) || 'Profile could not be updated.');
        return;
      }
      await loadSettings();
      toast.success(textValue(response.message) || 'Profile updated.');
    } catch (err: any) {
      setError(err?.message || 'Profile could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const submitInstitution = async (values: LegacyRecord) => {
    setAdding(true);
    setError('');
    try {
      const response = normalizePayload(await postPublicContent('/add-institution', values));
      if (response.status === false) {
        setError(textValue(response.message) || 'Institution could not be added.');
        return;
      }
      institutionForm.resetFields();
      await loadSettings();
      toast.success(textValue(response.message) || 'Institution added.');
    } catch (err: any) {
      setError(err?.message || 'Institution could not be added.');
    } finally {
      setAdding(false);
    }
  };

  const sendPhoneCode = async () => {
    setSendingPhone(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent('/phone-verification-sms-send', {}),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Phone verification code could not be sent.');
        return;
      }
      toast.success(textValue(response.message) || 'Phone verification code sent.');
    } catch (err: any) {
      setError(err?.message || 'Phone verification code could not be sent.');
    } finally {
      setSendingPhone(false);
    }
  };

  const verifyPhone = async (values: { otp?: string }) => {
    setVerifyingPhone(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent('/phone-verification-sms-verify', {
          otp: textValue(values.otp),
        }),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Phone could not be verified.');
        return;
      }
      phoneForm.resetFields();
      toast.success(textValue(response.message) || 'Phone verified.');
      await loadSettings();
    } catch (err: any) {
      setError(err?.message || 'Phone could not be verified.');
    } finally {
      setVerifyingPhone(false);
    }
  };

  const updateVisibility = async (key: string, checked: boolean) => {
    setUpdatingVisibility(key);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent('/setting-update', {
          key,
          value: checked ? 1 : 0,
        }),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Visibility could not be updated.');
        return;
      }
      await loadSettings();
      toast.success(textValue(response.message) || 'Visibility updated.');
    } catch (err: any) {
      setError(err?.message || 'Visibility could not be updated.');
    } finally {
      setUpdatingVisibility('');
    }
  };

  const submitSecurity = async (values: { one_time_password?: string }) => {
    const endpoint = twoFactor.enabled ? twoFactor.disableRoute : twoFactor.enableRoute;
    if (!endpoint) {
      return;
    }
    setSavingSecurity(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent(endpoint, {
          one_time_password: textValue(values.one_time_password),
        }),
      );
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

  const submitPassword = async (values: LegacyRecord) => {
    setSavingPassword(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent('/change-password', {
          current_password: textValue(values.current_password),
          password: textValue(values.password),
          password_confirmation: textValue(values.password_confirmation),
        }),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Password could not be updated.');
        return;
      }
      passwordForm.resetFields();
      toast.success(textValue(response.message) || 'Password updated.');
    } catch (err: any) {
      setError(err?.message || 'Password could not be updated.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PublicShell title="Settings" description="Profile details and institutions">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        <div className="public-settings-grid">
          <section className="public-settings-panel">
            <div className="public-section-heading">
              <h2>Profile Details</h2>
            </div>
            <Form
              className="public-form public-settings-form"
              form={profileForm}
              layout="vertical"
              requiredMark={false}
              onFinish={submitProfile}
            >
              {profileFields.map((field) => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={field.required ? [{ required: true }] : undefined}
                >
                  {field.textarea ? (
                    <Input.TextArea rows={4} />
                  ) : field.select ? (
                    <Select allowClear options={bloodGroups} />
                  ) : (
                    <Input type={field.inputType} />
                  )}
                </Form.Item>
              ))}
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                Save
              </Button>
            </Form>
          </section>

          <section className="public-settings-panel">
            <div className="public-section-heading">
              <h2>Security</h2>
              <Tag color={twoFactor.enabled ? 'success' : 'default'}>
                {twoFactor.enabled ? 'Enabled' : 'Disabled'}
              </Tag>
            </div>
            <div className="public-settings-list">
              {twoFactor.qr_code ? (
                <QRCode value={textValue(twoFactor.qr_code)} size={180} />
              ) : null}
              <Form
                className="public-settings-form"
                form={securityForm}
                layout="vertical"
                requiredMark={false}
                onFinish={submitSecurity}
              >
                <Form.Item label="Authenticator Key">
                  <Input
                    readOnly
                    value={textValue(twoFactor.google2fa_secret || twoFactor.secret)}
                  />
                </Form.Item>
                <Form.Item
                  name="one_time_password"
                  label="Authenticator Code"
                  rules={[{ required: true }]}
                >
                  <Input autoComplete="one-time-code" inputMode="numeric" />
                </Form.Item>
                <Button htmlType="submit" loading={savingSecurity} type="primary">
                  {twoFactor.enabled ? 'Disable' : 'Enable'}
                </Button>
              </Form>
            </div>

            <div className="public-section-heading">
              <h2>Change Password</h2>
            </div>
            <Form
              className="public-form public-settings-form"
              form={passwordForm}
              layout="vertical"
              requiredMark={false}
              onFinish={submitPassword}
            >
              <Form.Item
                name="current_password"
                label="Current Password"
                rules={[{ required: true }]}
              >
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true },
                  { min: 6, message: 'Password must be at least 6 characters.' },
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                dependencies={['password']}
                name="password_confirmation"
                label="Confirm Password"
                rules={[
                  { required: true },
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
              <Button
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={savingPassword}
                type="primary"
              >
                Save
              </Button>
            </Form>

            <div className="public-section-heading">
              <h2>Phone Verification</h2>
              {phoneVerified ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Verified
                </Tag>
              ) : null}
            </div>
            <div className="public-settings-list">
              {phone ? <p className="public-settings-note">{phone}</p> : null}
              <Form
                className="public-settings-form"
                form={phoneForm}
                layout="vertical"
                requiredMark={false}
                onFinish={verifyPhone}
              >
                <Form.Item name="otp" label="Phone Verification Code" rules={[{ required: true }]}>
                  <Input inputMode="numeric" maxLength={8} disabled={phoneVerified} />
                </Form.Item>
                <div className="public-card-actions">
                  <Button
                    icon={<SendOutlined />}
                    onClick={sendPhoneCode}
                    loading={sendingPhone}
                    disabled={!phone || phoneVerified}
                  >
                    Send Code
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<CheckCircleOutlined />}
                    loading={verifyingPhone}
                    disabled={!phone || phoneVerified}
                  >
                    Verify
                  </Button>
                </div>
              </Form>
            </div>

            <div className="public-section-heading">
              <h2>Public Profile</h2>
            </div>
            <List className="public-settings-list">
              <List.Item
                actions={[
                  <Switch
                    checked={showEmail}
                    disabled={!email}
                    key="show_email_in_public"
                    loading={updatingVisibility === 'show_email_in_public'}
                    onChange={(checked) => updateVisibility('show_email_in_public', checked)}
                  />,
                ]}
              >
                <List.Item.Meta title="Show Email Address" description={email || '-'} />
              </List.Item>
              <List.Item
                actions={[
                  <Switch
                    checked={showPhone}
                    disabled={!phone}
                    key="show_phone_in_public"
                    loading={updatingVisibility === 'show_phone_in_public'}
                    onChange={(checked) => updateVisibility('show_phone_in_public', checked)}
                  />,
                ]}
              >
                <List.Item.Meta title="Show Phone Number" description={phone || '-'} />
              </List.Item>
            </List>

            <div className="public-section-heading">
              <h2>Institutions</h2>
            </div>
            <List
              className="public-settings-list"
              dataSource={institutions}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              renderItem={(item, index) => (
                <List.Item key={textValue(item.id) || index}>
                  <List.Item.Meta
                    title={textValue(item.degree) || 'Institution'}
                    description={
                      <>
                        <span>{textValue(item.institute) || '-'}</span>
                        {textValue(item.passing_year) ? (
                          <span> · {textValue(item.passing_year)}</span>
                        ) : null}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
            <Form
              className="public-form public-settings-form"
              form={institutionForm}
              layout="vertical"
              requiredMark={false}
              onFinish={submitInstitution}
            >
              <Form.Item name="degree" label="Degree" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="passing_year" label="Passing Year" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="institute" label="Institute" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={adding}>
                Add Institution
              </Button>
            </Form>
          </section>
        </div>
      </Spin>
    </PublicShell>
  );
}
