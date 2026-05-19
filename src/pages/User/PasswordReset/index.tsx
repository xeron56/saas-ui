import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, request, useParams, useSearchParams } from '@umijs/max';
import { Button, message } from 'antd';
import { useState } from 'react';
import {
  clearChangePasswordToken,
  errorMessage,
  PasswordResetMessage,
  PasswordResetPageShell,
  readChangePasswordToken,
  textValue,
  usePasswordResetChrome,
} from './shared';

type ResetPasswordValues = {
  email?: string;
  password?: string;
  password_confirmation?: string;
};

export default function PasswordReset() {
  const params = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const { title, logo } = usePasswordResetChrome();
  const [error, setError] = useState('');
  const token = textValue(params.token);
  const email = textValue(searchParams.get('email')).toLowerCase();
  const changePasswordToken = readChangePasswordToken(email, token);

  const submit = async (values: ResetPasswordValues) => {
    const formEmail = textValue(values.email).toLowerCase();
    const password = textValue(values.password);
    const confirmation = textValue(values.password_confirmation);
    const scopedChangePasswordToken = readChangePasswordToken(formEmail, token);
    if (!scopedChangePasswordToken) {
      setError('Reset code verification is required before setting a new password.');
      return;
    }
    setError('');
    try {
      await request(`/password/reset/update/${encodeURIComponent(token)}`, {
        method: 'POST',
        data: {
          email: formEmail,
          password,
          password_confirmation: confirmation,
          change_password_token: scopedChangePasswordToken,
        },
      });
      clearChangePasswordToken(formEmail, token);
      message.success('Password reset successfully. Please sign in with your new password.');
      history.push('/user/login');
    } catch (err: any) {
      setError(errorMessage(err, 'Password could not be reset.'));
    }
  };

  return (
    <PasswordResetPageShell>
      <LoginForm
        logo={<img alt="logo" src={logo} />}
        title={title}
        subTitle="Set your new password."
        submitter={{
          searchConfig: {
            submitText: 'Update',
          },
        }}
        actions={[
          <Button key="verify" type="link" onClick={() => history.push('/password/reset')}>
            Start over
          </Button>,
        ]}
        initialValues={{
          email,
        }}
        onFinish={async (values) => {
          await submit(values as ResetPasswordValues);
        }}
      >
        {error ? <PasswordResetMessage content={error} /> : null}
        {!changePasswordToken ? (
          <PasswordResetMessage content="Reset code verification is required before setting a new password." />
        ) : null}
        <ProFormText
          name="email"
          fieldProps={{
            size: 'large',
            prefix: <MailOutlined />,
          }}
          placeholder="Email address"
          rules={[
            { required: true, message: 'Email address is required.' },
            { type: 'email', message: 'Enter a valid email address.' },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="New password"
          rules={[
            { required: true, message: 'New password is required.' },
            { min: 8, message: 'Password must be at least 8 characters.' },
          ]}
        />
        <ProFormText.Password
          name="password_confirmation"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="Confirm password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match.'));
              },
            }),
          ]}
        />
      </LoginForm>
    </PasswordResetPageShell>
  );
}
