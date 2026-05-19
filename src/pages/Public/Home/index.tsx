import { Link } from '@umijs/max';
import { Alert, Button, Empty, Spin, Statistic, Tag } from 'antd';
import {
  ArrowRightOutlined,
  BankOutlined,
  CalendarOutlined,
  IdcardOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import {
  contentAuthor,
  contentCategory,
  contentImage,
  contentSlug,
  contentSummary,
  contentTitle,
  normalizePayload,
  recordsFromPayload,
  textValue,
} from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

type HomePayload = LegacyRecord;

function FeaturedGrid({
  title,
  items,
  listPath,
  detailBase,
}: {
  title: string;
  items: LegacyRecord[];
  listPath?: string;
  detailBase?: string;
}) {
  return (
    <section className="public-section">
      <div className="public-section-heading">
        <h2>{title}</h2>
        {listPath ? (
          <Link to={listPath}>
            View all <ArrowRightOutlined />
          </Link>
        ) : null}
      </div>
      {items.length === 0 ? <Empty /> : null}
      <div className="public-grid">
        {items.map((item, index) => {
          const image = contentImage(item);
          const itemTitle = contentTitle(item);
          const slug = contentSlug(item);
          const category = contentCategory(item);
          const author = contentAuthor(item);
          const href = detailBase && slug ? `${detailBase}/${slug}` : undefined;
          const body = (
            <>
              <div className="public-card-media">
                {image ? <img src={image} alt={itemTitle} /> : itemTitle.slice(0, 1)}
              </div>
              <div className="public-card-body">
                <h2>{itemTitle}</h2>
                {category || author ? (
                  <div className="public-meta">
                    {category ? <Tag>{category}</Tag> : null}
                    {author ? <Tag>{author}</Tag> : null}
                  </div>
                ) : null}
                {contentSummary(item) ? <p>{contentSummary(item)}</p> : null}
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
    </section>
  );
}

export default function Home() {
  const [payload, setPayload] = useState<HomePayload>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPublicContent('/')
      .then((data) => setPayload(normalizePayload(data)))
      .catch((err) => setError(err?.message || 'Unable to load homepage.'))
      .finally(() => setLoading(false));
  }, []);

  const upcomingEvents = recordsFromPayload(payload, 'upcomingEvents');
  const stories = recordsFromPayload(payload, 'stories');
  const news = recordsFromPayload(payload, 'news');
  const alumni = recordsFromPayload(payload, 'alumnus');
  const galleries = recordsFromPayload(payload, 'photoGalleries');
  const committeeCategory = recordsFromPayload(payload, 'committeeCategory');

  return (
    <PublicShell
      title="Alumni Portal"
      description="Events, stories, notices, jobs, memberships, and alumni updates for this tenant."
    >
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        <section className="public-stats">
          <Statistic
            title="Alumni"
            value={Number(payload.totalAlumni || 0)}
            prefix={<TeamOutlined />}
          />
          <Statistic
            title="Departments"
            value={Number(payload.totalDepartments || 0)}
            prefix={<BankOutlined />}
          />
          <Statistic
            title="Sessions"
            value={Number(payload.totalSessions || 0)}
            prefix={<CalendarOutlined />}
          />
          <Statistic
            title="Committees"
            value={committeeCategory.length}
            prefix={<IdcardOutlined />}
          />
        </section>
        <FeaturedGrid
          title="Upcoming Events"
          items={upcomingEvents}
          listPath="/all-event"
          detailBase="/event-view-details"
        />
        <FeaturedGrid
          title="Stories"
          items={stories}
          listPath="/all-stories"
          detailBase="/view-stories"
        />
        <FeaturedGrid
          title="News"
          items={news}
          listPath="/our-news"
          detailBase="/news-view-details"
        />
        <FeaturedGrid
          title="Alumni"
          items={alumni}
          listPath="/all-alumni"
          detailBase="/alumni/profile"
        />
        <FeaturedGrid title="Photo Galleries" items={galleries} />
        <div className="public-home-actions">
          <Button type="primary" href="/all-membership" icon={<ArrowRightOutlined />}>
            Membership
          </Button>
          <Button href="/contact-us">Contact</Button>
          {textValue(payload.title) ? <span>{textValue(payload.title)}</span> : null}
        </div>
      </Spin>
    </PublicShell>
  );
}
