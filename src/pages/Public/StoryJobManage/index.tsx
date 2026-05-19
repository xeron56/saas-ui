import { useLocation, useParams, history } from '@umijs/max';
import {
  Alert,
  Button,
  Descriptions,
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
import type { UploadFile } from 'antd/es/upload/interface';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import RichTextInput, { sanitizeRichText } from '@/components/RichTextInput';
import { useEffect, useMemo, useState } from 'react';
import { normalizePayload, recordsFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent, postPublicContent } from '../services';
import type { LegacyPayload, LegacyRecord } from '../types';

type StoryFormValues = {
  title?: string;
  body?: string;
  status?: number;
  thumbnail?: UploadFile[];
};

type JobFormValues = {
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

const employeeStatusOptions = [
  { label: 'Full Time', value: 1 },
  { label: 'Part Time', value: 2 },
  { label: 'Contractual', value: 3 },
  { label: 'Remote Worker', value: 4 },
];

const reviewStatusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Canceled', value: 2 },
];

const jobRichTextFields = new Set([
  'job_context',
  'job_responsibility',
  'educational_requirements',
  'additional_requirements',
]);

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

function RichTextDisplay({ value }: { value: unknown }) {
  const html = sanitizeRichText(textValue(value));
  if (!html) {
    return <>-</>;
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function imageSource(record: LegacyRecord, field: string) {
  const url = textValue(record[`${field}_url`]);
  const raw = textValue(record[field]);
  if (url) {
    return url;
  }
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('data:')) {
    return raw;
  }
  return extractImageSrc(record[field]);
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

function storyFromInfoHTML(html: string, fallbackSlug: string): LegacyRecord {
  return {
    slug: legacyHTMLFieldValue(html, 'slug') || fallbackSlug,
    title: legacyHTMLFieldValue(html, 'title'),
    body: legacyHTMLFieldValue(html, 'body'),
    status: legacyHTMLFieldValue(html, 'status'),
    status_id: legacyHTMLFieldValue(html, 'status'),
    thumbnail_url: extractImageSrc(html),
  };
}

function jobFromInfoHTML(html: string, fallbackSlug: string): LegacyRecord {
  return {
    slug: legacyHTMLFieldValue(html, 'slug') || fallbackSlug,
    title: legacyHTMLFieldValue(html, 'title'),
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

function isAllowedImage(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
}

function statusID(record: LegacyRecord) {
  return numericValue(record.status_id ?? record.status);
}

function statusLabel(record: LegacyRecord) {
  return cleanDisplay(record.status_name) || cleanDisplay(record.status) || '-';
}

function statusTag(record: LegacyRecord) {
  const status = statusID(record);
  if (status === 1) {
    return <Tag color="green">{statusLabel(record)}</Tag>;
  }
  if (status === 2) {
    return <Tag color="red">{statusLabel(record)}</Tag>;
  }
  return <Tag color="gold">{statusLabel(record)}</Tag>;
}

function storyFormValues(record: LegacyRecord = {}): StoryFormValues {
  return {
    title: cleanDisplay(record.title),
    body: sanitizeRichText(textValue(record.body)),
    status: statusID(record),
    thumbnail: [],
  };
}

function jobFormValues(record: LegacyRecord = {}): JobFormValues {
  return {
    title: cleanDisplay(record.title),
    compensation_n_benefits: textValue(record.compensation_n_benefits),
    salary: cleanDisplay(record.salary),
    location: cleanDisplay(record.location),
    post_link: textValue(record.post_link),
    application_deadline: textValue(record.application_deadline_raw || record.application_deadline),
    job_context: sanitizeRichText(textValue(record.job_context)),
    job_responsibility: sanitizeRichText(textValue(record.job_responsibility)),
    educational_requirements: sanitizeRichText(textValue(record.educational_requirements)),
    additional_requirements: sanitizeRichText(textValue(record.additional_requirements)),
    employee_status: numericValue(record.employee_status_id ?? record.employee_status) || 1,
    status: statusID(record),
    company_logo: [],
  };
}

function storyFormData(
  values: StoryFormValues,
  includeStatus: boolean,
  current: LegacyRecord = {},
) {
  const formData = new FormData();
  formData.append('title', textValue(values.title));
  formData.append('body', sanitizeRichText(textValue(values.body)));
  if (includeStatus) {
    formData.append('status', String(values.status ?? 0));
  }
  const thumbnail = selectedFile(values.thumbnail);
  if (thumbnail) {
    formData.append('thumbnail', thumbnail);
  } else if (current.thumbnail_id) {
    formData.append('thumbnail_id', textValue(current.thumbnail_id));
  }
  return formData;
}

function jobFormData(values: JobFormValues, includeStatus: boolean, current: LegacyRecord = {}) {
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
    const value = textValue(values[key as keyof JobFormValues]);
    formData.append(key, jobRichTextFields.has(key) ? sanitizeRichText(value) : value);
  });
  formData.append('employee_status', String(values.employee_status ?? 1));
  if (includeStatus) {
    formData.append('status', String(values.status ?? 0));
  }
  const logo = selectedFile(values.company_logo);
  if (logo) {
    formData.append('company_logo', logo);
  } else if (current.company_logo_id) {
    formData.append('company_logo_id', textValue(current.company_logo_id));
  }
  return formData;
}

function jobEndpoint(pathname: string) {
  const path = pathname.replace(/\/$/, '');
  if (path === '/job-post/my-job-post') {
    return '/job-post/my-job-post';
  }
  if (path === '/job-post/pending-job-post') {
    return '/job-post/pending-job-post';
  }
  if (path === '/admin/job-post/pending-job-post') {
    return '/admin/job-post/pending-job-post';
  }
  return '/job-post/all-job-post';
}

function storyEndpoint(pathname: string) {
  const path = pathname.replace(/\/$/, '');
  if (path === '/stories/pending') {
    return '/stories/pending';
  }
  if (path === '/admin/stories/pending') {
    return '/admin/stories/pending';
  }
  return '/stories/list';
}

export default function StoryJobManage() {
  const location = useLocation();
  const params = useParams();
  const [storyForm] = Form.useForm<StoryFormValues>();
  const [jobForm] = Form.useForm<JobFormValues>();
  const pathname = location.pathname.replace(/\/$/, '');
  const isStory = pathname.startsWith('/stories') || pathname.startsWith('/admin/stories');
  const isJob = pathname.startsWith('/job-post') || pathname.startsWith('/admin/job-post');
  const storyCreate = pathname === '/stories/create';
  const jobCreate = pathname === '/job-post/create';
  const jobDetail = pathname.startsWith('/job-post/details/');
  const jobInfo = pathname.startsWith('/job-post/info/');
  const storyInfo = pathname.startsWith('/stories/info/');
  const directInfo = jobInfo || storyInfo;
  const pendingMode = pathname.includes('/pending');
  const myJobMode = pathname === '/job-post/my-job-post';
  const storyListEndpoint = useMemo(() => storyEndpoint(pathname), [pathname]);
  const jobListEndpoint = useMemo(() => jobEndpoint(pathname), [pathname]);
  const returnPath = isStory ? '/stories/list' : '/job-post/my-job-post';
  const [rows, setRows] = useState<LegacyRecord[]>([]);
  const [current, setCurrent] = useState<LegacyRecord>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const loadRows = async () => {
    const endpoint = isStory ? storyListEndpoint : jobListEndpoint;
    setLoading(true);
    setError('');
    try {
      const body = normalizePayload(await fetchPublicContent(`${endpoint}?ajax=1`));
      setRows(recordsFromPayload(body, 'data'));
    } catch (err: any) {
      setError(err?.message || 'Unable to load records.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadJobDetail = async () => {
    const slug = textValue(params.slug);
    setLoading(true);
    setError('');
    try {
      const body = normalizePayload(
        await fetchPublicContent<LegacyPayload>(`/job-post/details/${encodeURIComponent(slug)}`),
      );
      const item = body.jobPostData || body.item;
      setCurrent(item && typeof item === 'object' ? item : {});
    } catch (err: any) {
      setError(err?.message || 'Unable to load job post.');
      setCurrent({});
    } finally {
      setLoading(false);
    }
  };

  const loadInfoEditor = async () => {
    const slug = textValue(params.slug);
    const endpoint = isStory
      ? `/stories/info/${encodeURIComponent(slug)}`
      : `/job-post/info/${encodeURIComponent(slug)}`;
    setLoading(true);
    setError('');
    try {
      const response = await fetchPublicContent<any>(endpoint);
      const body = typeof response === 'string' ? {} : normalizePayload(response);
      const item = isStory ? body.story || body.item : body.jobPostData || body.item;
      const html = typeof response === 'string' ? response : textValue(body.html);
      const record =
        item && typeof item === 'object'
          ? (item as LegacyRecord)
          : html
          ? isStory
            ? storyFromInfoHTML(html, slug)
            : jobFromInfoHTML(html, slug)
          : {};
      setCurrent(record);
      if (isStory) {
        storyForm.setFieldsValue(storyFormValues(record));
      } else {
        jobForm.setFieldsValue(jobFormValues(record));
      }
      setEditing(Object.keys(record).length > 0);
    } catch (err: any) {
      setError(err?.message || 'Unable to load record.');
      setCurrent({});
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storyCreate) {
      storyForm.resetFields();
      storyForm.setFieldsValue({ status: 0, thumbnail: [] });
      setLoading(false);
      return;
    }
    if (jobCreate) {
      jobForm.resetFields();
      jobForm.setFieldsValue({ employee_status: 1, status: 0, company_logo: [] });
      setLoading(false);
      return;
    }
    if (jobDetail) {
      loadJobDetail();
      return;
    }
    if (directInfo) {
      loadInfoEditor();
      return;
    }
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, storyCreate, jobCreate, jobDetail, directInfo, params.slug]);

  const openEdit = (record: LegacyRecord) => {
    setCurrent(record);
    if (isStory) {
      storyForm.setFieldsValue(storyFormValues(record));
    } else {
      jobForm.setFieldsValue(jobFormValues(record));
    }
    setEditing(true);
  };

  const closeEdit = () => {
    setEditing(false);
    setCurrent({});
    storyForm.resetFields();
    jobForm.resetFields();
  };

  const submitStory = async (values: StoryFormValues) => {
    const slug = textValue(current.slug);
    const create = storyCreate || !slug;
    setSaving(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent(
          create ? '/stories/store' : `/stories/update/${encodeURIComponent(slug)}`,
          storyFormData(values, !create, current),
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Story could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Story saved.');
      closeEdit();
      if (storyCreate) {
        history.push('/stories/list');
      } else if (directInfo) {
        history.push(returnPath);
      } else {
        await loadRows();
      }
    } catch (err: any) {
      setError(err?.message || 'Story could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const submitJob = async (values: JobFormValues) => {
    const slug = textValue(current.slug);
    const create = jobCreate || !slug;
    const adminPath = pathname.startsWith('/admin/job-post');
    setSaving(true);
    setError('');
    try {
      const response = normalizePayload(
        await postPublicContent(
          create
            ? '/job-post/add-new-job-post'
            : `${adminPath ? '/admin/job-post' : '/job-post'}/update/${encodeURIComponent(slug)}`,
          jobFormData(values, !create, current),
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Job post could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Job post saved.');
      closeEdit();
      if (jobCreate) {
        history.push('/job-post/my-job-post');
      } else if (directInfo) {
        history.push(returnPath);
      } else {
        await loadRows();
      }
    } catch (err: any) {
      setError(err?.message || 'Job post could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record: LegacyRecord) => {
    const slug = textValue(record.slug);
    if (!slug) {
      return;
    }
    const adminJobPath = !isStory && pathname.startsWith('/admin/job-post');
    const endpoint = isStory
      ? `/stories/delete/${encodeURIComponent(slug)}`
      : `${adminJobPath ? '/admin/job-post' : '/job-post'}/delete/${encodeURIComponent(slug)}`;
    setError('');
    try {
      const response = normalizePayload(await postPublicContent(endpoint, {}));
      if (response.status === false) {
        setError(textValue(response.message) || 'Record could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Record deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Record could not be deleted.');
    }
  };

  const tableTitle = isStory
    ? pendingMode
      ? 'Pending Stories'
      : 'My Stories'
    : pendingMode
    ? 'Pending Job Posts'
    : myJobMode
    ? 'My Job Posts'
    : 'All Job Posts';

  const storyFormNode = (
    <Form
      className="public-form"
      form={storyForm}
      layout="vertical"
      requiredMark={false}
      onFinish={submitStory}
    >
      <Form.Item name="title" label="Title" rules={[{ required: true, min: 3, max: 155 }]}>
        <Input />
      </Form.Item>
      <Form.Item name="body" label="Description" rules={[{ required: true }]}>
        <RichTextInput rows={8} />
      </Form.Item>
      {editing && imageSource(current, 'thumbnail') ? (
        <div className="public-upload-preview">
          <span>Current Image</span>
          <img src={imageSource(current, 'thumbnail')} alt={cleanDisplay(current.title)} />
        </div>
      ) : null}
      <Form.Item
        name="thumbnail"
        label="Upload Image"
        valuePropName="fileList"
        getValueFromEvent={normalizeUploadEvent}
        rules={!editing ? [{ required: true, message: 'Image is required.' }] : []}
      >
        <Upload
          beforeUpload={(file) => {
            if (!isAllowedImage(file)) {
              toast.error('Image must be JPG or PNG.');
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
      {editing ? (
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'Pending', value: 0 },
              { label: 'Published', value: 1 },
            ]}
          />
        </Form.Item>
      ) : null}
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
        {editing ? 'Update' : 'Create'}
      </Button>
    </Form>
  );

  const jobFormNode = (
    <Form
      className="public-form"
      form={jobForm}
      layout="vertical"
      requiredMark={false}
      onFinish={submitJob}
    >
      <Form.Item name="title" label="Job Title" rules={[{ required: true, min: 3, max: 100 }]}>
        <Input />
      </Form.Item>
      <Form.Item name="employee_status" label="Employee Status" rules={[{ required: true }]}>
        <Select options={employeeStatusOptions} />
      </Form.Item>
      <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="location" label="Location" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="post_link" label="URL" rules={[{ required: true, type: 'url' }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="application_deadline"
        label="Application Deadline"
        rules={[{ required: true }]}
      >
        <Input placeholder="2026-05-19" />
      </Form.Item>
      <Form.Item
        name="compensation_n_benefits"
        label="Compensation & Benefits"
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="job_context" label="Job Context" rules={[{ required: true }]}>
        <RichTextInput rows={5} />
      </Form.Item>
      <Form.Item name="job_responsibility" label="Job Responsibility" rules={[{ required: true }]}>
        <RichTextInput rows={5} />
      </Form.Item>
      <Form.Item
        name="educational_requirements"
        label="Educational Requirements"
        rules={[{ required: true }]}
      >
        <RichTextInput rows={5} />
      </Form.Item>
      <Form.Item name="additional_requirements" label="Additional Requirements">
        <RichTextInput rows={5} />
      </Form.Item>
      {editing && imageSource(current, 'company_logo') ? (
        <div className="public-upload-preview">
          <span>Current Logo</span>
          <img src={imageSource(current, 'company_logo')} alt={cleanDisplay(current.title)} />
        </div>
      ) : null}
      <Form.Item
        name="company_logo"
        label="Company Logo"
        valuePropName="fileList"
        getValueFromEvent={normalizeUploadEvent}
        rules={!editing ? [{ required: true, message: 'Company logo is required.' }] : []}
      >
        <Upload
          beforeUpload={(file) => {
            if (!isAllowedImage(file)) {
              toast.error('Logo must be JPG or PNG.');
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
      {editing ? (
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={reviewStatusOptions} />
        </Form.Item>
      ) : null}
      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
        {editing ? 'Update' : 'Create'}
      </Button>
    </Form>
  );

  if (storyCreate || jobCreate) {
    return (
      <PublicShell title={storyCreate ? 'Create Story' : 'Create Job Post'}>
        {error ? (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        ) : null}
        {storyCreate ? storyFormNode : jobFormNode}
      </PublicShell>
    );
  }

  if (jobDetail) {
    return (
      <PublicShell title={cleanDisplay(current.title) || 'Job Post Details'}>
        {error ? (
          <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
        ) : null}
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Type">
            {cleanDisplay(current.employee_status_name)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">{cleanDisplay(current.status_name)}</Descriptions.Item>
          <Descriptions.Item label="Location">{cleanDisplay(current.location)}</Descriptions.Item>
          <Descriptions.Item label="Salary">{cleanDisplay(current.salary)}</Descriptions.Item>
          <Descriptions.Item label="Deadline">
            {cleanDisplay(current.application_deadline_display || current.application_deadline)}
          </Descriptions.Item>
          <Descriptions.Item label="Context">
            <RichTextDisplay value={current.job_context} />
          </Descriptions.Item>
          <Descriptions.Item label="Responsibility">
            <RichTextDisplay value={current.job_responsibility} />
          </Descriptions.Item>
          <Descriptions.Item label="Education">
            <RichTextDisplay value={current.educational_requirements} />
          </Descriptions.Item>
          <Descriptions.Item label="Benefits">
            {cleanDisplay(current.compensation_n_benefits)}
          </Descriptions.Item>
          <Descriptions.Item label="Apply">
            {textValue(current.post_link) ? (
              <Button type="primary" href={textValue(current.post_link)} target="_blank">
                Open URL
              </Button>
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      </PublicShell>
    );
  }

  return (
    <PublicShell title={tableTitle}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      {editing ? (
        <div style={{ marginBottom: 24 }}>
          <Space style={{ marginBottom: 16 }}>
            <Button onClick={() => (directInfo ? history.push(returnPath) : closeEdit())}>
              Back
            </Button>
          </Space>
          {isStory ? storyFormNode : jobFormNode}
        </div>
      ) : null}
      {!editing ? (
        <Table<LegacyRecord>
          rowKey={(record) => textValue(record.id) || textValue(record.slug)}
          loading={loading}
          dataSource={rows}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 920 }}
          title={() => (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>{tableTitle}</strong>
              <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={loadRows}>
                  Refresh
                </Button>
                {isJob ? (
                  <>
                    <Button icon={<EyeOutlined />} href="/job-post/all-job-post">
                      All
                    </Button>
                    <Button icon={<EditOutlined />} href="/job-post/my-job-post">
                      Mine
                    </Button>
                    <Button icon={<EyeOutlined />} href="/admin/job-post/pending-job-post">
                      Pending
                    </Button>
                  </>
                ) : (
                  <>
                    <Button icon={<EditOutlined />} href="/stories/list">
                      Mine
                    </Button>
                    <Button icon={<EyeOutlined />} href="/admin/stories/pending">
                      Pending
                    </Button>
                  </>
                )}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  href={isStory ? '/stories/create' : '/job-post/create'}
                >
                  Create
                </Button>
              </Space>
            </div>
          )}
          columns={[
            {
              title: isStory ? 'Image' : 'Logo',
              width: 84,
              render: (_, record) => {
                const src = imageSource(record, isStory ? 'thumbnail' : 'company_logo');
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
            ...(isJob
              ? [
                  {
                    title: 'Location',
                    render: (_: unknown, record: LegacyRecord) =>
                      cleanDisplay(record.location) || '-',
                  },
                  {
                    title: 'Deadline',
                    render: (_: unknown, record: LegacyRecord) =>
                      cleanDisplay(record.application_deadline) || '-',
                  },
                ]
              : []),
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
                    {isJob && slug ? (
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        href={`/job-post/details/${encodeURIComponent(slug)}`}
                      >
                        View
                      </Button>
                    ) : null}
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                      Edit
                    </Button>
                    <Popconfirm title="Delete this item?" onConfirm={() => deleteRecord(record)}>
                      <Button size="small" danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                );
              },
            },
          ]}
        />
      ) : null}
    </PublicShell>
  );
}
