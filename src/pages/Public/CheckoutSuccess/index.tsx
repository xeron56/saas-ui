import { useLocation } from '@umijs/max';
import { Alert, Button, Result, Spin } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function CheckoutSuccess() {
  const location = useLocation();
  const subscription = location.pathname.startsWith('/subscription/');
  const [payload, setPayload] = useState<LegacyRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const endpoint = `${subscription ? '/subscription/checkout/success' : '/checkout/success'}${
      location.search
    }`;
    setLoading(true);
    setError('');
    fetchPublicContent(endpoint)
      .then((response) => setPayload(normalizePayload(response)))
      .catch((err) => setError(err?.message || 'Unable to load payment result.'))
      .finally(() => setLoading(false));
  }, [location.search, subscription]);

  const success = payload?.success === true || textValue(payload?.success) === 'true';
  const message =
    textValue(payload?.message) || (success ? 'Payment completed.' : 'Payment failed.');

  return (
    <PublicShell title="Payment Result" description={message}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        <Result
          status={success ? 'success' : 'error'}
          title={message}
          extra={
            <Button type="primary" href="/" icon={<HomeOutlined />}>
              Home
            </Button>
          }
        />
      </Spin>
    </PublicShell>
  );
}
