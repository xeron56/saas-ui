import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
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
  Tabs,
  Tag,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';

type TabKey = 'batch' | 'department' | 'passing-years' | 'currency';

type SettingRow = {
  id?: number | string;
  DT_RowIndex?: number;
  name?: string;
  short_name?: string;
  currency_code?: string;
  symbol?: string;
  currency_placement?: string;
  current_currency?: number | string;
  created_at?: string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

type SettingFormValues = {
  name?: string;
  short_name?: string;
  passing_year?: string;
  currency_code?: string;
  symbol?: string;
  currency_placement?: string;
  current_currency?: boolean;
};

type SettingTab = {
  key: TabKey;
  label: string;
  title: string;
  path: string;
  endpoint: string;
  storePath: string;
  createLabel: string;
};

const tabs: SettingTab[] = [
  {
    key: 'batch',
    label: 'Batches',
    title: 'Batch Setting',
    path: '/admin/setting/batch',
    endpoint: '/admin/setting/batch',
    storePath: '/admin/setting/batch/batch',
    createLabel: 'Add Batch',
  },
  {
    key: 'department',
    label: 'Departments',
    title: 'Department Setting',
    path: '/admin/setting/department',
    endpoint: '/admin/setting/department',
    storePath: '/admin/setting/department/department',
    createLabel: 'Add Department',
  },
  {
    key: 'passing-years',
    label: 'Passing Years',
    title: 'Passing Year Setting',
    path: '/admin/setting/passing-years',
    endpoint: '/admin/setting/passing-years',
    storePath: '/admin/setting/passing-years/passing-years',
    createLabel: 'Add Passing Year',
  },
  {
    key: 'currency',
    label: 'Currencies',
    title: 'Currency Setting',
    path: '/admin/setting/currency',
    endpoint: '/admin/setting/currency',
    storePath: '/admin/setting/currency/currency',
    createLabel: 'Add Currency',
  },
];

const emptyRows: Record<TabKey, SettingRow[]> = {
  batch: [],
  department: [],
  'passing-years': [],
  currency: [],
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

function currencyCodeValue(value: unknown) {
  return cleanDisplay(value).replace(/\s*\(Current Currency\)\s*$/i, '');
}

function currentCurrencyValue(record?: SettingRow) {
  if (numericValue(record?.current_currency) === 1) {
    return true;
  }
  return /\(Current Currency\)/i.test(cleanDisplay(record?.currency_code));
}

function directEditIDFromPath(pathname: string) {
  const match = pathname.match(
    /\/admin\/setting\/(?:batch|department|passing-years|currency)\/edit\/([^/?#]+)/,
  );
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function activeTabFromPath(pathname: string): TabKey {
  if (pathname.includes('/admin/setting/department')) {
    return 'department';
  }
  if (pathname.includes('/admin/setting/passing-years')) {
    return 'passing-years';
  }
  if (pathname.includes('/admin/setting/currency')) {
    return 'currency';
  }
  return 'batch';
}

function tabByKey(key: TabKey) {
  return tabs.find((tab) => tab.key === key) || tabs[0];
}

function rowID(record?: SettingRow) {
  return textValue(record?.id);
}

function legacyHTMLInputValue(html: string, name: string) {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const field = doc.querySelector(`[name="${name}"]`) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    return textValue(field?.value);
  }
  const input = html.match(new RegExp(`<[^>]*name=["']${name}["'][^>]*>`, 'i'))?.[0] || '';
  return input.match(/\bvalue=["']([^"']*)["']/i)?.[1] || '';
}

function settingRowFromEditHTML(tabKey: TabKey, html: string, fallbackID: string) {
  const id = legacyHTMLInputValue(html, 'id') || fallbackID;
  if (tabKey === 'department') {
    const name = legacyHTMLInputValue(html, 'name');
    const shortName = legacyHTMLInputValue(html, 'short_name');
    return name || shortName ? { id, name, short_name: shortName } : undefined;
  }
  if (tabKey === 'passing-years') {
    const passingYear = legacyHTMLInputValue(html, 'passing_year');
    return passingYear ? { id, name: passingYear } : undefined;
  }
  if (tabKey === 'currency') {
    const code = legacyHTMLInputValue(html, 'currency_code');
    const symbol = legacyHTMLInputValue(html, 'symbol');
    const placement = legacyHTMLInputValue(html, 'currency_placement');
    return code || symbol
      ? { id, currency_code: code, symbol, currency_placement: placement }
      : undefined;
  }
  const name = legacyHTMLInputValue(html, 'name');
  return name ? { id, name } : undefined;
}

function formValuesFromRecord(tabKey: TabKey, record: SettingRow): SettingFormValues {
  if (tabKey === 'department') {
    return {
      name: cleanDisplay(record.name),
      short_name: cleanDisplay(record.short_name),
    };
  }
  if (tabKey === 'passing-years') {
    return { passing_year: cleanDisplay(record.name) };
  }
  if (tabKey === 'currency') {
    return {
      currency_code: currencyCodeValue(record.currency_code),
      symbol: cleanDisplay(record.symbol),
      currency_placement: cleanDisplay(record.currency_placement) || 'before',
      current_currency: currentCurrencyValue(record),
    };
  }
  return { name: cleanDisplay(record.name) };
}

function buildMutationPayload(tabKey: TabKey, values: SettingFormValues) {
  if (tabKey === 'department') {
    return {
      name: textValue(values.name),
      short_name: textValue(values.short_name),
    };
  }
  if (tabKey === 'passing-years') {
    return {
      passing_year: textValue(values.passing_year),
    };
  }
  if (tabKey === 'currency') {
    return {
      currency_code: textValue(values.currency_code).toUpperCase(),
      symbol: textValue(values.symbol),
      currency_placement: textValue(values.currency_placement) || 'before',
      current_currency: values.current_currency ? 1 : 0,
    };
  }
  return {
    name: textValue(values.name),
  };
}

async function mutateSetting(
  tabKey: TabKey,
  endpoint: string,
  values: SettingFormValues,
  method: 'POST' | 'PATCH',
) {
  return request<LegacyTableResponse<SettingRow>>(endpoint, {
    method,
    data: buildMutationPayload(tabKey, values),
  });
}

async function postLegacy(endpoint: string) {
  return request<LegacyTableResponse<SettingRow>>(endpoint, {
    method: 'POST',
    data: {},
  });
}

export default function AdminApplicationSettings() {
  const location = useLocation();
  const activeKey = activeTabFromPath(location.pathname);
  const activeTab = tabByKey(activeKey);
  const directEditID = directEditIDFromPath(location.pathname);
  const openedDirectEditRef = useRef('');
  const [form] = Form.useForm<SettingFormValues>();
  const [rows, setRows] = useState<Record<TabKey, SettingRow[]>>(emptyRows);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<SettingRow | undefined>();
  const [error, setError] = useState('');

  const loadRows = async (key: TabKey = activeKey) => {
    const tab = tabByKey(key);
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<SettingRow>>(`${tab.endpoint}?ajax=1`);
      setRows((previous) => ({
        ...previous,
        [key]: Array.isArray(body.data) ? body.data : [],
      }));
    } catch (err: any) {
      setRows((previous) => ({ ...previous, [key]: [] }));
      setError(err?.message || `${tab.title} could not be loaded.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(activeKey);
  }, [activeKey]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrent(undefined);
    form.resetFields();
    if (directEditID) {
      history.replace(activeTab.path);
    }
  };

  const openCreate = () => {
    setCurrent(undefined);
    form.resetFields();
    if (activeKey === 'currency') {
      form.setFieldsValue({ currency_placement: 'before', current_currency: false });
    }
    setDrawerOpen(true);
  };

  const openEdit = (record: SettingRow) => {
    setCurrent(record);
    form.setFieldsValue(formValuesFromRecord(activeKey, record));
    setDrawerOpen(true);
  };

  const openEditRoute = (record: SettingRow) => {
    const id = rowID(record);
    if (!id) {
      openEdit(record);
      return;
    }
    openedDirectEditRef.current = `${activeKey}:${id}`;
    history.push(`${activeTab.endpoint}/edit/${encodeURIComponent(id)}`);
    openEdit(record);
  };

  const openDirectEdit = async (id: string) => {
    const record = rows[activeKey].find((item) => rowID(item) === id);
    if (record) {
      openEdit(record);
      return;
    }
    setError('');
    try {
      const html = await request<string>(`${activeTab.endpoint}/edit/${encodeURIComponent(id)}`, {
        responseType: 'text',
      });
      const item = settingRowFromEditHTML(activeKey, textValue(html), id);
      if (!item) {
        setError(`${activeTab.title} could not be loaded.`);
        return;
      }
      openEdit(item);
    } catch (err: any) {
      setError(err?.message || `${activeTab.title} could not be loaded.`);
    }
  };

  useEffect(() => {
    if (!directEditID) {
      openedDirectEditRef.current = '';
      return;
    }
    const directEditKey = `${activeKey}:${directEditID}`;
    if (openedDirectEditRef.current === directEditKey) {
      return;
    }
    openedDirectEditRef.current = directEditKey;
    openDirectEdit(directEditID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, directEditID, rows]);

  const submitSetting = async (values: SettingFormValues) => {
    setSaving(true);
    setError('');
    try {
      const id = rowID(current);
      const endpoint = id
        ? `${activeTab.endpoint}/update/${encodeURIComponent(id)}`
        : activeTab.storePath;
      const response = await mutateSetting(activeKey, endpoint, values, id ? 'PATCH' : 'POST');
      if (response.status === false) {
        setError(textValue(response.message) || `${activeTab.title} could not be saved.`);
        return;
      }
      toast.success(textValue(response.message) || `${activeTab.title} saved.`);
      closeDrawer();
      await loadRows(activeKey);
    } catch (err: any) {
      setError(err?.message || `${activeTab.title} could not be saved.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (record: SettingRow) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    setError('');
    try {
      const response = await postLegacy(`${activeTab.endpoint}/delete/${encodeURIComponent(id)}`);
      if (response.status === false) {
        setError(textValue(response.message) || `${activeTab.title} could not be deleted.`);
        return;
      }
      toast.success(textValue(response.message) || `${activeTab.title} deleted.`);
      await loadRows(activeKey);
    } catch (err: any) {
      setError(err?.message || `${activeTab.title} could not be deleted.`);
    }
  };

  const switchTab = (key: string) => {
    closeDrawer();
    setError('');
    history.push(tabByKey(key as TabKey).path);
  };

  const actionColumn: ColumnsType<SettingRow>[number] = {
    title: 'Actions',
    key: 'actions',
    width: 120,
    align: 'right',
    render: (_, record) => (
      <Space>
        <Button
          aria-label="Edit"
          icon={<EditOutlined />}
          onClick={() => openEditRoute(record)}
          size="small"
        />
        <Popconfirm
          title="Delete item?"
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteSetting(record)}
        >
          <Button aria-label="Delete" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      </Space>
    ),
  };

  const taxonomyColumns: ColumnsType<SettingRow> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 72,
      render: (value, _record, index) => value || index + 1,
    },
    {
      title: activeKey === 'passing-years' ? 'Passing Year' : 'Name',
      dataIndex: 'name',
      render: (value) => cleanDisplay(value) || '-',
    },
  ];

  if (activeKey === 'department') {
    taxonomyColumns.push({
      title: 'Short Name',
      dataIndex: 'short_name',
      render: (value) => cleanDisplay(value) || '-',
    });
  }

  taxonomyColumns.push({
    title: 'Created',
    dataIndex: 'created_at',
    width: 180,
    render: (value) => cleanDisplay(value) || '-',
  });
  taxonomyColumns.push(actionColumn);

  const currencyColumns: ColumnsType<SettingRow> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 72,
      render: (value, _record, index) => value || index + 1,
    },
    {
      title: 'Code',
      dataIndex: 'currency_code',
      render: (value, record) => (
        <Space>
          <span>{currencyCodeValue(value) || '-'}</span>
          {currentCurrencyValue(record) ? <Tag color="green">Current</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      width: 120,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Placement',
      dataIndex: 'currency_placement',
      width: 160,
      render: (value) => {
        const placement = cleanDisplay(value) || 'before';
        return <Tag>{placement === 'after' ? 'After Amount' : 'Before Amount'}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      width: 180,
      render: (value) => cleanDisplay(value) || '-',
    },
    actionColumn,
  ];

  const renderFormFields = () => {
    if (activeKey === 'currency') {
      return (
        <>
          <Form.Item
            label="Currency ISO Code"
            name="currency_code"
            rules={[{ required: true, message: 'Currency ISO code is required.' }]}
          >
            <Input autoComplete="off" maxLength={12} placeholder="USD" />
          </Form.Item>
          <Form.Item
            label="Symbol"
            name="symbol"
            rules={[{ required: true, message: 'Symbol is required.' }]}
          >
            <Input autoComplete="off" maxLength={16} placeholder="$" />
          </Form.Item>
          <Form.Item
            label="Currency Placement"
            name="currency_placement"
            rules={[{ required: true, message: 'Currency placement is required.' }]}
          >
            <Select
              options={[
                { label: 'Before Amount', value: 'before' },
                { label: 'After Amount', value: 'after' },
              ]}
            />
          </Form.Item>
          <Form.Item name="current_currency" valuePropName="checked">
            <Checkbox>Current Currency</Checkbox>
          </Form.Item>
        </>
      );
    }

    if (activeKey === 'passing-years') {
      return (
        <Form.Item
          label="Passing Year"
          name="passing_year"
          rules={[{ required: true, message: 'Passing year is required.' }]}
        >
          <Input autoComplete="off" maxLength={80} placeholder="2026" />
        </Form.Item>
      );
    }

    return (
      <>
        <Form.Item
          label={activeKey === 'department' ? 'Department Name' : 'Batch Name'}
          name="name"
          rules={[{ required: true, message: 'Name is required.' }]}
        >
          <Input autoComplete="off" maxLength={195} />
        </Form.Item>
        {activeKey === 'department' ? (
          <Form.Item
            label="Short Name"
            name="short_name"
            rules={[{ required: true, message: 'Short name is required.' }]}
          >
            <Input autoComplete="off" maxLength={80} />
          </Form.Item>
        ) : null}
      </>
    );
  };

  return (
    <PageContainer
      title="Application Settings"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={() => loadRows(activeKey)}>
          Refresh
        </Button>,
        <Button key="create" icon={<PlusOutlined />} type="primary" onClick={openCreate}>
          {activeTab.createLabel}
        </Button>,
      ]}
    >
      {error ? (
        <Alert
          closable
          message={error}
          onClose={() => setError('')}
          style={{ marginBottom: 16 }}
          type="error"
        />
      ) : null}

      <Tabs
        activeKey={activeKey}
        items={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
        }))}
        onChange={switchTab}
      />

      <Table<SettingRow>
        columns={activeKey === 'currency' ? currencyColumns : taxonomyColumns}
        dataSource={rows[activeKey]}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowKey={(record) => rowID(record) || `${activeKey}-${cleanDisplay(record.name)}`}
        scroll={{ x: 760 }}
      />

      <Drawer
        destroyOnClose
        extra={
          <Button
            icon={<SaveOutlined />}
            loading={saving}
            type="primary"
            onClick={() => form.submit()}
          >
            Save
          </Button>
        }
        onClose={closeDrawer}
        open={drawerOpen}
        title={
          <Space>
            <SettingOutlined />
            {current ? `Edit ${activeTab.title}` : activeTab.createLabel}
          </Space>
        }
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={submitSetting}>
          {renderFormFields()}
        </Form>
      </Drawer>
    </PageContainer>
  );
}
