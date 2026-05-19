import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Checkbox,
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
import { useEffect, useMemo, useRef, useState } from 'react';

const rolesEndpoint = '/admin/roles';

type RoleRow = {
  id?: number | string;
  tenant_id?: string;
  display_name?: string;
  name?: string;
  guard_name?: string;
  status?: number | string;
};

type PermissionRow = {
  id?: number | string;
  name?: string;
  guard_name?: string;
};

type LegacyRoleResponse = {
  status?: boolean;
  message?: string;
  roles?: RoleRow[];
  items?: RoleRow[];
  data?: RoleRow[] | { role?: RoleRow };
  role?: RoleRow;
  permissions?: PermissionRow[];
  oldPermissions?: string[];
};

type RoleFormValues = {
  name?: string;
  status?: number;
  permissions?: string[];
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

function roleID(record?: RoleRow) {
  return textValue(record?.id);
}

function directEditIDFromPath(pathname: string) {
  const match = pathname.match(/\/admin\/roles\/edit\/([^/?#]+)/);
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function roleName(record?: RoleRow) {
  return cleanDisplay(record?.display_name) || cleanDisplay(record?.name) || roleID(record);
}

function statusValue(record?: RoleRow) {
  const raw = cleanDisplay(record?.status).toLowerCase();
  if (raw.includes('active') && !raw.includes('inactive')) {
    return 1;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed === 1 ? 1 : 0;
}

function normalizePermissionNames(values: unknown) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map(cleanDisplay).filter(Boolean);
}

function roleRowsFromResponse(body: LegacyRoleResponse) {
  if (Array.isArray(body.roles)) {
    return body.roles;
  }
  if (Array.isArray(body.items)) {
    return body.items;
  }
  if (Array.isArray(body.data)) {
    return body.data;
  }
  return [];
}

function roleFromEditResponse(body: LegacyRoleResponse) {
  if (body.role) {
    return body.role;
  }
  if (!Array.isArray(body.data) && body.data?.role) {
    return body.data.role;
  }
  return undefined;
}

function buildRolePayload(values: RoleFormValues) {
  return {
    name: cleanDisplay(values.name),
    status: values.status ?? 1,
    permissions: values.permissions || [],
  };
}

async function postLegacy(endpoint: string, data: Record<string, unknown>) {
  return request<LegacyRoleResponse>(endpoint, {
    method: 'POST',
    data,
  });
}

export default function AdminRoles() {
  const location = useLocation();
  const directEditID = directEditIDFromPath(location.pathname);
  const openedDirectEditRef = useRef('');
  const [form] = Form.useForm<RoleFormValues>();
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<RoleRow | undefined>();
  const [error, setError] = useState('');

  const permissionOptions = useMemo(
    () =>
      permissions
        .map((permission) => {
          const name = cleanDisplay(permission.name);
          return name ? { label: name, value: name } : undefined;
        })
        .filter(Boolean) as Array<{ label: string; value: string }>,
    [permissions],
  );

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyRoleResponse>(rolesEndpoint);
      setRows(roleRowsFromResponse(body));
      if (Array.isArray(body.permissions)) {
        setPermissions(body.permissions);
      }
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'Roles could not be loaded.');
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
    form.setFieldsValue({ status: 1, permissions: [] });
    setDrawerOpen(true);
  };

  const openEdit = async (record: RoleRow, preloadedBody?: LegacyRoleResponse) => {
    setCurrent(record);
    form.setFieldsValue({
      name: roleName(record),
      status: statusValue(record),
      permissions: [],
    });
    setDrawerOpen(true);
    const id = roleID(record);
    if (!id) {
      return;
    }
    try {
      const body =
        preloadedBody ||
        (await request<LegacyRoleResponse>(`${rolesEndpoint}/edit/${encodeURIComponent(id)}`));
      if (Array.isArray(body.permissions)) {
        setPermissions(body.permissions);
      }
      const editRole = roleFromEditResponse(body) || record;
      form.setFieldsValue({
        name: roleName(editRole),
        status: statusValue(editRole),
        permissions: normalizePermissionNames(body.oldPermissions),
      });
    } catch (err: any) {
      setError(err?.message || 'Role could not be loaded.');
    }
  };

  const openEditRoute = (record: RoleRow) => {
    const id = roleID(record);
    if (!id) {
      openEdit(record);
      return;
    }
    openedDirectEditRef.current = id;
    history.push(`${rolesEndpoint}/edit/${encodeURIComponent(id)}`);
    openEdit(record);
  };

  const openDirectEdit = async (id: string) => {
    const record = rows.find((item) => roleID(item) === id);
    if (record) {
      openEdit(record);
      return;
    }
    setError('');
    try {
      const body = await request<LegacyRoleResponse>(
        `${rolesEndpoint}/edit/${encodeURIComponent(id)}`,
      );
      if (Array.isArray(body.permissions)) {
        setPermissions(body.permissions);
      }
      const role = roleFromEditResponse(body);
      if (!role || !roleName(role)) {
        setError('Role could not be loaded.');
        return;
      }
      openEdit(role, body);
    } catch (err: any) {
      setError(err?.message || 'Role could not be loaded.');
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
      history.replace(rolesEndpoint);
    }
  };

  const submitRole = async (values: RoleFormValues) => {
    const id = roleID(current);
    setSaving(true);
    setError('');
    try {
      const response = await postLegacy(
        id ? `${rolesEndpoint}/update/${encodeURIComponent(id)}` : `${rolesEndpoint}/store`,
        buildRolePayload(values),
      );
      if (response.status === false) {
        setError(cleanDisplay(response.message) || 'Role could not be saved.');
        return;
      }
      toast.success(cleanDisplay(response.message) || 'Role saved.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Role could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (record: RoleRow) => {
    const id = roleID(record);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await postLegacy(`${rolesEndpoint}/destroy/${encodeURIComponent(id)}`, {});
      if (response.status === false) {
        setError(cleanDisplay(response.message) || 'Role could not be deleted.');
        return;
      }
      toast.success(cleanDisplay(response.message) || 'Role deleted.');
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Role could not be deleted.');
    }
  };

  const columns: ColumnsType<RoleRow> = [
    {
      title: 'Role',
      render: (_, record) => (
        <Space size={8}>
          <SafetyCertificateOutlined />
          <span>{roleName(record) || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Slug',
      render: (_, record) => cleanDisplay(record.name) || '-',
    },
    {
      title: 'Guard',
      width: 120,
      render: (_, record) => cleanDisplay(record.guard_name) || 'web',
    },
    {
      title: 'Status',
      width: 130,
      render: (_, record) =>
        statusValue(record) === 1 ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: 'Actions',
      width: 170,
      render: (_, record) => (
        <Space>
          <Button
            aria-label="Edit role"
            icon={<EditOutlined />}
            onClick={() => openEditRoute(record)}
            size="small"
          />
          <Popconfirm
            title="Delete this role?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteRole(record)}
          >
            <Button aria-label="Delete role" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Roles"
      extra={[
        <Button icon={<ReloadOutlined />} key="reload" onClick={loadRows}>
          Refresh
        </Button>,
        <Button icon={<PlusOutlined />} key="add" onClick={openCreate} type="primary">
          Add Role
        </Button>,
      ]}
    >
      {error ? <Alert message={error} showIcon style={{ marginBottom: 16 }} type="error" /> : null}

      <Table<RoleRow>
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowKey={(record, index) => roleID(record) || `role-${index}`}
      />

      <Drawer
        destroyOnClose
        onClose={closeDrawer}
        open={drawerOpen}
        title={current ? 'Edit Role' : 'Add Role'}
        width={560}
      >
        <Form<RoleFormValues>
          form={form}
          layout="vertical"
          onFinish={submitRole}
          initialValues={{ status: 1, permissions: [] }}
        >
          <Form.Item
            label="Role name"
            name="name"
            rules={[{ required: true, message: 'Role name is required.' }]}
          >
            <Input autoComplete="off" placeholder="Moderator Manager" />
          </Form.Item>

          <Form.Item label="Status" name="status" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Active', value: 1 },
                { label: 'Inactive', value: 0 },
              ]}
            />
          </Form.Item>

          <Form.Item label="Permissions" name="permissions">
            <Checkbox.Group options={permissionOptions} style={{ display: 'grid', gap: 8 }} />
          </Form.Item>

          <Space>
            <Button htmlType="submit" icon={<SaveOutlined />} loading={saving} type="primary">
              Save
            </Button>
            <Button onClick={closeDrawer}>Cancel</Button>
          </Space>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
