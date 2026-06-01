import {
  CheckOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  ReloadOutlined,
  SaveOutlined,
  StopOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { listRetailSetupRecords } from '../Setup/service';
import type { RetailSetupRecord } from '../Setup/types';
import { createStaffUser, deleteStaffUser, listStaffUsers, updateStaffUser } from './service';
import type { StaffUser, StaffUserRequest, StaffVisibility, StaffVisibilityValue } from './types';

type PermissionItem = {
  key: string;
  module: string;
  action: string;
  label: string;
};

type PermissionGroup = {
  title: string;
  items: PermissionItem[];
};

type StaffFormValues = {
  name: string;
  email: string;
  password?: string;
  branch_id?: string;
  permissions?: Record<string, boolean>;
};

type StaffFilters = {
  search?: unknown;
  email?: unknown;
  branch_id?: unknown;
  role?: unknown;
} & Record<string, unknown>;

const permission = (key: string, label: string): PermissionItem => {
  const splitAt = key.lastIndexOf('.');
  return {
    key,
    module: key.slice(0, splitAt),
    action: key.slice(splitAt + 1),
    label,
  };
};

const permissionGroups: PermissionGroup[] = [
  {
    title: 'Workspace',
    items: [
      permission('dashboard.read', 'Dashboard'),
      permission('manage-settings.read', 'Settings'),
      permission('vats.read', 'Tax setting'),
      permission('dues.read', 'Due list'),
    ],
  },
  {
    title: 'Sales',
    items: [
      permission('sales.create', 'retail sale'),
      permission('inventory.create', 'Inventory sale'),
      permission('sales.read', 'Sales list'),
      permission('sale-returns.read', 'Sale returns'),
    ],
  },
  {
    title: 'Purchases',
    items: [
      permission('purchases.create', 'Add purchase'),
      permission('purchases.read', 'Purchase list'),
      permission('purchase-returns.read', 'Purchase returns'),
    ],
  },
  {
    title: 'Products',
    items: [
      permission('products.read', 'All products'),
      permission('products.create', 'Add product'),
      permission('products-expired.read', 'Expired products'),
      permission('barcodes.read', 'Print labels'),
      permission('bulk-uploads.read', 'Bulk upload'),
    ],
  },
  {
    title: 'Setup',
    items: [
      permission('categories.read', 'Categories'),
      permission('brands.read', 'Brands'),
      permission('product-models.read', 'Models'),
      permission('variations.read', 'Variations'),
      permission('units.read', 'Units'),
      permission('racks.read', 'Racks'),
      permission('shelfs.read', 'Shelfs'),
    ],
  },
  {
    title: 'Stock',
    items: [
      permission('stocks.read', 'Stock list'),
      permission('expired-products.read', 'Expired stock'),
    ],
  },
  {
    title: 'Parties',
    items: [
      permission('parties.read', 'Customers and suppliers'),
      permission('parties.create', 'Add parties'),
    ],
  },
  {
    title: 'Finance',
    items: [
      permission('banks.read', 'Bank accounts'),
      permission('cashes.read', 'Cash in hand'),
      permission('cheques.read', 'Cheques'),
      permission('transactions.read', 'Transactions'),
      permission('loss-profit-history.read', 'Profit and loss'),
      permission('day-book-reports.read', 'Day book'),
      permission('cash-flow-reports.read', 'Cash flow'),
      permission('incomes.read', 'Income'),
      permission('income-categories.read', 'Income categories'),
      permission('expenses.read', 'Expenses'),
      permission('expense-categories.read', 'Expense categories'),
    ],
  },
  {
    title: 'Reports',
    items: [
      permission('sale-reports.read', 'Sale report'),
      permission('sale-return-reports.read', 'Sale return report'),
      permission('purchase-reports.read', 'Purchase report'),
      permission('purchase-return-reports.read', 'Purchase return report'),
      permission('vat-reports.read', 'Tax report'),
      permission('income-reports.read', 'Income report'),
      permission('expense-reports.read', 'Expense report'),
      permission('stock-reports.read', 'Stock report'),
      permission('due-reports.read', 'Customer due'),
      permission('supplier-due-reports.read', 'Supplier due'),
      permission('bill-wise-profits.read', 'Bill-wise profit'),
      permission('product-loss-profit-reports.read', 'Product profit'),
      permission('transaction-history-reports.read', 'Due transactions'),
      permission('top-customers-reports.read', 'Top customers'),
      permission('top-suppliers-reports.read', 'Top suppliers'),
      permission('top-product-reports.read', 'Top products'),
      permission('combo-product-reports.read', 'Combo product'),
      permission('discount-product-reports.read', 'Discount product'),
      permission('product-purchase-reports.read', 'Product purchase'),
      permission('product-sale-reports.read', 'Product sale'),
      permission('expired-product-reports.read', 'Expired product'),
      permission('loss-profit-history-reports.read', 'Loss profit history'),
      permission('product-sale-history-reports.read', 'Product sale history'),
      permission('product-purchase-history-reports.read', 'Product purchase history'),
      permission('customer-ledger.read', 'Customer ledger'),
      permission('supplier-ledger.read', 'Supplier ledger'),
      permission('party-loss-profit.read', 'Party profit and loss'),
    ],
  },
];

const allPermissionItems = permissionGroups.flatMap((group) => group.items);
const allPermissionKeys = allPermissionItems.map((item) => item.key);

const enabledValue = (value?: StaffVisibilityValue) =>
  value === true || value === 1 || value === '1' || value === 'true';

const visibilityEnabled = (visibility: StaffVisibility | undefined, item: PermissionItem) =>
  enabledValue(visibility?.[item.module]?.[item.action]);

const visibilityToForm = (visibility?: StaffVisibility) =>
  allPermissionItems.reduce<Record<string, boolean>>((values, item) => {
    values[item.key] = visibilityEnabled(visibility, item);
    return values;
  }, {});

const cloneVisibility = (visibility?: StaffVisibility) => {
  const next: StaffVisibility = {};
  Object.entries(visibility ?? {}).forEach(([moduleName, actions]) => {
    if (!actions || typeof actions !== 'object' || Array.isArray(actions)) {
      return;
    }
    next[moduleName] = { ...actions };
  });
  return next;
};

const formToVisibility = (
  permissions: Record<string, boolean> | undefined,
  existing?: StaffVisibility,
) => {
  const next = cloneVisibility(existing);
  allPermissionItems.forEach((item) => {
    if (!next[item.module]) {
      next[item.module] = {};
    }
    next[item.module][item.action] = permissions?.[item.key] ? '1' : '0';
  });
  return next;
};

const permissionCount = (visibility?: StaffVisibility) =>
  allPermissionItems.reduce(
    (total, item) => total + (visibilityEnabled(visibility, item) ? 1 : 0),
    0,
  );

const valueText = (value?: unknown) => String(value ?? '').trim();

const branchLabel = (record: StaffUser) =>
  record.branch?.name || record.branch?.id || record.branch_id || record.active_branch_id || '-';

const setupBranchLabel = (record?: RetailSetupRecord) =>
  record?.label || record?.name || record?.code || record?.id || '-';

const primaryRole = (record: StaffUser) => record.role || record.roles?.[0]?.name || 'staff';

const matchesText = (text: string, query: string) => text.toLowerCase().includes(query);

const filterStaffUsers = (items: StaffUser[], filters: StaffFilters) => {
  const search = valueText(filters.search).toLowerCase();
  const email = valueText(filters.email).toLowerCase();
  const branch = valueText(filters.branch_id).toLowerCase();
  const role = valueText(filters.role).toLowerCase();

  return items.filter((item) => {
    const itemRole = primaryRole(item).toLowerCase();
    const itemBranch = branchLabel(item).toLowerCase();
    const haystack = [item.name, item.email, itemRole, itemBranch]
      .map(valueText)
      .join(' ')
      .toLowerCase();

    if (search && !haystack.includes(search)) {
      return false;
    }
    if (email && !matchesText(valueText(item.email), email)) {
      return false;
    }
    if (branch && !matchesText(itemBranch, branch)) {
      return false;
    }
    if (role && itemRole !== role) {
      return false;
    }
    return true;
  });
};

const StaffUsersPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<StaffFormValues>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser>();
  const [submitting, setSubmitting] = useState(false);
  const [staffCount, setStaffCount] = useState(0);
  const [branches, setBranches] = useState<RetailSetupRecord[]>([]);

  const permissionKeySet = useMemo(() => new Set(allPermissionKeys), []);
  const branchOptions = useMemo(
    () =>
      branches.map((branch) => ({
        value: branch.id,
        label: setupBranchLabel(branch),
      })),
    [branches],
  );
  const branchNameByID = useMemo(
    () => new Map(branches.map((branch) => [branch.id, setupBranchLabel(branch)])),
    [branches],
  );

  useEffect(() => {
    let active = true;
    listRetailSetupRecords('branches', { status: 'active' })
      .then((resp) => {
        if (active) {
          setBranches(resp.data ?? []);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const staffBranchLabel = (record: StaffUser) => {
    const branchID = record.branch_id || record.active_branch_id;
    return (branchID && branchNameByID.get(branchID)) || branchLabel(record);
  };

  const openEditor = (record?: StaffUser) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      name: record?.name,
      email: record?.email,
      password: undefined,
      branch_id: record?.branch_id || record?.active_branch_id,
      permissions: visibilityToForm(record?.visibility),
    });
    setDrawerOpen(true);
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    setEditing(undefined);
    form.resetFields();
  };

  const setEveryPermission = (checked: boolean) => {
    const current = form.getFieldValue('permissions') || {};
    const permissions = { ...current };
    allPermissionKeys.forEach((key) => {
      permissions[key] = checked;
    });
    form.setFieldsValue({ permissions });
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const payload: StaffUserRequest = {
        name: values.name.trim(),
        email: values.email.trim(),
        branch_id: values.branch_id?.trim() || undefined,
        visibility: formToVisibility(values.permissions, editing?.visibility),
      };
      if (values.password) {
        payload.password = values.password;
      }

      if (editing?.id) {
        const resp = await updateStaffUser(editing.id, payload);
        message.success(resp.message || 'Staff user updated');
      } else {
        const resp = await createStaffUser(payload);
        message.success(resp.message || 'Staff user created');
      }
      closeEditor();
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<StaffUser>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, record) => <a onClick={() => openEditor(record)}>{record.name || '-'}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
      width: 220,
    },
    {
      title: 'Branch',
      dataIndex: 'branch_id',
      width: 160,
      valueType: 'select',
      fieldProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        options: branchOptions,
      },
      render: (_, record) => staffBranchLabel(record),
    },
    {
      title: 'Permissions',
      dataIndex: 'visibility',
      search: false,
      width: 150,
      render: (_, record) => {
        const count = permissionCount(record.visibility);
        return (
          <Tag color={count > 0 ? 'blue' : 'default'}>
            {count}/{allPermissionItems.length}
          </Tag>
        );
      },
    },
    {
      title: 'Role',
      dataIndex: 'role',
      valueEnum: {
        staff: { text: 'Staff' },
      },
      width: 120,
      render: (_, record) => <Tag>{primaryRole(record).toUpperCase()}</Tag>,
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Tooltip key="edit" title="Edit">
          <Button type="link" icon={<EditOutlined />} onClick={() => openEditor(record)} />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="Delete staff user?"
          onConfirm={async () => {
            const resp = await deleteStaffUser(record.id);
            message.success(resp.message || 'Staff user deleted');
            actionRef.current?.reload();
          }}
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<StaffUser>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listStaffUsers();
          const items = resp.data || [];
          const filtered = filterStaffUsers(items, params);
          setStaffCount(items.length);
          return {
            data: filtered.slice((current - 1) * pageSize, current * pageSize),
            total: filtered.length,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Statistic key="staff" title="Staff users" value={staffCount} />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
          <Button key="new" type="primary" icon={<UserAddOutlined />} onClick={() => openEditor()}>
            New staff user
          </Button>,
        ]}
      />

      <Drawer
        width={980}
        open={drawerOpen}
        title={editing ? 'Edit staff user' : 'New staff user'}
        onClose={closeEditor}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeEditor}>Cancel</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={submitting} onClick={submit}>
              Save
            </Button>
          </Space>
        }
      >
        <Form<StaffFormValues> form={form} layout="vertical" requiredMark={false}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  { required: true, message: 'Name is required' },
                  { max: 30, message: 'Name cannot exceed 30 characters' },
                ]}
              >
                <Input prefix={<UserOutlined />} maxLength={30} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: !editing, message: 'Password is required' },
                  { min: 4, message: 'Password must be at least 4 characters' },
                  { max: 15, message: 'Password cannot exceed 15 characters' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} maxLength={15} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="branch_id"
                label="Assigned branch"
                rules={[{ max: 100, message: 'Branch ref cannot exceed 100 characters' }]}
              >
                <Select allowClear showSearch optionFilterProp="label" options={branchOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Permissions
            </Typography.Title>
            <Space>
              <Button icon={<CheckSquareOutlined />} onClick={() => setEveryPermission(true)}>
                Full access
              </Button>
              <Button icon={<StopOutlined />} onClick={() => setEveryPermission(false)}>
                Clear
              </Button>
            </Space>
          </Space>

          {permissionGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 22 }}>
              <Space style={{ marginBottom: 10 }}>
                <Typography.Text strong>{group.title}</Typography.Text>
                <Tag>{group.items.length}</Tag>
              </Space>
              <Row gutter={[12, 12]}>
                {group.items.map((item) => (
                  <Col key={item.key} xs={24} sm={12} lg={8}>
                    <div
                      style={{
                        minHeight: 72,
                        border: '1px solid #f0f0f0',
                        borderRadius: 8,
                        padding: '12px 14px',
                      }}
                    >
                      <Space
                        align="start"
                        style={{ width: '100%', justifyContent: 'space-between' }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <Typography.Text>{item.label}</Typography.Text>
                          <br />
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {item.key}
                          </Typography.Text>
                        </div>
                        <Form.Item name={['permissions', item.key]} valuePropName="checked" noStyle>
                          <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                          />
                        </Form.Item>
                      </Space>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ))}

          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const values = getFieldValue('permissions') || {};
              const enabled = Object.entries(values).filter(
                ([key, value]) => permissionKeySet.has(key) && value,
              ).length;
              return (
                <Tag color={enabled > 0 ? 'blue' : 'default'}>
                  {enabled}/{allPermissionItems.length} enabled
                </Tag>
              );
            }}
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default StaffUsersPage;
