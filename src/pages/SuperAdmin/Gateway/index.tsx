import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import {
  Alert,
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

type GatewayRow = {
  id?: number | string;
  tenant_id?: string | null;
  title?: string;
  slug?: string;
  mode?: number | string;
  url?: string;
  key?: string;
  secret?: string;
  status?: number | string;
  image?: string;
  icon?: string;
};

type GatewayCurrency = {
  id?: number | string;
  gateway_id?: number | string;
  currency?: string;
  conversion_rate?: number | string;
};

type GatewayBank = {
  id?: number | string;
  gateway_id?: number | string;
  name?: string;
  details?: string;
  status?: number | string | boolean;
};

type GatewayPageResponse = {
  status?: boolean;
  message?: string;
  gateways?: GatewayRow[];
};

type GatewayInfoData = {
  gateway?: GatewayRow;
  currencies?: GatewayCurrency[];
  banks?: GatewayBank[];
};

type LegacyResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

type GatewayFormValues = {
  status?: boolean;
  mode?: string;
  url?: string;
  key?: string;
  secret?: string;
  currencies?: GatewayCurrency[];
  banks?: GatewayBank[];
};

type GatewaySettingsPageProps = {
  basePath?: string;
  title?: string;
  showSync?: boolean;
};

const defaultBasePath = '/super-admin/setting/gateway';

const modeOptions = [
  { label: 'Live', value: '1' },
  { label: 'Sandbox', value: '2' },
  { label: 'Live Text', value: 'live' },
  { label: 'Test Text', value: 'test' },
];

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
  const parsed = Number(cleanDisplay(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function gatewayID(record?: GatewayRow) {
  return textValue(record?.id);
}

function gatewaySlug(record?: GatewayRow) {
  return cleanDisplay(record?.slug).toLowerCase();
}

function isActive(value: unknown) {
  const raw = cleanDisplay(value).toLowerCase();
  return raw === 'active' || raw === 'true' || raw === 'on' || numericValue(value) === 1;
}

function statusLabel(record?: GatewayRow) {
  return isActive(record?.status) ? 'Active' : 'Inactive';
}

function modeLabel(value: unknown) {
  const raw = cleanDisplay(value);
  if (raw === '1') {
    return 'Live';
  }
  if (raw === '2') {
    return 'Sandbox';
  }
  return raw || '-';
}

function currencyRows(rows?: GatewayCurrency[]) {
  const normalized = (rows || []).map((row) => ({
    id: textValue(row.id),
    currency: cleanDisplay(row.currency).toUpperCase(),
    conversion_rate: numericValue(row.conversion_rate) || 1,
  }));
  return normalized.length > 0 ? normalized : [{ currency: 'USD', conversion_rate: 1 }];
}

function bankRows(rows?: GatewayBank[]) {
  const normalized = (rows || []).map((row) => ({
    id: textValue(row.id),
    name: cleanDisplay(row.name),
    details: textValue(row.details),
    status: isActive(row.status),
  }));
  return normalized.length > 0 ? normalized : [{ name: '', details: '', status: true }];
}

function buildPayload(values: GatewayFormValues, gateway: GatewayRow) {
  const currencies = (values.currencies || []).filter((row) => cleanDisplay(row.currency));
  const payload: Record<string, unknown> = {
    id: gatewayID(gateway),
    slug: gatewaySlug(gateway),
    title: cleanDisplay(gateway.title),
    status: values.status ? 1 : 0,
    mode: textValue(values.mode) || '2',
    'currency_id[]': currencies.map((row) => textValue(row.id)),
    'currency[]': currencies.map((row) => cleanDisplay(row.currency).toUpperCase()),
    'conversion_rate[]': currencies.map((row) => numericValue(row.conversion_rate) || 1),
  };
  if (gatewaySlug(gateway) === 'bank') {
    const banks = values.banks || [];
    payload['bank[id][]'] = banks.map((row) => textValue(row.id));
    payload['bank[name][]'] = banks.map((row) => cleanDisplay(row.name));
    payload['bank[details][]'] = banks.map((row) => textValue(row.details));
    payload['bank[status][]'] = banks.map((row) => (row.status ? 1 : 0));
  } else {
    payload.url = textValue(values.url);
    payload.key = textValue(values.key);
    payload.secret = textValue(values.secret);
  }
  return payload;
}

export function GatewaySettingsPage({
  basePath = defaultBasePath,
  title = 'Gateway Setting',
  showSync = true,
}: GatewaySettingsPageProps) {
  const [form] = Form.useForm<GatewayFormValues>();
  const [rows, setRows] = useState<GatewayRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<GatewayRow | undefined>();
  const [error, setError] = useState('');

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await request<GatewayPageResponse>(basePath);
      setRows(Array.isArray(response.gateways) ? response.gateways : []);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'Gateways could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
  };

  const openEditor = async (record: GatewayRow) => {
    const id = gatewayID(record);
    if (!id) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await request<LegacyResponse<GatewayInfoData>>(`${basePath}/get-info`, {
        params: { id },
      });
      if (response?.status === false) {
        throw new Error(response.message || 'Gateway could not be loaded.');
      }
      const gateway = response.data?.gateway || record;
      setCurrent(gateway);
      form.setFieldsValue({
        status: isActive(gateway.status),
        mode: textValue(gateway.mode) || '2',
        url: textValue(gateway.url),
        key: textValue(gateway.key),
        secret: textValue(gateway.secret),
        currencies: currencyRows(response.data?.currencies),
        banks: bankRows(response.data?.banks),
      });
      setDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Gateway could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const saveGateway = async () => {
    if (!current) {
      return;
    }
    const values = await form.validateFields();
    setSaving(true);
    try {
      const response = await request<LegacyResponse<unknown>>(`${basePath}/store`, {
        method: 'POST',
        data: buildPayload(values, current),
      });
      if (response?.status === false) {
        throw new Error(response.message || 'Gateway could not be saved.');
      }
      toast.success(response?.message || 'Saved successfully.');
      closeDrawer();
      loadRows();
    } catch (err: any) {
      toast.error(err?.message || 'Gateway could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const syncGateways = async () => {
    setSyncing(true);
    setError('');
    try {
      const response = await request<LegacyResponse<{ created?: number | string }>>(
        `${basePath}/syncs`,
      );
      if (response?.status === false) {
        throw new Error(response.message || 'Gateways could not be synced.');
      }
      const created = numericValue(response.data?.created);
      toast.success(
        created > 0
          ? `${response?.message || 'Gateways synced successfully.'} ${created} created.`
          : response?.message || 'Gateways synced successfully.',
      );
      loadRows();
    } catch (err: any) {
      setError(err?.message || 'Gateways could not be synced.');
    } finally {
      setSyncing(false);
    }
  };

  const columns: ColumnsType<GatewayRow> = [
    {
      title: 'Gateway',
      dataIndex: 'title',
      render: (value, record) => cleanDisplay(value) || cleanDisplay(record.slug) || '-',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      width: 160,
      render: (value) => <Tag>{cleanDisplay(value) || '-'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={isActive(record.status) ? 'green' : 'default'}>{statusLabel(record)}</Tag>
      ),
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      width: 120,
      render: (value) => modeLabel(value),
    },
    {
      title: 'URL',
      dataIndex: 'url',
      ellipsis: true,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Action',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={() => openEditor(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title={title}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadRows}>
            Refresh
          </Button>
          {showSync ? (
            <Button icon={<SyncOutlined />} loading={syncing} onClick={syncGateways}>
              Sync
            </Button>
          ) : null}
        </Space>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Table<GatewayRow>
          rowKey={(record) => gatewayID(record) || gatewaySlug(record)}
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={{ pageSize: 12 }}
        />
      </Space>
      <Drawer
        width="min(720px, calc(100vw - 24px))"
        open={drawerOpen}
        title={current ? `Edit ${cleanDisplay(current.title) || gatewaySlug(current)}` : 'Gateway'}
        onClose={closeDrawer}
        extra={
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={saveGateway}>
            Save
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Title">
                <Input value={cleanDisplay(current?.title)} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Slug">
                <Input value={gatewaySlug(current)} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="mode" label="Mode">
                <Select options={modeOptions} />
              </Form.Item>
            </Col>
          </Row>

          {gatewaySlug(current) !== 'bank' ? (
            <>
              <Form.Item name="url" label="Gateway URL">
                <Input placeholder="https://provider.example" />
              </Form.Item>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="key" label="Key">
                    <Input autoComplete="off" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="secret" label="Secret">
                    <Input.Password autoComplete="new-password" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : null}

          <Form.List name="currencies">
            {(fields, { add, remove }) => (
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Row gutter={8} align="middle" key={field.key}>
                    <Form.Item name={[field.name, 'id']} hidden>
                      <Input />
                    </Form.Item>
                    <Col xs={24} md={10}>
                      <Form.Item
                        name={[field.name, 'currency']}
                        label="Currency"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="USD" />
                      </Form.Item>
                    </Col>
                    <Col xs={20} md={10}>
                      <Form.Item
                        name={[field.name, 'conversion_rate']}
                        label="Conversion Rate"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0.0001} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={4} md={4}>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => add({ currency: 'USD', conversion_rate: 1 })}
                >
                  Add Currency
                </Button>
              </Space>
            )}
          </Form.List>

          {gatewaySlug(current) === 'bank' ? (
            <Form.List name="banks">
              {(fields, { add, remove }) => (
                <Space direction="vertical" size={8} style={{ width: '100%', marginTop: 24 }}>
                  {fields.map((field) => (
                    <Row gutter={8} align="middle" key={field.key}>
                      <Form.Item name={[field.name, 'id']} hidden>
                        <Input />
                      </Form.Item>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={[field.name, 'name']}
                          label="Bank Name"
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={10}>
                        <Form.Item name={[field.name, 'details']} label="Details">
                          <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} />
                        </Form.Item>
                      </Col>
                      <Col xs={16} md={4}>
                        <Form.Item
                          name={[field.name, 'status']}
                          label="Status"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col xs={8} md={2}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Button icon={<PlusOutlined />} onClick={() => add({ status: true })}>
                    Add Bank
                  </Button>
                </Space>
              )}
            </Form.List>
          ) : null}
        </Form>
      </Drawer>
    </PageContainer>
  );
}

export default function SuperAdminGateway() {
  return <GatewaySettingsPage />;
}
