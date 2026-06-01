import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Form, Input, message, Modal, Space, Statistic, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { listAffiliatePayouts, markAffiliatePayoutPaid, rejectAffiliatePayout } from './service';
import type { ReferralPayout, ReferralPayoutListReply } from './types';

type DecisionMode = 'paid' | 'reject';

const statusColor: Record<string, string> = {
  unpaid: 'gold',
  pending: 'gold',
  paid: 'green',
  rejected: 'red',
};

const formatMoney = (minor?: number, amount?: number, currency = 'BDT') => {
  const value = minor === null || minor === undefined ? amount ?? 0 : minor / 100;
  return `${currency} ${value.toFixed(2)}`;
};

const payoutStatus = (record: ReferralPayout) => {
  const status = record.status ?? 'unpaid';
  if (status === 'pending' || status === 'rejected') {
    return 'unpaid';
  }
  return status;
};

const payoutUser = (record: ReferralPayout) =>
  record.user?.name ?? record.user?.email ?? record.user_id ?? record.account_id ?? '-';

const payoutNo = (record: ReferralPayout) => record.trx ?? record.payout_no ?? record.id;

const AffiliatePayoutsPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [decisionForm] = Form.useForm();
  const [decisionMode, setDecisionMode] = useState<DecisionMode>();
  const [currentRow, setCurrentRow] = useState<ReferralPayout>();
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [extra, setExtra] = useState<ReferralPayoutListReply['extra']>();

  const columns: ProColumnType<ReferralPayout>[] = [
    {
      title: <FormattedMessage id="saas.referral.affiliate" defaultMessage="Affiliate" />,
      dataIndex: ['user', 'name'],
      render: (_, record) => payoutUser(record),
    },
    {
      title: <FormattedMessage id="saas.referral.trx" defaultMessage="TRX" />,
      dataIndex: 'trx',
      render: (_, record) => payoutNo(record),
    },
    {
      title: <FormattedMessage id="saas.referral.method" defaultMessage="Method" />,
      dataIndex: 'method',
    },
    {
      title: <FormattedMessage id="saas.referral.status" defaultMessage="Status" />,
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        unpaid: {
          text: intl.formatMessage({
            id: 'saas.referral.status.unpaid',
            defaultMessage: 'Unpaid',
          }),
        },
        paid: {
          text: intl.formatMessage({ id: 'saas.referral.status.paid', defaultMessage: 'Paid' }),
        },
      },
      render: (_, record) => {
        const status = payoutStatus(record);
        return (
          <Tag color={statusColor[status]}>
            {intl.formatMessage({
              id: `saas.referral.status.${status}`,
              defaultMessage: status,
            })}
          </Tag>
        );
      },
    },
    {
      title: <FormattedMessage id="saas.referral.amount" defaultMessage="Amount" />,
      dataIndex: 'amount_minor',
      search: false,
      render: (_, record) =>
        formatMoney(record.amount_minor, record.amount, record.currency_code ?? 'BDT'),
    },
    {
      title: <FormattedMessage id="saas.referral.note" defaultMessage="Note" />,
      dataIndex: 'note',
      search: false,
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="saas.referral.requestedAt" defaultMessage="Requested" />,
      dataIndex: 'requested_at',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
      valueType: 'option',
      render: (_, record) => {
        const status = payoutStatus(record);
        return (
          <Space size={4}>
            {status !== 'paid' && (
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setCurrentRow(record);
                  setDecisionMode('paid');
                  decisionForm.resetFields();
                }}
              >
                <FormattedMessage id="saas.referral.markPaid" defaultMessage="Mark Paid" />
              </Button>
            )}
            {status !== 'paid' && (
              <Button
                danger
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setCurrentRow(record);
                  setDecisionMode('reject');
                  decisionForm.resetFields();
                }}
              >
                <FormattedMessage id="saas.referral.reject" defaultMessage="Reject" />
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <ProTable<ReferralPayout>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const resp = await listAffiliatePayouts({
            page: params.current,
            per_page: params.pageSize,
            search: params.keyword || params.trx || params.method,
            status: params.status,
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
            key="pending"
            title={intl.formatMessage({
              id: 'saas.referral.pendingPayouts',
              defaultMessage: 'Pending payouts',
            })}
            value={formatMoney(extra?.pending_minor)}
          />,
          <Statistic
            key="paid"
            title={intl.formatMessage({
              id: 'saas.referral.paidPayouts',
              defaultMessage: 'Paid payouts',
            })}
            value={formatMoney(extra?.paid_minor)}
          />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            <FormattedMessage id="saas.referral.refresh" defaultMessage="Refresh" />
          </Button>,
        ]}
      />

      <Modal
        title={
          decisionMode === 'paid'
            ? intl.formatMessage({ id: 'saas.referral.markPaid', defaultMessage: 'Mark Paid' })
            : intl.formatMessage({ id: 'saas.referral.reject', defaultMessage: 'Reject' })
        }
        open={!!decisionMode}
        confirmLoading={decisionLoading}
        onCancel={() => {
          if (!decisionLoading) {
            setDecisionMode(undefined);
            setCurrentRow(undefined);
          }
        }}
        onOk={() => decisionForm.submit()}
        destroyOnClose
      >
        <Form
          form={decisionForm}
          layout="vertical"
          onFinish={async (values: { note?: string }) => {
            if (!currentRow?.id || !decisionMode) {
              return;
            }
            setDecisionLoading(true);
            try {
              if (decisionMode === 'paid') {
                await markAffiliatePayoutPaid(currentRow.id, { note: values.note });
              } else {
                await rejectAffiliatePayout(currentRow.id, { note: values.note });
              }
              message.success(
                intl.formatMessage({ id: 'common.updated', defaultMessage: 'Update Successfully' }),
              );
              setDecisionMode(undefined);
              setCurrentRow(undefined);
              actionRef.current?.reload();
            } finally {
              setDecisionLoading(false);
            }
          }}
        >
          <Form.Item
            name="note"
            label={intl.formatMessage({ id: 'saas.referral.note', defaultMessage: 'Note' })}
            rules={[{ required: decisionMode === 'reject', max: 255 }]}
          >
            <Input.TextArea rows={4} maxLength={255} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AffiliatePayoutsPage;
