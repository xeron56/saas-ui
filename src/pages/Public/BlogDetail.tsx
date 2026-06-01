import { CalendarOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Form,
  Input,
  List,
  message,
  Result,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import { entryImage, entryText, formatPublicDate } from './helpers';
import PublicShell from './Shell';
import { getPublicBlog, sendPublicBlogComment } from './service';
import styles from './style.less';

const BlogDetail: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? '';
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const { data, loading, error, refresh } = useRequest(() => getPublicBlog(slug), {
    ready: !!slug,
    refreshDeps: [slug],
    onError: () => undefined,
  });
  const blog = data?.data?.blog;
  const comments = data?.data?.comments ?? [];
  const image = entryImage(blog);

  return (
    <PublicShell>
      {contextHolder}
      {loading ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : error || !blog ? (
        <Result
          status="404"
          title="Post not found"
          subTitle="The requested public blog post is unavailable."
          extra={
            <Button type="primary">
              <Link to="/blogs">Back to blogs</Link>
            </Button>
          }
        />
      ) : (
        <div className={styles.articleLayout}>
          <article>
            <Space direction="vertical" size={18} className={styles.fullWidth}>
              <Typography.Title>{blog.title || 'Untitled post'}</Typography.Title>
              <Space wrap className={styles.metaLine}>
                {blog.author_name && (
                  <Typography.Text type="secondary">
                    <UserOutlined /> {blog.author_name}
                  </Typography.Text>
                )}
                {blog.published_at && (
                  <Typography.Text type="secondary">
                    <CalendarOutlined /> {formatPublicDate(blog.published_at)}
                  </Typography.Text>
                )}
              </Space>
              {image && (
                <img src={image} alt={blog.title || 'Blog image'} className={styles.articleImage} />
              )}
              {blog.summary && (
                <Typography.Paragraph className={styles.heroText}>
                  {blog.summary}
                </Typography.Paragraph>
              )}
              <Typography.Paragraph className={styles.preWrap}>
                {entryText(blog) || 'This post has no published body content yet.'}
              </Typography.Paragraph>
            </Space>
          </article>
          <aside>
            <Card
              title={
                <Space>
                  <CommentOutlined />
                  Comments
                </Space>
              }
              className={styles.sidebarCard}
            >
              <List
                locale={{ emptyText: 'No comments yet.' }}
                dataSource={comments}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name || 'Guest'}
                      description={
                        <Typography.Text className={styles.preWrap}>{item.comment}</Typography.Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
            <Card title="Leave a comment" className={styles.sidebarCard}>
              <Form
                form={form}
                layout="vertical"
                disabled={submitting}
                onFinish={async (values) => {
                  setSubmitting(true);
                  try {
                    await sendPublicBlogComment(slug, {
                      ...values,
                      blog_slug: slug,
                    });
                    messageApi.success('Comment submitted.');
                    form.resetFields();
                    refresh();
                  } catch {
                    messageApi.error('Unable to submit comment.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input autoComplete="name" />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                  <Input autoComplete="email" />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="Comment"
                  rules={[{ required: true, min: 3, max: 255 }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Submit comment
                </Button>
              </Form>
            </Card>
          </aside>
        </div>
      )}
    </PublicShell>
  );
};

export default BlogDetail;
