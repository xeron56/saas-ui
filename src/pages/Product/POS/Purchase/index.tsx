import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Button, Drawer, message, Popconfirm, Statistic, Table, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { isReportRoute, readReportDurationFilter, reportDurationParams } from '../reportFilters';
import { getCatalogLookups, listCatalogItems } from '../Catalog/service';
import type { CatalogItem } from '../Catalog/types';
import { listMoneyAccounts, listPaymentTypes } from '../Finance/service';
import { moneyAccountLabel, paymentTypeLabel } from '../Finance/tenderAccount';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import { listRetailPartners } from '../Party/service';
import type { RetailPartner } from '../Party/types';
import PurchaseEditor from './PurchaseEditor';
import {
  createRetailPurchase,
  getRetailPurchase,
  listRetailPurchases,
  updateRetailPurchase,
  voidRetailPurchase,
} from './service';
import type {
  PurchaseLookupState,
  PurchaseLotOption,
  RetailPurchase,
  RetailPurchaseLine,
  RetailPurchaseRequest,
} from './types';

const statusColor: Record<string, string> = {
  posted: 'green',
  voided: 'default',
};

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const flattenPurchaseLots = (items: CatalogItem[]): PurchaseLotOption[] =>
  items.flatMap((item) =>
    (item.lots || [])
      .filter((lot) => lot.active !== false)
      .map((lot) => ({
        label: `${item.display_name} · ${lot.batch_code || 'open batch'} · ${money(
          lot.quantity,
        )} on hand`,
        value: lot.id!,
        item_id: item.id,
        item_name: item.display_name || '',
        batch_code: lot.batch_code,
        variant_name: lot.variant_name,
        unit_cost: lot.purchase_cost || item.purchase_cost || 0,
        sale_price: lot.sale_price || item.sale_price || 0,
        wholesale_price: lot.wholesale_price || item.wholesale_price || 0,
        dealer_price: lot.dealer_price || item.dealer_price || 0,
        profit_percent: lot.profit_percent || item.profit_percent || 0,
        storage_site_id: lot.storage_site_id,
      })),
  );

const purchaseLotOptionsForEditor = (
  baseOptions: PurchaseLotOption[],
  purchase?: RetailPurchase,
): PurchaseLotOption[] => {
  if (!purchase?.lines?.length) {
    return baseOptions;
  }
  const known = new Set(baseOptions.map((option) => option.value));
  const lines = purchase.lines as RetailPurchaseLine[];
  const selected = lines
    .filter((line) => line.lot_id && !known.has(line.lot_id))
    .map((line) => ({
      label: `${line.item_name || 'Selected item'} · ${
        line.batch_code || 'open batch'
      } · current purchase lot`,
      value: line.lot_id!,
      item_id: line.item_id || '',
      item_name: line.item_name || '',
      batch_code: line.batch_code,
      variant_name: line.variant_name,
      unit_cost: line.unit_cost || line.purchase_cost || 0,
      sale_price: line.sale_price || 0,
      wholesale_price: line.wholesale_price || 0,
      dealer_price: line.dealer_price || 0,
      profit_percent: line.profit_percent || 0,
      storage_site_id: line.storage_site_id,
    }));
  return selected.length ? [...selected, ...baseOptions] : baseOptions;
};

