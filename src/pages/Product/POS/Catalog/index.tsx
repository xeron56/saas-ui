import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Button, message, Modal, Popconfirm, Space, Statistic, Tag, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';
import React, { useEffect, useRef, useState } from 'react';
import { listRetailAddonGroups } from '../AddonGroup/service';
import CatalogEditor from './CatalogEditor';
import {
  createCatalogItem,
  deleteCatalogItem,
  getCatalogItem,
  getCatalogLookups,
  getNextCatalogCode,
  importCatalogItems,
  listCatalogItems,
  listCatalogStock,
  updateCatalogItem,
} from './service';
import type {
  CatalogAddonGroup,
  CatalogItem,
  CatalogItemKind,
  CatalogItemRequest,
  CatalogLookupReply,
  CatalogStockLot,
} from './types';

const kindColor: Record<CatalogItemKind, string> = {
  single: 'blue',
  variant: 'purple',
  bundle: 'geekblue',
};

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const readCatalogKindFilter = (search: string): CatalogItemKind | undefined => {
  const value = new URLSearchParams(search).get('item_kind');
  return value === 'single' || value === 'variant' || value === 'bundle' ? value : undefined;
};

const CatalogPage: React.FC = () => {
  const location = useLocation();
  const actionRef = useRef<ActionType>();
  const initialItemKind = readCatalogKindFilter(location.search);
  const [lookups, setLookups] = useState<CatalogLookupReply>();
  const [addonGroups, setAddonGroups] = useState<CatalogAddonGroup[]>([]);
  const [stockLots, setStockLots] = useState<CatalogStockLot[]>([]);
  const [editing, setEditing] = useState<CatalogItem>();
  const [draft, setDraft] = useState<Partial<CatalogItemRequest>>();
  const [editorOpen, setEditorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [stockValue, setStockValue] = useState(0);

  const reloadLookups = async () => {
    const [lookupResp, stockResp, addonGroupResp] = await Promise.all([
      getCatalogLookups(),
      listCatalogStock({ page_offset: 0, page_size: 200, active: true }),
      listRetailAddonGroups({ page_offset: 0, page_size: 200, active: true }),
    ]);
    setLookups(lookupResp);
    setStockLots(stockResp.items || []);
    setAddonGroups(addonGroupResp.items || addonGroupResp.data || []);
  };

  useEffect(() => {
    reloadLookups();
  }, []);

  const openNew = async () => {
    const code = await getNextCatalogCode();
    setEditing(undefined);
    setDraft({
      item_code: code.item_code,
      item_kind: 'single',
      tax_mode: 'exclusive',
      active: true,
      lots: [{ quantity: 0, active: true }],
    });
    setEditorOpen(true);
  };

  const openEdit = async (record: CatalogItem) => {
    const detail = await getCatalogItem(record.id);
    setEditing(detail);
    setDraft(undefined);
    setEditorOpen(true);
  };

  const handleSubmit = async (values: CatalogItemRequest) => {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateCatalogItem(editing.id, values);
        message.success('Catalog item updated');
      } else {
        await createCatalogItem(values);
        message.success('Catalog item created');
      }
      setEditorOpen(false);
      setEditing(undefined);
      setDraft(undefined);
      actionRef.current?.reload();
      void reloadLookups();
    } finally {
      setSubmitting(false);
    }
  };

  const handleImport = async (file: RcFile) => {
    setImporting(true);
    try {
      const resp = await importCatalogItems(file);
      const created = resp.created_count || 0;
      const skipped = resp.skipped_count || 0;
      message.success(`Imported ${created} item${created === 1 ? '' : 's'}.`);
      if (skipped || resp.errors?.length) {
        Modal.info({
          title: 'Import completed with skipped rows',
          width: 640,
          content: (
            <Space direction="vertical" size={8}>
              <span>
                {skipped} row{skipped === 1 ? '' : 's'} skipped from {resp.rows || 0} parsed rows.
              </span>
              {(resp.errors || []).slice(0, 8).map((item) => (
                <span key={`${item.row}-${item.code}`}>
                  Row {item.row}: {item.message || item.code}
                </span>
              ))}
            </Space>
          ),
        });
      }
      actionRef.current?.reload();
      void reloadLookups();
    } finally {
      setImporting(false);
    }
  };

  const columns: ProColumns<CatalogItem>[] = [
    {
      title: 'Search',
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: 'Type',
      dataIndex: 'item_kind',
      valueEnum: {
        single: { text: 'Single' },
        variant: { text: 'Variant' },
        bundle: { text: 'Bundle' },
      },
      render: (_, record) => {
        const kind = (record.item_kind || 'single') as CatalogItemKind;
        return <Tag color={kindColor[kind]}>{kind.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Name',
      dataIndex: 'display_name',
      render: (_, record) => <a onClick={() => openEdit(record)}>{record.display_name}</a>,
    },
    {
      title: 'Role',
      dataIndex: 'is_addon_product',
      search: false,
      width: 120,
      render: (_, record) =>
        record.is_addon_product ? (
          <Tag color="cyan">ADD-ON</Tag>
        ) : record.customizable ? (
          <Tag color="gold">CUSTOM</Tag>
        ) : (
          '-'
        ),
    },
    {
      title: 'Code',
      dataIndex: 'item_code',
      search: false,
      width: 120,
    },
    {
      title: 'Brand',
      dataIndex: ['brand', 'label'],
      search: false,
      width: 140,
    },
    {
      title: 'Group',
      dataIndex: ['group', 'label'],
      search: false,
      width: 140,
    },
    {
      title: 'Stock',
      dataIndex: 'available_stock',
      search: false,
      width: 120,
      render: (_, record) => (
        <Space>
          <span>{money(record.available_stock)}</span>
          {record.low_stock && <Tag color="red">LOW</Tag>}
        </Space>
      ),
    },
    {
      title: 'Sale',
      dataIndex: 'sale_price',
      search: false,
      width: 110,
      renderText: (value) => money(value),
    },
    {
      title: 'Value',
      dataIndex: 'stock_value',
      search: false,
      width: 120,
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
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => openEdit(record)} />,
        <Popconfirm
          key="delete"
          title="Delete catalog item?"
          onConfirm={async () => {
            await deleteCatalogItem(record.id);
            message.success('Catalog item deleted');
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
      <ProTable<CatalogItem>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        params={{ report_item_kind: initialItemKind }}
        form={{ initialValues: initialItemKind ? { item_kind: initialItemKind } : undefined }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const itemKind = (params.item_kind as CatalogItemKind | undefined) || initialItemKind;
          const resp = await listCatalogItems({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            item_kind: itemKind,
            active: params.active,
          });
          setStockValue(resp.total_stock_value || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size || resp.total_size || 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Statistic key="stock-value" title="Stock value" value={stockValue} precision={2} />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
          <Upload
            key="import"
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={(file) => {
              void handleImport(file);
              return Upload.LIST_IGNORE;
            }}
          >
            <Button icon={<UploadOutlined />} loading={importing}>
              Import
            </Button>
          </Upload>,
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={openNew}>
            New item
          </Button>,
        ]}
      />
      <CatalogEditor
        open={editorOpen}
        item={editing}
        initialValues={draft}
        lookups={lookups}
        addonGroups={addonGroups}
        stockLots={stockLots}
        submitting={submitting}
        onClose={() => {
          setEditorOpen(false);
          setEditing(undefined);
          setDraft(undefined);
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
};

export default CatalogPage;
