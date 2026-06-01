import { DeleteOutlined, PlusOutlined, RollbackOutlined } from '@ant-design/icons';
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
import React, { useMemo, useState } from 'react';
import {
  financeTenderNeedsAccount,
  moneyAccountOptions,
  paymentTypeOptions,
} from '../Finance/tenderAccount';
import { getRetailSale } from '../Sale/service';
import type { RetailSale, RetailSaleLine } from '../Sale/types';
import type { RetailSaleReturnRequest, SaleLineByID, SaleReturnLookupState } from './types';

type SaleReturnEditorProps = {
  open: boolean;
  lookups: SaleReturnLookupState;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: RetailSaleReturnRequest) => Promise<void>;
};

const defaultReturn = (): RetailSaleReturnRequest => ({
  lines: [{ quantity: 1 }],
  tenders: [{ tender_kind: 'cash', amount: 0 }],
});

const SaleReturnEditor: React.FC<SaleReturnEditorProps> = ({
  open,
  lookups,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm<RetailSaleReturnRequest>();
  const [selectedSale, setSelectedSale] = useState<RetailSale>();
  const [loadingSale, setLoadingSale] = useState(false);
  const lines = Form.useWatch('lines', form) || [];
  const tenders = Form.useWatch('tenders', form) || [];

  const lineByID = useMemo<SaleLineByID>(() => {
    const map: SaleLineByID = {};
    ((selectedSale?.lines || []) as RetailSaleLine[]).forEach((line) => {
      map[line.id] = line;
    });
    return map;
  }, [selectedSale]);

  const totals = useMemo(() => {
    const gross = (lines || []).reduce((sum, line) => {
      const source = line?.line_id ? lineByID[line.line_id] : undefined;
      return sum + Number(line?.quantity || 0) * Number(source?.unit_price || 0);
    }, 0);
    const paid = (tenders || []).reduce((sum, tender) => {
      if (tender?.tender_kind === 'cheque') {
        return sum;
      }
      return sum + Number(tender?.amount || 0);
    }, 0);
    return { gross, paid: Math.min(paid, gross), credit: Math.max(gross - paid, 0) };
  }, [lineByID, lines, tenders]);

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue(defaultReturn());
    } else {
      form.resetFields();
      setSelectedSale(undefined);
    }
  }, [form, open]);

  const saleOptions = lookups.sales.map((sale) => ({
    label: `${sale.receipt_no}${
      sale.partner?.display_name ? ` · ${sale.partner.display_name}` : ''
    }`,
    value: sale.id,
  }));
  const accountOptions = moneyAccountOptions(lookups.moneyAccounts);
  const tenderTypeOptions = paymentTypeOptions(lookups.paymentTypes);

  const lineOptions = ((selectedSale?.lines || []) as RetailSaleLine[])
    .filter((line) => Number(line.quantity || 0) > 0)
    .map((line) => ({
      label: `${line.item_name} · ${
        line.batch_code || (line.lot_id ? 'open batch' : 'bundle components')
      } · ${line.quantity || 0} sold`,
      value: line.id,
    }));

  const loadSaleDetail = async (id: string) => {
    setLoadingSale(true);
    try {
      const detail = await getRetailSale(id);
      setSelectedSale(detail);
      form.setFieldsValue({
        lines: [{ quantity: 1 }],
        tenders: [{ tender_kind: 'cash', amount: 0 }],
      });
    } finally {
      setLoadingSale(false);
    }
  };

  return (
    <Drawer
      width={1060}
      open={open}
      title="Return sold stock"
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<RollbackOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          Post return
        </Button>
      }
    >
      <Form<RetailSaleReturnRequest>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onSubmit({
            ...values,
            lines: (values.lines || []).filter((line) => line.line_id && line.quantity),
            tenders: (values.tenders || []).filter((tender) => tender.amount),
          });
        }}
      >
        <Divider orientation="left">Original sale</Divider>
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="receipt_id" label="Sale receipt" rules={[{ required: true }]}>
              <Select
                loading={loadingSale}
                showSearch
                optionFilterProp="label"
                options={saleOptions}
                onChange={loadSaleDetail}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item name="returned_at" label="Return date">
              <Input placeholder="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="note" label="Return note">
              <Input maxLength={512} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={12} md={6}>
            <Statistic title="Customer" value={selectedSale?.partner?.display_name || '-'} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Sale due" value={selectedSale?.due_amount || 0} precision={2} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Sale paid" value={selectedSale?.paid_amount || 0} precision={2} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title="Receipt total"
              value={selectedSale?.actual_amount || 0}
              precision={2}
            />
          </Col>
        </Row>

        <Divider orientation="left">Returned stock</Divider>
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              {fields.map((field) => {
                const current = lines?.[field.name]?.line_id
                  ? lineByID[lines[field.name].line_id!]
                  : undefined;
                return (
                  <Row gutter={8} key={field.key} align="middle">
                    <Col xs={24} md={10}>
                      <Form.Item
                        name={[field.name, 'line_id']}
                        label="Sale line"
                        rules={[{ required: true }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="label"
                          options={lineOptions}
                          disabled={!selectedSale}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Form.Item name={[field.name, 'quantity']} label="Return qty">
                        <InputNumber
                          min={0.001}
                          max={current?.quantity}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={8} md={3}>
                      <Statistic
                        title="Unit price"
                        value={current?.unit_price || 0}
                        precision={2}
                      />
                    </Col>
                    <Col xs={8} md={3}>
                      <Statistic
                        title="Refund value"
                        value={
                          Number(lines?.[field.name]?.quantity || 0) *
                          Number(current?.unit_price || 0)
                        }
                        precision={2}
                      />
                    </Col>
                    <Col xs={24} md={4}>
                      <Statistic
                        title="Remaining sold"
                        value={current?.quantity || 0}
                        precision={2}
                      />
                    </Col>
                    <Col xs={24} md={1}>
                      <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                    </Col>
                  </Row>
                );
              })}
              <Button
                icon={<PlusOutlined />}
                disabled={!selectedSale}
                onClick={() => add({ quantity: 1 })}
              >
                Add return line
              </Button>
            </Space>
          )}
        </Form.List>

        <Divider orientation="left">Refund settlement</Divider>
        <Row gutter={12}>
          <Col xs={12} md={6}>
            <Statistic title="Return value" value={totals.gross} precision={2} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Refund paid" value={totals.paid} precision={2} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="Customer credit" value={totals.credit} precision={2} />
          </Col>
        </Row>
        <Form.List name="tenders">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size={10}>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="middle">
                  <Col xs={24} md={5}>
                    <Form.Item name={[field.name, 'tender_kind']} label="Refund method">
                      <Select
                        options={[
                          { label: 'Cash', value: 'cash' },
                          { label: 'Cheque', value: 'cheque' },
                          { label: 'Bank', value: 'bank' },
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
                  <Col xs={12} md={6}>
                    <Form.Item name={[field.name, 'reference_no']} label="Reference">
                      <Input maxLength={128} />
                    </Form.Item>
                  </Col>
                  <Col xs={18} md={6}>
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
                Add refund
              </Button>
            </Space>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export default SaleReturnEditor;
