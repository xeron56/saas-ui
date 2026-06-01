import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, message, Modal, Space, Statistic, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { deleteAffiliate, deleteAffiliates, listAffiliates } from './service';
import type { ReferralAccount, ReferralListReply } from './types';

const formatMoney = (minor?: number, amount?: number, currency = 'BDT') => {
  const value = minor === null || minor === undefined ? amount ?? 0 : minor / 100;
  return `${currency} ${value.toFixed(2)}`;
};

const accountName = (record: ReferralAccount) =>
  record.display_name ?? record.name ?? record.email ?? record.id;

const accountCode = (record: ReferralAccount) => record.referral_code ?? record.ref_code ?? '-';

const businessName = (record: ReferralAccount) =>
  record.business_name ?? record.tenant_name ?? record.business_id ?? record.tenant_id ?? '-';

const AffiliateAccountsPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [extra, setExtra] = useState<ReferralListReply['extra']>();

  const removeAccounts = (ids: string[]) => {
    Modal.confirm({
      title: intl.formatMessage({
        id: 'saas.referral.deleteConfirm',
        defaultMessage: 'Delete selected affiliates?',
      }),
      okButtonProps: { danger: true },
      onOk: async () => {
        const hide = message.loading(
          intl.formatMessage({ id: 'common.deleting', defaultMessage: 'Deleting...' }),
        );
        try {
          if (ids.length === 1) {
            await deleteAffiliate(ids[0]);
          } else {
            await deleteAffiliates(ids);
          }
          message.success(
            intl.formatMessage({ id: 'common.deleted', defaultMessage: 'Delete Successfully' }),
          );
          setSelectedRowKeys([]);
          actionRef.current?.reload();
        } finally {
          hide();
        }
      },
    });
  };

  const columns: ProColumnType<ReferralAccount>[] = [
    {
      title: <FormattedMessage id="saas.referral.affiliate" defaultMessage="Affiliate" />,
      dataIndex: 'name',
      render: (_, record) => accountName(record),
    },
    {
      title: <FormattedMessage id="saas.referral.email" defaultMessage="Email" />,
      dataIndex: 'email',
      valueType: 'text',
    },
    {
      title: <FormattedMessage id="saas.referral.refCode" defaultMessage="Ref code" />,
      dataIndex: 'referral_code',
      render: (_, record) => accountCode(record),
    },
    {
      title: <FormattedMessage id="saas.referral.business" defaultMessage="Business" />,
      dataIndex: 'business_name',
      render: (_, record) => businessName(record),
    },
    {
      title: <FormattedMessage id="saas.referral.balance" defaultMessage="Balance" />,
      dataIndex: 'balance_minor',
      search: false,
      render: (_, record) =>
        formatMoney(record.balance_minor, record.balance, record.currency_code ?? 'BDT'),
    },
    {
      title: <FormattedMessage id="saas.referral.totalEarn" defaultMessage="Total earned" />,
      dataIndex: 'earned_minor',
      search: false,
      render: (_, record) =>
        formatMoney(record.earned_minor, record.total_earn, record.currency_code ?? 'BDT'),
    },
    {
      title: <FormattedMessage id="saas.referral.status" defaultMessage="Status" />,
      dataIndex: 'active',
      valueType: 'select',
      valueEnum: {
        true: { text: intl.formatMessage({ id: 'common.enabled', defaultMessage: 'Enabled' }) },
        false: { text: intl.formatMessage({ id: 'common.disabled', defaultMessage: 'Disabled' }) },
      },
      render: (_, record) =>
        record.active === false ? (
          <Tag color="default">
            <FormattedMessage id="common.disabled" defaultMessage="Disabled" />
          </Tag>
        ) : (
          <Tag color="green">
            <FormattedMessage id="common.enabled" defaultMessage="Enabled" />
          </Tag>
        ),
    },
    {
      title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
      dataIndex: 'created_at',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      valueType: 'option',
      render: (_, record) => (
        <Button
          danger
          type="link"
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeAccounts([record.id])}
        >
          <FormattedMessage id="common.delete" defaultMessage="Delete" />
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<ReferralAccount>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const search =
            params.keyword ||
            params.name ||
            params.email ||
            params.referral_code ||
            params.business_name;
          const resp = await listAffiliates({
            page: params.current,
            per_page: params.pageSize,
            search,
            active: params.active,
          });
          setExtra(resp.extra);
          return {
            data: resp.data ?? [],
            success: true,
            total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          <Statistic
            key="balance"
            title={intl.formatMessage({
              id: 'saas.referral.totalBalance',
              defaultMessage: 'Total balance',
            })}
            value={formatMoney(
              extra?.total_balance_minor,
              undefined,
              extra?.currency_code ?? 'BDT',
            )}
          />,
          <Statistic
            key="earned"
            title={intl.formatMessage({
              id: 'saas.referral.totalEarn',
              defaultMessage: 'Total earned',
            })}
            value={formatMoney(extra?.total_earned_minor, undefined, extra?.currency_code ?? 'BDT')}
          />,
          <Space key="actions">
            <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>
              <FormattedMessage id="saas.referral.refresh" defaultMessage="Refresh" />
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => removeAccounts(selectedRowKeys.map(String))}
            >
              <FormattedMessage
                id="saas.referral.deleteSelected"
                defaultMessage="Delete selected"
              />
            </Button>
          </Space>,
        ]}
      />
    </PageContainer>
  );
};

export default AffiliateAccountsPage;
