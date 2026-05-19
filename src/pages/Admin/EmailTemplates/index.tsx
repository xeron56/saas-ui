import { EditOutlined, MailOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
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
  Space,
  Table,
  Tag,
  Typography,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';

type EmailTemplateRow = {
  id?: number | string;
  DT_RowIndex?: number;
  category?: number | string;
  category_id?: number | string;
  category_title?: string;
  slug?: string;
  subject?: string;
  body?: string;
  status?: number | string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type PageResponse = {
  fields?: Record<string, string>;
};

type LegacyResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

type TemplateFormValues = {
  subject?: string;
  body?: string;
};

const endpoint = '/admin/setting/email-template';
const updateEndpoint = '/admin/setting/email-temp-update';

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

function rowID(record?: EmailTemplateRow) {
  return textValue(record?.id);
}

function categoryLabel(record?: EmailTemplateRow) {
  return cleanDisplay(record?.category_title) || cleanDisplay(record?.category) || '-';
}

function editIDFromPath(pathname: string) {
  const match = pathname.match(/\/admin\/setting\/email-edit\/([^/?#]+)/);
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function legacyHTMLFieldValue(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const field = doc.querySelector(`[name="${name}"]`) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    return textValue(field?.value);
  }
  const field =
    html.match(
      new RegExp(`<(?:input|textarea)[^>]*name=["']${name}["'][\\s\\S]*?(?:>|<\\/textarea>)`, 'i'),
    )?.[0] || '';
  const value = field.match(/\bvalue=["']([^"']*)["']/i)?.[1] || '';
  if (value) {
    return value;
  }
  return field.match(/<textarea[^>]*>([\s\S]*?)<\/textarea>/i)?.[1] || '';
}

function templateFromEditHTML(html: string, fallbackID: string): EmailTemplateRow | undefined {
  const subject = legacyHTMLFieldValue(html, 'subject');
  const body = legacyHTMLFieldValue(html, 'body');
  if (!subject && !body) {
    return undefined;
  }
  return { id: fallbackID, subject, body };
}

export default function AdminEmailTemplates() {
  const location = useLocation();
  const openedTargetRef = useRef('');
  const [form] = Form.useForm<TemplateFormValues>();
  const [rows, setRows] = useState<EmailTemplateRow[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplateRow | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const targetEditID = useMemo(() => editIDFromPath(location.pathname), [location.pathname]);

  const loadPage = async () => {
    setLoading(true);
    setError('');
    try {
      const [page, table] = await Promise.all([
        request<PageResponse>(endpoint),
        request<LegacyTableResponse<EmailTemplateRow>>(`${endpoint}?ajax=1`),
      ]);
      setFields(page.fields || {});
      setRows(Array.isArray(table.data) ? table.data : []);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'Unable to load email templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const openEditor = (record: EmailTemplateRow) => {
    setCurrentTemplate(record);
    form.setFieldsValue({
      subject: cleanDisplay(record.subject),
      body: sanitizeRichText(textValue(record.body)),
    });
    setDrawerOpen(true);
  };

  const openEditorRoute = (record: EmailTemplateRow) => {
    const id = rowID(record);
    if (!id) {
      openEditor(record);
      return;
    }
    openedTargetRef.current = id;
    history.push(`/admin/setting/email-edit/${encodeURIComponent(id)}`);
    openEditor(record);
  };

  const openDirectEditor = async (id: string) => {
    const row = rows.find((item) => rowID(item) === id);
    if (row) {
      openEditor(row);
      return;
    }
    setError('');
    try {
      const html = await request<string>(`/admin/setting/email-edit/${encodeURIComponent(id)}`, {
        responseType: 'text',
      });
      const template = templateFromEditHTML(textValue(html), id);
      if (!template) {
        setError('Email template could not be loaded.');
        return;
      }
      openEditor(template);
    } catch (err: any) {
      setError(err?.message || 'Email template could not be loaded.');
    }
  };

  useEffect(() => {
    if (!targetEditID) {
      openedTargetRef.current = '';
      return;
    }
    if (loading || drawerOpen || openedTargetRef.current === targetEditID) {
      return;
    }
    openedTargetRef.current = targetEditID;
    openDirectEditor(targetEditID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetEditID, rows, loading, drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrentTemplate(undefined);
    form.resetFields();
    if (targetEditID) {
      history.replace(endpoint);
    }
  };

  const saveTemplate = async () => {
    const id = rowID(currentTemplate);
    if (!id) {
      return;
    }
    const values = await form.validateFields();
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyResponse<unknown>>(
        `${updateEndpoint}/${encodeURIComponent(id)}`,
        {
          method: 'POST',
          data: {
            subject: textValue(values.subject),
            body: sanitizeRichText(textValue(values.body)),
          },
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Email template could not be updated.');
        return;
      }
      toast.success(textValue(response.message) || 'Email template updated.');
      closeDrawer();
      await loadPage();
    } catch (err: any) {
      setError(err?.message || 'Email template could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<EmailTemplateRow> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 72,
      render: (value, _record, index) => value || index + 1,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 180,
      render: (_, record) => categoryLabel(record),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      width: 260,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Body',
      dataIndex: 'body',
      render: (value) => (
        <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {cleanDisplay(value) || '-'}
        </Typography.Paragraph>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={() => openEditorRoute(record)} size="small">
          Edit
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Email Template"
      extra={
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadPage}>
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? (
          <Alert closable message={error} onClose={() => setError('')} showIcon type="error" />
        ) : null}
        <Table<EmailTemplateRow>
          columns={columns}
          dataSource={rows}
          loading={loading}
          pagination={{ pageSize: 25, showSizeChanger: true }}
          rowKey={(record) => rowID(record) || cleanDisplay(record.slug)}
          scroll={{ x: 900 }}
        />
      </Space>
      <Drawer
        width={720}
        open={drawerOpen}
        title={
          <Space>
            <MailOutlined />
            Edit Email Template
          </Space>
        }
        onClose={closeDrawer}
        extra={
          <Button icon={<SaveOutlined />} loading={saving} type="primary" onClick={saveTemplate}>
            Save
          </Button>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Category">{categoryLabel(currentTemplate)}</Descriptions.Item>
          </Descriptions>
          <Space size={[8, 8]} wrap>
            {Object.keys(fields).map((field) => (
              <Tag key={field}>{field}</Tag>
            ))}
          </Space>
          <Form form={form} layout="vertical">
            <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
              <Input autoComplete="off" maxLength={255} placeholder="Subject" />
            </Form.Item>
            <Form.Item name="body" label="Body" rules={[{ required: true }]}>
              <RichTextInput rows={10} />
            </Form.Item>
          </Form>
        </Space>
      </Drawer>
    </PageContainer>
  );
}
