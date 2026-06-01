import { CalendarOutlined, ReadOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Card, Empty, Skeleton, Space, Typography } from 'antd';
import React from 'react';
import { entryImage, formatPublicDate, getHomeValue } from './helpers';
import PublicShell from './Shell';
import { getPublicBlogs } from './service';
import styles from './style.less';

const Blogs: React.FC = () => {
  const { data, loading } = useRequest(() => getPublicBlogs(), { onError: () => undefined });
  const page = data?.data;
  const title = getHomeValue(page, ['blog_title', 'blogs_title', 'title'], 'Latest updates');
  const summary = getHomeValue(
    page,
    ['blog_description', 'blogs_description', 'summary', 'description'],
    'Read product, platform, and subscription updates from the GoSaaS team.',
  );
  const blogs = page?.blogs ?? [];

  return (
    <PublicShell>
      <section className={styles.pageHero}>
        <Typography.Title>{title}</Typography.Title>
        <Typography.Paragraph className={styles.heroText}>{summary}</Typography.Paragraph>
      </section>
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : blogs.length ? (
        <div className={styles.blogGrid}>
          {blogs.map((blog, index) => {
            const image = entryImage(blog);
            const path = blog.slug ? `/blogs/${encodeURIComponent(blog.slug)}` : '/blogs';
            return (
              <Card
                key={blog.id ?? blog.slug ?? index}
                className={styles.blogCard}
                cover={image ? <img src={image} alt={blog.title || 'Blog image'} /> : undefined}
                actions={[
                  <Link key="read" to={path}>
                    <ReadOutlined /> Read
                  </Link>,
                ]}
              >
                <Space direction="vertical" size={10}>
                  <Typography.Title level={4}>{blog.title || 'Untitled post'}</Typography.Title>
                  {blog.published_at && (
                    <Typography.Text type="secondary">
                      <CalendarOutlined /> {formatPublicDate(blog.published_at)}
                    </Typography.Text>
                  )}
                  <Typography.Paragraph type="secondary" ellipsis={{ rows: 3 }}>
                    {blog.summary || blog.descriptions || blog.body}
                  </Typography.Paragraph>
                </Space>
              </Card>
            );
          })}
        </div>
      ) : (
        <Empty description="No public blog posts are available yet." />
      )}
    </PublicShell>
  );
};

export default Blogs;
