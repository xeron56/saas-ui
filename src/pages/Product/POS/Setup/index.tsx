import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  createPOSSetupRecord,
  deletePOSSetupRecord,
  listPOSSetupRecords,
  updatePOSSetupRecord,
} from './service';
import type { POSSetupKind, POSSetupRecord } from './types';

type SetupConfig = {
  kind: POSSetupKind;
  label: string;
  code?: boolean;
  categoryFlags?: boolean;
  vat?: boolean;
  paymentType?: boolean;
  branch?: boolean;
  warehouse?: boolean;
  variation?: boolean;
  rack?: boolean;
};

const setupName = (record?: POSSetupRecord) =>
  record?.name ??
  record?.label ??
  record?.unitName ??
  record?.brandName ??
  record?.categoryName ??
  '';

const setupStatus = (record?: POSSetupRecord) =>
  record?.active === true || record?.status === true || record?.status === 1;

const statusTag = (record?: POSSetupRecord) => (
  <Tag color={setupStatus(record) ? 'green' : 'default'}>
    {setupStatus(record) ? 'Active' : 'Inactive'}
  </Tag>
);

const asTags = (value?: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const subVatIDs = (record?: POSSetupRecord) =>
  (record?.sub_vat ?? []).map((item) => item.id).filter(Boolean);

const shelfIDs = (record?: POSSetupRecord) =>
  (record?.shelves ?? []).map((item) => item.id).filter(Boolean);

const branchOptionLabel = (record?: POSSetupRecord) =>
  record?.name ??
  record?.label ??
  record?.branch?.name ??
  record?.branch?.label ??
  record?.id ??
  '';

const matchesStatus = (record: POSSetupRecord, status?: string) => {
  if (!status) {
    return true;
  }
  return status === 'active' ? setupStatus(record) : !setupStatus(record);
};

const filterRecords = (items: POSSetupRecord[], keyword?: string, status?: string) => {
  const query = (keyword ?? '').trim().toLowerCase();
  return items.filter(
    (item) =>
      matchesStatus(item, status) &&
      (!query ||
        [setupName(item), item.code]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))),
  );
};

