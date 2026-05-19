import Footer from '@/components/Footer';
import {
  CalendarOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { FormattedMessage, SelectLang, useIntl, useModel, history, request } from '@umijs/max';
import { Alert, Button, message, Spin, Tabs } from 'antd';
import type { InputRef } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React, { useState, useRef, useEffect } from 'react';
import { FriendlyError } from '@gosaas/core';
import { AuthApi } from '@gosaas/api';
import { useMount } from 'ahooks';
import { useSearchParams } from '@umijs/max';
import { useEmotionCss } from '@ant-design/use-emotion-css';

const RegisterMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

interface RegisterResult {
  status?: 'error';
  errorMsg?: string;
}

type RegisterParams = {
  username?: string;
  name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  passwordlessToken?: string;
  type?: string;
  batch_id?: string;
  department_id?: string;
  passing_year_id?: string;
  id_number?: string;
  file?: UploadFile[];
  date_of_birth?: any;
  gender?: string;
  [key: string]: any;
};

type LegacyOption = {
  id?: string | number;
  name?: string;
  short_name?: string;
  [key: string]: any;
};

type RegisterFieldConfig = {
  type?: string;
  label?: string;
  name?: string;
  required?: boolean;
  values?: Array<{ label?: string; value?: string; selected?: boolean }>;
  [key: string]: any;
};

type RegisterPagePayload = {
  regForm?: Record<string, any>;
  reg_form?: Record<string, any>;
  batches?: LegacyOption[];
  departments?: LegacyOption[];
  passingYears?: LegacyOption[];
  passing_years?: LegacyOption[];
};

function flagEnabled(value: any) {
  return value === true || Number(value || 0) === 1 || value === '1' || value === 'true';
}

function asOptions(items?: LegacyOption[], labelKey: 'name' | 'short_name' = 'name') {
  return (items || []).map((item) => ({
    label: String(item[labelKey] || item.name || item.id || ''),
    value: String(item.id ?? ''),
  }));
}

function parseCustomFields(raw: any): RegisterFieldConfig[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}

function selectedFile(files?: UploadFile[]) {
  const file = Array.isArray(files) ? files[0] : undefined;
  return file?.originFileObj as File | undefined;
}

function fieldValueForSubmit(value: any) {
  if (!value) {
    return '';
  }
  if (typeof value?.format === 'function') {
    return value.format('YYYY-MM-DD');
  }
  return String(value);
}

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const Register: React.FC = () => {
  const service = new AuthApi();

  const [userRegisterState, setUserRegisterState] = useState<RegisterResult>({});
  const [registerPage, setRegisterPage] = useState<RegisterPagePayload>({});
  const [registerLoading, setRegisterLoading] = useState(true);
  //account,phone,email
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  const intl = useIntl();
  const [searchParams] = useSearchParams();

  const [redirect, setRedirect] = useState<string>();

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  useEffect(() => {
    const r = searchParams.get('redirect') || '/';
    setRedirect(r);
  }, [searchParams]);
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const titile = initialState?.currentTenant?.tenant?.displayName || '';
  const logo = initialState?.currentTenant?.tenant?.logo?.url || '/logo.png';
  const regForm = registerPage.regForm || registerPage.reg_form || {};
  const customFields = parseCustomFields(regForm.custom_fields);

  useEffect(() => {
    setRegisterLoading(true);
    request<RegisterPagePayload>('/register')
      .then((data) => setRegisterPage(data || {}))
      .catch(() => setRegisterPage({}))
      .finally(() => setRegisterLoading(false));
  }, []);

  const handleSubmit = async (values: RegisterParams) => {
    try {
      const defaultRegisterSuccessMessage = intl.formatMessage({
        id: 'pages.register.success',
        defaultMessage: 'Register successfully!',
      });

      if (type === 'account') {
        const formData = new FormData();
        formData.append('name', values.name || '');
        formData.append('email', values.email || '');
        formData.append('mobile', values.mobile || '');
        formData.append('password', values.password || '');
        formData.append('password_confirmation', values.confirmPassword || '');
        [
          'batch_id',
          'department_id',
          'passing_year_id',
          'id_number',
          'date_of_birth',
          'gender',
        ].forEach((key) => {
          const value = fieldValueForSubmit(values[key]);
          if (value) {
            formData.append(key, value);
          }
        });
        const file = selectedFile(values.file);
        if (file) {
          formData.append('file', file);
        }
        const customAnswers = customFields.map((field, index) => {
          const fieldName = field.name || `field_${index}`;
          const value = values[`custom_${fieldName}`];
          const userData = Array.isArray(value)
            ? value.map((item) => String(item))
            : fieldValueForSubmit(value)
            ? [fieldValueForSubmit(value)]
            : [];
          return {
            ...field,
            userData,
          };
        });
        formData.append('custom_fields', JSON.stringify(customAnswers));
        await request('/register', {
          method: 'POST',
          data: formData,
        });
      } else if (type === 'phone') {
        await service.authLoginPasswordless({
          body: {
            phone: values.phone!,
            token: values.passwordlessToken!,
            web: true,
          },
        });
      } else if (type === 'email') {
        await service.authLoginPasswordless({
          body: {
            email: values.email!,
            token: values.passwordlessToken!,
            web: true,
          },
        });
      }

      message.success(defaultRegisterSuccessMessage);
      await fetchUserInfo();
      history.push(redirect || '/');
    } catch (error) {
      setUserRegisterState((v) => {
        return {
          ...v,
          status: 'error',
          errorMsg: error instanceof FriendlyError ? error.message : ' ',
        };
      });
    }
  };
  const { status, errorMsg } = userRegisterState;

  const inputRef = useRef<InputRef>(null);
  useMount(() => inputRef.current!.focus());

  return (
    <div className={containerClassName}>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          logo={<img alt="logo" src={logo} />}
          title={titile}
          subTitle={' '}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <Button
              key="loginbtn"
              type="link"
              style={{
                float: 'right',
              }}
              onClick={() => {
                history.push('/user/login');
              }}
            >
              <FormattedMessage
                id="pages.login.tips"
                defaultMessage="Already have an account? Go to login"
              />
            </Button>,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as RegisterParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.register.account.tab',
                  defaultMessage: 'Create account',
                }),
              },
              // {
              //   key: 'email',
              //   label: intl.formatMessage({
              //     id: 'pages.register.email.tab',
              //     defaultMessage: 'By email',
              //   }),
              // },
              // {
              //   key: 'phone',
              //   label: intl.formatMessage({
              //     id: 'pages.register.phone.tab',
              //     defaultMessage: 'By phone',
              //   }),
              // },
            ]}
          ></Tabs>

          {status === 'error' && <RegisterMessage content={errorMsg ?? ''} />}
          {type === 'account' && (
            <Spin spinning={registerLoading}>
              <ProFormText
                name="name"
                fieldProps={{
                  ref: inputRef,
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="Full Name"
                rules={[
                  {
                    required: true,
                    message: 'Full name is required.',
                  },
                ]}
              />
              <ProFormText
                name="email"
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                }}
                placeholder="Email Address"
                rules={[
                  { required: true, message: 'Email address is required.' },
                  { type: 'email', message: 'Email address is invalid.' },
                ]}
              />
              <ProFormText
                name="mobile"
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                placeholder="Phone Number"
                rules={[
                  { required: true, message: 'Phone number is required.' },
                  { min: 6, message: 'Phone number is invalid.' },
                ]}
              />
              {flagEnabled(regForm.enable_batch) ? (
                <ProFormSelect
                  name="batch_id"
                  fieldProps={{ size: 'large' }}
                  options={asOptions(registerPage.batches)}
                  placeholder="Select Batch"
                  rules={[{ required: true, message: 'Batch is required.' }]}
                />
              ) : null}
              {flagEnabled(regForm.enable_department) ? (
                <ProFormSelect
                  name="department_id"
                  fieldProps={{ size: 'large' }}
                  options={asOptions(registerPage.departments, 'short_name')}
                  placeholder="Select Department"
                  rules={[{ required: true, message: 'Department is required.' }]}
                />
              ) : null}
              {flagEnabled(regForm.enable_passing_year) ? (
                <ProFormSelect
                  name="passing_year_id"
                  fieldProps={{ size: 'large' }}
                  options={asOptions(registerPage.passingYears || registerPage.passing_years)}
                  placeholder="Select Passing Year"
                  rules={[{ required: true, message: 'Passing year is required.' }]}
                />
              ) : null}
              {flagEnabled(regForm.enable_role_number) ? (
                <ProFormText
                  name="id_number"
                  fieldProps={{
                    size: 'large',
                    prefix: <IdcardOutlined />,
                  }}
                  placeholder="ID/Roll Number"
                  rules={[{ required: true, message: 'ID/Roll number is required.' }]}
                />
              ) : null}
              {flagEnabled(regForm.enable_attachment) ? (
                <ProFormUploadButton
                  name="file"
                  max={1}
                  fieldProps={{
                    accept: 'application/pdf',
                    beforeUpload: () => false,
                    maxCount: 1,
                  }}
                  icon={<UploadOutlined />}
                  title="Choose PDF"
                  rules={[{ required: true, message: 'Attachment is required.' }]}
                />
              ) : null}
              {flagEnabled(regForm.enable_date_of_birth) ? (
                <ProFormDatePicker
                  name="date_of_birth"
                  fieldProps={{
                    size: 'large',
                    suffixIcon: <CalendarOutlined />,
                  }}
                  placeholder="Birth Date"
                  rules={[{ required: true, message: 'Birth date is required.' }]}
                />
              ) : null}
              {flagEnabled(regForm.enable_gender) ? (
                <ProFormSelect
                  name="gender"
                  fieldProps={{ size: 'large' }}
                  options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' },
                  ]}
                  placeholder="Gender"
                  rules={[{ required: true, message: 'Gender is required.' }]}
                />
              ) : null}
              {customFields.map((field, index) => {
                const fieldName = field.name || `field_${index}`;
                const name = `custom_${fieldName}`;
                const label = field.label || fieldName;
                const rules = field.required
                  ? [{ required: true, message: `${label} is required.` }]
                  : [];
                const options = (field.values || []).map((item) => ({
                  label: item.label || item.value || '',
                  value: item.value || item.label || '',
                }));
                if (field.type === 'textarea') {
                  return (
                    <ProFormTextArea
                      key={name}
                      name={name}
                      placeholder={label}
                      rules={rules}
                      fieldProps={{ rows: 3 }}
                    />
                  );
                }
                if (
                  field.type === 'select' ||
                  field.type === 'radio-group' ||
                  field.type === 'checkbox-group'
                ) {
                  return (
                    <ProFormSelect
                      key={name}
                      name={name}
                      options={options}
                      placeholder={label}
                      rules={rules}
                      fieldProps={{
                        mode: field.type === 'checkbox-group' ? 'multiple' : undefined,
                        size: 'large',
                      }}
                    />
                  );
                }
                if (field.type === 'date') {
                  return (
                    <ProFormDatePicker
                      key={name}
                      name={name}
                      placeholder={label}
                      rules={rules}
                      fieldProps={{ size: 'large' }}
                    />
                  );
                }
                return (
                  <ProFormText
                    key={name}
                    name={name}
                    placeholder={label}
                    rules={rules}
                    fieldProps={{ size: 'large' }}
                  />
                );
              })}
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="confirmPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.confirmPassword.placeholder',
                  defaultMessage: 'Confirm Password',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          intl.formatMessage({
                            id: 'pages.confirmPassword.mismatch',
                            defaultMessage: 'Confirm Password Mismatch',
                          }),
                        ),
                      );
                    },
                  }),
                ]}
              />
            </Spin>
          )}

          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneRegister.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async () => {
                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          ></div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
