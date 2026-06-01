import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import OrderStatus from '../OrderStatus';
import PaymentFailed from '../PaymentFailed';
import PaymentSuccess from '../PaymentSuccess';

const mockRequest = jest.fn();

let mockLocation = {
  pathname: '/payment/success',
  search: '',
};

jest.mock('@umijs/max', () => {
  const React = require('react');
  return {
    request: (...args: unknown[]) => mockRequest(...args),
    useLocation: () => mockLocation,
    Link: (props: any) => React.createElement('a', { href: props.to }, props.children),
  };
});

jest.mock('../Shell', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('div', null, props.children),
  };
});

afterEach(() => {
  cleanup();
  mockLocation = {
    pathname: '/payment/success',
    search: '',
  };
  mockRequest.mockReset();
});

const mockStatusRequest = (data: Record<string, unknown>) => {
  mockRequest.mockImplementation((url: string, options?: { params?: Record<string, unknown> }) => {
    if (url === '/v1/payment/sslcommerz/order-status') {
      return Promise.resolve({ data });
    }
    return Promise.reject(new Error(`unexpected request: ${url} ${JSON.stringify(options)}`));
  });
};

test('renders SSLCommerz success from backend status and preserves order-status link', async () => {
  mockLocation = {
    pathname: '/payment/success',
    search: '?tran_id=SSL-123&status=failed&amount=1.00&currency=USD',
  };
  mockStatusRequest({
    order_id: 'order_123',
    transaction_id: 'SSL-123',
    status: 'paid',
    amount_text: 'BDT 125.50',
    currency_code: 'BDT',
  });

  render(React.createElement(PaymentSuccess));

  await screen.findByText('Current status: Paid');
  expect(screen.getByText('Payment completed')).toBeTruthy();
  expect(screen.getByText('Reference: order_123')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'View order status' }).getAttribute('href')).toBe(
    '/order-status?tran_id=SSL-123&status=failed&amount=1.00&currency=USD',
  );
  expect(mockRequest).toHaveBeenCalledWith(
    '/v1/payment/sslcommerz/order-status',
    expect.objectContaining({
      params: { order_id: undefined, transaction_id: 'SSL-123' },
    }),
  );
});

test('renders SSLCommerz failure page from backend status and callback reason', async () => {
  mockLocation = {
    pathname: '/payment/failed',
    search: '?tran_id=SSL-123&reason=Card%20declined&status=success',
  };
  mockStatusRequest({
    order_id: 'order_123',
    transaction_id: 'SSL-123',
    status: 'pending',
    amount_text: 'BDT 125.50',
    currency_code: 'BDT',
  });

  render(React.createElement(PaymentFailed));

  await screen.findByText('Current status: Pending');
  expect(screen.getByText('Payment not completed')).toBeTruthy();
  expect(screen.getByText('Card declined')).toBeTruthy();
});

test('renders order status details from backend status instead of callback query', async () => {
  mockLocation = {
    pathname: '/order-status',
    search: '?tran_id=SSL-123&payment_status=FAILED&total_amount=1.00&currency_code=USD',
  };
  mockStatusRequest({
    order_id: 'order_123',
    transaction_id: 'SSL-123',
    status: 'paid',
    amount_text: 'BDT 125.50',
    currency_code: 'BDT',
    paid_time: '2026-05-25T12:00:00Z',
  });

  render(React.createElement(OrderStatus));

  await screen.findByText('Paid');
  expect(screen.getByText('SSL-123')).toBeTruthy();
  expect(screen.getByText('order_123')).toBeTruthy();
  expect(screen.getByText('BDT 125.50')).toBeTruthy();
  expect(screen.getByText('BDT')).toBeTruthy();
  expect(screen.getByText('2026-05-25T12:00:00Z')).toBeTruthy();
  expect(screen.queryByText('FAILED')).toBeNull();
  expect(screen.queryByText('USD')).toBeNull();
});

test('renders empty order status state without callback reference', () => {
  mockLocation = {
    pathname: '/order-status',
    search: '',
  };

  render(React.createElement(OrderStatus));

  expect(screen.getByText('No order reference was provided.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'View plans' }).getAttribute('href')).toBe('/plans');
  expect(mockRequest).not.toHaveBeenCalled();
});
