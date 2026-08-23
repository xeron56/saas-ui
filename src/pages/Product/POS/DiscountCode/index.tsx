import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createRetailDiscountCode,
  deleteRetailDiscountCode,
  getRetailDiscountCode,
  listRetailDiscountCodes,
  updateRetailDiscountCode,
} from './service';
import type {
  RetailDiscountCodeRecord,
  RetailDiscountCodeRequest,
  RetailDiscountCodeStatus,
} from './types';

const statusColor: Record<RetailDiscountCodeStatus, string> = {
  active: 'green',
  inactive: 'default',
};

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const DiscountCodePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<RetailDiscountCodeRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RetailDiscountCodeRecord>();
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(undefined);
    form.setFieldsValue({
      label: '',
      code: '',
      discount_percentage: 0,
      description: undefined,
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEdit = async (record: RetailDiscountCodeRecord) => {
    const detail = await getRetailDiscountCode(record.id);
    setEditing(detail);
    form.setFieldsValue({
      label: detail.label,
      code: detail.code || detail.discount_code,
      discount_percentage: detail.discount_percentage,
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
        await updateRetailDiscountCode(editing.id, values);
        message.success('Discount code updated');
      } else {
        await createRetailDiscountCode(values);
        message.success('Discount code created');
      }
      setModalOpen(false);
      setEditing(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailDiscountCodeRecord>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Label',
      dataIndex: 'label',
      search: false,
      render: (_, record) => <a onClick={() => openEdit(record)}>{record.label}</a>,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      search: false,
      width: 150,
      renderText: (_, record) => record.code || record.discount_code,
    },
    {
      title: 'Discount',
      dataIndex: 'discount_percentage',
      search: false,
      width: 120,
      renderText: (value) => `${Number(value || 0).toFixed(2)}%`,
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
        const status = (record.status || 'active') as RetailDiscountCodeStatus;
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
          title="Delete discount code?"
          onConfirm={async () => {
            await deleteRetailDiscountCode(record.id);
            message.success('Discount code deleted');
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
      <ProTable<RetailDiscountCodeRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailDiscountCodes({
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
            New discount
          </Button>,
        ]}
      />
      <Modal
        title={editing ? 'Edit discount code' : 'New discount code'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form<RetailDiscountCodeRequest> form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="label"
            label="Label"
            rules={[{ required: true, message: 'Enter a label' }]}
          >
            <Input maxLength={250} />
          </Form.Item>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Enter a discount code' }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item
            name="discount_percentage"
            label="Discount percentage"
            rules={[{ required: true, message: 'Enter a discount percentage' }]}
          >
            <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
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

export default DiscountCodePage;
