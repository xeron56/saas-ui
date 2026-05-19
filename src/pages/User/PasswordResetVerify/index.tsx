import { KeyOutlined, MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, request, useParams, useSearchParams } from '@umijs/max';
import { Button, Space, message } from 'antd';
import { useState } from 'react';
import {
  changePasswordTokenFromReply,
  errorMessage,
  type LegacyReply,
  PasswordResetMessage,
  PasswordResetPageShell,
  safeDecode,
  storeChangePasswordToken,
  textValue,
  usePasswordResetChrome,
} from '../PasswordReset/shared';

type VerifyValues = {
  email?: string;
  token?: string;
};

function otpPayload(token: string, email: string) {
  const data: Record<string, string> = { email };
  if (/^\d{4}$/.test(token)) {
    token.split('').forEach((digit, index) => {
      data[`otp__field__${index + 1}`] = digit;
    });
  }
  return data;
}

export default function PasswordResetVerify() {
  const params = useParams<{ token?: string; email?: string }>();
  const [searchParams] = useSearchParams();
  const { title, logo } = usePasswordResetChrome();
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const initialToken = textValue(params.token);
  const initialEmail = safeDecode(
    params.email || searchParams.get('email') || (initialToken.includes('@') ? initialToken : ''),
  );

  const submit = async (values: VerifyValues) => {
    const token = textValue(values.token);
    const email = textValue(values.email).toLowerCase();
    setError('');
    try {
      const reply = await request<LegacyReply>(
        `/password/reset/verify/${encodeURIComponent(token)}`,
        {
          method: 'POST',
          data: otpPayload(token, email),
        },
      );
      const changePasswordToken = changePasswordTokenFromReply(reply);
      if (!changePasswordToken) {
        setError('Reset code was accepted, but no password-change token was returned.');
        return;
      }
      storeChangePasswordToken(email, token, changePasswordToken);
      history.push(
        `/password/reset/update/${encodeURIComponent(token)}?email=${encodeURIComponent(email)}`,
      );
    } catch (err: any) {
      setError(errorMessage(err, 'Reset code could not be verified.'));
    }
  };

  const resend = async () => {
    const email = textValue(initialEmail).toLowerCase();
    const token = textValue(initialToken || 'resend');
    if (!email) {
      setError('Email address is required before requesting a new code.');
      return;
    }
    setResending(true);
    setError('');
    try {
      await request(`/password/reset/verify-resend/${encodeURIComponent(token)}`, {
        method: 'POST',
        data: { email },
      });
      message.success('We have sent a fresh reset code.');
    } catch (err: any) {
      setError(errorMessage(err, 'Unable to resend reset code.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <PasswordResetPageShell>
      <LoginForm
        logo={<img alt="logo" src={logo} />}
        title={title}
        subTitle="Enter the reset code from your email."
        submitter={{
          searchConfig: {
            submitText: 'Continue',
          },
        }}
        actions={[
          <Space key="actions">
            <Button type="link" onClick={() => history.push('/password/reset')}>
              Use another email
            </Button>
            <Button type="link" loading={resending} onClick={resend}>
              Resend code
            </Button>
          </Space>,
        ]}
        initialValues={{
          email: initialEmail,
          token: initialToken && initialEmail !== initialToken ? initialToken : '',
        }}
        onFinish={async (values) => {
          await submit(values as VerifyValues);
        }}
      >
        {error ? <PasswordResetMessage content={error} /> : null}
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
        <ProFormText
          name="token"
          fieldProps={{
            size: 'large',
            prefix: <KeyOutlined />,
          }}
          placeholder="Reset code"
          rules={[{ required: true, message: 'Reset code is required.' }]}
        />
      </LoginForm>
    </PasswordResetPageShell>
  );
}
