import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Building2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  PackageCheck,
  Clock,
  Wheat,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, shopApi } from '../services';
import type { DashboardAnalytics, RationShop } from '../types';
import PageContainer from '../components/PageContainer';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useSse } from '../hooks/useSse';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [shops, setShops] = useState<RationShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | undefined>(
    user?.role === 'SHOP_OPERATOR' ? user.shopId : undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [selectedShopId]);

  const fetchDashboard = async () => {
    try {
      const data = await analyticsApi.getDashboardData(selectedShopId);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load shops list for Super Admin or Auditor
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'AUDITOR') {
      shopApi.getAll().then(setShops).catch(console.error);
    }
  }, [user]);

  // Server-Sent Events (SSE) Live Update Hook
  useSse(() => {
    fetchDashboard();
  });

  return (
    <PageContainer
      title="Smart Ration Shop Management System with Real-Time Stock Analytics"
      subtitle="Real-time food security inventory, biometric distribution throughput, and Fair Price Shop telemetry"
      actions={
        <div className="flex items-center gap-2">
          {/* Outlet filter for Admins/Auditors */}
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'AUDITOR') && (
            <select
              value={selectedShopId || ''}
              onChange={(e) =>
                setSelectedShopId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 border border-white/10 text-white shadow-lg focus:border-emerald-400 focus:outline-none"
            >
              <option value="">All Fair Price Shops (Statewide)</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName} ({s.shopNumber})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setIsLoading(true);
              fetchDashboard();
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all shadow-lg cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      }
    >
      {/* 1. KPI Cards Grid with Staggered Entrance */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        <StatCard
          title="Active Ration Cards"
          value={analytics?.totalRationCards ?? '—'}
          subtitle="Enrolled beneficiary households"
          icon={CreditCard}
          variant="purple"
        />

        <StatCard
          title="Today's Distributions"
          value={analytics?.todayTransactions ?? '0'}
          subtitle={`${analytics?.todayDistributedKg ? Number(analytics.todayDistributedKg).toFixed(1) : 0} Kg distributed today`}
          icon={TrendingUp}
          variant="emerald"
        />

        <StatCard
          title="Active Fair Price Outlets"
          value={analytics?.activeShops ?? '—'}
          subtitle="Registered PDS distribution centers"
          icon={Building2}
          variant="blue"
        />

        <StatCard
          title="Low Stock Watch"
          value={analytics?.lowStockCount ?? '0'}
          subtitle={analytics?.lowStockCount ? 'Threshold breach detected' : 'All stocks optimal'}
          icon={AlertTriangle}
          variant={analytics?.lowStockCount && analytics.lowStockCount > 0 ? 'rose' : 'emerald'}
        />
      </motion.div>

      {/* 2. Real-Time Commodity Stock & Days-Until-Stockout Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden"
      >
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PackageCheck size={18} className="text-emerald-400" />
              <span>Current Stock Balance & Estimated Stockout Burn Rate</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Live physical balance calculated from opening stock + warehouse receipts - distributions + adjustments
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock size={13} className="text-emerald-400" />
            <span>Updated: Just now (Live SSE)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 font-bold border-b border-white/10 uppercase tracking-wider font-mono text-[11px]">
                <th className="py-3.5 px-4">Commodity</th>
                <th className="py-3.5 px-4 text-right">Available Stock</th>
                <th className="py-3.5 px-4 text-right">Low Stock Threshold</th>
                <th className="py-3.5 px-4 text-right">Today Distributed</th>
                <th className="py-3.5 px-4 text-center">Days Until Stockout</th>
                <th className="py-3.5 px-4 text-center">Inventory Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {analytics?.commodityStock?.map((stock) => (
                <tr
                  key={stock.commodityId}
                  className="hover:bg-emerald-500/5 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-white font-sans">
                    {stock.commodityName}
                    <span className="block text-[10px] text-slate-400 font-mono font-normal">
                      Code: {stock.commodityCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-sm text-emerald-400">
                    {Number(stock.currentStock).toFixed(2)} {stock.measurementUnit}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {Number(stock.lowStockThreshold).toFixed(2)} {stock.measurementUnit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-cyan-300">
                    {Number(stock.todayDistributed).toFixed(2)} {stock.measurementUnit}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {stock.daysUntilStockout != null ? (
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          stock.daysUntilStockout < 5
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : stock.daysUntilStockout < 12
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        ~{stock.daysUntilStockout} Days
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Insufficient History</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    {stock.isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        <AlertTriangle size={12} />
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 3. Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wheat size={16} className="text-amber-400" />
                <span>Monthly Distribution Trends (6-Month Trailing)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Total kilograms distributed across Rice, Wheat, and Sugar
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono border border-white/10">
              Kg / Month
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthlyDistributionTrends || []}>
                <defs>
                  <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1528',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(16,185,129,0.2)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="riceDistributed"
                  name="Rice (Kg)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRice)"
                />
                <Area
                  type="monotone"
                  dataKey="wheatDistributed"
                  name="Wheat (Kg)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWheat)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Commodity Distribution Donut Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4"
        >
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">
              Commodity Quota Share
            </h3>
            <p className="text-xs text-slate-400">
              Distribution ratio by volume this month
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.commodityDistributionBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.commodityDistributionBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#070d18" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1528',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(16,185,129,0.2)',
                  }}
                  formatter={(val: any) => [`${Number(val).toFixed(1)} units`, 'Distributed']}
                />
                <Legend
                  formatter={(val) => <span className="text-xs font-semibold text-slate-300">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 4. Shop-Wise Comparison Grid (for Super Admin / Auditor) */}
      {(user?.role === 'SUPER_ADMIN' || user?.role === 'AUDITOR') &&
        analytics?.shopComparisons &&
        analytics.shopComparisons.length > 0 && (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 size={16} className="text-emerald-400" />
                  <span>Fair Price Shops Inter-Center Comparison</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Regional stock holding and monthly delivery performance across outlets
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.shopComparisons.map((sc) => (
                <div
                  key={sc.shopId}
                  className="p-4 rounded-xl bg-slate-800/60 border border-white/10 space-y-2 text-xs hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{sc.shopName}</h4>
                      <span className="font-mono text-slate-400">{sc.shopNumber}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                      {sc.cardCount} Households
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono">Stock Available</span>
                      <span className="font-bold text-white font-mono">
                        {Number(sc.stockAvailableKg).toFixed(1)} Kg
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono">Monthly Dist.</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {Number(sc.monthlyDistributedKg).toFixed(1)} Kg
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 5. Recent Stock Movements & Traceable Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ledger Movements */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-3"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">
              Recent Traceable Stock Movements
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Immutable Ledger</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {analytics?.recentStockMovements?.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-white/10 flex items-center justify-between text-xs hover:border-emerald-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {m.commodityName}
                    </span>
                    <StatusBadge status={m.movementType} />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {m.reason}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {m.createdAt} &bull; Performed by {m.performedBy}
                  </span>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`font-mono font-bold text-sm ${
                      Number(m.quantity) > 0 ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {Number(m.quantity) > 0 ? `+${m.quantity}` : m.quantity} {m.measurementUnit}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    Bal: {m.balanceAfter} {m.measurementUnit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Beneficiary Distributions */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-3"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">
              Recent Completed Distributions
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">POS Receipts</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {analytics?.recentDistributions?.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl bg-slate-800/60 border border-white/10 flex items-center justify-between text-xs hover:border-emerald-500/40 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-emerald-400 block">
                    {d.transactionReference}
                  </span>
                  <span className="text-slate-300 block mt-0.5">
                    Card: <strong className="text-white">{d.cardNumber}</strong> ({d.headOfFamily})
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    {new Date(d.distributionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {d.distributedBy}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-emerald-400 block font-mono">
                    ₹{Number(d.totalAmount).toFixed(2)}
                  </span>
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
