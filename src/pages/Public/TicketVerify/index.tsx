import { CheckCircleOutlined, CloseCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { Alert, Button, Descriptions, Empty, Result, Spin, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

function nestedRecord(value: unknown): LegacyRecord {
  return value && typeof value === 'object' ? (value as LegacyRecord) : {};
}

function displayValue(value: unknown) {
  return textValue(value) || '-';
}

export default function TicketVerify() {
  const params = useParams();
  const ticketNumber = textValue(params.ticket);
  const [payload, setPayload] = useState<LegacyRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticketNumber) {
      setError('Ticket number is required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicContent(`/ticket-verify/${encodeURIComponent(ticketNumber)}`)
      .then((response) => setPayload(normalizePayload(response)))
      .catch((err) => {
        setError(err?.message || 'Ticket could not be verified.');
        setPayload(undefined);
      })
      .finally(() => setLoading(false));
  }, [ticketNumber]);

  const ticket = useMemo(() => nestedRecord(payload?.ticket), [payload?.ticket]);
  const event = nestedRecord(ticket.event);
  const user = nestedRecord(ticket.user);
  const alumni = nestedRecord(user.alumni);
  const verified = payload?.success === true || textValue(payload?.success) === 'true';
  const title = verified ? 'Ticket Verified' : 'Ticket Not Verified';

  return (
    <PublicShell title={title} description={ticketNumber}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {!loading && !error && !verified ? (
          <Result
            status="error"
            icon={<CloseCircleOutlined />}
            title="Ticket not found"
            subTitle="The ticket number could not be verified for this tenant."
            extra={
              <Button type="primary" href="/" icon={<HomeOutlined />}>
                Home
              </Button>
            }
          />
        ) : null}
        {!loading && verified && Object.keys(ticket).length === 0 ? (
          <Empty description="Ticket details are unavailable" />
        ) : null}
        {verified && Object.keys(ticket).length > 0 ? (
          <section className="public-receipt">
            <div className="public-receipt-actions">
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Verified
              </Tag>
              <Button type="primary" href="/" icon={<HomeOutlined />}>
                Home
              </Button>
            </div>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Ticket">
                {displayValue(ticket.ticket_number || ticketNumber)}
              </Descriptions.Item>
              <Descriptions.Item label="Event">{displayValue(event.title)}</Descriptions.Item>
              <Descriptions.Item label="Event Date">
                {displayValue(event.date || ticket.event_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Holder">
                {displayValue(user.name || ticket.user_name)}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {displayValue(user.email || ticket.user_email)}
              </Descriptions.Item>
              <Descriptions.Item label="Company">
                {displayValue(alumni.company || ticket.alumni_company)}
              </Descriptions.Item>
              <Descriptions.Item label="Designation">
                {displayValue(alumni.company_designation || ticket.alumni_company_designation)}
              </Descriptions.Item>
              <Descriptions.Item label="Ticket ID">{displayValue(ticket.id)}</Descriptions.Item>
            </Descriptions>
          </section>
        ) : null}
      </Spin>
    </PublicShell>
  );
}
