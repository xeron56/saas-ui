import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
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
  InputNumber,
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

type LegacyEvent = {
  id?: number | string;
  title?: string;
  slug?: string;
  event_category_id?: number | string;
  category?: string;
  category_name?: string;
  type?: number | string;
  date?: string;
  location?: string;
  price?: number | string;
  number_of_ticket?: number | string;
  number_of_ticket_left?: number | string;
  description?: string;
  thumbnail?: number | string;
  thumbnail_id?: number | string;
  thumbnail_url?: string;
  ticket_image?: number | string;
  ticket_image_id?: number | string;
  ticket_image_url?: string;
  status?: number | string;
};

type LegacyEventResponse = {
  status?: boolean;
  message?: string;
  data?: LegacyEvent[];
  event?: LegacyEvent;
  item?: LegacyEvent;
  categories?: LegacyEventCategory[];
};

type LegacyEventCategory = {
  id?: number | string;
  name?: string;
};

type EventFormValues = {
  title?: string;
  event_category_id?: number;
  date?: string;
  type?: number;
  location?: string;
  price?: number;
  number_of_ticket?: number;
  description?: string;
  status?: number;
  thumbnail?: UploadFile[];
  ticket_image?: UploadFile[];
};

const listEndpoint = '/admin/event/pending';

const eventTypeOptions = [
  { label: 'Free', value: 1 },
  { label: 'Paid', value: 2 },
];

const statusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Publish', value: 1 },
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

function imageSource(
  record: LegacyEvent | undefined,
  urlKey: 'thumbnail_url' | 'ticket_image_url',
) {
  const rawKey = urlKey === 'thumbnail_url' ? 'thumbnail' : 'ticket_image';
  const url = textValue(record?.[urlKey]);
  const raw = textValue(record?.[rawKey]);
  if (url) {
    return url;
  }
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('data:')) {
    return raw;
  }
  return extractImageSrc(raw);
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

function typeLabel(record?: LegacyEvent) {
  const value = numericValue(record?.type);
  if (value === 2) {
    return 'Paid';
  }
  return cleanDisplay(record?.type) || 'Free';
}

function eventFormValues(record?: LegacyEvent): EventFormValues {
  const eventType = numericValue(record?.type) || 1;
  return {
    title: cleanDisplay(record?.title),
    event_category_id: numericValue(record?.event_category_id) || undefined,
    date: textValue(record?.date),
    type: eventType,
    location: cleanDisplay(record?.location),
    price: numericValue(record?.price),
    number_of_ticket:
      numericValue(record?.number_of_ticket) || numericValue(record?.number_of_ticket_left) || 1,
    description: sanitizeRichText(textValue(record?.description)),
    status: numericValue(record?.status),
    thumbnail: [],
    ticket_image: [],
  };
}

function eventFormData(values: EventFormValues, current?: LegacyEvent) {
  const type = values.type ?? 1;
  const formData = new FormData();
  formData.append('title', textValue(values.title));
  formData.append('event_category_id', String(values.event_category_id ?? ''));
  formData.append('date', textValue(values.date));
  formData.append('type', String(type));
  formData.append('location', textValue(values.location));
  formData.append('price', String(type === 2 ? values.price ?? 0 : 0));
  formData.append('number_of_ticket', String(values.number_of_ticket ?? 0));
  formData.append('description', sanitizeRichText(textValue(values.description)));
  formData.append('status', String(values.status ?? 0));

  const thumbnail = selectedFile(values.thumbnail);
  if (thumbnail) {
    formData.append('thumbnail', thumbnail);
  } else if (current?.thumbnail_id || current?.thumbnail) {
    formData.append('thumbnail_id', textValue(current.thumbnail_id || current.thumbnail));
  }

  const ticketImage = selectedFile(values.ticket_image);
  if (ticketImage) {
    formData.append('ticket_image', ticketImage);
  } else if (current?.ticket_image_id || current?.ticket_image) {
    formData.append('ticket_image_id', textValue(current.ticket_image_id || current.ticket_image));
  }

  return formData;
}

function statusTag(record?: LegacyEvent) {
  const value = numericValue(record?.status);
  return value === 1 ? <Tag color="green">Publish</Tag> : <Tag color="gold">Pending</Tag>;
}

