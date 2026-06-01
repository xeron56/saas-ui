import { Link, useLocation } from '@umijs/max';
import { Button, Result, Space, Typography } from 'antd';
import React from 'react';
import { paymentStatusLabel, useSslcommerzOrderStatus } from './paymentStatus';
import PublicShell from './Shell';
import styles from './style.less';

const PaymentFailed: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const reason =
    query.get('reason') ??
    query.get('error') ??
    'The payment provider did not approve this checkout.';
  const { error, loading, status } = useSslcommerzOrderStatus(location.search);
  const currentStatus = status?.status ? paymentStatusLabel(status.status) : '';
  const completed = status?.status?.toLowerCase() === 'paid';

  return (
    <PublicShell>
      <div className={styles.statusPage}>
        <Result
          status={completed ? 'success' : 'error'}
          title={completed ? 'Payment completed' : 'Payment not completed'}
          subTitle={
            <Space direction="vertical">
              <Typography.Text>
                {loading
                  ? 'Checking the confirmed payment status...'
                  : error
                  ? 'The latest order status is temporarily unavailable.'
                  : currentStatus
                  ? `Current status: ${currentStatus}`
                  : 'No charge confirmation was received.'}
              </Typography.Text>
              <Typography.Text type="secondary">{reason}</Typography.Text>
              <Typography.Text type="secondary">
                You can retry from the plans page if the order is still unpaid.
              </Typography.Text>
            </Space>
          }
          extra={[
            <Button type="primary" key="plans">
              <Link to="/plans">Choose a plan</Link>
            </Button>,
            <Button key="contact">
              <Link to="/contact-us">Contact support</Link>
            </Button>,
          ]}
        />
      </div>
    </PublicShell>
  );
};

export default PaymentFailed;
