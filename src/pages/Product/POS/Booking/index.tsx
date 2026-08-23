import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createRetailBooking,
  deleteRetailBooking,
  getRetailBooking,
  listRetailBookings,
  updateRetailBooking,
} from './service';
import type { RetailBookingRecord, RetailBookingRequest, RetailBookingType } from './types';

const typeColor: Record<string, string> = {
  BOOKING: 'green',
  EVENT: 'blue',
};

const typeOptions = [
  { label: 'Booking', value: 'BOOKING' },
  { label: 'Event', value: 'EVENT' },
];

const today = () => new Date().toISOString().slice(0, 10);

const BookingPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<RetailBookingRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RetailBookingRecord>();
  const [submitting, setSubmitting] = useState(false);

  const openNew = () => {
    setEditing(undefined);
    form.setFieldsValue({
      event_type: 'BOOKING',
      start_date: today(),
      start_time: '12:00 PM',
      end_date: today(),
      end_time: '11:59 PM',
      no_of_persons: 0,
      name: undefined,
      email: undefined,
      phone: undefined,
      description: undefined,
    });
    setModalOpen(true);
  };

  const openEdit = async (record: RetailBookingRecord) => {
    const detail = await getRetailBooking(record.id);
    setEditing(detail);
    form.setFieldsValue({
      event_code: detail.event_code,
      event_type: detail.event_type || 'BOOKING',
      start_date: detail.start_date,
      start_time: detail.start_time,
      end_date: detail.end_date,
      end_time: detail.end_time,
      name: detail.name,
      email: detail.email,
      phone: detail.phone,
      description: detail.description,
      no_of_persons: detail.no_of_persons || detail.party_size || 0,
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateRetailBooking(editing.id, values);
        message.success('Booking updated');
      } else {
        await createRetailBooking(values);
        message.success('Booking created');
      }
      setModalOpen(false);
      setEditing(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailBookingRecord>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Type',
      dataIndex: 'event_type',
      valueType: 'select',
      valueEnum: {
        BOOKING: { text: 'Booking' },
        EVENT: { text: 'Event' },
      },
      width: 120,
      render: (_, record) => {
        const type = String(record.event_type || 'BOOKING').toUpperCase();
        return <Tag color={typeColor[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: 'Code',
      dataIndex: 'event_code',
      search: false,
      width: 140,
      render: (_, record) => <a onClick={() => openEdit(record)}>{record.event_code}</a>,
    },
    {
      title: 'Start',
      dataIndex: 'start_date',
      search: false,
      width: 190,
      renderText: (_, record) =>
        record.start_date_raw || `${record.start_date} ${record.start_time}`,
    },
    {
      title: 'End',
      dataIndex: 'end_date',
      search: false,
      width: 190,
      renderText: (_, record) => record.end_date_raw || `${record.end_date} ${record.end_time}`,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      search: false,
      ellipsis: true,
      renderText: (value) => value || '-',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      search: false,
      width: 150,
      renderText: (value) => value || '-',
    },
    {
      title: 'People',
      dataIndex: 'no_of_persons',
      search: false,
      width: 100,
      renderText: (_, record) => record.no_of_persons || record.party_size || 0,
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />,
        <Popconfirm
          key="delete"
          title="Delete booking?"
          onConfirm={async () => {
            await deleteRetailBooking(record.id);
            message.success('Booking deleted');
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
      <ProTable<RetailBookingRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailBookings({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            event_type: params.event_type,
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
            New booking
          </Button>,
        ]}
      />
      <Modal
        title={editing ? 'Edit booking' : 'New booking'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form<RetailBookingRequest> form={form} layout="vertical" preserve={false}>
          {editing?.event_code ? (
            <Form.Item name="event_code" label="Event code">
              <Input maxLength={30} />
            </Form.Item>
          ) : null}
          <Form.Item name="event_type" label="Type" rules={[{ required: true }]}>
            <Select<RetailBookingType> options={typeOptions} />
          </Form.Item>
          <Form.Item
            name="start_date"
            label="Start date"
            rules={[
              { required: true, message: 'Enter a start date' },
              { pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'Use YYYY-MM-DD' },
            ]}
          >
            <Input placeholder="YYYY-MM-DD" maxLength={10} />
          </Form.Item>
          <Form.Item name="start_time" label="Start time">
            <Input placeholder="10:00 AM" maxLength={8} />
          </Form.Item>
          <Form.Item
            name="end_date"
            label="End date"
            rules={[
              { required: true, message: 'Enter an end date' },
              { pattern: /^\d{4}-\d{2}-\d{2}$/, message: 'Use YYYY-MM-DD' },
            ]}
          >
            <Input placeholder="YYYY-MM-DD" maxLength={10} />
          </Form.Item>
          <Form.Item name="end_time" label="End time">
            <Input placeholder="11:59 PM" maxLength={8} />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input maxLength={250} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item name="no_of_persons" label="People">
            <InputNumber min={0} max={100000} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BookingPage;
