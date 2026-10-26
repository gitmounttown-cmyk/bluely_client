import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folders, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Handshake, 
  X 
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/categories', label: 'Categories', icon: Folders },
    { to: '/inventory', label: 'Inventory Stock', icon: Package },
    { to: '/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/billing', label: 'Billing POS', icon: Receipt },
    { to: '/dealers', label: 'Dealer Requests', icon: Handshake },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between h-screen shrink-0 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 bg-slate-950">
            <span className="text-xl font-bold tracking-wider text-white">
              BLUELY <span className="text-bluely-500 text-xs uppercase px-2 py-0.5 bg-bluely-500/20 rounded ml-1">Admin</span>
            </span>
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive 
                        ? 'bg-bluely-600 text-white' 
                        : 'hover:bg-slate-800 hover:text-white text-slate-300'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-slate-950 text-xs text-slate-500 text-center">
          Bluely Admin Panel &copy; 2026
        </div>
      </aside>
    </>
  );
}