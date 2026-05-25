export const appRoutes = {
  login: '/auth/login',
  customerTabs: '/(tabs)',
  newOrder: '/new-order',
  orderDetail: '/order-detail/[orderId]',
  sales: {
    root: '/sales',
    orders: '/sales/orders',
    newOrder: '/sales/new-order',
    payouts: '/sales/payouts',
    settings: '/sales/settings',
  },
  printer: {
    queue: '/printer/queue',
    newOrder: '/printer/new-order',
    settings: '/printer/settings',
    wages: '/printer/wages',
  },
} as const;
