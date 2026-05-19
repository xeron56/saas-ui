import { GlobalOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Alert, Button, Card, Form, Space, message as toast } from 'antd';
import { useEffect, useState } from 'react';

type PageResponse = {
  cname_information?: string;
  option?: string;
  options?: Record<string, unknown>;
};

type LegacyResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

type FormValues = {
  cname_information?: string;
};

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function cnameValue(response?: PageResponse) {
  return sanitizeRichText(
    textValue(
      response?.cname_information ?? response?.options?.cname_information ?? response?.option,
    ),
  );
}

export default function SuperAdminCustomDomainDetails() {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDetails = () => {
    setLoading(true);
    setError('');
    request<PageResponse>('/super-admin/setting/custom-domain-details')
      .then((response) => {
        form.setFieldsValue({
          cname_information: cnameValue(response),
        });
      })
      .catch((err) => setError(err?.message || 'Unable to load custom domain details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDetails();
  }, []);

  const saveDetails = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const response = await request<LegacyResponse<Record<string, unknown>>>(
        '/super-admin/setting/application-settings-update',
        {
          method: 'POST',
          data: {
            cname_information: sanitizeRichText(textValue(values.cname_information)),
          },
        },
      );
      if (response?.status === false) {
        throw new Error(response.message || 'Unable to update custom domain details.');
      }
      toast.success(response?.message || 'Updated successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to update custom domain details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title="Custom Domain Details"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadDetails}>
            Refresh
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={saveDetails}>
            Save
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Card
          title={
            <Space>
              <GlobalOutlined />
              <span>Custom Domain Request Information</span>
            </Space>
          }
          loading={loading}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="cname_information" label="Instructions">
              <RichTextInput rows={12} />
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </PageContainer>
  );
}
