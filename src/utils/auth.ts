import { AuthWebApi } from '@gosaas/api';
import { stringify } from 'querystring';

const donnotneedauthpath = [
  '/',
  '/plans',
  '/about-us',
  '/blogs',
  '/privacy-policy',
  '/terms-conditions',
  '/data-deletion',
  '/contact-us',
  '/payment/success',
  '/payment/failed',
  '/order-status',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/user/login',
  '/user/register',
  '/user/forgot-password',
  '/user/reset-password',
];

const dynamicPublicPathPatterns = [
  /^\/checkout\/sslcommerz\/[^/]+\/[^/]+\/?$/,
  /^\/payments-gateways\/[^/]+\/[^/]+\/?$/,
  /^\/blogs\/[^/]+\/?$/,
  /^\/reset-password\/[^/]+\/?$/,
];

export const isPublicPath = (pathname: string) => {
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return (
    donnotneedauthpath.includes(cleanPath) ||
    dynamicPublicPathPatterns.some((pattern) => pattern.test(cleanPath))
  );
};
/**
 * 退出登录，并且将当前的 url 保存
 */
export const loginOut = async () => {
  const { search, pathname } = window.location;

  if (isPublicPath(pathname)) {
    return;
  }

  await new AuthWebApi().authWebWebLogout({ body: {} });

  const urlParams = new URL(window.location.href).searchParams;
  /** 此方法会跳转到 redirect 参数所在的位置 */
  const redirect = urlParams.get('redirect');
  // Note: There may be security issues, please note

  //TODO validating search
  let newSearch = '';
  if (pathname !== '/user/login') {
    newSearch = stringify({
      redirect: pathname + search,
    });
  }

  if (!redirect) {
    // history.replace({
    //   pathname: '/user/login',
    //   search: newSearch,
    // });
    const currentPath = window.location + '';

    const url = new URL(currentPath);
    url.pathname = '/user/login';
    url.search = newSearch;
    window.location.replace(url.href);
  }
};
