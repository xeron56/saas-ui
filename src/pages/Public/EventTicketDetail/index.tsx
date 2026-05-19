import { useParams } from '@umijs/max';
import { Alert, Button, Descriptions, Empty, Spin } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

function ticketValue(value: unknown) {
  return textValue(value) || '-';
}

export default function EventTicketDetail() {
  const params = useParams();
  const id = textValue(params.id);
  const [ticket, setTicket] = useState<LegacyRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Ticket id is required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicContent(`/event/single-ticket/${encodeURIComponent(id)}?ajax=1`)
      .then((response) => {
        const body = normalizePayload(response);
        const item = body.ticket;
        setTicket(item && typeof item === 'object' ? (item as LegacyRecord) : undefined);
      })
      .catch((err) => setError(err?.message || 'Unable to load ticket.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <PublicShell title="Event Ticket" description={textValue(ticket?.ticket_number)}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {!ticket && !loading ? <Empty description="Ticket not found" /> : null}
        {ticket ? (
          <section className="public-receipt">
            <div className="public-receipt-actions">
              <Button icon={<ArrowLeftOutlined />} href="/event/my-ticket">
                My Tickets
              </Button>
              <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
              </Button>
            </div>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Ticket">
                {ticketValue(ticket.ticket_number)}
              </Descriptions.Item>
              <Descriptions.Item label="Holder">{ticketValue(ticket.user_name)}</Descriptions.Item>
              <Descriptions.Item label="Event" span={2}>
                {ticketValue(ticket.event_title)}
              </Descriptions.Item>
              <Descriptions.Item label="Date">{ticketValue(ticket.event_date)}</Descriptions.Item>
              <Descriptions.Item label="Event ID">{ticketValue(ticket.event_id)}</Descriptions.Item>
            </Descriptions>
          </section>
        ) : null}
      </Spin>
    </PublicShell>
  );
}
