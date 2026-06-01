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
import { Button, Drawer, message, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import UpdateForm from './components/UpdateForm';
import { useIntl } from '@umijs/max';
import {
  createAdminPlan,
  deleteAdminPlan,
  getAdminPlan,
  listAdminPlans,
  updateAdminPlan,
} from './service';
import type { LegacyPlan, LegacyPlanFormValues } from './types';

const TableList: React.FC = () => {
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<LegacyPlan | undefined | null>(undefined);

  const intl = useIntl();
  const handleAdd = async (fields: LegacyPlanFormValues) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.creating', defaultMessage: 'Creating...' }),
    );
    try {
      await createAdminPlan(fields);
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

  const handleUpdate = async (fields: LegacyPlanFormValues) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.updating', defaultMessage: 'Updating...' }),
    );
    try {
      await updateAdminPlan(currentRow!.key!, fields);
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

  const handleRemove = async (selectedRow: LegacyPlan) => {
    const hide = message.loading(
      intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
    );
    try {
      await deleteAdminPlan(selectedRow.key!);
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

  const columns: ProColumnType<LegacyPlan>[] = [
    {
      title: <FormattedMessage id="saas.plan.key" defaultMessage="Plan Key" />,
      dataIndex: 'key',
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
      title: (
        <FormattedMessage id="saas.plan.subscriptionName" defaultMessage="Subscription name" />
      ),
      dataIndex: 'subscriptionName',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="saas.plan.duration" defaultMessage="Duration" />,
      dataIndex: 'duration',
      valueType: 'digit',
      render: (_, record) => `${record.duration || 0} days`,
    },
    {
      title: <FormattedMessage id="saas.plan.subscriptionPrice" defaultMessage="Price" />,
      dataIndex: 'subscriptionPrice',
      valueType: 'money',
    },
    {
      title: <FormattedMessage id="saas.plan.offerPrice" defaultMessage="Offer price" />,
      dataIndex: 'offerPrice',
      valueType: 'money',
      render: (_, record) =>
        record.offerPrice === null || record.offerPrice === undefined ? '-' : record.offerPrice,
    },
    {
      title: <FormattedMessage id="saas.plan.affiliateCommission" defaultMessage="Referral %" />,
      dataIndex: 'affiliate_commission',
      valueType: 'digit',
      search: false,
      render: (_, record) =>
        `${record.affiliate_commission ?? record.affiliate_commission_rate ?? 0}%`,
    },
    {
      title: <FormattedMessage id="saas.plan.active" defaultMessage="Active" />,
      dataIndex: 'status',
      render: (_, record) =>
        record.status || record.active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
        ),
    },
    {
      title: <FormattedMessage id="saas.plan.allowMultibranch" defaultMessage="Multi-branch" />,
      dataIndex: 'allow_multibranch',
      render: (_, record) =>
        record.allow_multibranch ? <Tag color="blue">Allowed</Tag> : <Tag>Single</Tag>,
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="common.updatedAt" defaultMessage="UpdatedAt" />,
      dataIndex: 'updated_at',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      key: 'option',
      valueType: 'option',
      render: (_, record) => [
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

  return (
    <PageContainer>
      <ProTable<LegacyPlan>
        actionRef={actionRef}
        rowKey="key"
        search={{ labelWidth: 'auto' }}
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
        request={async (params) => {
          const resp = await listAdminPlans({
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword || params.subscriptionName || params.key,
          });
          return {
            data: resp.data || [],
            total: resp.meta?.total || 0,
            success: true,
          };
        }}
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
        {currentRow?.key && (
          <ProDescriptions<LegacyPlan>
            column={1}
            title={currentRow?.key}
            request={async () => {
              const resp = await getAdminPlan(currentRow.key!);
              return {
                data: resp.data,
              };
            }}
            params={{
              id: currentRow?.key,
            }}
            columns={columns as ProDescriptionsItemProps<LegacyPlan>[]}
          />
        )}
      </Drawer>
      <UpdateForm
        onSubmit={async (value) => {
          let success = false;
          if (currentRow) {
            success = await handleUpdate(value);
          } else {
            success = await handleAdd(value);
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
