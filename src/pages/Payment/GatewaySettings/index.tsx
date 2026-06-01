import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  KeyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
} from 'antd';
import React, { useRef, useState } from 'react';
import { listGatewaySettings, updateGatewaySetting } from './service';
import type { CurrencyOption, GatewayProviderSpec, GatewaySetting } from './types';

const readField = <T,>(record: Record<string, any> | undefined, snake: string, camel: string) =>
  (record?.[snake] ?? record?.[camel]) as T | undefined;

const readName = (record?: GatewaySetting) =>
  record?.display_name ?? record?.displayName ?? record?.name ?? record?.provider ?? '';

const readActive = (record?: GatewaySetting) => record?.status ?? record?.active ?? false;

const readCurrencyCode = (record?: GatewaySetting) =>
  readField<string>(record, 'currency_code', 'currencyCode') ?? 'BDT';

const readCurrencyID = (record?: GatewaySetting) =>
  readField<string>(record, 'currency_id', 'currencyId') ?? '';

const readPhoneRequired = (record?: GatewaySetting) =>
  readField<boolean>(record, 'phone_required', 'phoneRequired') ?? false;

const readImageRef = (record?: GatewaySetting) =>
  readField<string>(record, 'image_ref', 'imageRef') ?? record?.image ?? '';

const readUpdatedAt = (record?: GatewaySetting) =>
  readField<string>(record, 'updated_at', 'updatedAt');

const readSecretKeys = (record?: GatewaySetting, providers: GatewayProviderSpec[] = []) => {
  const fromRecord = readField<string[]>(record, 'secret_keys', 'secretKeys');
  if (fromRecord?.length) {
    return fromRecord;
  }
  return (
    providers.find((item) => item.provider === record?.provider)?.secret_keys ??
    providers.find((item) => item.provider === record?.provider)?.secretKeys ??
    []
  );
};

const readCredentials = (record?: GatewaySetting) =>
  readField<Record<string, boolean>>(record, 'credentials_configured', 'credentialsConfigured') ??
  readField<Record<string, boolean>>(record, 'has_secret_data', 'hasSecretData') ??
  {};

const readCheckoutSupported = (record?: GatewaySetting) =>
  readField<boolean>(record, 'supports_checkout', 'supportsCheckout') ?? false;

const supportedAdminProviders = new Set(['sslcommerz']);
const isSupportedAdminProvider = (provider?: string) =>
  supportedAdminProviders.has((provider ?? '').toLowerCase());

const providerLabel = (provider: string) => {
  if (provider === 'sslcommerz') {
    return 'SSLCommerz';
  }
  return provider;
};

const GatewaySettingsPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [providers, setProviders] = useState<GatewayProviderSpec[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [editing, setEditing] = useState<GatewaySetting>();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openEditor = (record: GatewaySetting) => {
    setEditing(record);
    form.setFieldsValue({
      name: readName(record),
      mode: record.mode ?? 'Sandbox',
      status: readActive(record),
      charge: record.charge ?? 0,
      currency_id: readCurrencyID(record),
      currency_code: readCurrencyCode(record),
      phone_required: readPhoneRequired(record),
      image_ref: readImageRef(record),
      instructions: record.instructions ?? '',
      secret_data: {},
      clear_secret_fields: [],
    });
    setModalOpen(true);
  };

  const columns: ProColumns<GatewaySetting>[] = [
    {
      title: intl.formatMessage({
        id: 'payment.gatewaySettings.gateway',
        defaultMessage: 'Gateway',
      }),
      dataIndex: 'display_name',
      render: (_, record) => readName(record),
    },
    {
      title: intl.formatMessage({
        id: 'payment.gatewaySettings.provider',
        defaultMessage: 'Provider',
      }),
      dataIndex: 'provider',
      render: (_, record) => <Tag>{providerLabel(record.provider)}</Tag>,
    },
    {
      title: intl.formatMessage({ id: 'payment.gatewaySettings.mode', defaultMessage: 'Mode' }),
      dataIndex: 'mode',
      valueType: 'select',
      valueEnum: {
        Sandbox: { text: 'Sandbox' },
        Live: { text: 'Live' },
      },
    },
    {
      title: intl.formatMessage({ id: 'payment.gatewaySettings.status', defaultMessage: 'Status' }),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active' },
        inactive: { text: 'Inactive' },
      },
      render: (_, record) => (
        <Tag color={readActive(record) ? 'green' : 'default'}>
          {readActive(record) ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({
        id: 'payment.gatewaySettings.currency',
        defaultMessage: 'Currency',
      }),
      dataIndex: 'currency_code',
      search: false,
      render: (_, record) => readCurrencyCode(record),
    },
    {
      title: intl.formatMessage({ id: 'payment.gatewaySettings.charge', defaultMessage: 'Charge' }),
      dataIndex: 'charge',
      search: false,
    },
    {
      title: intl.formatMessage({
        id: 'payment.gatewaySettings.credentials',
        defaultMessage: 'Credentials',
      }),
      dataIndex: 'credentials',
      search: false,
      render: (_, record) => {
        const configured = readCredentials(record);
        return (
          <Space size={4} wrap>
            {readSecretKeys(record, providers).map((key) => (
              <Tooltip key={key} title={key}>
                <Tag
                  icon={configured[key] ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  color={configured[key] ? 'green' : 'default'}
                >
                  <KeyOutlined /> {key}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: 'payment.gatewaySettings.checkout',
        defaultMessage: 'Checkout',
      }),
      dataIndex: 'supports_checkout',
      search: false,
      render: (_, record) =>
        readCheckoutSupported(record) ? <Tag color="blue">Supported</Tag> : <Tag>Unavailable</Tag>,
    },
    {
      title: intl.formatMessage({ id: 'common.updatedAt', defaultMessage: 'UpdatedAt' }),
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      search: false,
      renderText: (_, record) => readUpdatedAt(record),
    },
    {
      title: intl.formatMessage({ id: 'common.operate', defaultMessage: 'Operate' }),
      valueType: 'option',
      width: 88,
      render: (_, record) => (
        <Tooltip title={intl.formatMessage({ id: 'common.edit', defaultMessage: 'Edit' })}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditor(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const secretKeys = readSecretKeys(editing, providers);

  return (
    <PageContainer>
      <ProTable<GatewaySetting>
        actionRef={actionRef}
        rowKey={(record) => record.id || record.provider}
        columns={columns}
        request={async (params) => {
          const resp = await listGatewaySettings({
            search: params.keyword ?? params.display_name ?? params.provider,
            status: params.status,
            provider: params.provider,
          });
          const nextProviders = (resp.data?.providers ?? []).filter((item) =>
            isSupportedAdminProvider(item.provider),
          );
          const nextGateways = (resp.data?.gateways ?? []).filter((item) =>
            isSupportedAdminProvider(item.provider),
          );
          setProviders(nextProviders);
          setCurrencies(resp.data?.currencies ?? []);
          return {
            data: nextGateways,
            success: true,
            total: nextGateways.length,
          };
        }}
        toolBarRender={() => [
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
        ]}
      />
      <Modal
        destroyOnClose
        width={720}
        open={modalOpen}
        title={editing ? readName(editing) : ''}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={async () => {
          if (!editing) {
            return;
          }
          const values = await form.validateFields();
          const secretData = Object.fromEntries(
            Object.entries(values.secret_data ?? {}).filter(([, value]) =>
              String(value ?? '').trim(),
            ),
          );
          setSubmitting(true);
          try {
            await updateGatewaySetting(editing.provider, {
              ...values,
              provider: editing.provider,
              currency_code: String(values.currency_code || '').toUpperCase(),
              secret_data: secretData,
            });
            message.success(
              intl.formatMessage({ id: 'common.success', defaultMessage: 'Success' }),
            );
            setModalOpen(false);
            actionRef.current?.reload();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, whitespace: true, max: 255 }]}
          >
            <Input />
          </Form.Item>
          <Space size={16} style={{ width: '100%' }} align="start">
            <Form.Item name="mode" label="Mode" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Select
                options={(
                  providers.find((item) => item.provider === editing?.provider)?.modes ?? [
                    'Sandbox',
                    'Live',
                  ]
                ).map((mode) => ({ label: mode, value: mode }))}
              />
            </Form.Item>
            <Form.Item name="status" label="Status" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
          <Space size={16} style={{ width: '100%' }} align="start">
            <Form.Item name="currency_id" label="Currency" style={{ flex: 1 }}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                options={currencies.map((item) => ({
                  label: `${item.name ?? item.code} (${item.code})`,
                  value: item.id,
                }))}
                onChange={(value) => {
                  const selected = currencies.find((item) => item.id === value);
                  if (selected?.code) {
                    form.setFieldValue('currency_code', selected.code);
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="currency_code"
              label="Code"
              rules={[{ required: true, pattern: /^[A-Za-z]{3}$/ }]}
              style={{ width: 120 }}
            >
              <Input maxLength={3} />
            </Form.Item>
            <Form.Item
              name="charge"
              label="Charge"
              rules={[{ required: true }]}
              style={{ width: 160 }}
            >
              <InputNumber min={0} max={1000000000} precision={4} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Space size={16} style={{ width: '100%' }} align="start">
            <Form.Item name="phone_required" label="Phone" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
          <Form.Item name="image_ref" label="Image ref" rules={[{ max: 512 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="instructions" label="Instructions" rules={[{ max: 5000 }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          {secretKeys.map((key) => (
            <Form.Item key={key} name={['secret_data', key]} label={key} rules={[{ max: 1024 }]}>
              <Input.Password
                placeholder={readCredentials(editing)[key] ? '••••••••' : undefined}
              />
            </Form.Item>
          ))}
          {secretKeys.length > 0 && (
            <Form.Item name="clear_secret_fields" label="Clear">
              <Checkbox.Group options={secretKeys.map((key) => ({ label: key, value: key }))} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default GatewaySettingsPage;
