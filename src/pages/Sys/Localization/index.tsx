import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
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
import React, { useRef, useState } from 'react';
import {
  createCurrency,
  createLanguage,
  deleteCurrencies,
  deleteCurrency,
  deleteLanguages,
  deleteLanguage,
  listCurrencies,
  listLanguages,
  setDefaultCurrency,
  updateCurrency,
  updateLanguage,
  updateLanguageStatus,
} from './service';
import type { CurrencyRecord, LanguageRecord } from './types';

const field = <T,>(record: Record<string, any> | undefined, snake: string, camel: string) =>
  (record?.[snake] ?? record?.[camel]) as T | undefined;

const readCreatedAt = (record?: Record<string, any>) =>
  field<string>(record, 'created_at', 'createdAt');
const readDefault = (record?: CurrencyRecord) =>
  field<boolean>(record, 'is_default', 'isDefault') ?? false;
const readCountry = (record?: CurrencyRecord) =>
  field<string>(record, 'country_name', 'countryName') ?? '';
const readLocale = (record?: LanguageRecord) =>
  field<string>(record, 'locale_code', 'localeCode') ?? record?.code ?? '';
const readIcon = (record?: LanguageRecord) =>
  field<string>(record, 'icon_ref', 'iconRef') ?? record?.icon ?? '';

