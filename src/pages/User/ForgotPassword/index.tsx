import { MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, request, useIntl } from '@umijs/max';
import { Button, message } from 'antd';
import {
  errorMessage,
  PasswordResetMessage,
  PasswordResetPageShell,
  SuccessMessage,
  textValue,
  usePasswordResetChrome,
} from '../PasswordReset/shared';
import { useState } from 'react';

type ForgotPasswordValues = {
  email?: string;
};

export default function ForgotPassword() {
  const intl = useIntl();
  const { title, logo } = usePasswordResetChrome();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (values: ForgotPasswordValues) => {
    const email = textValue(values.email).toLowerCase();
    setError('');
    setSuccess('');
    try {
      await request('/password/reset', {
        method: 'POST',
        data: { email },
      });
      const successMessage = 'We have sent your password reset code.';
      message.success(successMessage);
      setSuccess(successMessage);
      history.push(`/password/reset/verify/${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(errorMessage(err, 'Unable to send password reset code.'));
    }
  };

  return (
    <PasswordResetPageShell>
      <LoginForm
        logo={<img alt="logo" src={logo} />}
        title={title}
        subTitle={intl.formatMessage({
          id: 'pages.layouts.userLayout.title',
          defaultMessage: '',
        })}
        submitter={{
          searchConfig: {
            submitText: 'Continue',
          },
        }}
        actions={[
          <Button key="login" type="link" onClick={() => history.push('/user/login')}>
            Back to login
          </Button>,
        ]}
        onFinish={async (values) => {
          await submit(values as ForgotPasswordValues);
        }}
      >
        {error ? <PasswordResetMessage content={error} /> : null}
        {success ? <SuccessMessage content={success} /> : null}
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
      </LoginForm>
    </PasswordResetPageShell>
  );
}
