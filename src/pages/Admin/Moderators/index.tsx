import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  TeamOutlined,
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
  Select,
  Space,
  Table,
  Tag,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';

const moderatorEndpoint = '/admin/moderators';

type Moderator = {
  id?: number | string;
  name?: string;
  email?: string;
  mobile?: string;
  roles?: string;
  status?: string | number;
};

type ModeratorRole = {
  id?: number | string;
  name?: string;
  display_name?: string;
  status?: string | number;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  roles?: ModeratorRole[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type ModeratorFormValues = {
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  status?: number;
  roles?: Array<number | string>;
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

function statusValue(record?: Moderator) {
  const raw = cleanDisplay(record?.status).toLowerCase();
  if (raw.includes('active') && !raw.includes('inactive')) {
    return 1;
  }
  return numericValue(record?.status) === 1 ? 1 : 0;
}

function directEditIDFromPath(pathname: string) {
  const match = pathname.match(/\/admin\/moderators\/edit\/([^/?#]+)/);
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function legacyHTMLInputValue(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const field = doc.querySelector(`[name="${name}"]`) as HTMLInputElement | null;
    return textValue(field?.value);
  }
  const input = html.match(new RegExp(`<input[^>]*name=["']${name}["'][^>]*>`, 'i'))?.[0] || '';
  return input.match(/\bvalue=["']([^"']*)["']/i)?.[1] || '';
}

function selectedOptionValue(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const field = doc.querySelector(`[name="${name}"]`) as HTMLSelectElement | null;
    return textValue(field?.value);
  }
  const select =
    html.match(new RegExp(`<select[^>]*name=["']${name}["'][\\s\\S]*?<\\/select>`, 'i'))?.[0] || '';
  return select.match(/<option[^>]*value=["']?([^"'\s>]+)["']?[^>]*selected[^>]*>/i)?.[1] || '';
}

function parseSelectedRoleIDs(html: string) {
  const selected: string[] = [];
  const select = html.match(/<select[^>]*name=["']roles\[\]["'][\s\S]*?<\/select>/i)?.[0] || '';
  const optionPattern = /<option[^>]*value=["']?([^"'\s>]+)["']?[^>]*selected[^>]*>/gi;
  let option = optionPattern.exec(select);
  while (option) {
    selected.push(option[1]);
    option = optionPattern.exec(select);
  }
  return selected;
}

function moderatorFromEditHTML(html: string, fallbackID: string): Moderator | undefined {
  const id = legacyHTMLInputValue(html, 'id') || fallbackID;
  const name = legacyHTMLInputValue(html, 'name');
  const email = legacyHTMLInputValue(html, 'email');
  const mobile = legacyHTMLInputValue(html, 'mobile');
  const status = selectedOptionValue(html, 'status') || 1;
  if (!name && !email) {
    return undefined;
  }
  return { id, name, email, mobile, status };
}

function buildModeratorPayload(values: ModeratorFormValues, current?: Moderator) {
  const payload: Record<string, unknown> = {
    name: textValue(values.name),
    email: textValue(values.email),
    mobile: textValue(values.mobile),
    status: values.status ?? 1,
    roles: (values.roles || []).map(textValue).join(','),
  };
  if (!current || textValue(values.password)) {
    payload.password = textValue(values.password);
  }
  return payload;
}

async function postLegacy(endpoint: string, data: Record<string, unknown>) {
  return request<LegacyTableResponse<Moderator>>(endpoint, {
    method: 'POST',
    data,
  });
}

export default function AdminModerators() {
  const location = useLocation();
  const directEditID = directEditIDFromPath(location.pathname);
  const openedDirectEditRef = useRef('');
  const [form] = Form.useForm<ModeratorFormValues>();
  const [rows, setRows] = useState<Moderator[]>([]);
  const [roles, setRoles] = useState<ModeratorRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<Moderator | undefined>();
  const [error, setError] = useState('');

  const roleOptions = roles.map((role) => ({
    label: cleanDisplay(role.display_name) || cleanDisplay(role.name) || textValue(role.id),
    value: textValue(role.id),
  }));

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<Moderator>>(`${moderatorEndpoint}?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load moderators.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const body = await request<LegacyTableResponse<Moderator>>(moderatorEndpoint, {
        headers: { Accept: 'text/plain' },
      });
      setRoles(Array.isArray(body.roles) ? body.roles : []);
    } catch {
      setRoles([]);
    }
  };

  useEffect(() => {
    loadRows();
    loadRoles();
  }, []);

  const openCreate = () => {
    setCurrent(undefined);
    form.resetFields();
    form.setFieldsValue({ status: 1, roles: [] });
    setDrawerOpen(true);
  };

  const openEdit = async (record: Moderator) => {
    setCurrent(record);
    form.setFieldsValue({
      name: cleanDisplay(record.name),
      email: cleanDisplay(record.email),
      mobile: cleanDisplay(record.mobile),
      password: '',
      status: statusValue(record),
      roles: [],
    });
    setDrawerOpen(true);
    const id = textValue(record.id);
    if (!id) {
      return;
    }
    try {
      const html = await request<string>(`${moderatorEndpoint}/edit/${encodeURIComponent(id)}`, {
        responseType: 'text',
      });
      form.setFieldsValue({ roles: parseSelectedRoleIDs(textValue(html)) });
    } catch {
      form.setFieldsValue({ roles: [] });
    }
  };

  const openEditRoute = (record: Moderator) => {
    const id = textValue(record.id);
    if (!id) {
      openEdit(record);
      return;
    }
    openedDirectEditRef.current = id;
    history.push(`${moderatorEndpoint}/edit/${encodeURIComponent(id)}`);
    openEdit(record);
  };

  const openDirectEdit = async (id: string) => {
    const record = rows.find((item) => textValue(item.id) === id);
    if (record) {
      openEdit(record);
      return;
    }
    setError('');
    try {
      const html = await request<string>(`${moderatorEndpoint}/edit/${encodeURIComponent(id)}`, {
        responseType: 'text',
      });
      const item = moderatorFromEditHTML(textValue(html), id);
      if (!item) {
        setError('Moderator could not be loaded.');
        return;
      }
      openEdit(item);
    } catch (err: any) {
      setError(err?.message || 'Moderator could not be loaded.');
    }
  };

  useEffect(() => {
    if (!directEditID) {
      openedDirectEditRef.current = '';
      return;
    }
    if (loading) {
      return;
    }
    if (openedDirectEditRef.current === directEditID) {
      return;
    }
    openedDirectEditRef.current = directEditID;
    openDirectEdit(directEditID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directEditID, loading, rows]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
    if (directEditID) {
      history.replace(moderatorEndpoint);
    }
  };

  const submitModerator = async (values: ModeratorFormValues) => {
    const id = textValue(current?.id);
    setSaving(true);
    setError('');
    try {
      const response = await postLegacy(
        id ? `${moderatorEndpoint}/update/${encodeURIComponent(id)}` : `${moderatorEndpoint}/store`,
        buildModeratorPayload(values, current),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Moderator could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Moderator saved.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Moderator could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteModerator = async (record: Moderator) => {
    const id = textValue(record.id);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await postLegacy(
        `${moderatorEndpoint}/delete/${encodeURIComponent(id)}`,
        {},
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Moderator could not be deleted.');
        return;
      }
      toast.success(textValue(response.message) || 'Moderator deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Moderator could not be deleted.');
    }
  };

  const columns: ColumnsType<Moderator> = [
    {
      title: 'Name',
      render: (_, record) => cleanDisplay(record.name) || '-',
    },
    {
      title: 'Email',
      render: (_, record) => cleanDisplay(record.email) || '-',
    },
    {
      title: 'Mobile',
      width: 140,
      render: (_, record) => cleanDisplay(record.mobile) || '-',
    },
    {
      title: 'Roles',
      render: (_, record) => cleanDisplay(record.roles) || '-',
    },
    {
      title: 'Status',
      width: 120,
      render: (_, record) => (
        <Tag color={statusValue(record) === 1 ? 'green' : 'gold'}>
          {statusValue(record) === 1 ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEditRoute(record)}>
            Edit
          </Button>
          <Popconfirm title="Delete this moderator?" onConfirm={() => deleteModerator(record)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table<Moderator>
        rowKey={(record) => textValue(record.id)}
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 820 }}
        title={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <strong>Moderators</strong>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  loadRows();
                  loadRoles();
                }}
              >
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                New
              </Button>
            </Space>
          </div>
        )}
      />

      <Drawer
        width={520}
        title={current ? 'Edit Moderator' : 'New Moderator'}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={submitModerator}
          initialValues={{ status: 1, roles: [] }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input prefix={<TeamOutlined />} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={current ? 'New Password' : 'Password'}
            rules={current ? [] : [{ required: true, message: 'Password is required.' }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Active', value: 1 },
                { label: 'Inactive', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="roles" label="Roles" rules={[{ required: true }]}>
            <Select mode="multiple" options={roleOptions} showSearch optionFilterProp="label" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            {current ? 'Update' : 'Create'}
          </Button>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
