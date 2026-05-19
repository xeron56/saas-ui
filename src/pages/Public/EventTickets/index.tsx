import { Button, Table, Alert } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { normalizePayload, recordsFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function EventTickets() {
  const [rows, setRows] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPublicContent('/event/my-ticket?ajax=1')
      .then((response) => {
        const body = normalizePayload(response);
        setRows(recordsFromPayload(body, 'data'));
      })
      .catch((err) => setError(err?.message || 'Unable to load tickets.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell title="My Tickets" description="Purchased event tickets">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table
        rowKey={(record) => textValue(record.id) || textValue(record.ticket_number)}
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: 'Ticket',
            dataIndex: 'ticket_number',
          },
          {
            title: 'Event',
            dataIndex: 'event_title',
          },
          {
            title: 'Date',
            dataIndex: 'event_date',
          },
          {
            title: 'Location',
            dataIndex: 'event_location',
          },
          {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
              <Button
                size="small"
                icon={<EyeOutlined />}
                href={`/event/single-ticket/${encodeURIComponent(textValue(record.id))}`}
              >
                View
              </Button>
            ),
          },
        ]}
      />
    </PublicShell>
  );
}
