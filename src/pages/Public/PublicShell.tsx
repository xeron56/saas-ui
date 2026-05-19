import { Link } from '@umijs/max';
import { Button, Form, Input, message as toast } from 'antd';
import { LoginOutlined, SendOutlined } from '@ant-design/icons';
import { useState, type ReactNode } from 'react';
import { normalizePayload, textValue } from './content';
import { postPublicContent } from './services';
import './index.less';

type PublicShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/all-alumni', label: 'Alumni' },
  { path: '/all-event', label: 'Events' },
  { path: '/our-news', label: 'News' },
  { path: '/our-notice', label: 'Notices' },
  { path: '/all-job', label: 'Jobs' },
  { path: '/all-stories', label: 'Stories' },
  { path: '/all-membership', label: 'Membership' },
  { path: '/contact-us', label: 'Contact' },
];

export default function PublicShell({ title, description, children }: PublicShellProps) {
  const [newsletterForm] = Form.useForm<{ email?: string }>();
  const [subscribing, setSubscribing] = useState(false);

  const subscribeNewsletter = async (values: { email?: string }) => {
    setSubscribing(true);
    try {
      const payload = normalizePayload(
        await postPublicContent('/news-subscription-letter-email', {
          email: textValue(values.email),
        }),
      );
      if (payload.status === false) {
        toast.error(textValue(payload.message) || 'Newsletter subscription failed.');
        return;
      }
      newsletterForm.resetFields();
      toast.success(textValue(payload.message) || 'Newsletter subscription saved.');
    } catch (err: any) {
      toast.error(err?.message || 'Newsletter subscription failed.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <main className="public-shell">
      <header className="public-header">
        <Link className="public-brand" to="/">
          Alumni Portal
        </Link>
        <nav className="public-nav" aria-label="Public sections">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Button icon={<LoginOutlined />} href="/user/login">
          Login
        </Button>
      </header>
      <section className="public-hero">
        <div>
          <p className="public-kicker">Public directory</p>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </section>
      <section className="public-content">{children}</section>
      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="public-newsletter">
            <div>
              <h2>Subscribe Our Newsletter</h2>
              <p>Get tenant announcements, events, notices, and alumni updates.</p>
            </div>
            <Form
              className="public-newsletter-form"
              form={newsletterForm}
              onFinish={subscribeNewsletter}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Enter an email address.' },
                  { type: 'email', message: 'Enter a valid email address.' },
                ]}
              >
                <Input autoComplete="email" placeholder="Enter email address" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={subscribing}
              >
                Submit
              </Button>
            </Form>
          </div>
          <div className="public-footer-links">
            <Link to="/our-notice">Notice</Link>
            <Link to="/page/privacy_policy">Privacy Policy</Link>
            <Link to="/all-event">Events</Link>
            <Link to="/page/cookie_policy">Cookie Policy</Link>
            <Link to="/all-stories">Stories</Link>
            <Link to="/page/terms_condition">Terms & Condition</Link>
            <Link to="/our-news">News</Link>
            <Link to="/page/refund_policy">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
