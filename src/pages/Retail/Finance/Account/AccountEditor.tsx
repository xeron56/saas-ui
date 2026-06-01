import { BankOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Switch } from 'antd';
import React, { useEffect } from 'react';
import type { MoneyAccount, MoneyAccountRequest } from '../types';

type AccountEditorProps = {
  open: boolean;
  account?: MoneyAccount;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: MoneyAccountRequest) => Promise<void>;
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

const AccountEditor: React.FC<AccountEditorProps> = ({
  open,
  account,
  submitting,
  onClose,
  onSubmit,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<MoneyAccountRequest & { opening_date?: any }>();
  const t = (id: string, fallback: string) => intl.formatMessage({ id, defaultMessage: fallback });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        account_name: account?.account_name,
        branch_ref: account?.branch_ref,
        opening_balance: account?.opening_balance || 0,
        show_on_invoice: account?.show_on_invoice ?? true,
        active: account?.active ?? true,
      });
    } else {
      form.resetFields();
    }
  }, [account, form, open]);

  return (
    <Drawer
      width={720}
      open={open}
      title={
        account
          ? t('retail.finance.editAccount', 'Edit payment account')
          : t('retail.finance.newAccount', 'New payment account')
      }
      onClose={onClose}
      destroyOnClose
      extra={
        <Button
          type="primary"
          icon={<BankOutlined />}
          loading={submitting}
          onClick={() => form.submit()}
        >
          {t('retail.finance.saveAccount', 'Save account')}
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          await onSubmit({
            ...values,
            opening_date: formatDate(values.opening_date),
          });
        }}
      >
        <Row gutter={12}>
          <Col xs={24} md={14}>
            <Form.Item
              name="account_name"
              label={t('retail.finance.accountName', 'Account name')}
              rules={[{ required: true }]}
            >
              <Input maxLength={255} />
            </Form.Item>
          </Col>
          <Col xs={24} md={10}>
            <Form.Item name="branch_ref" label={t('retail.finance.branchRef', 'Branch ref')}>
              <Input maxLength={128} />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item
              name="opening_balance"
              label={t('retail.finance.openingBalance', 'Opening balance')}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item name="opening_date" label={t('retail.finance.openingDate', 'Opening date')}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item
              name="show_on_invoice"
              label={t('retail.finance.showOnInvoice', 'Invoice')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={12} md={4}>
            <Form.Item
              name="active"
              label={t('retail.finance.active', 'Active')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default AccountEditor;
