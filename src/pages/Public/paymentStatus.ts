import { useEffect, useMemo, useState } from 'react';
import { getSslcommerzOrderStatus } from './service';
import type { SslcommerzOrderStatus } from './types';

export type PaymentStatusLookup = {
  order_id?: string;
  transaction_id?: string;
};

export const paymentStatusLookupFromSearch = (search: string): PaymentStatusLookup => {
  const query = new URLSearchParams(search);
  return {
    order_id: query.get('order_id') ?? query.get('orderId') ?? undefined,
    transaction_id: query.get('transaction_id') ?? query.get('tran_id') ?? undefined,
  };
};

export const paymentStatusReference = (
  lookup: PaymentStatusLookup,
  status?: SslcommerzOrderStatus,
) => status?.order_id ?? lookup.order_id ?? status?.transaction_id ?? lookup.transaction_id ?? '';

export const paymentStatusLabel = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'refunding':
      return 'Refunding';
    case 'refunded':
      return 'Refunded';
    case 'expired':
      return 'Expired';
    default:
      return status || 'Pending';
  }
};

export const paymentResultStatus = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'paid':
      return 'success';
    case 'expired':
    case 'refunded':
      return 'error';
    default:
      return 'info';
  }
};

export const paymentAmountText = (status?: SslcommerzOrderStatus) =>
  status?.amount_text ||
  (status?.amount_decimal && status?.currency_code
    ? `${status.currency_code} ${status.amount_decimal}`
    : '');

export const useSslcommerzOrderStatus = (search: string) => {
  const lookup = useMemo(() => paymentStatusLookupFromSearch(search), [search]);
  const [status, setStatus] = useState<SslcommerzOrderStatus | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setStatus(undefined);
    setError(false);
    if (!lookup.transaction_id) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    setLoading(true);
    getSslcommerzOrderStatus(lookup)
      .then((reply) => {
        if (active) {
          setStatus(reply.data);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [lookup]);

  return { error, loading, lookup, status };
};
