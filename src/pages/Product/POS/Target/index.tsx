import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createRetailTarget,
  deleteRetailTarget,
  getRetailTarget,
  listRetailTargets,
  updateRetailTarget,
} from './service';
import type { RetailTargetRecord, RetailTargetRequest } from './types';

const moneyFormatter = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const defaultTargetValues: RetailTargetRequest = {
  month: new Date().toISOString().slice(0, 7),
  income: 0,
  expense: 0,
  sales: 0,
  net_profit: 0,
};

const TargetPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<RetailTargetRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RetailTargetRecord>();
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(undefined);
    form.setFieldsValue(defaultTargetValues);
    setModalOpen(true);
  };

  const openEdit = async (record: RetailTargetRecord) => {
    const detail = await getRetailTarget(record.id);
    setEditing(detail);
    form.setFieldsValue({
      month: detail.month,
      income: detail.income ?? detail.income_target ?? 0,
      expense: detail.expense ?? detail.expense_target ?? 0,
      sales: detail.sales ?? detail.sales_target ?? 0,
      net_profit: detail.net_profit ?? detail.net_profit_target ?? 0,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateRetailTarget(editing.id, values);
        message.success('Target updated');
      } else {
        await createRetailTarget(values);
        message.success('Target created');
      }
      setModalOpen(false);
      setEditing(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailTargetRecord>[] = [
    {
      title: 'Month',
      dataIndex: 'month',
      render: (_, record) => (
        <a onClick={() => openEdit(record)}>{record.month_label || record.month}</a>
      ),
    },
    {
      title: 'Income',
      dataIndex: 'income',
      search: false,
      align: 'right',
      renderText: (_, record) => moneyFormatter(record.income ?? record.income_target),
    },
    {
      title: 'Expense',
      dataIndex: 'expense',
      search: false,
      align: 'right',
      renderText: (_, record) => moneyFormatter(record.expense ?? record.expense_target),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      search: false,
      align: 'right',
      renderText: (_, record) => moneyFormatter(record.sales ?? record.sales_target),
    },
    {
      title: 'Net profit',
      dataIndex: 'net_profit',
      search: false,
      align: 'right',
      renderText: (_, record) => moneyFormatter(record.net_profit ?? record.net_profit_target),
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
          title="Delete target?"
          onConfirm={async () => {
            await deleteRetailTarget(record.id);
            message.success('Target deleted');
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
      <ProTable<RetailTargetRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailTargets({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            month: params.month,
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
            New target
          </Button>,
        ]}
      />
      <Modal
        title={editing ? 'Edit target' : 'New target'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form<RetailTargetRequest> form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="month"
            label="Month"
            rules={[
              { required: true, message: 'Enter a target month' },
              { pattern: /^\d{4}-\d{2}$/, message: 'Use YYYY-MM' },
            ]}
          >
            <Input placeholder="YYYY-MM" maxLength={7} />
          </Form.Item>
          <Form.Item name="income" label="Income target" rules={[{ required: true }]}>
            <InputNumber precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expense" label="Expense target" rules={[{ required: true }]}>
            <InputNumber precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sales" label="Sales target" rules={[{ required: true }]}>
            <InputNumber precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="net_profit" label="Net profit target" rules={[{ required: true }]}>
            <InputNumber precision={2} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TargetPage;
