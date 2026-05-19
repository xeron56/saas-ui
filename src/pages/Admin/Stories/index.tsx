import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import {
  DeleteOutlined,
  EditOutlined,
  FileImageOutlined,
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Alert,
  Button,
  Drawer,
  Form,
  Image,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useState } from 'react';

type LegacyStory = {
  id?: number | string;
  title?: string;
  slug?: string;
  thumbnail?: string | number;
  thumbnail_id?: string | number;
  thumbnail_url?: string;
  body?: string;
  status?: string | number;
  status_id?: string | number;
  status_name?: string;
};

type LegacyStoryResponse = {
  status?: boolean;
  message?: string;
  data?: LegacyStory[];
};

type StoryFormValues = {
  title?: string;
  body?: string;
  status?: number;
  thumbnail?: UploadFile[];
};

const listEndpoint = '/admin/stories/pending';

const statusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Published', value: 1 },
  { label: 'Canceled', value: 2 },
];

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function numericValue(value: unknown) {
  const plain = cleanDisplay(value).replace(/[^0-9.-]/g, '');
  const parsed = Number(plain);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractImageSrc(html: unknown) {
  const match = textValue(html).match(/\bsrc=["']([^"']+)["']/i);
  return match?.[1] || '';
}

function thumbnailSource(record?: LegacyStory) {
  const url = textValue(record?.thumbnail_url);
  const raw = textValue(record?.thumbnail);
  if (url) {
    return url;
  }
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('data:')) {
    return raw;
  }
  return extractImageSrc(record?.thumbnail);
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

function isAllowedImage(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
}

function statusID(record?: LegacyStory) {
  return numericValue(record?.status_id ?? record?.status);
}

function statusLabel(record?: LegacyStory) {
  return cleanDisplay(record?.status_name) || cleanDisplay(record?.status) || 'Pending';
}

function statusTag(record?: LegacyStory) {
  const value = statusID(record);
  if (value === 1) {
    return <Tag color="green">{statusLabel(record)}</Tag>;
  }
  if (value === 2) {
    return <Tag color="red">{statusLabel(record)}</Tag>;
  }
  return <Tag color="gold">{statusLabel(record)}</Tag>;
}

function storyFormValues(record?: LegacyStory): StoryFormValues {
  return {
    title: cleanDisplay(record?.title),
    body: sanitizeRichText(textValue(record?.body)),
    status: statusID(record),
    thumbnail: [],
  };
}

function storyFormData(values: StoryFormValues, current?: LegacyStory) {
  const formData = new FormData();
  formData.append('title', textValue(values.title));
  formData.append('body', sanitizeRichText(textValue(values.body)));
  formData.append('status', String(values.status ?? 0));
  const thumbnail = selectedFile(values.thumbnail);
  if (thumbnail) {
    formData.append('thumbnail', thumbnail);
  } else if (current?.thumbnail_id) {
    formData.append('thumbnail_id', textValue(current.thumbnail_id));
  }
  if (current?.slug) {
    formData.append('slug', textValue(current.slug));
  }
  return formData;
}

export default function AdminStories() {
  const [form] = Form.useForm<StoryFormValues>();
  const [rows, setRows] = useState<LegacyStory[]>([]);
  const [current, setCurrent] = useState<LegacyStory | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState('');

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyStoryResponse>(`${listEndpoint}?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load pending stories.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const openEdit = (record: LegacyStory) => {
    setCurrent(record);
    form.setFieldsValue(storyFormValues(record));
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
  };

  const submit = async (values: StoryFormValues) => {
    const slug = textValue(current?.slug);
    if (!slug) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyStoryResponse>(
        `/stories/update/${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          data: storyFormData(values, current),
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Story could not be updated.');
        return;
      }
      toast.success(textValue(response.message) || 'Story updated.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Story could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const deleteStory = async (record: LegacyStory) => {
    const slug = textValue(record.slug);
    if (!slug) {
      return;
    }
    setError('');
    try {
      const response = await request<LegacyStoryResponse>(
        `/stories/delete/${encodeURIComponent(slug)}`,
        {
          method: 'POST',
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Story could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Story deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Story could not be deleted.');
    }
  };

  const columns: ColumnsType<LegacyStory> = [
    {
      title: 'Image',
      width: 92,
      render: (_, record) => {
        const src = thumbnailSource(record);
        return src ? (
          <Image width={40} height={40} src={src} preview={false} />
        ) : (
          <FileImageOutlined />
        );
      },
    },
    {
      title: 'Title',
      render: (_, record) => cleanDisplay(record.title) || '-',
    },
    {
      title: 'Status',
      width: 120,
      render: (_, record) => statusTag(record),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete this story?" onConfirm={() => deleteStory(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Pending Story">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table<LegacyStory>
        rowKey={(record) => textValue(record.id) || textValue(record.slug)}
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 720 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>Pending Stories</strong>
            <Button icon={<ReloadOutlined />} onClick={loadRows}>
              Refresh
            </Button>
          </div>
        )}
      />

      <Drawer
        width={680}
        title="Update Story"
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submit}>
          <Form.Item name="title" label="Title" rules={[{ required: true, min: 3, max: 155 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="body" label="Description" rules={[{ required: true }]}>
            <RichTextInput rows={8} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          {thumbnailSource(current) ? (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', marginBottom: 8 }}>Current Image</span>
              <Image width={96} height={72} src={thumbnailSource(current)} preview={false} />
            </div>
          ) : null}
          <Form.Item
            name="thumbnail"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
          >
            <Upload
              beforeUpload={(file) => {
                if (!isAllowedImage(file)) {
                  toast.error('Only JPG and PNG images are supported.');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              maxCount={1}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            >
              <Button icon={<UploadOutlined />}>Choose image</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            Update
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
