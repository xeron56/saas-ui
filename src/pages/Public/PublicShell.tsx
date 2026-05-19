import { Link } from '@umijs/max';
import { Button, Form, Input, message as toast } from 'antd';
import {
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  LoginOutlined,
  MailOutlined,
  PhoneOutlined,
  SendOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import { useEffect, useState, type ReactNode } from 'react';
import { normalizePayload, textValue } from './content';
import { fetchPublicContent, postPublicContent } from './services';
import type { LegacyRecord } from './types';
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

const footerLinks = [
  { path: '/our-notice', label: 'Notice' },
  { path: '/page/privacy_policy', label: 'Privacy Policy' },
  { path: '/all-event', label: 'Events' },
  { path: '/page/cookie_policy', label: 'Cookie Policy' },
  { path: '/all-stories', label: 'Stories' },
  { path: '/page/terms_condition', label: 'Terms & Condition' },
  { path: '/our-news', label: 'News' },
  { path: '/page/refund_policy', label: 'Refund Policy' },
];

const socialLinks = [
  { key: 'facebook_url', label: 'Facebook', icon: <FacebookOutlined /> },
  { key: 'twitter_url', label: 'Twitter', icon: <TwitterOutlined /> },
  { key: 'linkedin_url', label: 'LinkedIn', icon: <LinkedinOutlined /> },
  { key: 'instagram_url', label: 'Instagram', icon: <InstagramOutlined /> },
];

function externalHref(value: string) {
  if (!value || /^https?:\/\//i.test(value)) {
    return value;
  }
  return `https://${value}`;
}

export default function PublicShell({ title, description, children }: PublicShellProps) {
  const [newsletterForm] = Form.useForm<{ email?: string }>();
  const [subscribing, setSubscribing] = useState(false);
  const [footerPayload, setFooterPayload] = useState<LegacyRecord>({});

  useEffect(() => {
    let mounted = true;
    fetchPublicContent('/')
      .then((payload) => {
        if (!mounted) {
          return;
        }
        const footer = normalizePayload(payload).footer;
        if (footer && typeof footer === 'object' && !Array.isArray(footer)) {
          setFooterPayload(footer);
        }
      })
      .catch(() => {
        if (mounted) {
          setFooterPayload({});
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

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

  const footerValue = (key: string) => textValue(footerPayload[key]);
  const footerLogo = footerValue('app_logo_url');
  const showFooterLogo = footerLogo && footerLogo !== '/assets/images/no-image.jpg';
  const contactNumber = footerValue('app_contact_number');
  const email = footerValue('app_email');
  const socialItems = socialLinks
    .map((item) => ({ ...item, href: externalHref(footerValue(item.key)) }))
    .filter((item) => item.href);

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
          <div className="public-footer-main">
            <div className="public-footer-brand-block">
              {showFooterLogo ? (
                <img className="public-footer-logo" src={footerLogo} alt="" />
              ) : (
                <strong className="public-footer-brand-name">Alumni Portal</strong>
              )}
              {footerValue('footer_left_text') ? <p>{footerValue('footer_left_text')}</p> : null}
              {socialItems.length ? (
                <div className="public-footer-social">
                  {socialItems.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="public-footer-links">
              {footerLinks.map((item) => (
                <Link key={item.path} to={item.path}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="public-footer-contact">
              <h2>Contact</h2>
              {footerValue('app_location') ? (
                <span className="public-footer-contact-item">
                  <EnvironmentOutlined />
                  {footerValue('app_location')}
                </span>
              ) : null}
              {contactNumber ? (
                <a
                  className="public-footer-contact-item"
                  href={`tel:${contactNumber.replace(/\s+/g, '')}`}
                >
                  <PhoneOutlined />
                  {contactNumber}
                </a>
              ) : null}
              {email ? (
                <a className="public-footer-contact-item" href={`mailto:${email}`}>
                  <MailOutlined />
                  {email}
                </a>
              ) : null}
            </div>
          </div>
          {footerValue('app_copyright') ? (
            <div className="public-footer-bottom">{footerValue('app_copyright')}</div>
          ) : null}
        </div>
      </footer>
    </main>
  );
}
