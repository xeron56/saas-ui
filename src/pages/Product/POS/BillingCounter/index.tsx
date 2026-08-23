import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createRetailBillingCounter,
  deleteRetailBillingCounter,
  getRetailBillingCounter,
  listRetailBillingCounters,
  updateRetailBillingCounter,
} from './service';
import type {
  RetailBillingCounterRecord,
  RetailBillingCounterRequest,
  RetailBillingCounterStatus,
} from './types';

const statusColor: Record<RetailBillingCounterStatus, string> = {
  active: 'green',
  inactive: 'default',
};

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const BillingCounterPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<RetailBillingCounterRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RetailBillingCounterRecord>();
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(undefined);
    form.setFieldsValue({
      counter_code: '',
      counter_name: '',
      description: undefined,
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEdit = async (record: RetailBillingCounterRecord) => {
    const detail = await getRetailBillingCounter(record.id);
    setEditing(detail);
    form.setFieldsValue({
      counter_code: detail.counter_code || detail.billing_counter_code,
      counter_name: detail.counter_name || detail.billing_counter_name,
      description: detail.description,
      status: detail.status || 'active',
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateRetailBillingCounter(editing.id, values);
        message.success('Billing counter updated');
      } else {
        await createRetailBillingCounter(values);
        message.success('Billing counter created');
      }
      setModalOpen(false);
      setEditing(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailBillingCounterRecord>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Code',
      dataIndex: 'counter_code',
      search: false,
      width: 160,
      render: (_, record) => (
        <a onClick={() => openEdit(record)}>{record.counter_code || record.billing_counter_code}</a>
      ),
    },
    {
      title: 'Counter',
      dataIndex: 'counter_name',
      search: false,
      renderText: (_, record) => record.counter_name || record.billing_counter_name,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active' },
        inactive: { text: 'Inactive' },
      },
      width: 130,
      render: (_, record) => {
        const status = (record.status || 'active') as RetailBillingCounterStatus;
        return <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
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
          title="Delete billing counter?"
          onConfirm={async () => {
            await deleteRetailBillingCounter(record.id);
            message.success('Billing counter deleted');
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
      <ProTable<RetailBillingCounterRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailBillingCounters({
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
            New counter
          </Button>,
        ]}
      />
      <Modal
        title={editing ? 'Edit billing counter' : 'New billing counter'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form<RetailBillingCounterRequest> form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="counter_code"
            label="Counter code"
            rules={[{ required: true, message: 'Enter a counter code' }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item
            name="counter_name"
            label="Counter name"
            rules={[{ required: true, message: 'Enter a counter name' }]}
          >
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BillingCounterPage;
