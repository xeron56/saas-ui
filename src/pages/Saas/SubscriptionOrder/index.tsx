import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumnType } from '@ant-design/pro-components';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useLocation } from '@umijs/max';
import { Button, Drawer, Form, Input, message, Modal, Space, Tabs, Tag } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import {
  getSubscriptionOrderInvoice,
  listSubscriptionOrders,
  listSubscriptionReports,
  markSubscriptionOrderPaid,
  rejectSubscriptionOrder,
} from './service';
import type {
  SubscriptionOrder,
  SubscriptionOrderInvoiceReply,
  SubscriptionOrderStatus,
} from './types';

type DecisionMode = 'paid' | 'reject';

const statusColor: Record<SubscriptionOrderStatus, string> = {
  pending_review: 'gold',
  paid: 'green',
  rejected: 'red',
};

const normalizeStatus = (value?: string): SubscriptionOrderStatus => {
  switch (value?.toLowerCase()) {
    case 'paid':
      return 'paid';
    case 'reject':
    case 'rejected':
      return 'rejected';
    case 'pending':
    case 'pending_review':
    case 'unpaid':
    default:
      return 'pending_review';
  }
};

const readStatus = (record: SubscriptionOrder) =>
  normalizeStatus(record.status ?? record.payment_status ?? record.paymentStatus);

const firstText = (...values: Array<string | undefined>) =>
  values.find((value): value is string => Boolean(value && value.trim())) ?? '';

const readTenantName = (record: SubscriptionOrder) =>
  firstText(
    record.tenant?.display_name,
    record.tenant?.displayName,
    record.tenant?.name,
    record.business?.companyName,
    record.business?.company_name,
    record.business?.display_name,
    record.business?.displayName,
    record.business?.name,
    record.business_name,
    record.businessName,
    record.tenant_name,
    record.tenantName,
    record.tenant_id,
    record.tenantId,
    record.business_id,
    record.businessId,
  ) || '-';

const readPlanName = (record: SubscriptionOrder) =>
  firstText(
    record.plan_name,
    record.planName,
    record.plan?.subscriptionName,
    record.plan?.subscription_name,
    record.plan?.display_name,
    record.plan?.displayName,
    record.plan?.name,
    record.plan?.key,
    record.plan?.plan_key,
    record.plan?.planKey,
    record.plan_key,
    record.planKey,
    record.plan_id,
    record.planId,
  ) || '-';

const readGatewayName = (record: SubscriptionOrder) => {
  const gateway = typeof record.gateway === 'object' ? record.gateway : undefined;
  return (
    firstText(
      typeof record.gateway === 'string' ? record.gateway : undefined,
      gateway?.display_name,
      gateway?.displayName,
      gateway?.name,
      gateway?.provider,
      gateway?.key,
      record.gateway_name,
      record.gatewayName,
      record.gateway_id,
      record.gatewayId,
    ) || '-'
  );
};

const readCreatedAt = (record: SubscriptionOrder) =>
  record.created_at ?? record.createdAt ?? record.subscriptionDate;

const formatAmount = (
  value: number | string | undefined,
  currency: string | undefined,
  divisor = 1,
) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numberValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  const amount = numberValue / divisor;
  const formatted = amount.toFixed(2);
  return currency ? `${currency} ${formatted}` : formatted;
};

const readAmount = (record: SubscriptionOrder) => {
  const currency = record.currency_code ?? record.currencyCode ?? record.currency;
  return (
    firstText(record.amount_text, record.amountText) ||
    formatAmount(record.amount, currency) ||
    formatAmount(record.price, currency) ||
    formatAmount(record.amount_minor, currency, 100) ||
    formatAmount(record.amountMinor, currency, 100) ||
    '-'
  );
};

const readDuration = (record: SubscriptionOrder) =>
  record.duration_days ?? record.durationDays ?? record.duration ?? '-';

