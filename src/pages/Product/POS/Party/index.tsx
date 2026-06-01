import {
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Drawer, message, Popconfirm, Statistic, Table, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import PartyEditor from './PartyEditor';
import {
  createRetailPartner,
  deleteRetailPartner,
  getRetailPartner,
  getRetailPartnerLedger,
  listRetailPartners,
  updateRetailPartner,
} from './service';
import type {
  PartnerKind,
  RetailPartner,
  RetailPartnerLedgerLine,
  RetailPartnerRequest,
} from './types';

const roleColor: Record<PartnerKind, string> = {
  customer: 'blue',
  supplier: 'volcano',
};

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const PartnerPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<RetailPartner>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [totalDue, setTotalDue] = useState(0);
  const [totalWallet, setTotalWallet] = useState(0);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerPartner, setLedgerPartner] = useState<RetailPartner>();
  const [ledgerLines, setLedgerLines] = useState<RetailPartnerLedgerLine[]>([]);

  const openNew = () => {
    setEditing(undefined);
    setEditorOpen(true);
  };

  const openEdit = async (record: RetailPartner) => {
    const detail = await getRetailPartner(record.id);
    setEditing(detail);
    setEditorOpen(true);
  };

  const openLedger = async (record: RetailPartner) => {
    const resp = await getRetailPartnerLedger(record.id);
    setLedgerPartner(resp.partner || record);
    setLedgerLines(resp.items || []);
    setLedgerOpen(true);
  };

  const handleSubmit = async (values: RetailPartnerRequest) => {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateRetailPartner(editing.id, values);
        message.success('Partner updated');
      } else {
        await createRetailPartner(values);
        message.success('Partner created');
      }
      setEditorOpen(false);
      setEditing(undefined);
      actionRef.current?.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailPartner>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Role',
      dataIndex: 'kind',
      valueEnum: {
        customer: { text: 'Customer' },
        supplier: { text: 'Supplier' },
      },
      render: (_, record) => {
        const kind = (record.kind || 'customer') as PartnerKind;
        return <Tag color={roleColor[kind]}>{kind.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Tier',
      dataIndex: 'segment',
      valueEnum: {
        retail: { text: 'Retail' },
        dealer: { text: 'Dealer' },
        wholesale: { text: 'Wholesale' },
        supplier: { text: 'Supplier' },
      },
      render: (_, record) => <Tag>{(record.segment || 'retail').toUpperCase()}</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'display_name',
      render: (_, record) => <a onClick={() => openEdit(record)}>{record.display_name}</a>,
    },
    {
      title: 'Code',
      dataIndex: 'partner_code',
      search: false,
      width: 120,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      search: false,
      width: 140,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      search: false,
      width: 180,
      ellipsis: true,
    },
    {
      title: 'City',
      dataIndex: 'city',
      search: false,
      width: 120,
    },
    {
      title: 'Due',
      dataIndex: 'due_balance',
      search: false,
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: 'Wallet',
      dataIndex: 'wallet_balance',
      search: false,
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: 'Credit limit',
      dataIndex: 'credit_limit',
      search: false,
      width: 130,
      renderText: (value) => money(value),
    },
    {
      title: 'Active',
      dataIndex: 'active',
      valueType: 'select',
      valueEnum: {
        true: { text: 'Active' },
        false: { text: 'Inactive' },
      },
      render: (_, record) => (
        <Tag color={record.active === false ? 'default' : 'green'}>
          {record.active === false ? 'INACTIVE' : 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: 'Operate',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button
          key="ledger"
          type="link"
          icon={<FileSearchOutlined />}
          onClick={() => openLedger(record)}
        />,
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />,
        <Popconfirm
          key="delete"
          title="Delete partner?"
          onConfirm={async () => {
            await deleteRetailPartner(record.id);
            message.success('Partner deleted');
            actionRef.current?.reload();
          }}
        >
          <Button danger type="link" icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<RetailPartner>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listRetailPartners({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            kind: params.kind,
            segment: params.segment,
            active: params.active,
          });
          setTotalDue(resp.total_due_balance || 0);
          setTotalWallet(resp.total_wallet_balance || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size || resp.total_size || 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Statistic key="due" title="Due balance" value={totalDue} precision={2} />,
          <Statistic key="wallet" title="Advance wallet" value={totalWallet} precision={2} />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openNew}>
            New partner
          </Button>,
        ]}
      />
      <PartyEditor
        open={editorOpen}
        item={editing}
        submitting={submitting}
        onClose={() => {
          setEditorOpen(false);
          setEditing(undefined);
        }}
        onSubmit={handleSubmit}
      />
      <Drawer
        width={820}
        open={ledgerOpen}
        title={ledgerPartner?.display_name || 'Ledger'}
        onClose={() => setLedgerOpen(false)}
        destroyOnClose
      >
        <Table<RetailPartnerLedgerLine>
          rowKey={(record) => record.id || `${record.source_kind}-${record.created_at}`}
          pagination={false}
          dataSource={ledgerLines}
          columns={[
            {
              title: 'Date',
              dataIndex: 'date',
              width: 160,
              render: (value) => (value ? new Date(value).toLocaleString() : ''),
            },
            {
              title: 'Source',
              dataIndex: 'source_kind',
              width: 120,
              render: (value) => <Tag>{String(value || '').toUpperCase()}</Tag>,
            },
            {
              title: 'Ref',
              dataIndex: 'reference_no',
              width: 140,
            },
            {
              title: 'Debit',
              dataIndex: 'debit_amount',
              align: 'right',
              render: (value) => money(value),
            },
            {
              title: 'Credit',
              dataIndex: 'credit_amount',
              align: 'right',
              render: (value) => money(value),
            },
            {
              title: 'Balance',
              dataIndex: 'balance',
              align: 'right',
              render: (value) => money(value),
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default PartnerPage;
