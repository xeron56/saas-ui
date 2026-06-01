import { Link, useLocation } from '@umijs/max';
import { Button, Result, Space, Typography } from 'antd';
import React from 'react';
import {
  paymentStatusLabel,
  paymentStatusReference,
  useSslcommerzOrderStatus,
} from './paymentStatus';
import PublicShell from './Shell';
import styles from './style.less';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const { error, loading, lookup, status } = useSslcommerzOrderStatus(location.search);
  const orderId = paymentStatusReference(lookup, status);
  const currentStatus = status?.status ? paymentStatusLabel(status.status) : '';

  return (
    <PublicShell>
      <div className={styles.statusPage}>
        <Result
          status="success"
          title="Payment completed"
          subTitle={
            <Space direction="vertical">
              <Typography.Text>
                {loading
                  ? 'Checking the confirmed payment status...'
                  : error
                  ? 'Payment was accepted, but the latest order status is temporarily unavailable.'
                  : currentStatus
                  ? `Current status: ${currentStatus}`
                  : 'Your checkout was accepted and the subscription order is being processed.'}
              </Typography.Text>
              {orderId && <Typography.Text type="secondary">Reference: {orderId}</Typography.Text>}
            </Space>
          }
          extra={[
            <Button type="primary" key="status">
              <Link to={`/order-status${location.search}`}>View order status</Link>
            </Button>,
            <Button key="plans">
              <Link to="/plans">Back to plans</Link>
            </Button>,
          ]}
        />
      </div>
    </PublicShell>
  );
};

export default PaymentSuccess;
