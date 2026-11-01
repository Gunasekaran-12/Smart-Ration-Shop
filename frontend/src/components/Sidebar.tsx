import React from 'react';
import { NavLink } from 'react-router-dom';
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
  BookOpen,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/chatbot',
      label: 'Stock Assistant / Chatbot',
      icon: MessageSquare,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/distribution',
      label: 'Distribution Counter',
      icon: ShoppingCart,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR'],
    },
    {
      to: '/booking',
      label: 'Slot Booking (Token)',
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
      label: 'Stock Ledger',
      icon: Boxes,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'AUDITOR'],
    },
    {
      to: '/entitlements',
      label: 'Entitlements & Rules',
      icon: Sliders,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
    {
      to: '/reports',
      label: 'Reports & Reconciliation',
      icon: FileBarChart2,
      roles: ['SUPER_ADMIN', 'AUDITOR', 'SHOP_OPERATOR'],
    },
    {
      to: '/complaints',
      label: 'Grievances / Complaints',
      icon: AlertCircle,
      roles: ['SUPER_ADMIN', 'SHOP_OPERATOR', 'BENEFICIARY', 'AUDITOR'],
    },
    {
      to: '/users-shops',
      label: 'Shops & Accounts',
      icon: Users,
      roles: ['SUPER_ADMIN'],
    },
    {
      to: '/audit-logs',
      label: 'System Audit Logs',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'AUDITOR'],
    },
  ];

  const allowedLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside className="w-64 flex-shrink-0 bg-[#091120]/95 backdrop-blur-2xl text-slate-300 border-r border-white/10 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shadow-2xl">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>PORTAL DIRECTORY</span>
          <BookOpen size={13} className="text-emerald-400" />
        </div>

        {allowedLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-300 font-bold border-l-4 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} className="transition-transform group-hover:scale-110" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Official Bottom Badge */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[11px] font-mono font-bold text-slate-200">
            SECURE GOV PDS
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
          Tamper-evident cryptographic ledger & NFSA quota management.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
