import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MailOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';

type TabKey = 'subscribers' | 'templates' | 'send';

type SubscriberRow = {
  id?: number | string;
  DT_RowIndex?: number;
  email?: string;
  status?: number | string;
  status_id?: number | string;
  status_name?: string;
  date?: string;
  created_at?: string;
};

type TemplateRow = {
  id?: number | string;
  DT_RowIndex?: number;
  category?: string;
  slug?: string;
  subject?: string;
  body?: string;
  status?: number | string;
  status_id?: number | string;
  status_name?: string;
  created_at?: string;
};

type SearchRow = {
  id?: number | string;
  name?: string;
  email?: string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type LegacyResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

type SendListResponse = {
  mailTemplateType?: TemplateRow[];
};

type SubscriberFormValues = {
  email?: string;
  status?: number;
};

type TemplateFormValues = {
  category?: string;
  subject?: string;
  body?: string;
  status?: number;
};

type SendFormValues = {
  email_template?: number | string;
  type?: string;
  individual_subscription?: string[];
  individual_alumni?: string[];
};

const subscriberEndpoint = '/admin/news-subscription-letter-email';
const templateEndpoint = '/admin/subscription-email-template';

const tabRoutes: Record<TabKey, string> = {
  subscribers: subscriberEndpoint,
  templates: templateEndpoint,
  send: `${templateEndpoint}/send-mail-list`,
};

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

function rowID(record?: SubscriberRow | TemplateRow) {
  return textValue(record?.id);
}

function statusValue(record?: SubscriberRow | TemplateRow) {
  const raw = numericValue(record?.status_id ?? record?.status);
  return raw === 1 ? 1 : 0;
}

function statusLabel(record?: SubscriberRow | TemplateRow) {
  return statusValue(record) === 1 ? 'Active' : cleanDisplay(record?.status_name) || 'Deactivated';
}

function directRouteFromPath(pathname: string) {
  const subscriberMatch = pathname.match(
    /\/admin\/news-subscription-letter-email\/edit\/([^/?#]+)/,
  );
  const templateMatch = pathname.match(
    /\/admin\/subscription-email-template\/(edit|view)\/([^/?#]+)/,
  );
  const rawID = subscriberMatch?.[1] || templateMatch?.[2] || '';
  if (!rawID) {
    return undefined;
  }
  let id = rawID;
  try {
    id = decodeURIComponent(rawID);
  } catch {
    id = rawID;
  }
  if (subscriberMatch) {
    return { id, mode: 'subscriber' as const };
  }
  return { id, mode: templateMatch?.[1] === 'view' ? ('view' as const) : ('template' as const) };
}

function activeTabFromPath(pathname: string): TabKey {
  if (pathname.includes('/admin/subscription-email-template/send-mail-list')) {
    return 'send';
  }
  if (pathname.includes('/admin/subscription-email-template')) {
    return 'templates';
  }
  return 'subscribers';
}

function legacyHTMLFieldValue(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const field = doc.querySelector(`[name="${name}"]`) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    return textValue(field?.value);
  }
  const field =
    html.match(
      new RegExp(
        `<(?:input|select|textarea)[^>]*name=["']${name}["'][\\s\\S]*?(?:>|<\\/(?:select|textarea)>)`,
        'i',
      ),
    )?.[0] || '';
  const value = field.match(/\bvalue=["']([^"']*)["']/i)?.[1] || '';
  if (value) {
    return value;
  }
  return field.match(/<textarea[^>]*>[\s\S]*?<\/textarea>/i)?.[0].replace(/<[^>]*>/g, '') || '';
}

function legacyHTMLSelectedValue(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const field = doc.querySelector(`[name="${name}"]`) as HTMLSelectElement | null;
    return textValue(field?.value);
  }
  const select =
    html.match(new RegExp(`<select[^>]*name=["']${name}["'][\\s\\S]*?<\\/select>`, 'i'))?.[0] || '';
  return select.match(/<option[^>]*value=["']?([^"'\s>]+)["']?[^>]*selected[^>]*>/i)?.[1] || '';
}

function subscriberFromEditHTML(html: string, fallbackID: string): SubscriberRow | undefined {
  const email = legacyHTMLFieldValue(html, 'email');
  if (!email) {
    return undefined;
  }
  return {
    id: legacyHTMLFieldValue(html, 'id') || fallbackID,
    email,
    status: legacyHTMLSelectedValue(html, 'status') || 1,
  };
}

function templateFromEditHTML(html: string, fallbackID: string): TemplateRow | undefined {
  const category = legacyHTMLFieldValue(html, 'category');
  const subject = legacyHTMLFieldValue(html, 'subject');
  const body = legacyHTMLFieldValue(html, 'body');
  if (!category && !subject) {
    return undefined;
  }
  return {
    id: legacyHTMLFieldValue(html, 'id') || fallbackID,
    category,
    subject,
    body,
    status: legacyHTMLSelectedValue(html, 'status') || 1,
  };
}

function templateFromViewHTML(html: string, fallbackID: string): TemplateRow | undefined {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const category = textValue(doc.querySelector('.modal-body h6')?.textContent);
    const subject = textValue(doc.querySelector('.modal-body p')?.textContent);
    const body = textValue(doc.querySelector('.modal-body div')?.innerHTML);
    if (!category && !subject && !body) {
      return undefined;
    }
    return { id: fallbackID, category, subject, body, status: 1 };
  }
  const category = html.match(/<h6[^>]*>([\s\S]*?)<\/h6>/i)?.[1]?.replace(/<[^>]*>/g, '') || '';
  const subject = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]?.replace(/<[^>]*>/g, '') || '';
  const body = html.match(/<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)?.[1] || '';
  return category || subject || body
    ? { id: fallbackID, category, subject, body, status: 1 }
    : undefined;
}

function buildSubscriberPayload(values: SubscriberFormValues, current?: SubscriberRow) {
  const payload: Record<string, unknown> = {
    email: textValue(values.email),
  };
  if (current) {
    payload.status = values.status ?? 1;
  }
  return payload;
}

function buildTemplatePayload(values: TemplateFormValues) {
  return {
    category: textValue(values.category),
    subject: textValue(values.subject),
    body: sanitizeRichText(textValue(values.body)),
    status: values.status ?? 1,
  };
}

function searchOptions(rows: SearchRow[]) {
  return rows
    .map((row) => {
      const email = cleanDisplay(row.email);
      if (!email) {
        return undefined;
      }
      const label = cleanDisplay(row.name) ? `${cleanDisplay(row.name)} <${email}>` : email;
      return { label, value: email };
    })
    .filter(Boolean) as Array<{ label: string; value: string }>;
}

function validateEmailValues(_: unknown, value?: string[]) {
  if (!value?.length) {
    return Promise.resolve();
  }
  const invalid = value.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue(email)));
  if (invalid) {
    return Promise.reject(new Error(`Invalid email: ${invalid}`));
  }
  return Promise.resolve();
}

