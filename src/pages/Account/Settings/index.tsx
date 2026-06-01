import { LockOutlined, ReloadOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useIntl, useModel } from '@umijs/max';
import {
  Avatar,
  Button,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { getAccountProfile, updateAccountProfile } from './service';
import type { AccountProfile, AccountProfileUpdate } from './types';

type ProfileFormValues = AccountProfileUpdate;

const field = <T,>(
  record: Record<string, any> | undefined,
  snake: string,
  camel: string,
): T | undefined => {
  if (!record) {
    return undefined;
  }
  return (record[snake] ?? record[camel]) as T | undefined;
};

const isDirectImageUrl = (value?: string) =>
  !!value && /^(https?:\/\/|data:image\/|\/)/i.test(value);

const AccountSettingsPage: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm<ProfileFormValues>();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [profile, setProfile] = useState<AccountProfile>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const imageRef = Form.useWatch('image', form);
  const createdAt = field<string>(profile, 'created_at', 'createdAt');
  const avatarSrc = isDirectImageUrl(imageRef) ? imageRef : undefined;

  const pageTitle = intl.formatMessage({
    id: 'menu.account.settings',
    defaultMessage: 'Account Settings',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const resp = await getAccountProfile();
      setProfile(resp.data);
      form.setFieldsValue({
        name: resp.data?.name || '',
        email: resp.data?.email || '',
        phone: resp.data?.phone || '',
        image: resp.data?.image || '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const refreshInitialUser = async () => {
    const currentUser = await initialState?.fetchUserInfo?.();
    if (currentUser) {
      setInitialState((state) => ({ ...state, currentUser }));
    }
  };

  const submitProfile = async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      const payload: AccountProfileUpdate = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        image: values.image,
      };
      if (values.current_password || values.password || values.password_confirmation) {
        payload.current_password = values.current_password;
        payload.password = values.password;
        payload.password_confirmation = values.password_confirmation;
      }
      const resp = await updateAccountProfile(payload);
      setProfile(resp.data);
      form.setFieldsValue({
        current_password: undefined,
        password: undefined,
        password_confirmation: undefined,
      });
      message.success(resp.message || 'Profile updated successfully.');
      await refreshInitialUser();
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer title={pageTitle}>
      <ProCard title={pageTitle} loading={loading}>
        <Form<ProfileFormValues> form={form} layout="vertical" onFinish={submitProfile}>
          <Row gutter={24}>
            <Col xs={24} md={7} lg={6}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Avatar size={96} src={avatarSrc} icon={<UserOutlined />} />
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Role">
                    {profile?.role ? <Tag color="blue">{profile.role}</Tag> : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created">{createdAt || '-'}</Descriptions.Item>
                </Descriptions>
              </Space>
            </Col>
            <Col xs={24} md={17} lg={18}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true }, { type: 'email' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="phone" label="Phone">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="image" label="Image URL or reference">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Divider orientation="left">
                <Space size={8}>
                  <LockOutlined />
                  <Typography.Text>Password</Typography.Text>
                </Space>
              </Divider>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item name="current_password" label="Current password">
                    <Input.Password autoComplete="current-password" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="password"
                    label="New password"
                    dependencies={['current_password']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!getFieldValue('current_password') && !value) {
                            return Promise.resolve();
                          }
                          if (!value) {
                            return Promise.reject(new Error('New password is required.'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="password_confirmation"
                    label="Confirm password"
                    dependencies={['password']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const password = getFieldValue('password');
                          if (!password && !value) {
                            return Promise.resolve();
                          }
                          if (value !== password) {
                            return Promise.reject(new Error('Passwords do not match.'));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </Col>
              </Row>
              <Space>
                <Button type="primary" icon={<SaveOutlined />} loading={saving} htmlType="submit">
                  Save
                </Button>
                <Button icon={<ReloadOutlined />} loading={loading} onClick={loadProfile}>
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </ProCard>
    </PageContainer>
  );
};

export default AccountSettingsPage;
