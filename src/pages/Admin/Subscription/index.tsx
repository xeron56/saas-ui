import {
  CalendarOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, request, useLocation } from '@umijs/max';
import { Alert, Button, Empty, Form, InputNumber, Select, Space, Spin, Table, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

type LegacyRecord = Record<string, any>;

type SubscriptionPayload = LegacyRecord & {
  packages?: LegacyRecord[];
  currentPackage?: LegacyRecord;
};

type CheckoutPayload = LegacyRecord & {
  product?: LegacyRecord;
  gateways?: LegacyRecord[];
  banks?: LegacyRecord[];
};

type LegacyTableResponse = {
  status?: boolean;
  message?: string;
  data?: LegacyRecord[];
};

function textValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function cleanDisplay(value: unknown) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function gatewayAmountLabel(currency: LegacyRecord | undefined, value: number) {
  const symbol = textValue(currency?.symbol) || textValue(currency?.currency);
  return `${symbol ? `${symbol} ` : ''}${value.toFixed(2)}`;
}

function paymentBody(values: LegacyRecord, slipFile?: File) {
  const fields: LegacyRecord = { ...values };
  delete fields.bank_slip;
  if (!slipFile) {
    return fields;
  }
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    formData.append(key, String(value));
  });
  formData.append('bank_slip', slipFile);
  return formData;
}

function successMessage(search: string) {
  const params = new URLSearchParams(search);
  if (!params.has('success')) {
    return '';
  }
  return (
    textValue(params.get('message')) || (params.get('success') === 'true' ? 'Success' : 'Failed')
  );
}

