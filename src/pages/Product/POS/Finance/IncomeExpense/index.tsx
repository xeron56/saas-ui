import {
  DollarOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl, useLocation } from '@umijs/max';
import {
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Segmented,
  Statistic,
  Table,
  Tag,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { isReportRoute, readReportDurationFilter, reportDurationParams } from '../../reportFilters';
import IncomeExpenseEditor from './IncomeExpenseEditor';
import {
  createCashflowReason,
  createCashflowRecord,
  getCashflowRecord,
  listCashflowReasons,
  listCashflowRecords,
  listMoneyAccounts,
  voidCashflowRecord,
} from '../service';
import { moneyAccountLabel } from '../tenderAccount';
import type {
  CashflowReason,
  CashflowReasonRequest,
  CashflowKind,
  CashflowRecord,
  CashflowRecordRequest,
  CashflowTender,
  MoneyAccount,
} from '../types';

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const kindColor: Record<string, string> = {
  income: 'green',
  expense: 'red',
};

const readRecordKindFilter = (pathname: string, search: string): CashflowKind | undefined => {
  const value = new URLSearchParams(search).get('record_kind');
  if (value === 'income' || value === 'expense') {
    return value;
  }
  if (pathname.endsWith('/reports/income')) {
    return 'income';
  }
  if (pathname.endsWith('/reports/expenses')) {
    return 'expense';
  }
  return undefined;
};

const IncomeExpensePage: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const actionRef = useRef<ActionType>();
  const initialRecordKind = readRecordKindFilter(location.pathname, location.search);
  const reportDuration = readReportDurationFilter(
    location.pathname,
    location.search,
    'last_thirty_days',
  );
  const reportMode = isReportRoute(location.pathname);
  const reportFilters = reportDurationParams(reportDuration, location.search);
  const [accounts, setAccounts] = useState<MoneyAccount[]>([]);
  const [reasons, setReasons] = useState<CashflowReason[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState<CashflowRecord>();
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [reasonForm] = Form.useForm<CashflowReasonRequest>();
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const reloadLookups = async () => {
    const [accountResp, reasonResp] = await Promise.all([
      listMoneyAccounts({ page_offset: 0, page_size: 100, active: true }),
      listCashflowReasons({ page_offset: 0, page_size: 100, active: true }),
    ]);
    setAccounts(accountResp.items || []);
    setReasons(reasonResp.items || []);
  };

  useEffect(() => {
    reloadLookups();
  }, []);

  const openDetail = async (record: CashflowRecord) => {
    const detail = await getCashflowRecord(record.id);
    setCurrent(detail);
    setDetailOpen(true);
  };

  const handleSubmit = async (values: CashflowRecordRequest) => {
    setSubmitting(true);
    try {
      await createCashflowRecord(values);
      message.success(t('product.finance.recordSaved', 'Record saved'));
      setEditorOpen(false);
      actionRef.current?.reload();
      reloadLookups();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReasonSubmit = async (values: CashflowReasonRequest) => {
    await createCashflowReason(values);
    message.success(t('product.finance.reasonSaved', 'Reason saved'));
    setReasonOpen(false);
    reasonForm.resetFields();
    reloadLookups();
  };

  const handleVoid = async (record: CashflowRecord) => {
    await voidCashflowRecord(record.id);
    message.success(t('product.finance.recordVoided', 'Record voided'));
    actionRef.current?.reload();
    reloadLookups();
  };

  const reasonOptions = reasons.map((reason) => ({
    label: reason.reason_name,
    value: reason.id,
  }));

  const columns: ProColumns<CashflowRecord>[] = [
    {
      title: t('product.finance.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('product.finance.recordKind', 'Type'),
      dataIndex: 'record_kind',
      valueEnum: {
        income: { text: t('product.finance.income', 'Income') },
        expense: { text: t('product.finance.expense', 'Expense') },
      },
      width: 120,
      render: (_, record) => (
        <Tag color={kindColor[record.record_kind || '']}>{record.record_kind}</Tag>
      ),
    },
    {
      title: t('product.finance.status', 'Status'),
      dataIndex: 'status',
      valueEnum: {
        posted: { text: t('product.finance.posted', 'Posted') },
        voided: { text: t('product.finance.voided', 'Voided') },
        all: { text: t('product.finance.all', 'All') },
      },
      hideInTable: true,
    },
    {
      title: t('product.finance.reason', 'Reason'),
      dataIndex: 'reason_id',
      valueType: 'select',
      hideInTable: true,
      fieldProps: { options: reasonOptions },
    },
    {
      title: t('product.finance.recordNo', 'Record no.'),
      dataIndex: 'record_no',
      width: 150,
      render: (_, record) => <a onClick={() => openDetail(record)}>{record.record_no}</a>,
    },
    {
      title: t('product.finance.title', 'Title'),
      dataIndex: 'title',
      width: 190,
    },
    {
      title: t('product.finance.reason', 'Reason'),
      dataIndex: ['reason', 'reason_name'],
      search: false,
      width: 180,
    },
    {
      title: t('product.finance.amount', 'Amount'),
      dataIndex: 'amount',
      search: false,
      align: 'right',
      width: 130,
      renderText: (value) => money(value),
    },
    {
      title: t('product.finance.pendingAmount', 'Pending amount'),
      dataIndex: 'pending_amount',
      search: false,
      align: 'right',
      width: 140,
      renderText: (value) => money(value),
    },
    {
      title: t('product.finance.date', 'Date'),
      dataIndex: 'recorded_at',
      valueType: 'dateTime',
      search: false,
      width: 170,
    },
    {
      title: t('product.finance.date', 'Date'),
      dataIndex: 'recorded_range',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: t('product.finance.referenceNo', 'Reference no.'),
      dataIndex: 'reference_no',
      search: false,
      width: 150,
    },
    {
      title: t('product.finance.operate', 'Operate'),
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)} />,
        record.status !== 'voided' && (
          <Popconfirm
            key="void"
            title={t('product.finance.voidRecord', 'Void record')}
            onConfirm={() => handleVoid(record)}
          >
            <Button type="link" danger icon={<StopOutlined />} />
          </Popconfirm>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<CashflowRecord>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        params={{
          report_record_kind: initialRecordKind,
          report_duration: reportDuration,
          report_search: location.search,
        }}
        form={{ initialValues: initialRecordKind ? { record_kind: initialRecordKind } : undefined }}
        pagination={{ defaultPageSize: 10 }}
        scroll={{ x: 1280 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const currentPage = params.current || 1;
          const [fromDate, toDate] = (params.recorded_range || []) as string[];
          const recordKind = (params.record_kind as CashflowKind | undefined) || initialRecordKind;
          const dateParams =
            fromDate || toDate
              ? { duration: 'custom_date', from_date: fromDate, to_date: toDate }
              : reportFilters;
          const resp = await listCashflowRecords({
            page_offset: (currentPage - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            record_kind: recordKind,
            reason_id: params.reason_id,
            status: params.status,
            ...dateParams,
          });
          setIncomeTotal(resp.income_total || 0);
          setExpenseTotal(resp.expense_total || 0);
          setPendingTotal(resp.pending_total || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          reportMode && (
            <Tag key="report" color="blue">
              {initialRecordKind === 'expense'
                ? t('product.report.expense', 'Expense report')
                : t('product.report.income', 'Income report')}
            </Tag>
          ),
          <Statistic
            key="income"
            title={t('product.finance.income', 'Income')}
            value={incomeTotal}
            precision={2}
          />,
          <Statistic
            key="expense"
            title={t('product.finance.expense', 'Expense')}
            value={expenseTotal}
            precision={2}
          />,
          <Statistic
            key="pending"
            title={t('product.finance.pendingAmount', 'Pending amount')}
            value={pendingTotal}
            precision={2}
          />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => {
              actionRef.current?.reload();
              reloadLookups();
            }}
          />,
          <Button key="reason" icon={<PlusOutlined />} onClick={() => setReasonOpen(true)}>
            {t('product.finance.newReason', 'New reason')}
          </Button>,
          <Button
            key="new"
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => setEditorOpen(true)}
          >
            {t('product.finance.newIncomeExpense', 'New income or expense')}
          </Button>,
        ]}
      />

      <IncomeExpenseEditor
        open={editorOpen}
        accounts={accounts}
        reasons={reasons}
        submitting={submitting}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmit}
      />

      <Drawer
        width={520}
        open={reasonOpen}
        title={t('product.finance.newReason', 'New reason')}
        onClose={() => setReasonOpen(false)}
        destroyOnClose
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => reasonForm.submit()}>
            {t('product.finance.saveReason', 'Save reason')}
          </Button>
        }
      >
        <Form<CashflowReasonRequest>
          form={reasonForm}
          layout="vertical"
          initialValues={{ reason_kind: 'income', active: true }}
          onFinish={handleReasonSubmit}
        >
          <Form.Item
            name="reason_kind"
            label={t('product.finance.recordKind', 'Type')}
            rules={[{ required: true }]}
          >
            <Segmented
              block
              options={[
                { label: t('product.finance.income', 'Income'), value: 'income' },
                { label: t('product.finance.expense', 'Expense'), value: 'expense' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="reason_name"
            label={t('product.finance.reason', 'Reason')}
            rules={[{ required: true }]}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="description" label={t('product.finance.description', 'Description')}>
            <Input.TextArea rows={3} maxLength={512} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        width={820}
        open={detailOpen}
        title={current?.record_no || t('product.finance_income_expenses', 'Income & Expenses')}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label={t('product.finance.recordKind', 'Type')}>
            {current?.record_kind}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.finance.status', 'Status')}>
            {current?.status}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.finance.reason', 'Reason')}>
            {current?.reason?.reason_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.finance.amount', 'Amount')}>
            {money(current?.amount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.finance.pendingAmount', 'Pending amount')}>
            {money(current?.pending_amount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.finance.referenceNo', 'Reference no.')}>
            {current?.reference_no || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.finance.note', 'Note')} span={2}>
            {current?.note || '-'}
          </Descriptions.Item>
        </Descriptions>

        <Table<CashflowTender>
          style={{ marginTop: 16 }}
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={current?.tenders || []}
          columns={[
            {
              title: t('product.finance.tenderKind', 'Tender'),
              dataIndex: 'tender_kind',
            },
            {
              title: t('product.finance.amount', 'Amount'),
              dataIndex: 'amount',
              align: 'right',
              render: (value) => money(value),
            },
            {
              title: t('product.finance.status', 'Status'),
              dataIndex: 'status',
            },
            {
              title: t('product.finance.paymentAccount', 'Payment account'),
              dataIndex: 'payment_account_id',
              render: (value) => moneyAccountLabel(accounts, value as string),
            },
            {
              title: t('product.finance.chequeNo', 'Cheque no.'),
              dataIndex: 'cheque_number',
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default IncomeExpensePage;
