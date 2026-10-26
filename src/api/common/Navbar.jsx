import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();

  const titles = {
    '/': 'Dashboard Overview',
    '/categories': 'Category Management',
    '/inventory': 'Product Inventory Stock',
    '/orders': 'Customer Orders',
    '/billing': 'Billing & POS Terminal',
    '/dealers': 'Dealer Partnership Requests'
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0">
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
        <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
          <div className="w-9 h-9 bg-bluely-500 text-white rounded-full flex items-center font-bold justify-center">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-gray-800">Admin User</p>
            <p className="text-[10px] text-gray-500">admin@bluely.in</p>
          </div>
        </div>
      </div>
    </header>
  );
}