export default function AdminSubscription() {
  const location = useLocation();
  const [form] = Form.useForm();
  const [packages, setPackages] = useState<LegacyRecord[]>([]);
  const [currentPackage, setCurrentPackage] = useState<LegacyRecord | undefined>();
  const [transactions, setTransactions] = useState<LegacyRecord[]>([]);
  const [checkout, setCheckout] = useState<CheckoutPayload | undefined>();
  const [currencies, setCurrencies] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const mode = location.pathname.includes('/transaction-list')
    ? 'transactions'
    : location.pathname.includes('/checkout')
    ? 'checkout'
    : 'packages';
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const loadPackages = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<SubscriptionPayload>('/admin/subscription');
      setPackages(Array.isArray(body.packages) ? body.packages : []);
      setCurrentPackage(body.currentPackage);
    } catch (err: any) {
      setError(err?.message || 'Unable to load subscriptions.');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const body = await request<LegacyTableResponse>(
        '/admin/subscription/transaction-list?ajax=1',
      );
      setTransactions(Array.isArray(body.data) ? body.data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load subscription transactions.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckout = async () => {
    setLoading(true);
    setError('');
    setNotice(successMessage(location.search));
    try {
      const body = await request<CheckoutPayload>(`/admin/subscription/checkout${location.search}`);
      if (body.status === false) {
        setError(textValue(body.message) || 'Checkout is unavailable.');
        setCheckout(undefined);
        return;
      }
      setCheckout(body);
      const gateway = body.gateways?.[0];
      form.setFieldsValue({
        gateway: textValue(gateway?.slug),
        amount: Number(body.price ?? 0),
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to load checkout.');
      setCheckout(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'transactions') {
      loadTransactions();
    } else if (mode === 'checkout') {
      loadCheckout();
    } else {
      loadPackages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, location.search]);

  const selectedGatewaySlug = Form.useWatch('gateway', form);
  const selectedGateway = useMemo(
    () => checkout?.gateways?.find((gateway) => textValue(gateway.slug) === selectedGatewaySlug),
    [checkout?.gateways, selectedGatewaySlug],
  );

  useEffect(() => {
    const gatewayID = textValue(selectedGateway?.id);
    if (!gatewayID || mode !== 'checkout') {
      setCurrencies([]);
      form.setFieldValue('currency', undefined);
      return;
    }
    request<LegacyTableResponse>(
      `/admin/subscription/get-currency-by-gateway?id=${encodeURIComponent(gatewayID)}`,
    )
      .then((body) => {
        const rows = Array.isArray(body.data) ? body.data : [];
        setCurrencies(rows);
        form.setFieldValue('currency', textValue(rows[0]?.currency) || undefined);
      })
      .catch(() => {
        setCurrencies([]);
        form.setFieldValue('currency', undefined);
      });
  }, [form, mode, selectedGateway?.id]);

  useEffect(() => {
    form.setFieldsValue({ bank_id: undefined, bank_slip: [] });
  }, [form, selectedGatewaySlug]);

  const selectedCurrencyCode = Form.useWatch('currency', form);
  const selectedBankID = Form.useWatch('bank_id', form);
  const selectedCurrency = currencies.find(
    (currency) => textValue(currency.currency) === selectedCurrencyCode,
  );
  const selectedBank = (checkout?.banks || []).find(
    (bank) => textValue(bank.id) === textValue(selectedBankID),
  );
  const isBankGateway = textValue(selectedGateway?.slug) === 'bank';
  const amount = Number(checkout?.price ?? 0);
  const convertedAmount = amount * numberValue(selectedCurrency?.conversion_rate, 1);

  const submitPayment = async (values: LegacyRecord) => {
    if (!checkout) {
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    const product = checkout.product || {};
    const body: LegacyRecord = {
      ...values,
      id: checkout.id || product.id,
      package_id: checkout.id || product.id,
      type: 'subscription',
      subscription_type:
        checkout.subscriptionType ||
        searchParams.get('subscription_type') ||
        searchParams.get('type') ||
        '1',
    };
    const slipFile = values.bank_slip?.[0]?.originFileObj as File | undefined;
    try {
      const response = await request<LegacyRecord>('/admin/subscription/pay', {
        method: 'POST',
        data: paymentBody(body, slipFile),
      });
      if (response.status === false) {
        setError(textValue(response.message) || 'Payment could not be created.');
        return;
      }
      setNotice(textValue(response.message) || 'Payment created.');
      const redirectURL = textValue(response.data?.redirect_url);
      if (redirectURL) {
        history.push(redirectURL.replace('/subscription/', '/admin/subscription/'));
      }
    } catch (err: any) {
      setError(err?.message || 'Payment could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  const packageColumns: ColumnsType<LegacyRecord> = [
    {
      title: 'Package',
      render: (_, record) => cleanDisplay(record.name) || '-',
    },
    {
      title: 'Monthly',
      width: 140,
      render: (_, record) => cleanDisplay(record.monthly_price) || '0.00',
    },
    {
      title: 'Yearly',
      width: 140,
      render: (_, record) => cleanDisplay(record.yearly_price) || '0.00',
    },
    {
      title: 'Action',
      key: 'action',
      width: 230,
      render: (_, record) => {
        const id = textValue(record.id);
        return (
          <Space wrap>
            <Button
              type="primary"
              icon={<CreditCardOutlined />}
              href={`/admin/subscription/checkout?id=${encodeURIComponent(id)}&subscription_type=1`}
            >
              Monthly
            </Button>
            <Button
              icon={<CalendarOutlined />}
              href={`/admin/subscription/checkout?id=${encodeURIComponent(id)}&subscription_type=2`}
            >
              Yearly
            </Button>
          </Space>
        );
      },
    },
  ];

  const transactionColumns: ColumnsType<LegacyRecord> = [
    { title: 'Transaction', dataIndex: 'tnxId' },
    { title: 'User', dataIndex: 'user' },
    { title: 'Amount', dataIndex: 'amount' },
    { title: 'Method', dataIndex: 'payment_method' },
    { title: 'Purpose', dataIndex: 'purpose' },
  ];

  const renderPackages = () => (
    <Spin spinning={loading}>
      {currentPackage ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Current package #${textValue(currentPackage.package_id)}`}
        />
      ) : null}
      {packages.length === 0 && !loading ? <Empty /> : null}
      <Table<LegacyRecord>
        rowKey={(record) => textValue(record.id)}
        dataSource={packages}
        columns={packageColumns}
        pagination={{ pageSize: 10 }}
      />
    </Spin>
  );

  const renderTransactions = () => (
    <Table<LegacyRecord>
      rowKey={(record) => textValue(record.id) || textValue(record.tnxId)}
      loading={loading}
      dataSource={transactions}
      columns={transactionColumns}
      pagination={{ pageSize: 10 }}
    />
  );

  const renderCheckout = () => (
    <Spin spinning={loading}>
      {!checkout && !loading ? <Empty /> : null}
      {checkout ? (
        <Form form={form} layout="vertical" requiredMark={false} onFinish={submitPayment}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={`Payable amount ${amount.toFixed(2)}`}
          />
          <Form.Item name="gateway" label="Gateway" rules={[{ required: true }]}>
            <Select
              options={(checkout.gateways || []).map((gateway) => ({
                label: textValue(gateway.title) || textValue(gateway.slug),
                value: textValue(gateway.slug),
              }))}
            />
          </Form.Item>
          <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
            <Select
              disabled={!currencies.length}
              options={currencies.map((currency) => ({
                label: `${textValue(currency.currency)} - ${gatewayAmountLabel(
                  currency,
                  amount * numberValue(currency.conversion_rate, 1),
                )}`,
                value: textValue(currency.currency),
              }))}
            />
          </Form.Item>
          {selectedCurrency ? (
            <Alert
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
              message={`Payable Amount ${gatewayAmountLabel(selectedCurrency, convertedAmount)}`}
            />
          ) : null}
          {isBankGateway ? (
            <>
              <Form.Item name="bank_id" label="Bank" rules={[{ required: true }]}>
                <Select
                  options={(checkout.banks || []).map((bank) => ({
                    label: textValue(bank.name),
                    value: textValue(bank.id),
                  }))}
                />
              </Form.Item>
              {cleanDisplay(selectedBank?.details) ? (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={cleanDisplay(selectedBank?.details)}
                />
              ) : null}
              <Form.Item
                name="bank_slip"
                label="Attachment"
                valuePropName="fileList"
                getValueFromEvent={normalizeUploadEvent}
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>Choose slip</Button>
                </Upload>
              </Form.Item>
            </>
          ) : null}
          <Form.Item name="amount" hidden>
            <InputNumber />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<CreditCardOutlined />}
          >
            Pay Now
          </Button>
        </Form>
      ) : null}
    </Spin>
  );

  return (
    <PageContainer title="Subscription">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      {notice ? (
        <Alert type="success" message={notice} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={
            mode === 'transactions'
              ? loadTransactions
              : mode === 'checkout'
              ? loadCheckout
              : loadPackages
          }
        >
          Refresh
        </Button>
        <Button icon={<UnorderedListOutlined />} href="/admin/subscription/transaction-list">
          Transactions
        </Button>
        <Button type="primary" icon={<CreditCardOutlined />} href="/admin/subscription">
          Packages
        </Button>
      </div>
      {mode === 'transactions'
        ? renderTransactions()
        : mode === 'checkout'
        ? renderCheckout()
        : renderPackages()}
    </PageContainer>
  );
}