const PurchasePage: React.FC = () => {
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
  const [editing, setEditing] = useState<RetailPurchase>();
  const [submitting, setSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<RetailPurchase>();
  const [lookups, setLookups] = useState<PurchaseLookupState>({
    branches: [],
    items: [],
    suppliers: [],
    lotOptions: [],
    moneyAccounts: [],
    paymentTypes: [],
  });

  const reloadLookups = async () => {
    const [lookupResp, itemResp, supplierResp, accountResp, paymentTypeResp] = await Promise.all([
      getCatalogLookups(),
      listCatalogItems({ page_offset: 0, page_size: 100, active: true }),
      listRetailPartners({ page_offset: 0, page_size: 100, kind: 'supplier', active: true }),
      listMoneyAccounts({ page_offset: 0, page_size: 100, active: true }),
      listPaymentTypes(),
    ]);
    const items = (itemResp.items || []) as CatalogItem[];
    const suppliers = (supplierResp.items || []) as RetailPartner[];
    const moneyAccounts = (accountResp.items || []) as MoneyAccount[];
    const paymentTypes = (paymentTypeResp.data || []) as PaymentType[];
    setLookups({
      branches: lookupResp.branches || [],
      items,
      suppliers,
      lotOptions: flattenPurchaseLots(items),
      moneyAccounts,
      paymentTypes,
    });
  };

  useEffect(() => {
    reloadLookups();
  }, []);

  const openDetail = async (record: RetailPurchase) => {
    const detail = await getRetailPurchase(record.id);
    setCurrent(detail);
    setDetailOpen(true);
  };

  const openNew = () => {
    setEditing(undefined);
    setEditorOpen(true);
  };

  const openEdit = async (record: RetailPurchase) => {
    const detail = await getRetailPurchase(record.id);
    setEditing(detail);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(undefined);
  };

  const handleSubmit = async (values: RetailPurchaseRequest) => {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateRetailPurchase(editing.id, values);
        message.success('Purchase updated');
      } else {
        await createRetailPurchase(values);
        message.success('Purchase posted');
      }
      closeEditor();
      actionRef.current?.reload();
      reloadLookups();
    } finally {
      setSubmitting(false);
    }
  };

  const editorLotOptions = purchaseLotOptionsForEditor(lookups.lotOptions, editing);

  const columns: ProColumns<RetailPurchase>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Receipt',
      dataIndex: 'receipt_no',
      render: (_, record) => <a onClick={() => openDetail(record)}>{record.receipt_no}</a>,
    },
    {
      title: 'Supplier invoice',
      dataIndex: 'supplier_invoice_no',
      search: false,
      width: 150,
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
      title: 'Purchased at',
      dataIndex: 'purchased_at',
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
      title: 'Total',
      dataIndex: 'actual_amount',
      search: false,
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: 'Paid',
      dataIndex: 'paid_amount',
      search: false,
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: 'Due',
      dataIndex: 'due_amount',
      search: false,
      width: 120,
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
      width: 170,
      render: (_, record) => [
        <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => openDetail(record)} />,
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          disabled={record.status === 'voided'}
          onClick={() => openEdit(record)}
        />,
        <Popconfirm
          key="void"
          title="Void this purchase?"
          disabled={record.status === 'voided'}
          onConfirm={async () => {
            await voidRetailPurchase(record.id);
            message.success('Purchase voided');
            actionRef.current?.reload();
            reloadLookups();
          }}
        >
          <Button
            danger
            disabled={record.status === 'voided'}
            type="link"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<RetailPurchase>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        params={{ report_duration: reportDuration, report_search: location.search }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const currentPage = params.current || 1;
          const resp = await listRetailPurchases({
            page_offset: (currentPage - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            status: params.status,
            ...reportFilters,
          });
          setTotalAmount(resp.total_amount || 0);
          setDueAmount(resp.due_amount || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          reportMode && (
            <Tag key="report" color="blue">
              Purchase report
            </Tag>
          ),
          <Statistic key="purchases" title="Purchases total" value={totalAmount} precision={2} />,
          <Statistic key="due" title="Due total" value={dueAmount} precision={2} />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => {
              actionRef.current?.reload();
              reloadLookups();
            }}
          />,
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openNew}>
            New purchase
          </Button>,
        ]}
      />
      <PurchaseEditor
        open={editorOpen}
        item={editing}
        lookups={lookups}
        lotOptions={editorLotOptions}
        submitting={submitting}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />
      <Drawer
        width={960}
        open={detailOpen}
        title={current?.receipt_no || 'Purchase'}
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
            { title: 'Variant', dataIndex: 'variant_name', width: 140 },
            { title: 'Qty', dataIndex: 'quantity', width: 90, align: 'right' },
            {
              title: 'Cost',
              dataIndex: 'unit_cost',
              width: 100,
              align: 'right',
              render: (value) => money(value as number),
            },
            {
              title: 'Total',
              dataIndex: 'line_subtotal',
              width: 110,
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
            { title: 'Payment', dataIndex: 'tender_kind' },
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

export default PurchasePage;
