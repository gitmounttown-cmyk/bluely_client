// Single source of truth for URLs across both Website and Admin Portal.
export const ROUTES = {
  // Public customer website routes
  HOME: '/',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  ABOUT: '/about',
  CONTACT: '/contact',
  DASHBOARD: '/dashboard',
  BUY_NOW: '/buynow',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/otp',
  RESET_PASSWORD: '/reset-password',

  // Admin and Staff Portal routes
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_SIGNUP: '/admin/signup',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_BILLING: '/admin/billing',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_DEALERS: '/admin/dealers',
  ADMIN_PROFILE: '/admin/profile',
};

// Legacy and direct aliases mapped to new standard routes
export const LEGACY_ROUTES = {
  '/index.html': ROUTES.HOME,
  '/products.html': ROUTES.PRODUCTS,
  '/about.html': ROUTES.ABOUT,
  '/contact.html': ROUTES.CONTACT,
  '/dashboard.html': ROUTES.DASHBOARD,
  '/buynow.html': ROUTES.BUY_NOW,
  '/forgetpassword.html': ROUTES.FORGOT_PASSWORD,
  '/otp.html': ROUTES.VERIFY_OTP,
  '/resetpassword.html': ROUTES.RESET_PASSWORD,

  // Direct shortcuts from bluely_client
  '/login': ROUTES.ADMIN_LOGIN,
  '/signup': ROUTES.ADMIN_SIGNUP,
  '/billing': ROUTES.ADMIN_BILLING,
  '/inventory': ROUTES.ADMIN_INVENTORY,
  '/categories': ROUTES.ADMIN_CATEGORIES,
  '/orders': ROUTES.ADMIN_ORDERS,
  '/dealers': ROUTES.ADMIN_DEALERS,
};
