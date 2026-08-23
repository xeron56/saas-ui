import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Popconfirm, Select, Switch, Tag } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogItem } from '../Catalog/types';
import {
  createRetailAddonGroup,
  deleteRetailAddonGroup,
  getRetailAddonGroup,
  listCatalogItems,
  listRetailAddonGroups,
  updateRetailAddonGroup,
} from './service';
import type {
  RetailAddonGroupRecord,
  RetailAddonGroupRequest,
  RetailAddonGroupStatus,
} from './types';

const statusColor: Record<RetailAddonGroupStatus, string> = {
  active: 'green',
  inactive: 'default',
};

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const AddonGroupPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<RetailAddonGroupRequest>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RetailAddonGroupRecord>();
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<CatalogItem[]>([]);

  const productOptions = useMemo(
    () =>
      items.map((item) => ({
        label: `${item.display_name || item.item_code || item.id}${
          item.item_code ? ` (${item.item_code})` : ''
        }`,
        value: item.id,
      })),
    [items],
  );

  useEffect(() => {
    listCatalogItems({ page_size: 200, active: true })
      .then((resp) => setItems(resp.items || resp.data || []))
      .catch(() => setItems([]));
  }, []);

  const openNew = () => {
    setEditing(undefined);
    form.setFieldsValue({
      label: '',
      code: undefined,
      multiple_selection: false,
      product_ids: [],
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEdit = async (record: RetailAddonGroupRecord) => {
    const detail = await getRetailAddonGroup(record.id);
    setEditing(detail);
    form.setFieldsValue({
      label: detail.label,
      code: detail.code || detail.addon_group_code,
      multiple_selection: !!detail.multiple_selection,
      product_ids: (detail.products || []).map((product) => product.product_id),
      status: detail.status || 'active',
    });
    setModalOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateRetailAddonGroup(editing.id, values);
        message.success('Add-on group updated');
      } else {
        await createRetailAddonGroup(values);
        message.success('Add-on group created');
      }
      setModalOpen(false);
      setEditing(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailAddonGroupRecord>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      search: false,
      width: 140,
      renderText: (_, record) => record.code || record.addon_group_code || '-',
    },
    {
      title: 'Group',
      dataIndex: 'label',
      search: false,
      render: (_, record) => <a onClick={() => openEdit(record)}>{record.label}</a>,
    },
    {
      title: 'Selection',
      dataIndex: 'multiple_selection',
      search: false,
      width: 130,
      render: (_, record) => (record.multiple_selection ? 'Multiple' : 'Single'),
    },
    {
      title: 'Products',
      dataIndex: 'products',
      search: false,
      render: (_, record) => {
        const products = record.products || [];
        if (!products.length) return '-';
        return products
          .slice(0, 3)
          .map((product) => (
            <Tag key={product.product_id}>
              {product.name || product.display_name || product.product_code}
            </Tag>
          ));
      },
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
        const status = (record.status || 'active') as RetailAddonGroupStatus;
        return <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>;
      },
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
          title="Delete add-on group?"
          onConfirm={async () => {
            await deleteRetailAddonGroup(record.id);
            message.success('Add-on group deleted');
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
      <ProTable<RetailAddonGroupRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailAddonGroups({
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
            New add-on group
          </Button>,
        ]}
      />
      <Modal
        title={editing ? 'Edit add-on group' : 'New add-on group'}
        open={modalOpen}
        onOk={submit}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form<RetailAddonGroupRequest> form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="label"
            label="Group name"
            rules={[{ required: true, message: 'Enter a group name' }]}
          >
            <Input maxLength={250} />
          </Form.Item>
          <Form.Item name="code" label="Code">
            <Input maxLength={30} placeholder="Generated when blank" />
          </Form.Item>
          <Form.Item name="multiple_selection" label="Multiple selection" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="product_ids" label="Add-on products">
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              options={productOptions}
            />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AddonGroupPage;
