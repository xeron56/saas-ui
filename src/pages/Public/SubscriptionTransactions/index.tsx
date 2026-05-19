import { Alert, Table } from 'antd';
import { useEffect, useState } from 'react';
import { normalizePayload, recordsFromPayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

export default function SubscriptionTransactions() {
  const [rows, setRows] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPublicContent('/subscription/transaction-list?ajax=1')
      .then((response) => {
        const body = normalizePayload(response);
        setRows(recordsFromPayload(body, 'data'));
      })
      .catch((err) => setError(err?.message || 'Unable to load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicShell title="Subscription Transactions" description="Subscription payment history">
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
            title: 'User',
            dataIndex: 'user',
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
        ]}
      />
    </PublicShell>
  );
}
