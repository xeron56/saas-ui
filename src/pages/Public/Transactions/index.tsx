import { Alert, Button, Space, Table } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { normalizePayload, recordsFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function Transactions() {
  const [rows, setRows] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPublicContent('/transactions?ajax=1')
      .then((response) => {
        const body = normalizePayload(response);
        setRows(recordsFromPayload(body, 'data'));
      })
      .catch((err) => setError(err?.message || 'Unable to load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell title="Transaction History" description="Payments and receipts for your account">
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Table
        rowKey={(record) => textValue(record.id) || textValue(record.tnxId)}
        loading={loading}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
        columns={[
          {
            title: 'Transaction',
            dataIndex: 'tnxId',
          },
          {
            title: 'Type',
            dataIndex: 'type_name',
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
          },
          {
            title: 'Method',
            dataIndex: 'payment_method',
          },
          {
            title: 'Purpose',
            dataIndex: 'purpose',
          },
          {
            title: 'Date',
            dataIndex: 'created_at',
          },
          {
            title: 'Receipt',
            key: 'receipt',
            render: (_, record) => {
              const id = encodeURIComponent(textValue(record.id));
              return (
                <Space wrap>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    href={`/transactions-download/${id}`}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    icon={<PrinterOutlined />}
                    href={`/transactions-print/${id}`}
                  >
                    Print
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />
    </PublicShell>
  );
}
