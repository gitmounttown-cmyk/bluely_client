import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LogOut, ShieldCheck, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ROUTES } from '../routes/paths';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';

const NAV_LINKS = [
  { to: ROUTES.HOME, label: 'Home', end: true },
  { to: ROUTES.PRODUCTS, label: 'Products' },
  { to: ROUTES.ABOUT, label: 'About' },
  { to: ROUTES.CONTACT, label: 'Contact' },
];

/** Same header as the one injected by injectNavbar() on every page */
export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isLoggedIn, toggleAuth, openAuth, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { showNotification } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const userRole = (user?.role || (user ? '' : localStorage.getItem('role')) || '').toLowerCase().trim();
  const allowedAdminRoles = [
    'admin',
    'super admin',
    'superadmin',
    'cashier',
    'inventory manager',
    'inventory_manager',
    'inventorymanager',
  ];
  const hasAdminAccess = Boolean(user && !user.isGuest && allowedAdminRoles.includes(userRole));

  // close mobile menu / dropdown on navigation
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // click anywhere closes the profile dropdown
  useEffect(() => {
    if (!profileOpen) return undefined;
    const close = () => setProfileOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [profileOpen]);

  const goToWishlist = () => {
    if (!localStorage.getItem('token')) {
      openAuth('login');
      showNotification('Please login to view wishlist');
      return;
    }
    navigate(`${ROUTES.DASHBOARD}?page=wishlist`);
  };

  return (
    <header className="navbar" id="mainNavbar">
      <div className="logo" onClick={() => navigate(ROUTES.HOME)} role="link" aria-label="Bluely home" />

      <AuthModal />

      <nav className={`menu${menuOpen ? ' active' : ''}`} id="navMenu">
        {NAV_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="auth">
        <div className="nav-icons">
          <span className="wishlist-nav-icon" onClick={goToWishlist} title="Wishlist" role="button">
            <Heart size={20} />
            <span className="wishlist-count" id="wishlistCount">{wishlistCount}</span>
          </span>

          <span className="cart-icon" onClick={toggleCart} role="button" title="Cart">
            <ShoppingCart size={20} />
            <span className="cart-count" id="cartCount">{cartCount}</span>
          </span>

          <div className="user-area">
            <span
              id="loginIcon"
              className="user-icon"
              onClick={toggleAuth}
              role="button"
              title="Login"
              style={{ display: isLoggedIn ? 'none' : 'block' }}
            >
              <User size={20} />
            </span>

            <CartSidebar />

            <div id="profileMenu" className="profile-menu" style={{ display: isLoggedIn ? 'block' : 'none', position: 'relative' }}>
              <span
                className="profile-name"
                id="profileName"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen((o) => !o);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
              >
                {user?.isGuest ? 'Guest User' : (user?.name || 'Account')}
                <ChevronDown size={14} style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </span>
              <div
                id="profileDropdown"
                className={`profile-dropdown${profileOpen ? ' show' : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                {user?.isGuest ? (
                  <>
                    <div className="dropdown-header">
                      <span>Browsing as</span>
                      <strong>Guest User</strong>
                    </div>
                    <Link to={`${ROUTES.DASHBOARD}?page=wishlist`} className="dropdown-link" onClick={() => setProfileOpen(false)}>
                      <Heart size={15} /> My Wishlist
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        openAuth('login');
                      }}
                      className="dropdown-link"
                      style={{ color: '#081b6b', fontWeight: 600 }}
                    >
                      <User size={15} /> Login with Account
                    </button>
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="dropdown-link logout-link"
                    >
                      <LogOut size={15} /> Exit Guest
                    </button>
                  </>
                ) : (
                  <>
                    <div className="dropdown-header">
                      <span>Signed in as</span>
                      <strong>{user?.name || 'Customer'}</strong>
                    </div>
                    <Link to={ROUTES.DASHBOARD} className="dropdown-link" onClick={() => setProfileOpen(false)}>
                      <User size={15} /> My Profile
                    </Link>
                    {hasAdminAccess && (
                      <Link
                        to={ROUTES.ADMIN_DASHBOARD}
                        className="dropdown-link admin-link"
                        onClick={() => setProfileOpen(false)}
                      >
                        <ShieldCheck size={15} /> Admin Portal
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="dropdown-link logout-link"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`hamburger${menuOpen ? ' active' : ''}`}
        onClick={() => setMenuOpen((o) => !o)}
        role="button"
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </div>
    </header>
  );
}
