import {
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  createAdminBusiness,
  deleteAdminBusiness,
  deleteAdminBusinesses,
  getAdminBusiness,
  getAdminBusinessesMeta,
  listAdminBusinesses,
  updateAdminBusiness,
  updateAdminBusinessStatus,
  upgradeAdminBusinessPlan,
} from './service';
import type {
  AdminBusiness,
  AdminBusinessCategory,
  AdminBusinessMetaReply,
  AdminBusinessPlan,
} from './types';

const readField = <T,>(record: Record<string, any> | undefined, snake: string, camel: string) =>
  (record?.[snake] ?? record?.[camel]) as T | undefined;

const readCompanyName = (record?: AdminBusiness) =>
  record?.companyName ?? record?.company_name ?? record?.name ?? record?.tenant_name ?? '';

const readPhone = (record?: AdminBusiness) =>
  record?.phoneNumber ?? record?.phone_number ?? record?.phone ?? '';

const readCategoryId = (record?: AdminBusiness) =>
  record?.business_category_id ?? record?.businessCategoryId ?? record?.business_category?.id ?? '';

const readCategoryName = (record?: AdminBusiness) =>
  record?.business_category?.displayName ??
  record?.business_category?.display_name ??
  record?.business_category?.name ??
  '';

const readPlanKey = (record?: AdminBusiness) =>
  record?.planKey ??
  record?.plan_key ??
  record?.requestedPlanKey ??
  record?.requested_plan_key ??
  '';

const readOpeningBalance = (record?: AdminBusiness) =>
  record?.shopOpeningBalance ?? record?.shop_opening_balance ?? record?.openingBalance ?? 0;

const readActive = (record?: AdminBusiness) => record?.status ?? record?.active ?? false;

const readCreatedAt = (record?: AdminBusiness) =>
  readField<string>(record, 'created_at', 'createdAt');

const readCategoryLabel = (category: AdminBusinessCategory) =>
  category.displayName ?? category.display_name ?? category.name ?? category.id ?? '';

const readPlanKeyFromMeta = (plan: AdminBusinessPlan) =>
  plan.key ?? plan.planKey ?? plan.plan_key ?? plan.id ?? '';

const readPlanLabel = (plan: AdminBusinessPlan) =>
  plan.subscriptionName ??
  plan.subscription_name ??
  plan.displayName ??
  plan.display_name ??
  readPlanKeyFromMeta(plan);

const BusinessPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [upgradeForm] = Form.useForm();
  const [editing, setEditing] = useState<AdminBusiness>();
  const [upgrading, setUpgrading] = useState<AdminBusiness>();
  const [currentRow, setCurrentRow] = useState<AdminBusiness>();
  const [modalOpen, setModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [upgradeSubmitting, setUpgradeSubmitting] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [meta, setMeta] = useState<AdminBusinessMetaReply>({});
  const [selectedRows, setSelectedRows] = useState<AdminBusiness[]>([]);

  const categoryOptions = useMemo(
    () =>
      (meta.categories ?? [])
        .map((category) => ({
          label: readCategoryLabel(category),
          value: category.id ?? '',
        }))
        .filter((option) => option.value),
    [meta.categories],
  );

  const planOptions = useMemo(
    () =>
      (meta.plans ?? [])
        .map((plan) => ({
          label: readPlanLabel(plan),
          value: readPlanKeyFromMeta(plan),
        }))
        .filter((option) => option.value),
    [meta.plans],
  );

  const loadMeta = async () => {
    setMetaLoading(true);
    try {
      setMeta(await getAdminBusinessesMeta());
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  const openEditor = async (record?: AdminBusiness) => {
    let nextRecord = record;
    if (record?.id) {
      try {
        const detail = await getAdminBusiness(record.id);
        nextRecord = detail.data ?? record;
      } catch {
        nextRecord = record;
      }
    }
    setEditing(nextRecord);
    form.setFieldsValue({
      address: nextRecord?.address,
      business_category_id: readCategoryId(nextRecord),
      companyName: readCompanyName(nextRecord),
      email: nextRecord?.email ?? nextRecord?.owner?.email,
      logo:
        (nextRecord as any)?.logo ??
        (nextRecord as any)?.pictureUrl ??
        (nextRecord as any)?.picture_url,
      password: undefined,
      password_confirmation: undefined,
      phoneNumber: readPhone(nextRecord),
      plan_key: readPlanKey(nextRecord),
      region: (nextRecord as any)?.region,
      shopOpeningBalance: readOpeningBalance(nextRecord),
      status: nextRecord ? readActive(nextRecord) : true,
    });
    setModalOpen(true);
  };

  const openUpgrade = (record: AdminBusiness) => {
    setUpgrading(record);
    upgradeForm.setFieldsValue({
      gateway: 'sslcommerz',
      notes: 'Admin plan upgrade',
      plan_key: readPlanKey(record) || undefined,
    });
    setUpgradeModalOpen(true);
  };

  const columns: ProColumns<AdminBusiness>[] = [
    {
      title: intl.formatMessage({ id: 'saas.business.companyName', defaultMessage: 'Company' }),
      dataIndex: 'companyName',
      render: (_, record) => (
        <a
          onClick={() => {
            setCurrentRow(record);
            setDrawerOpen(true);
          }}
        >
          {readCompanyName(record)}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'saas.business.ownerEmail', defaultMessage: 'Owner Email' }),
      dataIndex: 'email',
      renderText: (_, record) => record.email ?? record.owner?.email ?? '',
    },
    {
      title: intl.formatMessage({ id: 'saas.business.phone', defaultMessage: 'Phone' }),
      dataIndex: 'phoneNumber',
      renderText: (_, record) => readPhone(record),
    },
    {
      title: intl.formatMessage({ id: 'saas.business.category', defaultMessage: 'Category' }),
      dataIndex: 'business_category_id',
      valueType: 'select',
      valueEnum: categoryOptions.reduce<Record<string, { text: string }>>((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
      renderText: (_, record) => readCategoryName(record) || readCategoryId(record),
    },
    {
      title: intl.formatMessage({ id: 'saas.business.plan', defaultMessage: 'Plan' }),
      dataIndex: 'plan_key',
      valueType: 'select',
      valueEnum: planOptions.reduce<Record<string, { text: string }>>((acc, item) => {
        acc[item.value] = { text: item.label };
        return acc;
      }, {}),
      renderText: (_, record) => readPlanKey(record),
    },
    {
      title: intl.formatMessage({
        id: 'saas.business.openingBalance',
        defaultMessage: 'Opening Balance',
      }),
      dataIndex: 'shopOpeningBalance',
      search: false,
      renderText: (_, record) => readOpeningBalance(record),
    },
    {
      title: intl.formatMessage({ id: 'saas.business.status', defaultMessage: 'Status' }),
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
      width: 224,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title={intl.formatMessage({ id: 'common.detail', defaultMessage: 'Detail' })}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentRow(record);
                setDrawerOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: 'common.edit', defaultMessage: 'Edit' })}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditor(record)}
            />
          </Tooltip>
          <Tooltip
            title={intl.formatMessage({
              id: 'saas.business.upgradePlan',
              defaultMessage: 'Upgrade Plan',
            })}
          >
            <Button
              type="text"
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={planOptions.length === 0}
              onClick={() => openUpgrade(record)}
            />
          </Tooltip>
          <Tooltip title={readActive(record) ? 'Disable' : 'Enable'}>
            <Switch
              size="small"
              checked={readActive(record)}
              onChange={async (checked) => {
                await updateAdminBusinessStatus(record.id, checked);
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
                    await deleteAdminBusiness(record.id);
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
      <ProTable<AdminBusiness>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        rowSelection={{
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        request={async (params) => {
          const resp = await listAdminBusinesses({
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword ?? params.companyName ?? params.email ?? params.phoneNumber,
            business_category_id: params.business_category_id,
            plan_key: params.plan_key,
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
                  await deleteAdminBusinesses(selectedRows.map((item) => item.id));
                  setSelectedRows([]);
                  actionRef.current?.reloadAndRest?.();
                },
              })
            }
          />,
          <Button
            key="reload-meta"
            icon={<ReloadOutlined />}
            loading={metaLoading}
            onClick={async () => {
              await loadMeta();
              actionRef.current?.reload();
            }}
          />,
        ]}
      />

      <Modal
        destroyOnClose
        open={modalOpen}
        title={
          editing
            ? intl.formatMessage({ id: 'saas.business.edit', defaultMessage: 'Edit Business' })
            : intl.formatMessage({ id: 'saas.business.new', defaultMessage: 'New Business' })
        }
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          setSubmitting(true);
          try {
            const payload = { ...values };
            if (!payload.password) {
              delete payload.password;
              delete payload.password_confirmation;
            }
            if (editing) {
              await updateAdminBusiness(editing.id, payload);
            } else {
              await createAdminBusiness(payload);
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
            name="companyName"
            label={intl.formatMessage({
              id: 'saas.business.companyName',
              defaultMessage: 'Company',
            })}
            rules={[{ required: true, whitespace: true, max: 250 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label={intl.formatMessage({
              id: 'saas.business.ownerEmail',
              defaultMessage: 'Owner Email',
            })}
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label={intl.formatMessage({ id: 'saas.business.phone', defaultMessage: 'Phone' })}
            rules={[{ max: 50 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label={intl.formatMessage({ id: 'saas.business.address', defaultMessage: 'Address' })}
            rules={[{ max: 250 }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="business_category_id"
            label={intl.formatMessage({
              id: 'saas.business.category',
              defaultMessage: 'Category',
            })}
            rules={[{ required: categoryOptions.length > 0 }]}
          >
            <Select allowClear options={categoryOptions} loading={metaLoading} />
          </Form.Item>
          <Form.Item
            name="plan_key"
            label={intl.formatMessage({ id: 'saas.business.plan', defaultMessage: 'Plan' })}
          >
            <Select allowClear options={planOptions} loading={metaLoading} />
          </Form.Item>
          <Form.Item
            name="shopOpeningBalance"
            label={intl.formatMessage({
              id: 'saas.business.openingBalance',
              defaultMessage: 'Opening Balance',
            })}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="logo"
            label={intl.formatMessage({ id: 'saas.business.logo', defaultMessage: 'Logo URL' })}
            rules={[{ type: 'url', warningOnly: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="region"
            label={intl.formatMessage({ id: 'saas.business.region', defaultMessage: 'Region' })}
            rules={[{ max: 64 }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label={intl.formatMessage({
              id: 'saas.business.password',
              defaultMessage: 'Password',
            })}
            rules={editing ? [{ min: 4 }] : [{ required: true, min: 4 }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="password_confirmation"
            label={intl.formatMessage({
              id: 'saas.business.passwordConfirmation',
              defaultMessage: 'Confirm Password',
            })}
            dependencies={['password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue('password');
                  if (!password && editing) {
                    return Promise.resolve();
                  }
                  if (!value && !editing) {
                    return Promise.reject(new Error('Confirm password is required'));
                  }
                  if (password === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="status"
            label={intl.formatMessage({ id: 'saas.business.status', defaultMessage: 'Status' })}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        destroyOnClose
        open={upgradeModalOpen}
        title={intl.formatMessage({
          id: 'saas.business.upgradePlan',
          defaultMessage: 'Upgrade Plan',
        })}
        confirmLoading={upgradeSubmitting}
        onCancel={() => {
          if (!upgradeSubmitting) {
            setUpgradeModalOpen(false);
            setUpgrading(undefined);
          }
        }}
        onOk={() => upgradeForm.submit()}
      >
        <Form
          form={upgradeForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!upgrading?.id) {
              return;
            }
            setUpgradeSubmitting(true);
            try {
              await upgradeAdminBusinessPlan(upgrading.id, values);
              message.success(
                intl.formatMessage({ id: 'common.success', defaultMessage: 'Success' }),
              );
              setUpgradeModalOpen(false);
              setUpgrading(undefined);
              actionRef.current?.reload();
            } finally {
              setUpgradeSubmitting(false);
            }
          }}
        >
          <Form.Item
            name="plan_key"
            label={intl.formatMessage({ id: 'saas.business.plan', defaultMessage: 'Plan' })}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              loading={metaLoading}
              options={planOptions}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="gateway"
            label={intl.formatMessage({
              id: 'saas.subscriptionOrder.gateway',
              defaultMessage: 'Gateway',
            })}
          >
            <Select options={[{ label: 'SSLCommerz', value: 'sslcommerz' }]} />
          </Form.Item>
          <Form.Item
            name="notes"
            label={intl.formatMessage({
              id: 'saas.subscriptionOrder.notes',
              defaultMessage: 'Notes',
            })}
            rules={[{ required: true, max: 255 }]}
          >
            <Input.TextArea rows={4} maxLength={255} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        width={760}
        open={drawerOpen}
        onClose={() => {
          setCurrentRow(undefined);
          setDrawerOpen(false);
        }}
        destroyOnClose
      >
        {currentRow?.id && (
          <ProDescriptions<AdminBusiness>
            column={1}
            title={readCompanyName(currentRow)}
            request={async () => {
              const resp = await getAdminBusiness(currentRow.id);
              return { data: resp.data ?? currentRow };
            }}
            params={{ id: currentRow.id }}
            columns={columns as ProDescriptionsItemProps<AdminBusiness>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default BusinessPage;
