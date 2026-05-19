import { Link } from '@umijs/max';
import { Button } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
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
    </main>
  );
}
