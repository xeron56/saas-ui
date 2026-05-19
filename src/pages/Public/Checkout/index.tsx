import { history, useLocation } from '@umijs/max';
import { Alert, Button, Empty, Form, InputNumber, Select, Spin, Upload } from 'antd';
import { CreditCardOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { contentSummary, contentTitle, normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent, postPublicContent } from '../services';
import type { LegacyRecord } from '../types';

type CheckoutState = LegacyRecord & {
  product?: LegacyRecord;
  gateways?: LegacyRecord[];
  banks?: LegacyRecord[];
};

function normalizeUploadEvent(event: any) {
  if (Array.isArray(event)) {
    return event;
  }
  return event?.fileList || [];
}

function plainText(value: any) {
  return textValue(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function numberValue(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

export default function Checkout() {
  const location = useLocation();
  const [form] = Form.useForm();
  const [payload, setPayload] = useState<CheckoutState>();
  const [currencies, setCurrencies] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const subscription = location.pathname.startsWith('/subscription/');
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const endpoint = `${subscription ? '/subscription/checkout' : '/checkout'}${location.search}`;
    setLoading(true);
    setError('');
    fetchPublicContent(endpoint)
      .then((response) => {
        const body = normalizePayload(response) as CheckoutState;
        if (body.status === false) {
          setError(textValue(body.message) || 'Checkout is unavailable.');
          setPayload(undefined);
          return;
        }
        setPayload(body);
        const gateway = body.gateways?.[0];
        form.setFieldsValue({
          gateway: textValue(gateway?.slug),
          amount: Number(body.price ?? 0),
        });
      })
      .catch((err) => setError(err?.message || 'Unable to load checkout.'))
      .finally(() => setLoading(false));
  }, [form, location.search, subscription]);

  const selectedGatewaySlug = Form.useWatch('gateway', form);
  const selectedGateway = useMemo(
    () => payload?.gateways?.find((gateway) => textValue(gateway.slug) === selectedGatewaySlug),
    [payload?.gateways, selectedGatewaySlug],
  );

  useEffect(() => {
    const gatewayId = textValue(selectedGateway?.id);
    if (!gatewayId) {
      setCurrencies([]);
      form.setFieldValue('currency', undefined);
      return;
    }
    fetchPublicContent(`/get-currency-by-gateway?id=${encodeURIComponent(gatewayId)}`)
      .then((response) => {
        const body = normalizePayload(response);
        const rows = Array.isArray(body.data) ? body.data : [];
        setCurrencies(rows);
        const firstCurrency = textValue(rows[0]?.currency);
        if (firstCurrency) {
          form.setFieldValue('currency', firstCurrency);
        } else {
          form.setFieldValue('currency', undefined);
        }
      })
      .catch(() => {
        setCurrencies([]);
        form.setFieldValue('currency', undefined);
      });
  }, [form, selectedGateway?.id]);

  useEffect(() => {
    form.setFieldsValue({ bank_id: undefined, bank_slip: [] });
  }, [form, selectedGatewaySlug]);

  const product = payload?.product || payload?.membership || payload?.event || {};
  const productName = textValue(payload?.product_name) || contentTitle(product);
  const amount = Number(payload?.price ?? 0);
  const selectedCurrencyCode = Form.useWatch('currency', form);
  const selectedBankID = Form.useWatch('bank_id', form);
  const selectedCurrency = useMemo(
    () => currencies.find((currency) => textValue(currency.currency) === selectedCurrencyCode),
    [currencies, selectedCurrencyCode],
  );
  const selectedBank = useMemo(
    () => (payload?.banks || []).find((bank) => textValue(bank.id) === textValue(selectedBankID)),
    [payload?.banks, selectedBankID],
  );
  const isBankGateway = textValue(selectedGateway?.slug) === 'bank';
  const selectedBankDetails = plainText(selectedBank?.details);
  const convertedAmount = amount * numberValue(selectedCurrency?.conversion_rate, 1);

  const submit = async (values: LegacyRecord) => {
    if (!payload) {
      return;
    }
    setSubmitting(true);
    setError('');
    setNotice('');
    const body: LegacyRecord = {
      ...values,
      id: payload.id || product.id,
      type: payload.type || (subscription ? 'subscription' : searchParams.get('type')),
    };
    if (subscription) {
      body.package_id = payload.id || product.id;
      body.subscription_type =
        payload.subscriptionType ||
        searchParams.get('subscription_type') ||
        searchParams.get('type') ||
        '1';
    }
    const slipFile = values.bank_slip?.[0]?.originFileObj as File | undefined;
    try {
      const response = normalizePayload(
        await postPublicContent(
          subscription ? '/subscription/pay' : '/pay',
          paymentBody(body, slipFile),
        ),
      );
      if (response.status === false) {
        setError(textValue(response.message) || 'Payment could not be created.');
        return;
      }
      setNotice(textValue(response.message) || 'Payment created.');
      const redirectUrl = textValue(response.data?.redirect_url);
      if (redirectUrl && redirectUrl.includes('/checkout/success')) {
        history.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err?.message || 'Payment could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell title="Checkout" description={productName}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      {notice ? (
        <Alert type="success" message={notice} showIcon style={{ marginBottom: 16 }} />
      ) : null}
      <Spin spinning={loading}>
        {!payload && !loading ? <Empty /> : null}
        {payload ? (
          <div className="public-checkout">
            <section className="public-checkout-summary">
              <h2>{productName}</h2>
              {contentSummary(product) ? <p>{contentSummary(product)}</p> : null}
              <div className="public-checkout-total">{amount.toFixed(2)}</div>
              {selectedCurrency ? (
                <div className="public-checkout-converted">
                  <span>Payable Amount</span>
                  <strong>{gatewayAmountLabel(selectedCurrency, convertedAmount)}</strong>
                </div>
              ) : null}
            </section>
            <Form
              className="public-form"
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={submit}
            >
              <Form.Item name="gateway" label="Gateway" rules={[{ required: true }]}>
                <Select
                  options={(payload.gateways || []).map((gateway) => ({
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
              {isBankGateway ? (
                <>
                  <Form.Item name="bank_id" label="Bank" rules={[{ required: true }]}>
                    <Select
                      options={(payload.banks || []).map((bank) => ({
                        label: textValue(bank.name),
                        value: textValue(bank.id),
                      }))}
                    />
                  </Form.Item>
                  {selectedBankDetails ? (
                    <div className="public-bank-detail">
                      <strong>Bank Deposit</strong>
                      <p>{selectedBankDetails}</p>
                    </div>
                  ) : null}
                  <Form.Item
                    name="bank_slip"
                    label="Attachment"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeUploadEvent}
                    rules={[
                      {
                        validator: (_, value) =>
                          value?.length
                            ? Promise.resolve()
                            : Promise.reject(new Error('The bank slip field is required.')),
                      },
                    ]}
                  >
                    <Upload beforeUpload={() => false} maxCount={1} accept="image/*,.pdf">
                      <Button icon={<UploadOutlined />}>Choose file</Button>
                    </Upload>
                  </Form.Item>
                </>
              ) : null}
              <Form.Item name="amount" label="Amount">
                <InputNumber min={0} readOnly style={{ width: '100%' }} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CreditCardOutlined />}
                loading={submitting}
              >
                Pay
              </Button>
            </Form>
          </div>
        ) : null}
      </Spin>
    </PublicShell>
  );
}
