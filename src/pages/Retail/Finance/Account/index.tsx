import { BankOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, message, Popconfirm, Statistic, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import AccountEditor from './AccountEditor';
import {
  createMoneyAccount,
  deleteMoneyAccount,
  listMoneyAccounts,
  updateMoneyAccount,
} from '../service';
import type { MoneyAccount, MoneyAccountRequest } from '../types';

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const MoneyAccountPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [current, setCurrent] = useState<MoneyAccount>();
  const [submitting, setSubmitting] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const handleSubmit = async (values: MoneyAccountRequest) => {
    setSubmitting(true);
    try {
      if (current) {
        await updateMoneyAccount(current.id, values);
      } else {
        await createMoneyAccount(values);
      }
      message.success(t('retail.finance.accountSaved', 'Account saved'));
      setEditorOpen(false);
      setCurrent(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<MoneyAccount>[] = [
    {
      title: t('retail.finance.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('retail.finance.accountName', 'Account name'),
      dataIndex: 'account_name',
      render: (_, record) => (
        <a
          onClick={() => {
            setCurrent(record);
            setEditorOpen(true);
          }}
        >
          {record.account_name}
        </a>
      ),
    },
    {
      title: t('retail.finance.branchRef', 'Branch ref'),
      dataIndex: 'branch_ref',
      search: false,
      width: 150,
    },
    {
      title: t('retail.finance.openingBalance', 'Opening balance'),
      dataIndex: 'opening_balance',
      search: false,
      align: 'right',
      width: 150,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.finance.currentBalance', 'Current balance'),
      dataIndex: 'current_balance',
      search: false,
      align: 'right',
      width: 150,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.finance.active', 'Active'),
      dataIndex: 'active',
      valueEnum: {
        true: { text: t('retail.finance.active', 'Active') },
        false: { text: t('retail.finance.inactive', 'Inactive') },
      },
      render: (_, record) => (
        <Tag color={record.active === false ? 'default' : 'green'}>
          {record.active === false
            ? t('retail.finance.inactive', 'Inactive')
            : t('retail.finance.active', 'Active')}
        </Tag>
      ),
    },
    {
      title: t('retail.finance.updated', 'Updated'),
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: t('retail.finance.operate', 'Operate'),
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setCurrent(record);
            setEditorOpen(true);
          }}
        />,
        <Popconfirm
          key="delete"
          title={t('retail.finance.deleteAccount', 'Delete this account?')}
          onConfirm={async () => {
            await deleteMoneyAccount(record.id);
            actionRef.current?.reload();
          }}
        >
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<MoneyAccount>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const currentPage = params.current || 1;
          const resp = await listMoneyAccounts({
            page_offset: (currentPage - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            active: params.active,
          });
          setTotalBalance(resp.total_balance || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Statistic
            key="balance"
            title={t('retail.finance.totalBankBalance', 'Total bank balance')}
            value={totalBalance}
            precision={2}
          />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
          <Button
            key="new"
            type="primary"
            icon={<BankOutlined />}
            onClick={() => {
              setCurrent(undefined);
              setEditorOpen(true);
            }}
          >
            {t('retail.finance.newAccount', 'New payment account')}
          </Button>,
        ]}
      />
      <AccountEditor
        open={editorOpen}
        account={current}
        submitting={submitting}
        onClose={() => {
          setEditorOpen(false);
          setCurrent(undefined);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
};

export default MoneyAccountPage;
