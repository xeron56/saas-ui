import {
  EyeOutlined,
  MessageOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLocation } from '@umijs/max';
import { Alert, Avatar, Button, Form, Input, Select, Space, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

type AlumniRow = {
  id?: number | string;
  name?: string;
  image?: string;
  image_url?: string;
  file_url?: string;
  batch?: string;
  batch_name?: string;
  department_name?: string;
  passing_year?: string;
  passing_year_name?: string;
  email?: string;
  mobile?: string;
  location?: string;
};

type AlumniFilters = {
  selectedDepartment?: string;
  selectedPassingYear?: string;
  isMember?: string;
  search?: string;
};

type OptionRow = {
  id?: number | string;
  name?: string;
  short_name?: string;
};

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rowID(row?: AlumniRow | OptionRow) {
  return textValue(row?.id);
}

function optionLabel(row: OptionRow) {
  return cleanDisplay(row.name) || cleanDisplay(row.short_name) || rowID(row);
}

function imageURL(row: AlumniRow) {
  return textValue(row.image_url) || textValue(row.file_url) || textValue(row.image);
}

function initialFilters(search: string): AlumniFilters {
  const params = new URLSearchParams(search);
  return {
    selectedDepartment: textValue(params.get('selectedDepartment')),
    selectedPassingYear: textValue(params.get('selectedPassingYear')),
    isMember: textValue(params.get('isMember')),
    search: textValue(params.get('search[value]') || params.get('search')),
  };
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

function records(value: unknown) {
  return Array.isArray(value) ? (value as LegacyRecord[]) : [];
}

export default function AlumniDirectory() {
  const location = useLocation();
  const [form] = Form.useForm<AlumniFilters>();
  const defaults = useMemo(() => initialFilters(location.search), [location.search]);
  const [rows, setRows] = useState<AlumniRow[]>([]);
  const [departments, setDepartments] = useState<OptionRow[]>([]);
  const [passingYears, setPassingYears] = useState<OptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRows = async (filters: AlumniFilters = form.getFieldsValue()) => {
    setLoading(true);
    setError('');
    try {
      const payload = normalizePayload(
        await fetchPublicContent(`/alumni/list-search-with-filter?${buildQuery(filters)}`),
      );
      setRows(records(payload.data || payload.allAlumni || payload.items) as AlumniRow[]);
      setDepartments(records(payload.departments) as OptionRow[]);
      setPassingYears(records(payload.passingYears || payload.passing_years) as OptionRow[]);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'Alumni list could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue(defaults);
    loadRows(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults]);

  const columns: ColumnsType<AlumniRow> = [
    {
      title: 'Full Name',
      dataIndex: 'name',
      render: (_, row) => {
        const title = cleanDisplay(row.name) || rowID(row);
        return (
          <Space>
            <Avatar icon={<UserOutlined />} src={imageURL(row) || undefined} />
            <span>{title || '-'}</span>
          </Space>
        );
      },
    },
    {
      title: 'Batch',
      dataIndex: 'batch',
      render: (_, row) => cleanDisplay(row.batch || row.batch_name) || '-',
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Passing Year',
      dataIndex: 'passing_year',
      render: (_, row) => cleanDisplay(row.passing_year || row.passing_year_name) || '-',
    },
    {
      title: 'Contact',
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <span>{cleanDisplay(row.email) || '-'}</span>
          <span>{cleanDisplay(row.mobile) || '-'}</span>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      render: (value) => cleanDisplay(value) || '-',
    },
    {
      title: 'Action',
      width: 190,
      render: (_, row) => {
        const id = rowID(row);
        return (
          <Space wrap>
            <Button
              disabled={!id}
              href={id ? `/chats?receiver_id=${encodeURIComponent(id)}` : undefined}
              icon={<MessageOutlined />}
            >
              Message
            </Button>
            <Button
              disabled={!id}
              href={id ? `/alumni/profile/${encodeURIComponent(id)}` : undefined}
              icon={<EyeOutlined />}
            >
              View
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <PublicShell title="Alumni List" description="Search and filter tenant alumni">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Form
        form={form}
        layout="inline"
        onFinish={(values) => loadRows(values)}
        style={{ gap: 8, marginBottom: 16 }}
      >
        <Form.Item name="search">
          <Input.Search
            allowClear
            placeholder="Search alumni"
            onSearch={() => loadRows(form.getFieldsValue())}
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
          <Button htmlType="submit" icon={<SearchOutlined />} type="primary">
            Search
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => loadRows(form.getFieldsValue())}>
            Refresh
          </Button>
        </Space>
      </Form>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 10 }}
          rowKey={(row, index) => rowID(row) || String(index)}
          scroll={{ x: true }}
        />
      </Spin>
    </PublicShell>
  );
}
