import { Link, useLocation } from '@umijs/max';
import { Button, Card, Descriptions, Empty, Result, Typography } from 'antd';
import React from 'react';
import {
  paymentAmountText,
  paymentResultStatus,
  paymentStatusLabel,
  paymentStatusReference,
  useSslcommerzOrderStatus,
} from './paymentStatus';
import PublicShell from './Shell';
import styles from './style.less';

const OrderStatus: React.FC = () => {
  const location = useLocation();
  const { error, loading, lookup, status } = useSslcommerzOrderStatus(location.search);
  const orderId = paymentStatusReference(lookup, status);
  const statusLabel = paymentStatusLabel(status?.status);
  const amount = paymentAmountText(status);
  const currency = status?.currency_code;

  return (
    <PublicShell>
      <Typography.Title>Order status</Typography.Title>
      <Typography.Paragraph className={styles.heroText}>
        This page verifies the checkout reference against the payment service.
      </Typography.Paragraph>
      {lookup.transaction_id ? (
        <Card>
          <Result
            status={paymentResultStatus(status?.status) as any}
            title={
              loading
                ? 'Checking payment status'
                : error
                ? 'Payment status unavailable'
                : statusLabel
            }
            subTitle="Use this reference if you need help from support."
          />
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Order reference">{orderId}</Descriptions.Item>
            {status?.transaction_id && (
              <Descriptions.Item label="Transaction">{status.transaction_id}</Descriptions.Item>
            )}
            {amount && <Descriptions.Item label="Amount">{amount}</Descriptions.Item>}
            {currency && <Descriptions.Item label="Currency">{currency}</Descriptions.Item>}
            {status?.paid_time && (
              <Descriptions.Item label="Paid time">{status.paid_time}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ) : (
        <Empty description="No order reference was provided.">
          <Button type="primary">
            <Link to="/plans">View plans</Link>
          </Button>
        </Empty>
      )}
    </PublicShell>
  );
};

export default OrderStatus;
