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
import type { LookupState, LotOption, RetailSale, RetailSaleRequest } from './types';

type SaleEditorProps = {
  open: boolean;
  item?: RetailSale;
  lookups: LookupState;
  lotOptions?: LotOption[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: RetailSaleRequest) => Promise<void>;
};

const defaultSale = (): RetailSaleRequest => ({
  discount_mode: 'flat',
  rounding_mode: 'none',
  lines: [{ quantity: 1, discount_amount: 0 }],
  tenders: [{ tender_kind: 'cash', amount: 0 }],
});

const branchLabel = (branch: LookupState['branches'][number]) =>
  branch.label || branch.name || branch.code || branch.id;

const normalizeForForm = (item?: RetailSale): RetailSaleRequest => {
  if (!item) {
    return defaultSale();
  }
  return {
    partner_id: item.partner_id,
    branch_ref: item.branch_ref,
    sold_at: item.sold_at,
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
      quantity: line.quantity,
      unit_price: line.unit_price,
      discount_amount: line.discount_amount,
    })) || [{ quantity: 1, discount_amount: 0 }],
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

const SaleEditor: React.FC<SaleEditorProps> = ({
  open,
  item,
  lookups,
  lotOptions,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<RetailSaleRequest>();
  const lines = Form.useWatch('lines', form) || [];
  const tenders = Form.useWatch('tenders', form) || [];
  const discountAmount = Form.useWatch('discount_amount', form) || 0;
  const shippingAmount = Form.useWatch('shipping_amount', form) || 0;
  const taxAmount = Form.useWatch('tax_amount', form) || 0;
  const roundingAmount = Form.useWatch('rounding_amount', form) || 0;

  const totals = useMemo(() => {
    const subtotal = (lines || []).reduce((sum, line) => {
      const qty = Number(line?.quantity || 0);
      const price = Number(line?.unit_price || 0);
      const discount = Number(line?.discount_amount || 0);
      return sum + Math.max(qty * price - discount, 0);
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

  const partnerOptions = lookups.partners.map((partner) => ({
    label: `${partner.display_name}${partner.phone ? ` · ${partner.phone}` : ''}`,
    value: partner.id,
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
      width={1100}
      open={open}
      title={item?.id ? `Edit sale ${item.receipt_no || ''}` : 'New retail sale'}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          {item?.id ? 'Update sale' : 'Post sale'}
        </Button>
      }
    >
      <Form<RetailSaleRequest>
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
          <Col xs={24} md={8}>
            <Form.Item name="partner_id" label="Customer">
              <Select allowClear showSearch optionFilterProp="label" options={partnerOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={5}>
            <Form.Item name="sold_at" label="Sale date">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} md={5}>
            <Form.Item name="branch_ref" label="Branch">
              <Select allowClear showSearch optionFilterProp="label" options={branchOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="note" label="Note">
              <Input maxLength={512} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Items</Divider>
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="middle">
                  <Col xs={24} md={9}>
                    <Form.Item
                      name={[field.name, 'lot_id']}
                      label="Stock lot"
                      rules={[{ required: true }]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="label"
                        options={stockLotOptions}
                        onChange={(value) => {
                          const selected = stockLotOptions.find((option) => option.value === value);
                          form.setFieldValue(['lines', field.name, 'item_id'], selected?.item_id);
                          form.setFieldValue(
                            ['lines', field.name, 'unit_price'],
                            selected?.sale_price || 0,
                          );
                        }}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'item_id']} hidden>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={8} md={3}>
                    <Form.Item name={[field.name, 'quantity']} label="Qty">
                      <InputNumber min={0.001} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={8} md={3}>
                    <Form.Item name={[field.name, 'unit_price']} label="Price">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={8} md={3}>
                    <Form.Item name={[field.name, 'discount_amount']} label="Discount">
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col xs={18} md={4}>
                    <Statistic
                      title="Line total"
                      value={Math.max(
                        Number(lines?.[field.name]?.quantity || 0) *
                          Number(lines?.[field.name]?.unit_price || 0) -
                          Number(lines?.[field.name]?.discount_amount || 0),
                        0,
                      )}
                      precision={2}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ quantity: 1 })}>
                Add item
              </Button>
            </Space>
          )}
        </Form.List>

        <Divider orientation="left">Totals</Divider>
        <Row gutter={12}>
          <Col xs={12} md={4}>
            <Form.Item name="discount_amount" label="Order discount">
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

        <Divider orientation="left">Tenders</Divider>
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
                Add tender
              </Button>
            </Space>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export default SaleEditor;
