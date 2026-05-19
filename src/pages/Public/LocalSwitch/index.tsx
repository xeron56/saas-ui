import { LoadingOutlined } from '@ant-design/icons';
import { history, request, setLocale, useParams, useSearchParams } from '@umijs/max';
import { Alert, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import PublicShell from '../PublicShell';

type LegacyRecord = Record<string, any>;

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

function safeReturnPath(value: string) {
  if (!value || value.includes('/local/')) {
    return '/';
  }
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin === window.location.origin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch (_err) {
    if (value.startsWith('/')) {
      return value;
    }
  }
  return '/';
}

export default function LocalSwitch() {
  const params = useParams<{ ln?: string }>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const locale = textValue(params.ln || searchParams.get('local') || 'en');
  const fallback = useMemo(() => {
    const redirect = textValue(searchParams.get('redirect'));
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    return safeReturnPath(redirect || referrer);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    request<LegacyRecord>(`/local/${encodeURIComponent(locale)}`)
      .then((reply) => {
        const body = bodyFromReply(reply);
        const resolved = textValue(body.locale || body.local || locale);
        if (resolved) {
          setLocale(resolved, false);
        }
        const target = safeReturnPath(textValue(body.redirect) || fallback);
        history.replace(target);
      })
      .catch((err) => {
        if (mounted) {
          setError(err?.message || 'Language could not be changed.');
        }
      });
    return () => {
      mounted = false;
    };
  }, [fallback, locale]);

  return (
    <PublicShell title="Language">
      {error ? <Alert message={error} showIcon type="error" /> : null}
      <Spin indicator={<LoadingOutlined spin />} />
    </PublicShell>
  );
}
