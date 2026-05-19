import { useLocation, useParams } from '@umijs/max';
import { Alert, Button, Descriptions, Empty, Spin } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { normalizePayload, textValue } from '../content';
import PublicShell from '../PublicShell';
import { fetchPublicContent } from '../services';
import type { LegacyRecord } from '../types';

function userValue(transaction?: LegacyRecord, key?: string) {
  const user = transaction?.user;
  if (user && typeof user === 'object') {
    return textValue((user as LegacyRecord)[key || '']);
  }
  return '';
}

function receiptValue(value: unknown) {
  return textValue(value) || '-';
}

export default function TransactionReceipt() {
  const params = useParams();
  const location = useLocation();
  const [transaction, setTransaction] = useState<LegacyRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const id = textValue(params.id);
  const printMode = location.pathname.startsWith('/transactions-print/');
  const title = printMode ? 'Print Receipt' : 'Transaction Receipt';

  const endpoint = useMemo(() => {
    if (!id) {
      return '';
    }
    return `${printMode ? '/transactions-print' : '/transactions-download'}/${encodeURIComponent(
      id,
    )}`;
  }, [id, printMode]);

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      setError('Transaction id is required.');
      return;
    }
    setLoading(true);
    setError('');
    fetchPublicContent(endpoint)
      .then((response) => {
        const body = normalizePayload(response);
        const item = body.transaction || body.item;
        if (!item || typeof item !== 'object') {
          setTransaction(undefined);
          return;
        }
        setTransaction(item as LegacyRecord);
      })
      .catch((err) => setError(err?.message || 'Unable to load this receipt.'))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <PublicShell title={title} description={textValue(transaction?.tnxId)}>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {!transaction && !loading ? <Empty description="Receipt not found" /> : null}
        {transaction ? (
          <section className="public-receipt">
            <div className="public-receipt-actions">
              <Button icon={<ArrowLeftOutlined />} href="/transactions">
                Transactions
              </Button>
              <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
                Print
              </Button>
            </div>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
              <Descriptions.Item label="Transaction">
                {receiptValue(transaction.tnxId)}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                {receiptValue(transaction.type_name)}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                {receiptValue(transaction.amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Method">
                {receiptValue(transaction.payment_method)}
              </Descriptions.Item>
              <Descriptions.Item label="Purpose" span={2}>
                {receiptValue(transaction.purpose)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Time">
                {receiptValue(transaction.payment_time)}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {receiptValue(transaction.created_at_display || transaction.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Name">
                {receiptValue(userValue(transaction, 'name'))}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {receiptValue(userValue(transaction, 'email'))}
              </Descriptions.Item>
              <Descriptions.Item label="Billing Address" span={2}>
                {receiptValue(transaction.billing_address)}
              </Descriptions.Item>
            </Descriptions>
          </section>
        ) : null}
      </Spin>
    </PublicShell>
  );
}