const POSSetupTable: React.FC<{ config: SetupConfig }> = ({ config }) => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<POSSetupRecord>();
  const [submitting, setSubmitting] = useState(false);
  const [vatOptions, setVatOptions] = useState<POSSetupRecord[]>([]);
  const [shelfOptions, setShelfOptions] = useState<POSSetupRecord[]>([]);
  const [branchOptions, setBranchOptions] = useState<POSSetupRecord[]>([]);

  const loadAuxiliary = async () => {
    if (config.vat) {
      const resp = await listPOSSetupRecords('vats', { type: 'single' });
      setVatOptions(resp.data ?? []);
    }
    if (config.rack) {
      const resp = await listPOSSetupRecords('shelves');
      setShelfOptions(resp.data ?? []);
    }
    if (config.warehouse || config.paymentType) {
      const resp = await listPOSSetupRecords('branches', { status: 'active' });
      setBranchOptions(resp.data ?? []);
    }
  };

  useEffect(() => {
    loadAuxiliary();
  }, [config.kind]);

  const openEditor = (record?: POSSetupRecord) => {
    setEditing(record);
    const isVatGroup = !!record?.sub_vat?.length;
    form.setFieldsValue({
      name: setupName(record),
      code: record?.code,
      status: record ? setupStatus(record) : true,
      variationCapacity: !!record?.variationCapacity,
      variationColor: !!record?.variationColor,
      variationSize: !!record?.variationSize,
      variationType: !!record?.variationType,
      variationWeight: !!record?.variationWeight,
      vat_mode: isVatGroup ? 'group' : 'single',
      rate: record?.rate,
      branch_id: record?.branch_id,
      phone: record?.phone,
      email: record?.email,
      address: record?.address,
      description: record?.description,
      is_main: record?.is_main,
      opening_balance: record?.opening_balance,
      current_balance: record?.current_balance,
      branchOpeningBalance: record?.branchOpeningBalance ?? record?.opening_balance,
      branchRemainingBalance: record?.branchRemainingBalance ?? record?.current_balance,
      opening_date: record?.opening_date,
      show_on_invoice: record?.show_on_invoice ?? record?.show_in_invoice ?? true,
      vat_ids: subVatIDs(record),
      values: asTags(record?.values),
      shelf_id: shelfIDs(record),
    });
    setModalOpen(true);
  };

  const buildPayload = (values: Record<string, any>) => {
    const payload: Record<string, any> = {
      name: values.name,
      status: values.status,
    };
    if (config.code) {
      payload.code = values.code;
    }
    if (config.categoryFlags) {
      payload.variationCapacity = values.variationCapacity;
      payload.variationColor = values.variationColor;
      payload.variationSize = values.variationSize;
      payload.variationType = values.variationType;
      payload.variationWeight = values.variationWeight;
    }
    if (config.vat) {
      if (values.vat_mode === 'group') {
        payload.vat_ids = values.vat_ids ?? [];
      } else {
        payload.rate = values.rate;
      }
    }
    if (config.paymentType) {
      payload.branch_id = values.branch_id;
      payload.opening_balance = values.opening_balance;
      payload.opening_date = values.opening_date;
      payload.show_on_invoice = values.show_on_invoice;
    }
    if (config.branch) {
      payload.code = values.code;
      payload.phone = values.phone;
      payload.email = values.email;
      payload.address = values.address;
      payload.description = values.description;
      payload.is_main = values.is_main;
      payload.branchOpeningBalance = values.branchOpeningBalance;
      payload.branchRemainingBalance = values.branchRemainingBalance;
    }
    if (config.warehouse) {
      payload.code = values.code;
      payload.branch_id = values.branch_id;
      payload.phone = values.phone;
      payload.email = values.email;
      payload.address = values.address;
    }
    if (config.variation) {
      payload.values = (values.values ?? []).join(',');
    }
    if (config.rack) {
      payload.shelf_id = values.shelf_id ?? [];
    }
    return payload;
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const payload = buildPayload(values);
      const resp = editing
        ? await updatePOSSetupRecord(config.kind, editing.id, payload)
        : await createPOSSetupRecord(config.kind, payload);
      message.success(resp.message || 'Saved');
      setModalOpen(false);
      actionRef.current?.reload();
      await loadAuxiliary();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<POSSetupRecord>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, record) => setupName(record) || '-',
    },
    ...(config.code
      ? [
          {
            title: 'Code',
            dataIndex: 'code',
            search: false,
          } as ProColumns<POSSetupRecord>,
        ]
      : []),
    ...(config.vat
      ? [
          {
            title: 'Rate',
            dataIndex: 'rate',
            search: false,
            render: (_, record) => `${record.rate ?? 0}%`,
          } as ProColumns<POSSetupRecord>,
          {
            title: 'Type',
            search: false,
            render: (_, record) => (record.sub_vat?.length ? 'Group' : 'Single'),
          } as ProColumns<POSSetupRecord>,
        ]
      : []),
    ...(config.paymentType
      ? [
          {
            title: 'Branch',
            dataIndex: 'branch_id',
            search: false,
            render: (_, record) =>
              branchOptionLabel(record.branch as POSSetupRecord) || record.branch_id || '-',
          } as ProColumns<POSSetupRecord>,
          {
            title: 'Opening',
            dataIndex: 'opening_balance',
            search: false,
            align: 'right',
            renderText: (_, record) => Number(record.opening_balance || 0).toFixed(2),
          } as ProColumns<POSSetupRecord>,
          {
            title: 'Balance',
            dataIndex: 'current_balance',
            search: false,
            align: 'right',
            renderText: (_, record) =>
              Number(record.current_balance ?? record.balance ?? 0).toFixed(2),
          } as ProColumns<POSSetupRecord>,
          {
            title: 'Invoice',
            dataIndex: 'show_on_invoice',
            search: false,
            render: (_, record) =>
              record.show_on_invoice ?? record.show_in_invoice ? (
                <Tag color="blue">Visible</Tag>
              ) : (
                <Tag>Hidden</Tag>
              ),
          } as ProColumns<POSSetupRecord>,
        ]
      : []),
    ...(config.branch
      ? [
          {
            title: 'Phone',
            dataIndex: 'phone',
            search: false,
          } as ProColumns<POSSetupRecord>,
          {
            title: 'Main',
            dataIndex: 'is_main',
            search: false,
            render: (_, record) => (record.is_main ? <Tag color="blue">Main</Tag> : '-'),
          } as ProColumns<POSSetupRecord>,
          {
            title: 'Balance',
            dataIndex: 'current_balance',
            search: false,
            align: 'right',
            renderText: (_, record) =>
              Number(record.branchRemainingBalance ?? record.current_balance ?? 0).toFixed(2),
          } as ProColumns<POSSetupRecord>,
        ]
      : []),
    ...(config.warehouse
      ? [
          {
            title: 'Branch',
            dataIndex: 'branch_id',
            search: false,
            render: (_, record) =>
              branchOptionLabel(record.branch as POSSetupRecord) || record.branch_id || '-',
          } as ProColumns<POSSetupRecord>,
          {
            title: 'Phone',
            dataIndex: 'phone',
            search: false,
          } as ProColumns<POSSetupRecord>,
        ]
      : []),
    ...(config.variation
      ? [
          {
            title: 'Values',
            dataIndex: 'values',
            search: false,
            render: (_, record) => asTags(record.values).join(', ') || '-',
          } as ProColumns<POSSetupRecord>,
        ]
      : []),
    ...(config.rack
      ? [
          {
            title: 'Shelves',
            dataIndex: 'shelves',
            search: false,
            render: (_, record) =>
              (record.shelves ?? [])
                .map((item) => item.name)
                .filter(Boolean)
                .join(', ') || '-',
          } as ProColumns<POSSetupRecord>,
        ]
      : []),
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active' },
        inactive: { text: 'Inactive' },
      },
      render: (_, record) => statusTag(record),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditor(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                  onOk: async () => {
                    const resp = await deletePOSSetupRecord(config.kind, record.id);
                    message.success(resp.message || 'Deleted');
                    actionRef.current?.reload();
                    await loadAuxiliary();
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<POSSetupRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 72 }}
        request={async (params) => {
          const resp = await listPOSSetupRecords(config.kind, {
            status: params.status,
          });
          const items = filterRecords(resp.data ?? [], params.name, params.status);
          return {
            data: items,
            success: true,
            total: items.length,
          };
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New
          </Button>,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
        ]}
      />
      <Modal
        destroyOnClose
        open={modalOpen}
        title={editing ? `Edit ${config.label}` : `New ${config.label}`}
        confirmLoading={submitting}
        onOk={submit}
        onCancel={() => setModalOpen(false)}
      >
        <Form form={form} layout="vertical" initialValues={{ status: true, vat_mode: 'single' }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, whitespace: true, max: 255 }]}
          >
            <Input />
          </Form.Item>
          {config.code && (
            <Form.Item name="code" label="Code" rules={[{ max: 64 }]}>
              <Input />
            </Form.Item>
          )}
          {config.categoryFlags && (
            <Space wrap>
              {[
                ['variationCapacity', 'Capacity'],
                ['variationColor', 'Color'],
                ['variationSize', 'Size'],
                ['variationType', 'Type'],
                ['variationWeight', 'Weight'],
              ].map(([name, label]) => (
                <Form.Item key={name} name={name} label={label} valuePropName="checked">
                  <Switch />
                </Form.Item>
              ))}
            </Space>
          )}
          {config.vat && (
            <>
              <Form.Item name="vat_mode" label="VAT mode" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'Single rate', value: 'single' },
                    { label: 'Grouped VAT', value: 'group' },
                  ]}
                />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, next) => prev.vat_mode !== next.vat_mode}>
                {({ getFieldValue }) =>
                  getFieldValue('vat_mode') === 'group' ? (
                    <Form.Item
                      name="vat_ids"
                      label="Included VAT rates"
                      rules={[{ required: true }]}
                    >
                      <Select
                        mode="multiple"
                        options={vatOptions
                          .filter((item) => item.id !== editing?.id && !item.sub_vat?.length)
                          .map((item) => ({
                            label: `${setupName(item)} (${item.rate ?? 0}%)`,
                            value: item.id,
                          }))}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="rate" label="Rate" rules={[{ required: true }]}>
                      <InputNumber
                        min={0}
                        max={100}
                        precision={2}
                        style={{ width: '100%' }}
                        addonAfter="%"
                      />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </>
          )}
          {config.paymentType && (
            <>
              <Form.Item name="branch_id" label="Branch" rules={[{ max: 128 }]}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={branchOptions.map((item) => ({
                    label: branchOptionLabel(item),
                    value: item.id,
                  }))}
                />
              </Form.Item>
              <Form.Item name="opening_balance" label="Opening balance">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="opening_date" label="Opening date">
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item name="show_on_invoice" label="Show on invoice" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          )}
          {config.branch && (
            <>
              <Form.Item name="phone" label="Phone" rules={[{ max: 80 }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }, { max: 255 }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ max: 512 }]}>
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description" rules={[{ max: 1024 }]}>
                <Input.TextArea rows={2} />
              </Form.Item>
              <Space wrap>
                <Form.Item name="branchOpeningBalance" label="Opening balance">
                  <InputNumber min={0} precision={2} />
                </Form.Item>
                <Form.Item name="branchRemainingBalance" label="Current balance">
                  <InputNumber min={0} precision={2} />
                </Form.Item>
                <Form.Item name="is_main" label="Main branch" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Space>
            </>
          )}
          {config.warehouse && (
            <>
              <Form.Item name="branch_id" label="Branch" rules={[{ max: 128 }]}>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={branchOptions.map((item) => ({
                    label: branchOptionLabel(item),
                    value: item.id,
                  }))}
                />
              </Form.Item>
              <Form.Item name="phone" label="Phone" rules={[{ max: 80 }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ type: 'email' }, { max: 255 }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Address" rules={[{ max: 512 }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {config.variation && (
            <Form.Item name="values" label="Values" rules={[{ required: true }]}>
              <Select mode="tags" tokenSeparators={[',']} />
            </Form.Item>
          )}
          {config.rack && (
            <Form.Item name="shelf_id" label="Shelves" rules={[{ required: true }]}>
              <Select
                mode="multiple"
                options={shelfOptions.map((item) => ({ label: setupName(item), value: item.id }))}
              />
            </Form.Item>
          )}
          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const POSSetupPage: React.FC = () => {
  const intl = useIntl();
  const configs = useMemo<SetupConfig[]>(
    () => [
      { kind: 'categories', label: 'Categories', code: true, categoryFlags: true },
      { kind: 'brands', label: 'Brands', code: true },
      { kind: 'units', label: 'Units', code: true },
      { kind: 'vats', label: 'Taxes', vat: true },
      { kind: 'payment-types', label: 'Payment Methods', paymentType: true },
      { kind: 'branches', label: 'Branches', code: true, branch: true },
      { kind: 'warehouses', label: 'Warehouses', code: true, warehouse: true },
      { kind: 'product-models', label: 'Models' },
      { kind: 'variations', label: 'Variations', variation: true },
      { kind: 'shelves', label: 'Shelves' },
      { kind: 'racks', label: 'Racks', rack: true },
    ],
    [],
  );

  return (
    <PageContainer
      title={intl.formatMessage({ id: 'product.setup', defaultMessage: 'Retail Setup' })}
    >
      <Tabs
        items={configs.map((config) => ({
          key: config.kind,
          label: config.label,
          children: <POSSetupTable config={config} />,
        }))}
      />
    </PageContainer>
  );
};

export default POSSetupPage;
