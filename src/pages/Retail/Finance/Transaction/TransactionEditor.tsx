import { SwapOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import {
  Alert,
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
  Statistic,
} from 'antd';
import React, { useEffect } from 'react';
import type { MoneyAccount, MoneyMovementRequest, MoneyMovementType } from '../types';

type TransactionEditorProps = {
  open: boolean;
  accounts: MoneyAccount[];
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: MoneyMovementRequest) => Promise<void>;
};

type TransactionFormValues = MoneyMovementRequest & {
  occurred_at?: any;
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

const TransactionEditor: React.FC<TransactionEditorProps> = ({
  open,
  accounts,
  submitting,
  onClose,
  onSubmit,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<TransactionFormValues>();
  const movementType = Form.useWatch('movement_type', form) as MoneyMovementType | undefined;
  const fromID = Form.useWatch('from_account_id', form);
  const toID = Form.useWatch('to_account_id', form);
  const paymentAccountID = Form.useWatch('payment_account_id', form);
  const amount = Number(Form.useWatch('amount', form) || 0);
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        movement_type: 'bank_to_bank',
        direction: 'transfer',
        amount: 0,
      });
    } else {
      form.resetFields();
    }
  }, [form, open]);

  const accountOptions = accounts.map((account) => ({
    label: `${account.account_name} · ${Number(account.current_balance || 0).toFixed(2)}`,
    value: account.id,
  }));

  const fromAccount = accounts.find((account) => account.id === fromID);
  const toAccount = accounts.find((account) => account.id === toID);
  const paymentAccount = accounts.find((account) => account.id === paymentAccountID);

  const needsFrom = movementType === 'bank_to_bank' || movementType === 'bank_to_cash';
  const needsTo = movementType === 'bank_to_bank' || movementType === 'cash_to_bank';
  const needsPaymentAccount = movementType === 'adjust_bank';
  const needsDirection = movementType === 'adjust_bank' || movementType === 'adjust_cash';

  return (
    <Drawer
      width={900}
      open={open}
      title={t('retail.finance.newMovement', 'New money movement')}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<SwapOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          {t('retail.finance.postMovement', 'Post movement')}
        </Button>
      }
    >
      <Form<TransactionFormValues>
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onSubmit({
            ...values,
            occurred_at: formatDate(values.occurred_at),
          });
        }}
      >
        <Form.Item
          name="movement_type"
          label={t('retail.finance.movementType', 'Movement type')}
          rules={[{ required: true }]}
        >
          <Segmented
            options={[
              { label: t('retail.finance.bankToBank', 'Bank to bank'), value: 'bank_to_bank' },
              { label: t('retail.finance.bankToCash', 'Bank to cash'), value: 'bank_to_cash' },
              { label: t('retail.finance.cashToBank', 'Cash to bank'), value: 'cash_to_bank' },
              { label: t('retail.finance.adjustBank', 'Adjust bank'), value: 'adjust_bank' },
              { label: t('retail.finance.adjustCash', 'Adjust cash'), value: 'adjust_cash' },
            ]}
            onChange={(value) => {
              form.setFieldsValue({
                movement_type: value as MoneyMovementType,
                direction:
                  value === 'adjust_bank' || value === 'adjust_cash' ? 'credit' : 'transfer',
                from_account_id: undefined,
                to_account_id: undefined,
                payment_account_id: undefined,
              });
            }}
          />
        </Form.Item>

        <Row gutter={12}>
          {needsFrom && (
            <Col xs={24} md={8}>
              <Form.Item
                name="from_account_id"
                label={t('retail.finance.fromAccount', 'From account')}
                rules={[{ required: true }]}
              >
                <Select showSearch optionFilterProp="label" options={accountOptions} />
              </Form.Item>
            </Col>
          )}
          {needsTo && (
            <Col xs={24} md={8}>
              <Form.Item
                name="to_account_id"
                label={t('retail.finance.toAccount', 'To account')}
                rules={[{ required: true }]}
              >
                <Select showSearch optionFilterProp="label" options={accountOptions} />
              </Form.Item>
            </Col>
          )}
          {needsPaymentAccount && (
            <Col xs={24} md={8}>
              <Form.Item
                name="payment_account_id"
                label={t('retail.finance.account', 'Account')}
                rules={[{ required: true }]}
              >
                <Select showSearch optionFilterProp="label" options={accountOptions} />
              </Form.Item>
            </Col>
          )}
          {needsDirection && (
            <Col xs={12} md={5}>
              <Form.Item
                name="direction"
                label={t('retail.finance.direction', 'Direction')}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: t('retail.finance.credit', 'Credit'), value: 'credit' },
                    { label: t('retail.finance.debit', 'Debit'), value: 'debit' },
                  ]}
                />
              </Form.Item>
            </Col>
          )}
          <Col xs={12} md={5}>
            <Form.Item
              name="amount"
              label={t('retail.finance.amount', 'Amount')}
              rules={[{ required: true }]}
            >
              <InputNumber min={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={5}>
            <Form.Item name="occurred_at" label={t('retail.finance.date', 'Date')}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Space size={24} wrap>
          <Statistic
            title={t('retail.finance.fromBalance', 'From balance')}
            value={fromAccount?.current_balance || 0}
            precision={2}
          />
          <Statistic
            title={t('retail.finance.toBalance', 'To balance')}
            value={toAccount?.current_balance || 0}
            precision={2}
          />
          <Statistic
            title={t('retail.finance.accountBalance', 'Account balance')}
            value={paymentAccount?.current_balance || 0}
            precision={2}
          />
          <Statistic title={t('retail.finance.amount', 'Amount')} value={amount} precision={2} />
        </Space>

        <Alert
          style={{ marginTop: 16 }}
          type="info"
          showIcon
          message={t(
            'retail.finance.cashNotice',
            'Cash is computed from posted movements; bank balances are stored on the selected payment accounts.',
          )}
        />

        <Row gutter={12} style={{ marginTop: 24 }}>
          <Col xs={24} md={8}>
            <Form.Item name="reference_no" label={t('retail.finance.referenceNo', 'Reference no.')}>
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="reference_kind" label={t('retail.finance.source', 'Source')}>
              <Input maxLength={64} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="image_ref" label={t('retail.finance.imageRef', 'Image ref')}>
              <Input maxLength={512} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="note" label={t('retail.finance.note', 'Note')}>
              <Input.TextArea rows={3} maxLength={512} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default TransactionEditor;
