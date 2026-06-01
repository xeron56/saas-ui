import { history, useLocation, useParams } from '@umijs/max';
import React, { useEffect } from 'react';

const legacyAuthTargets: Record<string, string> = {
  '/login': '/user/login',
  '/register': '/user/register',
  '/forgot-password': '/user/forgot-password',
  '/reset-password': '/user/reset-password',
};

const LegacyRedirect: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ token?: string }>();

  useEffect(() => {
    const pathname = location.pathname.replace(/\/+$/, '') || '/';
    const targetPath = legacyAuthTargets[pathname] || '/user/reset-password';
    const search = new URLSearchParams(location.search);

    if (params.token && !search.get('token') && !search.get('reset_token')) {
      search.set('token', params.token);
    }

    const query = search.toString();
    history.replace(query ? `${targetPath}?${query}` : targetPath);
  }, [location.pathname, location.search, params.token]);

  return null;
};

export default LegacyRedirect;