export default function AdminNewsletter() {
  const location = useLocation();
  const activeKey = activeTabFromPath(location.pathname);
  const directRoute = directRouteFromPath(location.pathname);
  const openedDirectRouteRef = useRef('');
  const [subscriberForm] = Form.useForm<SubscriberFormValues>();
  const [templateForm] = Form.useForm<TemplateFormValues>();
  const [sendForm] = Form.useForm<SendFormValues>();
  const [previewForm] = Form.useForm<{ email?: string }>();
  const sendType = Form.useWatch('type', sendForm) || sendForm.getFieldValue('type');

  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [sendTemplates, setSendTemplates] = useState<TemplateRow[]>([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [alumniOptions, setAlumniOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'subscriber' | 'template' | 'view'>('subscriber');
  const [currentSubscriber, setCurrentSubscriber] = useState<SubscriberRow | undefined>();
  const [currentTemplate, setCurrentTemplate] = useState<TemplateRow | undefined>();
  const [sendResult, setSendResult] = useState('');
  const [error, setError] = useState('');

  const loadSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<SubscriberRow>>(
        `${subscriberEndpoint}?ajax=1`,
      );
      setSubscribers(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setSubscribers([]);
      setError(err?.message || 'Unable to load subscriber emails.');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<TemplateRow>>(`${templateEndpoint}?ajax=1`);
      setTemplates(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setTemplates([]);
      setError(err?.message || 'Unable to load email templates.');
    } finally {
      setLoading(false);
    }
  };

  const loadSendTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<SendListResponse>(`${templateEndpoint}/send-mail-list`);
      setSendTemplates(Array.isArray(body.mailTemplateType) ? body.mailTemplateType : []);
    } catch (err: any) {
      setSendTemplates([]);
      setError(err?.message || 'Unable to load active email templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeKey === 'subscribers') {
      loadSubscribers();
    } else if (activeKey === 'templates') {
      loadTemplates();
    } else {
      loadSendTemplates();
    }
  }, [activeKey]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrentSubscriber(undefined);
    setCurrentTemplate(undefined);
    subscriberForm.resetFields();
    templateForm.resetFields();
    previewForm.resetFields();
    if (directRoute) {
      history.replace(directRoute.mode === 'subscriber' ? subscriberEndpoint : templateEndpoint);
    }
  };

  const openSubscriberCreate = () => {
    setDrawerMode('subscriber');
    setCurrentSubscriber(undefined);
    subscriberForm.resetFields();
    subscriberForm.setFieldsValue({ status: 1 });
    setDrawerOpen(true);
  };

  const openSubscriberEdit = (record: SubscriberRow) => {
    setDrawerMode('subscriber');
    setCurrentSubscriber(record);
    subscriberForm.setFieldsValue({
      email: cleanDisplay(record.email),
      status: statusValue(record),
    });
    setDrawerOpen(true);
  };

  const openSubscriberEditRoute = (record: SubscriberRow) => {
    const id = rowID(record);
    if (!id) {
      openSubscriberEdit(record);
      return;
    }
    openedDirectRouteRef.current = `subscriber:${id}`;
    history.push(`${subscriberEndpoint}/edit/${encodeURIComponent(id)}`);
    openSubscriberEdit(record);
  };

  const openTemplateCreate = () => {
    setDrawerMode('template');
    setCurrentTemplate(undefined);
    templateForm.resetFields();
    templateForm.setFieldsValue({ status: 1 });
    setDrawerOpen(true);
  };

  const openTemplateEdit = (record: TemplateRow) => {
    setDrawerMode('template');
    setCurrentTemplate(record);
    templateForm.setFieldsValue({
      category: cleanDisplay(record.category),
      subject: cleanDisplay(record.subject),
      body: sanitizeRichText(textValue(record.body)),
      status: statusValue(record),
    });
    setDrawerOpen(true);
  };

  const openTemplateView = (record: TemplateRow) => {
    setDrawerMode('view');
    setCurrentTemplate(record);
    previewForm.resetFields();
    setDrawerOpen(true);
  };

  const openTemplateEditRoute = (record: TemplateRow) => {
    const id = rowID(record);
    if (!id) {
      openTemplateEdit(record);
      return;
    }
    openedDirectRouteRef.current = `template:${id}`;
    history.push(`${templateEndpoint}/edit/${encodeURIComponent(id)}`);
    openTemplateEdit(record);
  };

  const openTemplateViewRoute = (record: TemplateRow) => {
    const id = rowID(record);
    if (!id) {
      openTemplateView(record);
      return;
    }
    openedDirectRouteRef.current = `view:${id}`;
    history.push(`${templateEndpoint}/view/${encodeURIComponent(id)}`);
    openTemplateView(record);
  };

  const openDirectRoute = async (route: NonNullable<ReturnType<typeof directRouteFromPath>>) => {
    const key = `${route.mode}:${route.id}`;
    if (route.mode === 'subscriber') {
      const record = subscribers.find((item) => rowID(item) === route.id);
      if (record) {
        openSubscriberEdit(record);
        return;
      }
      setError('');
      try {
        const html = await request<string>(
          `${subscriberEndpoint}/edit/${encodeURIComponent(route.id)}`,
          {
            responseType: 'text',
          },
        );
        const item = subscriberFromEditHTML(textValue(html), route.id);
        if (!item) {
          setError('Subscriber email could not be loaded.');
          return;
        }
        openSubscriberEdit(item);
      } catch (err: any) {
        setError(err?.message || 'Subscriber email could not be loaded.');
      }
      return;
    }

    const record = templates.find((item) => rowID(item) === route.id);
    if (record) {
      if (route.mode === 'view') {
        openTemplateView(record);
      } else {
        openTemplateEdit(record);
      }
      return;
    }
    setError('');
    try {
      const html = await request<string>(
        `${templateEndpoint}/${route.mode === 'view' ? 'view' : 'edit'}/${encodeURIComponent(
          route.id,
        )}`,
        { responseType: 'text' },
      );
      const item =
        route.mode === 'view'
          ? templateFromViewHTML(textValue(html), route.id)
          : templateFromEditHTML(textValue(html), route.id);
      if (!item) {
        setError('Email template could not be loaded.');
        return;
      }
      if (route.mode === 'view') {
        openTemplateView(item);
      } else {
        openTemplateEdit(item);
      }
    } catch (err: any) {
      setError(err?.message || 'Email template could not be loaded.');
    } finally {
      openedDirectRouteRef.current = key;
    }
  };

  useEffect(() => {
    if (!directRoute) {
      openedDirectRouteRef.current = '';
      return;
    }
    if (loading) {
      return;
    }
    const key = `${directRoute.mode}:${directRoute.id}`;
    if (openedDirectRouteRef.current === key) {
      return;
    }
    openedDirectRouteRef.current = key;
    openDirectRoute(directRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directRoute?.id, directRoute?.mode, loading, subscribers, templates]);

  const submitSubscriber = async (values: SubscriberFormValues) => {
    setSaving(true);
    setError('');
    try {
      const id = rowID(currentSubscriber);
      const response = await request<LegacyResponse<unknown>>(
        id
          ? `${subscriberEndpoint}/update/${encodeURIComponent(id)}`
          : `${subscriberEndpoint}/store`,
        {
          method: 'POST',
          data: buildSubscriberPayload(values, currentSubscriber),
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Subscriber email could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Subscriber email saved.');
      closeDrawer();
      await loadSubscribers();
    } catch (err: any) {
      setError(err?.message || 'Subscriber email could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const submitTemplate = async (values: TemplateFormValues) => {
    setSaving(true);
    setError('');
    try {
      const id = rowID(currentTemplate);
      const response = await request<LegacyResponse<unknown>>(
        id ? `${templateEndpoint}/update/${encodeURIComponent(id)}` : `${templateEndpoint}/store`,
        {
          method: 'POST',
          data: buildTemplatePayload(values),
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Email template could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Email template saved.');
      closeDrawer();
      await loadTemplates();
    } catch (err: any) {
      setError(err?.message || 'Email template could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteSubscriber = async (record: SubscriberRow) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await request<LegacyResponse<unknown>>(
        `${subscriberEndpoint}/delete/${encodeURIComponent(id)}`,
        { method: 'POST', data: {} },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Subscriber email could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Subscriber email deleted.');
      await loadSubscribers();
    } catch (err: any) {
      setError(err?.message || 'Subscriber email could not be deleted.');
    }
  };

  const deleteTemplate = async (record: TemplateRow) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await request<LegacyResponse<unknown>>(
        `${templateEndpoint}/delete/${encodeURIComponent(id)}`,
        { method: 'POST', data: {} },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Email template could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Email template deleted.');
      await loadTemplates();
    } catch (err: any) {
      setError(err?.message || 'Email template could not be deleted.');
    }
  };

  const searchRecipients = async (kind: 'subscription' | 'alumni', value: string) => {
    const query = textValue(value);
    if (!query) {
      return;
    }
    setSearching(kind);
    setError('');
    try {
      const endpoint =
        kind === 'subscription'
          ? `${templateEndpoint}/individual-subscription-search`
          : `${templateEndpoint}/individual-alumni-search`;
      const field = kind === 'subscription' ? 'individual_subscription' : 'individual_alumni';
      const rows = await request<SearchRow[]>(endpoint, {
        method: 'POST',
        data: { [field]: query },
      });
      if (kind === 'subscription') {
        setSubscriptionOptions(searchOptions(rows));
      } else {
        setAlumniOptions(searchOptions(rows));
      }
    } catch (err: any) {
      setError(err?.message || 'Recipient search failed.');
    } finally {
      setSearching('');
    }
  };

  const submitSendMail = async (values: SendFormValues) => {
    setSaving(true);
    setError('');
    setSendResult('');
    try {
      const payload: Record<string, unknown> = {
        email_template: values.email_template,
        type: values.type,
      };
      if (values.type === 'individual-subscription') {
        payload.individual_subscription = (values.individual_subscription || []).join(',');
      }
      if (values.type === 'individual-alumni') {
        payload.individual_alumni = (values.individual_alumni || []).join(',');
      }
      const response = await request<LegacyResponse<{ recipient_count?: number; sent?: boolean }>>(
        `${templateEndpoint}/send-mail`,
        { method: 'POST', data: payload },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Email could not be queued.');
        return;
      }
      const count = Number(response.data?.recipient_count || 0);
      const delivery = response.data?.sent ? 'sent' : 'recorded without outbound delivery';
      setSendResult(`${count} recipient(s) ${delivery}.`);
      toast.success(textValue(response.message) || 'Email send request recorded.');
    } catch (err: any) {
      setError(err?.message || 'Email could not be queued.');
    } finally {
      setSaving(false);
    }
  };

  const submitPreview = async (values: { email?: string }) => {
    const id = rowID(currentTemplate);
    if (!id) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyResponse<{ sent?: boolean }>>(
        `${templateEndpoint}/preview-test-mail/${encodeURIComponent(id)}`,
        { method: 'POST', data: { email: textValue(values.email) } },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Preview email could not be recorded.');
        return;
      }
      toast.success(
        response.data?.sent
          ? 'Preview email sent.'
          : 'Preview email request recorded without outbound delivery.',
      );
    } catch (err: any) {
      setError(err?.message || 'Preview email could not be recorded.');
    } finally {
      setSaving(false);
    }
  };

  const subscriberColumns: ColumnsType<SubscriberRow> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 72,
      render: (value, _record, index) => value || index + 1,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_, record) => (
        <Tag color={statusValue(record) === 1 ? 'green' : 'default'}>{statusLabel(record)}</Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 180,
      render: (value, record) => cleanDisplay(value || record.created_at) || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            aria-label="Edit"
            icon={<EditOutlined />}
            onClick={() => openSubscriberEditRoute(record)}
            size="small"
          />
          <Popconfirm
            title="Delete subscriber?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteSubscriber(record)}
          >
            <Button aria-label="Delete" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const templateColumns: ColumnsType<TemplateRow> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 72,
      render: (value, _record, index) => value || index + 1,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Status',
      key: 'status',
      width: 130,
      render: (_, record) => (
        <Tag color={statusValue(record) === 1 ? 'green' : 'default'}>{statusLabel(record)}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            aria-label="View"
            icon={<EyeOutlined />}
            onClick={() => openTemplateViewRoute(record)}
            size="small"
          />
          <Button
            aria-label="Edit"
            icon={<EditOutlined />}
            onClick={() => openTemplateEditRoute(record)}
            size="small"
          />
          <Popconfirm
            title="Delete template?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteTemplate(record)}
          >
            <Button aria-label="Delete" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderSubscriberForm = () => (
    <Form form={subscriberForm} layout="vertical" onFinish={submitSubscriber}>
      <Form.Item
        label="Subscriber Email"
        name="email"
        rules={[
          { required: true, message: 'Email is required.' },
          { type: 'email', message: 'Use a valid email address.' },
        ]}
      >
        <Input autoComplete="off" maxLength={255} />
      </Form.Item>
      {currentSubscriber ? (
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'Active', value: 1 },
              { label: 'Deactivated', value: 0 },
            ]}
          />
        </Form.Item>
      ) : null}
    </Form>
  );

  const renderTemplateForm = () => (
    <Form form={templateForm} layout="vertical" onFinish={submitTemplate}>
      <Form.Item label="Category" name="category" rules={[{ required: true }]}>
        <Input autoComplete="off" maxLength={195} />
      </Form.Item>
      <Form.Item label="Subject" name="subject" rules={[{ required: true }]}>
        <Input autoComplete="off" maxLength={255} />
      </Form.Item>
      <Form.Item label="Body" name="body" rules={[{ required: true }]}>
        <RichTextInput rows={8} />
      </Form.Item>
      <Form.Item label="Status" name="status" rules={[{ required: true }]}>
        <Select
          options={[
            { label: 'Active', value: 1 },
            { label: 'Deactivated', value: 0 },
          ]}
        />
      </Form.Item>
    </Form>
  );

  const renderView = () => {
    const bodyHTML = sanitizeRichText(textValue(currentTemplate?.body));

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Category">
            {cleanDisplay(currentTemplate?.category) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Subject">
            {cleanDisplay(currentTemplate?.subject) || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">{statusLabel(currentTemplate)}</Descriptions.Item>
        </Descriptions>
        {bodyHTML ? (
          <div
            dangerouslySetInnerHTML={{ __html: bodyHTML }}
            style={{
              minHeight: 120,
              padding: 16,
              border: '1px solid #f0f0f0',
              borderRadius: 6,
              background: '#fff',
            }}
          />
        ) : (
          <div>-</div>
        )}
        <Form form={previewForm} layout="vertical" onFinish={submitPreview}>
          <Form.Item
            label="Preview Email"
            name="email"
            rules={[
              { required: true, message: 'Preview email is required.' },
              { type: 'email', message: 'Use a valid email address.' },
            ]}
          >
            <Input autoComplete="off" placeholder="preview@example.com" />
          </Form.Item>
          <Button
            icon={<SendOutlined />}
            loading={saving}
            type="primary"
            onClick={() => previewForm.submit()}
          >
            Record Preview
          </Button>
        </Form>
      </Space>
    );
  };

  const renderSendMail = () => {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {sendResult ? <Alert message={sendResult} showIcon type="info" /> : null}
        <Form
          form={sendForm}
          initialValues={{ type: 'all-subscription' }}
          layout="vertical"
          onFinish={submitSendMail}
        >
          <Form.Item label="Email Template" name="email_template" rules={[{ required: true }]}>
            <Select
              loading={loading}
              options={sendTemplates.map((template) => ({
                label: `${cleanDisplay(template.category)} - ${cleanDisplay(template.subject)}`,
                value: rowID(template),
              }))}
            />
          </Form.Item>
          <Form.Item label="Recipients" name="type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'All Subscribers and Alumni', value: 'all' },
                { label: 'All Subscribers', value: 'all-subscription' },
                { label: 'All Alumni', value: 'all-alumni' },
                { label: 'Selected Subscribers', value: 'individual-subscription' },
                { label: 'Selected Alumni', value: 'individual-alumni' },
              ]}
              onChange={() => {
                sendForm.setFieldsValue({
                  individual_subscription: [],
                  individual_alumni: [],
                });
              }}
            />
          </Form.Item>
          {sendType === 'individual-subscription' ? (
            <Form.Item
              label="Subscriber Emails"
              name="individual_subscription"
              rules={[
                { required: true, message: 'Select at least one subscriber.' },
                { validator: validateEmailValues },
              ]}
            >
              <Select
                mode="tags"
                notFoundContent={null}
                options={subscriptionOptions}
                placeholder="Type an email or search below"
              />
            </Form.Item>
          ) : null}
          {sendType === 'individual-alumni' ? (
            <Form.Item
              label="Alumni Emails"
              name="individual_alumni"
              rules={[
                { required: true, message: 'Select at least one alumni email.' },
                { validator: validateEmailValues },
              ]}
            >
              <Select
                mode="tags"
                notFoundContent={null}
                options={alumniOptions}
                placeholder="Type an email or search below"
              />
            </Form.Item>
          ) : null}
          {sendType === 'individual-subscription' ? (
            <Input.Search
              enterButton="Search Subscribers"
              loading={searching === 'subscription'}
              onSearch={(value) => searchRecipients('subscription', value)}
              placeholder="subscriber@example.com"
              style={{ marginBottom: 16 }}
            />
          ) : null}
          {sendType === 'individual-alumni' ? (
            <Input.Search
              enterButton="Search Alumni"
              loading={searching === 'alumni'}
              onSearch={(value) => searchRecipients('alumni', value)}
              placeholder="alumni@example.com"
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Button
            icon={<SendOutlined />}
            loading={saving}
            type="primary"
            onClick={() => sendForm.submit()}
          >
            Record Send Request
          </Button>
        </Form>
      </Space>
    );
  };

  const drawerTitle =
    drawerMode === 'view'
      ? 'Email Template'
      : drawerMode === 'template'
      ? currentTemplate
        ? 'Edit Email Template'
        : 'Add Email Template'
      : currentSubscriber
      ? 'Edit Subscriber Email'
      : 'Add Subscriber Email';

  return (
    <PageContainer
      title="Newsletter"
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() => {
            if (activeKey === 'subscribers') {
              loadSubscribers();
            } else if (activeKey === 'templates') {
              loadTemplates();
            } else {
              loadSendTemplates();
            }
          }}
        >
          Refresh
        </Button>,
        activeKey === 'subscribers' ? (
          <Button
            key="subscriber"
            icon={<PlusOutlined />}
            type="primary"
            onClick={openSubscriberCreate}
          >
            Add Subscriber
          </Button>
        ) : null,
        activeKey === 'templates' ? (
          <Button
            key="template"
            icon={<PlusOutlined />}
            type="primary"
            onClick={openTemplateCreate}
          >
            Add Template
          </Button>
        ) : null,
      ]}
    >
      {error ? (
        <Alert
          closable
          message={error}
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
          type="error"
        />
      ) : null}

      <Tabs
        activeKey={activeKey}
        items={[
          { key: 'subscribers', label: 'Subscribers' },
          { key: 'templates', label: 'Templates' },
          { key: 'send', label: 'Send Mail' },
        ]}
        onChange={(key) => {
          setError('');
          setSendResult('');
          history.push(tabRoutes[key as TabKey]);
        }}
      />

      {activeKey === 'subscribers' ? (
        <Table<SubscriberRow>
          columns={subscriberColumns}
          dataSource={subscribers}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowKey={(record) => rowID(record) || cleanDisplay(record.email)}
          scroll={{ x: 760 }}
        />
      ) : null}
      {activeKey === 'templates' ? (
        <Table<TemplateRow>
          columns={templateColumns}
          dataSource={templates}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowKey={(record) => rowID(record) || cleanDisplay(record.slug)}
          scroll={{ x: 860 }}
        />
      ) : null}
      {activeKey === 'send' ? renderSendMail() : null}

      <Drawer
        destroyOnClose
        extra={
          drawerMode === 'view' ? null : (
            <Button
              icon={<SaveOutlined />}
              loading={saving}
              type="primary"
              onClick={() => {
                if (drawerMode === 'template') {
                  templateForm.submit();
                } else {
                  subscriberForm.submit();
                }
              }}
            >
              Save
            </Button>
          )
        }
        onClose={closeDrawer}
        open={drawerOpen}
        title={
          <Space>
            <MailOutlined />
            {drawerTitle}
          </Space>
        }
        width={640}
      >
        {drawerMode === 'view'
          ? renderView()
          : drawerMode === 'template'
          ? renderTemplateForm()
          : renderSubscriberForm()}
      </Drawer>
    </PageContainer>
  );
}
