import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useLocation } from '@umijs/max';
import SubscriptionOrderPage from '..';
import * as service from '../service';

jest.mock('@umijs/max', () => {
  const React = require('react');
  return {
    useLocation: jest.fn(),
    useIntl: () => ({
      formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id: string }) =>
        defaultMessage || id,
    }),
    FormattedMessage: ({ defaultMessage, id }: { defaultMessage?: string; id: string }) =>
      React.createElement(React.Fragment, null, defaultMessage || id),
  };
});

jest.mock('@ant-design/pro-components', () => {
  const React = require('react');
  const readValue = (record: Record<string, unknown>, path?: string | string[]) => {
    if (!path) {
      return undefined;
    }
    const parts = Array.isArray(path) ? path : [path];
    return parts.reduce<unknown>(
      (value, key) =>
        value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined,
      record,
    );
  };
  return {
    PageContainer: ({ children }: any) => React.createElement('section', null, children),
    ProTable: ({ actionRef, columns, request }: any) => {
      const [rows, setRows] = React.useState([]);
      const load = React.useCallback(async () => {
        const resp = await request({ current: 1, pageSize: 10 });
        setRows(resp.data || []);
      }, [request]);
      React.useEffect(() => {
        if (actionRef) {
          actionRef.current = { reload: load };
        }
        load();
      }, [actionRef, load]);
      return React.createElement(
        'div',
        { 'data-testid': 'subscription-order-table' },
        rows.map((row) =>
          React.createElement(
            'div',
            { key: row.id },
            columns.map((column: any, index: number) => {
              const value = readValue(row, column.dataIndex);
              const content = column.render
                ? column.render(value, row, index)
                : column.renderText
                ? column.renderText(value, row, index)
                : value;
              return React.createElement('div', { key: column.dataIndex || index }, content);
            }),
          ),
        ),
      );
    },
    ProDescriptions: ({ columns, dataSource, title }: any) =>
      React.createElement(
        'section',
        { 'aria-label': title },
        React.createElement('h2', null, title),
        columns.map((column: any, index: number) => {
          const value = readValue(dataSource || {}, column.dataIndex);
          const content = column.render
            ? column.render(value, dataSource)
            : column.renderText
            ? column.renderText(value, dataSource)
            : value;
          return React.createElement('div', { key: column.dataIndex || index }, content || '-');
        }),
      ),
  };
});

jest.mock('../service', () => ({
  getSubscriptionOrderInvoice: jest.fn(),
  listSubscriptionOrders: jest.fn(),
  listSubscriptionReports: jest.fn(),
  markSubscriptionOrderPaid: jest.fn(),
  rejectSubscriptionOrder: jest.fn(),
}));

const mockUseLocation = useLocation as jest.Mock;

const pendingOrder = {
  id: 'order_1',
  payment_status: 'unpaid',
  tenant: { display_name: 'Acme Retail' },
  plan: { display_name: 'Starter Retail' },
  gateway: { display_name: 'SSLCommerz' },
  amount_text: 'BDT 1250.00',
  duration_days: 30,
  created_at: '2026-05-24T10:00:00Z',
};

beforeEach(() => {
  mockUseLocation.mockReturnValue({ pathname: '/payment/subscriptions', search: '' });
  (service.listSubscriptionOrders as jest.Mock).mockResolvedValue({
    data: [pendingOrder],
    meta: { total: 1 },
  });
  (service.listSubscriptionReports as jest.Mock).mockResolvedValue({
    data: [],
    meta: { total: 0 },
  });
  (service.getSubscriptionOrderInvoice as jest.Mock).mockResolvedValue({
    data: {
      subscriber: pendingOrder,
      invoice: {
        started_at: '2026-05-24T10:00:00Z',
        ends_at: '2026-06-23T10:00:00Z',
      },
    },
  });
  (service.markSubscriptionOrderPaid as jest.Mock).mockResolvedValue({ message: 'updated' });
  (service.rejectSubscriptionOrder as jest.Mock).mockResolvedValue({ message: 'updated' });
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

test('renders subscription order invoice and submits migrated admin actions', async () => {
  render(React.createElement(SubscriptionOrderPage));

  await screen.findByText('Acme Retail');
  expect(screen.getByText('Starter Retail')).toBeTruthy();
  expect(screen.getByText('pending_review')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: /invoice/i }));
  await waitFor(() => {
    expect(service.getSubscriptionOrderInvoice).toHaveBeenCalledWith('order_1');
  });
  await screen.findByRole('heading', { name: 'Invoice' });
  expect(screen.getAllByText('BDT 1250.00').length).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole('button', { name: /mark paid/i }));
  fireEvent.change(screen.getByLabelText('Notes'), {
    target: { value: 'Payment verified from SSLCommerz' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  await waitFor(() => {
    expect(service.markSubscriptionOrderPaid).toHaveBeenCalledWith('order_1', {
      notes: 'Payment verified from SSLCommerz',
    });
  });

  fireEvent.click(screen.getByRole('button', { name: /reject/i }));
  fireEvent.change(screen.getByLabelText('Notes'), {
    target: { value: 'Gateway proof rejected' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  await waitFor(() => {
    expect(service.rejectSubscriptionOrder).toHaveBeenCalledWith('order_1', {
      notes: 'Gateway proof rejected',
    });
  });
});
