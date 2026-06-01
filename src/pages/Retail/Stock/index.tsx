import { EditOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl, useLocation } from '@umijs/max';
import { Button, Form, InputNumber, message, Modal, Segmented, Space, Statistic, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { adjustCatalogLot, listCatalogStock } from '../Catalog/service';
import type { CatalogItemKind, CatalogStockLot } from '../Catalog/types';

type StockState = 'all' | 'low' | 'expired';

type AdjustmentForm = {
  delta?: number;
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

const readStockStateFilter = (search: string): StockState => {
  const value = new URLSearchParams(search).get('stock_state');
  return value === 'low' || value === 'expired' ? value : 'all';
};

const StockPage: React.FC = () => {
  const intl = useIntl();
  const location = useLocation();
  const actionRef = useRef<ActionType>();
  const initialStockState = readStockStateFilter(location.search);
  const [state, setState] = useState<StockState>(initialStockState);
  const [quantity, setQuantity] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [adjusting, setAdjusting] = useState<CatalogStockLot>();
  const [form] = Form.useForm<AdjustmentForm>();
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  useEffect(() => {
    actionRef.current?.reload();
  }, [state]);

  useEffect(() => {
    setState(initialStockState);
  }, [initialStockState]);

  const handleAdjust = async (values: AdjustmentForm) => {
    if (!adjusting?.id) {
      return;
    }
    await adjustCatalogLot(adjusting.id, { delta: values.delta || 0 });
    message.success(t('retail.stock.adjusted', 'Stock adjusted'));
    setAdjusting(undefined);
    form.resetFields();
    actionRef.current?.reload();
  };

  const columns: ProColumns<CatalogStockLot>[] = [
    {
      title: t('retail.stock.search', 'Search'),
      dataIndex: 'search',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: t('retail.stock.item', 'Item'),
      dataIndex: 'item_name',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.item_name || record.item_code || record.item_id}</span>
          <span style={{ color: '#8c8c8c' }}>{record.item_code}</span>
        </Space>
      ),
    },
    {
      title: t('retail.stock.type', 'Type'),
      dataIndex: 'item_kind',
      width: 110,
      valueEnum: {
        single: { text: t('retail.stock.single', 'Single') },
        variant: { text: t('retail.stock.variant', 'Variant') },
        bundle: { text: t('retail.stock.bundle', 'Bundle') },
      },
      render: (_, record) => {
        const kind = (record.item_kind || 'single') as CatalogItemKind;
        return <Tag color={kindColor[kind]}>{kind.toUpperCase()}</Tag>;
      },
    },
    {
      title: t('retail.stock.batch', 'Batch'),
      dataIndex: 'batch_code',
      search: false,
      width: 130,
    },
    {
      title: t('retail.stock.variantName', 'Variant'),
      dataIndex: 'variant_name',
      search: false,
      width: 140,
    },
    {
      title: t('retail.stock.site', 'Store'),
      dataIndex: ['storage_site', 'label'],
      search: false,
      width: 150,
    },
    {
      title: t('retail.stock.quantity', 'Lot qty'),
      dataIndex: 'quantity',
      search: false,
      align: 'right',
      width: 110,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.stock.itemQuantity', 'Item qty'),
      dataIndex: 'item_quantity',
      search: false,
      align: 'right',
      width: 110,
      render: (_, record) => (
        <Space>
          <span>{money(record.item_quantity)}</span>
          {record.low_stock && <Tag color="red">{t('retail.stock.low', 'Low')}</Tag>}
        </Space>
      ),
    },
    {
      title: t('retail.stock.purchaseCost', 'Cost'),
      dataIndex: 'purchase_cost',
      search: false,
      align: 'right',
      width: 110,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.stock.salePrice', 'Sale'),
      dataIndex: 'sale_price',
      search: false,
      align: 'right',
      width: 110,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.stock.stockValue', 'Value'),
      dataIndex: 'stock_value',
      search: false,
      align: 'right',
      width: 120,
      renderText: (value) => money(value),
    },
    {
      title: t('retail.stock.expireDate', 'Expiry'),
      dataIndex: 'expire_date',
      valueType: 'date',
      search: false,
      width: 130,
      render: (_, record) => (
        <Space>
          <span>{record.expire_date?.slice(0, 10)}</span>
          {record.expired && <Tag color="volcano">{t('retail.stock.expired', 'Expired')}</Tag>}
        </Space>
      ),
    },
    {
      title: t('retail.stock.active', 'Active'),
      dataIndex: 'active',
      valueType: 'select',
      valueEnum: {
        true: { text: t('retail.stock.active', 'Active') },
        false: { text: t('retail.stock.inactive', 'Inactive') },
      },
      render: (_, record) => (
        <Tag color={record.active === false ? 'default' : 'green'}>
          {record.active === false
            ? t('retail.stock.inactive', 'Inactive')
            : t('retail.stock.active', 'Active')}
        </Tag>
      ),
      width: 110,
    },
    {
      title: t('retail.stock.operate', 'Operate'),
      valueType: 'option',
      width: 110,
      render: (_, record) => [
        <Button
          key="adjust"
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            setAdjusting(record);
            form.setFieldsValue({ delta: 0 });
          }}
        >
          {t('retail.stock.adjust', 'Adjust')}
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<CatalogStockLot>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10 }}
        scroll={{ x: 1280 }}
        request={async (params) => {
          const pageSize = params.pageSize || 10;
          const current = params.current || 1;
          const resp = await listCatalogStock({
            page_offset: (current - 1) * pageSize,
            page_size: pageSize,
            search: params.search,
            item_kind: params.item_kind,
            active: params.active,
            low_stock: state === 'low' ? true : undefined,
            expired: state === 'expired' ? true : undefined,
          });
          setQuantity(resp.total_quantity || 0);
          setStockValue(resp.total_stock_value || 0);
          setLowStockCount(resp.low_stock_count || 0);
          setExpiredCount(resp.expired_count || 0);
          return {
            data: resp.items || [],
            total: resp.filter_size ?? resp.total_size ?? 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <Segmented
            key="state"
            value={state}
            onChange={(value) => setState(value as StockState)}
            options={[
              { label: t('retail.stock.all', 'All stock'), value: 'all' },
              { label: t('retail.stock.lowStock', 'Low stock'), value: 'low' },
              { label: t('retail.stock.expiredStock', 'Expired'), value: 'expired' },
            ]}
          />,
          <Statistic
            key="qty"
            title={t('retail.stock.totalQuantity', 'Total quantity')}
            value={quantity}
            precision={2}
          />,
          <Statistic
            key="value"
            title={t('retail.stock.stockValue', 'Stock value')}
            value={stockValue}
            precision={2}
          />,
          <Statistic
            key="low"
            title={t('retail.stock.lowStock', 'Low stock')}
            value={lowStockCount}
            prefix={<WarningOutlined />}
          />,
          <Statistic
            key="expired"
            title={t('retail.stock.expiredStock', 'Expired')}
            value={expiredCount}
          />,
          <Button
            key="reload"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          />,
        ]}
      />

      <Modal
        open={!!adjusting}
        title={adjusting?.item_name || t('retail.stock.adjust', 'Adjust')}
        onCancel={() => {
          setAdjusting(undefined);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form<AdjustmentForm> form={form} layout="vertical" onFinish={handleAdjust}>
          <Form.Item
            name="delta"
            label={t('retail.stock.adjustDelta', 'Adjustment quantity')}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: '100%' }} precision={2} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StockPage;
