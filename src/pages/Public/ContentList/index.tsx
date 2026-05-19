import { Link, useLocation } from '@umijs/max';
import { Alert, Empty, Spin, Tag } from 'antd';
import { ArrowRightOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import {
  contentAuthor,
  contentCategory,
  contentImage,
  contentSlug,
  contentSummary,
  contentTitle,
  findListConfig,
  recordsFromPayload,
  textValue,
} from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function ContentList() {
  const location = useLocation();
  const config = useMemo(() => findListConfig(location.pathname), [location.pathname]);
  const [items, setItems] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicContent(config.endpoint)
      .then((payload) => {
        setItems(recordsFromPayload(payload, config.responseKey));
      })
      .catch((err) => {
        setError(err?.message || 'Unable to load content.');
      })
      .finally(() => setLoading(false));
  }, [config]);

  if (!config) {
    return (
      <PublicShell title="Content" description="This public route is not configured.">
        <Empty />
      </PublicShell>
    );
  }

  return (
    <PublicShell title={config.title} description={config.description}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {items.length === 0 && !loading ? <Empty /> : null}
        <div className="public-grid">
          {items.map((item, index) => {
            const image = contentImage(item);
            const slug = contentSlug(item);
            const title = contentTitle(item);
            const category = contentCategory(item);
            const author = contentAuthor(item);
            const href = config.detailBase && slug ? `${config.detailBase}/${slug}` : undefined;
            const body = (
              <>
                <div className="public-card-media">
                  {image ? <img src={image} alt={title} /> : title.slice(0, 1)}
                </div>
                <div className="public-card-body">
                  <h2>{title}</h2>
                  <div className="public-meta">
                    {config.dateKey && textValue(item[config.dateKey]) ? (
                      <Tag icon={<CalendarOutlined />}>{textValue(item[config.dateKey])}</Tag>
                    ) : null}
                    {textValue(item.location) ? (
                      <Tag icon={<EnvironmentOutlined />}>{textValue(item.location)}</Tag>
                    ) : null}
                    {category ? <Tag>{category}</Tag> : null}
                    {author ? <Tag>{author}</Tag> : null}
                  </div>
                  {contentSummary(item) ? <p>{contentSummary(item)}</p> : null}
                  {href ? (
                    <span>
                      View details <ArrowRightOutlined />
                    </span>
                  ) : null}
                </div>
              </>
            );
            if (href) {
              return (
                <Link className="public-card" key={slug || index} to={href}>
                  {body}
                </Link>
              );
            }
            return (
              <article className="public-card" key={slug || index}>
                {body}
              </article>
            );
          })}
        </div>
      </Spin>
    </PublicShell>
  );
}
