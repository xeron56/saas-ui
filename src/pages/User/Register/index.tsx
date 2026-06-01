import Footer from '@/components/Footer';
import {
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { FormattedMessage, SelectLang, useIntl, useModel, history } from '@umijs/max';
import { Alert, Button, message, Tabs } from 'antd';
import type { InputRef } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { FriendlyError } from '@gosaas/core';
import { AuthApi } from '@gosaas/api';
import { useMount } from 'ahooks';
import { useSearchParams } from '@umijs/max';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import {
  businessSetup,
  getSignupOTPSettings,
  listBusinessCategories,
  resendSignupOTP,
  signUpWithEmail,
  submitSignupOTP,
} from './service';

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
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  passwordlessToken?: string;
  type?: string;
  companyName?: string;
  business_category_id?: string;
  phoneNumber?: string;
  address?: string;
  shopOpeningBalance?: number;
};

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
  //account,phone,email
  const [type, setType] = useState<string>('account');
  const [emailOtpStep, setEmailOtpStep] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>();
  const [pendingName, setPendingName] = useState<string>();
  const [otpExpiration, setOtpExpiration] = useState<number>();
  const [businessSetupStep, setBusinessSetupStep] = useState<boolean>(false);
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

  useEffect(() => {
    getSignupOTPSettings()
      .then((resp) => {
        setOtpExpiration(resp.otp_expiration);
      })
      .catch(() => {
        setOtpExpiration(undefined);
      });
  }, []);
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

  const handleSubmit = async (values: RegisterParams) => {
    try {
      if (businessSetupStep) {
        const resp = await businessSetup({
          companyName: values.companyName!,
          business_category_id: values.business_category_id!,
          phoneNumber: values.phoneNumber!,
          address: values.address,
          shopOpeningBalance: values.shopOpeningBalance,
          plan_id: searchParams.get('plan_id') || undefined,
          plan_key: searchParams.get('plan_key') || undefined,
          price_id: searchParams.get('price_id') || undefined,
        });
        message.success(
          resp.message ||
            intl.formatMessage({
              id: 'pages.register.businessSetup.success',
              defaultMessage: 'Business setup completed.',
            }),
        );
        await fetchUserInfo();
        const setupRedirect = typeof resp.redirect === 'string' ? resp.redirect.trim() : '';
        if (setupRedirect) {
          history.push(setupRedirect);
          return;
        }
        const tenantId = resp.data?.tenant_id || resp.data?.tenant?.id || resp.tenant?.id;
        if (tenantId && initialState?.changeTenant) {
          await initialState.changeTenant(tenantId);
          return;
        }
        history.push(redirect || '/');
        return;
      }

      const defaultRegisterSuccessMessage = intl.formatMessage({
        id: 'pages.register.success',
        defaultMessage: 'Register successfully!',
      });

      if (type === 'account') {
        await service.authRegister({
          body: {
            username: values.username!,
            password: values.password!,
            confirmPassword: values.confirmPassword!,
            web: true,
          },
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
        if (emailOtpStep) {
          await submitSignupOTP({
            email: pendingEmail || values.email!,
            otp: values.passwordlessToken!,
            web: true,
          });
        } else {
          const resp = await signUpWithEmail({
            name: values.username!,
            email: values.email!,
            password: values.password!,
            confirm_password: values.confirmPassword!,
            web: true,
          });
          if (resp.otp_required) {
            setPendingEmail(values.email);
            setPendingName(values.username);
            setEmailOtpStep(true);
            setOtpExpiration(resp.otp_expiration || otpExpiration);
            message.success(
              resp.message ||
                intl.formatMessage({
                  id: 'pages.register.otp.sent',
                  defaultMessage: 'Verification code sent.',
                }),
            );
            return;
          }
        }
      }

      message.success(defaultRegisterSuccessMessage);
      await fetchUserInfo();
      setBusinessSetupStep(true);
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
          {!businessSetupStep && (
            <Tabs
              activeKey={type}
              onChange={(key) => {
                setType(key);
                setEmailOtpStep(false);
              }}
              items={[
                {
                  key: 'account',
                  label: intl.formatMessage({
                    id: 'pages.register.account.tab',
                    defaultMessage: 'By username',
                  }),
                },
                {
                  key: 'email',
                  label: intl.formatMessage({
                    id: 'pages.register.email.tab',
                    defaultMessage: 'By email',
                  }),
                },
                // {
                //   key: 'phone',
                //   label: intl.formatMessage({
                //     id: 'pages.register.phone.tab',
                //     defaultMessage: 'By phone',
                //   }),
                // },
              ]}
            ></Tabs>
          )}

          {status === 'error' && <RegisterMessage content={errorMsg ?? ''} />}
          {businessSetupStep && (
            <>
              <ProFormText
                name="companyName"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.register.businessSetup.companyName',
                  defaultMessage: 'Company Name',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.register.businessSetup.companyName.required"
                        defaultMessage="Please enter your company name!"
                      />
                    ),
                  },
                  {
                    max: 250,
                  },
                ]}
              />
              <ProFormSelect
                name="business_category_id"
                fieldProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.register.businessSetup.category',
                  defaultMessage: 'Business Category',
                })}
                request={async () => {
                  const resp = await listBusinessCategories();
                  return (resp.data ?? []).map((item) => ({
                    label: item.display_name ?? item.displayName ?? item.name ?? item.id,
                    value: item.id,
                  }));
                }}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.register.businessSetup.category.required"
                        defaultMessage="Please select a business category!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText
                name="phoneNumber"
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.register.businessSetup.phoneNumber',
                  defaultMessage: 'Phone Number',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.register.businessSetup.phoneNumber.required"
                        defaultMessage="Please enter your phone number!"
                      />
                    ),
                  },
                  {
                    max: 20,
                  },
                ]}
              />
              <ProFormTextArea
                name="address"
                placeholder={intl.formatMessage({
                  id: 'pages.register.businessSetup.address',
                  defaultMessage: 'Address',
                })}
                fieldProps={{ maxLength: 250, showCount: true }}
              />
              <ProFormDigit
                name="shopOpeningBalance"
                placeholder={intl.formatMessage({
                  id: 'pages.register.businessSetup.shopOpeningBalance',
                  defaultMessage: 'Opening Balance',
                })}
                fieldProps={{ size: 'large', precision: 2 }}
              />
            </>
          )}
          {!businessSetupStep && type === 'email' && (
            <>
              {!emailOtpStep && (
                <>
                  <ProFormText
                    name="username"
                    fieldProps={{
                      size: 'large',
                      prefix: <UserOutlined />,
                    }}
                    placeholder={intl.formatMessage({
                      id: 'pages.register.name.placeholder',
                      defaultMessage: 'Name',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.register.name.required"
                            defaultMessage="Please enter your name!"
                          />
                        ),
                      },
                    ]}
                  />
                  <ProFormText
                    name="email"
                    fieldProps={{
                      size: 'large',
                      prefix: <MailOutlined />,
                    }}
                    placeholder={intl.formatMessage({
                      id: 'pages.register.email.placeholder',
                      defaultMessage: 'Email',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.register.email.required"
                            defaultMessage="Please enter your email!"
                          />
                        ),
                      },
                      {
                        type: 'email',
                        message: (
                          <FormattedMessage
                            id="pages.register.email.invalid"
                            defaultMessage="Invalid email address!"
                          />
                        ),
                      },
                    ]}
                  />
                  <ProFormText.Password
                    name="password"
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined />,
                    }}
                    placeholder={intl.formatMessage({
                      id: 'pages.login.password.placeholder',
                      defaultMessage: 'Password',
                    })}
                    rules={[
                      {
                        required: true,
                        message: (
                          <FormattedMessage
                            id="pages.login.password.required"
                            defaultMessage="Please enter your password!"
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
                            defaultMessage="Please enter your password!"
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
                </>
              )}
              {emailOtpStep && (
                <ProFormCaptcha
                  fieldProps={{
                    size: 'large',
                    prefix: <SafetyCertificateOutlined />,
                  }}
                  captchaProps={{
                    size: 'large',
                  }}
                  placeholder={intl.formatMessage({
                    id: 'pages.register.otp.placeholder',
                    defaultMessage: 'Verification code',
                  })}
                  captchaTextRender={(timing, count) => {
                    if (timing) {
                      return `${count}s`;
                    }
                    return intl.formatMessage({
                      id: 'pages.register.otp.resend',
                      defaultMessage: 'Resend',
                    });
                  }}
                  name="passwordlessToken"
                  rules={[
                    {
                      required: true,
                      message: (
                        <FormattedMessage
                          id="pages.register.otp.required"
                          defaultMessage="Please enter the verification code!"
                        />
                      ),
                    },
                  ]}
                  onGetCaptcha={async () => {
                    await resendSignupOTP({
                      email: pendingEmail!,
                      name: pendingName,
                    });
                    message.success(
                      intl.formatMessage({
                        id: 'pages.register.otp.sent',
                        defaultMessage: 'Verification code sent.',
                      }),
                    );
                  }}
                  countDown={otpExpiration || 60}
                />
              )}
            </>
          )}
          {!businessSetupStep && type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  ref: inputRef,
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
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
            </>
          )}

          {!businessSetupStep && type === 'mobile' && (
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
