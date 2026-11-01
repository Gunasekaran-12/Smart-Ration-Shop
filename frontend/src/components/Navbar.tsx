import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Sparkles, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi, shopStatusApi } from '../services';
import type { NotificationItem } from '../types';
import SmartRationLogo from './SmartRationLogo';

interface NavbarProps {
  isSseConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isSseConnected }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [isTogglingShop, setIsTogglingShop] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getMyNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const markRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleShopStatus = async () => {
    const shopId = user?.shopId || 1;
    setIsTogglingShop(true);
    try {
      const updated = await shopStatusApi.toggleStatus(shopId, !isShopOpen);
      setIsShopOpen(updated.isActive !== undefined ? !isShopOpen : !isShopOpen);
    } catch (e) {
      console.error('Failed to toggle shop status', e);
      // Optimistic toggle for visual demo feedback
      setIsShopOpen(!isShopOpen);
    } finally {
      setIsTogglingShop(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'SHOP_OPERATOR':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
      case 'AUDITOR':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'BENEFICIARY':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#070d18]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Emblem & Logo */}
        <div className="flex items-center gap-4">
          <SmartRationLogo size="sm" />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
          {/* Shop Operating Status Pill / Toggle */}
          <div className="flex items-center">
            {user?.role === 'SHOP_OPERATOR' || user?.role === 'SUPER_ADMIN' ? (
              <button
                onClick={handleToggleShopStatus}
                disabled={isTogglingShop}
                title="Click to toggle Fair Price Shop OPEN / CLOSED status"
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                  isShopOpen
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isShopOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <Store size={13} />
                <span>FPS: {isShopOpen ? 'OPEN' : 'CLOSED'}</span>
              </button>
            ) : (
              <div
                title="Central Fair Price Shop (09:00 AM - 05:30 PM)"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Store size={13} />
                <span className="hidden sm:inline">SHOP: OPEN</span>
              </div>
            )}
          </div>

          {/* Nature Leaves & Sand Live Indicator */}
          <div
            title="Falling green leaves & sand atmospheric engine active"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 shadow-sm"
          >
            <Sparkles size={13} className="text-emerald-400 animate-pulse" />
            <span className="text-[10px] tracking-wide text-emerald-300 font-mono">LEAVES & SAND FLOW</span>
          </div>

          {/* Live SSE Status Badge */}
          <div
            title={isSseConnected ? 'Live real-time telemetry stream active' : 'Connecting to live stream...'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/90 border border-white/10 text-slate-300 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              {isSseConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSseConnected ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-400'
                }`}
              />
            </span>
            <span className="hidden sm:inline font-mono text-[11px] font-bold text-slate-300">
              {isSseConnected ? 'LIVE' : 'CONNECTING'}
            </span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-white/10 transition-colors"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-[10px] font-bold text-slate-950 shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 border border-emerald-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-4 z-50 space-y-3 backdrop-blur-2xl text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="font-bold text-sm text-white">Notifications</h3>
                    <span className="text-xs text-slate-400 font-mono">{unreadCount} unread</span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-6 text-slate-400">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.isRead
                              ? 'bg-slate-800/40 border-white/5 text-slate-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-sm hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-white block">
                              {n.title}
                            </span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-1 shadow-[0_0_8px_#10b981]" />
                            )}
                          </div>
                          <p className="mt-1 text-slate-300 line-clamp-2">{n.message}</p>
                          <span className="mt-2 block text-[10px] text-slate-400 font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-white/10">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.fullName}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border self-end mt-1 font-mono uppercase tracking-wider ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.replace(/_/g, ' ')}
                </span>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
