import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Card, Form, Input, message, Skeleton, Space, Typography } from 'antd';
import React from 'react';
import { getHomeValue } from './helpers';
import PublicShell from './Shell';
import { getPublicContact, sendPublicContact } from './service';
import styles from './style.less';

const Contact: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { data, loading } = useRequest(getPublicContact, { onError: () => undefined });
  const contact = data?.data;
  const contactTitle = getHomeValue(
    contact,
    ['contact_us_title', 'title'],
    'Talk to the product team',
  );
  const contactDescription = getHomeValue(
    contact,
    ['contact_us_description', 'summary', 'description', 'subtitle'],
    'Send a message and the team will help with plans, onboarding, and payment setup.',
  );
  const contactEmail = getHomeValue(contact, ['email', 'support_email'], 'support@example.com');
  const contactPhone = getHomeValue(
    contact,
    ['phone', 'phoneNumber', 'mobile'],
    'Available during business hours',
  );

  return (
    <PublicShell>
      {contextHolder}
      <div className={styles.contactLayout}>
        <div>
          <Typography.Title>{contactTitle}</Typography.Title>
          <Typography.Paragraph className={styles.heroText}>
            {contactDescription}
          </Typography.Paragraph>
          <Card>
            {loading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <Space direction="vertical" size={14}>
                <Typography.Text>
                  <MailOutlined /> {contactEmail}
                </Typography.Text>
                <Typography.Text>
                  <PhoneOutlined /> {contactPhone}
                </Typography.Text>
              </Space>
            )}
          </Card>
        </div>
        <Card title="Contact form">
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              await sendPublicContact(values);
              messageApi.success('Message sent.');
              form.resetFields();
            }}
          >
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input autoComplete="name" />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input autoComplete="email" />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true, min: 5, max: 20 }]}>
              <Input autoComplete="tel" />
            </Form.Item>
            <Form.Item name="company_name" label="Company">
              <Input autoComplete="organization" />
            </Form.Item>
            <Form.Item name="message" label="Message" rules={[{ required: true, min: 8 }]}>
              <Input.TextArea rows={5} />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Send message
            </Button>
          </Form>
        </Card>
      </div>
    </PublicShell>
  );
};

export default Contact;
