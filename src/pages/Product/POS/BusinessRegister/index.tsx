import { DeleteOutlined, LoginOutlined, LogoutOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { listRetailBillingCounters } from '../BillingCounter/service';
import type { RetailBillingCounterRecord } from '../BillingCounter/types';
import {
  closeRetailBusinessRegister,
  deleteRetailBusinessRegister,
  listRetailBusinessRegisters,
  openRetailBusinessRegister,
} from './service';
import type {
  RetailBusinessRegisterCloseRequest,
  RetailBusinessRegisterOpenRequest,
  RetailBusinessRegisterRecord,
  RetailBusinessRegisterStatus,
} from './types';

const statusColor: Record<RetailBusinessRegisterStatus, string> = {
  open: 'green',
  closed: 'default',
};

const BusinessRegisterPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [openForm] = Form.useForm<RetailBusinessRegisterOpenRequest>();
  const [closeForm] = Form.useForm<RetailBusinessRegisterCloseRequest>();
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [closingRecord, setClosingRecord] = useState<RetailBusinessRegisterRecord>();
  const [counterOptions, setCounterOptions] = useState<RetailBillingCounterRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadCounters = async () => {
    const resp = await listRetailBillingCounters({
      page_offset: 0,
      page_size: 100,
      active: true,
    });
    setCounterOptions(resp.items || resp.data || []);
  };

  const openRegisterModal = async () => {
    await loadCounters();
    openForm.setFieldsValue({
      user_id: 'current',
      billing_counter_id: undefined,
      opening_amount: 0,
    });
    setOpenModal(true);
  };

  const closeRegisterModal = (record?: RetailBusinessRegisterRecord) => {
    setClosingRecord(record);
    closeForm.setFieldsValue({
      user_id: record?.user_id || 'current',
      closing_amount: record?.closing_amount || 0,
      credit_card_slips: record?.credit_card_slips || 0,
      cheques: record?.cheques || 0,
    });
    setCloseModal(true);
  };

  const submitOpen = async () => {
    const values = await openForm.validateFields();
    setSubmitting(true);
    try {
      await openRetailBusinessRegister(values);
      message.success('Register opened');
      setOpenModal(false);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const submitClose = async () => {
    const values = await closeForm.validateFields();
    setSubmitting(true);
    try {
      await closeRetailBusinessRegister(values);
      message.success('Register closed');
      setCloseModal(false);
      setClosingRecord(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailBusinessRegisterRecord>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'State',
      dataIndex: 'open',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        true: { text: 'Open' },
        false: { text: 'Closed' },
      },
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      width: 180,
      renderText: (value) => value || '-',
    },
    {
      title: 'Counter',
      dataIndex: 'billing_counter_id',
      search: false,
      width: 200,
      renderText: (_, record) =>
        record.billing_counter?.counter_name ||
        record.billing_counter?.billing_counter_name ||
        record.billing_counter_id ||
        '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      search: false,
      width: 120,
      render: (_, record) => {
        const status = (record.status ||
          (record.closing_at ? 'closed' : 'open')) as RetailBusinessRegisterStatus;
        return <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Opening amount',
      dataIndex: 'opening_amount',
      search: false,
      width: 150,
      renderText: (value) => Number(value || 0).toFixed(2),
    },
    {
      title: 'Closing amount',
      dataIndex: 'closing_amount',
      search: false,
      width: 150,
      renderText: (value) => Number(value || 0).toFixed(2),
    },
    {
      title: 'Opened',
      dataIndex: 'opening_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
      renderText: (_, record) =>
        record.opening_at || record.opening_date || record.opening_date_label || '-',
    },
    {
      title: 'Closed',
      dataIndex: 'closing_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
      renderText: (_, record) =>
        record.closing_at || record.closing_date || record.closing_date_label || '-',
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: 140,
      render: (_, record) => {
        const isOpen = record.status === 'open' || !record.closing_at;
        return [
          isOpen ? (
            <Button
              key="close"
              type="link"
              icon={<LogoutOutlined />}
              onClick={() => closeRegisterModal(record)}
            />
          ) : null,
          !isOpen ? (
            <Popconfirm
              key="delete"
              title="Delete business register?"
              onConfirm={async () => {
                await deleteRetailBusinessRegister(record.id);
                message.success('Business register deleted');
                actionRef.current?.reload();
              }}
            >
              <Button danger type="link" icon={<DeleteOutlined />} />
            </Popconfirm>
          ) : null,
        ].filter(Boolean);
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<RetailBusinessRegisterRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        scroll={{ x: 1120 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailBusinessRegisters({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            open: params.open,
            user_id: params.user_id,
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
          <Button key="close" icon={<LogoutOutlined />} onClick={() => closeRegisterModal()}>
            Close current
          </Button>,
          <Button key="open" type="primary" icon={<LoginOutlined />} onClick={openRegisterModal}>
            Open register
          </Button>,
        ]}
      />

      <Modal
        title="Open register"
        open={openModal}
        onOk={submitOpen}
        confirmLoading={submitting}
        onCancel={() => setOpenModal(false)}
        destroyOnClose
      >
        <Form<RetailBusinessRegisterOpenRequest> form={openForm} layout="vertical" preserve={false}>
          <Form.Item
            name="user_id"
            label="User ID"
            rules={[{ required: true, message: 'Enter a user ID' }]}
          >
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item
            name="billing_counter_id"
            label="Billing counter"
            rules={[{ required: true, message: 'Choose a billing counter' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={counterOptions.map((item) => ({
                label: `${item.counter_code || item.billing_counter_code} - ${
                  item.counter_name || item.billing_counter_name
                }`,
                value: item.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="opening_amount"
            label="Opening amount"
            rules={[{ required: true, message: 'Enter the opening amount' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={closingRecord ? 'Close register' : 'Close current register'}
        open={closeModal}
        onOk={submitClose}
        confirmLoading={submitting}
        onCancel={() => {
          setCloseModal(false);
          setClosingRecord(undefined);
        }}
        destroyOnClose
      >
        <Form<RetailBusinessRegisterCloseRequest>
          form={closeForm}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="user_id"
            label="User ID"
            rules={[{ required: true, message: 'Enter a user ID' }]}
          >
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item
            name="closing_amount"
            label="Closing amount"
            rules={[{ required: true, message: 'Enter the closing amount' }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="credit_card_slips" label="Credit card slips">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="cheques" label="Cheques">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BusinessRegisterPage;
