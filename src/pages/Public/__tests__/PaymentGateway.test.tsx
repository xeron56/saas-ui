import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import PaymentGateway from '../PaymentGateway';

const mockRequest = jest.fn();

jest.mock('@umijs/max', () => ({
  request: (...args: unknown[]) => mockRequest(...args),
  useLocation: () => ({
    pathname: '/checkout/sslcommerz/basic/business_1',
    search: '?checkout_token=checkout_123',
  }),
  useParams: () => ({
    planId: 'basic',
    businessId: 'business_1',
  }),
}));

jest.mock('../Shell', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props: any) => React.createElement('div', null, props.children),
  };
});

const publicPlan = {
  key: 'basic',
  displayName: 'Basic',
  duration: 30,
  prices: [
    {
      id: 'price_basic',
      default: { text: 'BDT 125.50' },
      currencyCode: 'BDT',
    },
  ],
};

let assignSpy: jest.Mock;
let originalLocation: Location;

beforeAll(() => {
  originalLocation = window.location;
  assignSpy = jest.fn();
  delete (window as unknown as { location?: Location }).location;
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      ...originalLocation,
      assign: assignSpy,
    },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  });
});

afterEach(() => {
  cleanup();
  mockRequest.mockReset();
  assignSpy.mockReset();
});

const mockPaymentGatewayRequests = (checkoutReply?: Record<string, unknown>) => {
  mockRequest.mockImplementation((url: string, options?: { method?: string }) => {
    if (url === '/v1/saas/plans/public') {
      return Promise.resolve({ data: [publicPlan] });
    }
    if (url === '/v1/payment/methods') {
      return Promise.resolve({ methods: [{ name: 'sslcommerz' }] });
    }
    if (url === '/v1/saas/public-checkouts/sslcommerz' && options?.method === 'POST') {
      return Promise.resolve(checkoutReply ?? { redirect: 'https://sandbox.sslcommerz.com/pay' });
    }
    return Promise.reject(new Error(`unexpected request: ${url}`));
  });
};

test('starts SSLCommerz checkout through the canonical public checkout API', async () => {
  mockPaymentGatewayRequests({
    redirect_url: 'https://sandbox.sslcommerz.com/gwprocess/v4/gw.php',
  });

  render(React.createElement(PaymentGateway));

  await screen.findByText('Basic');
  const button = screen.getByRole('button', {
    name: /continue to sslcommerz/i,
  }) as HTMLButtonElement;
  await waitFor(() => {
    expect(button.disabled).toBe(false);
  });

  fireEvent.change(screen.getByLabelText('Phone'), {
    target: { value: '01700000000' },
  });
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Amina Merchant' },
  });
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'amina@example.test' },
  });
  fireEvent.click(button);

  await waitFor(() => {
    expect(assignSpy).toHaveBeenCalledWith('https://sandbox.sslcommerz.com/gwprocess/v4/gw.php');
  });
  const postCall = mockRequest.mock.calls.find(
    ([url]) => url === '/v1/saas/public-checkouts/sslcommerz',
  );
  expect(postCall).toBeTruthy();
  expect(postCall?.[1]).toMatchObject({
    method: 'POST',
    data: {
      plan_key: 'basic',
      plan_id: 'basic',
      business_id: 'business_1',
      tenant_id: 'business_1',
      price_id: 'price_basic',
      currency_code: 'BDT',
      quantity: 1,
      platform: 'web',
      phone: '01700000000',
      customer_name: 'Amina Merchant',
      customer_email: 'amina@example.test',
      customer_phone: '01700000000',
      customer_city: 'Dhaka',
      customer_country: 'Bangladesh',
      checkout_token: 'checkout_123',
    },
  });
});

test('disables checkout when SSLCommerz is not available', async () => {
  mockRequest.mockImplementation((url: string) => {
    if (url === '/v1/saas/plans/public') {
      return Promise.resolve({ data: [publicPlan] });
    }
    if (url === '/v1/payment/methods') {
      return Promise.resolve({ methods: [] });
    }
    return Promise.reject(new Error(`unexpected request: ${url}`));
  });

  render(React.createElement(PaymentGateway));

  await screen.findByText('SSLCommerz checkout is not available.');
  const button = screen.getByRole('button', {
    name: /continue to sslcommerz/i,
  }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  expect(
    mockRequest.mock.calls.some(([url]) => url === '/v1/saas/public-checkouts/sslcommerz'),
  ).toBe(false);
});
