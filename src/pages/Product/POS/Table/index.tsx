import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createRetailTable,
  deleteRetailTable,
  getRetailTable,
  listRetailTables,
  updateRetailTable,
} from './service';
import type { RetailTableRecord, RetailTableRequest, RetailTableStatus } from './types';

const statusColor: Record<RetailTableStatus, string> = {
  active: 'green',
  inactive: 'default',
  occupied: 'blue',
  reserved: 'gold',
};

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Reserved', value: 'reserved' },
];

const TablePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<RetailTableRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RetailTableRecord>();
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(undefined);
    form.setFieldsValue({
      table_number: '',
      occupant_capacity: 4,
      status: 'active',
      waiter_user_id: undefined,
      branch_id: undefined,
      notes: undefined,
    });
    setModalOpen(true);
  };

  const openEdit = async (record: RetailTableRecord) => {
    const detail = await getRetailTable(record.id);
    setEditing(detail);
    form.setFieldsValue({
      table_number: detail.table_number,
      occupant_capacity: detail.occupant_capacity || detail.no_of_occupants || 4,
      status: detail.status || 'active',
      waiter_user_id: detail.waiter_user_id,
      branch_id: detail.branch_id,
      notes: detail.notes,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateRetailTable(editing.id, values);
        message.success('Table updated');
      } else {
        await createRetailTable(values);
        message.success('Table created');
      }
      setModalOpen(false);
      setEditing(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailTableRecord>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Table',
      dataIndex: 'table_number',
      render: (_, record) => <a onClick={() => openEdit(record)}>{record.table_number}</a>,
    },
    {
      title: 'Seats',
      dataIndex: 'occupant_capacity',
      search: false,
      width: 100,
      renderText: (_, record) => record.occupant_capacity || record.no_of_occupants || 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active' },
        inactive: { text: 'Inactive' },
        occupied: { text: 'Occupied' },
        reserved: { text: 'Reserved' },
      },
      render: (_, record) => {
        const status = (record.status || 'active') as RetailTableStatus;
        return <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Waiter',
      dataIndex: 'waiter_user_id',
      search: false,
      width: 180,
      ellipsis: true,
      renderText: (value) => value || '-',
    },
    {
      title: 'Branch',
      dataIndex: 'branch_id',
      search: false,
      width: 180,
      ellipsis: true,
      renderText: (value) => value || '-',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      search: false,
      ellipsis: true,
      renderText: (value) => value || '-',
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
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />,
        <Popconfirm
          key="delete"
          title="Delete table?"
          onConfirm={async () => {
            await deleteRetailTable(record.id);
            message.success('Table deleted');
            actionRef.current?.reload();
          }}
        >
          <Button danger type="link" icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<RetailTableRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailTables({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            status: params.status,
          });
          return {
            data: resp.items || resp.data || [],
            total: resp.filter_size || resp.total_size || 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openNew}>
            New table
          </Button>,
        ]}
      />
      <Modal
        title={editing ? 'Edit table' : 'New table'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form<RetailTableRequest> form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="table_number"
            label="Table number"
            rules={[{ required: true, message: 'Enter a table number' }]}
          >
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item
            name="occupant_capacity"
            label="Seats"
            rules={[{ required: true, message: 'Enter the seat count' }]}
          >
            <InputNumber min={1} max={10000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="waiter_user_id" label="Waiter user ID">
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="branch_id" label="Branch ID">
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea maxLength={512} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TablePage;
