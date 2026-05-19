import { EditOutlined, MailOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type EmailCategory = {
  category?: number | string;
  title?: string;
  details?: string;
};

type EmailTemplate = {
  id?: number | string;
  category?: number | string;
  category_id?: number | string;
  slug?: string;
  subject?: string;
  body?: string;
};

type PageResponse = {
  categories?: EmailCategory[];
  templates?: EmailTemplate[];
};

type ConfigResponse = {
  template?: EmailTemplate;
  fields?: Record<string, string>;
};

type LegacyResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

type CategoryRow = EmailCategory & {
  key: string;
  template?: EmailTemplate;
};

type TemplateFormValues = {
  category?: number | string;
  subject?: string;
  body?: string;
};

const templatePagePath = '/super-admin/setting/email-template';
const templateConfigPath = '/super-admin/setting/email-template-config';

const legacyCategoryFallbacks: Record<string, Pick<EmailCategory, 'title' | 'details'>> = {
  '5': {
    title: 'Forgot Password',
    details: 'Forgot password email sent to user',
  },
  '7': {
    title: 'Email Verify',
    details: 'Verify email sent to user',
  },
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

function categoryKey(value: unknown) {
  return textValue(value);
}

function categoryFallback(category: string): EmailCategory {
  return {
    category,
    ...(legacyCategoryFallbacks[category] || {}),
  };
}

export default function SuperAdminEmailTemplates() {
  const location = useLocation();
  const [form] = Form.useForm<TemplateFormValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<EmailCategory[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EmailCategory | undefined>();
  const openedConfigRef = useRef('');

  const targetConfigCategory = useMemo(() => {
    if (location.pathname !== templateConfigPath) {
      return '';
    }
    return categoryKey(new URLSearchParams(location.search).get('category'));
  }, [location.pathname, location.search]);

  const loadPage = () => {
    setLoading(true);
    setError('');
    request<PageResponse>(templatePagePath)
      .then((response) => {
        setCategories(response?.categories || []);
        setTemplates(response?.templates || []);
      })
      .catch((err) => setError(err?.message || 'Unable to load email templates.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPage();
  }, []);

  const rows = useMemo<CategoryRow[]>(() => {
    const templateByCategory = new Map<string, EmailTemplate>();
    templates.forEach((template) => {
      templateByCategory.set(categoryKey(template.category_id || template.category), template);
    });
    return categories.map((category) => {
      const key = categoryKey(category.category);
      return {
        ...category,
        key,
        template: templateByCategory.get(key),
      };
    });
  }, [categories, templates]);

  const openEditor = useCallback(
    (category: EmailCategory) => {
      const key = categoryKey(category.category);
      setActiveCategory(category);
      setLoading(true);
      setError('');
      request<LegacyResponse<ConfigResponse>>(templateConfigPath, {
        params: { category: key },
      })
        .then((response) => {
          if (response?.status === false) {
            throw new Error(response.message || 'Unable to load template configuration.');
          }
          const template = response?.data?.template || {};
          setFields(response?.data?.fields || {});
          form.setFieldsValue({
            category: template.category || key,
            subject: textValue(template.subject),
            body: sanitizeRichText(textValue(template.body)),
          });
          setDrawerOpen(true);
        })
        .catch((err) => setError(err?.message || 'Unable to load template configuration.'))
        .finally(() => setLoading(false));
    },
    [form],
  );

  useEffect(() => {
    if (!targetConfigCategory) {
      openedConfigRef.current = '';
      return;
    }
    if (openedConfigRef.current === targetConfigCategory) {
      return;
    }
    openedConfigRef.current = targetConfigCategory;
    const category =
      rows.find((row) => categoryKey(row.category) === targetConfigCategory) ||
      categoryFallback(targetConfigCategory);
    openEditor(category);
  }, [openEditor, rows, targetConfigCategory]);

  const openEditorRoute = (category: EmailCategory) => {
    const key = categoryKey(category.category);
    if (!key) {
      return;
    }
    openedConfigRef.current = '';
    if (location.pathname === templateConfigPath && targetConfigCategory === key) {
      openEditor(category);
      return;
    }
    history.push(`${templateConfigPath}?category=${encodeURIComponent(key)}`);
  };

  const closeEditor = () => {
    openedConfigRef.current = '';
    setDrawerOpen(false);
    setActiveCategory(undefined);
    form.resetFields();
    if (location.pathname === templateConfigPath) {
      history.replace(templatePagePath);
    }
  };

  const saveTemplate = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const response = await request<LegacyResponse<Record<string, unknown>>>(
        '/super-admin/setting/email-template-config-update',
        {
          method: 'POST',
          data: {
            category: values.category,
            subject: textValue(values.subject),
            body: sanitizeRichText(textValue(values.body)),
          },
        },
      );
      if (response?.status === false) {
        throw new Error(response.message || 'Unable to update template.');
      }
      toast.success(response?.message || 'Updated successfully.');
      closeEditor();
      loadPage();
    } catch (err: any) {
      toast.error(err?.message || 'Unable to update template.');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<CategoryRow> = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 220,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Details',
      dataIndex: 'details',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Subject',
      dataIndex: ['template', 'subject'],
      render: (_, record) => cleanDisplay(record.template?.subject) || <Tag>Not configured</Tag>,
    },
    {
      title: 'Action',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={() => openEditorRoute(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="System Email Templates"
      extra={
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadPage}>
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Card
          title={
            <Space>
              <MailOutlined />
              <span>Email Templates</span>
            </Space>
          }
        >
          <Table<CategoryRow>
            rowKey="key"
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={false}
          />
        </Card>
      </Space>
      <Drawer
        width={720}
        open={drawerOpen}
        title={`Edit ${cleanDisplay(activeCategory?.title) || 'Template'}`}
        onClose={closeEditor}
        extra={
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={saveTemplate}>
            Save
          </Button>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Typography.Text type="secondary">
            {cleanDisplay(activeCategory?.details)}
          </Typography.Text>
          <Space size={[8, 8]} wrap>
            {Object.keys(fields).map((field) => (
              <Tag key={field}>{field}</Tag>
            ))}
          </Space>
          <Form form={form} layout="vertical">
            <Form.Item name="category" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
              <Input placeholder="Subject" />
            </Form.Item>
            <Form.Item name="body" label="Body" rules={[{ required: true }]}>
              <RichTextInput rows={12} />
            </Form.Item>
          </Form>
        </Space>
      </Drawer>
    </PageContainer>
  );
}
