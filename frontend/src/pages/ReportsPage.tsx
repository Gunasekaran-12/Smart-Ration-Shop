import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart2,
  Download,
  Calendar,
  Building,
  RefreshCw,
  Printer,
  Sparkles,
  AlertTriangle,
  Database,
  CheckCircle2,
  Copy,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportApi, shopApi, reconciliationApi } from '../services';
import type { RationShop, TransactionConflict } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'RECONCILIATION' | 'CONFLICTS' | 'POWER_BI'>('RECONCILIATION');
  const [shops, setShops] = useState<RationShop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number>(user?.shopId || 1);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [conflicts, setConflicts] = useState<TransactionConflict[]>([]);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [selectedConflictId, setSelectedConflictId] = useState<number | null>(null);
  const [conflictActionError, setConflictActionError] = useState<string | null>(null);

  useEffect(() => {
    shopApi.getAll().then((data) => {
      setShops(data);
      if (data.length > 0 && !user?.shopId) {
        setSelectedShopId(data[0].id);
      }
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'RECONCILIATION') {
      loadReconciliation();
    } else if (activeTab === 'CONFLICTS') {
      loadConflicts();
    }
  }, [selectedShopId, activeTab]);

  const loadReconciliation = async () => {
    setIsLoading(true);
    try {
      const data = await reportApi.getReconciliation(selectedShopId);
      setReconciliation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConflicts = async () => {
    setIsLoading(true);
    try {
      const data = await reconciliationApi.getConflicts(selectedShopId);
      setConflicts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveConflict = async (conflictId: number, action: 'RESOLVED' | 'DISMISSED') => {
    setConflictActionError(null);
    try {
      await reconciliationApi.resolveConflict(conflictId, {
        action,
        resolutionRemarks: resolutionRemarks || `Resolution marked as ${action} by ${user?.fullName}`,
      });
      setSelectedConflictId(null);
      setResolutionRemarks('');
      loadConflicts();
    } catch (err: any) {
      setConflictActionError(
        err.response?.data?.message || 'Failed to resolve conflict. Check role permissions.'
      );
    }
  };

  const handleExportDistributions = () => {
    reportApi.exportDistributionsCsv(selectedShopId, startDate, endDate);
  };

  const handleExportLedger = () => {
    reportApi.exportLedgerCsv(selectedShopId);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const powerBiViews = [
    {
      name: 'vw_stock_analytics',
      description: 'Real-time commodity stock levels, low-stock threshold triggers, and days until stockout.',
      columns: 'shop_id, shop_name, commodity_id, commodity_name, current_stock, low_stock_threshold, is_low_stock, days_until_stockout',
      sampleSql: 'SELECT * FROM vw_stock_analytics WHERE shop_id = 1;',
    },
    {
      name: 'vw_monthly_distribution',
      description: 'Historical commodity monthly aggregation for trend analysis and demand forecasting.',
      columns: 'month_year, shop_id, commodity_name, total_quantity_distributed, total_revenue_inr, total_transactions',
      sampleSql: 'SELECT * FROM vw_monthly_distribution ORDER BY month_year DESC;',
    },
    {
      name: 'vw_conflict_analytics',
      description: 'Audit tracking for physical stock discrepancies, conflict statuses, and resolution latency.',
      columns: 'id, shop_id, conflict_type, status, raised_by_user_id, resolved_by_user_id, created_at, resolved_at',
      sampleSql: 'SELECT * FROM vw_conflict_analytics WHERE status = "OPEN";',
    },
    {
      name: 'vw_transaction_lifecycle',
      description: 'Distribution state progression tracking from INITIATED to COMPLETED.',
      columns: 'id, transaction_reference, shop_id, ration_card_id, lifecycle_state, distribution_date, total_amount',
      sampleSql: 'SELECT * FROM vw_transaction_lifecycle LIMIT 50;',
    },
    {
      name: 'vw_entitlement_utilization',
      description: 'Beneficiary card category utilization rates against statutory NFSA quotas.',
      columns: 'ration_card_id, card_number, card_category, commodity_name, allocated_quantity, distributed_quantity, utilization_pct',
      sampleSql: 'SELECT * FROM vw_entitlement_utilization WHERE utilization_pct < 50;',
    },
    {
      name: 'vw_booking_analytics',
      description: 'Ration slot booking demand, crowd distribution, and interval capacity utilization.',
      columns: 'slot_date, slot_time, shop_id, booked_count, max_capacity, slot_status',
      sampleSql: 'SELECT * FROM vw_booking_analytics WHERE slot_date = CURDATE();',
    },
  ];

  return (
    <PageContainer
      title="Statutory Audit Reports & Stock Reconciliation"
      subtitle="Mathematical ledger consistency, physical conflict reconciliation, and Power BI DirectQuery database analytics"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDistributions}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={15} />
            Export Distributions CSV
          </button>
          <button
            onClick={handleExportLedger}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={15} />
            Export Ledger CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all print:hidden cursor-pointer"
          >
            <Printer size={15} />
            Print
          </button>
        </div>
      }
    >
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 print:hidden">
        <button
          onClick={() => setActiveTab('RECONCILIATION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'RECONCILIATION'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <FileBarChart2 size={15} />
          <span>Stock Reconciliation Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('CONFLICTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'CONFLICTS'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <AlertTriangle size={15} />
          <span>Discrepancy & Conflict Workflow</span>
          {conflicts.filter((c) => c.status === 'OPEN').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
              {conflicts.filter((c) => c.status === 'OPEN').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('POWER_BI')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'POWER_BI'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <Database size={15} />
          <span>Power BI Live Database Views (6)</span>
        </button>
      </div>

      {/* Controls Bar for Reconciliation & Conflicts */}
      {activeTab !== 'POWER_BI' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 text-xs print:hidden"
        >
          <div className="flex items-center gap-3">
            <Building size={16} className="text-emerald-400" />
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-slate-100 font-semibold focus:border-emerald-400 focus:outline-none font-mono"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName} ({s.shopNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <Calendar size={16} className="text-emerald-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-100 focus:border-emerald-400 focus:outline-none"
            />
            <span className="text-slate-500 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-100 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </motion.div>
      )}

      {/* TAB 1: STOCK RECONCILIATION */}
      {activeTab === 'RECONCILIATION' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-950/30">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileBarChart2 size={18} className="text-emerald-400" />
                <span>Expected vs. Actual Stock Balance Reconciliation</span>
                <Sparkles size={14} className="text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formula: Expected Stock = Opening Stock + Inward Receipts - Distributions + Authorized Adjustments
              </p>
            </div>

            <button
              onClick={loadReconciliation}
              className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
              title="Recalculate"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-white/10 font-mono text-[11px]">
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4 text-right">Inward Receipts</th>
                  <th className="py-3 px-4 text-right">Distributions</th>
                  <th className="py-3 px-4 text-right">Adjustments</th>
                  <th className="py-3 px-4 text-right">Calculated Expected Stock</th>
                  <th className="py-3 px-4 text-right">Actual Recorded Stock</th>
                  <th className="py-3 px-4 text-center">Variance / Discrepancy</th>
                  <th className="py-3 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {!reconciliation?.reconciliationData || reconciliation.reconciliationData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                      {isLoading ? 'Computing mathematical reconciliation...' : 'No stock balance records found for selected shop.'}
                    </td>
                  </tr>
                ) : (
                  reconciliation.reconciliationData.map((row: any) => (
                    <tr key={row.commodityId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">
                        {row.commodityName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-400">
                        +{Number(row.inwardReceipts).toFixed(2)} {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        -{Number(row.distributions).toFixed(2)} {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-400">
                        {Number(row.adjustments).toFixed(2)} {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                        {Number(row.expectedStock).toFixed(2)} {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-white">
                        {Number(row.actualRecordedStock).toFixed(2)} {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {Number(row.discrepancy) === 0 ? (
                          <span className="text-emerald-400">0.00 {row.unit}</span>
                        ) : (
                          <span className="text-rose-400">
                            {Number(row.discrepancy) > 0 ? `+${row.discrepancy}` : row.discrepancy} {row.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 2: CONFLICT RECONCILIATION INNOVATION */}
      {activeTab === 'CONFLICTS' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {conflictActionError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-400 flex-shrink-0" />
              <span>{conflictActionError}</span>
            </div>
          )}

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <span>Physical Inventory vs. Pos Ledger Discrepancies</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reconciliation audit log with strict rejection of operator self-approval (Admin or Auditor verification required)
                </p>
              </div>

              <button
                onClick={loadConflicts}
                className="p-2 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {conflicts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">
                No inventory conflicts or discrepancies reported for this shop. All transactions balanced.
              </div>
            ) : (
              <div className="space-y-3">
                {conflicts.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-white">{c.transactionReference}</span>
                        <span className="text-slate-400">&bull; Card: {c.cardNumber}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                          c.status === 'OPEN'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : c.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/60 p-3 rounded-lg border border-white/5">
                      <div>
                        <span className="text-slate-400 block font-bold mb-1">Expected Stock Allocation:</span>
                        <code className="text-emerald-300 break-all">{c.expectedStockJson}</code>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold mb-1">Physical Count Observed:</span>
                        <code className="text-amber-300 break-all">{c.actualStockJson}</code>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Raised by: <strong>{c.raisedByUsername}</strong> on {new Date(c.createdAt).toLocaleDateString()}</span>
                      {c.resolvedByUsername && (
                        <span className="text-emerald-400">Resolved by: {c.resolvedByUsername}</span>
                      )}
                    </div>

                    {c.status === 'OPEN' && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                        {selectedConflictId === c.id ? (
                          <div className="w-full flex items-center gap-2">
                            <input
                              type="text"
                              value={resolutionRemarks}
                              onChange={(e) => setResolutionRemarks(e.target.value)}
                              placeholder="Enter resolution remarks..."
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                            />
                            <button
                              onClick={() => handleResolveConflict(c.id, 'RESOLVED')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                            >
                              Approve Adjustment
                            </button>
                            <button
                              onClick={() => handleResolveConflict(c.id, 'DISMISSED')}
                              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs cursor-pointer"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => setSelectedConflictId(null)}
                              className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedConflictId(c.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold ml-auto cursor-pointer"
                          >
                            Resolve Discrepancy
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 3: POWER BI LIVE DATABASE VIEWS */}
      {activeTab === 'POWER_BI' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* DirectQuery Connection Guide */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Database size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Microsoft Power BI & Tableau DirectQuery Integration
                </h3>
                <p className="text-xs text-slate-300">
                  Connect business intelligence software directly to MySQL views in database <code className="text-emerald-400 font-bold">smart</code>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Host Server</span>
                <span className="font-bold text-white">localhost:3306</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Database Name</span>
                <span className="font-bold text-emerald-400">smart</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Driver Protocol</span>
                <span className="font-bold text-white">MySQL ODBC 8.0</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Connection Mode</span>
                <span className="font-bold text-emerald-400">DirectQuery / Live</span>
              </div>
            </div>
          </div>

          {/* 6 Analytical Views Catalog */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {powerBiViews.map((view) => (
              <div
                key={view.name}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {view.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10 font-mono">
                      SQL VIEW
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {view.description}
                  </p>
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-400 font-mono block mb-0.5 uppercase">Columns:</span>
                    <p className="text-[11px] font-mono text-slate-400 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-white/5">
                      {view.columns}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">MySQL 8.0 View</span>
                  <button
                    onClick={() => copyToClipboard(view.sampleSql, view.name)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all border border-emerald-500/20 cursor-pointer"
                  >
                    {copyFeedback === view.name ? (
                      <>
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Query</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default ReportsPage;
