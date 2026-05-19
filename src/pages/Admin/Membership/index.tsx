import {
  DeleteOutlined,
  EditOutlined,
  IdcardOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request, useLocation, useParams } from '@umijs/max';
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
  Tabs,
  Tag,
  Upload,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import { useEffect, useRef, useState } from 'react';

type MembershipPlan = {
  id?: number | string;
  title?: string;
  slug?: string;
  badge?: string | number;
  price?: string | number;
  duration?: string | number;
  duration_type?: string | number;
  status?: string | number;
};

type MembershipMember = {
  id?: number | string;
  name?: string;
  planName?: string;
  expired_date?: string;
  status?: string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type MembershipFormValues = {
  title?: string;
  price?: number;
  duration_type?: number;
  duration?: number;
  status?: number;
  badge?: UploadFile[];
};

type MembershipTab = 'plans' | 'members';

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

function inputValue(html: string, name: string) {
  const match = html.match(new RegExp(`<input[^>]*name=["']${name}["'][^>]*>`, 'i'))?.[0] || '';
  return match.match(/\bvalue=["']([^"']*)["']/i)?.[1] || '';
}

function selectedOptionValue(html: string, name: string) {
  const select =
    html.match(new RegExp(`<select[^>]*name=["']${name}["'][\\s\\S]*?<\\/select>`, 'i'))?.[0] || '';
  return (
    select.match(/<option[^>]*selected[^>]*value=["']?([^"'\s>]+)["']?/i)?.[1] ||
    select.match(/<option[^>]*value=["']?([^"'\s>]+)["']?/i)?.[1] ||
    ''
  );
}

function membershipFromEditHTML(html: string, fallbackSlug: string): MembershipPlan {
  return {
    slug: inputValue(html, 'slug') || fallbackSlug,
    title: inputValue(html, 'title'),
    price: inputValue(html, 'price'),
    duration: inputValue(html, 'duration'),
    duration_type: selectedOptionValue(html, 'duration_type'),
    status: selectedOptionValue(html, 'status'),
    badge: extractImageSrc(html),
  };
}

function tabFromPath(pathname: string): MembershipTab {
  return pathname.includes('/admin/membership/list') ? 'members' : 'plans';
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

function statusValue(record?: MembershipPlan) {
  const raw = cleanDisplay(record?.status).toLowerCase();
  if (raw.includes('active') && !raw.includes('deactivate')) {
    return 1;
  }
  const parsed = numericValue(record?.status);
  return parsed === 1 ? 1 : 0;
}

function durationLabel(record: MembershipPlan) {
  return cleanDisplay(record.duration) || '-';
}

function buildMembershipFormData(values: MembershipFormValues) {
  const formData = new FormData();
  formData.append('title', textValue(values.title));
  formData.append('price', String(values.price ?? 0));
  formData.append('duration_type', String(values.duration_type ?? 2));
  formData.append('duration', String(values.duration ?? 1));
  formData.append('status', String(values.status ?? 1));
  const badge = selectedFile(values.badge);
  if (badge) {
    formData.append('badge', badge);
  }
  return formData;
}

async function mutateMembership(endpoint: string, values: MembershipFormValues) {
  return request<LegacyTableResponse<MembershipPlan>>(endpoint, {
    method: 'POST',
    data: buildMembershipFormData(values),
  });
}

async function postLegacy(endpoint: string, data: Record<string, unknown>) {
  return request<LegacyTableResponse<MembershipPlan>>(endpoint, {
    method: 'POST',
    data,
  });
}

export default function AdminMembershipPlans() {
  const location = useLocation();
  const params = useParams();
  const [form] = Form.useForm<MembershipFormValues>();
  const [activeTab, setActiveTab] = useState<MembershipTab>(tabFromPath(location.pathname));
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [members, setMembers] = useState<MembershipMember[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<MembershipPlan | undefined>();
  const [error, setError] = useState('');
  const openedSlugRef = useRef('');

  const directEditSlug = textValue(params.slug);

  const loadPlans = async () => {
    setLoadingPlans(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<MembershipPlan>>(
        '/admin/membership/index?ajax=1',
      );
      setPlans(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load membership plans.');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const body = await request<LegacyTableResponse<MembershipMember>>(
        '/admin/membership/list?ajax=1',
      );
      setMembers(Array.isArray(body.data) ? body.data : []);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadMembers();
  }, []);

  useEffect(() => {
    setActiveTab(tabFromPath(location.pathname));
  }, [location.pathname]);

  const openCreate = () => {
    setCurrent(undefined);
    form.resetFields();
    form.setFieldsValue({ duration_type: 2, duration: 1, status: 1, badge: [] });
    setDrawerOpen(true);
  };

  const openEdit = (record: MembershipPlan) => {
    setCurrent(record);
    form.setFieldsValue({
      title: cleanDisplay(record.title),
      price: numericValue(record.price),
      duration_type: numericValue(record.duration_type) || 2,
      duration: numericValue(record.duration) || 1,
      status: statusValue(record),
      badge: [],
    });
    setDrawerOpen(true);
  };

  const openEditBySlug = async (slug: string) => {
    const record = plans.find((item) => textValue(item.slug) === slug);
    if (record) {
      openEdit(record);
      return;
    }
    setError('');
    try {
      const html = await request<string>(`/admin/membership/edit/${encodeURIComponent(slug)}`, {
        responseType: 'text',
      });
      const item = membershipFromEditHTML(textValue(html), slug);
      if (!textValue(item.title)) {
        setError('Membership plan could not be loaded.');
        return;
      }
      openEdit(item);
    } catch (err: any) {
      setError(err?.message || 'Membership plan could not be loaded.');
    }
  };

  useEffect(() => {
    if (!directEditSlug || openedSlugRef.current === directEditSlug) {
      return;
    }
    openedSlugRef.current = directEditSlug;
    setActiveTab('plans');
    openEditBySlug(directEditSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directEditSlug, plans]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
  };

  const submitPlan = async (values: MembershipFormValues) => {
    setSaving(true);
    setError('');
    try {
      const slug = textValue(current?.slug);
      const response = await mutateMembership(
        slug ? `/admin/membership/update/${encodeURIComponent(slug)}` : '/admin/membership/store',
        values,
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Membership plan could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Membership plan saved.');
      closeDrawer();
      await loadPlans();
    } catch (err: any) {
      setError(err?.message || 'Membership plan could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (record: MembershipPlan) => {
    const id = textValue(record.id);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await postLegacy(`/admin/membership/delete/${encodeURIComponent(id)}`, {});
      if (response.status === false) {
        setError(textValue(response.message) || 'Membership plan could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Membership plan deleted.');
      await loadPlans();
      await loadMembers();
    } catch (err: any) {
      setError(err?.message || 'Membership plan could not be deleted.');
    }
  };

  const planColumns: ColumnsType<MembershipPlan> = [
    {
      title: 'Badge',
      width: 82,
      render: (_, record) => {
        const src = extractImageSrc(record.badge);
        return src ? (
          <Image width={36} height={36} src={src} preview={false} />
        ) : (
          <IdcardOutlined />
        );
      },
    },
    {
      title: 'Title',
      render: (_, record) => cleanDisplay(record.title) || '-',
    },
    {
      title: 'Price',
      width: 120,
      render: (_, record) => cleanDisplay(record.price) || '0.00',
    },
    {
      title: 'Duration',
      width: 150,
      render: (_, record) => durationLabel(record),
    },
    {
      title: 'Status',
      width: 120,
      render: (_, record) => (
        <Tag color={statusValue(record) === 1 ? 'green' : 'gold'}>
          {statusValue(record) === 1 ? 'Active' : 'Deactivate'}
        </Tag>
      ),
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
          <Popconfirm title="Delete this plan?" onConfirm={() => deletePlan(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const memberColumns: ColumnsType<MembershipMember> = [
    {
      title: 'Member',
      render: (_, record) => cleanDisplay(record.name) || '-',
    },
    {
      title: 'Plan',
      render: (_, record) => cleanDisplay(record.planName) || '-',
    },
    {
      title: 'Expires',
      render: (_, record) => cleanDisplay(record.expired_date) || '-',
    },
    {
      title: 'Status',
      render: (_, record) => <span>{cleanDisplay(record.status) || '-'}</span>,
    },
  ];

  return (
    <PageContainer>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as MembershipTab)}
        items={[
          {
            key: 'plans',
            label: 'Plans',
            children: (
              <Table<MembershipPlan>
                rowKey={(record) => textValue(record.id) || textValue(record.slug)}
                loading={loadingPlans}
                dataSource={plans}
                columns={planColumns}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 760 }}
                title={() => (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <strong>Membership Plans</strong>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                      New
                    </Button>
                  </div>
                )}
              />
            ),
          },
          {
            key: 'members',
            label: 'Members',
            children: (
              <Table<MembershipMember>
                rowKey={(record) => textValue(record.id)}
                loading={loadingMembers}
                dataSource={members}
                columns={memberColumns}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
        ]}
      />

      <Drawer
        width={520}
        title={current ? 'Edit Membership Plan' : 'New Membership Plan'}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={submitPlan}
          initialValues={{ duration_type: 2, duration: 1, status: 1, badge: [] }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true, min: 3 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration_type" label="Duration Type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Day', value: 1 },
                { label: 'Month', value: 2 },
                { label: 'Year', value: 3 },
              ]}
            />
          </Form.Item>
          <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Active', value: 1 },
                { label: 'Deactivate', value: 0 },
              ]}
            />
          </Form.Item>
          {current ? (
            <Alert
              type="info"
              showIcon
              message="Choose a new badge only when replacing the existing badge."
              style={{ marginBottom: 16 }}
            />
          ) : null}
          <Form.Item
            name="badge"
            label="Badge"
            valuePropName="fileList"
            getValueFromEvent={normalizeUploadEvent}
            rules={current ? [] : [{ required: true, message: 'Badge is required.' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            >
              <Button icon={<UploadOutlined />}>Choose badge</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            {current ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
