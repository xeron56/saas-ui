import { CheckCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Card, Col, Row, Skeleton, Space, Typography } from 'antd';
import React from 'react';
import { entryText, getHomeValue } from './helpers';
import PublicShell from './Shell';
import { getPublicAbout } from './service';
import styles from './style.less';

const About: React.FC = () => {
  const { data, loading } = useRequest(getPublicAbout, { onError: () => undefined });
  const about = data?.data;
  const title = getHomeValue(
    about,
    ['about_us_title', 'about_title', 'title'],
    'Built for subscription teams',
  );
  const summary = getHomeValue(
    about,
    ['about_us_description', 'about_description', 'summary', 'description'],
    'GoSaaS brings public plan discovery, customer onboarding, payments, and operational control into one product console.',
  );
  const features = about?.features ?? [];
  const testimonials = about?.testimonials ?? [];

  return (
    <PublicShell>
      <section className={styles.pageHero}>
        <Typography.Title>{title}</Typography.Title>
        <Typography.Paragraph className={styles.heroText}>{summary}</Typography.Paragraph>
      </section>
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.metricGrid}>
              {(features.length
                ? features.slice(0, 6)
                : [
                    {
                      title: 'Public-first onboarding',
                      summary:
                        'Customers can understand plans and start setup without entering protected app areas.',
                    },
                    {
                      title: 'Operational clarity',
                      summary:
                        'Admin teams can manage public content, subscriptions, and payment readiness together.',
                    },
                    {
                      title: 'CMS parity',
                      summary:
                        'Public pages use the same published content managed in the system console.',
                    },
                  ]
              ).map((item, index) => (
                <Card key={item.id ?? item.title ?? index} className={styles.metricCard}>
                  <Space direction="vertical">
                    <Typography.Title level={4}>
                      <CheckCircleOutlined /> {item.title || 'Platform capability'}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {item.summary || entryText(item) || 'Published site content is available.'}
                    </Typography.Text>
                  </Space>
                </Card>
              ))}
            </div>
          </section>
          {!!testimonials.length && (
            <section className={styles.section}>
              <Typography.Title level={3}>
                <TeamOutlined /> Customer notes
              </Typography.Title>
              <Row gutter={[18, 18]}>
                {testimonials.slice(0, 3).map((item, index) => (
                  <Col xs={24} md={8} key={item.id ?? item.title ?? index}>
                    <Card className={styles.planCard}>
                      <Space direction="vertical">
                        <Typography.Text className={styles.preWrap}>
                          {item.text || entryText(item)}
                        </Typography.Text>
                        <Typography.Text strong>{item.client_name || item.title}</Typography.Text>
                        {item.work_at && (
                          <Typography.Text type="secondary">{item.work_at}</Typography.Text>
                        )}
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </section>
          )}
        </>
      )}
    </PublicShell>
  );
};

export default About;