export default function AdminEvents() {
  const [form] = Form.useForm<EventFormValues>();
  const [rows, setRows] = useState<LegacyEvent[]>([]);
  const [categories, setCategories] = useState<LegacyEventCategory[]>([]);
  const [current, setCurrent] = useState<LegacyEvent | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState('');

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyEventResponse>(`${listEndpoint}?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load pending events.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const openEdit = async (record: LegacyEvent) => {
    const slug = textValue(record.slug);
    if (!slug) {
      return;
    }
    setError('');
    try {
      const body = await request<LegacyEventResponse>(`/event/edit/${encodeURIComponent(slug)}`, {
        params: { ajax: 1 },
      });
      const item = body.event || body.item || record;
      setCurrent(item);
      setCategories(Array.isArray(body.categories) ? body.categories : []);
      form.setFieldsValue(eventFormValues(item));
      setDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to load event.');
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    setCategories([]);
    form.resetFields();
  };

  const submit = async (values: EventFormValues) => {
    const slug = textValue(current?.slug);
    if (!slug) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyEventResponse>(
        `/event/update/${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          data: eventFormData(values, current),
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Event could not be updated.');
        return;
      }
      toast.success(textValue(response.message) || 'Event updated.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Event could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const approveEvent = async (record: LegacyEvent) => {
    const slug = textValue(record.slug);
    if (!slug) {
      return;
    }
    setError('');
    try {
      const body = await request<LegacyEventResponse>(`/event/edit/${encodeURIComponent(slug)}`, {
        params: { ajax: 1 },
      });
      const item = body.event || body.item || record;
      const response = await request<LegacyEventResponse>(
        `/event/update/${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          data: eventFormData({ ...eventFormValues(item), status: 1 }, item),
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Event could not be approved.');
        return;
      }
      toast.success(textValue(response.message) || 'Event approved.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Event could not be approved.');
    }
  };

  const deleteEvent = async (record: LegacyEvent) => {
    const id = textValue(record.id);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await request<LegacyEventResponse>(
        `/event/delete/${encodeURIComponent(id)}`,
        {
          method: 'POST',
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Event could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Event deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Event could not be deleted.');
    }
  };

  const columns: ColumnsType<LegacyEvent> = [
    {
      title: 'Image',
      width: 92,
      render: (_, record) => {
        const src = imageSource(record, 'thumbnail_url');
        return src ? (
          <Image width={40} height={40} src={src} preview={false} />
        ) : (
          <FileImageOutlined />
        );
      },
    },
    {
      title: 'Event Title',
      render: (_, record) => cleanDisplay(record.title) || '-',
    },
    {
      title: 'Category',
      width: 160,
      render: (_, record) => cleanDisplay(record.category_name || record.category) || '-',
    },
    {
      title: 'Type',
      width: 100,
      render: (_, record) => <Tag>{typeLabel(record)}</Tag>,
    },
    {
      title: 'Date & Time',
      width: 180,
      render: (_, record) => cleanDisplay(record.date) || '-',
    },
    {
      title: 'Location',
      render: (_, record) => cleanDisplay(record.location) || '-',
    },
    {
      title: 'Status',
      width: 120,
      render: (_, record) => statusTag(record),
    },
    {
      title: 'Action',
      key: 'action',
      width: 270,
      render: (_, record) => {
        const slug = textValue(record.slug);
        return (
          <Space wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              href={`/event/details/${encodeURIComponent(slug)}`}
              disabled={!slug}
            >
              View
            </Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
              Edit
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => approveEvent(record)}
            >
              Approve
            </Button>
            <Popconfirm title="Delete this event?" onConfirm={() => deleteEvent(record)}>
              <Button size="small" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer title="Pending Event">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table<LegacyEvent>
        rowKey={(record) => textValue(record.id) || textValue(record.slug)}
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>Pending Events</strong>
            <Button icon={<ReloadOutlined />} onClick={loadRows}>
              Refresh
            </Button>
          </div>
        )}
      />

      <Drawer
        width={720}
        title="Update Event"
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submit}>
          <Form.Item name="title" label="Event Title" rules={[{ required: true, min: 3 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="event_category_id" label="Event Category" rules={[{ required: true }]}>
            <Select
              options={categories.map((category) => ({
                label: textValue(category.name),
                value: numericValue(category.id),
              }))}
            />
          </Form.Item>
          <Form.Item name="type" label="Event Type" rules={[{ required: true }]}>
            <Select options={eventTypeOptions} />
          </Form.Item>
          <Form.Item name="number_of_ticket" label="Number of Ticket" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, next) => prev.type !== next.type}>
            {({ getFieldValue }) =>
              getFieldValue('type') === 2 ? (
                <Form.Item name="price" label="Ticket Price" rules={[{ required: true }]}>
                  <InputNumber min={1} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <RichTextInput rows={8} />
          </Form.Item>
          {imageSource(current, 'thumbnail_url') ? (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', marginBottom: 8 }}>Current Image</span>
              <Image
                width={96}
                height={72}
                src={imageSource(current, 'thumbnail_url')}
                preview={false}
              />
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
          {imageSource(current, 'ticket_image_url') ? (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', marginBottom: 8 }}>Current Ticket Image</span>
              <Image
                width={96}
                height={72}
                src={imageSource(current, 'ticket_image_url')}
                preview={false}
              />
            </div>
          ) : null}
          <Form.Item
            name="ticket_image"
            label="Ticket Image"
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
              <Button icon={<UploadOutlined />}>Choose ticket image</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            Update Now
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
