import { ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Button, Tag } from 'antd';
import React, { useRef } from 'react';
import { listAffiliateReports } from './service';
import type { ReferralBusinessReport } from './types';

const reportStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'paid':
    case 'posted':
      return 'green';
    case 'pending':
      return 'gold';
    case 'expired':
    case 'inactive':
    case 'cancelled':
    case 'canceled':
      return 'red';
    default:
      return 'default';
  }
};

const businessName = (record: ReferralBusinessReport) =>
  record.companyName ??
  record.company_name ??
  record.name ??
  record.business_name ??
  record.business_id ??
  record.tenant_id ??
  '-';

const subscriptionPlan = (record: ReferralBusinessReport) => {
  if (record.subscription_plan !== undefined) {
    return record.subscription_plan || '-';
  }
  return (
    record.enrolled_plan?.plan?.subscriptionName ??
    record.enrolled_plan?.plan?.subscription_name ??
    record.enrolled_plan?.plan?.name ??
    '-'
  );
};

const totalEarning = (record: ReferralBusinessReport) =>
  record.total_earning === null || record.total_earning === undefined || record.total_earning === ''
    ? '-'
    : record.total_earning;

const reportStatus = (record: ReferralBusinessReport) => {
  if (record.status_label) {
    return record.status_label;
  }
  if (record.status === 1 || record.status === '1' || record.active === true) {
    return 'Active';
  }
  if (record.status === 0 || record.status === '0' || record.active === false) {
    return 'Inactive';
  }
  return record.status?.toString() ?? '-';
};

const AffiliateReportsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumnType<ReferralBusinessReport>[] = [
    {
      title: <FormattedMessage id="saas.referral.dateTime" defaultMessage="Date/Time" />,
      dataIndex: 'date_time',
      valueType: 'dateTime',
      search: false,
      render: (_, record) => record.date_time ?? record.created_at ?? '-',
    },
    {
      title: <FormattedMessage id="saas.referral.businessName" defaultMessage="Business/Name" />,
      dataIndex: 'companyName',
      render: (_, record) => businessName(record),
    },
    {
      title: (
        <FormattedMessage id="saas.referral.subscriptionPlan" defaultMessage="Subscription Plan" />
      ),
      dataIndex: ['enrolled_plan', 'plan', 'subscriptionName'],
      search: false,
      render: (_, record) => subscriptionPlan(record),
    },
    {
      title: <FormattedMessage id="saas.referral.duration" defaultMessage="Duration" />,
      dataIndex: 'duration',
      search: false,
      render: (_, record) => record.duration ?? '-',
    },
    {
      title: <FormattedMessage id="saas.referral.expiredDate" defaultMessage="Expired Date" />,
      dataIndex: 'expired_date',
      search: false,
      render: (_, record) => record.expired_date ?? record.will_expire ?? '-',
    },
    {
      title: <FormattedMessage id="saas.referral.totalEarning" defaultMessage="Total Earning" />,
      dataIndex: 'total_earning',
      search: false,
      render: (_, record) => totalEarning(record),
    },
    {
      title: <FormattedMessage id="saas.referral.status" defaultMessage="Status" />,
      dataIndex: 'status',
      search: false,
      render: (_, record) => {
        const status = reportStatus(record);
        return <Tag color={reportStatusColor(status)}>{status}</Tag>;
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<ReferralBusinessReport>
        actionRef={actionRef}
        rowKey={(record, index) =>
          record.id ??
          record.business_id ??
          record.tenant_id ??
          record.companyName ??
          record.company_name ??
          record.created_at ??
          String(index)
        }
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const resp = await listAffiliateReports({
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword || params.companyName,
          });
          return {
            data: resp.data ?? [],
            success: true,
            total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
          };
        }}
        toolBarRender={() => [
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            <FormattedMessage id="saas.referral.refresh" defaultMessage="Refresh" />
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default AffiliateReportsPage;
