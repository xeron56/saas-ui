import {
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Statistic,
  Tag,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { moneyAccountOptions } from '../tenderAccount';
import {
  clearFinanceCheque,
  getFinanceCheque,
  listFinanceCheques,
  listMoneyAccounts,
  reopenFinanceCheque,
} from '../service';
import type {
  FinanceCheque,
  FinanceChequeClearRequest,
  FinanceChequeReopenRequest,
  MoneyAccount,
} from '../types';

type ChequeClearFormValues = FinanceChequeClearRequest & {
  cleared_at?: any;
};

const statusColor: Record<string, string> = {
  pending: 'gold',
  cleared: 'green',
  reopened: 'orange',
};

const sourceLabels: Record<string, string> = {
  retail_checkout: 'Sale',
  retail_supply: 'Purchase',
  retail_checkout_return: 'Sale return',
  retail_supply_return: 'Purchase return',
  retail_due_settlement: 'Due settlement',
};

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (value: any) => {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value.format === 'function') {
    return value.format('YYYY-MM-DD');
  }
  return undefined;
};

const FinanceChequePage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [clearForm] = Form.useForm<ChequeClearFormValues>();
  const [reopenForm] = Form.useForm<FinanceChequeReopenRequest>();
  const clearPlatform = Form.useWatch('clear_platform', clearForm);
  const [accounts, setAccounts] = useState<MoneyAccount[]>([]);
  const [current, setCurrent] = useState<FinanceCheque>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({ pending: 0, cleared: 0 });
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const reloadAccounts = async () => {
    const resp = await listMoneyAccounts({ page_offset: 0, page_size: 100, active: true });
    setAccounts(resp.items || []);
  };

  useEffect(() => {
    reloadAccounts();
  }, []);

  const openDetail = async (record: FinanceCheque) => {
    const detail = await getFinanceCheque(record.id);
    setCurrent(detail);
    setDetailOpen(true);
  };

  const openClear = (record: FinanceCheque) => {
    setCurrent(record);
    clearForm.setFieldsValue({ clear_platform: 'cash' });
    setClearOpen(true);
  };

  const openReopen = (record: FinanceCheque) => {
    setCurrent(record);
    reopenForm.resetFields();
    setReopenOpen(true);
  };

  const handleClear = async (values: ChequeClearFormValues) => {
    if (!current) {
      return;
    }
    setSubmitting(true);
    try {
      await clearFinanceCheque(current.id, {
        ...values,
        cleared_at: formatDate(values.cleared_at),
        payment_account_id:
          values.clear_platform === 'bank' ? values.payment_account_id : undefined,
      });
      message.success(t('retail.finance.chequeCleared', 'Cheque cleared'));
      setClearOpen(false);
      clearForm.resetFields();
      actionRef.current?.reload();
      reloadAccounts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopen = async (values: FinanceChequeReopenRequest) => {
    if (!current) {
      return;
    }
    setSubmitting(true);
    try {
      await reopenFinanceCheque(current.id, values);
      message.success(t('retail.finance.chequeReopened', 'Cheque reopened'));
      setReopenOpen(false);
      reopenForm.resetFields();
      actionRef.current?.reload();
      reloadAccounts();
    } finally {
      setSubmitting(false);
    }
  };

  const destination = (record?: FinanceCheque) => {
    if (!record?.clear_platform) {
      return '-';
    }
    if (record.clear_platform === 'cash') {
      return t('retail.finance.clearToCash', 'Cash');
    }
    return record.payment_account?.account_name || record.payment_account_id || '-';
  };

  const columns: ProColumns<FinanceCheque>[] = [
    {
      title: t('retail.finance.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('retail.finance.chequeStatus', 'Status'),
      dataIndex: 'status',
      initialValue: 'pending',
      valueEnum: {
        pending: { text: t('retail.finance.pending', 'Pending') },
        cleared: { text: t('retail.finance.cleared', 'Cleared') },
        reopened: { text: t('retail.finance.reopened', 'Reopened') },
      },
      render: (_, record) => (
        <Tag color={statusColor[record.status || 'pending']}>
          {(record.status || 'pending').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t('retail.finance.chequeNo', 'Cheque no.'),
      dataIndex: 'instrument_no',
      width: 160,
      render: (_, record) => <a onClick={() => openDetail(record)}>{record.instrument_no}</a>,
    },
    {
      title: t('retail.finance.source', 'Source'),
      dataIndex: 'source_kind',
      valueEnum: {
        retail_checkout: { text: sourceLabels.retail_checkout },
        retail_supply: { text: sourceLabels.retail_supply },
        retail_checkout_return: { text: sourceLabels.retail_checkout_return },
        retail_supply_return: { text: sourceLabels.retail_supply_return },
        retail_due_settlement: { text: sourceLabels.retail_due_settlement },
      },
      renderText: (_, record) => sourceLabels[record.source_kind || ''] || record.source_kind,
    },
    {
      title: t('retail.finance.referenceNo', 'Reference no.'),
      dataIndex: 'source_no',
      search: false,
      width: 150,
    },
    {
      title: t('retail.finance.direction', 'Direction'),
      dataIndex: 'direction',
      valueEnum: {
        credit: { text: t('retail.finance.credit', 'Credit') },
        debit: { text: t('retail.finance.debit', 'Debit') },
      },
      width: 120,
    },
    {
      title: t('retail.finance.amount', 'Amount'),
      dataIndex: 'amount',
      search: false,
      align: 'right',
      width: 130,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.finance.date', 'Date'),
      dataIndex: 'received_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: t('retail.finance.clearedAt', 'Cleared at'),
      dataIndex: 'cleared_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: t('retail.finance.clearTo', 'Clear to'),
      dataIndex: 'clear_platform',
      search: false,
      width: 170,
      renderText: (_, record) => destination(record),
    },
    {
      title: t('retail.finance.operate', 'Operate'),
      valueType: 'option',
      width: 150,
      render: (_, record) =>
        [
          <Button
            key="view"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          />,
          (record.status === 'pending' || record.status === 'reopened') && (
            <Button
              key="clear"
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => openClear(record)}
            />
          ),
          record.status === 'cleared' && (
            <Button
              key="reopen"
              type="link"
              icon={<RollbackOutlined />}
              onClick={() => openReopen(record)}
            />
          ),
        ].filter(Boolean),
    },
  ];

  return (
    <PageContainer>
      <ProTable<FinanceCheque>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        form={{ initialValues: { status: 'pending' } }}
        pagination={{ defaultPageSize: 10 }}
        scroll={{ x: 1300 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const currentPage = params.current || 1;
          const resp = await listFinanceCheques({
            page_offset: (currentPage - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            status: params.status,
            source_kind: params.source_kind,
            direction: params.direction,
          });
          setSummary({
            pending: resp.pending_amount || 0,
            cleared: resp.cleared_amount || 0,
          });
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Statistic
            key="pending"
            title={t('retail.finance.pendingAmount', 'Pending amount')}
            value={summary.pending}
            precision={2}
          />,
          <Statistic
            key="cleared"
            title={t('retail.finance.clearedAmount', 'Cleared amount')}
            value={summary.cleared}
            precision={2}
          />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => {
              actionRef.current?.reload();
              reloadAccounts();
            }}
          />,
        ]}
      />

      <Drawer
        width={760}
        open={detailOpen}
        title={current?.instrument_no || t('retail.finance_cheques', 'Cheque Clearing')}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label={t('retail.finance.chequeNo', 'Cheque no.')}>
            {current?.instrument_no}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.chequeStatus', 'Status')}>
            {current?.status}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.source', 'Source')}>
            {sourceLabels[current?.source_kind || ''] || current?.source_kind}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.referenceNo', 'Reference no.')}>
            {current?.source_no || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.amount', 'Amount')}>
            {money(current?.amount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.clearTo', 'Clear to')}>
            {destination(current)}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.movementNo', 'Movement no.')}>
            {current?.movement?.movement_no || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.note', 'Note')}>
            {current?.note || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>

      <Drawer
        width={620}
        open={clearOpen}
        title={t('retail.finance.clearCheque', 'Clear cheque')}
        onClose={() => setClearOpen(false)}
        destroyOnClose
        extra={
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={submitting}
            onClick={() => clearForm.submit()}
          >
            {t('retail.finance.clearCheque', 'Clear cheque')}
          </Button>
        }
      >
        <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label={t('retail.finance.chequeNo', 'Cheque no.')}>
            {current?.instrument_no}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.amount', 'Amount')}>
            {money(current?.amount)}
          </Descriptions.Item>
        </Descriptions>
        <Form<ChequeClearFormValues> form={clearForm} layout="vertical" onFinish={handleClear}>
          <Form.Item
            name="clear_platform"
            label={t('retail.finance.clearTo', 'Clear to')}
            rules={[{ required: true }]}
          >
            <Segmented
              options={[
                { label: t('retail.finance.clearToCash', 'Cash'), value: 'cash' },
                { label: t('retail.finance.clearToAccount', 'Money account'), value: 'bank' },
              ]}
            />
          </Form.Item>
          {clearPlatform === 'bank' && (
            <Form.Item
              name="payment_account_id"
              label={t('retail.finance.paymentAccount', 'Payment account')}
              rules={[{ required: true }]}
            >
              <Select showSearch optionFilterProp="label" options={moneyAccountOptions(accounts)} />
            </Form.Item>
          )}
          <Form.Item name="cleared_at" label={t('retail.finance.clearedAt', 'Cleared at')}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label={t('retail.finance.note', 'Note')}>
            <Input.TextArea rows={3} maxLength={512} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        width={560}
        open={reopenOpen}
        title={t('retail.finance.reopenCheque', 'Reopen cheque')}
        onClose={() => setReopenOpen(false)}
        destroyOnClose
        extra={
          <Space>
            <Popconfirm
              title={t('retail.finance.reopenCheque', 'Reopen cheque')}
              onConfirm={() => reopenForm.submit()}
            >
              <Button danger icon={<RollbackOutlined />} loading={submitting}>
                {t('retail.finance.reopenCheque', 'Reopen cheque')}
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label={t('retail.finance.chequeNo', 'Cheque no.')}>
            {current?.instrument_no}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.clearTo', 'Clear to')}>
            {destination(current)}
          </Descriptions.Item>
        </Descriptions>
        <Form<FinanceChequeReopenRequest>
          form={reopenForm}
          layout="vertical"
          onFinish={handleReopen}
        >
          <Form.Item
            name="reason"
            label={t('retail.finance.reopenReason', 'Reason')}
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} maxLength={512} />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default FinanceChequePage;
