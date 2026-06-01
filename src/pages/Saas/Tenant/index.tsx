import { PlusOutlined } from '@ant-design/icons';
import type {
  ActionType,
  ProColumnType,
  ProDescriptionsItemProps,
} from '@ant-design/pro-components';
import {
  PageContainer,
  ProDescriptions,
  ProTable,
  TableDropdown,
} from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, Drawer, message, Image, Modal, Form, Select, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
import { requestTransform } from '@gosaas/core';
import type {
  V1CreateTenantRequest,
  V1UpdateTenant,
  TenantServiceUpdateTenantRequest,
  V1Tenant,
  V1TenantFilter,
  V1Plan,
} from '@gosaas/api';
import { PlanServiceApi, TenantServiceApi } from '@gosaas/api';
import { upgradeTenantPlan } from '../SubscriptionOrder/service';

import { useIntl } from '@umijs/max';

const service = new TenantServiceApi();
const planService = new PlanServiceApi();

const TableList: React.FC = () => {
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState<boolean>(false);
  const [upgradeLoading, setUpgradeLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<V1Plan[]>([]);
  const [upgradeForm] = Form.useForm();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<V1Tenant | undefined | null>(undefined);

  const intl = useIntl();
  useEffect(() => {
    planService
      .planServiceListPlan2({ body: { pageSize: -1 } })
      .then((resp) => setPlans(resp.data.items ?? []));
  }, []);

  const handleAdd = async (fields: V1CreateTenantRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.creating', defaultMessage: 'Creating...' }),
    );
    try {
      await service.tenantServiceCreateTenant({ body: fields });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.created', defaultMessage: 'Created Successfully' }),
      );
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleUpdate = async (fields: TenantServiceUpdateTenantRequest) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
    );
    try {
      await service.tenantServiceUpdateTenant2({ body: fields, tenantId: currentRow!.id! });
      hide();
      message.success(
        intl.formatMessage({ id: 'common.updated', defaultMessage: 'Update Successfully' }),
      );
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const handleRemove = async (selectedRow: V1Tenant) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await service.tenantServiceDeleteTenant({ id: selectedRow.id! });
      message.success(
        intl.formatMessage({ id: 'common.deleted', defaultMessage: 'Delete Successfully' }),
      );
      hide();
      return true;
    } catch (error) {
      hide();
      return false;
    }
  };

  const columns: ProColumnType<V1Tenant>[] = [
    {
      title: <FormattedMessage id="saas.tenant.logo" defaultMessage="Tenant Logo" />,
      dataIndex: 'logo',
      valueType: 'image',
      render: (dom, entity) => {
        return entity?.logo?.url ? <Image src={entity.logo.url} width={54} height={54} /> : <div />;
      },
    },
    {
      title: <FormattedMessage id="saas.tenant.name" defaultMessage="Tenant Name" />,
      dataIndex: 'name',
      valueType: 'text',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="saas.tenant.displayName" defaultMessage="Tenant Display Name" />,
      dataIndex: 'displayName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="saas.tenant.region" defaultMessage="Tenant Region" />,
      dataIndex: 'region',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="saas.tenant.separateDb" defaultMessage="Prefer SeparateDb" />,
      dataIndex: 'separateDb',
      valueType: 'switch',
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="common.updatedAt" defaultMessage="UpdatedAt" />,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="upgrade"
          onClick={() => {
            setCurrentRow(record);
            upgradeForm.resetFields();
            upgradeForm.setFieldsValue({ gateway: 'sslcommerz' });
            setUpgradeModalVisible(true);
          }}
        >
          <FormattedMessage id="saas.tenant.upgradePlan" defaultMessage="Upgrade Plan" />
        </a>,
        <a
          key="editable"
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(false);
            handleUpdateModalVisible(true);
          }}
        >
          <FormattedMessage id="common.edit" defaultMessage="Edit" />
        </a>,
        <TableDropdown
          key="actionGroup"
          onSelect={async (key) => {
            if (key === 'delete') {
              const ok = await handleRemove(record);
              if (ok && actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          menus={[
            {
              key: 'delete',
              name: <FormattedMessage id="common.delete" defaultMessage="Delete" />,
            },
          ]}
        />,
      ],
    },
  ];

  const getData = requestTransform<V1Tenant, V1TenantFilter>(async (req) => {
    const resp = await service.tenantServiceListTenant2({ body: req });
    return resp.data;
  });

  return (
    <PageContainer>
      <ProTable<V1Tenant>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        pagination={{
          defaultPageSize: 10,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              handleUpdateModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        type="table"
        request={getData}
        columns={columns}
      />
      <Drawer
        width={800}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
        destroyOnClose
      >
        {currentRow?.id && (
          <ProDescriptions<V1Tenant>
            column={1}
            title={currentRow?.name}
            request={async () => {
              const resp = await service.tenantServiceGetTenant({ idOrName: currentRow.id! });
              return {
                data: resp.data,
              };
            }}
            params={{
              id: currentRow?.id,
            }}
            columns={columns as ProDescriptionsItemProps<V1Tenant>[]}
          />
        )}
      </Drawer>
      <Modal
        title={intl.formatMessage({
          id: 'saas.tenant.upgradePlan',
          defaultMessage: 'Upgrade Plan',
        })}
        open={upgradeModalVisible}
        confirmLoading={upgradeLoading}
        onCancel={() => {
          if (!upgradeLoading) {
            setUpgradeModalVisible(false);
            setCurrentRow(undefined);
          }
        }}
        onOk={() => upgradeForm.submit()}
        destroyOnClose
      >
        <Form
          form={upgradeForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!currentRow?.id) {
              return;
            }
            setUpgradeLoading(true);
            try {
              await upgradeTenantPlan(currentRow.id, values);
              message.success(
                intl.formatMessage({
                  id: 'common.updated',
                  defaultMessage: 'Update Successfully',
                }),
              );
              setUpgradeModalVisible(false);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            } finally {
              setUpgradeLoading(false);
            }
          }}
        >
          <Form.Item
            name="plan_key"
            label={intl.formatMessage({
              id: 'saas.subscriptionOrder.plan',
              defaultMessage: 'Plan',
            })}
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={plans.map((plan) => ({
                label: plan.displayName ?? plan.key,
                value: plan.key,
              }))}
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
      <UpdateForm
        onSubmit={async (value) => {
          const { id } = value;
          let success = false;
          if (id) {
            success = await handleUpdate({ tenant: value as V1UpdateTenant });
          } else {
            success = await handleAdd(value as V1CreateTenantRequest);
          }

          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalVisible={updateModalVisible}
        values={(currentRow as any) || {}}
      />
    </PageContainer>
  );
};

export default TableList;
