import { CreditCardOutlined, LockOutlined } from '@ant-design/icons';
import { useLocation, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Result,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';
import {
  billingText,
  getPlanOptions,
  hasSslcommerz,
  methodByName,
  planDurationDays,
  planPriceText,
  planTitle,
} from './helpers';
import PublicShell from './Shell';
import { getAvailablePlans, getPaymentMethods, startSslcommerzCheckout } from './service';
import styles from './style.less';

const PaymentGateway: React.FC = () => {
  const params = useParams<{ planId: string; businessId: string }>();
  const location = useLocation();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const { data: plans, loading: plansLoading } = useRequest(getAvailablePlans, {
    onError: () => undefined,
  });
  const { data: methodsReply, loading: methodsLoading } = useRequest(getPaymentMethods, {
    onError: () => undefined,
  });
  const options = useMemo(() => getPlanOptions(plans), [plans]);
  const selected = options.find(
    ({ plan, price }) => price.id === params.planId || plan.key === params.planId,
  );
  const methods = methodsReply?.methods ?? [];
  const sslcommerz = methodByName(methods, 'sslcommerz');
  const sslAvailable = hasSslcommerz(methods);
  const loading = plansLoading || methodsLoading;
  const checkoutToken = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get('checkout_token') ?? query.get('checkoutToken') ?? '';
  }, [location.search]);

  return (
    <PublicShell>
      {contextHolder}
      <div className={styles.gatewayLayout}>
        <div>
          <Typography.Title>Secure checkout gateway</Typography.Title>
          <Typography.Paragraph className={styles.heroText}>
            Confirm your plan and continue through the supported hosted payment provider.
          </Typography.Paragraph>
          <Card>
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : selected ? (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Plan">{planTitle(selected.plan)}</Descriptions.Item>
                <Descriptions.Item label="Price">
                  {planPriceText(selected.plan, selected.price)}
                </Descriptions.Item>
                <Descriptions.Item label="Billing">
                  {planDurationDays(selected.plan, selected.price)
                    ? `${planDurationDays(selected.plan, selected.price)} days`
                    : billingText(selected.price)}
                </Descriptions.Item>
                <Descriptions.Item label="Business">{params.businessId}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Result
                status="404"
                title="Plan not found"
                subTitle="The selected plan is unavailable or no longer public."
              />
            )}
          </Card>
        </div>
        <Card
          title={
            <Space>
              <CreditCardOutlined />
              SSLCommerz
            </Space>
          }
        >
          {!loading && !sslAvailable && (
            <Alert
              type="warning"
              showIcon
              message="SSLCommerz checkout is not available."
              description="Ask the site owner to enable SSLCommerz."
              style={{ marginBottom: 20 }}
            />
          )}
          {sslcommerz?.notice && (
            <Alert type="info" showIcon message={sslcommerz.notice} style={{ marginBottom: 20 }} />
          )}
          <Form
            form={form}
            layout="vertical"
            initialValues={{ customer_country: 'Bangladesh', customer_city: 'Dhaka' }}
            disabled={!selected || !sslAvailable || loading || submitting}
            onFinish={async (values) => {
              if (!selected) {
                messageApi.error('A valid plan is required before checkout.');
                return;
              }
              if (!selected.price?.id) {
                messageApi.error('A valid price is required before checkout.');
                return;
              }
              setSubmitting(true);
              try {
                const planKey = selected.plan.key ?? params.planId!;
                const resp = await startSslcommerzCheckout({
                  plan_key: planKey,
                  plan_id: planKey,
                  business_id: params.businessId,
                  tenant_id: params.businessId,
                  price_id: selected.price.id,
                  currency_code:
                    selected.price.currencyCode ?? selected.plan.currency_code ?? 'BDT',
                  quantity: 1,
                  platform: 'web',
                  phone: values.customer_phone,
                  country: values.customer_country,
                  customer_name: values.customer_name,
                  customer_email: values.customer_email,
                  customer_phone: values.customer_phone,
                  customer_city: values.customer_city,
                  customer_country: values.customer_country,
                  checkout_token: checkoutToken || undefined,
                });
                const redirectUrl = resp.redirect ?? resp.redirect_url ?? resp.redirectUrl;
                if (!redirectUrl) {
                  messageApi.error('Payment redirect is unavailable.');
                  return;
                }
                window.location.assign(redirectUrl);
              } catch {
                messageApi.error('Unable to start SSLCommerz checkout.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <Form.Item name="customer_phone" label="Phone" rules={[{ required: true, min: 6 }]}>
              <Input autoComplete="tel" />
            </Form.Item>
            <Form.Item name="customer_name" label="Name" rules={[{ required: true }]}>
              <Input autoComplete="name" />
            </Form.Item>
            <Form.Item name="customer_email" label="Email" rules={[{ type: 'email' }]}>
              <Input autoComplete="email" />
            </Form.Item>
            <Form.Item name="customer_city" label="City">
              <Input />
            </Form.Item>
            <Form.Item name="customer_country" label="Country">
              <Input />
            </Form.Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<LockOutlined />}
            >
              Continue to SSLCommerz
            </Button>
          </Form>
        </Card>
      </div>
    </PublicShell>
  );
};

export default PaymentGateway;
