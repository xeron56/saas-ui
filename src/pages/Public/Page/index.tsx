import { useParams } from '@umijs/max';
import { Empty, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function PublicPage() {
  const params = useParams();
  const slug = params.slug || params.id || '';
  const [page, setPage] = useState<LegacyRecord>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    fetchPublicContent(`/page/${encodeURIComponent(slug)}`)
      .then((payload) => setPage(normalizePayload(payload)))
      .finally(() => setLoading(false));
  }, [slug]);

  const title = textValue(page?.pageTitle || page?.title) || slug.replace(/_/g, ' ');
  const description = textValue(page?.description || page?.item?.description);

  return (
    <PublicShell title={title}>
      <Spin spinning={loading}>
        {loading ? null : !description ? (
          <Empty />
        ) : (
          <article className="public-detail-body">
            <p>{description}</p>
          </article>
        )}
      </Spin>
    </PublicShell>
  );
}
