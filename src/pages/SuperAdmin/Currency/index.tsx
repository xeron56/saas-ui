import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
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
import { useEffect, useRef, useState } from 'react';

type CurrencyRow = {
  id?: number | string;
  DT_RowIndex?: number;
  currency_code?: string;
  symbol?: string;
  currency_placement?: string;
  current_currency?: number | string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type CurrencyFormValues = {
  currency_code?: string;
  symbol?: string;
  currency_placement?: string;
  current_currency?: boolean;
};

const basePath = '/super-admin/setting/currency';

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

function currencyCodeValue(value: unknown) {
  return cleanDisplay(value).replace(/\s*\(Current Currency\)\s*$/i, '');
}

function currentCurrencyValue(record?: CurrencyRow) {
  if (numericValue(record?.current_currency) === 1) {
    return true;
  }
  return /\(Current Currency\)/i.test(cleanDisplay(record?.currency_code));
}

function directEditIDFromPath(pathname: string) {
  const match = pathname.match(/\/super-admin\/setting\/currency\/edit\/([^/?#]+)/);
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function rowID(record?: CurrencyRow) {
  return textValue(record?.id);
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

function currencyFromEditHTML(html: string, fallbackID: string): CurrencyRow | undefined {
  const id = legacyHTMLInputValue(html, 'id') || fallbackID;
  const code = legacyHTMLInputValue(html, 'currency_code');
  const symbol = legacyHTMLInputValue(html, 'symbol');
  const placement = legacyHTMLInputValue(html, 'currency_placement');
  if (!code && !symbol) {
    return undefined;
  }
  return { id, currency_code: code, symbol, currency_placement: placement };
}

function mutationPayload(values: CurrencyFormValues) {
  return {
    currency_code: textValue(values.currency_code).toUpperCase(),
    symbol: textValue(values.symbol),
    currency_placement: textValue(values.currency_placement) || 'before',
    current_currency: values.current_currency ? 1 : 0,
  };
}

export default function SuperAdminCurrency() {
  const location = useLocation();
  const directEditID = directEditIDFromPath(location.pathname);
  const openedDirectEditRef = useRef('');
  const [form] = Form.useForm<CurrencyFormValues>();
  const [rows, setRows] = useState<CurrencyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<CurrencyRow | undefined>();
  const [error, setError] = useState('');

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<CurrencyRow>>(`${basePath}?ajax=1`);
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'Currencies could not be loaded.');
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
    if (directEditID) {
      history.replace(basePath);
    }
  };

  const openCreate = () => {
    setCurrent(undefined);
    form.setFieldsValue({
      currency_code: '',
      symbol: '',
      currency_placement: 'before',
      current_currency: false,
    });
    setDrawerOpen(true);
  };

  const openEdit = (record: CurrencyRow) => {
    setCurrent(record);
    form.setFieldsValue({
      currency_code: currencyCodeValue(record.currency_code),
      symbol: cleanDisplay(record.symbol),
      currency_placement: cleanDisplay(record.currency_placement) || 'before',
      current_currency: currentCurrencyValue(record),
    });
    setDrawerOpen(true);
  };

  const openEditRoute = (record: CurrencyRow) => {
    const id = rowID(record);
    if (!id) {
      openEdit(record);
      return;
    }
    openedDirectEditRef.current = id;
    history.push(`${basePath}/edit/${encodeURIComponent(id)}`);
    openEdit(record);
  };

  const openDirectEdit = async (id: string) => {
    const record = rows.find((item) => rowID(item) === id);
    if (record) {
      openEdit(record);
      return;
    }
    setError('');
    try {
      const html = await request<string>(`${basePath}/edit/${encodeURIComponent(id)}`, {
        responseType: 'text',
      });
      const item = currencyFromEditHTML(textValue(html), id);
      if (!item) {
        setError('Currency could not be loaded.');
        return;
      }
      openEdit(item);
    } catch (err: any) {
      setError(err?.message || 'Currency could not be loaded.');
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

  const saveCurrency = async () => {
    const values = await form.validateFields();
    const id = rowID(current);
    setSaving(true);
    try {
      const response = await request<LegacyTableResponse<CurrencyRow>>(
        id ? `${basePath}/update/${id}` : `${basePath}/currency`,
        {
          method: id ? 'PATCH' : 'POST',
          data: mutationPayload(values),
        },
      );
      if (response?.status === false) {
        throw new Error(response.message || 'Currency could not be saved.');
      }
      toast.success(response?.message || 'Saved successfully.');
      closeDrawer();
      loadRows();
    } catch (err: any) {
      toast.error(err?.message || 'Currency could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCurrency = async (record: CurrencyRow) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    try {
      const response = await request<LegacyTableResponse<CurrencyRow>>(`${basePath}/delete/${id}`, {
        method: 'POST',
        data: {},
      });
      if (response?.status === false) {
        throw new Error(response.message || 'Currency could not be deleted.');
      }
      toast.success(response?.message || 'Deleted successfully.');
      loadRows();
    } catch (err: any) {
      toast.error(err?.message || 'Currency could not be deleted.');
    }
  };

  const columns: ColumnsType<CurrencyRow> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 72,
      render: (value, _record, index) => numericValue(value) || index + 1,
    },
    {
      title: 'Code',
      dataIndex: 'currency_code',
      render: (value, record) => (
        <Space>
          <span>{currencyCodeValue(value)}</span>
          {currentCurrencyValue(record) ? <Tag color="green">Current</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Placement',
      dataIndex: 'currency_placement',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Action',
      width: 160,
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditRoute(record)} />
          <Popconfirm title="Delete this currency?" onConfirm={() => deleteCurrency(record)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Currency Setting"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={loadRows}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Currency
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {error ? <Alert type="error" message={error} showIcon /> : null}
        <Table<CurrencyRow>
          rowKey={(record) => rowID(record)}
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Space>
      <Drawer
        width={520}
        open={drawerOpen}
        title={current ? 'Edit Currency' : 'Add Currency'}
        onClose={closeDrawer}
        extra={
          <Button type="primary" loading={saving} onClick={saveCurrency}>
            Save
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="currency_code" label="Currency ISO Code" rules={[{ required: true }]}>
            <Input placeholder="USD" />
          </Form.Item>
          <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
            <Input placeholder="$" />
          </Form.Item>
          <Form.Item
            name="currency_placement"
            label="Currency Placement"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: 'Before', value: 'before' },
                { label: 'After', value: 'after' },
              ]}
            />
          </Form.Item>
          <Form.Item name="current_currency" valuePropName="checked">
            <Checkbox>Current Currency</Checkbox>
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
}
