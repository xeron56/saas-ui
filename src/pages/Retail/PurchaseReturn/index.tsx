import { EyeOutlined, ReloadOutlined, RollbackOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Button, Drawer, message, Statistic, Table, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { isReportRoute, readReportDurationFilter, reportDurationParams } from '../reportFilters';
import { getCatalogLookups } from '../Catalog/service';
import type { CatalogBranch } from '../Catalog/types';
import { listMoneyAccounts, listPaymentTypes } from '../Finance/service';
import { moneyAccountLabel, paymentTypeLabel } from '../Finance/tenderAccount';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import { getRetailPurchase, listRetailPurchases } from '../Purchase/service';
import type { RetailPurchase } from '../Purchase/types';
import PurchaseReturnEditor from './PurchaseReturnEditor';
import {
  createRetailPurchaseReturn,
  getRetailPurchaseReturn,
  listRetailPurchaseReturns,
} from './service';
import type {
  PurchaseReturnLookupState,
  RetailPurchaseReturn,
  RetailPurchaseReturnRequest,
} from './types';

const statusColor: Record<string, string> = {
  posted: 'volcano',
  voided: 'default',
};

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const branchLabel = (branch: CatalogBranch) =>
  branch.label || branch.name || branch.code || branch.id;

const PurchaseReturnPage: React.FC = () => {
  const location = useLocation();
  const actionRef = useRef<ActionType>();
  const reportDuration = readReportDurationFilter(
    location.pathname,
    location.search,
    'last_thirty_days',
  );
  const reportMode = isReportRoute(location.pathname);
  const reportFilters = reportDurationParams(reportDuration, location.search);
  const [editorOpen, setEditorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returnAmount, setReturnAmount] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<RetailPurchaseReturn>();
  const [lookups, setLookups] = useState<PurchaseReturnLookupState>({
    branches: [],
    purchases: [],
    lineOptions: [],
    moneyAccounts: [],
    paymentTypes: [],
  });

  const reloadLookups = async () => {
    const branchParams = reportFilters.branch_ref ? { branch_ref: reportFilters.branch_ref } : {};
    const [lookupResp, purchaseResp, accountResp, paymentTypeResp] = await Promise.all([
      getCatalogLookups(),
      listRetailPurchases({
        page_offset: 0,
        page_size: 100,
        status: 'posted',
        ...branchParams,
      }),
      listMoneyAccounts({ page_offset: 0, page_size: 100, active: true }),
      listPaymentTypes(),
    ]);
    const purchaseSummaries = (purchaseResp.items || []) as RetailPurchase[];
    const detailResults = await Promise.all(
      purchaseSummaries.map((purchase) => getRetailPurchase(purchase.id)),
    );
    const purchases = detailResults.filter((purchase) =>
      (purchase.lines || []).some((line) => Number(line.quantity || 0) > 0),
    );
    setLookups({
      branches: lookupResp.branches || [],
      purchases,
      lineOptions: [],
      moneyAccounts: (accountResp.items || []) as MoneyAccount[],
      paymentTypes: (paymentTypeResp.data || []) as PaymentType[],
    });
  };

  useEffect(() => {
    reloadLookups();
  }, []);

  const openDetail = async (record: RetailPurchaseReturn) => {
    const detail = await getRetailPurchaseReturn(record.id);
    setCurrent(detail);
    setDetailOpen(true);
  };

  const handleSubmit = async (values: RetailPurchaseReturnRequest) => {
    setSubmitting(true);
    try {
      await createRetailPurchaseReturn(values);
      message.success('Purchase return posted');
      setEditorOpen(false);
      actionRef.current?.reload();
      reloadLookups();
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<RetailPurchaseReturn>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Branch',
      dataIndex: 'branch_ref',
      hideInTable: true,
      valueType: 'select',
      fieldProps: {
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        options: lookups.branches.map((branch) => ({
          label: branchLabel(branch),
          value: branch.id,
        })),
      },
    },
    {
      title: 'Return no.',
      dataIndex: 'return_no',
      render: (_, record) => <a onClick={() => openDetail(record)}>{record.return_no}</a>,
    },
    {
      title: 'Purchase',
      dataIndex: 'receipt_no',
      search: false,
      width: 140,
    },
    {
      title: 'Supplier',
      dataIndex: ['supplier', 'display_name'],
      search: false,
      width: 180,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: {
        posted: { text: 'Posted' },
        voided: { text: 'Voided' },
      },
      render: (_, record) => {
        const status = record.status || 'posted';
        return <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Returned at',
      dataIndex: 'returned_at',
      valueType: 'dateTime',
      search: false,
      width: 180,
    },
    {
      title: 'Items',
      dataIndex: 'lines',
      search: false,
      width: 90,
      renderText: (_, record) => record.lines?.length || 0,
    },
    {
      title: 'Return credit',
      dataIndex: 'return_amount',
      search: false,
      width: 140,
      renderText: (value) => money(value),
    },
    {
      title: 'Refunded',
      dataIndex: 'paid_amount',
      search: false,
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: 'Due reduced',
      dataIndex: 'due_reduced_amount',
      search: false,
      width: 130,
      renderText: (value) => money(value),
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
      width: 90,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)} />,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<RetailPurchaseReturn>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        params={{ report_duration: reportDuration, report_search: location.search }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const currentPage = params.current || 1;
          const resp = await listRetailPurchaseReturns({
            page_offset: (currentPage - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            status: params.status,
            branch_ref: params.branch_ref,
            ...reportFilters,
          });
          setReturnAmount(resp.return_amount || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          reportMode && (
            <Tag key="report" color="blue">
              Purchase return report
            </Tag>
          ),
          <Statistic key="returns" title="Returned credit" value={returnAmount} precision={2} />,
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
            icon={<RollbackOutlined />}
            onClick={() => setEditorOpen(true)}
          >
            Return stock
          </Button>,
        ]}
      />
      <PurchaseReturnEditor
        open={editorOpen}
        lookups={lookups}
        submitting={submitting}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSubmit}
      />
      <Drawer
        width={920}
        open={detailOpen}
        title={current?.return_no || 'Purchase return'}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        <Table
          rowKey="id"
          pagination={false}
          dataSource={current?.lines || []}
          columns={[
            { title: 'Item', dataIndex: 'item_name' },
            { title: 'Batch', dataIndex: 'batch_code', width: 140 },
            { title: 'Qty', dataIndex: 'quantity', width: 90, align: 'right' },
            {
              title: 'Unit cost',
              dataIndex: 'unit_cost',
              width: 110,
              align: 'right',
              render: (value) => money(value as number),
            },
            {
              title: 'Credit',
              dataIndex: 'return_amount',
              width: 120,
              align: 'right',
              render: (value) => money(value as number),
            },
          ]}
        />
        <Table
          style={{ marginTop: 24 }}
          rowKey="id"
          pagination={false}
          dataSource={current?.tenders || []}
          columns={[
            { title: 'Refund method', dataIndex: 'tender_kind' },
            {
              title: 'Payment type',
              dataIndex: 'payment_type_id',
              render: (value) => paymentTypeLabel(lookups.paymentTypes, value as string),
            },
            {
              title: 'Account',
              dataIndex: 'payment_account_id',
              render: (value) => moneyAccountLabel(lookups.moneyAccounts, value as string),
            },
            { title: 'Status', dataIndex: 'status' },
            {
              title: 'Amount',
              dataIndex: 'amount',
              align: 'right',
              render: (value) => money(value as number),
            },
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};

export default PurchaseReturnPage;
