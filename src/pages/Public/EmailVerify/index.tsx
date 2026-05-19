import { useParams } from '@umijs/max';
import { Alert, Button, Form, Input, Spin, message as toast } from 'antd';
import { MailOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent, postPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function EmailVerify() {
  const params = useParams();
  const [form] = Form.useForm();
  const [payload, setPayload] = useState<LegacyRecord>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const token = textValue(params.token);
  const user = (payload.user || {}) as LegacyRecord;
  const alreadyVerified = payload.status !== false && user.email_confirmed === true;

  const load = async () => {
    if (!token) {
      setError('Verification token is required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setPayload(
        normalizePayload(await fetchPublicContent(`/email/verify/${encodeURIComponent(token)}`)),
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to load email verification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submit = async (values: { otp?: string }) => {
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const response = normalizePayload(
        await postPublicContent(`/email/verified/${encodeURIComponent(token)}`, {
          otp: textValue(values.otp),
        }),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Email could not be verified.');
        return;
      }
      setNotice(textValue(response.message) || 'Email verified.');
      form.resetFields();
      await load();
    } catch (err: any) {
      setError(err?.message || 'Email could not be verified.');
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError('');
    setNotice('');
    try {
      const response = normalizePayload(
        await postPublicContent(`/email/verify/resend/${encodeURIComponent(token)}`, {}),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Verification email could not be resent.');
        return;
      }
      setNotice(textValue(response.message) || 'Verification email resent.');
      toast.success(textValue(response.message) || 'Verification email resent.');
      await load();
    } catch (err: any) {
      setError(err?.message || 'Verification email could not be resent.');
    } finally {
      setResending(false);
    }
  };

  return (
    <PublicShell title="Email Verification" description={textValue(user.email)}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      {notice ? (
        <Alert type="success" message={notice} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <Spin spinning={loading}>
        <section className="public-verification-panel">
          {alreadyVerified ? (
            <Alert type="success" showIcon message="Email is already verified." />
          ) : (
            <>
              <div className="public-section-heading">
                <h2>{textValue(user.name) || textValue(user.username) || 'Verify your email'}</h2>
              </div>
              <Form
                className="public-form public-settings-form"
                form={form}
                layout="vertical"
                requiredMark={false}
                onFinish={submit}
              >
                <Form.Item name="otp" label="Verification Code" rules={[{ required: true }]}>
                  <Input inputMode="numeric" maxLength={8} />
                </Form.Item>
                <div className="public-card-actions">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<MailOutlined />}
                    loading={submitting}
                  >
                    Verify
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={resend} loading={resending}>
                    Resend
                  </Button>
                </div>
              </Form>
            </>
          )}
        </section>
      </Spin>
    </PublicShell>
  );
}
