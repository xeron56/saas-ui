import { DeleteOutlined, DollarOutlined, PlusOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { listRetailOpenDueInvoices } from './service';
import type { DueCollectionMode, RetailDueCollectionRequest, RetailDueInvoice } from './types';
import {
  financeTenderNeedsAccount,
  moneyAccountOptions,
  paymentTypeOptions,
} from '../Finance/tenderAccount';
import type { MoneyAccount, PaymentType } from '../Finance/types';
import type { RetailPartner } from '../Party/types';
import type { RetailTenderRequest } from '../Sale/types';

type DueCollectionFormValues = RetailDueCollectionRequest & {
  mode?: DueCollectionMode;
  invoice_id?: string;
  settled_at?: any;
};

type DueCollectionEditorProps = {
  open: boolean;
  partners: RetailPartner[];
  moneyAccounts: MoneyAccount[];
  paymentTypes: PaymentType[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: RetailDueCollectionRequest) => Promise<void>;
};

const defaultValues = (): DueCollectionFormValues => ({
  mode: 'customer',
  tenders: [{ tender_kind: 'cash', amount: 0 }],
});

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

const sumTenders = (tenders?: RetailTenderRequest[], chequeOnly = false) =>
  (tenders || []).reduce((sum, tender) => {
    const isCheque = tender?.tender_kind === 'cheque';
    if (chequeOnly !== isCheque) {
      return sum;
    }
    return sum + Number(tender?.amount || 0);
  }, 0);

const DueCollectionEditor: React.FC<DueCollectionEditorProps> = ({
  open,
  partners,
  moneyAccounts,
  paymentTypes,
  submitting,
  onClose,
  onSubmit,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<DueCollectionFormValues>();
  const mode = Form.useWatch('mode', form) || 'customer';
  const partnerID = Form.useWatch('partner_id', form);
  const invoiceID = Form.useWatch('invoice_id', form);
  const tenders = Form.useWatch('tenders', form) || [];
  const [invoices, setInvoices] = useState<RetailDueInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  const selectablePartners = useMemo(
    () =>
      partners.filter((partner) =>
        mode === 'supplier' ? partner.kind === 'supplier' : partner.kind !== 'supplier',
      ),
    [mode, partners],
  );

  const selectedPartner = selectablePartners.find((partner) => partner.id === partnerID);
  const selectedInvoice = invoices.find((invoice) => invoice.id === invoiceID);
  const targetDue = Number(selectedInvoice?.due_amount ?? selectedPartner?.due_balance ?? 0);
  const settledTotal = sumTenders(tenders);
  const pendingTotal = sumTenders(tenders, true);
  const remainingDue = Math.max(targetDue - settledTotal, 0);

  const reloadInvoices = async (nextMode: DueCollectionMode, nextPartnerID?: string) => {
    setLoadingInvoices(true);
    try {
      const resp = await listRetailOpenDueInvoices({
        kind: nextMode === 'supplier' ? 'purchase' : nextMode === 'walk_in' ? 'walk_in' : 'sale',
        partner_id: nextMode === 'walk_in' ? undefined : nextPartnerID,
      });
      setInvoices(resp.items || []);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue(defaultValues());
      reloadInvoices('customer');
    } else {
      form.resetFields();
      setInvoices([]);
    }
  }, [form, open]);

  useEffect(() => {
    if (open) {
      form.setFieldValue('invoice_id', undefined);
      reloadInvoices(mode, partnerID);
    }
  }, [mode, partnerID]);

  const partnerOptions = selectablePartners.map((partner) => ({
    label: `${partner.display_name}${partner.phone ? ` · ${partner.phone}` : ''}`,
    value: partner.id,
  }));

  const invoiceOptions = invoices.map((invoice) => ({
    label: `${invoice.invoice_no} · ${invoice.source_caption || invoice.kind} · due ${Number(
      invoice.due_amount || 0,
    ).toFixed(2)}${invoice.partner?.display_name ? ` · ${invoice.partner.display_name}` : ''}`,
    value: invoice.id,
  }));
  const accountOptions = moneyAccountOptions(moneyAccounts);
  const tenderTypeOptions = paymentTypeOptions(paymentTypes);

  return (
    <Drawer
      width={980}
      open={open}
      title={t('product.dueCollection.collect', 'Collect due')}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<DollarOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          {t('product.dueCollection.post', 'Post payment')}
        </Button>
      }
    >
      <Form<DueCollectionFormValues>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          const invoice = invoices.find((item) => item.id === values.invoice_id);
          await onSubmit({
            partner_id: values.mode === 'walk_in' ? undefined : values.partner_id,
            sale_id: invoice?.kind === 'sale' ? invoice.id : undefined,
            purchase_id: invoice?.kind === 'purchase' ? invoice.id : undefined,
            branch_ref: values.branch_ref,
            settled_at: formatDate(values.settled_at),
            note: values.note,
            tenders: (values.tenders || []).filter((tender) => tender.amount),
          });
        }}
      >
        <Form.Item name="mode" label={t('product.dueCollection.mode', 'Settlement type')}>
          <Segmented
            options={[
              { label: t('product.dueCollection.customer', 'Customer'), value: 'customer' },
              { label: t('product.dueCollection.supplier', 'Supplier'), value: 'supplier' },
              { label: t('product.dueCollection.walkIn', 'Walk-in sale'), value: 'walk_in' },
            ]}
            onChange={(value) => {
              form.setFieldsValue({
                mode: value as DueCollectionMode,
                partner_id: undefined,
                invoice_id: undefined,
              });
            }}
          />
        </Form.Item>

        <Divider orientation="left">{t('product.dueCollection.target', 'Due target')}</Divider>
        <Row gutter={12}>
          {mode !== 'walk_in' && (
            <Col xs={24} md={9}>
              <Form.Item
                name="partner_id"
                label={t('product.dueCollection.party', 'Customer or supplier')}
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={partnerOptions}
                  placeholder={t('product.dueCollection.selectParty', 'Select account')}
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={24} md={mode === 'walk_in' ? 12 : 9}>
            <Form.Item
              name="invoice_id"
              label={
                mode === 'walk_in'
                  ? t('product.dueCollection.invoiceRequired', 'Walk-in invoice')
                  : t('product.dueCollection.invoiceOptional', 'Invoice allocation')
              }
              rules={[{ required: mode === 'walk_in' }]}
            >
              <Select
                allowClear={mode !== 'walk_in'}
                loading={loadingInvoices}
                showSearch
                optionFilterProp="label"
                options={invoiceOptions}
                placeholder={t('product.dueCollection.selectInvoice', 'Select due invoice')}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={3}>
            <Form.Item name="settled_at" label={t('product.dueCollection.date', 'Payment date')}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={3}>
            <Form.Item name="branch_ref" label={t('product.dueCollection.branch', 'Branch ref')}>
              <Input maxLength={128} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={12} md={6}>
            <Statistic
              title={t('product.dueCollection.previousDue', 'Previous due')}
              value={targetDue}
              precision={2}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title={t('product.dueCollection.collectedAmount', 'Settled amount')}
              value={settledTotal}
              precision={2}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title={t('product.dueCollection.pendingCheque', 'Pending cheque')}
              value={pendingTotal}
              precision={2}
            />
          </Col>
          <Col xs={12} md={6}>
            <Statistic
              title={t('product.dueCollection.remainingDue', 'Remaining due')}
              value={remainingDue}
              precision={2}
            />
          </Col>
        </Row>

        <Alert
          style={{ marginTop: 16 }}
          type="info"
          showIcon
          message={t(
            'product.dueCollection.chequeNotice',
            'Cheque tenders are saved as pending and do not reduce due until settled outside this workflow.',
          )}
        />

        <Divider orientation="left">
          {t('product.dueCollection.paymentMethod', 'Payment methods')}
        </Divider>
        <Form.List name="tenders">
          {(fields, { add, remove }) => (
            <Space direction="vertical" style={{ width: '100%' }} size={10}>
              {fields.map((field) => (
                <Row gutter={8} key={field.key} align="middle">
                  <Col xs={24} md={5}>
                    <Form.Item
                      name={[field.name, 'tender_kind']}
                      label={t('product.dueCollection.paymentMethod', 'Payment method')}
                    >
                      <Select
                        options={[
                          { label: 'Cash', value: 'cash' },
                          { label: 'Wallet', value: 'wallet' },
                          { label: 'Cheque', value: 'cheque' },
                          { label: 'Bank', value: 'bank' },
                          { label: 'Card', value: 'card' },
                          { label: 'Mobile', value: 'mobile' },
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
                    <Form.Item
                      name={[field.name, 'amount']}
                      label={t('product.dueCollection.amount', 'Amount')}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  {tenderTypeOptions.length > 0 &&
                    tenders?.[field.name]?.tender_kind !== 'cheque' && (
                      <Col xs={24} md={5}>
                        <Form.Item
                          name={[field.name, 'payment_type_id']}
                          label={t('product.report.paymentType', 'Payment type')}
                        >
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
                        label={t('product.finance.paymentAccount', 'Payment account')}
                        rules={[{ required: true }]}
                      >
                        <Select showSearch optionFilterProp="label" options={accountOptions} />
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={12} md={6}>
                    <Form.Item
                      name={[field.name, 'reference_no']}
                      label={t('product.dueCollection.referenceNo', 'Reference no.')}
                    >
                      <Input maxLength={128} />
                    </Form.Item>
                  </Col>
                  <Col xs={18} md={6}>
                    <Form.Item
                      name={[field.name, 'cheque_number']}
                      label={t('product.dueCollection.chequeNo', 'Cheque no.')}
                    >
                      <Input maxLength={128} />
                    </Form.Item>
                  </Col>
                  <Col xs={6} md={2}>
                    <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  </Col>
                </Row>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add({ tender_kind: 'cash' })}>
                {t('product.dueCollection.addPayment', 'Add payment method')}
              </Button>
            </Space>
          )}
        </Form.List>

        <Divider orientation="left">{t('product.dueCollection.note', 'Note')}</Divider>
        <Form.Item name="note">
          <Input.TextArea rows={3} maxLength={512} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default DueCollectionEditor;
