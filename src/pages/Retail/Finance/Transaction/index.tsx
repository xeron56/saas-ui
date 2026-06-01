import { EyeOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl, useLocation } from '@umijs/max';
import { Button, Descriptions, Drawer, message, Statistic, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import TransactionEditor from './TransactionEditor';
import {
  createMoneyMovement,
  getMoneyMovement,
  listMoneyAccounts,
  listMoneyMovements,
} from '../service';
import type { MoneyAccount, MoneyMovement, MoneyMovementRequest } from '../types';

const typeColor: Record<string, string> = {
  bank_to_bank: 'blue',
  bank_to_cash: 'cyan',
  cash_to_bank: 'geekblue',
  adjust_bank: 'purple',
  adjust_cash: 'gold',
  income: 'green',
  expense: 'red',
};

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

type MovementDuration =
  | 'today'
  | 'yesterday'
  | 'last_seven_days'
  | 'last_thirty_days'
  | 'current_month'
  | 'last_month'
  | 'current_year';

const readMovementDurationFilter = (
  pathname: string,
  search: string,
): MovementDuration | undefined => {
  const value = new URLSearchParams(search).get('duration');
  if (
    value === 'today' ||
    value === 'yesterday' ||
    value === 'last_seven_days' ||
    value === 'last_thirty_days' ||
    value === 'current_month' ||
    value === 'last_month' ||
    value === 'current_year'
  ) {
    return value;
  }
  return pathname.includes('/finance/day-book') ? 'today' : undefined;
};

const MoneyMovementPage: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const actionRef = useRef<ActionType>();
  const reportDuration = readMovementDurationFilter(location.pathname, location.search);
  const isDayBook = location.pathname.includes('/finance/day-book');
  const [accounts, setAccounts] = useState<MoneyAccount[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<MoneyMovement>();
  const [submitting, setSubmitting] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const reloadAccounts = async () => {
    const resp = await listMoneyAccounts({ page_offset: 0, page_size: 100, active: true });
    setAccounts(resp.items || []);
  };

  useEffect(() => {
    reloadAccounts();
  }, []);

  const openDetail = async (record: MoneyMovement) => {
    const detail = await getMoneyMovement(record.id);
    setCurrent(detail);
    setDetailOpen(true);
  };

  const handleSubmit = async (values: MoneyMovementRequest) => {
    setSubmitting(true);
    try {
      await createMoneyMovement(values);
      message.success(t('retail.finance.movementPosted', 'Movement posted'));
      setEditorOpen(false);
      actionRef.current?.reload();
      reloadAccounts();
    } finally {
      setSubmitting(false);
    }
  };

  const accountName = (record: MoneyMovement) =>
    record.payment_account?.account_name ||
    record.from_account?.account_name ||
    record.to_account?.account_name ||
    '-';

  const columns: ProColumns<MoneyMovement>[] = [
    {
      title: t('retail.finance.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('retail.finance.movementNo', 'Movement no.'),
      dataIndex: 'movement_no',
      width: 150,
      render: (_, record) => <a onClick={() => openDetail(record)}>{record.movement_no}</a>,
    },
    {
      title: t('retail.finance.account', 'Account'),
      dataIndex: 'account_id',
      hideInTable: true,
      valueType: 'select',
      fieldProps: {
        options: accounts.map((account) => ({
          label: account.account_name,
          value: account.id,
        })),
      },
    },
    {
      title: t('retail.finance.account', 'Account'),
      dataIndex: 'account_name',
      search: false,
      width: 180,
      renderText: (_, record) => accountName(record),
    },
    {
      title: t('retail.finance.movementType', 'Movement type'),
      dataIndex: 'movement_type',
      valueEnum: {
        bank_to_bank: { text: t('retail.finance.bankToBank', 'Bank to bank') },
        bank_to_cash: { text: t('retail.finance.bankToCash', 'Bank to cash') },
        cash_to_bank: { text: t('retail.finance.cashToBank', 'Cash to bank') },
        adjust_bank: { text: t('retail.finance.adjustBank', 'Adjust bank') },
        adjust_cash: { text: t('retail.finance.adjustCash', 'Adjust cash') },
        income: { text: t('retail.finance.income', 'Income') },
        expense: { text: t('retail.finance.expense', 'Expense') },
      },
      render: (_, record) => (
        <Tag color={typeColor[record.movement_type || '']}>{record.movement_type}</Tag>
      ),
    },
    {
      title: t('retail.finance.direction', 'Direction'),
      dataIndex: 'direction',
      valueEnum: {
        credit: { text: t('retail.finance.credit', 'Credit') },
        debit: { text: t('retail.finance.debit', 'Debit') },
        transfer: { text: t('retail.finance.transfer', 'Transfer') },
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
      dataIndex: 'occurred_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: t('retail.finance.referenceNo', 'Reference no.'),
      dataIndex: 'reference_no',
      search: false,
      width: 160,
    },
    {
      title: t('retail.finance.operate', 'Operate'),
      valueType: 'option',
      width: 90,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)} />,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<MoneyMovement>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        params={{ report_duration: reportDuration }}
        pagination={{ defaultPageSize: 10 }}
        scroll={{ x: 1200 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const currentPage = params.current || 1;
          const resp = await listMoneyMovements({
            page_offset: (currentPage - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            movement_type: params.movement_type,
            direction: params.direction,
            account_id: params.account_id,
            duration: reportDuration,
          });
          setCashBalance(resp.cash_balance || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          isDayBook && (
            <Tag key="day-book" color="blue">
              {t('retail.finance.dayBook', 'Day Book')}
            </Tag>
          ),
          <Statistic
            key="cash"
            title={t('retail.finance.cashBalance', 'Cash balance')}
            value={cashBalance}
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
          <Button
            key="new"
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => setEditorOpen(true)}
          >
            {t('retail.finance.newMovement', 'New money movement')}
          </Button>,
        ]}
      />
      <TransactionEditor
        open={editorOpen}
        accounts={accounts}
        submitting={submitting}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmit}
      />
      <Drawer
        width={760}
        open={detailOpen}
        title={current?.movement_no || t('retail.finance_transactions', 'Money movements')}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label={t('retail.finance.movementType', 'Movement type')}>
            {current?.movement_type}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.amount', 'Amount')}>
            {money(current?.amount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.fromAccount', 'From account')}>
            {current?.from_account?.account_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.toAccount', 'To account')}>
            {current?.to_account?.account_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.account', 'Account')}>
            {current?.payment_account?.account_name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.referenceNo', 'Reference no.')}>
            {current?.reference_no || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('retail.finance.note', 'Note')} span={2}>
            {current?.note || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </PageContainer>
  );
};

export default MoneyMovementPage;
