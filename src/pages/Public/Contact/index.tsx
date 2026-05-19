import { Button, Form, Input, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import PublicShell from '../PublicShell';
import { normalizePayload } from '../content';
import { postPublicContent } from '../services';

type ContactFormValues = {
  name: string;
  email: string;
  phone?: string;
  issue?: string;
  message: string;
};

export default function Contact() {
  const [form] = Form.useForm<ContactFormValues>();

  const submit = async (values: ContactFormValues) => {
    const payload = normalizePayload(await postPublicContent('/contact-us-store', values));
    message.success(payload.message || 'Message sent.');
    form.resetFields();
  };

  return (
    <PublicShell title="Contact Us" description="Send a message to the tenant administrators.">
      <Form form={form} layout="vertical" className="public-form" onFinish={submit}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input autoComplete="name" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input autoComplete="email" />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input autoComplete="tel" />
        </Form.Item>
        <Form.Item name="issue" label="Subject">
          <Input />
        </Form.Item>
        <Form.Item name="message" label="Message" rules={[{ required: true }]}>
          <Input.TextArea rows={6} />
        </Form.Item>
        <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
          Send
        </Button>
      </Form>
    </PublicShell>
  );
}
