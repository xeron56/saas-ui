import {
  EditOutlined,
  GlobalOutlined,
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
  Select,
  Space,
  Table,
  Tag,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';

const customDomainEndpoint = '/admin/custom-domain';

type CustomDomainRow = {
  id?: number | string;
  DT_RowIndex?: number;
  old_domain?: string;
  request_domain?: string;
  status?: number | string;
  status_label?: string;
  created_at?: string;
};

type LegacyResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

type LegacyTableResponse<T> = LegacyResponse<T[]> & {
  recordsTotal?: number;
  recordsFiltered?: number;
};

type CustomDomainInfo = {
  customDomain?: CustomDomainRow;
  item?: CustomDomainRow;
};

type CustomDomainFormValues = {
  request_domain?: string;
  status?: number;
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

function rowID(record?: CustomDomainRow) {
  return textValue(record?.id);
}

function statusValue(record?: CustomDomainRow) {
  return numericValue(record?.status) === 1 ? 1 : 0;
}

function statusLabel(record?: CustomDomainRow) {
  return statusValue(record) === 1 ? 'Active' : cleanDisplay(record?.status_label) || 'Pending';
}

function buildPayload(values: CustomDomainFormValues, current?: CustomDomainRow) {
  const payload: Record<string, unknown> = {
    request_domain: textValue(values.request_domain).toLowerCase(),
  };
  if (current) {
    payload.status = values.status ?? 0;
  }
  return payload;
}

function directInfoIDFromPath(pathname: string) {
  const match = pathname.match(/^\/admin\/custom-domain\/info\/([^/]+)\/?$/);
  if (!match?.[1]) {
    return '';
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export default function AdminCustomDomain() {
  const location = useLocation();
  const openedTargetRef = useRef('');
  const [form] = Form.useForm<CustomDomainFormValues>();
  const [rows, setRows] = useState<CustomDomainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [current, setCurrent] = useState<CustomDomainRow | undefined>();
  const [error, setError] = useState('');
  const targetInfoID = useMemo(() => directInfoIDFromPath(location.pathname), [location.pathname]);

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse<CustomDomainRow>>(
        `${customDomainEndpoint}?ajax=1`,
      );
      setRows(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'Unable to load custom domain requests.');
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
    if (targetInfoID) {
      history.replace(customDomainEndpoint);
    }
  };

  const openCreate = () => {
    setCurrent(undefined);
    form.resetFields();
    form.setFieldsValue({ status: 0 });
    setDrawerOpen(true);
  };

  const openEditByID = async (id: string, fallback?: CustomDomainRow) => {
    setError('');
    try {
      const response = await request<LegacyResponse<CustomDomainInfo>>(
        `${customDomainEndpoint}/info/${encodeURIComponent(id)}`,
      );
      const item = response.data?.customDomain || response.data?.item || fallback;
      if (!item) {
        setError('Unable to load custom domain request.');
        return;
      }
      setCurrent(item);
      form.setFieldsValue({
        request_domain: cleanDisplay(item.request_domain),
        status: statusValue(item),
      });
      setDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Unable to load custom domain request.');
    }
  };

  const openEdit = (record: CustomDomainRow) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    openedTargetRef.current = id;
    history.push(`${customDomainEndpoint}/info/${encodeURIComponent(id)}`);
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
    const loaded = rows.find((row) => rowID(row) === targetInfoID);
    void openEditByID(targetInfoID, loaded);
  }, [targetInfoID, rows]);

  const submitDomain = async (values: CustomDomainFormValues) => {
    setSaving(true);
    setError('');
    try {
      const id = rowID(current);
      const response = await request<LegacyResponse<CustomDomainRow[]>>(
        id
          ? `${customDomainEndpoint}/update/${encodeURIComponent(id)}`
          : `${customDomainEndpoint}/store`,
        {
          method: 'POST',
          data: buildPayload(values, current),
        },
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Custom domain request could not be saved.');
        return;
      }
      toast.success(textValue(response.message) || 'Custom domain request saved.');
      closeDrawer();
      await loadRows();
    } catch (err: any) {
      setError(err?.message || 'Custom domain request could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<CustomDomainRow> = [
    {
      title: '#',
      dataIndex: 'DT_RowIndex',
      width: 72,
      render: (value, _record, index) => value || index + 1,
    },
    {
      title: 'Current Domain',
      dataIndex: 'old_domain',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Requested Domain',
      dataIndex: 'request_domain',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={statusValue(record) === 1 ? 'green' : 'gold'}>{statusLabel(record)}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      width: 180,
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Button
          aria-label="Edit"
          icon={<EditOutlined />}
          onClick={() => openEdit(record)}
          size="small"
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Custom Domains"
      extra={[
        <Button key="reload" icon={<ReloadOutlined />} onClick={loadRows}>
          Refresh
        </Button>,
        <Button key="create" icon={<PlusOutlined />} type="primary" onClick={openCreate}>
          Add Domain
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

      <Table<CustomDomainRow>
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowKey={(record) => rowID(record) || cleanDisplay(record.request_domain)}
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
            <GlobalOutlined />
            {current ? 'Edit Custom Domain' : 'Add Custom Domain'}
          </Space>
        }
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={submitDomain}>
          <Form.Item
            label="Requested Domain"
            name="request_domain"
            rules={[
              { required: true, message: 'Requested domain is required.' },
              {
                pattern:
                  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i,
                message: 'Use a valid host name without protocol.',
              },
            ]}
          >
            <Input autoComplete="off" maxLength={255} placeholder="portal.example.com" />
          </Form.Item>
          {current ? (
            <Form.Item label="Status" name="status" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Pending', value: 0 },
                  { label: 'Active', value: 1 },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Drawer>
    </PageContainer>
  );
}
