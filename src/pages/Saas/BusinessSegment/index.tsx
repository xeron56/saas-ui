import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, Form, Input, message, Modal, Space, Switch, Tag, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createBusinessSegment,
  deleteBusinessSegment,
  deleteBusinessSegments,
  listBusinessSegments,
  updateBusinessSegment,
  updateBusinessSegmentStatus,
} from './service';
import type { BusinessSegment } from './types';

const readField = <T,>(record: Record<string, any> | undefined, snake: string, camel: string) =>
  (record?.[snake] ?? record?.[camel]) as T | undefined;

const readName = (record?: BusinessSegment) =>
  readField<string>(record, 'display_name', 'displayName') ?? record?.name ?? '';

const readActive = (record?: BusinessSegment) => record?.status ?? record?.active ?? false;

const readCreatedAt = (record?: BusinessSegment) =>
  readField<string>(record, 'created_at', 'createdAt');

const BusinessSegmentPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState<BusinessSegment>();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<BusinessSegment[]>([]);

  const openEditor = (record?: BusinessSegment) => {
    setEditing(record);
    form.setFieldsValue({
      name: readName(record),
      description: record?.description,
      status: record ? readActive(record) : true,
    });
    setModalOpen(true);
  };

  const columns: ProColumns<BusinessSegment>[] = [
    {
      title: intl.formatMessage({ id: 'saas.businessSegment.name', defaultMessage: 'Name' }),
      dataIndex: 'name',
      render: (_, record) => readName(record),
    },
    {
      title: intl.formatMessage({
        id: 'saas.businessSegment.description',
        defaultMessage: 'Description',
      }),
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'saas.businessSegment.status', defaultMessage: 'Status' }),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active' },
        inactive: { text: 'Inactive' },
      },
      render: (_, record) => (
        <Tag color={readActive(record) ? 'green' : 'default'}>
          {readActive(record) ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({ id: 'common.createdAt', defaultMessage: 'CreatedAt' }),
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
      renderText: (_, record) => readCreatedAt(record),
    },
    {
      title: intl.formatMessage({ id: 'common.operate', defaultMessage: 'Operate' }),
      valueType: 'option',
      width: 168,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={intl.formatMessage({ id: 'common.edit', defaultMessage: 'Edit' })}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditor(record)}
            />
          </Tooltip>
          <Tooltip title={readActive(record) ? 'Disable' : 'Enable'}>
            <Switch
              size="small"
              checked={readActive(record)}
              onChange={async (checked) => {
                await updateBusinessSegmentStatus(record.id, checked);
                actionRef.current?.reload();
              }}
            />
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: 'common.delete', defaultMessage: 'Delete' })}>
            <Button
              danger
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                  onOk: async () => {
                    await deleteBusinessSegment(record.id);
                    actionRef.current?.reload();
                  },
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<BusinessSegment>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        request={async (params) => {
          const resp = await listBusinessSegments({
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword ?? params.name,
            status: params.status,
          });
          return {
            data: resp.data ?? [],
            success: true,
            total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
            {intl.formatMessage({ id: 'common.new', defaultMessage: 'New' })}
          </Button>,
          <Button
            key="delete"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedRows.length === 0}
            onClick={() =>
              Modal.confirm({
                title: intl.formatMessage({ id: 'common.confirm', defaultMessage: 'Confirm' }),
                onOk: async () => {
                  await deleteBusinessSegments(selectedRows.map((item) => item.id));
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
              })
            }
          />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
        ]}
      />
      <Modal
        destroyOnClose
        open={modalOpen}
        title={
          editing
            ? intl.formatMessage({
                id: 'saas.businessSegment.edit',
                defaultMessage: 'Edit Segment',
              })
            : intl.formatMessage({ id: 'saas.businessSegment.new', defaultMessage: 'New Segment' })
        }
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          setSubmitting(true);
          try {
            if (editing) {
              await updateBusinessSegment(editing.id, values);
            } else {
              await createBusinessSegment(values);
            }
            message.success(
              intl.formatMessage({ id: 'common.success', defaultMessage: 'Success' }),
            );
            setModalOpen(false);
            actionRef.current?.reload();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <Form form={form} layout="vertical" initialValues={{ status: true }}>
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'saas.businessSegment.name', defaultMessage: 'Name' })}
            rules={[{ required: true, whitespace: true, max: 255 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: 'saas.businessSegment.description',
              defaultMessage: 'Description',
            })}
            rules={[{ max: 255 }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="status"
            label={intl.formatMessage({
              id: 'saas.businessSegment.status',
              defaultMessage: 'Status',
            })}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BusinessSegmentPage;
