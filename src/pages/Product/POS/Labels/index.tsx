import { PrinterOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Button, InputNumber, Select, Space, Switch, Tag } from 'antd';
import type { CSSProperties, Key } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import { listCatalogItems } from '../Catalog/service';
import type { CatalogItem, CatalogItemKind } from '../Catalog/types';
import './style.less';

const code39Patterns: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw',
  B: 'nnwnnwnnw',
  C: 'wnwnnwnnn',
  D: 'nnnnwwnnw',
  E: 'wnnnwwnnn',
  F: 'nnwnwwnnn',
  G: 'nnnnnwwnw',
  H: 'wnnnnwwnn',
  I: 'nnwnnwwnn',
  J: 'nnnnwwwnn',
  K: 'wnnnnnnww',
  L: 'nnwnnnnww',
  M: 'wnwnnnnwn',
  N: 'nnnnwnnww',
  O: 'wnnnwnnwn',
  P: 'nnwnwnnwn',
  Q: 'nnnnnnwww',
  R: 'wnnnnnwwn',
  S: 'nnwnnnwwn',
  T: 'nnnnwnwwn',
  U: 'wwnnnnnnw',
  V: 'nwwnnnnnw',
  W: 'wwwnnnnnn',
  X: 'nwnnwnnnw',
  Y: 'wwnnwnnnn',
  Z: 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  '.': 'wwnnnnwnn',
  ' ': 'nwwnnnwnn',
  $: 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn',
  '*': 'nwnnwnwnn',
};

const kindColor: Record<CatalogItemKind, string> = {
  single: 'blue',
  variant: 'purple',
  bundle: 'geekblue',
};

const money = (value?: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value || 0);

const barcodeValue = (item: CatalogItem) =>
  (item.barcode || item.item_code || item.id || '').toUpperCase().replace(/[^0-9A-Z .\-$/+%]/g, '');

const BarcodeSvg: React.FC<{ value: string }> = ({ value }) => {
  const safeValue = (value || 'ITEM').slice(0, 48);
  const encoded = `*${safeValue}*`;
  const bars: Array<{ x: number; width: number }> = [];
  let x = 0;

  encoded.split('').forEach((char) => {
    const pattern = code39Patterns[char] || code39Patterns['0'];
    pattern.split('').forEach((part, index) => {
      const width = part === 'w' ? 3 : 1;
      if (index % 2 === 0) {
        bars.push({ x, width });
      }
      x += width;
    });
    x += 1;
  });

  return (
    <svg className="pos-label-barcode" viewBox={`0 0 ${x} 42`} preserveAspectRatio="none">
      {bars.map((bar, index) => (
        <rect key={`${bar.x}-${index}`} x={bar.x} y={0} width={bar.width} height={42} />
      ))}
    </svg>
  );
};

const ProductLabelsPage: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<CatalogItem[]>([]);
  const [labelQuantity, setLabelQuantity] = useState(1);
  const [labelColumns, setLabelColumns] = useState(3);
  const [showPrice, setShowPrice] = useState(true);
  const [showName, setShowName] = useState(true);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const printableLabels = useMemo(
    () =>
      selectedRows.flatMap((item) =>
        Array.from({ length: labelQuantity }, (_, index) => ({
          item,
          key: `${item.id}-${index}`,
        })),
      ),
    [labelQuantity, selectedRows],
  );

  const columns: ProColumns<CatalogItem>[] = [
    {
      title: t('product.label.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('product.label.type', 'Type'),
      dataIndex: 'item_kind',
      valueEnum: {
        single: { text: t('product.label.single', 'Single') },
        variant: { text: t('product.label.variant', 'Variant') },
        bundle: { text: t('product.label.bundle', 'Bundle') },
      },
      render: (_, record) => {
        const kind = (record.item_kind || 'single') as CatalogItemKind;
        return <Tag color={kindColor[kind]}>{kind.toUpperCase()}</Tag>;
      },
    },
    {
      title: t('product.label.name', 'Name'),
      dataIndex: 'display_name',
    },
    {
      title: t('product.label.code', 'Code'),
      dataIndex: 'item_code',
      search: false,
      width: 140,
    },
    {
      title: t('product.label.barcode', 'Barcode'),
      dataIndex: 'barcode',
      search: false,
      width: 160,
    },
    {
      title: t('product.label.salePrice', 'Sale'),
      dataIndex: 'sale_price',
      search: false,
      align: 'right',
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: t('product.label.stock', 'Stock'),
      dataIndex: 'available_stock',
      search: false,
      align: 'right',
      width: 120,
      renderText: (value) => money(value),
    },
  ];

  const sheetStyle = { '--label-columns': String(labelColumns) } as CSSProperties;

  return (
    <PageContainer title={t('product.labels', 'Print Labels')}>
      <ProTable<CatalogItem>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
          },
        }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listCatalogItems({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            item_kind: params.item_kind,
          });
          return {
            data: resp.items || [],
            total: resp.filter_size || resp.total_size || 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Space key="quantity">
            <span>{t('product.label.quantity', 'Qty')}</span>
            <InputNumber
              min={1}
              max={100}
              value={labelQuantity}
              onChange={(value) => setLabelQuantity(value || 1)}
            />
          </Space>,
          <Select
            key="columns"
            value={labelColumns}
            style={{ width: 130 }}
            onChange={setLabelColumns}
            options={[
              { label: t('product.label.columns2', '2 columns'), value: 2 },
              { label: t('product.label.columns3', '3 columns'), value: 3 },
              { label: t('product.label.columns4', '4 columns'), value: 4 },
            ]}
          />,
          <Space key="name">
            <span>{t('product.label.name', 'Name')}</span>
            <Switch checked={showName} onChange={setShowName} />
          </Space>,
          <Space key="price">
            <span>{t('product.label.price', 'Price')}</span>
            <Switch checked={showPrice} onChange={setShowPrice} />
          </Space>,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            disabled={!printableLabels.length}
            onClick={() => window.print()}
          >
            {t('product.label.print', 'Print')}
          </Button>,
        ]}
      />

      <div className="pos-label-print-zone">
        <div className="pos-label-sheet" style={sheetStyle}>
          {printableLabels.map(({ item, key }) => {
            const value = barcodeValue(item);
            return (
              <div className="pos-label-card" key={key}>
                {showName && <div className="pos-label-name">{item.display_name}</div>}
                <BarcodeSvg value={value} />
                <div className="pos-label-code">{value || item.item_code || item.id}</div>
                {showPrice && <div className="pos-label-price">{money(item.sale_price)}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};

export default ProductLabelsPage;
