import { history, useLocation, useParams } from '@umijs/max';
import React, { useEffect } from 'react';

const LegacyPaymentGatewayRedirect: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ planId?: string; businessId?: string }>();

  useEffect(() => {
    const planId = encodeURIComponent(params.planId ?? '');
    const businessId = encodeURIComponent(params.businessId ?? '');
    if (!planId || !businessId) {
      history.replace('/plans');
      return;
    }
    history.replace(`/checkout/sslcommerz/${planId}/${businessId}${location.search || ''}`);
  }, [location.search, params.businessId, params.planId]);

  return null;
};

export default LegacyPaymentGatewayRedirect;
