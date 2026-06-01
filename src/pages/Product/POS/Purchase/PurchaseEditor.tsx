import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
} from 'antd';
import React, { useMemo } from 'react';
import {
  financeTenderNeedsAccount,
  moneyAccountOptions,
  paymentTypeOptions,
} from '../Finance/tenderAccount';
import type {
  PurchaseLookupState,
  PurchaseLotOption,
  RetailPurchase,
  RetailPurchaseRequest,
} from './types';

type PurchaseEditorProps = {
  open: boolean;
  item?: RetailPurchase;
  lookups: PurchaseLookupState;
  lotOptions?: PurchaseLotOption[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: RetailPurchaseRequest) => Promise<void>;
};

const defaultPurchase = (): RetailPurchaseRequest => ({
  discount_mode: 'flat',
  rounding_mode: 'none',
  lines: [{ quantity: 1 }],
  tenders: [{ tender_kind: 'cash', amount: 0 }],
});

const branchLabel = (branch: PurchaseLookupState['branches'][number]) =>
  branch.label || branch.name || branch.code || branch.id;

const normalizeForForm = (item?: RetailPurchase): RetailPurchaseRequest => {
  if (!item) {
    return defaultPurchase();
  }
  return {
    supplier_id: item.supplier_id,
    supplier_invoice_no: item.supplier_invoice_no,
    branch_ref: item.branch_ref,
    purchased_at: item.purchased_at,
    discount_amount: item.discount_amount,
    discount_percent: item.discount_percent,
    discount_mode: item.discount_mode || 'flat',
    shipping_amount: item.shipping_amount,
    tax_amount: item.tax_amount,
    tax_percent: item.tax_percent,
    rounding_amount: item.rounding_amount,
    rounding_mode: item.rounding_mode || 'none',
    image_ref: item.image_ref,
    note: item.note,
    meta: item.meta,
    lines: item.lines?.map((line) => ({
      item_id: line.item_id,
      lot_id: line.lot_id,
      storage_site_id: line.storage_site_id,
      batch_code: line.batch_code,
      variant_name: line.variant_name,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
      purchase_cost: line.purchase_cost,
      sale_price: line.sale_price,
      wholesale_price: line.wholesale_price,
      dealer_price: line.dealer_price,
      profit_percent: line.profit_percent,
      mfg_date: line.mfg_date,
      expire_date: line.expire_date,
      variation_data: line.variation_data,
      serial_numbers: line.serial_numbers,
    })) || [{ quantity: 1 }],
    tenders: item.tenders?.map((tender) => ({
      tender_kind: tender.tender_kind,
      amount: tender.amount,
      reference_no: tender.reference_no,
      cheque_number: tender.cheque_number,
      payment_type_id: tender.payment_type_id,
      payment_account_id: tender.payment_account_id,
      meta: tender.meta,
    })) || [{ tender_kind: 'cash', amount: 0 }],
  };
};

