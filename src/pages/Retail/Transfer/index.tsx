import { PlusOutlined, ReloadOutlined, SwapOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getCatalogLookups, listCatalogStock } from '../Catalog/service';
import type { CatalogBranch, CatalogSite, CatalogStockLot } from '../Catalog/types';
import { createRetailTransfer, listRetailTransfers } from './service';
import type { RetailTransfer, RetailTransferLine, TransferFormValues } from './types';

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const TransferPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm<TransferFormValues>();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stockLots, setStockLots] = useState<CatalogStockLot[]>([]);
  const [sites, setSites] = useState<CatalogSite[]>([]);
  const [branches, setBranches] = useState<CatalogBranch[]>([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const reloadLookups = async () => {
    const [stockResp, lookupResp] = await Promise.all([
      listCatalogStock({ page_offset: 0, page_size: 200, active: true }),
      getCatalogLookups(),
    ]);
    setStockLots(
      (stockResp.items || []).filter((lot) => (lot.quantity || 0) > 0 && lot.storage_site_id),
    );
    setBranches(lookupResp.branches || []);
    setSites(lookupResp.sites || []);
  };

  useEffect(() => {
    reloadLookups();
  }, []);

  const lotOptions = useMemo(
    () =>
      stockLots.map((lot) => ({
        value: lot.id,
        label: `${lot.item_name || lot.item_code || lot.item_id} · ${
          lot.storage_site?.label || lot.storage_site_id || '-'
        } · ${lot.batch_code || t('retail.transfer.openBatch', 'open batch')} · ${money(
          lot.quantity,
        )}`,
      })),
    [stockLots, t],
  );

  const siteOptions = useMemo(
    () =>
      sites.map((site) => ({
        value: site.id,
        label: site.label || site.code || site.id,
      })),
    [sites],
  );

  const branchOptions = useMemo(
    () =>
      branches.map((branch) => ({
        value: branch.id,
        label: branch.label || branch.name || branch.code || branch.id,
      })),
    [branches],
  );

  const openNew = () => {
    form.resetFields();
    setOpen(true);
  };

  const handleSubmit = async (values: TransferFormValues) => {
    setSubmitting(true);
    try {
      await createRetailTransfer({
        to_storage_site_id: values.to_storage_site_id,
        from_branch_id: values.from_branch_id?.trim() || undefined,
        to_branch_id: values.to_branch_id?.trim() || undefined,
        branch_ref: values.branch_ref?.trim() || undefined,
        note: values.note?.trim() || undefined,
        lines: [
          {
            from_lot_id: values.from_lot_id,
            to_storage_site_id: values.to_storage_site_id,
            quantity: values.quantity || 0,
          },
        ],
      });
      message.success(t('retail.transfer.created', 'Transfer posted'));
      setOpen(false);
      actionRef.current?.reload();
      void reloadLookups();
    } finally {
      setSubmitting(false);
    }
  };

  const lineColumns: ColumnsType<RetailTransferLine> = [
    {
      title: t('retail.transfer.item', 'Item'),
      dataIndex: 'item_name',
      width: 220,
      render: (value: string, record) => value || record.item_code || record.item_id,
    },
    {
      title: t('retail.transfer.batch', 'Batch'),
      dataIndex: 'batch_code',
      width: 130,
    },
    {
      title: t('retail.transfer.quantity', 'Quantity'),
      dataIndex: 'quantity',
      align: 'right',
      width: 110,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.transfer.unitCost', 'Unit cost'),
      dataIndex: 'unit_cost',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.transfer.lineCost', 'Line cost'),
      dataIndex: 'line_cost',
      align: 'right',
      width: 130,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.transfer.remainingSource', 'Source left'),
      dataIndex: 'from_quantity',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
    {
      title: t('retail.transfer.targetQuantity', 'Target qty'),
      dataIndex: 'to_quantity',
      align: 'right',
      width: 120,
      render: (value: number) => money(value),
    },
  ];

  const columns: ProColumns<RetailTransfer>[] = [
    {
      title: t('retail.transfer.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('retail.transfer.transferNo', 'Transfer no.'),
      dataIndex: 'transfer_no',
      width: 150,
      fixed: 'left',
    },
    {
      title: t('retail.transfer.date', 'Date'),
      dataIndex: 'transferred_at',
      valueType: 'date',
      search: false,
      width: 130,
      render: (_, record) => record.transferred_at?.slice(0, 10) || '-',
    },
    {
      title: t('retail.transfer.fromSite', 'From site'),
      dataIndex: 'from_storage_site_id',
      width: 170,
      render: (_, record) => record.from_storage_site?.label || record.from_storage_site_id,
    },
    {
      title: t('retail.transfer.toSite', 'To site'),
      dataIndex: 'to_storage_site_id',
      width: 170,
      render: (_, record) => record.to_storage_site?.label || record.to_storage_site_id,
    },
    {
      title: t('retail.transfer.fromBranch', 'From branch'),
      dataIndex: 'from_branch_id',
      width: 160,
      render: (_, record) => record.from_branch_id || '-',
    },
    {
      title: t('retail.transfer.toBranch', 'To branch'),
      dataIndex: 'to_branch_id',
      width: 160,
      render: (_, record) => record.to_branch_id || '-',
    },
    {
      title: t('retail.transfer.branchRef', 'Branch ref'),
      dataIndex: 'branch_ref',
      width: 130,
      render: (_, record) => record.branch_ref || '-',
    },
    {
      title: t('retail.transfer.quantity', 'Quantity'),
      dataIndex: 'total_quantity',
      search: false,
      align: 'right',
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.transfer.totalCost', 'Total cost'),
      dataIndex: 'total_cost',
      search: false,
      align: 'right',
      width: 130,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.transfer.status', 'Status'),
      dataIndex: 'status',
      valueType: 'select',
      width: 110,
      valueEnum: {
        posted: { text: t('retail.transfer.posted', 'Posted') },
        voided: { text: t('retail.transfer.voided', 'Voided') },
      },
      render: (_, record) => (
        <Tag color={record.status === 'voided' ? 'default' : 'green'}>
          {record.status || 'posted'}
        </Tag>
      ),
    },
    {
      title: t('retail.transfer.note', 'Note'),
      dataIndex: 'note',
      search: false,
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<RetailTransfer>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const pageSize = params.pageSize || 20;
          const current = params.current || 1;
          const resp = await listRetailTransfers({
            ...params,
            page_size: pageSize,
            page_offset: (current - 1) * pageSize,
          });
          const rows = resp.items || [];
          setTotalQuantity(rows.reduce((sum, row) => sum + (row.total_quantity || 0), 0));
          setTotalCost(rows.reduce((sum, row) => sum + (row.total_cost || 0), 0));
          return {
            data: rows,
            total: resp.filter_size || resp.total_size || rows.length,
            success: true,
          };
        }}
        search={{ labelWidth: 110 }}
        scroll={{ x: 1500 }}
        expandable={{
          expandedRowRender: (record) => (
            <Table<RetailTransferLine>
              rowKey="id"
              size="small"
              columns={lineColumns}
              dataSource={record.lines || []}
              pagination={false}
              scroll={{ x: 940 }}
            />
          ),
          rowExpandable: (record) => !!record.lines?.length,
        }}
        toolBarRender={() => [
          <Statistic
            key="qty"
            title={t('retail.transfer.loadedQuantity', 'Loaded qty')}
            value={totalQuantity}
            precision={2}
          />,
          <Statistic
            key="cost"
            title={t('retail.transfer.loadedCost', 'Loaded cost')}
            value={totalCost}
            precision={2}
          />,
          <Button key="reload-lookups" icon={<ReloadOutlined />} onClick={reloadLookups}>
            {t('retail.transfer.reloadStock', 'Reload stock')}
          </Button>,
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openNew}>
            {t('retail.transfer.newTransfer', 'New transfer')}
          </Button>,
        ]}
      />

      <Modal
        title={
          <Space>
            <SwapOutlined />
            <span>{t('retail.transfer.newTransfer', 'New transfer')}</span>
          </Space>
        }
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={720}
        destroyOnClose
      >
        <Form<TransferFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            name="from_lot_id"
            label={t('retail.transfer.sourceLot', 'Source stock lot')}
            rules={[{ required: true }]}
          >
            <Select showSearch optionFilterProp="label" options={lotOptions} />
          </Form.Item>
          <Form.Item
            name="to_storage_site_id"
            label={t('retail.transfer.toSite', 'To site')}
            rules={[{ required: true }]}
          >
            <Select showSearch optionFilterProp="label" options={siteOptions} />
          </Form.Item>
          <Form.Item name="from_branch_id" label={t('retail.transfer.fromBranch', 'From branch')}>
            <Select allowClear showSearch optionFilterProp="label" options={branchOptions} />
          </Form.Item>
          <Form.Item name="to_branch_id" label={t('retail.transfer.toBranch', 'To branch')}>
            <Select allowClear showSearch optionFilterProp="label" options={branchOptions} />
          </Form.Item>
          <Form.Item
            name="quantity"
            label={t('retail.transfer.quantity', 'Quantity')}
            rules={[{ required: true }]}
          >
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="branch_ref" label={t('retail.transfer.branchRef', 'Branch ref')}>
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item name="note" label={t('retail.transfer.note', 'Note')}>
            <Input.TextArea maxLength={512} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TransferPage;
