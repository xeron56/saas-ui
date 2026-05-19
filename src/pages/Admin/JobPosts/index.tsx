import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
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
import { useEffect, useMemo, useRef, useState } from 'react';

type LegacyJobPost = {
  id?: number | string;
  title?: string;
  slug?: string;
  compensation_n_benefits?: string;
  salary?: string;
  company_logo?: string | number;
  company_logo_id?: string | number;
  company_logo_url?: string;
  location?: string;
  post_link?: string;
  application_deadline?: string;
  application_deadline_raw?: string;
  job_responsibility?: string;
  job_context?: string;
  educational_requirements?: string;
  additional_requirements?: string;
  employee_status?: string | number;
  employee_status_id?: string | number;
  status?: string | number;
  status_id?: string | number;
  status_name?: string;
};

type LegacyJobPostResponse = {
  status?: boolean;
  message?: string;
  data?: LegacyJobPost[];
  item?: LegacyJobPost;
  jobPostData?: LegacyJobPost;
  recordsTotal?: number;
  recordsFiltered?: number;
};

type JobPostFormValues = {
  title?: string;
  compensation_n_benefits?: string;
  salary?: string;
  location?: string;
  post_link?: string;
  application_deadline?: string;
  job_context?: string;
  job_responsibility?: string;
  educational_requirements?: string;
  additional_requirements?: string;
  employee_status?: number;
  status?: number;
  company_logo?: UploadFile[];
};

const endpoint = '/admin/job-post';

const employeeStatusOptions = [
  { label: 'Full Time', value: 1 },
  { label: 'Part Time', value: 2 },
  { label: 'Contractual', value: 3 },
  { label: 'Remote Worker', value: 4 },
];

const jobStatusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Canceled', value: 2 },
];

const richTextFields = new Set([
  'job_context',
  'job_responsibility',
  'educational_requirements',
  'additional_requirements',
]);

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

function logoSource(record?: LegacyJobPost) {
  const url = textValue(record?.company_logo_url);
  const raw = textValue(record?.company_logo);
  if (url) {
    return url;
  }
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('data:')) {
    return raw;
  }
  return extractImageSrc(record?.company_logo);
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

function decodeHTMLEntities(value: string) {
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  }
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function legacyHTMLFieldValues(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const documentValue = new DOMParser().parseFromString(html, 'text/html');
    const field = Array.from(documentValue.querySelectorAll('input, textarea, select')).find(
      (element) => element.getAttribute('name') === name,
    );
    if (!field) {
      return [];
    }
    if (field instanceof HTMLSelectElement) {
      return Array.from(field.selectedOptions).map((option) => option.value);
    }
    if (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) {
      return [field.value || field.textContent || ''];
    }
    return [field.textContent || ''];
  }

  const escapedName = escapeRegExp(name);
  const select = html.match(
    new RegExp(`<select[^>]*name=["']${escapedName}["'][\\s\\S]*?<\\/select>`, 'i'),
  )?.[0];
  if (select) {
    return Array.from(
      select.matchAll(/<option[^>]*value=["']?([^"'\s>]+)["']?[^>]*selected[^>]*>/gi),
    ).map((match) => decodeHTMLEntities(match[1]));
  }

  const textarea = html.match(
    new RegExp(`<textarea[^>]*name=["']${escapedName}["'][^>]*>([\\s\\S]*?)<\\/textarea>`, 'i'),
  );
  if (textarea) {
    return [decodeHTMLEntities(textarea[1])];
  }

  const input = html.match(new RegExp(`<input[^>]*name=["']${escapedName}["'][^>]*>`, 'i'))?.[0];
  const value = input?.match(/\bvalue=["']([^"']*)["']/i)?.[1];
  return value === undefined ? [] : [decodeHTMLEntities(value)];
}

function legacyHTMLFieldValue(html: string, name: string) {
  return legacyHTMLFieldValues(html, name)[0] || '';
}

function isAllowedLogo(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
}

function statusID(record?: LegacyJobPost) {
  return numericValue(record?.status_id ?? record?.status);
}

function statusLabel(record?: LegacyJobPost) {
  return cleanDisplay(record?.status_name) || cleanDisplay(record?.status) || 'Pending';
}

function statusTag(record?: LegacyJobPost) {
  const value = statusID(record);
  if (value === 1) {
    return <Tag color="green">{statusLabel(record)}</Tag>;
  }
  if (value === 2) {
    return <Tag color="red">{statusLabel(record)}</Tag>;
  }
  return <Tag color="gold">{statusLabel(record)}</Tag>;
}

