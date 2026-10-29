import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { ROUTES } from '../../../routes/paths';

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'Admin User';
  const userEmail = localStorage.getItem('userEmail') || 'admin@bluely.in';
  const userRole = localStorage.getItem('role') || 'Admin';

  const titles = {
    [ROUTES.ADMIN]: 'Dashboard Overview',
    [ROUTES.ADMIN_DASHBOARD]: 'Dashboard Overview',
    [ROUTES.ADMIN_BILLING]: 'Billing & POS Terminal',
    [ROUTES.ADMIN_INVENTORY]: 'Product Inventory Stock',
    [ROUTES.ADMIN_CATEGORIES]: 'Category Management',
    [ROUTES.ADMIN_ORDERS]: 'Customer Orders',
    [ROUTES.ADMIN_DEALERS]: 'Dealer Partnership Requests',
    [ROUTES.ADMIN_PROFILE]: 'My Account Profile',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate(ROUTES.ADMIN_LOGIN);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0 relative z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden text-gray-600 hover:text-sky-600 focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>
        <span className="text-lg font-semibold text-gray-800">
          {titles[location.pathname] || 'Admin Dashboard'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* User profile menu */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 focus:outline-none cursor-pointer group transition"
            aria-label="User menu"
          >
            <div className="w-9 h-9 bg-sky-700 text-white rounded-full flex items-center font-bold justify-center shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lg border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="px-3.5 py-2 text-xs text-gray-500 border-b border-gray-100">
                Signed in as <span className="font-semibold text-gray-800">{userRole}</span>
              </div>

              <button
                onClick={() => { setDropdownOpen(false); navigate(ROUTES.ADMIN_PROFILE); }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition"
              >
                <User size={15} className="text-gray-400" /> Profile / My Account
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
              >
                <LogOut size={15} className="text-red-500" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