const SubscriptionOrderPage: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const ordersActionRef = useRef<ActionType>();
  const reportsActionRef = useRef<ActionType>();
  const [decisionForm] = Form.useForm();
  const [currentRow, setCurrentRow] = useState<SubscriptionOrder>();
  const [decisionMode, setDecisionMode] = useState<DecisionMode>();
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoice, setInvoice] = useState<SubscriptionOrderInvoiceReply>();

  const columns = useMemo<ProColumnType<SubscriptionOrder>[]>(
    () => [
      {
        title: <FormattedMessage id="saas.subscriptionOrder.tenant" defaultMessage="Tenant" />,
        dataIndex: 'tenant',
        render: (_, record) => readTenantName(record),
      },
      {
        title: <FormattedMessage id="saas.subscriptionOrder.plan" defaultMessage="Plan" />,
        dataIndex: 'plan_key',
        render: (_, record) => readPlanName(record),
      },
      {
        title: <FormattedMessage id="saas.subscriptionOrder.status" defaultMessage="Status" />,
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: {
          pending_review: {
            text: intl.formatMessage({
              id: 'saas.subscriptionOrder.status.pending_review',
              defaultMessage: 'Pending',
            }),
          },
          paid: {
            text: intl.formatMessage({
              id: 'saas.subscriptionOrder.status.paid',
              defaultMessage: 'Paid',
            }),
          },
          rejected: {
            text: intl.formatMessage({
              id: 'saas.subscriptionOrder.status.rejected',
              defaultMessage: 'Rejected',
            }),
          },
        },
        render: (_, record) => {
          const status = readStatus(record);
          return (
            <Tag color={statusColor[status]}>
              {intl.formatMessage({
                id: `saas.subscriptionOrder.status.${status}`,
                defaultMessage: status,
              })}
            </Tag>
          );
        },
      },
      {
        title: <FormattedMessage id="saas.subscriptionOrder.gateway" defaultMessage="Gateway" />,
        dataIndex: 'gateway',
        valueType: 'text',
        render: (_, record) => readGatewayName(record),
      },
      {
        title: <FormattedMessage id="saas.subscriptionOrder.amount" defaultMessage="Amount" />,
        dataIndex: 'amount_text',
        search: false,
        render: (_, record) => readAmount(record),
      },
      {
        title: <FormattedMessage id="saas.subscriptionOrder.duration" defaultMessage="Days" />,
        dataIndex: 'duration_days',
        search: false,
        render: (_, record) => readDuration(record),
      },
      {
        title: <FormattedMessage id="common.createdAt" defaultMessage="CreatedAt" />,
        dataIndex: 'created_at',
        valueType: 'dateTime',
        search: false,
        renderText: (_, record) => readCreatedAt(record),
      },
      {
        title: <FormattedMessage id="common.operate" defaultMessage="Operate" />,
        valueType: 'option',
        render: (_, record) => {
          const status = readStatus(record);
          return (
            <Space size={4}>
              <Button
                type="link"
                size="small"
                icon={<FileTextOutlined />}
                onClick={async () => {
                  setCurrentRow(record);
                  setInvoice(await getSubscriptionOrderInvoice(record.id));
                  setInvoiceOpen(true);
                }}
              >
                <FormattedMessage id="saas.subscriptionOrder.invoice" defaultMessage="Invoice" />
              </Button>
              {status === 'pending_review' && (
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
                  <FormattedMessage
                    id="saas.subscriptionOrder.markPaid"
                    defaultMessage="Mark Paid"
                  />
                </Button>
              )}
              {status === 'pending_review' && (
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
                  <FormattedMessage id="saas.subscriptionOrder.reject" defaultMessage="Reject" />
                </Button>
              )}
            </Space>
          );
        },
      },
    ],
    [decisionForm, intl],
  );

  const reportColumns = useMemo<ProColumnType<SubscriptionOrder>[]>(
    () =>
      columns.map((column) =>
        column.valueType === 'option'
          ? {
              ...column,
              render: (_, record) => (
                <Button
                  type="link"
                  size="small"
                  icon={<FileTextOutlined />}
                  onClick={async () => {
                    setCurrentRow(record);
                    setInvoice(await getSubscriptionOrderInvoice(record.id));
                    setInvoiceOpen(true);
                  }}
                >
                  <FormattedMessage id="saas.subscriptionOrder.invoice" defaultMessage="Invoice" />
                </Button>
              ),
            }
          : column,
      ),
    [columns],
  );

  const tableRequest =
    (report = false) =>
    async (params: Record<string, any>) => {
      const query = {
        page: params.current,
        per_page: params.pageSize,
        search: params.keyword,
        status: params.status,
        custom_days: report ? params.custom_days ?? 'today' : undefined,
        from_date: report ? params.from_date : undefined,
        to_date: report ? params.to_date : undefined,
      };
      const resp = report
        ? await listSubscriptionReports(query)
        : await listSubscriptionOrders(query);
      return {
        data: resp.data ?? [],
        success: true,
        total: resp.meta?.filter_size ?? resp.meta?.filterSize ?? resp.meta?.total ?? 0,
      };
    };

  const reloadTables = () => {
    ordersActionRef.current?.reload();
    reportsActionRef.current?.reload();
  };
  const defaultTab = location.pathname.includes('subscription-reports') ? 'reports' : 'orders';

  return (
    <PageContainer>
      <Tabs
        defaultActiveKey={defaultTab}
        items={[
          {
            key: 'orders',
            label: intl.formatMessage({
              id: 'saas.subscriptionOrder.orders',
              defaultMessage: 'Orders',
            }),
            children: (
              <ProTable<SubscriptionOrder>
                actionRef={ordersActionRef}
                rowKey="id"
                request={tableRequest(false)}
                columns={columns}
                pagination={{ defaultPageSize: 10 }}
                toolBarRender={() => [
                  <Button
                    key="reload"
                    icon={<ReloadOutlined />}
                    onClick={() => ordersActionRef.current?.reload()}
                  />,
                ]}
              />
            ),
          },
          {
            key: 'reports',
            label: intl.formatMessage({
              id: 'saas.subscriptionOrder.reports',
              defaultMessage: 'Reports',
            }),
            children: (
              <ProTable<SubscriptionOrder>
                actionRef={reportsActionRef}
                rowKey="id"
                request={tableRequest(true)}
                columns={[
                  {
                    title: (
                      <FormattedMessage id="saas.subscriptionOrder.range" defaultMessage="Range" />
                    ),
                    dataIndex: 'custom_days',
                    valueType: 'select',
                    initialValue: 'today',
                    valueEnum: {
                      today: { text: 'Today' },
                      yesterday: { text: 'Yesterday' },
                      last_seven_days: { text: 'Last 7 days' },
                      last_thirty_days: { text: 'Last 30 days' },
                      current_month: { text: 'Current month' },
                      last_month: { text: 'Last month' },
                      current_year: { text: 'Current year' },
                      custom_date: {
                        text: intl.formatMessage({
                          id: 'saas.subscriptionOrder.customDate',
                          defaultMessage: 'Custom date',
                        }),
                      },
                    },
                  },
                  {
                    title: (
                      <FormattedMessage
                        id="saas.subscriptionOrder.dateRange"
                        defaultMessage="Date range"
                      />
                    ),
                    dataIndex: 'date_range',
                    valueType: 'dateRange',
                    hideInTable: true,
                    search: {
                      transform: (value: string[]) => ({
                        from_date: value?.[0],
                        to_date: value?.[1],
                      }),
                    },
                  },
                  ...reportColumns,
                ]}
                pagination={{ defaultPageSize: 10 }}
              />
            ),
          },
        ]}
      />

      <Modal
        title={
          decisionMode === 'paid'
            ? intl.formatMessage({
                id: 'saas.subscriptionOrder.markPaid',
                defaultMessage: 'Mark Paid',
              })
            : intl.formatMessage({
                id: 'saas.subscriptionOrder.reject',
                defaultMessage: 'Reject',
              })
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
        destroyOnHidden
      >
        <Form
          form={decisionForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!currentRow?.id || !decisionMode) {
              return;
            }
            setDecisionLoading(true);
            try {
              if (decisionMode === 'paid') {
                await markSubscriptionOrderPaid(currentRow.id, values);
              } else {
                await rejectSubscriptionOrder(currentRow.id, values);
              }
              message.success(
                intl.formatMessage({ id: 'common.updated', defaultMessage: 'Update Successfully' }),
              );
              setDecisionMode(undefined);
              setCurrentRow(undefined);
              reloadTables();
            } finally {
              setDecisionLoading(false);
            }
          }}
        >
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
        width={720}
        open={invoiceOpen}
        onClose={() => {
          setInvoiceOpen(false);
          setInvoice(undefined);
        }}
        destroyOnHidden
      >
        <ProDescriptions
          column={1}
          title={intl.formatMessage({
            id: 'saas.subscriptionOrder.invoice',
            defaultMessage: 'Invoice',
          })}
          dataSource={{
            ...(invoice?.data?.subscriber ?? currentRow),
            started_at: invoice?.data?.invoice?.started_at ?? invoice?.data?.invoice?.startedAt,
            ends_at: invoice?.data?.invoice?.ends_at ?? invoice?.data?.invoice?.endsAt,
          }}
          columns={[
            {
              title: (
                <FormattedMessage id="saas.subscriptionOrder.tenant" defaultMessage="Tenant" />
              ),
              render: (_, record) => readTenantName(record as SubscriptionOrder),
            },
            {
              title: <FormattedMessage id="saas.subscriptionOrder.plan" defaultMessage="Plan" />,
              render: (_, record) => readPlanName(record as SubscriptionOrder),
            },
            {
              title: (
                <FormattedMessage id="saas.subscriptionOrder.amount" defaultMessage="Amount" />
              ),
              render: (_, record) => readAmount(record as SubscriptionOrder),
            },
            {
              title: (
                <FormattedMessage id="saas.subscriptionOrder.gateway" defaultMessage="Gateway" />
              ),
              render: (_, record) => readGatewayName(record as SubscriptionOrder),
            },
            {
              title: (
                <FormattedMessage id="saas.subscriptionOrder.startedAt" defaultMessage="Started" />
              ),
              dataIndex: 'started_at',
              valueType: 'dateTime',
            },
            {
              title: <FormattedMessage id="saas.subscriptionOrder.endsAt" defaultMessage="Ends" />,
              dataIndex: 'ends_at',
              valueType: 'dateTime',
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default SubscriptionOrderPage;
