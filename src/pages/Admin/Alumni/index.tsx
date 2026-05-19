import { EditOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  message as toast,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

type TabKey = 'approved' | 'pending';

type AlumniRow = {
  id?: number | string;
  name?: string;
  batch?: string;
  batch_name?: string;
  department_name?: string;
  passing_year?: string;
  passing_year_name?: string;
  email?: string;
  mobile?: string;
  location?: string;
  status?: number | string;
};

type OptionRow = {
  id?: number | string;
  name?: string;
  short_name?: string;
};

type AlumniFilters = {
  selectedDepartment?: string;
  selectedPassingYear?: string;
  isMember?: string;
  search?: string;
};

type LegacyTableResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T[];
  departments?: OptionRow[];
  passingYears?: OptionRow[];
  passing_years?: OptionRow[];
  recordsTotal?: number;
  recordsFiltered?: number;
};

const tabs = [
  {
    key: 'approved' as const,
    label: 'Approved',
    title: 'Approved Alumni',
    path: '/admin/alumni/list-search-with-filter',
    endpoint: '/admin/alumni/list-search-with-filter',
  },
  {
    key: 'pending' as const,
    label: 'Pending',
    title: 'Pending Alumni',
    path: '/admin/alumni/list-pending-alumni-with-filter',
    endpoint: '/admin/alumni/list-pending-alumni-with-filter',
  },
];

const statusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Reject', value: 3 },
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

function activeTabFromPath(pathname: string): TabKey {
  return pathname.includes('/admin/alumni/list-pending-alumni-with-filter')
    ? 'pending'
    : 'approved';
}

function tabByKey(key: TabKey) {
  return tabs.find((tab) => tab.key === key) || tabs[0];
}

function rowID(record?: AlumniRow) {
  return textValue(record?.id);
}

