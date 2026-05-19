import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';

type LegacyEventCategory = {
  id?: number | string;
  name?: string;
};

type LegacyEventCategoryResponse = {
  status?: boolean;
  message?: string;
  data?: LegacyEventCategory[];
  eventCategory?: LegacyEventCategory;
  item?: LegacyEventCategory;
};

type EventCategoryFormValues = {
  name?: string;
};

const endpoint = '/admin/event';

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

function directInfoIDFromPath(pathname: string) {
  const match = pathname.match(/^\/admin\/event\/info\/([^/]+)\/?$/);
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export default function AdminEventCategories() {
  const location = useLocation();
  const openedTargetRef = useRef('');
  const [form] = Form.useForm<EventCategoryFormValues>();
  const [rows, setRows] = useState<LegacyEventCategory[]>([]);
  const [current, setCurrent] = useState<LegacyEventCategory | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState('');
  const targetInfoID = useMemo(() => directInfoIDFromPath(location.pathname), [location.pathname]);

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyEventCategoryResponse>(`${endpoint}/category?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load event categories.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const openCreate = () => {
    setCurrent(undefined);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openEditByID = async (id: string, fallback?: LegacyEventCategory) => {
    if (!id) {
      return;
    }
    setError('');
    try {
      const body = await request<LegacyEventCategoryResponse>(
        `${endpoint}/info/${encodeURIComponent(id)}`,
        {
          params: { ajax: 1 },
        },
      );
      const item = body.eventCategory || body.item || fallback;
      if (!item) {
        setError('Category could not be loaded.');
        return;
      }
      setCurrent(item);
      form.setFieldsValue({ name: cleanDisplay(item.name) });
      setDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Category could not be loaded.');
    }
  };

  const openEdit = (record: LegacyEventCategory) => {
    const id = textValue(record.id);
    if (!id) {
      return;
    }
    openedTargetRef.current = id;
    history.push(`${endpoint}/info/${encodeURIComponent(id)}`);
    void openEditByID(id, record);
  };

  useEffect(() => {
    if (!targetInfoID) {
      openedTargetRef.current = '';
      return;
    }
    if (openedTargetRef.current === targetInfoID) {
      return;
    }
    openedTargetRef.current = targetInfoID;
    const loaded = rows.find((row) => textValue(row.id) === targetInfoID);
    void openEditByID(targetInfoID, loaded);
  }, [targetInfoID, rows]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
    if (targetInfoID) {
      history.replace(`${endpoint}/category`);
    }
  };

  const submit = async (values: EventCategoryFormValues) => {
    const id = textValue(current?.id);
    setSaving(true);
    setError('');
    try {
      const response = await request<LegacyEventCategoryResponse>(
        id ? `${endpoint}/update/${encodeURIComponent(id)}` : `${endpoint}/store`,
        {
          method: 'POST',
          data: { name: textValue(values.name) },
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Category could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Category saved.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Category could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (record: LegacyEventCategory) => {
    const id = textValue(record.id);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await request<LegacyEventCategoryResponse>(
        `${endpoint}/delete/${encodeURIComponent(id)}`,
        {
          method: 'POST',
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Category could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Category deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Category could not be deleted.');
    }
  };

  const columns: ColumnsType<LegacyEventCategory> = [
    {
      title: 'Name',
      render: (_, record) => cleanDisplay(record.name) || '-',
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
          <Popconfirm title="Delete this category?" onConfirm={() => deleteCategory(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Event Category">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table<LegacyEventCategory>
        rowKey={(record) => textValue(record.id)}
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 10 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>Event Categories</strong>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={loadRows}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Add New
              </Button>
            </Space>
          </div>
        )}
      />

      <Drawer
        width={420}
        title={current?.id ? 'Update New' : 'Add New'}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            {current?.id ? 'Update' : 'Save'}
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
