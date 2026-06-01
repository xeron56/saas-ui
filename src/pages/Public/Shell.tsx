import {
  AppstoreOutlined,
  BookOutlined,
  InfoCircleOutlined,
  MailOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Button, Layout, Space, Typography } from 'antd';
import React from 'react';
import { getPublicShell } from './service';
import { isExternalHref, publicAsset, publicHref } from './helpers';
import styles from './style.less';

const { Header, Content, Footer } = Layout;

type PublicShellProps = {
  children: React.ReactNode;
};

type FooterLink = {
  label: string;
  href: string;
};

const navItems = [
  { path: '/', label: 'Console', icon: <AppstoreOutlined /> },
  { path: '/about-us', label: 'About', icon: <InfoCircleOutlined /> },
  { path: '/plans', label: 'Plans', icon: <RocketOutlined /> },
  { path: '/blogs', label: 'Blogs', icon: <BookOutlined /> },
  { path: '/contact-us', label: 'Contact', icon: <MailOutlined /> },
];

const footerLinkIndexes = ['one', 'two', 'three', 'four', 'five', 'six'];

const readHeadings = (pageData?: Record<string, any>) =>
  (pageData?.headings && typeof pageData.headings === 'object' ? pageData.headings : {}) as Record<
    string,
    any
  >;

const readFooterLinks = (headings: Record<string, any>, prefix: string): FooterLink[] =>
  footerLinkIndexes
    .map((index) => ({
      label: String(headings[`${prefix}_${index}`] || '').trim(),
      href: publicHref(String(headings[`${prefix}_link_${index}`] || '').trim(), '#'),
    }))
    .filter((item) => item.label);

const FooterAnchor: React.FC<FooterLink> = ({ label, href }) =>
  isExternalHref(href) || href === '#' ? (
    <a href={href} target={isExternalHref(href) ? '_blank' : undefined} rel="noreferrer">
      {label}
    </a>
  ) : (
    <Link to={href}>{label}</Link>
  );

const HeaderButton: React.FC<{ href: string; text: string }> = ({ href, text }) =>
  isExternalHref(href) ? (
    <Button href={href}>{text}</Button>
  ) : (
    <Button>
      <Link to={href}>{text}</Link>
    </Button>
  );

const PublicShell: React.FC<PublicShellProps> = ({ children }) => {
  const location = useLocation();
  const { data } = useRequest(getPublicShell, { onError: () => undefined });
  const pageData = data?.data?.page_data;
  const general = data?.data?.general || {};
  const headings = readHeadings(pageData);
  const brandTitle = general.title || 'GoSaaS Console';
  const headerLogo = publicAsset(general.common_header_logo || general.logo);
  const footerLogo = publicAsset(general.footer_logo || general.logo);
  const headerHref = publicHref(headings.header_btn_link, '/user/login');
  const headerText = headings.header_btn_text || 'Sign in';
  const primaryFooterLinks = readFooterLinks(headings, 'left_footer');
  const productFooterLinks = [
    ...readFooterLinks(headings, 'right_footer'),
    ...readFooterLinks(headings, 'middle_footer'),
  ];
  const socialLinks: string[] = Array.isArray(headings.footer_socials_links)
    ? headings.footer_socials_links.map(String)
    : [];
  const footerSocialIcons = pageData?.footer_socials_icons;
  const socialIcons: string[] = Array.isArray(footerSocialIcons)
    ? footerSocialIcons.map(String)
    : [];
  const scannerImage = publicAsset(pageData?.footer_scanner_image);
  const googleBadge = publicAsset(pageData?.footer_google_app_image);
  const appleBadge = publicAsset(pageData?.footer_apple_app_image);
  const googleHref = publicHref(headings.footer_google_play_app_link, '#');
  const appleHref = publicHref(headings.footer_apple_app_link, '#');

  return (
    <Layout className={styles.publicShell}>
      <Header className={styles.header}>
        <Link to="/" className={styles.brand}>
          {headerLogo ? (
            <img src={headerLogo} alt={brandTitle} className={styles.brandLogo} />
          ) : (
            <span className={styles.brandMark}>{String(brandTitle).slice(0, 1)}</span>
          )}
          <span className={styles.brandText}>{brandTitle}</span>
        </Link>
        <Space className={styles.nav} size={4}>
          {navItems.map((item) => {
            const active =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={active ? styles.navActive : styles.navLink}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </Space>
        <HeaderButton href={headerHref} text={headerText} />
      </Header>
      <Content className={styles.content}>{children}</Content>
      <Footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            {footerLogo ? (
              <img src={footerLogo} alt={brandTitle} className={styles.footerLogo} />
            ) : (
              <Typography.Title level={4}>{brandTitle}</Typography.Title>
            )}
            <Typography.Paragraph type="secondary">
              {headings.footer_short_title ||
                'Product operations, subscriptions, and payment activation in one public console.'}
            </Typography.Paragraph>
            {(scannerImage || headings.footer_scanner_title) && (
              <div className={styles.footerQr}>
                {scannerImage && <img src={scannerImage} alt="" />}
                <Typography.Text type="secondary">{headings.footer_scanner_title}</Typography.Text>
              </div>
            )}
            {(googleBadge || appleBadge) && (
              <Space wrap className={styles.footerBadgeRow}>
                {googleBadge && (
                  <a
                    href={googleHref}
                    target={isExternalHref(googleHref) ? '_blank' : undefined}
                    rel="noreferrer"
                  >
                    <img src={googleBadge} alt="Google Play" />
                  </a>
                )}
                {appleBadge && (
                  <a
                    href={appleHref}
                    target={isExternalHref(appleHref) ? '_blank' : undefined}
                    rel="noreferrer"
                  >
                    <img src={appleBadge} alt="App Store" />
                  </a>
                )}
              </Space>
            )}
          </div>
          {!!productFooterLinks.length && (
            <div className={styles.footerColumn}>
              <Typography.Text strong>{headings.middle_footer_title || 'Product'}</Typography.Text>
              <div className={styles.footerLinks}>
                {productFooterLinks.slice(0, 12).map((item) => (
                  <FooterAnchor key={`${item.label}-${item.href}`} {...item} />
                ))}
              </div>
            </div>
          )}
          {!!primaryFooterLinks.length && (
            <div className={styles.footerColumn}>
              <Typography.Text strong>{headings.right_footer_title || 'Company'}</Typography.Text>
              <div className={styles.footerLinks}>
                {primaryFooterLinks.map((item) => (
                  <FooterAnchor key={`${item.label}-${item.href}`} {...item} />
                ))}
              </div>
            </div>
          )}
          {!!socialLinks.length && (
            <div className={styles.footerColumn}>
              <Typography.Text strong>Channels</Typography.Text>
              <div className={styles.footerSocials}>
                {socialLinks.map((link: string, index: number) => {
                  const href = publicHref(link, '#');
                  const icon = publicAsset(socialIcons[index]);
                  return (
                    <a
                      href={href}
                      key={`${href}-${index}`}
                      target={isExternalHref(href) ? '_blank' : undefined}
                      rel="noreferrer"
                    >
                      {icon ? <img src={icon} alt="" /> : <span>{index + 1}</span>}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className={styles.footerCopyright}>
          <Typography.Text type="secondary">
            {general.copy_right || 'Product operations, subscriptions, and payments.'}
          </Typography.Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default PublicShell;
