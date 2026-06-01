export default function getRoutes() {
  const extra = JSON.parse(process.env.EXTRA_ROUTES || '{}').routes || [];
  const legacyAdminRedirects = [
    { name: 'legacy-users', path: '/admin/users', redirect: '/sys/users' },
    { name: 'legacy-profiles', path: '/admin/profiles', redirect: '/account/settings' },
    { name: 'legacy-roles', path: '/admin/roles', redirect: '/sys/roles' },
    { name: 'legacy-role-detail', path: '/admin/roles/:id', redirect: '/sys/role/:id' },
    { name: 'legacy-permissions', path: '/admin/permissions', redirect: '/sys/roles' },
    { name: 'legacy-notifications', path: '/admin/notifications', redirect: '/sys/notifications' },
    { name: 'legacy-plans', path: '/admin/plans', redirect: '/saas/plans' },
    { name: 'legacy-business', path: '/admin/business', redirect: '/saas/businesses' },
    { name: 'legacy-businesses', path: '/admin/businesses', redirect: '/saas/businesses' },
    {
      name: 'legacy-business-categories',
      path: '/admin/business-categories',
      redirect: '/saas/business-segments',
    },
    {
      name: 'legacy-business-segments',
      path: '/admin/business-segments',
      redirect: '/saas/business-segments',
    },
    { name: 'legacy-gateways', path: '/admin/gateways', redirect: '/payment/gateways' },
    {
      name: 'legacy-payment-gateways',
      path: '/admin/payment-gateways',
      redirect: '/payment/gateways',
    },
    { name: 'legacy-currencies', path: '/admin/currencies', redirect: '/sys/localization' },
    { name: 'legacy-languages', path: '/admin/languages', redirect: '/sys/localization' },
    { name: 'legacy-settings', path: '/admin/settings', redirect: '/sys/settings' },
    { name: 'legacy-system-settings', path: '/admin/system-settings', redirect: '/sys/settings' },
    { name: 'legacy-manage-settings', path: '/admin/manage-settings', redirect: '/sys/settings' },
    {
      name: 'legacy-website-settings',
      path: '/admin/website-settings',
      redirect: '/sys/public-site',
    },
    { name: 'legacy-banners', path: '/admin/banners', redirect: '/sys/public-site' },
    { name: 'legacy-features', path: '/admin/features', redirect: '/sys/public-site' },
    { name: 'legacy-interfaces', path: '/admin/interfaces', redirect: '/sys/public-site' },
    { name: 'legacy-testimonials', path: '/admin/testimonials', redirect: '/sys/public-site' },
    { name: 'legacy-blogs', path: '/admin/blogs', redirect: '/sys/public-site' },
    { name: 'legacy-messages', path: '/admin/messages', redirect: '/sys/public-site' },
    {
      name: 'legacy-term-conditions',
      path: '/admin/term-conditions',
      redirect: '/sys/public-site',
    },
    {
      name: 'legacy-privacy-policy',
      path: '/admin/privacy-policy',
      redirect: '/sys/public-site',
    },
    {
      name: 'legacy-subscription-orders',
      path: '/admin/subscription-orders',
      redirect: '/payment/subscriptions',
    },
    {
      name: 'legacy-subscription-reports',
      path: '/admin/subscription-reports',
      redirect: '/payment/subscription-reports',
    },
    { name: 'legacy-affiliates', path: '/admin/affiliates', redirect: '/saas/referrals' },
    {
      name: 'legacy-affiliate-withdrawals',
      path: '/admin/affiliate-withdrawals',
      redirect: '/saas/referral-payouts',
    },
    {
      name: 'legacy-affiliate-reports',
      path: '/admin/affiliate-reports',
      redirect: '/saas/referral-reports',
    },
  ].map((route) => ({ ...route, hideInMenu: true }));
  const legacyRetailRedirects = [
    ['/product/pos/dashboard', '/retail/dashboard'],
    ['/product/pos/products', '/retail/products'],
    ['/product/pos/setup', '/retail/setup'],
    ['/product/pos/labels', '/retail/labels'],
    ['/product/pos/stock', '/retail/stock'],
    ['/product/pos/transfers', '/retail/transfers'],
    ['/product/pos/parties', '/retail/parties'],
    ['/product/pos/party-reports', '/retail/party-reports'],
    ['/product/pos/staff-users', '/retail/staff-users'],
    ['/product/pos/reports', '/retail/reports'],
    ['/product/pos/reports/custom', '/retail/reports/custom'],
    ['/product/pos/reports/custom/:slug', '/retail/reports/custom/:slug'],
    ['/product/pos/reports/sales', '/retail/reports/sales'],
    ['/product/pos/reports/sale-returns', '/retail/reports/sale-returns'],
    ['/product/pos/reports/purchases', '/retail/reports/purchases'],
    ['/product/pos/reports/purchase-returns', '/retail/reports/purchase-returns'],
    ['/product/pos/reports/income', '/retail/reports/income'],
    ['/product/pos/reports/expenses', '/retail/reports/expenses'],
    ['/product/pos/reports/due-transactions', '/retail/reports/due-transactions'],
    ['/product/pos/settings', '/retail/settings'],
    ['/product/pos/sales', '/retail/sales'],
    ['/product/pos/sale-returns', '/retail/sale-returns'],
    ['/product/pos/due-collections', '/retail/due-collections'],
    ['/product/pos/finance/accounts', '/retail/finance/accounts'],
    ['/product/pos/finance/transactions', '/retail/finance/transactions'],
    ['/product/pos/finance/day-book', '/retail/finance/day-book'],
    ['/product/pos/finance/income-expenses', '/retail/finance/income-expenses'],
    ['/product/pos/finance/cheques', '/retail/finance/cheques'],
    ['/product/pos/purchases', '/retail/purchases'],
    ['/product/pos/purchase-returns', '/retail/purchase-returns'],
  ].map(([path, redirect], index) => ({
    name: `legacy-retail-${index}`,
    path,
    redirect,
    hideInMenu: true,
  }));

  return [
    {
      path: '/',
      component: './Public/Home',
      layout: false,
    },
    {
      path: '/plans',
      component: './Public/Plans',
      layout: false,
    },
    {
      path: '/about-us',
      component: './Public/About',
      layout: false,
    },
    {
      path: '/blogs',
      component: './Public/Blogs',
      layout: false,
    },
    {
      path: '/blogs/:slug',
      component: './Public/BlogDetail',
      layout: false,
    },
    {
      path: '/privacy-policy',
      component: './Public/LegalPage',
      layout: false,
    },
    {
      path: '/terms-conditions',
      component: './Public/LegalPage',
      layout: false,
    },
    {
      path: '/data-deletion',
      component: './Public/LegalPage',
      layout: false,
    },
    {
      path: '/contact-us',
      component: './Public/Contact',
      layout: false,
    },
    {
      path: '/checkout/sslcommerz/:planId/:businessId',
      component: './Public/PaymentGateway',
      layout: false,
    },
    {
      path: '/payments-gateways/:planId/:businessId',
      component: './Public/LegacyPaymentGatewayRedirect',
      layout: false,
    },
    {
      path: '/payment/success',
      component: './Public/PaymentSuccess',
      layout: false,
    },
    {
      path: '/payment/failed',
      component: './Public/PaymentFailed',
      layout: false,
    },
    {
      path: '/order-status',
      component: './Public/OrderStatus',
      layout: false,
    },
    {
      path: '/login',
      component: './User/LegacyRedirect',
      layout: false,
    },
    {
      path: '/register',
      component: './User/LegacyRedirect',
      layout: false,
    },
    {
      path: '/forgot-password',
      component: './User/LegacyRedirect',
      layout: false,
    },
    {
      path: '/reset-password',
      component: './User/LegacyRedirect',
      layout: false,
    },
    {
      path: '/reset-password/:token',
      component: './User/LegacyRedirect',
      layout: false,
    },
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './User/Login',
        },
        {
          name: 'register',
          path: '/user/register',
          component: './User/Register',
        },
        {
          name: 'forgot-password',
          path: '/user/forgot-password',
          component: './User/ForgotPassword',
        },
        {
          name: 'reset-password',
          path: '/user/reset-password',
          component: './User/ResetPassword',
        },
        {
          name: 'consent',
          path: '/user/consent',
          component: './User/Consent',
        },
        {
          name: 'logout',
          path: '/user/logout',
          component: './User/Logout',
        },
        {
          component: './404',
        },
      ],
    },
    {
      path: '/admin',
      locale: 'admin.title',
      name: 'admin',
      icon: 'smile',
      routes: [
        {
          path: '/admin',
          redirect: '/dashboard/workbench',
        },
        ...legacyAdminRedirects,
      ],
    },
    ...legacyRetailRedirects,
    {
      path: '/account',
      name: 'account',
      hideInMenu: true,
      routes: [
        {
          name: 'center',
          path: '/account/center',
          component: './Account/Settings',
          hideInMenu: true,
        },
        {
          name: 'settings',
          path: '/account/settings',
          component: './Account/Settings',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/sys',
      locale: 'sys.title',
      name: 'sys',
      icon: 'smile',
      routes: [
        {
          name: 'user',
          path: '/sys/users',
          component: './Sys/User',
        },
        {
          name: 'role',
          path: '/sys/roles',
          component: './Sys/Role',
        },
        {
          name: 'role-detail',
          path: '/sys/role/:id',
          component: './Sys/RoleDetail',
          hideInMenu: true,
        },
        {
          name: 'menu',
          path: '/sys/menus',
          component: './Sys/Menu',
        },
        {
          name: 'maintenance',
          path: '/sys/maintenance',
          component: './Sys/Maintenance',
        },
        {
          name: 'notifications',
          path: '/sys/notifications',
          component: './Sys/Notification',
        },
        {
          name: 'public-site',
          path: '/sys/public-site',
          component: './Sys/PublicSite',
        },
        {
          name: 'localization',
          path: '/sys/localization',
          component: './Sys/Localization',
        },
        {
          name: 'settings',
          path: '/sys/settings',
          component: './Sys/Settings',
        },
      ],
    },
    {
      path: '/oidc',
      icon: 'smile',
      routes: [
        {
          path: '/oidc/clients',
          component: './Oidc/Client',
        },
      ],
    },
    {
      path: '/saas',
      name: 'saas',
      icon: 'smile',
      routes: [
        {
          name: 'tenant',
          path: '/saas/tenants',
          component: './Saas/Tenant',
        },
        {
          name: 'plan',
          path: '/saas/plans',
          component: './Saas/Plan',
        },
        {
          name: 'businesses',
          path: '/saas/businesses',
          component: './Saas/Business',
        },
        {
          name: 'business-segments',
          path: '/saas/business-segments',
          component: './Saas/BusinessSegment',
        },
        {
          name: 'referrals',
          path: '/saas/referrals',
          component: './Saas/Referral/Affiliates',
        },
        {
          name: 'referral-payouts',
          path: '/saas/referral-payouts',
          component: './Saas/Referral/Payouts',
        },
        {
          name: 'referral-reports',
          path: '/saas/referral-reports',
          component: './Saas/Referral/Reports',
        },
      ],
    },
    {
      path: '/payment',
      name: 'payment',
      icon: 'smile',
      routes: [
        {
          name: 'payment.orders',
          path: '/payment/orders',
          component: './Order/Order',
        },
        {
          name: 'payment.subscriptions',
          path: '/payment/subscriptions',
          component: './Saas/SubscriptionOrder',
        },
        {
          name: 'payment.subscriptionReports',
          path: '/payment/subscription-reports',
          component: './Saas/SubscriptionOrder',
          hideInMenu: true,
        },
        {
          name: 'payment.gateways',
          path: '/payment/gateways',
          component: './Payment/GatewaySettings',
        },
      ],
    },
    {
      path: '/product',
      name: 'product',
      routes: [
        {
          name: 'product.products',
          path: '/product/products',
          component: './Product/Product',
        },
      ],
    },
    {
      path: '/retail',
      name: 'retail',
      routes: [
        {
          name: 'product.dashboard',
          path: '/retail/dashboard',
          component: './Product/POS/Dashboard',
        },
        {
          name: 'product.catalog',
          path: '/retail/products',
          component: './Product/POS/Catalog',
        },
        {
          name: 'product.setup',
          path: '/retail/setup',
          component: './Product/POS/Setup',
        },
        {
          name: 'product.labels',
          path: '/retail/labels',
          component: './Product/POS/Labels',
        },
        {
          name: 'product.stock',
          path: '/retail/stock',
          component: './Product/POS/Stock',
        },
        {
          name: 'product.transfers',
          path: '/retail/transfers',
          component: './Product/POS/Transfer',
        },
        {
          name: 'product.parties',
          path: '/retail/parties',
          component: './Product/POS/Party',
        },
        {
          name: 'product.party_reports',
          path: '/retail/party-reports',
          component: './Product/POS/PartyReport',
        },
        {
          name: 'product.staff_users',
          path: '/retail/staff-users',
          component: './Product/POS/StaffUsers',
        },
        {
          name: 'product.reports',
          path: '/retail/reports',
          component: './Product/POS/Report',
        },
        {
          name: 'product.custom_reports',
          path: '/retail/reports/custom',
          component: './Product/POS/CustomReport',
        },
        {
          name: 'product.custom_report_show',
          path: '/retail/reports/custom/:slug',
          component: './Product/POS/CustomReport',
          hideInMenu: true,
        },
        {
          name: 'product.report_sales',
          path: '/retail/reports/sales',
          component: './Product/POS/Sale',
          hideInMenu: true,
        },
        {
          name: 'product.report_sale_returns',
          path: '/retail/reports/sale-returns',
          component: './Product/POS/SaleReturn',
          hideInMenu: true,
        },
        {
          name: 'product.report_purchases',
          path: '/retail/reports/purchases',
          component: './Product/POS/Purchase',
          hideInMenu: true,
        },
        {
          name: 'product.report_purchase_returns',
          path: '/retail/reports/purchase-returns',
          component: './Product/POS/PurchaseReturn',
          hideInMenu: true,
        },
        {
          name: 'product.report_income',
          path: '/retail/reports/income',
          component: './Product/POS/Finance/IncomeExpense',
          hideInMenu: true,
        },
        {
          name: 'product.report_expenses',
          path: '/retail/reports/expenses',
          component: './Product/POS/Finance/IncomeExpense',
          hideInMenu: true,
        },
        {
          name: 'product.report_due_transactions',
          path: '/retail/reports/due-transactions',
          component: './Product/POS/DueCollection',
          hideInMenu: true,
        },
        {
          name: 'product.settings',
          path: '/retail/settings',
          component: './Product/POS/Settings',
        },
        {
          name: 'product.sales',
          path: '/retail/sales',
          component: './Product/POS/Sale',
        },
        {
          name: 'product.sale_returns',
          path: '/retail/sale-returns',
          component: './Product/POS/SaleReturn',
        },
        {
          name: 'product.due_collections',
          path: '/retail/due-collections',
          component: './Product/POS/DueCollection',
        },
        {
          name: 'product.finance_accounts',
          path: '/retail/finance/accounts',
          component: './Product/POS/Finance/Account',
        },
        {
          name: 'product.finance_transactions',
          path: '/retail/finance/transactions',
          component: './Product/POS/Finance/Transaction',
        },
        {
          name: 'product.finance_day_book',
          path: '/retail/finance/day-book',
          component: './Product/POS/Finance/Transaction',
        },
        {
          name: 'product.finance_income_expenses',
          path: '/retail/finance/income-expenses',
          component: './Product/POS/Finance/IncomeExpense',
        },
        {
          name: 'product.finance_cheques',
          path: '/retail/finance/cheques',
          component: './Product/POS/Finance/Cheque',
        },
        {
          name: 'product.purchases',
          path: '/retail/purchases',
          component: './Product/POS/Purchase',
        },
        {
          name: 'product.purchase_returns',
          path: '/retail/purchase-returns',
          component: './Product/POS/PurchaseReturn',
        },
      ],
    },
    {
      name: 'dashboard',
      icon: 'table',
      routes: [
        {
          name: 'workbench',
          path: '/dashboard/workbench',
          component: './Saas/Dashboard',
        },
      ],
    },
    ...extra,
    {
      path: '/',
      redirect: '/dashboard/workbench',
    },
    {
      path: '*',
      component: './404',
    },
  ];
}
