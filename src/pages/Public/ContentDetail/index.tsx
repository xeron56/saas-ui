import { Link, useLocation, useParams } from '@umijs/max';
import { sanitizeRichText } from '@/components/RichTextInput';
import { Alert, Button, Empty, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import {
  contentAuthor,
  contentCategory,
  contentImage,
  contentSummary,
  contentTitle,
  findDetailConfig,
  recordFromPayload,
  textValue,
} from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function ContentDetail() {
  const location = useLocation();
  const params = useParams();
  const config = useMemo(() => findDetailConfig(location.pathname), [location.pathname]);
  const [item, setItem] = useState<LegacyRecord | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const slug = params.slug || params.id;

  useEffect(() => {
    if (!config || !slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicContent(`${config.endpointBase}/${encodeURIComponent(slug)}`)
      .then((payload) => {
        setItem(recordFromPayload(payload, config.responseKey));
      })
      .catch((err) => {
        setError(err?.message || 'Unable to load content.');
      })
      .finally(() => setLoading(false));
  }, [config, slug]);

  const title = item ? contentTitle(item) : config?.title || 'Details';
  const image = contentImage(item);
  const category = contentCategory(item);
  const author = contentAuthor(item);
  const detailHTML = sanitizeRichText(
    textValue(item?.details ?? item?.description ?? item?.body ?? item?.job_context),
  );

  return (
    <PublicShell title={title} description={config?.title}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {!item && !loading ? <Empty /> : null}
        {item ? (
          <article className="public-detail">
            <div className="public-detail-media">
              {image ? <img src={image} alt={title} /> : null}
            </div>
            <div className="public-detail-body">
              {config?.listPath ? (
                <Link to={config.listPath}>
                  <Button icon={<ArrowLeftOutlined />}>Back</Button>
                </Link>
              ) : null}
              <h2>{title}</h2>
              <div className="public-meta">
                {textValue(item.date || item.created_at || item.application_deadline) ? (
                  <Tag icon={<CalendarOutlined />}>
                    {textValue(item.date || item.created_at || item.application_deadline)}
                  </Tag>
                ) : null}
                {textValue(item.location) ? (
                  <Tag icon={<EnvironmentOutlined />}>{textValue(item.location)}</Tag>
                ) : null}
                {category ? <Tag>{category}</Tag> : null}
                {author ? <Tag>{author}</Tag> : null}
              </div>
              {detailHTML ? (
                <div dangerouslySetInnerHTML={{ __html: detailHTML }} />
              ) : contentSummary(item) ? (
                <p>{contentSummary(item)}</p>
              ) : null}
              {textValue(item.price) ? (
                <p className="public-price">{textValue(item.price)}</p>
              ) : null}
              {config?.title === 'Event' ? (
                <Button
                  type="primary"
                  href={`/checkout?type=event&slug=${encodeURIComponent(textValue(slug))}`}
                >
                  Reserve
                </Button>
              ) : null}
            </div>
          </article>
        ) : null}
      </Spin>
    </PublicShell>
  );
}
