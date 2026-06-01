import { DollarOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl, useLocation } from '@umijs/max';
import { Button, Descriptions, Drawer, message, Statistic, Table, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { listMoneyAccounts, listPaymentTypes } from '../Finance/service';
import { moneyAccountLabel, paymentTypeLabel } from '../Finance/tenderAccount';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import { listRetailPartners } from '../Party/service';
import type { RetailPartner } from '../Party/types';
import { isReportRoute, readReportDurationFilter, reportDurationParams } from '../reportFilters';
import DueCollectionEditor from './DueCollectionEditor';
import {
  createRetailDueCollection,
  getRetailDueCollection,
  listRetailDueCollections,
} from './service';
import type { RetailDueCollection, RetailDueCollectionRequest } from './types';

const statusColor: Record<string, string> = {
  posted: 'green',
  voided: 'default',
};

const kindColor: Record<string, string> = {
  customer_collection: 'blue',
  supplier_payment: 'purple',
};

type DueCollectionKind = 'customer_collection' | 'supplier_payment';

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const readDueKindFilter = (search: string): DueCollectionKind | undefined => {
  const value = new URLSearchParams(search).get('kind');
  return value === 'customer_collection' || value === 'supplier_payment' ? value : undefined;
};

const DueCollectionPage: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const actionRef = useRef<ActionType>();
  const initialDueKind = readDueKindFilter(location.search);
  const reportDuration = readReportDurationFilter(
    location.pathname,
    location.search,
    'last_thirty_days',
  );
  const reportMode = isReportRoute(location.pathname);
  const reportFilters = reportDurationParams(reportDuration, location.search);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [partners, setPartners] = useState<RetailPartner[]>([]);
  const [moneyAccounts, setMoneyAccounts] = useState<MoneyAccount[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [current, setCurrent] = useState<RetailDueCollection>();
  const [summary, setSummary] = useState({ settled: 0, pending: 0, remaining: 0 });

  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const reloadLookups = async () => {
    const [partnerResp, accountResp, paymentTypeResp] = await Promise.all([
      listRetailPartners({ page_offset: 0, page_size: 100 }),
      listMoneyAccounts({ page_offset: 0, page_size: 100, active: true }),
      listPaymentTypes(),
    ]);
    setPartners(partnerResp.items || []);
    setMoneyAccounts(accountResp.items || []);
    setPaymentTypes(paymentTypeResp.data || []);
  };

  useEffect(() => {
    reloadLookups();
  }, []);

  const openDetail = async (record: RetailDueCollection) => {
    const detail = await getRetailDueCollection(record.id);
    setCurrent(detail);
    setDetailOpen(true);
  };

  const handleSubmit = async (values: RetailDueCollectionRequest) => {
    setSubmitting(true);
    try {
      await createRetailDueCollection(values);
      message.success(t('product.dueCollection.posted', 'Due payment posted'));
      setEditorOpen(false);
      actionRef.current?.reload();
      reloadLookups();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailDueCollection>[] = [
    {
      title: t('product.dueCollection.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('product.dueCollection.receiptNo', 'Receipt no.'),
      dataIndex: 'settlement_no',
      width: 150,
      render: (_, record) => <a onClick={() => openDetail(record)}>{record.settlement_no}</a>,
    },
    {
      title: t('product.dueCollection.party', 'Account'),
      dataIndex: ['partner', 'display_name'],
      search: false,
      width: 180,
      renderText: (_, record) => record.partner?.display_name || 'Walk-in sale',
    },
    {
      title: t('product.dueCollection.kind', 'Type'),
      dataIndex: 'kind',
      valueEnum: {
        customer_collection: {
          text: t('product.dueCollection.customerReceipt', 'Customer receipt'),
        },
        supplier_payment: { text: t('product.dueCollection.supplierPayment', 'Supplier payment') },
      },
      render: (_, record) => {
        const kind = record.settlement_kind || 'customer_collection';
        const label =
          kind === 'supplier_payment'
            ? t('product.dueCollection.supplierPayment', 'Supplier payment')
            : t('product.dueCollection.customerReceipt', 'Customer receipt');
        return <Tag color={kindColor[kind]}>{label}</Tag>;
      },
    },
    {
      title: t('product.dueCollection.invoice', 'Invoice'),
      dataIndex: ['invoice', 'invoice_no'],
      search: false,
      width: 140,
      renderText: (_, record) => record.invoice?.invoice_no || '-',
    },
    {
      title: t('product.dueCollection.date', 'Payment date'),
      dataIndex: 'settled_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: t('product.dueCollection.previousDue', 'Previous due'),
      dataIndex: 'previous_due_amount',
      search: false,
      width: 130,
      align: 'right',
      renderText: (value) => money(value),
    },
    {
      title: t('product.dueCollection.collectedAmount', 'Settled amount'),
      dataIndex: 'settled_amount',
      search: false,
      width: 130,
      align: 'right',
      renderText: (value) => money(value),
    },
    {
      title: t('product.dueCollection.pendingCheque', 'Pending cheque'),
      dataIndex: 'pending_amount',
      search: false,
      width: 130,
      align: 'right',
      renderText: (value) => money(value),
    },
    {
      title: t('product.dueCollection.remainingDue', 'Remaining due'),
      dataIndex: 'remaining_due_amount',
      search: false,
      width: 130,
      align: 'right',
      renderText: (value) => money(value),
    },
    {
      title: t('product.dueCollection.status', 'Status'),
      dataIndex: 'status',
      valueEnum: {
        posted: { text: t('product.dueCollection.postedStatus', 'Posted') },
        voided: { text: t('product.dueCollection.voidedStatus', 'Voided') },
      },
      render: (_, record) => {
        const status = record.status || 'posted';
        return <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: t('product.dueCollection.operate', 'Operate'),
      valueType: 'option',
      width: 90,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)} />,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<RetailDueCollection>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        params={{
          report_kind: initialDueKind,
          report_duration: reportDuration,
          report_search: location.search,
        }}
        form={{ initialValues: initialDueKind ? { kind: initialDueKind } : undefined }}
        pagination={{ defaultPageSize: 10 }}
        scroll={{ x: 1320 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const currentPage = params.current || 1;
          const kind = (params.kind as DueCollectionKind | undefined) || initialDueKind;
          const resp = await listRetailDueCollections({
            page_offset: (currentPage - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            kind,
            status: params.status,
            ...reportFilters,
          });
          setSummary({
            settled: resp.settled_amount || 0,
            pending: resp.pending_amount || 0,
            remaining: resp.remaining_due || 0,
          });
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          reportMode && (
            <Tag key="report" color="blue">
              {t('product.report.legacy.dueTransaction', 'Due transaction report')}
            </Tag>
          ),
          <Statistic
            key="settled"
            title={t('product.dueCollection.collectedAmount', 'Settled amount')}
            value={summary.settled}
            precision={2}
          />,
          <Statistic
            key="pending"
            title={t('product.dueCollection.pendingCheque', 'Pending cheque')}
            value={summary.pending}
            precision={2}
          />,
          <Statistic
            key="remaining"
            title={t('product.dueCollection.remainingDue', 'Remaining due')}
            value={summary.remaining}
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
          <Button
            key="new"
            type="primary"
            icon={<DollarOutlined />}
            onClick={() => setEditorOpen(true)}
          >
            {t('product.dueCollection.collect', 'Collect due')}
          </Button>,
        ]}
      />

      <DueCollectionEditor
        open={editorOpen}
        partners={partners}
        moneyAccounts={moneyAccounts}
        paymentTypes={paymentTypes}
        submitting={submitting}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmit}
      />

      <Drawer
        width={880}
        open={detailOpen}
        title={current?.settlement_no || t('product.due_collections', 'Due collections')}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label={t('product.dueCollection.party', 'Account')}>
            {current?.partner?.display_name || 'Walk-in sale'}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.dueCollection.invoice', 'Invoice')}>
            {current?.invoice?.invoice_no || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.dueCollection.previousDue', 'Previous due')}>
            {money(current?.previous_due_amount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.dueCollection.collectedAmount', 'Settled amount')}>
            {money(current?.settled_amount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.dueCollection.pendingCheque', 'Pending cheque')}>
            {money(current?.pending_amount)}
          </Descriptions.Item>
          <Descriptions.Item label={t('product.dueCollection.remainingDue', 'Remaining due')}>
            {money(current?.remaining_due_amount)}
          </Descriptions.Item>
        </Descriptions>
        <Table
          style={{ marginTop: 24 }}
          rowKey="id"
          pagination={false}
          dataSource={current?.tenders || []}
          columns={[
            {
              title: t('product.dueCollection.paymentMethod', 'Payment method'),
              dataIndex: 'tender_kind',
            },
            {
              title: t('product.report.paymentType', 'Payment type'),
              dataIndex: 'payment_type_id',
              render: (value) => paymentTypeLabel(paymentTypes, value as string),
            },
            {
              title: t('product.finance.paymentAccount', 'Payment account'),
              dataIndex: 'payment_account_id',
              render: (value) => moneyAccountLabel(moneyAccounts, value as string),
            },
            { title: t('product.dueCollection.status', 'Status'), dataIndex: 'status', width: 120 },
            {
              title: t('product.dueCollection.referenceNo', 'Reference no.'),
              dataIndex: 'reference_no',
            },
            {
              title: t('product.dueCollection.chequeNo', 'Cheque no.'),
              dataIndex: 'cheque_number',
            },
            {
              title: t('product.dueCollection.amount', 'Amount'),
              dataIndex: 'amount',
              width: 120,
              align: 'right',
              render: (value) => money(value as number),
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default DueCollectionPage;