function jobPostFormValues(record?: LegacyJobPost): JobPostFormValues {
  return {
    title: cleanDisplay(record?.title),
    compensation_n_benefits: textValue(record?.compensation_n_benefits),
    salary: cleanDisplay(record?.salary),
    location: cleanDisplay(record?.location),
    post_link: textValue(record?.post_link),
    application_deadline: textValue(
      record?.application_deadline_raw || record?.application_deadline,
    ),
    job_context: sanitizeRichText(textValue(record?.job_context)),
    job_responsibility: sanitizeRichText(textValue(record?.job_responsibility)),
    educational_requirements: sanitizeRichText(textValue(record?.educational_requirements)),
    additional_requirements: sanitizeRichText(textValue(record?.additional_requirements)),
    employee_status: numericValue(record?.employee_status_id ?? record?.employee_status) || 1,
    status: statusID(record),
    company_logo: [],
  };
}

function jobPostFormData(values: JobPostFormValues, current?: LegacyJobPost) {
  const formData = new FormData();
  [
    'title',
    'compensation_n_benefits',
    'salary',
    'location',
    'post_link',
    'application_deadline',
    'job_context',
    'job_responsibility',
    'educational_requirements',
    'additional_requirements',
  ].forEach((key) => {
    const value = textValue(values[key as keyof JobPostFormValues]);
    formData.append(key, richTextFields.has(key) ? sanitizeRichText(value) : value);
  });
  formData.append('employee_status', String(values.employee_status ?? 1));
  formData.append('status', String(values.status ?? 0));
  const logo = selectedFile(values.company_logo);
  if (logo) {
    formData.append('company_logo', logo);
  } else if (current?.company_logo_id) {
    formData.append('company_logo_id', textValue(current.company_logo_id));
  }
  if (current?.slug) {
    formData.append('slug', textValue(current.slug));
  }
  return formData;
}

