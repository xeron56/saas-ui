import { Alert, Button, Empty, Spin, Tag } from 'antd';
import { CalendarOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { contentSummary, normalizePayload, recordsFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function Subscription() {
  const [packages, setPackages] = useState<LegacyRecord[]>([]);
  const [currentPackage, setCurrentPackage] = useState<LegacyRecord | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPublicContent('/subscription')
      .then((response) => {
        const body = normalizePayload(response);
        setPackages(recordsFromPayload(body, 'packages'));
        setCurrentPackage(body.currentPackage);
      })
      .catch((err) => setError(err?.message || 'Unable to load subscriptions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell title="Subscription" description="Tenant package options">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {currentPackage ? (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 18 }}
            message={`Current package #${textValue(currentPackage.package_id)}`}
          />
        ) : null}
        {packages.length === 0 && !loading ? <Empty /> : null}
        <div className="public-grid">
          {packages.map((item) => {
            const id = textValue(item.id);
            const name = textValue(item.name) || 'Package';
            return (
              <article className="public-card public-package-card" key={id}>
                <div className="public-card-body">
                  <h2>{name}</h2>
                  {contentSummary(item) ? <p>{contentSummary(item)}</p> : null}
                  <div className="public-package-prices">
                    <Tag icon={<CalendarOutlined />}>Monthly {textValue(item.monthly_price)}</Tag>
                    <Tag icon={<CalendarOutlined />}>Yearly {textValue(item.yearly_price)}</Tag>
                  </div>
                  <div className="public-card-actions">
                    <Button
                      type="primary"
                      href={`/subscription/checkout?id=${encodeURIComponent(
                        id,
                      )}&subscription_type=1`}
                      icon={<CreditCardOutlined />}
                    >
                      Monthly
                    </Button>
                    <Button
                      href={`/subscription/checkout?id=${encodeURIComponent(
                        id,
                      )}&subscription_type=2`}
                      icon={<CreditCardOutlined />}
                    >
                      Yearly
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Spin>
    </PublicShell>
  );
}
