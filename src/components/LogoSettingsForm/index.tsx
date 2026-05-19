import { PictureOutlined, ReloadOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { Alert, Button, Card, Form, Image, Space, Upload, message as toast } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';

type SettingsPageResponse = {
  title?: string;
  options?: Record<string, unknown>;
  imageOptions?: Record<string, string>;
  settings?: { option_key?: string; option_value?: string }[];
};

type LegacyResponse = {
  status?: boolean;
  message?: string;
};

type LogoSettingsValues = Record<string, UploadFile[] | undefined>;

type LogoField = {
  name: string;
  label: string;
  size?: string;
};

type LogoSettingsFormProps = {
  pagePath: string;
  updatePath: string;
  fallbackTitle?: string;
};

const accept = '.jpg,.jpeg,.png,.webp,.gif,.ico,.svg,.mp4,.webm,image/*,video/mp4,video/webm';
const allowedExtensions = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'ico',
  'svg',
  'mp4',
  'webm',
]);

const logoFields: LogoField[] = [
  { name: 'app_preloader', label: 'App Preloader', size: '140 x 40' },
  { name: 'app_black_logo', label: 'Logo Black' },
  { name: 'app_logo', label: 'Logo White', size: '140 x 40' },
  { name: 'app_fav_icon', label: 'App Fav Icon', size: '16 x 16' },
  { name: 'login_left_image', label: 'Login Left Image' },
];

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function numericText(value: unknown) {
  const raw = textValue(value);
  return /^\d+$/.test(raw) ? raw : '';
}

function optionsFromResponse(response: SettingsPageResponse) {
  if (response.options && typeof response.options === 'object') {
    return response.options;
  }
  const options: Record<string, unknown> = {};
  (response.settings || []).forEach((row) => {
    const key = textValue(row.option_key);
    if (key) {
      options[key] = row.option_value;
    }
  });
  return options;
}

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function selectedFile(files?: UploadFile[]) {
  return files?.[0]?.originFileObj as File | undefined;
}

function allowedLogoFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.has(extension);
}

function isVideoURL(url: string) {
  return /\.(mp4|webm)(\?|#|$)/i.test(url);
}

function buildLogoFormData(values: LogoSettingsValues, options: Record<string, unknown>) {
  const formData = new FormData();
  logoFields.forEach((field) => {
    const file = selectedFile(values[field.name]);
    if (file) {
      formData.append(field.name, file);
      return;
    }
    const existingID = numericText(options[field.name]);
    if (existingID) {
      formData.append(field.name, existingID);
    }
  });
  return formData;
}

export default function LogoSettingsForm({
  pagePath,
  updatePath,
  fallbackTitle = 'Logo Settings',
}: LogoSettingsFormProps) {
  const [form] = Form.useForm<LogoSettingsValues>();
  const [options, setOptions] = useState<Record<string, unknown>>({});
  const [imageOptions, setImageOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pageTitle, setPageTitle] = useState(fallbackTitle);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await request<SettingsPageResponse>(pagePath);
      setOptions(optionsFromResponse(response || {}));
      setImageOptions(response?.imageOptions || {});
      setPageTitle(textValue(response?.title) || fallbackTitle);
      form.resetFields();
    } catch (err: any) {
      setOptions({});
      setImageOptions({});
      form.resetFields();
      setError(err?.message || 'Logo settings could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [pagePath]);

  const submitSettings = async (values: LogoSettingsValues) => {
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyResponse>(updatePath, {
        method: 'POST',
        data: buildLogoFormData(values, options),
      });
      if (response?.status === false) {
        setError(textValue(response.message) || 'Logo settings could not be saved.');
        return;
      }
      toast.success(textValue(response?.message) || 'Logo settings saved.');
      await loadSettings();
    } catch (err: any) {
      setError(err?.message || 'Logo settings could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title={pageTitle}
      extra={
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadSettings}>
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Card
          title={
            <Space>
              <PictureOutlined />
              <span>Logo Settings</span>
            </Space>
          }
        >
          <Form form={form} layout="vertical" disabled={loading} onFinish={submitSettings}>
            <div
              style={{
                display: 'grid',
                gap: 16,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              {logoFields.map((field) => {
                const currentURL = textValue(imageOptions[field.name]);
                const hasCurrent = currentURL && !currentURL.includes('/assets/images/no-image');
                return (
                  <div key={field.name}>
                    <div
                      style={{
                        alignItems: 'center',
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        display: 'flex',
                        height: 112,
                        justifyContent: 'center',
                        marginBottom: 12,
                        overflow: 'hidden',
                      }}
                    >
                      {hasCurrent ? (
                        isVideoURL(currentURL) ? (
                          <video
                            src={currentURL}
                            controls
                            style={{ height: '100%', maxWidth: '100%' }}
                          />
                        ) : (
                          <Image
                            src={currentURL}
                            preview={false}
                            style={{ maxHeight: 96, maxWidth: '100%', objectFit: 'contain' }}
                          />
                        )
                      ) : (
                        <PictureOutlined style={{ color: '#8c8c8c', fontSize: 28 }} />
                      )}
                    </div>
                    <Form.Item
                      name={field.name}
                      label={field.size ? `${field.label} (${field.size})` : field.label}
                      valuePropName="fileList"
                      getValueFromEvent={normalizeUploadEvent}
                    >
                      <Upload
                        beforeUpload={(file) => {
                          if (!allowedLogoFile(file)) {
                            toast.error('File type is not supported.');
                            return Upload.LIST_IGNORE;
                          }
                          return false;
                        }}
                        maxCount={1}
                        accept={accept}
                      >
                        <Button icon={<UploadOutlined />}>Choose file</Button>
                      </Upload>
                    </Form.Item>
                  </div>
                );
              })}
            </div>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                Save
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadSettings}>
                Reset
              </Button>
            </Space>
          </Form>
        </Card>
      </Space>
    </PageContainer>
  );
}
