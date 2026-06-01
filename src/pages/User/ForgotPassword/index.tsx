import Footer from '@/components/Footer';
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, SelectLang, history, useIntl, useModel } from '@umijs/max';
import { Alert, Button, Steps, message } from 'antd';
import React, { useState } from 'react';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FriendlyError } from '@gosaas/core';
import { resetPassword, sendResetCode, verifyResetCode } from './service';

type ResetParams = {
  email?: string;
  code?: string;
  password?: string;
  confirmPassword?: string;
};

const ResetMessage: React.FC<{ content: string }> = ({ content }) => (
  <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
);

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => ({
    width: 42,
    height: 42,
    lineHeight: '42px',
    position: 'fixed',
    right: 16,
    borderRadius: token.borderRadius,
    ':hover': {
      backgroundColor: token.colorBgTextHover,
    },
  }));

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const ForgotPassword: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [step, setStep] = useState<number>(0);
  const [email, setEmail] = useState<string>();
  const [code, setCode] = useState<string>();
  const [changeToken, setChangeToken] = useState<string>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const containerClassName = useEmotionCss(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'auto',
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
  }));

  const title = initialState?.currentTenant?.tenant?.displayName || '';
  const logo = initialState?.currentTenant?.tenant?.logo?.url || '/logo.png';

  const handleSubmit = async (values: ResetParams) => {
    setErrorMsg(undefined);
    try {
      if (step === 0) {
        const nextEmail = values.email!;
        const resp = await sendResetCode({ email: nextEmail });
        setEmail(nextEmail);
        setStep(1);
        message.success(resp.message || 'Password reset code has been sent.');
        return;
      }
      if (step === 1) {
        const nextCode = values.code!;
        const resp = await verifyResetCode({ email: email!, code: nextCode });
        setCode(nextCode);
        setChangeToken(resp.change_password_token);
        setStep(2);
        message.success(resp.message || 'The code has been verified.');
        return;
      }
      await resetPassword({
        email: email!,
        code,
        password: values.password!,
        confirm_password: values.confirmPassword!,
        change_password_token: changeToken,
      });
      message.success(
        intl.formatMessage({
          id: 'pages.forgotPassword.success',
          defaultMessage: 'Your password has been changed.',
        }),
      );
      history.push('/user/login');
    } catch (error) {
      setErrorMsg(error instanceof FriendlyError ? error.message : ' ');
    }
  };

  return (
    <div className={containerClassName}>
      <Lang />
      <div style={{ flex: '1', padding: '32px 0' }}>
        <LoginForm
          logo={<img alt="logo" src={logo} />}
          title={title}
          subTitle=" "
          actions={[
            <Button key="loginbtn" type="link" onClick={() => history.push('/user/login')}>
              <FormattedMessage id="pages.login.tips" defaultMessage="Already have an account?" />
            </Button>,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as ResetParams);
          }}
        >
          <Steps
            size="small"
            current={step}
            items={[
              {
                title: intl.formatMessage({
                  id: 'pages.forgotPassword.email',
                  defaultMessage: 'Email',
                }),
              },
              {
                title: intl.formatMessage({
                  id: 'pages.forgotPassword.code',
                  defaultMessage: 'Code',
                }),
              },
              {
                title: intl.formatMessage({
                  id: 'pages.forgotPassword.password',
                  defaultMessage: 'Password',
                }),
              },
            ]}
            style={{ marginBottom: 24 }}
          />
          {errorMsg && <ResetMessage content={errorMsg} />}
          {step === 0 && (
            <ProFormText
              name="email"
              fieldProps={{ size: 'large', prefix: <MailOutlined /> }}
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
          )}
          {step === 1 && (
            <ProFormText
              name="code"
              fieldProps={{ size: 'large', prefix: <SafetyCertificateOutlined /> }}
              placeholder={intl.formatMessage({
                id: 'pages.forgotPassword.code.placeholder',
                defaultMessage: 'Reset code',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.forgotPassword.code.required"
                      defaultMessage="Please enter the reset code!"
                    />
                  ),
                },
              ]}
            />
          )}
          {step === 2 && (
            <>
              <ProFormText.Password
                name="password"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
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
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
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
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
