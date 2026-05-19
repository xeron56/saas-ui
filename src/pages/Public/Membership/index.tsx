import { useLocation } from '@umijs/max';
import { Button, Empty, Spin } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import {
  contentImage,
  contentSummary,
  contentTitle,
  recordsFromPayload,
  textValue,
} from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function Membership() {
  const location = useLocation();
  const [items, setItems] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const packageRoute = location.pathname.replace(/\/$/, '') === '/membership-package';

  useEffect(() => {
    setLoading(true);
    fetchPublicContent(packageRoute ? '/membership-package' : '/all-membership')
      .then((payload) => setItems(recordsFromPayload(payload, 'all_membership')))
      .finally(() => setLoading(false));
  }, [packageRoute]);

  return (
    <PublicShell
      title={packageRoute ? 'Membership Package' : 'Membership'}
      description="Available membership plans for this tenant."
    >
      <Spin spinning={loading}>
        {items.length === 0 && !loading ? <Empty /> : null}
        <div className="public-grid">
          {items.map((item, index) => {
            const image = contentImage(item);
            const title = contentTitle(item);
            return (
              <article className="public-card" key={textValue(item.id) || index}>
                <div className="public-card-media">
                  {image ? <img src={image} alt={title} /> : title.slice(0, 1)}
                </div>
                <div className="public-card-body">
                  <h2>{title}</h2>
                  {textValue(item.price) ? (
                    <p className="public-price">{textValue(item.price)}</p>
                  ) : null}
                  {contentSummary(item) ? <p>{contentSummary(item)}</p> : null}
                  <Button
                    type="primary"
                    href={`/checkout?type=membership&slug=${encodeURIComponent(
                      textValue(item.slug) || textValue(item.id),
                    )}`}
                    icon={<ArrowRightOutlined />}
                  >
                    Join
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </Spin>
    </PublicShell>
  );
}
