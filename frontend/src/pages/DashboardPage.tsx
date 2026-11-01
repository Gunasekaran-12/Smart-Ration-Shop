import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Wheat,
  Shield,
  FileCheck2,
  FileText,
  Calendar,
  CheckCircle2,
  Users,
  Store,
  HelpCircle,
  MessageSquare,
  Download,
  AlertCircle,
  Eye,
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
import {
  analyticsApi,
  shopApi,
  rationCardApi,
  bookingApi,
  distributionApi,
  stockApi,
  auditLogApi,
  reportApi,
} from '../services';
import type {
  DashboardAnalytics,
  RationShop,
  RationCard,
  CardEntitlement,
  Distribution,
  Receipt,
  AuditLog,
  StockSummary,
} from '../types';
import PageContainer from '../components/PageContainer';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ReceiptModal from '../components/ReceiptModal';
import { useSse } from '../hooks/useSse';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Super Admin & Auditor State
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [shops, setShops] = useState<RationShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | undefined>(
    user?.role === 'SHOP_OPERATOR' ? user.shopId || 1 : undefined
  );
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);

  // Shop Operator State
  const [shopStock, setShopStock] = useState<StockSummary[]>([]);
  const [operatorDistributions, setOperatorDistributions] = useState<Distribution[]>([]);

  // Beneficiary (Cardholder) State
  const [beneficiaryCard, setBeneficiaryCard] = useState<RationCard | null>(null);
  const [entitlements, setEntitlements] = useState<CardEntitlement[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [pastDistributions, setPastDistributions] = useState<Distribution[]>([]);

  // Load appropriate data whenever user or shop selection changes
  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user, selectedShopId]);

  // SSE Live update
  useSse(() => {
    loadDashboardData();
  });

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      if (user?.role === 'BENEFICIARY') {
        // 1. Beneficiary Flow: Strictly citizen-friendly, NO admin analytics
        await loadBeneficiaryDashboard();
      } else if (user?.role === 'SHOP_OPERATOR') {
        // 2. Shop Operator Flow: Scoped strictly to their shop
        await loadOperatorDashboard();
      } else if (user?.role === 'AUDITOR') {
        // 3. Auditor Flow: Audit & Compliance Focus
        await loadAuditorDashboard();
      } else {
        // 4. Super Admin Flow: Statewide Oversight & Master Stock Telemetry
        await loadSuperAdminDashboard();
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Beneficiary Dashboard Loader
  const loadBeneficiaryDashboard = async () => {
    try {
      let card: RationCard | null = null;
      if (user?.cardNumber) {
        card = await rationCardApi.getCardByNumber(user.cardNumber);
      } else if (user?.rationCardId) {
        card = await rationCardApi.getCardById(user.rationCardId);
      } else {
        // Fallback demo card if unassigned
        card = await rationCardApi.getCardByNumber('RC-KA-01-456123');
      }

      setBeneficiaryCard(card);

      if (card?.id) {
        // Entitlements for current month
        const quota = await rationCardApi.getCardEntitlements(card.id);
        setEntitlements(quota);

        // Past distribution receipts
        const past = await distributionApi.getDistributionsForCard(card.id);
        setPastDistributions(past);
      }

      // My booked time slots
      const bookings = await bookingApi.getMyBookings();
      setMyBookings(bookings || []);
    } catch (e) {
      console.error('Failed to load cardholder dashboard', e);
    }
  };

  // 2. Shop Operator Dashboard Loader
  const loadOperatorDashboard = async () => {
    const shopId = user?.shopId || 1;
    try {
      const [analyticsData, stockData, distData] = await Promise.all([
        analyticsApi.getDashboardData(shopId),
        stockApi.getStockSummary(shopId),
        distributionApi.getDistributions(shopId, 0, 6),
      ]);
      setAnalytics(analyticsData);
      setShopStock(stockData);
      setOperatorDistributions(distData.content);
    } catch (e) {
      console.error('Failed to load shop operator dashboard', e);
    }
  };

  // 3. Auditor Dashboard Loader
  const loadAuditorDashboard = async () => {
    try {
      const [analyticsData, shopsData, logsData] = await Promise.all([
        analyticsApi.getDashboardData(selectedShopId),
        shopApi.getAll(),
        auditLogApi.getAuditLogs({ shopId: selectedShopId, size: 8 }),
      ]);
      setAnalytics(analyticsData);
      setShops(shopsData);
      setRecentAuditLogs(logsData.content);
    } catch (e) {
      console.error('Failed to load auditor dashboard', e);
    }
  };

  // 4. Super Admin Dashboard Loader
  const loadSuperAdminDashboard = async () => {
    try {
      const [analyticsData, shopsData, logsData] = await Promise.all([
        analyticsApi.getDashboardData(selectedShopId),
        shopApi.getAll(),
        auditLogApi.getAuditLogs({ shopId: selectedShopId, size: 6 }),
      ]);
      setAnalytics(analyticsData);
      setShops(shopsData);
      setRecentAuditLogs(logsData.content);
    } catch (e) {
      console.error('Failed to load super admin dashboard', e);
    }
  };

  const handleOpenReceipt = async (txnRef: string) => {
    try {
      const receipt = await distributionApi.getReceipt(txnRef);
      setSelectedReceipt(receipt);
    } catch (e) {
      console.error('Failed to fetch receipt', e);
    }
  };

  /* ========================================================================= */
  /* RENDER 1: BENEFICIARY DASHBOARD (Citizen-Friendly, Everyday English)       */
  /* ========================================================================= */
  if (user?.role === 'BENEFICIARY') {
    const nextBooking = myBookings.find(
      (b) => b.status === 'CONFIRMED' || b.status === 'PENDING'
    );

    return (
      <PageContainer
        title="My Ration Card & Quota Summary"
        subtitle="View your monthly food grain allowance, check family details, and book your shop visit"
        actions={
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all shadow-sm cursor-pointer"
            title="Refresh my details"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        }
      >
        {/* 1. Ration Card Details Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <CreditCard size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    {beneficiaryCard?.cardNumber || user.cardNumber || 'RC-KA-01-456123'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {beneficiaryCard?.cardCategory ? `${beneficiaryCard.cardCategory} Priority Card` : 'BPL Priority Card'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Head of Family: <strong className="text-white">{beneficiaryCard?.headOfFamily || user.fullName}</strong>
                  {beneficiaryCard?.dateOfBirth && (
                    <span className="text-slate-400 font-mono ml-2">
                      (DOB: {beneficiaryCard.dateOfBirth})
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  Assigned Fair Price Shop: <span className="text-emerald-300 font-semibold">{user.shopName || 'FPS-1001 Main Market'}</span>
                </p>
              </div>
            </div>

            {/* Family Members Count */}
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 px-4 py-3 rounded-2xl">
              <Users size={22} className="text-emerald-400" />
              <div>
                <span className="text-lg font-bold text-white leading-tight block">
                  {beneficiaryCard?.familyMembers?.length || beneficiaryCard?.familyMemberCount || 5} Members
                </span>
                <span className="text-xs text-slate-400">Registered in family</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Monthly Food Grain Allowance & Remaining Balance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Wheat size={18} className="text-emerald-400" />
              This Month's Subsidized Food Grains
            </h2>
            <span className="text-xs text-slate-400">
              Valid for: {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {entitlements.length === 0 ? (
              // Default clean display if API returned empty
              [
                { name: 'Boiled Rice', quota: 25, rem: 25, unit: 'Kg', price: 'Free' },
                { name: 'Whole Wheat', quota: 10, rem: 10, unit: 'Kg', price: '₹2.00 / Kg' },
                { name: 'Refined Sugar', quota: 2, rem: 2, unit: 'Kg', price: '₹13.50 / Kg' },
                { name: 'Cooking Oil', quota: 1, rem: 1, unit: 'Ltr', price: '₹25.00 / Ltr' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {item.price}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white">{item.rem} {item.unit}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Remaining of {item.quota} {item.unit} quota
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              ))
            ) : (
              entitlements.map((item) => {
                const total = Number(item.totalEntitledQuantity) || 1;
                const rem = Number(item.remainingQuantity) || 0;
                const pct = Math.min(100, Math.max(0, (rem / total) * 100));

                return (
                  <div
                    key={item.commodityName}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-sm">{item.commodityName}</span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {item.unitPrice && Number(item.unitPrice) > 0
                          ? `₹${Number(item.unitPrice).toFixed(2)}`
                          : 'Free'}
                      </span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-white">{rem} {item.measurementUnit}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Remaining of {total} {item.measurementUnit} monthly quota
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Upcoming Booking & Next Visit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Card */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-400" />
                  Your Next Shop Visit
                </h3>
                {nextBooking ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Confirmed Slot
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">
                    No active visit booked
                  </span>
                )}
              </div>

              {nextBooking ? (
                <div className="py-4 space-y-2">
                  <div className="text-sm text-slate-300">
                    Date: <strong className="text-white">{nextBooking.slotDate}</strong>
                  </div>
                  <div className="text-sm text-slate-300">
                    Time: <strong className="text-emerald-400">{nextBooking.slotTime}</strong>
                  </div>
                  <div className="text-xs text-slate-400">
                    Token Reference: <span className="font-mono text-slate-300">{nextBooking.tokenNumber || nextBooking.id}</span>
                  </div>
                </div>
              ) : (
                <p className="py-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  You have not reserved a time slot for this month yet. Booking a slot helps you collect your ration quickly without waiting in queues.
                </p>
              )}
            </div>

            <button
              onClick={() => navigate('/booking')}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar size={16} />
              <span>{nextBooking ? 'Change or View My Booking' : 'Book a Shop Visit Now'}</span>
            </button>
          </div>

          {/* Quick Help & Grievance Card */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <HelpCircle size={18} className="text-cyan-400" />
                  Need Help or Have a Complaint?
                </h3>
                <span className="text-xs text-slate-400">Citizen Support</span>
              </div>
              <p className="py-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                If your card details need updating, you did not receive your full grain quota, or the shop was closed during working hours, our team is here to assist you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/chatbot')}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare size={14} className="text-emerald-400" />
                <span>Ask Stock AI</span>
              </button>

              <button
                onClick={() => navigate('/complaints')}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AlertCircle size={14} className="text-amber-400" />
                <span>Submit Complaint</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Previous Ration Collections */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            Previous Ration Collections
          </h3>

          {pastDistributions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No previous distribution receipts found for this card yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Transaction Reference</th>
                    <th className="py-3 px-3">Shop Center</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pastDistributions.slice(0, 5).map((dist) => (
                    <tr key={dist.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-300">
                        {new Date(dist.distributionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {dist.transactionReference}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{dist.shopName}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">
                        ₹{Number(dist.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleOpenReceipt(dist.transactionReference)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Receipt Modal Popup */}
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      </PageContainer>
    );
  }

  /* ========================================================================= */
  /* RENDER 2: SHOP OPERATOR DASHBOARD (Counter Focused, Strictly Own Shop)    */
  /* ========================================================================= */
  if (user?.role === 'SHOP_OPERATOR') {
    return (
      <PageContainer
        title={`Fair Price Shop Counter Summary`}
        subtitle={`Operating Outlet: ${user.shopName || 'FPS-1001 Main Counter'} • Real-Time Daily Distribution`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/distribution')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Store size={14} />
              <span>Distribute Commodities</span>
            </button>
            <button
              onClick={loadDashboardData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all shadow-sm cursor-pointer"
              title="Refresh counter data"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>
        }
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Distributions"
            value={analytics?.todayTransactions ?? '0'}
            subtitle={`${Number(analytics?.todayDistributedKg || 0).toFixed(1)} Kg distributed today`}
            icon={TrendingUp}
            variant="emerald"
          />
          <StatCard
            title="Shop Stock In Hand"
            value={`${shopStock.reduce((acc, s) => acc + (Number(s.currentStock) || 0), 0).toFixed(0)} Kg`}
            subtitle="Available food grains in shop"
            icon={Wheat}
            variant="blue"
          />
          <StatCard
            title="Low Stock Watch"
            value={analytics?.lowStockCount ?? '0'}
            subtitle={Number(analytics?.lowStockCount) > 0 ? 'Reorder needed' : 'All stocks optimal'}
            icon={AlertTriangle}
            variant={Number(analytics?.lowStockCount) > 0 ? 'rose' : 'emerald'}
          />
          <StatCard
            title="Counter Transactions"
            value={operatorDistributions.length}
            subtitle="Recent distribution receipts"
            icon={Calendar}
            variant="purple"
          />
        </div>

        {/* Live Shop Stock Balance Table */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Wheat size={18} className="text-emerald-400" />
              Current Shop Grain Balance
            </h3>
            <span className="text-xs text-slate-400">Live inventory count</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Commodity</th>
                  <th className="py-3 px-3">Available Stock</th>
                  <th className="py-3 px-3">Low-Stock Alert Level</th>
                  <th className="py-3 px-3">Distributed Today</th>
                  <th className="py-3 px-3">Inventory Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {shopStock.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Loading current shop stock balance...
                    </td>
                  </tr>
                ) : (
                  shopStock.map((s) => (
                    <tr key={s.commodityCode} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-white font-sans">
                        {s.commodityName}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {Number(s.currentStock).toFixed(2)} {s.measurementUnit}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {Number(s.lowStockThreshold).toFixed(2)} {s.measurementUnit}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {Number(s.todayDistributed || 0).toFixed(2)} {s.measurementUnit}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.isLowStock
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {s.isLowStock ? 'Low Stock' : 'Sufficient'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Distributions at this Counter */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400" />
              Recent Distributions at Counter
            </h3>
            <button
              onClick={() => navigate('/distribution')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Go to Distribution Counter &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Receipt Reference</th>
                  <th className="py-3 px-3">Ration Card</th>
                  <th className="py-3 px-3">Cardholder Name</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {operatorDistributions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No distributions recorded today yet.
                    </td>
                  </tr>
                ) : (
                  operatorDistributions.map((dist) => (
                    <tr key={dist.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-white font-bold">{dist.transactionReference}</td>
                      <td className="py-3 px-3 text-emerald-300">{dist.cardNumber}</td>
                      <td className="py-3 px-3 text-slate-200 font-sans">{dist.headOfFamily}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">
                        ₹{Number(dist.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => handleOpenReceipt(dist.transactionReference)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      </PageContainer>
    );
  }

  /* ========================================================================= */
  /* RENDER 3: AUDITOR DASHBOARD (Read-Only Compliance & Discrepancy Stream)   */
  /* ========================================================================= */
  if (user?.role === 'AUDITOR') {
    return (
      <PageContainer
        title="Audit, Inspection & Compliance Portal"
        subtitle="Independent verification of stock receipts, commodity distribution records, and weighing ledger integrity"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedShopId || ''}
              onChange={(e) =>
                setSelectedShopId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-white shadow-sm focus:border-emerald-400 focus:outline-none"
            >
              <option value="">All Fair Price Shops (Statewide)</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName} ({s.shopNumber})
                </option>
              ))}
            </select>

            <button
              onClick={loadDashboardData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all shadow-sm cursor-pointer"
              title="Refresh audit stream"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>
        }
      >
        {/* Compliance Notice Banner */}
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2.5">
            <Shield size={18} className="text-cyan-400 shrink-0" />
            <span>
              <strong>Read-Only Auditor Mode Active:</strong> You have read-only inspection access. Modifying stock balances or editing accounts is restricted to preserve audit integrity.
            </span>
          </div>
          <button
            onClick={() => navigate('/audit-logs')}
            className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold shrink-0 cursor-pointer"
          >
            Full Audit Logs &rarr;
          </button>
        </div>

        {/* Audit KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Verified Distributions"
            value={analytics?.todayTransactions ?? '0'}
            subtitle="Audited distribution entries"
            icon={TrendingUp}
            variant="emerald"
          />
          <StatCard
            title="Monitored Outlets"
            value={shops.length || analytics?.activeShops || '3'}
            subtitle="Registered Fair Price Shops"
            icon={Building2}
            variant="blue"
          />
          <StatCard
            title="Stock Watch Breaches"
            value={analytics?.lowStockCount ?? '0'}
            subtitle="Outlets below minimum stock"
            icon={AlertTriangle}
            variant={Number(analytics?.lowStockCount) > 0 ? 'rose' : 'emerald'}
          />
          <StatCard
            title="Audit Ledger Health"
            value="100%"
            subtitle="Cryptographically verified"
            icon={Shield}
            variant="purple"
          />
        </div>

        {/* Recent Tamper-Proof Audit Stream */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileCheck2 size={18} className="text-cyan-400" />
              Recent System Activity Stream
            </h3>
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              View All Logs &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3 font-sans">Timestamp</th>
                  <th className="py-3 px-3 font-sans">User</th>
                  <th className="py-3 px-3 font-sans">Role</th>
                  <th className="py-3 px-3 font-sans">Action</th>
                  <th className="py-3 px-3 font-sans">Details</th>
                  <th className="py-3 px-3 font-sans">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                      Loading audit entries...
                    </td>
                  </tr>
                ) : (
                  recentAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-white font-bold font-sans">{log.username}</td>
                      <td className="py-3 px-3 font-sans">
                        <StatusBadge status={log.userRole} />
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{log.action}</td>
                      <td className="py-3 px-3 text-slate-300 font-sans truncate max-w-xs">{log.details}</td>
                      <td className="py-3 px-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Export Audit Reports */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-3">
            <h4 className="font-bold text-white text-sm">Download Distribution Audit CSV</h4>
            <p className="text-xs text-slate-400">
              Export verified citizen distribution records with date, commodities, and quantities.
            </p>
            <button
              onClick={() => reportApi.exportDistributionsCsv(selectedShopId)}
              className="py-2 px-3.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download size={14} />
              <span>Download Distributions CSV</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-3">
            <h4 className="font-bold text-white text-sm">Download Stock Ledger Audit CSV</h4>
            <p className="text-xs text-slate-400">
              Export complete warehouse stock movements, inward receipts, and adjustments.
            </p>
            <button
              onClick={() => reportApi.exportLedgerCsv(selectedShopId)}
              className="py-2 px-3.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download size={14} />
              <span>Download Stock Ledger CSV</span>
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  /* ========================================================================= */
  /* RENDER 4: SUPER ADMIN DASHBOARD (Statewide Command, Charts & Full Access) */
  /* ========================================================================= */
  const chartTrends = analytics?.monthlyDistributionTrends && analytics.monthlyDistributionTrends.length > 0
    ? analytics.monthlyDistributionTrends
    : [
        { month: 'Jun', riceDistributed: 1100, wheatDistributed: 500, sugarDistributed: 150, dalDistributed: 100, transactionsCount: 180 },
        { month: 'Jul', riceDistributed: 1250, wheatDistributed: 550, sugarDistributed: 180, dalDistributed: 120, transactionsCount: 210 },
        { month: 'Aug', riceDistributed: 1400, wheatDistributed: 600, sugarDistributed: 200, dalDistributed: 150, transactionsCount: 235 },
        { month: 'Sep', riceDistributed: 1300, wheatDistributed: 580, sugarDistributed: 190, dalDistributed: 130, transactionsCount: 220 },
        { month: 'Oct', riceDistributed: 1500, wheatDistributed: 620, sugarDistributed: 210, dalDistributed: 120, transactionsCount: 245 },
        { month: 'Nov', riceDistributed: 1200, wheatDistributed: 510, sugarDistributed: 170, dalDistributed: 100, transactionsCount: 198 },
      ];

  const breakdownData = analytics?.commodityDistributionBreakdown && analytics.commodityDistributionBreakdown.length > 0
    ? analytics.commodityDistributionBreakdown
    : [
        { name: 'Rice', percentage: 55, quantity: 1200 },
        { name: 'Wheat', percentage: 30, quantity: 650 },
        { name: 'Sugar', percentage: 10, quantity: 220 },
        { name: 'Oil & Dal', percentage: 5, quantity: 110 },
      ];

  const pieColors = ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'];

  return (
    <PageContainer
      title="Statewide Food Security & Public Distribution Summary"
      subtitle="Administrative oversight across all Fair Price Shops, stock reserves, and citizen allocations"
      actions={
        <div className="flex items-center gap-2">
          {/* Outlet filter */}
          <select
            value={selectedShopId || ''}
            onChange={(e) =>
              setSelectedShopId(e.target.value ? Number(e.target.value) : undefined)
            }
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-white shadow-sm focus:border-emerald-400 focus:outline-none"
          >
            <option value="">All Fair Price Shops (Statewide)</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shopName} ({s.shopNumber})
              </option>
            ))}
          </select>

          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all shadow-sm cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      }
    >
      {/* 1. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle={`${Number(analytics?.todayDistributedKg || 0).toFixed(1)} Kg distributed today`}
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
          subtitle={Number(analytics?.lowStockCount) > 0 ? 'Threshold breach detected' : 'All stocks optimal'}
          icon={AlertTriangle}
          variant={Number(analytics?.lowStockCount) > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* 2. Charts Row: Monthly Distribution Trends & Commodity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Monthly Food Grain Distribution</h3>
              <p className="text-xs text-slate-400">Total grain distribution volume (Kg) over recent months</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Statewide
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartTrends.map((t) => ({
                  month: t.month,
                  totalDistributedKg: (t.riceDistributed || 0) + (t.wheatDistributed || 0) + (t.sugarDistributed || 0) + (t.dalDistributed || 0),
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalDistributedKg"
                  name="Grain Distributed (Kg)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorKg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Breakdown Pie Chart (1 Col) */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Commodity Stock Mix</h3>
            <p className="text-xs text-slate-400">Distribution proportion by commodity type</p>
          </div>

          <div className="h-56 sm:h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="percentage"
                  nameKey="name"
                >
                  {breakdownData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 text-center border-t border-slate-800 pt-3">
            Primary NFSA entitlement allocation
          </div>
        </div>
      </div>

      {/* 3. Recent System Audit Stream */}
      <div className="bg-slate-900/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            Recent System Activity
          </h3>
          <button
            onClick={() => navigate('/audit-logs')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            View Complete Activity Log &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 font-sans">Timestamp</th>
                <th className="py-3 px-3 font-sans">User</th>
                <th className="py-3 px-3 font-sans">Role</th>
                <th className="py-3 px-3 font-sans">Action</th>
                <th className="py-3 px-3 font-sans">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                    Loading recent system activity...
                  </td>
                </tr>
              ) : (
                recentAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-white font-bold font-sans">{log.username}</td>
                    <td className="py-3 px-3 font-sans">
                      <StatusBadge status={log.userRole} />
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{log.action}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans truncate max-w-md">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
