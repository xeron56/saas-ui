import Footer from '@/components/Footer';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import {
  FormattedMessage,
  SelectLang,
  history,
  useIntl,
  useModel,
  useSearchParams,
} from '@umijs/max';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FriendlyError } from '@gosaas/core';
import { Alert, Button, message } from 'antd';
import React, { useMemo, useState } from 'react';
import { resetPassword } from '../ForgotPassword/service';

type ResetLinkParams = {
  email?: string;
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

const ResetPassword: React.FC = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => searchParams.get('token') || searchParams.get('reset_token') || '',
    [searchParams],
  );
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
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

  const handleSubmit = async (values: ResetLinkParams) => {
    setErrorMsg(undefined);
    if (!token) {
      setErrorMsg(
        intl.formatMessage({
          id: 'pages.resetPassword.invalidLink',
          defaultMessage: 'Reset link is invalid.',
        }),
      );
      return;
    }
    try {
      await resetPassword({
        email: values.email || initialEmail,
        token,
        password: values.password!,
        confirm_password: values.confirmPassword!,
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
          initialValues={{ email: initialEmail }}
          actions={[
            <Button key="loginbtn" type="link" onClick={() => history.push('/user/login')}>
              <FormattedMessage id="pages.login.tips" defaultMessage="Already have an account?" />
            </Button>,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as ResetLinkParams);
          }}
        >
          {errorMsg && <ResetMessage content={errorMsg} />}
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
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
