import { useLocation } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Alert, Skeleton, Typography } from 'antd';
import React from 'react';
import { legalPageValue } from './helpers';
import PublicShell from './Shell';
import { getPublicDataDeletion, getPublicPrivacyPolicy, getPublicTermsConditions } from './service';
import styles from './style.less';

type LegalConfig = {
  title: string;
  body: string;
  request: () => ReturnType<typeof getPublicPrivacyPolicy>;
};

const legalConfigByPath = (pathname: string): LegalConfig => {
  if (pathname.includes('terms-conditions')) {
    return {
      title: 'Terms and conditions',
      body: 'Terms and conditions content is not published yet.',
      request: getPublicTermsConditions,
    };
  }
  if (pathname.includes('data-deletion')) {
    return {
      title: 'Data deletion instructions',
      body: 'For account or personal data deletion requests, contact support with the email address associated with your account.',
      request: getPublicDataDeletion,
    };
  }
  return {
    title: 'Privacy policy',
    body: 'Privacy policy content is not published yet.',
    request: getPublicPrivacyPolicy,
  };
};

const LegalPage: React.FC = () => {
  const location = useLocation();
  const config = legalConfigByPath(location.pathname);
  const { data, loading, error } = useRequest(config.request, {
    refreshDeps: [location.pathname],
    onError: () => undefined,
  });
  const value = legalPageValue(data?.data);
  const title = value.title || value.privacy_title || value.term_title || config.title;
  const body = value.body || value.description_one || value.description_two || config.body;

  return (
    <PublicShell>
      <section className={styles.pageHero}>
        <Typography.Title>{title}</Typography.Title>
      </section>
      {error && (
        <Alert
          type="warning"
          showIcon
          message="This page is temporarily unavailable."
          style={{ marginBottom: 24 }}
        />
      )}
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <article className={styles.legalBody}>
          <Typography.Paragraph className={styles.preWrap}>{body}</Typography.Paragraph>
        </article>
      )}
    </PublicShell>
  );
};

export default LegalPage;
