import {
  BarChartOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Button, Card, Col, Row, Skeleton, Space, Statistic, Typography } from 'antd';
import React from 'react';
import {
  billingText,
  entryImage,
  entryText,
  formatPublicDate,
  getHomeValue,
  getPlanOptions,
  planDurationDays,
  planFeatureItems,
  planPriceText,
  planTitle,
  publicAsset,
} from './helpers';
import PublicShell from './Shell';
import { getAvailablePlans, getPublicHome } from './service';
import styles from './style.less';

const Home: React.FC = () => {
  const { data, loading } = useRequest(getPublicHome, {
    refreshDeps: [],
    onError: () => undefined,
  });
  const { data: plansData, loading: plansLoading } = useRequest(getAvailablePlans, {
    onError: () => undefined,
  });
  const home = data?.data;
  const title = getHomeValue(
    home,
    ['slider_title', 'title', 'hero_title', 'heroTitle'],
    'Run your SaaS business from one console',
  );
  const summary = getHomeValue(
    home,
    ['slider_description', 'summary', 'subtitle', 'hero_subtitle', 'heroSubtitle'],
    'Launch plans, collect payments, manage subscribers, and keep product operations visible without entering the admin app.',
  );
  const heroImage = publicAsset(getHomeValue(home, ['slider_image', 'image', 'imageUrl'], ''));
  const watchVideoUrl = getHomeValue(
    home,
    ['watch_video_url', 'watchVideoUrl', 'video_url', 'videoUrl'],
    '',
  );
  const bannerItems = Array.isArray(home?.banners) ? home?.banners ?? [] : [];
  const featureItems = Array.isArray(home?.features) ? home?.features ?? [] : [];
  const interfaceItems = Array.isArray(home?.interfaces) ? home?.interfaces ?? [] : [];
  const testimonialItems = Array.isArray(home?.testimonials) ? home?.testimonials ?? [] : [];
  const recentBlogs = Array.isArray(home?.recent_blogs)
    ? home?.recent_blogs ?? []
    : Array.isArray(home?.recentBlogs)
    ? home?.recentBlogs ?? []
    : [];
  const planOptions = getPlanOptions(plansData).slice(0, 3);
  const fallbackFeatures = [
    {
      title: 'Plan management',
      summary: 'Publish subscription plans and route buyers into a clean signup flow.',
    },
    {
      title: 'Hosted payments',
      summary: 'Show only configured SSLCommerz checkout when payment is available.',
    },
    {
      title: 'Retail operations',
      summary:
        'Connect tenant billing with retail catalog, sales, purchases, and finance workflows.',
    },
  ];

  return (
    <PublicShell>
      <section className={styles.hero}>
        <div>
          <Typography.Title className={styles.heroTitle}>{title}</Typography.Title>
          <Typography.Paragraph className={styles.heroText}>{summary}</Typography.Paragraph>
          <Space wrap size="middle">
            <Button type="primary" size="large">
              <Link to="/plans">View plans</Link>
            </Button>
            <Button size="large">
              <Link to="/contact-us">Contact sales</Link>
            </Button>
            {watchVideoUrl && (
              <Button size="large" icon={<PlayCircleOutlined />} href={watchVideoUrl}>
                Watch demo
              </Button>
            )}
          </Space>
        </div>
        {heroImage ? (
          <div className={styles.heroImageWrap}>
            <img src={heroImage} alt={title} className={styles.heroImage} />
          </div>
        ) : (
          <div className={styles.consolePanel}>
            <div className={styles.consoleTop}>
              <span className={styles.consoleDot} />
              <span className={styles.consoleDot} />
              <span className={styles.consoleDot} />
            </div>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Card>
                  <Statistic title="Active plans" value={loading ? 0 : home?.plans_count ?? 6} />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic title="Gateways" value={loading ? 0 : home?.gateways_count ?? 1} />
                </Card>
              </Col>
              <Col span={24}>
                <Card>
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 3 }} />
                  ) : (
                    <Space direction="vertical" size={12}>
                      <Typography.Text strong>Public checkout ready</Typography.Text>
                      <Typography.Text type="secondary">
                        Customers can choose a plan, confirm SSLCommerz availability, and continue
                        through hosted payment.
                      </Typography.Text>
                    </Space>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </section>
      {!!bannerItems.length && (
        <section className={styles.bannerRail}>
          {bannerItems.slice(0, 3).map((item: Record<string, any>, index: number) => (
            <div key={item.id ?? item.title ?? index} className={styles.bannerItem}>
              <Typography.Text strong>{item.title || `Highlight ${index + 1}`}</Typography.Text>
              <Typography.Text type="secondary">
                {item.summary || entryText(item) || 'Published site highlight'}
              </Typography.Text>
            </div>
          ))}
        </section>
      )}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Typography.Title level={3}>What the platform covers</Typography.Title>
          <Typography.Paragraph type="secondary">
            The public site reflects the same published features maintained from the system console.
          </Typography.Paragraph>
        </div>
        <div className={styles.metricGrid}>
          {(featureItems.length ? featureItems.slice(0, 6) : fallbackFeatures).map(
            (item: Record<string, any>, index: number) => (
              <Card key={item.id ?? item.title ?? index} className={styles.metricCard}>
                <Space direction="vertical">
                  <Typography.Title level={4}>
                    <CheckCircleOutlined /> {item.title || 'Platform capability'}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {item.summary || entryText(item) || 'Published feature detail'}
                  </Typography.Text>
                </Space>
              </Card>
            ),
          )}
        </div>
      </section>
      {!!interfaceItems.length && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography.Title level={3}>Product surfaces</Typography.Title>
            <Typography.Paragraph type="secondary">
              Interface previews make the product visible before signup.
            </Typography.Paragraph>
          </div>
          <div className={styles.imageStrip}>
            {interfaceItems.slice(0, 4).map((item: Record<string, any>, index: number) => {
              const src = publicAsset(
                item.imageUrl ?? item.image ?? item.media_ref ?? item.mediaRef,
              );
              return src ? (
                <img
                  key={`${src}-${index}`}
                  src={src}
                  alt={item.title ?? `Product surface ${index + 1}`}
                  className={styles.surfaceImage}
                />
              ) : null;
            })}
          </div>
        </section>
      )}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Typography.Title level={3}>Plans ready for checkout</Typography.Title>
          <Typography.Paragraph type="secondary">
            Public plans stay connected to the SaaS catalog and the SSLCommerz payment flow.
          </Typography.Paragraph>
        </div>
        {plansLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : planOptions.length ? (
          <div className={styles.planGrid}>
            {planOptions.map(({ plan, price }, index) => (
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
                  <div className={styles.planPrice}>{planPriceText(plan, price)}</div>
                  <Typography.Text type="secondary">
                    {planDurationDays(plan, price)
                      ? `${planDurationDays(plan, price)} days`
                      : billingText(price)}
                  </Typography.Text>
                  <Typography.Text>
                    <RocketOutlined />{' '}
                    {planFeatureItems(plan)[0]?.label ||
                      'Subscription, billing, and public checkout included.'}
                  </Typography.Text>
                </Space>
              </Card>
            ))}
          </div>
        ) : (
          <Card className={styles.noticeBand}>
            <Space align="center" wrap>
              <CustomerServiceOutlined />
              <Typography.Text>Plan pricing is not published yet.</Typography.Text>
              <Button type="link">
                <Link to="/contact-us">Contact sales</Link>
              </Button>
            </Space>
          </Card>
        )}
      </section>
      {!!testimonialItems.length && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography.Title level={3}>
              <TeamOutlined /> Customer notes
            </Typography.Title>
          </div>
          <Row gutter={[18, 18]}>
            {testimonialItems.slice(0, 3).map((item: Record<string, any>, index: number) => (
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
      {!!recentBlogs.length && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Typography.Title level={3}>
              <FileTextOutlined /> Latest updates
            </Typography.Title>
          </div>
          <div className={styles.blogGrid}>
            {recentBlogs.slice(0, 3).map((item: Record<string, any>, index: number) => {
              const image = entryImage(item);
              const slug = item.slug ?? item.id;
              return (
                <Card
                  key={item.id ?? item.title ?? index}
                  className={styles.blogCard}
                  cover={image ? <img alt={item.title || 'Blog'} src={image} /> : undefined}
                  actions={[
                    slug ? (
                      <Link key="read" to={`/blogs/${encodeURIComponent(slug)}`}>
                        Read
                      </Link>
                    ) : (
                      <Link key="blogs" to="/blogs">
                        Blogs
                      </Link>
                    ),
                  ]}
                >
                  <Space direction="vertical">
                    <Typography.Text type="secondary">
                      {formatPublicDate(item.published_at ?? item.created_at)}
                    </Typography.Text>
                    <Typography.Title level={4}>
                      {item.title || 'Published update'}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {item.summary || entryText(item)}
                    </Typography.Text>
                  </Space>
                </Card>
              );
            })}
          </div>
        </section>
      )}
      <section className={styles.section}>
        <div className={styles.ctaBand}>
          <div>
            <Typography.Title level={3}>Start with a business workspace</Typography.Title>
            <Typography.Paragraph type="secondary">
              Create the tenant, select a plan, and continue through the configured public payment
              gateway.
            </Typography.Paragraph>
          </div>
          <Space wrap>
            <Button type="primary" size="large">
              <Link to="/user/register">Create account</Link>
            </Button>
            <Button size="large">
              <Link to="/plans">Compare plans</Link>
            </Button>
          </Space>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.metricGrid}>
          {[
            {
              icon: <DatabaseOutlined />,
              title: 'Subscription catalog',
              text: 'Plans and prices load directly from the public SaaS API.',
            },
            {
              icon: <CreditCardOutlined />,
              title: 'Payment initiation',
              text: 'Only supported payment methods are exposed to public buyers.',
            },
            {
              icon: <BarChartOutlined />,
              title: 'Order visibility',
              text: 'Success, failure, and order status pages support post-checkout handoff.',
            },
            {
              icon: <SafetyCertificateOutlined />,
              title: 'Unauthenticated access',
              text: 'Public pages stay reachable without opening protected dashboard routes.',
            },
          ].map((item) => (
            <Card key={item.title} className={styles.metricCard}>
              <Space direction="vertical">
                <Typography.Title level={4}>
                  {item.icon} {item.title}
                </Typography.Title>
                <Typography.Text type="secondary">{item.text}</Typography.Text>
              </Space>
            </Card>
          ))}
        </div>
      </section>
    </PublicShell>
  );
};

export default Home;
