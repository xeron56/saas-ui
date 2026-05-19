import Footer from '@/components/Footer';
import { SelectLang, useModel } from '@umijs/max';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Alert } from 'antd';
import type { ReactNode } from 'react';

export type LegacyReply = {
  status?: boolean;
  message?: string;
  data?: Record<string, any>;
  changePasswordToken?: string;
  change_password_token?: string;
};

export function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

export function safeDecode(value: unknown) {
  const text = textValue(value);
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

export function errorMessage(error: any, fallback: string) {
  return textValue(error?.data?.message) || textValue(error?.message) || fallback;
}

export function PasswordResetMessage({ content }: { content: string }) {
  return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
}

export function SuccessMessage({ content }: { content: string }) {
  return <Alert style={{ marginBottom: 24 }} message={content} type="success" showIcon />;
}

function Lang() {
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
}

export function usePasswordResetChrome() {
  const { initialState } = useModel('@@initialState');
  const containerClassName = useEmotionCss(() => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    overflow: 'auto',
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
  }));

  return {
    containerClassName,
    title: initialState?.currentTenant?.tenant?.displayName || '',
    logo: initialState?.currentTenant?.tenant?.logo?.url || '/logo.png',
  };
}

export function PasswordResetPageShell({ children }: { children: ReactNode }) {
  const { containerClassName } = usePasswordResetChrome();

  return (
    <div className={containerClassName}>
      <Lang />
      <div style={{ flex: '1', padding: '32px 0' }}>{children}</div>
      <Footer />
    </div>
  );
}

function storageKey(email: string, token: string) {
  return `password-reset:${email}:${token}`;
}

export function storeChangePasswordToken(
  email: string,
  token: string,
  changePasswordToken: string,
) {
  if (!email || !token || !changePasswordToken || typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(storageKey(email, token), changePasswordToken);
}

export function readChangePasswordToken(email: string, token: string) {
  if (!email || !token || typeof window === 'undefined') {
    return '';
  }
  return window.sessionStorage.getItem(storageKey(email, token)) || '';
}

export function clearChangePasswordToken(email: string, token: string) {
  if (!email || !token || typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem(storageKey(email, token));
}

export function changePasswordTokenFromReply(reply?: LegacyReply) {
  return (
    textValue(reply?.changePasswordToken) ||
    textValue(reply?.change_password_token) ||
    textValue(reply?.data?.changePasswordToken) ||
    textValue(reply?.data?.change_password_token)
  );
}