const statusTag = (active?: boolean) => (
  <Tag color={active ? 'green' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
);

const CurrencyTable: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState<CurrencyRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<CurrencyRecord[]>([]);

  const openEditor = (record?: CurrencyRecord) => {
    setEditing(record);
    form.setFieldsValue({
      name: record?.name,
      country_name: readCountry(record),
      code: record?.code,
      rate: record?.rate ?? 1,
      symbol: record?.symbol,
      position: record?.position ?? 'left',
      status: record?.status ?? true,
      is_default: readDefault(record),
    });
    setModalOpen(true);
  };

  const columns: ProColumns<CurrencyRecord>[] = [
    { title: 'Name', dataIndex: 'name', ellipsis: true },
    { title: 'Code', dataIndex: 'code', width: 96 },
    {
      title: 'Country',
      dataIndex: 'country_name',
      ellipsis: true,
      render: (_, record) => readCountry(record) || '-',
    },
    { title: 'Symbol', dataIndex: 'symbol', search: false, width: 96 },
    { title: 'Rate', dataIndex: 'rate', search: false, width: 112 },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } },
      render: (_, record) => statusTag(record.status),
    },
    {
      title: 'Default',
      dataIndex: 'is_default',
      search: false,
      render: (_, record) => (readDefault(record) ? <Tag color="blue">Default</Tag> : '-'),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
      renderText: (_, record) => readCreatedAt(record),
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: 168,
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
          {!readDefault(record) && (
            <Tooltip title="Set default">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  await setDefaultCurrency(record.id);
                  actionRef.current?.reload();
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              disabled={readDefault(record)}
              onClick={() =>
                Modal.confirm({
                  title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                  onOk: async () => {
                    await deleteCurrency(record.id);
                    actionRef.current?.reload();
                  },
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<CurrencyRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        rowSelection={{
          getCheckboxProps: (record) => ({
            disabled: readDefault(record),
          }),
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        request={async (params) => {
          const resp = await listCurrencies({
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword ?? params.name ?? params.code,
            status: params.status,
          });
          return {
            data: resp.data ?? [],
            success: true,
            total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New
          </Button>,
          <Button
            key="delete"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRows.length === 0}
            onClick={() =>
              Modal.confirm({
                title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                onOk: async () => {
                  await deleteCurrencies(selectedRows.map((item) => item.id));
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
              })
            }
          />,
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
        title={editing ? 'Edit currency' : 'New currency'}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          setSubmitting(true);
          try {
            const payload = { ...values, code: String(values.code || '').toUpperCase() };
            if (editing) {
              await updateCurrency(editing.id, payload);
            } else {
              await createCurrency(payload);
            }
            message.success('Saved');
            setModalOpen(false);
            actionRef.current?.reload();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ rate: 1, position: 'left', status: true }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, whitespace: true, max: 255 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="country_name" label="Country" rules={[{ max: 255 }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, pattern: /^[A-Za-z]{3}$/ }]}
          >
            <Input maxLength={3} />
          </Form.Item>
          <Form.Item name="rate" label="Exchange rate" rules={[{ required: true }]}>
            <InputNumber
              min={0.00000001}
              max={1000000000}
              precision={8}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="symbol" label="Symbol" rules={[{ max: 32 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="Symbol position" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
                { label: 'Left with space', value: 'left_space' },
                { label: 'Right with space', value: 'right_space' },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="is_default" label="Default" valuePropName="checked">
            <Switch disabled={!!editing && readDefault(editing)} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const LanguageTable: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState<LanguageRecord>();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<LanguageRecord[]>([]);

  const openEditor = (record?: LanguageRecord) => {
    setEditing(record);
    form.setFieldsValue({
      name: record?.name,
      locale_code: readLocale(record),
      icon_ref: readIcon(record),
      status: record?.status ?? true,
    });
    setModalOpen(true);
  };

  const columns: ProColumns<LanguageRecord>[] = [
    { title: 'Name', dataIndex: 'name', ellipsis: true },
    { title: 'Locale', dataIndex: 'locale_code', render: (_, record) => readLocale(record) || '-' },
    {
      title: 'Icon',
      dataIndex: 'icon_ref',
      search: false,
      ellipsis: true,
      render: (_, record) => readIcon(record) || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: { active: { text: 'Active' }, inactive: { text: 'Inactive' } },
      render: (_, record) => statusTag(record.status),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
      renderText: (_, record) => readCreatedAt(record),
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: 144,
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
          <Tooltip title={record.status ? 'Disable' : 'Enable'}>
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={async () => {
                await updateLanguageStatus(record.id, !record.status);
                actionRef.current?.reload();
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                  onOk: async () => {
                    await deleteLanguage(record.id);
                    actionRef.current?.reload();
                  },
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProTable<LanguageRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        request={async (params) => {
          const resp = await listLanguages({
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword ?? params.name ?? params.locale_code,
            status: params.status,
          });
          return {
            data: resp.data ?? [],
            success: true,
            total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            New
          </Button>,
          <Button
            key="delete"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRows.length === 0}
            onClick={() =>
              Modal.confirm({
                title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                onOk: async () => {
                  await deleteLanguages(selectedRows.map((item) => item.id));
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
              })
            }
          />,
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
        title={editing ? 'Edit language' : 'New language'}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          setSubmitting(true);
          try {
            if (editing) {
              await updateLanguage(editing.id, values);
            } else {
              await createLanguage(values);
            }
            message.success('Saved');
            setModalOpen(false);
            actionRef.current?.reload();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ status: true }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, whitespace: true, max: 255 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="locale_code"
            label="Locale"
            rules={[{ pattern: /^[A-Za-z]{2,3}([_-][A-Za-z0-9]{2,8})*$/ }]}
          >
            <Input placeholder="en-US" />
          </Form.Item>
          <Form.Item name="icon_ref" label="Icon URL" rules={[{ max: 512 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const LocalizationPage: React.FC = () => {
  const intl = useIntl();
  return (
    <PageContainer>
      <Tabs
        items={[
          {
            key: 'currencies',
            label: intl.formatMessage({
              id: 'sys.localization.currencies',
              defaultMessage: 'Currencies',
            }),
            children: <CurrencyTable />,
          },
          {
            key: 'languages',
            label: intl.formatMessage({
              id: 'sys.localization.languages',
              defaultMessage: 'Languages',
            }),
            children: <LanguageTable />,
          },
        ]}
      />
    </PageContainer>
  );
};

export default LocalizationPage;