const PurchaseEditor: React.FC<PurchaseEditorProps> = ({
  open,
  item,
  lookups,
  lotOptions,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<RetailPurchaseRequest>();
  const lines = Form.useWatch('lines', form) || [];
  const tenders = Form.useWatch('tenders', form) || [];
  const discountAmount = Form.useWatch('discount_amount', form) || 0;
  const shippingAmount = Form.useWatch('shipping_amount', form) || 0;
  const taxAmount = Form.useWatch('tax_amount', form) || 0;
  const roundingAmount = Form.useWatch('rounding_amount', form) || 0;

  const totals = useMemo(() => {
    const subtotal = (lines || []).reduce((sum, line) => {
      const qty = Number(line?.quantity || 0);
      const unitCost = Number(line?.unit_cost || line?.purchase_cost || 0);
      return sum + Math.max(qty * unitCost, 0);
    }, 0);
    const total = Math.max(
      subtotal - Number(discountAmount || 0) + Number(shippingAmount || 0) + Number(taxAmount || 0),
      0,
    );
    const actual = Math.max(total + Number(roundingAmount || 0), 0);
    const paid = (tenders || []).reduce((sum, tender) => {
      if (tender?.tender_kind === 'cheque') {
        return sum;
      }
      return sum + Number(tender?.amount || 0);
    }, 0);
    return {
      subtotal,
      actual,
      paid: Math.min(paid, actual),
      due: Math.max(actual - paid, 0),
      change: Math.max(paid - actual, 0),
    };
  }, [discountAmount, lines, roundingAmount, shippingAmount, taxAmount, tenders]);

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue(normalizeForForm(item));
    } else {
      form.resetFields();
    }
  }, [form, item, open]);

  const supplierOptions = lookups.suppliers.map((supplier) => ({
    label: `${supplier.display_name}${supplier.phone ? ` · ${supplier.phone}` : ''}`,
    value: supplier.id,
  }));

  const itemOptions = lookups.items
    .filter((item) => item.item_kind !== 'bundle')
    .map((item) => ({
      label: `${item.display_name}${item.item_code ? ` · ${item.item_code}` : ''}`,
      value: item.id,
    }));
  const accountOptions = moneyAccountOptions(lookups.moneyAccounts);
  const tenderTypeOptions = paymentTypeOptions(lookups.paymentTypes);
  const stockLotOptions = lotOptions || lookups.lotOptions;
  const branchOptions = lookups.branches.map((branch) => ({
    label: branchLabel(branch),
    value: branch.id,
  }));

  return (
    <Drawer
      width={1180}
      open={open}
      title={item?.id ? `Edit purchase ${item.receipt_no || ''}` : 'New retail purchase'}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          {item?.id ? 'Update purchase' : 'Post purchase'}
        </Button>
      }
    >
      <Form<RetailPurchaseRequest>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onSubmit({
            ...values,
            lines: (values.lines || []).filter((line) => line.item_id && line.quantity),
            tenders: (values.tenders || []).filter((tender) => tender.amount),
          });
        }}
      >
        <Row gutter={12}>
          <Col xs={24} md={7}>
            <Form.Item name="supplier_id" label="Supplier" rules={[{ required: true }]}>
              <Select allowClear showSearch optionFilterProp="label" options={supplierOptions} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="supplier_invoice_no" label="Supplier invoice">
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="purchased_at" label="Purchase date">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="branch_ref" label="Branch">
              <Select allowClear showSearch optionFilterProp="label" options={branchOptions} />
            </Form.Item>
          </Col>
          <Col xs={12} md={5}>
            <Form.Item name="note" label="Note">
              <Input maxLength={512} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Stock intake</Divider>
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="middle">
                  <Col xs={24} md={6}>
                    <Form.Item
                      name={[field.name, 'item_id']}
                      label="Item"
                      rules={[{ required: true }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        options={itemOptions}
                        onChange={(value) => {
                          const selected = lookups.items.find((item) => item.id === value);
                          form.setFieldValue(
                            ['lines', field.name, 'unit_cost'],
                            selected?.purchase_cost || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'sale_price'],
                            selected?.sale_price || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'wholesale_price'],
                            selected?.wholesale_price || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'dealer_price'],
                            selected?.dealer_price || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'profit_percent'],
                            selected?.profit_percent || 0,
                          );
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={5}>
                    <Form.Item name={[field.name, 'lot_id']} label="Existing lot">
                      <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        options={stockLotOptions}
                        onChange={(value) => {
                          const selected = stockLotOptions.find((lot) => lot.value === value);
                          if (!selected) {
                            return;
                          }
                          form.setFieldValue(['lines', field.name, 'item_id'], selected.item_id);
                          form.setFieldValue(
                            ['lines', field.name, 'batch_code'],
                            selected.batch_code,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'variant_name'],
                            selected.variant_name,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'unit_cost'],
                            selected.unit_cost || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'sale_price'],
                            selected.sale_price || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'wholesale_price'],
                            selected.wholesale_price || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'dealer_price'],
                            selected.dealer_price || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'profit_percent'],
                            selected.profit_percent || 0,
                          );
                          form.setFieldValue(
                            ['lines', field.name, 'storage_site_id'],
                            selected.storage_site_id,
                          );
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'batch_code']} label="Batch">
                      <Input maxLength={128} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Item name={[field.name, 'variant_name']} label="Variant">
                      <Input maxLength={255} />
                    </Form.Item>
                  </Col>
                  <Col xs={8} md={2}>
                    <Form.Item name={[field.name, 'quantity']} label="Qty">
                      <InputNumber min={0.001} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={8} md={2}>
                    <Form.Item name={[field.name, 'unit_cost']} label="Cost">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={8} md={2}>
                    <Statistic
                      title="Line total"
                      value={Math.max(
                        Number(lines?.[field.name]?.quantity || 0) *
                          Number(lines?.[field.name]?.unit_cost || 0),
                        0,
                      )}
                      precision={2}
                    />
                  </Col>
                  <Col xs={24} md={1}>
                    <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, 'sale_price']} label="Sale price">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, 'wholesale_price']} label="Wholesale">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, 'dealer_price']} label="Dealer">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, 'profit_percent']} label="Profit %">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, 'mfg_date']} label="Mfg date">
                      <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, 'expire_date']} label="Expire date">
                      <Input placeholder="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ quantity: 1 })}>
                Add stock line
              </Button>
            </Space>
          )}
        </Form.List>

        <Divider orientation="left">Totals</Divider>
        <Row gutter={12}>
          <Col xs={12} md={4}>
            <Form.Item name="discount_amount" label="Discount">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="shipping_amount" label="Shipping">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="tax_amount" label="Tax">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="rounding_amount" label="Rounding">
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Statistic title="Total" value={totals.actual} precision={2} />
          </Col>
          <Col xs={12} md={4}>
            <Statistic
              title={totals.change > 0 ? 'Change' : 'Due'}
              value={totals.change || totals.due}
              precision={2}
            />
          </Col>
        </Row>

        <Divider orientation="left">Payments</Divider>
        <Form.List name="tenders">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="middle">
                  <Col xs={24} md={5}>
                    <Form.Item name={[field.name, 'tender_kind']} label="Method">
                      <Select
                        options={[
                          { label: 'Cash', value: 'cash' },
                          { label: 'Wallet', value: 'wallet' },
                          { label: 'Cheque', value: 'cheque' },
                          { label: 'Bank', value: 'bank' },
                          { label: 'Card', value: 'card' },
                          { label: 'SSLCommerz', value: 'sslcommerz' },
                        ]}
                        onChange={(value) => {
                          if (!financeTenderNeedsAccount(value)) {
                            form.setFieldValue(
                              ['tenders', field.name, 'payment_account_id'],
                              undefined,
                            );
                          }
                          if (value === 'cheque') {
                            form.setFieldValue(
                              ['tenders', field.name, 'payment_type_id'],
                              undefined,
                            );
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, 'amount']} label="Amount">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  {tenderTypeOptions.length > 0 &&
                    tenders?.[field.name]?.tender_kind !== 'cheque' && (
                      <Col xs={24} md={5}>
                        <Form.Item name={[field.name, 'payment_type_id']} label="Payment type">
                          <Select
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={tenderTypeOptions}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  {financeTenderNeedsAccount(tenders?.[field.name]?.tender_kind) && (
                    <Col xs={24} md={5}>
                      <Form.Item
                        name={[field.name, 'payment_account_id']}
                        label="Payment account"
                        rules={[{ required: true }]}
                      >
                        <Select showSearch optionFilterProp="label" options={accountOptions} />
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={12} md={5}>
                    <Form.Item name={[field.name, 'reference_no']} label="Reference">
                      <Input maxLength={128} />
                    </Form.Item>
                  </Col>
                  <Col xs={18} md={5}>
                    <Form.Item name={[field.name, 'cheque_number']} label="Cheque no.">
                      <Input maxLength={128} />
                    </Form.Item>
                  </Col>
                  <Col xs={6} md={2}>
                    <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ tender_kind: 'cash' })}>
                Add payment
              </Button>
            </Space>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export default PurchaseEditor;
