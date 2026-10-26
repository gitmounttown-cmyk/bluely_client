import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userName = localStorage.getItem('userName') || 'Admin User';
  const userEmail = localStorage.getItem('userEmail') || 'admin@bluely.in';
  const userRole = localStorage.getItem('role') || 'Admin';

  const titles = {
    '/': 'Dashboard Overview',
    '/dashboard': 'Dashboard Overview',
    '/categories': 'Category Management',
    '/inventory': 'Product Inventory Stock',
    '/orders': 'Customer Orders',
    '/billing': 'Billing & POS Terminal',
    '/dealers': 'Dealer Partnership Requests',
    '/profile': 'My Account Profile'
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
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0 relative z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden text-gray-600 hover:text-bluely-500 focus:outline-none"
        >
          <Menu size={22} />
        </button>
        <span className="text-lg font-semibold text-gray-700">
          {titles[location.pathname] || 'Dashboard Overview'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 border-l pl-4 border-gray-200 focus:outline-none cursor-pointer group"
          >
            <div className="w-9 h-9 bg-bluely-500 text-white rounded-full flex items-center font-bold justify-center shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight text-gray-800 flex items-center gap-1">
                {userName} <span className="text-[10px] text-bluely-600 font-medium">({userRole})</span>
              </p>
              <p className="text-[10px] text-gray-500">{userEmail}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 py-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                <p className="text-xs font-semibold text-gray-800">{userName}</p>
                <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
              </div>

              <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                Signed in as <span className="font-semibold text-gray-700">{userRole}</span>
              </div>

              <button
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
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