function statusValue(record?: AlumniRow) {
  const raw = cleanDisplay(record?.status).toLowerCase();
  if (raw.includes('reject')) {
    return 3;
  }
  if (raw.includes('approved') || raw.includes('active')) {
    return 1;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function statusTag(value: number) {
  if (value === 1) {
    return <Tag color="green">Approved</Tag>;
  }
  if (value === 3) {
    return <Tag color="red">Rejected</Tag>;
  }
  return <Tag color="gold">Pending</Tag>;
}

function optionLabel(row: OptionRow) {
  return cleanDisplay(row.name) || cleanDisplay(row.short_name) || rowID(row);
}

function buildQuery(filters: AlumniFilters) {
  const params = new URLSearchParams({ ajax: '1' });
  if (filters.selectedDepartment) {
    params.set('selectedDepartment', filters.selectedDepartment);
  }
  if (filters.selectedPassingYear) {
    params.set('selectedPassingYear', filters.selectedPassingYear);
  }
  if (filters.isMember !== undefined && filters.isMember !== '') {
    params.set('isMember', filters.isMember);
  }
  if (filters.search) {
    params.set('search[value]', filters.search);
  }
  return params.toString();
}

export default function AdminAlumni() {
  const [form] = Form.useForm<AlumniFilters>();
  const location = useLocation();
  const activeKey = activeTabFromPath(location.pathname);
  const activeTab = tabByKey(activeKey);
  const [rows, setRows] = useState<Record<TabKey, AlumniRow[]>>({ approved: [], pending: [] });
  const [departments, setDepartments] = useState<OptionRow[]>([]);
  const [passingYears, setPassingYears] = useState<OptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingID, setSavingID] = useState('');
  const [error, setError] = useState('');

  const loadRows = async (key: TabKey = activeKey) => {
    const tab = tabByKey(key);
    const filters = form.getFieldsValue();
    setLoading(true);
    setError('');
    try {
      const response = await request<LegacyTableResponse<AlumniRow>>(
        `${tab.endpoint}?${buildQuery(filters)}`,
      );
      setRows((previous) => ({
        ...previous,
        [key]: Array.isArray(response.data) ? response.data : [],
      }));
      if (Array.isArray(response.departments)) {
        setDepartments(response.departments);
      }
      const yearRows = response.passingYears || response.passing_years;
      if (Array.isArray(yearRows)) {
        setPassingYears(yearRows);
      }
    } catch (err: any) {
      setRows((previous) => ({ ...previous, [key]: [] }));
      setError(err?.message || `${tab.title} could not be loaded.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(activeKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const changeStatus = async (record: AlumniRow, selectedStatus: number) => {
    const id = rowID(record);
    if (!id) {
      return;
    }
    setSavingID(id);
    setError('');
    try {
      const response = await request<LegacyTableResponse<AlumniRow>>(
        '/admin/alumni/change-alumni-status',
        {
          method: 'POST',
          data: {
            alumniUserId: id,
            selectedStatus,
          },
        },
      );
      if (response.status === false) {
        setError(cleanDisplay(response.message) || 'Alumni status could not be changed.');
        return;
      }
      toast.success(cleanDisplay(response.message) || 'Alumni status changed.');
      await loadRows(activeKey);
    } catch (err: any) {
      setError(err?.message || 'Alumni status could not be changed.');
    } finally {
      setSavingID('');
    }
  };

  const columns: ColumnsType<AlumniRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, record) => cleanDisplay(record.name) || rowID(record),
    },
    {
      title: 'Batch',
      dataIndex: 'batch',
      render: (_, record) => cleanDisplay(record.batch || record.batch_name) || '-',
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Passing Year',
      dataIndex: 'passing_year',
      render: (_, record) => cleanDisplay(record.passing_year || record.passing_year_name) || '-',
    },
    {
      title: 'Contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{cleanDisplay(record.email) || '-'}</span>
          <span>{cleanDisplay(record.mobile) || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Status',
      render: (_, record) => statusTag(statusValue(record)),
      width: 110,
    },
    {
      title: 'Change Status',
      width: 170,
      render: (_, record) => (
        <Select
          loading={savingID === rowID(record)}
          onChange={(value) => changeStatus(record, value)}
          options={statusOptions}
          value={statusValue(record)}
        />
      ),
    },
    {
      title: 'Action',
      width: 190,
      render: (_, record) => (
        <Space wrap>
          <Button
            href={`/admin/alumni/alumni-profile-edit/${encodeURIComponent(rowID(record))}`}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button
            href={`/alumni/profile/${encodeURIComponent(rowID(record))}`}
            icon={<EyeOutlined />}
            target="_blank"
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title={activeTab.title}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Tabs
        activeKey={activeKey}
        items={tabs.map((tab) => ({ key: tab.key, label: tab.label }))}
        onChange={(key) => history.push(tabByKey(key as TabKey).path)}
      />
      <Form
        form={form}
        layout="inline"
        onFinish={() => loadRows(activeKey)}
        style={{ gap: 8, marginBottom: 16 }}
      >
        <Form.Item name="search">
          <Input.Search
            allowClear
            placeholder="Search Alumni"
            onSearch={() => loadRows(activeKey)}
          />
        </Form.Item>
        <Form.Item name="selectedDepartment">
          <Select
            allowClear
            options={departments.map((row) => ({ label: optionLabel(row), value: rowID(row) }))}
            placeholder="Department"
            style={{ minWidth: 180 }}
          />
        </Form.Item>
        <Form.Item name="selectedPassingYear">
          <Select
            allowClear
            options={passingYears.map((row) => ({ label: optionLabel(row), value: rowID(row) }))}
            placeholder="Passing Year"
            style={{ minWidth: 160 }}
          />
        </Form.Item>
        <Form.Item name="isMember">
          <Select
            allowClear
            options={[
              { label: 'Member', value: '1' },
              { label: 'Non Member', value: '0' },
            ]}
            placeholder="Membership"
            style={{ minWidth: 150 }}
          />
        </Form.Item>
        <Space>
          <Button htmlType="submit" type="primary">
            Apply
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadRows(activeKey)}>
            Refresh
          </Button>
        </Space>
      </Form>
      <Table
        columns={columns}
        dataSource={rows[activeKey]}
        loading={loading}
        pagination={{ pageSize: 10 }}
        rowKey={(record, index) => rowID(record) || String(index)}
      />
    </PageContainer>
  );
}
