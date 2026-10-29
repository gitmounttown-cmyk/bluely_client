import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import usePageStyles from '../../hooks/usePageStyles';
import usePageTitle from '../../hooks/usePageTitle';
import { DASHBOARD_STYLES } from '../../styles';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../routes/paths';
import DashboardHome from './dashboard/DashboardHome';
import ProfilePage from './dashboard/ProfilePage';
import OrdersPage from './dashboard/OrdersPage';
import WishlistPage from './dashboard/WishlistPage';
import AddressesPage from './dashboard/AddressesPage';

// page key (?page=...) -> component (same keys as pagesMap in dashboard.html)
const PAGES = {
  dashboard: DashboardHome,
  profile: ProfilePage,
  orders: OrdersPage,
  wishlist: WishlistPage,
  rewards: AddressesPage,
};

export default function Dashboard() {
  usePageStyles(DASHBOARD_STYLES);
  usePageTitle('Bluely - Dashboard');

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logoutAndClearAll } = useAuth();
  const { showNotification } = useToast();

  const requested = searchParams.get('page') || 'orders';
  const page = PAGES[requested] ? requested : 'dashboard';
  const PageComponent = PAGES[page];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Guard (same check as the original: no logged-in user -> back to home)
  useEffect(() => {
    if (!user?.email) {
      showNotification('User not logged in', 'error');
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [user, navigate, showNotification]);

  if (!user?.email) return null;

  const go = (key) => {
    if (key === 'logout') {
      logoutAndClearAll();
      return;
    }
    setSearchParams({ page: key });
    if (window.innerWidth <= 767) setSidebarOpen(false);
  };

  const onNav = (key) => (e) => {
    e.preventDefault();
    go(key);
  };

  return (
    <>
      <button type="button" className="mobile-menu-toggle" id="mobileMenuToggle" onClick={() => setSidebarOpen((o) => !o)} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <div
        className={`mobile-menu-overlay${sidebarOpen ? ' show' : ''}`}
        id="mobileMenuOverlay"
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`sidebar${sidebarOpen ? ' show' : ''}`} id="sidebar">
        <Link to={ROUTES.HOME}>
          <img height="30px" width="30" src="/images/icons/home.png" alt="Home" className="mobile-home-icon" />
        </Link>
        <div className="logo">
          <img src="/images/Logo.png" alt="" />
        </div>
        <ul className="header-menu">
          <li className="nav-item">
            <a
              className="nav-link"
              id="dashboardNav"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpen((o) => !o);
              }}
            >
              <span className="icon">
                <img src="/images/icons/Vector (4).png" height="15px" width="15px" alt="" />
              </span>
              Dashboard
              <span className={`dropdown-arrow${dropdownOpen ? ' open' : ''}`}>
                <ChevronDown size={12} />
              </span>
            </a>
            <div className={`dropdown-menu${dropdownOpen ? ' show' : ''}`} id="dashboardDropdown">
              <a className={`dropdown-item${page === 'profile' ? ' active' : ''}`} href="#" onClick={onNav('profile')}>
                <span className="icon">
                  <img src="/images/icons/Vector (5).png" height="15px" width="15px" alt="" />
                </span>
                My Profile
              </a>
            </div>
          </li>
          <li className="nav-item">
            <a className={`nav-link${page === 'orders' ? ' active' : ''}`} href="#" onClick={onNav('orders')}>
              <span className="icon hov4" />
              Orders
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link${page === 'wishlist' ? ' active' : ''}`} href="#" onClick={onNav('wishlist')}>
              <span className="icon hov3" />
              Wishlist
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link${page === 'rewards' ? ' active' : ''}`} href="#" onClick={onNav('rewards')}>
              <span className="icon hov2" />
              Manage Address
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={onNav('logout')}>
              <span className="icon hov1" />
              Logout
            </a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <PageComponent key={page} />
      </div>
    </>
  );
}
