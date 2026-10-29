import { useRoutes, Navigate } from 'react-router-dom';

import { LEGACY_ROUTES, ROUTES } from './paths';

// Website Layout & Pages
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/website/Home';
import Products from '../pages/website/Products';
import CategoriesPage from '../pages/website/Categories';
import About from '../pages/website/About';
import Contact from '../pages/website/Contact';
import Dashboard from '../pages/website/Dashboard';
import BuyNow from '../pages/website/BuyNow';
import ForgotPassword from '../pages/website/ForgotPassword';
import VerifyOtp from '../pages/website/VerifyOtp';
import ResetPassword from '../pages/website/ResetPassword';
import NotFound from '../pages/website/NotFound';
import LegacyRedirect from '../components/LegacyRedirect';

// Admin Layout & Pages
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminBillingPOS from '../pages/admin/BillingPOS';
import AdminCategories from '../pages/admin/Categories';
import AdminInventoryStock from '../pages/admin/InventoryStock';
import AdminOrders from '../pages/admin/Orders';
import AdminDealers from '../pages/admin/Dealers';
import AdminProfile from '../pages/admin/Profile';
import AdminLogin from '../pages/admin/Login';
import AdminSignup from '../pages/admin/Register';

export const routes = [
  // ── Public Storefront Pages (Shared Navbar, Footer & Background effects) ──
  {
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: ROUTES.PRODUCTS, Component: Products },
      { path: ROUTES.CATEGORIES, Component: CategoriesPage },
      { path: ROUTES.ABOUT, Component: About },
      { path: ROUTES.CONTACT, Component: Contact },
    ],
  },

  // ── Customer Dedicated Pages ──
  { path: ROUTES.DASHBOARD, Component: Dashboard },
  { path: ROUTES.BUY_NOW, Component: BuyNow },
  { path: ROUTES.FORGOT_PASSWORD, Component: ForgotPassword },
  { path: ROUTES.VERIFY_OTP, Component: VerifyOtp },
  { path: ROUTES.RESET_PASSWORD, Component: ResetPassword },

  // ── Public Admin Authentication Pages (No Sidebar/Navbar) ──
  { path: ROUTES.ADMIN_LOGIN, Component: AdminLogin },
  { path: ROUTES.ADMIN_SIGNUP, Component: AdminSignup },

  // ── Protected Admin Portal (Sidebar & Navbar Layout) ──
  {
    path: ROUTES.ADMIN,
    Component: AdminLayout,
    children: [
      { index: true, Component: () => <Navigate to={ROUTES.ADMIN_DASHBOARD} replace /> },
      { path: 'dashboard', Component: AdminDashboard },
      { path: 'billing', Component: AdminBillingPOS },
      { path: 'inventory', Component: AdminInventoryStock },
      { path: 'categories', Component: AdminCategories },
      { path: 'orders', Component: AdminOrders },
      { path: 'dealers', Component: AdminDealers },
      { path: 'profile', Component: AdminProfile },
    ],
  },

  // ── Legacy & Shortcut redirects (/login -> /admin/login, /billing -> /admin/billing, etc.) ──
  ...Object.keys(LEGACY_ROUTES).map((path) => ({ path, Component: LegacyRedirect })),

  // ── 404 Catch-All ──
  { path: '*', Component: NotFound },
];

export default function AppRoutes() {
  return useRoutes(routes);
}
