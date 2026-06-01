import { DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Space,
} from 'antd';
import React, { useEffect } from 'react';
import { financeTenderNeedsAccount, moneyAccountOptions } from '../tenderAccount';
import type {
  CashflowKind,
  CashflowReason,
  CashflowRecordRequest,
  CashflowTenderRequest,
  MoneyAccount,
} from '../types';

type IncomeExpenseEditorProps = {
  open: boolean;
  accounts: MoneyAccount[];
  reasons: CashflowReason[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CashflowRecordRequest) => Promise<void>;
};

type IncomeExpenseFormValues = CashflowRecordRequest & {
  recorded_at?: any;
  tenders?: CashflowTenderRequest[];
};

const formatDate = (value: any) => {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value.format === 'function') {
    return value.format('YYYY-MM-DD');
  }
  return undefined;
};

const tenderOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank', value: 'bank' },
  { label: 'SSLCommerz', value: 'sslcommerz' },
  { label: 'Cheque', value: 'cheque' },
];

const IncomeExpenseEditor: React.FC<IncomeExpenseEditorProps> = ({
  open,
  accounts,
  reasons,
  submitting,
  onClose,
  onSubmit,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<IncomeExpenseFormValues>();
  const kind = Form.useWatch('record_kind', form) as CashflowKind | undefined;
  const tenders = Form.useWatch('tenders', form) || [];
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        record_kind: 'income',
        tenders: [{ tender_kind: 'cash', amount: 0 }],
      });
    } else {
      form.resetFields();
    }
  }, [form, open]);

  const reasonOptions = reasons
    .filter((reason) => reason.reason_kind === (kind || 'income'))
    .map((reason) => ({
      label: reason.reason_name,
      value: reason.id,
    }));
  const accountOptions = moneyAccountOptions(accounts);

  return (
    <Drawer
      width={920}
      open={open}
      title={t('product.finance.newIncomeExpense', 'New income or expense')}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          {t('product.finance.saveRecord', 'Save record')}
        </Button>
      }
    >
      <Form<IncomeExpenseFormValues>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onSubmit({
            ...values,
            recorded_at: formatDate(values.recorded_at),
            tenders: (values.tenders || []).map((tender) => ({
              ...tender,
              payment_account_id: financeTenderNeedsAccount(tender.tender_kind)
                ? tender.payment_account_id
                : undefined,
            })),
          });
        }}
      >
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item
              name="record_kind"
              label={t('product.finance.recordKind', 'Type')}
              rules={[{ required: true }]}
            >
              <Segmented
                block
                options={[
                  { label: t('product.finance.income', 'Income'), value: 'income' },
                  { label: t('product.finance.expense', 'Expense'), value: 'expense' },
                ]}
                onChange={() => {
                  form.setFieldsValue({ reason_id: undefined });
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="reason_id"
              label={t('product.finance.reason', 'Reason')}
              rules={[{ required: true }]}
            >
              <Select showSearch optionFilterProp="label" options={reasonOptions} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="recorded_at" label={t('product.finance.date', 'Date')}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item name="title" label={t('product.finance.title', 'Title')}>
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="reference_no"
              label={t('product.finance.referenceNo', 'Reference no.')}
            >
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="branch_ref" label={t('product.finance.branchRef', 'Branch ref')}>
              <Input maxLength={128} />
            </Form.Item>
          </Col>
        </Row>

        <Form.List name="tenders">
          {(fields, { add, remove }) => (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {fields.map((field) => {
                const tender = tenders?.[field.name] || {};
                const needsAccount = financeTenderNeedsAccount(tender.tender_kind);
                const isCheque = tender.tender_kind === 'cheque';
                return (
                  <Row key={field.key} gutter={12} align="bottom">
                    <Col xs={24} md={5}>
                      <Form.Item
                        name={[field.name, 'tender_kind']}
                        label={t('product.finance.tenderKind', 'Tender')}
                        rules={[{ required: true }]}
                      >
                        <Select
                          options={tenderOptions}
                          onChange={(value) => {
                            if (!financeTenderNeedsAccount(value)) {
                              const next = [...(form.getFieldValue('tenders') || [])];
                              next[field.name] = {
                                ...next[field.name],
                                payment_account_id: undefined,
                              };
                              form.setFieldsValue({ tenders: next });
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={5}>
                      <Form.Item
                        name={[field.name, 'amount']}
                        label={t('product.finance.amount', 'Amount')}
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={0.01} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    {needsAccount && (
                      <Col xs={24} md={6}>
                        <Form.Item
                          name={[field.name, 'payment_account_id']}
                          label={t('product.finance.paymentAccount', 'Payment account')}
                          rules={[{ required: true }]}
                        >
                          <Select showSearch optionFilterProp="label" options={accountOptions} />
                        </Form.Item>
                      </Col>
                    )}
                    {isCheque && (
                      <Col xs={24} md={5}>
                        <Form.Item
                          name={[field.name, 'cheque_number']}
                          label={t('product.finance.chequeNo', 'Cheque no.')}
                        >
                          <Input maxLength={128} />
                        </Form.Item>
                      </Col>
                    )}
                    <Col xs={24} md={needsAccount || isCheque ? 3 : 6}>
                      <Button
                        block
                        danger
                        icon={<DeleteOutlined />}
                        disabled={fields.length === 1}
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  </Row>
                );
              })}
              <Button
                icon={<PlusOutlined />}
                onClick={() => add({ tender_kind: 'cash', amount: 0 })}
              >
                {t('product.finance.addTender', 'Add tender')}
              </Button>
            </Space>
          )}
        </Form.List>

        <Row gutter={12} style={{ marginTop: 24 }}>
          <Col xs={24} md={8}>
            <Form.Item name="image_ref" label={t('product.finance.imageRef', 'Image ref')}>
              <Input maxLength={512} />
            </Form.Item>
          </Col>
          <Col xs={24} md={16}>
            <Form.Item name="note" label={t('product.finance.note', 'Note')}>
              <Input.TextArea rows={3} maxLength={512} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default IncomeExpenseEditor;
