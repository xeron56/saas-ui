import { isPublicPath } from '../auth';

jest.mock('@gosaas/api', () => ({
  AuthWebApi: jest.fn(),
}));

test('treats public payment status routes as unauthenticated pages', () => {
  expect(isPublicPath('/payment/success')).toBe(true);
  expect(isPublicPath('/payment/failed')).toBe(true);
  expect(isPublicPath('/order-status')).toBe(true);
  expect(isPublicPath('/order-status/')).toBe(true);
});

test('treats public SSLCommerz checkout routes as unauthenticated pages', () => {
  expect(isPublicPath('/checkout/sslcommerz/basic/business_1')).toBe(true);
  expect(isPublicPath('/checkout/sslcommerz/basic/business_1/')).toBe(true);
  expect(isPublicPath('/payments-gateways/basic/business_1')).toBe(true);
  expect(isPublicPath('/payments-gateways/basic/business_1/')).toBe(true);
});