function directInfoSlugFromPath(pathname: string) {
  const match = pathname.match(/^\/admin\/job-post\/info\/([^/]+)\/?$/);
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function jobPostFromEditHTML(html: string, fallbackSlug: string): LegacyJobPost | undefined {
  const title = legacyHTMLFieldValue(html, 'title');
  const slug = legacyHTMLFieldValue(html, 'slug') || fallbackSlug;
  if (!title && !slug) {
    return undefined;
  }
  return {
    slug,
    title,
    compensation_n_benefits: legacyHTMLFieldValue(html, 'compensation_n_benefits'),
    salary: legacyHTMLFieldValue(html, 'salary'),
    location: legacyHTMLFieldValue(html, 'location'),
    post_link: legacyHTMLFieldValue(html, 'post_link'),
    application_deadline: legacyHTMLFieldValue(html, 'application_deadline'),
    application_deadline_raw: legacyHTMLFieldValue(html, 'application_deadline'),
    job_context: legacyHTMLFieldValue(html, 'job_context'),
    job_responsibility: legacyHTMLFieldValue(html, 'job_responsibility'),
    educational_requirements: legacyHTMLFieldValue(html, 'educational_requirements'),
    additional_requirements: legacyHTMLFieldValue(html, 'additional_requirements'),
    employee_status: legacyHTMLFieldValue(html, 'employee_status'),
    employee_status_id: legacyHTMLFieldValue(html, 'employee_status'),
    status: legacyHTMLFieldValue(html, 'status'),
    status_id: legacyHTMLFieldValue(html, 'status'),
    company_logo_url: extractImageSrc(html),
  };
}

export default function AdminJobPosts() {
  const location = useLocation();
  const openedTargetRef = useRef('');
  const [form] = Form.useForm<JobPostFormValues>();
  const [rows, setRows] = useState<LegacyJobPost[]>([]);
  const [current, setCurrent] = useState<LegacyJobPost | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState('');
  const targetInfoSlug = useMemo(
    () => directInfoSlugFromPath(location.pathname),
    [location.pathname],
  );

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyJobPostResponse>(`${endpoint}/pending-job-post?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load pending job posts.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const openEditBySlug = async (slug: string, fallback?: LegacyJobPost) => {
    if (!slug) {
      return;
    }
    setError('');
    try {
      const html = await request<string>(`${endpoint}/info/${encodeURIComponent(slug)}`, {
        responseType: 'text',
      });
      const item = jobPostFromEditHTML(textValue(html), slug) || fallback;
      if (!item) {
        setError('Unable to load job post.');
        return;
      }
      setCurrent(item);
      form.setFieldsValue(jobPostFormValues(item));
      setDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to load job post.');
    }
  };

  const openEdit = (record: LegacyJobPost) => {
    const slug = textValue(record.slug);
    if (!slug) {
      return;
    }
    openedTargetRef.current = slug;
    history.push(`${endpoint}/info/${encodeURIComponent(slug)}`);
    void openEditBySlug(slug, record);
  };

  useEffect(() => {
    if (!targetInfoSlug) {
      openedTargetRef.current = '';
      return;
    }
    if (openedTargetRef.current === targetInfoSlug) {
      return;
    }
    openedTargetRef.current = targetInfoSlug;
    const loaded = rows.find((row) => textValue(row.slug) === targetInfoSlug);
    void openEditBySlug(targetInfoSlug, loaded);
  }, [targetInfoSlug, rows]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
    if (targetInfoSlug) {
      history.replace(`${endpoint}/pending-job-post`);
    }
  };

  const submit = async (values: JobPostFormValues) => {
    const slug = textValue(current?.slug);
    if (!slug) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyJobPostResponse>(
        `${endpoint}/update/${encodeURIComponent(slug)}`,
        {
          method: 'POST',
          data: jobPostFormData(values, current),
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Job post could not be updated.');
        return;
      }
      toast.success(textValue(response.message) || 'Job post updated.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Job post could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const deleteJobPost = async (record: LegacyJobPost) => {
    const slug = textValue(record.slug);
    if (!slug) {
      return;
    }
    setError('');
    try {
      const response = await request<LegacyJobPostResponse>(
        `${endpoint}/delete/${encodeURIComponent(slug)}`,
        {
          method: 'POST',
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Job post could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Job post deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Job post could not be deleted.');
    }
  };

  const columns: ColumnsType<LegacyJobPost> = [
    {
      title: 'Company',
      width: 92,
      render: (_, record) => {
        const src = logoSource(record);
        return src ? (
          <Image width={40} height={40} src={src} preview={false} />
        ) : (
          <FileImageOutlined />
        );
      },
    },
    {
      title: 'Job Title',
      render: (_, record) => cleanDisplay(record.title) || '-',
    },
    {
      title: 'Employee Status',
      width: 160,
      render: (_, record) => cleanDisplay(record.employee_status) || '-',
    },
    {
      title: 'Salary',
      width: 140,
      render: (_, record) => cleanDisplay(record.salary) || '-',
    },
    {
      title: 'Application Deadline',
      width: 190,
      render: (_, record) => cleanDisplay(record.application_deadline) || '-',
    },
    {
      title: 'Status',
      width: 120,
      render: (_, record) => statusTag(record),
    },
    {
      title: 'Action',
      key: 'action',
      width: 230,
      render: (_, record) => {
        const slug = textValue(record.slug);
        return (
          <Space wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              href={`/job-post/details/${encodeURIComponent(slug)}`}
              disabled={!slug}
            >
              View
            </Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
              Edit
            </Button>
            <Popconfirm title="Delete this job post?" onConfirm={() => deleteJobPost(record)}>
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
    <PageContainer title="Pending Job List">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table<LegacyJobPost>
        rowKey={(record) => textValue(record.id) || textValue(record.slug)}
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 980 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>Pending Job Posts</strong>
            <Button icon={<ReloadOutlined />} onClick={loadRows}>
              Refresh
            </Button>
          </div>
        )}
      />

      <Drawer
        width={720}
        title="Update Job Post"
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submit}>
          <Form.Item name="title" label="Job Title" rules={[{ required: true, min: 3 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="employee_status" label="Employee Status" rules={[{ required: true }]}>
            <Select options={employeeStatusOptions} />
          </Form.Item>
          <Form.Item
            name="compensation_n_benefits"
            label="Compensation & Benefits"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          {logoSource(current) ? (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: 'block', marginBottom: 8 }}>Current Company Logo</span>
              <Image width={72} height={72} src={logoSource(current)} preview={false} />
            </div>
          ) : null}
          <Form.Item
            name="company_logo"
            label="Upload Company Logo"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
          >
            <Upload
              beforeUpload={(file) => {
                if (!isAllowedLogo(file)) {
                  toast.error('Only JPG and PNG logos are supported.');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              maxCount={1}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            >
              <Button icon={<UploadOutlined />}>Choose logo</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="application_deadline"
            label="Application Deadline"
            rules={[{ required: true }]}
          >
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="post_link" label="URL" rules={[{ required: true, type: 'url' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Job Status" rules={[{ required: true }]}>
            <Select options={jobStatusOptions} />
          </Form.Item>
          <Form.Item name="job_context" label="Job Context" rules={[{ required: true }]}>
            <RichTextInput rows={6} />
          </Form.Item>
          <Form.Item
            name="job_responsibility"
            label="Job Responsibility"
            rules={[{ required: true }]}
          >
            <RichTextInput rows={6} />
          </Form.Item>
          <Form.Item
            name="educational_requirements"
            label="Educational Requirements"
            rules={[{ required: true }]}
          >
            <RichTextInput rows={6} />
          </Form.Item>
          <Form.Item name="additional_requirements" label="Additional Requirements">
            <RichTextInput rows={6} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            Update Post
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
