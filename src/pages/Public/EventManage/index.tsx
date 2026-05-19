import { useLocation, useParams, history } from '@umijs/max';
import {
  Alert,
  Button,
  Form,
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
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import { useEffect, useMemo, useState } from 'react';
import { normalizePayload, recordsFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent, postPublicContent } from '../services';
import type { LegacyRecord } from '../types';

function eventEndpoint(pathname: string) {
  const path = pathname.replace(/\/$/, '');
  if (path === '/event/my-event') {
    return '/event/my-event';
  }
  if (path === '/admin/event/pending') {
    return '/admin/event/pending';
  }
  if (path === '/event/pending') {
    return '/event/pending';
  }
  return '/event/all-event';
}

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function eventStatusLabel(record: LegacyRecord, pendingMode: boolean) {
  if (pendingMode) {
    return 'Pending';
  }
  const raw = cleanDisplay(record.status).toLowerCase();
  if (raw.includes('approved') || textValue(record.status) === '1') {
    return 'Approved';
  }
  if (raw.includes('pending') || textValue(record.status) === '0') {
    return 'Pending';
  }
  return cleanDisplay(record.status) || '-';
}

function eventFormValues(event: LegacyRecord = {}) {
  return {
    title: textValue(event.title),
    event_category_id: Number(event.event_category_id || 0) || undefined,
    date: textValue(event.date),
    type: Number(event.type || 1),
    location: textValue(event.location),
    price: Number(event.price || 0),
    number_of_ticket: Number(event.number_of_ticket || event.number_of_ticket_left || 1),
    description: sanitizeRichText(textValue(event.description)),
    status: Number(event.status || 0),
  };
}

function mutationPayload(values: LegacyRecord, includeStatus: boolean) {
  const type = Number(values.type || 1);
  const payload: LegacyRecord = {
    title: textValue(values.title),
    event_category_id: Number(values.event_category_id || 0),
    date: textValue(values.date),
    type,
    location: textValue(values.location),
    price: type === 2 ? Number(values.price || 0) : 0,
    number_of_ticket: Number(values.number_of_ticket || 0),
    description: sanitizeRichText(textValue(values.description)),
  };
  if (includeStatus) {
    payload.status = Number(values.status || 0);
  }
  return payload;
}

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function eventMutationBody(values: LegacyRecord, includeStatus: boolean) {
  const payload = mutationPayload(values, includeStatus);
  const thumbnail = values.thumbnail?.[0]?.originFileObj as File | undefined;
  const ticketImage = values.ticket_image?.[0]?.originFileObj as File | undefined;
  if (!thumbnail && !ticketImage) {
    return payload;
  }
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  if (thumbnail) {
    formData.append('thumbnail', thumbnail);
  }
  if (ticketImage) {
    formData.append('ticket_image', ticketImage);
  }
  return formData;
}

export default function EventManage() {
  const location = useLocation();
  const params = useParams();
  const [form] = Form.useForm();
  const path = location.pathname.replace(/\/$/, '');
  const createMode = path === '/event/create';
  const editMode = path.startsWith('/event/edit/');
  const pendingMode = path === '/event/pending' || path === '/admin/event/pending';
  const myEvents = path === '/event/my-event';
  const slug = textValue(params.slug);
  const endpoint = useMemo(() => eventEndpoint(location.pathname), [location.pathname]);
  const [rows, setRows] = useState<LegacyRecord[]>([]);
  const [categories, setCategories] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState('');
  const [error, setError] = useState('');
  const [currentEvent, setCurrentEvent] = useState<LegacyRecord>({});

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = normalizePayload(await fetchPublicContent(`${endpoint}?ajax=1`));
      setRows(recordsFromPayload(body, 'data'));
    } catch (err: any) {
      setError(err?.message || 'Unable to load events.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEventForm = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchPublicContent(`/event/edit/${encodeURIComponent(slug)}?ajax=1`);
      const body = normalizePayload(response);
      const item = body.event || body.item;
      setCurrentEvent(item && typeof item === 'object' ? item : {});
      setCategories(recordsFromPayload(body, 'categories'));
      form.setFieldsValue(eventFormValues(item && typeof item === 'object' ? item : {}));
    } catch (err: any) {
      setError(err?.message || 'Unable to load event form.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (createMode) {
      setCurrentEvent({});
      setLoading(true);
      setError('');
      fetchPublicContent('/event/create')
        .then((response) => {
          const body = normalizePayload(response);
          setCategories(recordsFromPayload(body, 'categories'));
        })
        .catch((err) => setError(err?.message || 'Unable to load event form.'))
        .finally(() => setLoading(false));
      return;
    }
    if (editMode) {
      loadEventForm();
      return;
    }
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createMode, editMode, endpoint, slug]);

  const submit = async (values: LegacyRecord) => {
    setSubmitting(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent(
          editMode ? `/event/update/${encodeURIComponent(slug)}` : '/event/store',
          eventMutationBody(values, editMode),
        ),
      );
      if (response.status === false) {
        setError(
          textValue(response.message) || `Event could not be ${editMode ? 'updated' : 'created'}.`,
        );
        return;
      }
      toast.success(textValue(response.message) || `Event ${editMode ? 'updated' : 'created'}.`);
      form.resetFields();
      history.push('/event/my-event');
    } catch (err: any) {
      setError(err?.message || `Event could not be ${editMode ? 'updated' : 'created'}.`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!id) {
      return;
    }
    try {
      const response = normalizePayload(
        await postPublicContent(`/event/delete/${encodeURIComponent(id)}`, {}),
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

  const approveEvent = async (record: LegacyRecord) => {
    const recordSlug = textValue(record.slug);
    const id = textValue(record.id) || recordSlug;
    if (!recordSlug) {
      return;
    }
    setApproving(id);
    setError('');
    try {
      const editResponse = normalizePayload(
        await fetchPublicContent(`/event/edit/${encodeURIComponent(recordSlug)}?ajax=1`),
      );
      const item = editResponse.event || editResponse.item;
      if (!item || typeof item !== 'object') {
        setError('Event could not be loaded for approval.');
        return;
      }
      const response = normalizePayload(
        await postPublicContent(
          `/event/update/${encodeURIComponent(recordSlug)}`,
          mutationPayload({ ...eventFormValues(item), status: 1 }, true),
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Event could not be approved.');
        return;
      }
      toast.success(textValue(response.message) || 'Event approved.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Event could not be approved.');
    } finally {
      setApproving('');
    }
  };

  const formMode = createMode || editMode;
  const title = createMode
    ? 'Create Event'
    : editMode
    ? 'Edit Event'
    : pendingMode
    ? 'Pending Events'
    : myEvents
    ? 'My Events'
    : 'All Events';

  return (
    <PublicShell
      title={title}
      description={formMode ? 'Manage event details and review status' : 'Tenant event management'}
    >
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      {formMode ? (
        <Form
          className="public-form"
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={submit}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true, min: 3 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="event_category_id" label="Category" rules={[{ required: true }]}>
            <Select
              loading={loading}
              options={categories.map((category) => ({
                label: textValue(category.name),
                value: Number(category.id),
              }))}
            />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <Input placeholder="2026-05-18 18:00:00" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Free', value: 1 },
                { label: 'Paid', value: 2 },
              ]}
            />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="number_of_ticket" label="Tickets" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, min: 11 }]}>
            <RichTextInput rows={5} />
          </Form.Item>
          {editMode && textValue(currentEvent.thumbnail_url) ? (
            <div className="public-upload-preview">
              <span>Current Image</span>
              <img
                src={textValue(currentEvent.thumbnail_url)}
                alt={textValue(currentEvent.title)}
              />
            </div>
          ) : null}
          <Form.Item
            name="thumbnail"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
            rules={createMode ? [{ required: true, message: 'Upload image is required.' }] : []}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            >
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>
          {editMode && textValue(currentEvent.ticket_image_url) ? (
            <div className="public-upload-preview">
              <span>Current Ticket Image</span>
              <img
                src={textValue(currentEvent.ticket_image_url)}
                alt={textValue(currentEvent.title)}
              />
            </div>
          ) : null}
          <Form.Item
            name="ticket_image"
            label="Ticket Image"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
            rules={createMode ? [{ required: true, message: 'Ticket image is required.' }] : []}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            >
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>
          {editMode ? (
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Pending', value: 0 },
                  { label: 'Approved', value: 1 },
                ]}
              />
            </Form.Item>
          ) : null}
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
            {editMode ? 'Update' : 'Create'}
          </Button>
        </Form>
      ) : (
        <>
          <div className="public-section-heading">
            <h2>
              {pendingMode ? 'Review Queue' : myEvents ? 'Submitted Events' : 'Published Events'}
            </h2>
            <Space wrap>
              <Button icon={<EyeOutlined />} href="/event/all-event">
                All
              </Button>
              <Button icon={<EditOutlined />} href="/event/my-event">
                Mine
              </Button>
              <Button icon={<CheckOutlined />} href="/admin/event/pending">
                Pending
              </Button>
              <Button type="primary" icon={<PlusOutlined />} href="/event/create">
                Create
              </Button>
            </Space>
          </div>
          <Table
            rowKey={(record) => textValue(record.id) || textValue(record.slug)}
            loading={loading}
            dataSource={rows}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: 'Title', dataIndex: 'title' },
              {
                title: 'Category',
                render: (_, record) => cleanDisplay(record.category_name || record.category) || '-',
              },
              {
                title: 'Type',
                render: (_, record) => <Tag>{cleanDisplay(record.type) || 'Free'}</Tag>,
              },
              { title: 'Date', render: (_, record) => cleanDisplay(record.date) || '-' },
              { title: 'Location', dataIndex: 'location' },
              { title: 'Tickets Left', dataIndex: 'number_of_ticket_left' },
              ...(myEvents || pendingMode
                ? [
                    {
                      title: 'Status',
                      render: (_: unknown, record: LegacyRecord) => (
                        <Tag
                          color={
                            eventStatusLabel(record, pendingMode) === 'Approved' ? 'green' : 'gold'
                          }
                        >
                          {eventStatusLabel(record, pendingMode)}
                        </Tag>
                      ),
                    },
                  ]
                : []),
              {
                title: 'Action',
                key: 'action',
                render: (_, record) => {
                  const slug = encodeURIComponent(textValue(record.slug));
                  const id = textValue(record.id);
                  return (
                    <Space wrap>
                      <Button size="small" icon={<EyeOutlined />} href={`/event/details/${slug}`}>
                        View
                      </Button>
                      {myEvents || pendingMode ? (
                        <Button size="small" icon={<EditOutlined />} href={`/event/edit/${slug}`}>
                          Edit
                        </Button>
                      ) : null}
                      {pendingMode ? (
                        <Button
                          size="small"
                          type="primary"
                          icon={<CheckOutlined />}
                          loading={approving === (id || textValue(record.slug))}
                          onClick={() => approveEvent(record)}
                        >
                          Approve
                        </Button>
                      ) : null}
                      {myEvents || pendingMode ? (
                        <Popconfirm title="Delete this event?" onConfirm={() => deleteEvent(id)}>
                          <Button size="small" danger icon={<DeleteOutlined />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      ) : null}
                    </Space>
                  );
                },
              },
            ]}
          />
        </>
      )}
    </PublicShell>
  );
}
