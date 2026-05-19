import { useParams } from '@umijs/max';
import { sanitizeRichText } from '@/components/RichTextInput';
import { Alert, Button, Descriptions, Empty, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { contentSummary, normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

function eventValue(value: unknown) {
  return textValue(value) || '-';
}

export default function EventDetail() {
  const params = useParams();
  const slug = textValue(params.slug);
  const [event, setEvent] = useState<LegacyRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const descriptionHTML = sanitizeRichText(textValue(event?.description));

  useEffect(() => {
    if (!slug) {
      setError('Event slug is required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicContent(`/event/details/${encodeURIComponent(slug)}`)
      .then((response) => {
        const body = normalizePayload(response);
        const item = body.event || body.item;
        setEvent(item && typeof item === 'object' ? (item as LegacyRecord) : undefined);
      })
      .catch((err) => setError(err?.message || 'Unable to load event.'))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <PublicShell
      title={textValue(event?.title) || 'Event Details'}
      description={eventValue(event?.category_name)}
    >
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {!event && !loading ? <Empty description="Event not found" /> : null}
        {event ? (
          <section className="public-receipt">
            <div className="public-receipt-actions">
              <Button icon={<ArrowLeftOutlined />} href="/event/all-event">
                Events
              </Button>
              {Number(event.type || 0) === 2 ? (
                <Button
                  type="primary"
                  icon={<CreditCardOutlined />}
                  href={`/checkout?type=event&slug=${encodeURIComponent(slug)}`}
                >
                  Reserve
                </Button>
              ) : null}
            </div>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Date">{eventValue(event.date)}</Descriptions.Item>
              <Descriptions.Item label="Location">{eventValue(event.location)}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag>{Number(event.type || 0) === 2 ? 'Paid' : 'Free'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Price">{eventValue(event.price)}</Descriptions.Item>
              <Descriptions.Item label="Tickets Left">
                {eventValue(event.number_of_ticket_left)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Tickets">
                {eventValue(event.number_of_ticket)}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {descriptionHTML ? (
                  <div dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
                ) : (
                  contentSummary(event) || eventValue(event.description)
                )}
              </Descriptions.Item>
            </Descriptions>
          </section>
        ) : null}
      </Spin>
    </PublicShell>
  );
}
