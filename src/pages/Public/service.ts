import { request } from '@umijs/max';
import { ErrorShowType } from '@/utils/errors';
import type {
  CheckoutReply,
  PublicBlogCommentStoreReply,
  PublicBlogReply,
  PublicBlogsReply,
  PaymentMethodsReply,
  PublicContactReply,
  PublicContactStoreReply,
  PublicGeneralPageReply,
  PublicHomeReply,
  PublicPlansReply,
  PublicShellReply,
  SslcommerzOrderStatusReply,
} from './types';

const silentGet = { method: 'GET', showType: ErrorShowType.SILENT } as const;

export async function getPublicHome() {
  return request<PublicHomeReply>(
    '/v1/public-site/home',
    silentGet as any,
  ) as unknown as Promise<PublicHomeReply>;
}

export async function getPublicShell() {
  return request<PublicShellReply>(
    '/v1/public-site/shell',
    silentGet as any,
  ) as unknown as Promise<PublicShellReply>;
}

export async function getPublicContact() {
  return request<PublicContactReply>(
    '/v1/public-site/contact',
    silentGet as any,
  ) as unknown as Promise<PublicContactReply>;
}

export async function sendPublicContact(data: Record<string, unknown>) {
  return request<PublicContactStoreReply>('/v1/public-site/contact', { method: 'POST', data });
}

export async function getPublicAbout() {
  return request<PublicGeneralPageReply>(
    '/v1/public-site/about',
    silentGet as any,
  ) as unknown as Promise<PublicGeneralPageReply>;
}

export async function getPublicBlogs(params?: Record<string, unknown>) {
  return request<PublicBlogsReply>('/v1/public-site/blogs', {
    ...silentGet,
    params,
  } as any) as unknown as Promise<PublicBlogsReply>;
}

export async function getPublicBlog(slug: string) {
  return request<PublicBlogReply>(`/v1/public-site/blogs/${encodeURIComponent(slug)}`, {
    ...silentGet,
  } as any) as unknown as Promise<PublicBlogReply>;
}

export async function sendPublicBlogComment(slug: string, data: Record<string, unknown>) {
  return request<PublicBlogCommentStoreReply>(
    `/v1/public-site/blogs/${encodeURIComponent(slug)}/comments`,
    {
      method: 'POST',
      data,
    },
  );
}

export async function getPublicPrivacyPolicy() {
  return request<PublicGeneralPageReply>(
    '/v1/public-site/privacy-policy',
    silentGet as any,
  ) as unknown as Promise<PublicGeneralPageReply>;
}

export async function getPublicTermsConditions() {
  return request<PublicGeneralPageReply>(
    '/v1/public-site/terms-conditions',
    silentGet as any,
  ) as unknown as Promise<PublicGeneralPageReply>;
}

export async function getPublicDataDeletion() {
  return request<PublicGeneralPageReply>(
    '/v1/public-site/data-deletion',
    silentGet as any,
  ) as unknown as Promise<PublicGeneralPageReply>;
}

export async function getAvailablePlans() {
  return request<PublicPlansReply>(
    '/v1/saas/plans/public',
    silentGet as any,
  ) as unknown as Promise<PublicPlansReply>;
}

export async function getPaymentMethods() {
  return request<PaymentMethodsReply>(
    '/v1/payment/methods',
    silentGet as any,
  ) as unknown as Promise<PaymentMethodsReply>;
}

export async function startSslcommerzCheckout(data: Record<string, unknown>) {
  return request<CheckoutReply>('/v1/saas/public-checkouts/sslcommerz', { method: 'POST', data });
}

export async function getSslcommerzOrderStatus(params: Record<string, unknown>) {
  return request<SslcommerzOrderStatusReply>('/v1/payment/sslcommerz/order-status', {
    ...silentGet,
    params,
  } as any) as unknown as Promise<SslcommerzOrderStatusReply>;
}
