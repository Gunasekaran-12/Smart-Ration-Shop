import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  CreditCard,
  Boxes,
  Sliders,
  FileBarChart2,
  AlertCircle,
  Users,
  ShieldCheck,
  Calendar,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Simple, everyday English labels
  const links = [
    {
      to: '/dashboard',
      label: 'Summary',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/chatbot',
      label: 'Stock Assistant',
      icon: MessageSquare,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/distribution',
      label: 'Distribute Ration',
      icon: ShoppingCart,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR'],
    },
    {
      to: '/booking',
      label: 'Book Shop Visit',
      icon: Calendar,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY'],
    },
    {
      to: '/cards',
      label: role === 'BENEFICIARY' ? 'My Ration Card' : 'Ration Cards',
      icon: CreditCard,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY'],
    },
    {
      to: '/stock',
      label: 'Stock Management',
      icon: Boxes,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'AUDITOR'],
    },
    {
      to: '/entitlements',
      label: 'Ration Quotas & Rules',
      icon: Sliders,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
    {
      to: '/reports',
      label: 'Reports & Charts',
      icon: FileBarChart2,
      roles: ['SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR'],
    },
    {
      to: '/complaints',
      label: 'Help & Complaints',
      icon: AlertCircle,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/users-shops',
      label: 'Shops & Staff Accounts',
      icon: Users,
      roles: ['SUPER_ADMIN'],
    },
    {
      to: '/audit-logs',
      label: 'System Activity Logs',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
  ];

  const allowedLinks = links.filter((link) => link.roles.includes(role));

  const renderNavLinks = (isMobile: boolean = false) => (
    <div className="space-y-1">
      <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        Menu Options
      </div>

      {allowedLinks.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => {
              if (isMobile && onCloseMobile) {
                onCloseMobile();
              }
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <Icon size={17} className="shrink-0" />
            <span className="truncate">{link.label}</span>
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#091120] text-slate-300 border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex-col justify-between">
        {renderNavLinks(false)}

        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          Smart Ration Shop &bull; v1.0
        </div>
      </aside>

      {/* Mobile Drawer Navigation (shown when hamburger menu is opened) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-xs"
            />

            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-72 z-50 bg-[#091120] text-slate-200 p-5 flex flex-col justify-between shadow-2xl border-r border-slate-800 md:hidden overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Navigation Menu
                  </span>
                  <button
                    onClick={onCloseMobile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {renderNavLinks(true)}
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
                Smart Ration Shop &bull; v1.0
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
