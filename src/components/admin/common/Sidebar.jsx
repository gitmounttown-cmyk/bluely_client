import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folders, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Handshake, 
  X
} from 'lucide-react';
import { ROUTES } from '../../../routes/paths';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { to: ROUTES.ADMIN_BILLING, label: 'Billing POS', icon: Receipt },
    { to: ROUTES.ADMIN_INVENTORY, label: 'Inventory Stock', icon: Package },
    { to: ROUTES.ADMIN_CATEGORIES, label: 'Categories', icon: Folders },
    { to: ROUTES.ADMIN_ORDERS, label: 'Orders', icon: ShoppingCart },
    { to: ROUTES.ADMIN_DEALERS, label: 'Dealer Requests', icon: Handshake },
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
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#041A71] text-[#ffffff] flex flex-col justify-between h-screen shrink-0 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 bg-[#031354]">
            <Link to={ROUTES.ADMIN_DASHBOARD} className="text-xl font-bold tracking-wider text-white flex items-center">
              BLUELY <span className="text-sky-300 text-xs uppercase px-2 py-0.5 bg-sky-950/60 rounded ml-2 border border-sky-500/30">Admin</span>
            </Link>
            <button onClick={onClose} className="md:hidden text-slate-300 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="mt-4 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive 
                        ? 'bg-sky-600 text-white shadow-sm font-semibold' 
                        : 'hover:bg-white/10 text-slate-200 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 bg-[#020e42] text-xs text-slate-300 text-center border-t border-sky-950">
          Bluely Admin & POS &copy; 2026
        </div>
      </aside>
    </>
  );
}
