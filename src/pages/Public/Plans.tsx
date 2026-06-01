import { CheckCircleOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Alert, Button, Card, Empty, Skeleton, Space, Typography } from 'antd';
import React from 'react';
import {
  billingText,
  getHomeValue,
  getPlanOptions,
  planDefaultPriceText,
  planDurationDays,
  planFeatureItems,
  planPriceText,
  planTitle,
} from './helpers';
import PublicShell from './Shell';
import { getAvailablePlans, getPublicShell } from './service';
import styles from './style.less';

const Plans: React.FC = () => {
  const { data, loading, error } = useRequest(getAvailablePlans, { onError: () => undefined });
  const { data: shellData } = useRequest(getPublicShell, { onError: () => undefined });
  const options = getPlanOptions(data);
  const page = shellData?.data;
  const title = getHomeValue(page, ['pricing_title'], 'Plans built for active product teams');
  const description = getHomeValue(
    page,
    ['pricing_description'],
    'Choose a plan and continue to the public payment gateway screen when checkout is available.',
  );

  return (
    <PublicShell>
      <Typography.Title>{title}</Typography.Title>
      <Typography.Paragraph className={styles.heroText}>{description}</Typography.Paragraph>
      {error && (
        <Alert
          type="warning"
          showIcon
          message="Plans are temporarily unavailable."
          style={{ marginBottom: 24 }}
        />
      )}
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : options.length ? (
        <div className={styles.planGrid}>
          {options.map(({ plan, price }, index) => (
            <Card
              key={`${plan.key}-${price.id ?? index}`}
              className={styles.planCard}
              title={planTitle(plan)}
              actions={[
                plan.key ? (
                  <Link
                    key="setup"
                    to={`/user/register?plan_key=${encodeURIComponent(plan.key)}${
                      price.id ? `&price_id=${encodeURIComponent(price.id)}` : ''
                    }`}
                  >
                    Start setup
                  </Link>
                ) : (
                  <Link key="contact" to="/contact-us">
                    Contact us
                  </Link>
                ),
              ]}
            >
              <Space direction="vertical" size={10}>
                <div>
                  <div className={styles.planPrice}>{planPriceText(plan, price)}</div>
                  {planDefaultPriceText(plan, price) &&
                    planDefaultPriceText(plan, price) !== planPriceText(plan, price) && (
                      <Typography.Text delete type="secondary">
                        {planDefaultPriceText(plan, price)}
                      </Typography.Text>
                    )}
                </div>
                <Typography.Text type="secondary">
                  {planDurationDays(plan, price)
                    ? `${planDurationDays(plan, price)} days`
                    : billingText(price)}
                </Typography.Text>
                <div className={styles.planFeatureList}>
                  {(planFeatureItems(plan).length
                    ? planFeatureItems(plan).slice(0, 8)
                    : [
                        {
                          label: 'Managed product, subscription, and payment workflows.',
                          enabled: true,
                        },
                        { label: 'SSLCommerz-ready public checkout.', enabled: true },
                      ]
                  ).map((feature) => (
                    <Typography.Text
                      key={`${feature.key ?? feature.label}`}
                      type={feature.enabled === false ? 'secondary' : undefined}
                    >
                      <CheckCircleOutlined /> {feature.label}
                    </Typography.Text>
                  ))}
                </div>
              </Space>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="No public plans are available yet.">
          <Button type="primary">
            <Link to="/contact-us">Contact sales</Link>
          </Button>
        </Empty>
      )}
    </PublicShell>
  );
};

export default Plans;
