import { KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, request, useModel, useSearchParams } from '@umijs/max';
import { Alert, Button, Spin, Typography, message } from 'antd';
import { useEffect, useState } from 'react';

type LegacyRecord = Record<string, any>;

type VerifyValues = {
  one_time_password?: string;
};

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function bodyFromReply(reply: LegacyRecord) {
  const data = reply.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...reply, ...data };
  }
  return reply;
}

function successStatus(reply: LegacyRecord) {
  if (reply.status === false || reply.success === false) {
    return false;
  }
  return true;
}

function redirectTarget(reply: LegacyRecord, fallback: string) {
  const body = bodyFromReply(reply);
  const target = textValue(body.redirect || body.redirect_url);
  if (target && !target.startsWith('/auth/web/')) {
    return target;
  }
  return fallback;
}

export default function Google2FAVerify() {
  const { initialState } = useModel('@@initialState');
  const [searchParams] = useSearchParams();
  const [payload, setPayload] = useState<LegacyRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tenantName = textValue(initialState?.currentTenant?.tenant?.displayName);
  const logo = textValue(initialState?.currentTenant?.tenant?.logo?.url) || '/logo.png';
  const user = bodyFromReply(payload || {}).user || {};
  const userName = textValue(user.name || initialState?.currentUser?.name);
  const fallbackRedirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    setLoading(true);
    setError('');
    request<LegacyRecord>('/google2fa/authenticate/verify')
      .then((response) => setPayload(bodyFromReply(response)))
      .catch((err) => setError(err?.message || 'Unable to load two-factor verification.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (values: VerifyValues) => {
    setError('');
    try {
      const reply = await request<LegacyRecord>('/google2fa/authenticate/verify/action', {
        method: 'POST',
        data: {
          one_time_password: textValue(values.one_time_password),
        },
      });
      if (!successStatus(reply)) {
        setError(textValue(reply.message) || 'Code does not match.');
        return;
      }
      message.success(textValue(reply.message) || 'Two-factor verification complete.');
      history.replace(redirectTarget(reply, fallbackRedirect));
    } catch (err: any) {
      setError(err?.message || 'Two-factor verification failed.');
    }
  };

  return (
    <LoginForm
      logo={<img alt="logo" src={logo} />}
      title={tenantName}
      subTitle={
        userName
          ? `Hello ${userName}, enter the verification code from Google Authenticator.`
          : 'Enter the verification code from Google Authenticator.'
      }
      submitter={{
        searchConfig: {
          submitText: 'Next',
        },
      }}
      actions={[
        <Button key="login" type="link" onClick={() => history.push('/user/login')}>
          Back to login
        </Button>,
      ]}
      onFinish={async (values) => {
        await submit(values as VerifyValues);
      }}
    >
      {loading ? <Spin style={{ display: 'block', marginBottom: 24 }} /> : null}
      {error ? <Alert message={error} showIcon style={{ marginBottom: 24 }} type="error" /> : null}
      <Typography.Paragraph type="secondary">
        If you lost access to your authenticator app, contact the tenant administrator.
      </Typography.Paragraph>
      <ProFormText
        name="one_time_password"
        fieldProps={{
          autoComplete: 'one-time-code',
          inputMode: 'numeric',
          prefix: loading ? <SafetyCertificateOutlined /> : <KeyOutlined />,
          size: 'large',
        }}
        placeholder="Authentication code"
        rules={[{ required: true, message: 'Authentication code is required.' }]}
      />
    </LoginForm>
  );
}
