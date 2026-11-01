import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackagePlus,
  AlertOctagon,
  CheckCircle,
  Layers,
  ArrowDownRight,
  History,
  PlusCircle,
  Search,
  Filter,
  X,
  PackageCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { stockApi, commodityApi } from '../services';
import type { StockMovement, StockBatch, Commodity, StockSummary } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const StockManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'movements' | 'receive' | 'adjust' | 'overview'>('overview');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [stockSummaries, setStockSummaries] = useState<StockSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filters for commodities / stock
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // New Commodity Modal State (Super Admin)
  const [isAddCommodityOpen, setIsAddCommodityOpen] = useState(false);
  const [commodityForm, setCommodityForm] = useState({
    code: '',
    name: '',
    measurementUnit: 'KG',
    subsidizedPrice: 0.0,
    lowStockThreshold: 50.0,
  });

  // Inward Receipt Form State
  const [receiveForm, setReceiveForm] = useState({
    commodityId: 1,
    batchNumber: '',
    warehouseRef: '',
    receivedDate: new Date().toISOString().split('T')[0],
    quantity: 1000,
  });

  // Adjustment Form State
  const [adjustForm, setAdjustForm] = useState({
    commodityId: 1,
    batchId: '',
    movementType: 'ADJUSTMENT_DAMAGE',
    quantity: 10,
    reason: '',
  });

  useEffect(() => {
    loadCommodities();
    loadBatches();
    loadStockSummaries();
    loadMovements();
  }, [page]);

  const loadStockSummaries = async () => {
    try {
      const data = await stockApi.getStockSummary(user?.shopId || 1);
      setStockSummaries(data);
    } catch (e) {
      console.error('Failed to load stock summaries', e);
    }
  };

  const loadCommodities = async () => {
    try {
      const data = await commodityApi.getAll();
      setCommodities(data);
      if (data.length > 0) {
        setReceiveForm((f) => ({ ...f, commodityId: data[0].id }));
        setAdjustForm((f) => ({ ...f, commodityId: data[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBatches = async () => {
    try {
      const data = await stockApi.getBatches(user?.shopId || 1);
      setBatches(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMovements = async () => {
    setIsLoading(true);
    try {
      const data = await stockApi.getMovements(user?.shopId || 1, page, 10);
      setMovements(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!receiveForm.batchNumber.trim() || !receiveForm.warehouseRef.trim()) {
      setErrorMsg('Please specify batch number and warehouse challan reference.');
      return;
    }

    try {
      await stockApi.receiveStock({
        shopId: user?.shopId || 1,
        commodityId: Number(receiveForm.commodityId),
        batchNumber: receiveForm.batchNumber.trim().toUpperCase(),
        warehouseRef: receiveForm.warehouseRef.trim().toUpperCase(),
        receivedDate: receiveForm.receivedDate,
        quantity: Number(receiveForm.quantity),
      });

      setSuccessMsg('Stock batch successfully recorded in traceable ledger!');
      loadMovements();
      loadBatches();
      loadStockSummaries();
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record stock batch');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!adjustForm.reason.trim()) {
      setErrorMsg('Audit reason is required for any stock adjustment.');
      return;
    }

    try {
      await stockApi.adjustStock({
        shopId: user?.shopId || 1,
        commodityId: Number(adjustForm.commodityId),
        batchId: adjustForm.batchId ? Number(adjustForm.batchId) : undefined,
        movementType: adjustForm.movementType,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      });

      setSuccessMsg('Stock adjustment recorded successfully.');
      loadMovements();
      loadBatches();
      loadStockSummaries();
      setActiveTab('overview');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to process adjustment');
    }
  };

  const handleCreateCommodity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!commodityForm.code.trim() || !commodityForm.name.trim()) {
      setErrorMsg('Commodity code and name are mandatory.');
      return;
    }

    try {
      await commodityApi.create({
        code: commodityForm.code.trim().toUpperCase(),
        name: commodityForm.name.trim(),
        measurementUnit: commodityForm.measurementUnit.trim().toUpperCase(),
        subsidizedPrice: Number(commodityForm.subsidizedPrice),
        lowStockThreshold: Number(commodityForm.lowStockThreshold),
        isActive: true,
      });

      setSuccessMsg(`Commodity "${commodityForm.name}" created successfully.`);
      setIsAddCommodityOpen(false);
      setCommodityForm({
        code: '',
        name: '',
        measurementUnit: 'KG',
        subsidizedPrice: 0.0,
        lowStockThreshold: 50.0,
      });
      loadCommodities();
      loadStockSummaries();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create new commodity');
    }
  };

  // Filtered summaries
  const filteredSummaries = stockSummaries.filter((s) => {
    const matchesQuery = s.commodityName.toLowerCase().includes(searchQuery.toLowerCase())
      || s.commodityCode.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    if (stockFilter === 'IN_STOCK') return Number(s.currentStock) > Number(s.lowStockThreshold);
    if (stockFilter === 'LOW_STOCK') return Number(s.currentStock) > 0 && Number(s.currentStock) <= Number(s.lowStockThreshold);
    if (stockFilter === 'OUT_OF_STOCK') return Number(s.currentStock) <= 0;
    return true;
  });

  return (
    <PageContainer
      title="Warehouse Stock Ledger & Movements"
      subtitle="Centralized, persistent inventory management with real-time stock balances and traceable audit ledger"
      actions={
        user?.role !== 'AUDITOR' ? (
          <div className="flex items-center gap-2">
            {user?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => setIsAddCommodityOpen(true)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all shadow-sm"
              >
                <PlusCircle size={15} />
                <span>Add Commodity</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PackageCheck size={16} />
              Stock Overview
            </button>
            <button
              onClick={() => setActiveTab('receive')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'receive'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PackagePlus size={16} />
              Inward Receipt
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'adjust'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold shadow-lg shadow-amber-950/50'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <AlertOctagon size={16} />
              Stock Adjustment
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'movements'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History size={16} />
              Audit Ledger
            </button>
          </div>
        ) : undefined
      }
    >
      {/* Alert Banners */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-sm backdrop-blur-md">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shadow-sm backdrop-blur-md">
          <AlertOctagon size={18} className="text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. STOCK OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#091120]/90 border border-white/10 backdrop-blur-xl">
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commodity by name or code..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Filter size={12} /> Filter:
              </span>
              {(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStockFilter(mode)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono uppercase font-bold transition-all ${
                    stockFilter === mode
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSummaries.map((s) => {
              const stock = Number(s.currentStock);
              const threshold = Number(s.lowStockThreshold);
              const isOut = stock <= 0;
              const isLow = !isOut && stock <= threshold;

              return (
                <div
                  key={s.commodityId}
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1629]/90 to-[#070d18]/90 border border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-all shadow-xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Code: {s.commodityCode}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{s.commodityName}</h4>
                    </div>
                    {isOut ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold">
                        OUT OF STOCK
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                        LOW BUFFER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                        IN STOCK
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono">Available Stock</span>
                      <div className="text-2xl font-black text-white">
                        {stock.toFixed(2)} <span className="text-xs font-normal text-slate-400">{s.measurementUnit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono">Buffer Threshold</span>
                      <div className="text-xs font-bold text-slate-300">
                        {threshold.toFixed(2)} {s.measurementUnit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 font-mono">
                    <span>Today Distributed: {Number(s.todayDistributed || 0).toFixed(2)} {s.measurementUnit}</span>
                    <button
                      onClick={() => {
                        setReceiveForm((f) => ({ ...f, commodityId: s.commodityId }));
                        setActiveTab('receive');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold underline"
                    >
                      + Add Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 2. TRACEABLE MOVEMENTS LEDGER TAB */}
      {activeTab === 'movements' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl overflow-hidden"
        >
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <History size={16} className="text-emerald-400" />
                <span>Traceable Stock Movements Ledger</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chronological audit record of every receipt, distribution deduction, and adjustment
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {isLoading ? 'Loading...' : `Page ${page + 1} of ${totalPages || 1}`} ({batches.length} tracked batches)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Balance After</th>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Audit Reason</th>
                  <th className="py-3 px-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                      {isLoading ? 'Loading movements ledger...' : 'No stock movements recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(m.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-1.5">
                        <Layers size={13} className="text-slate-500" />
                        {m.commodity?.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={m.movementType} />
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold ${
                          m.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.commodity?.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                        {m.balanceAfter} {m.commodity?.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-[120px]">
                        {m.referenceId || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-sans truncate max-w-[200px]" title={m.reason}>
                        {m.reason || 'Standard transaction'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-sans">
                        {m.performedByUser ? m.performedByUser.fullName : 'System'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/20 text-xs">
            <button
              disabled={page <= 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-400">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. INWARD RECEIPT TAB */}
      {activeTab === 'receive' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700/70 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] max-w-xl mx-auto space-y-5 text-slate-100"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PackagePlus size={20} className="text-emerald-400" />
              <span>Record Warehouse Inward Consignment</span>
            </h3>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleReceiveStock} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Commodity
              </label>
              <select
                value={receiveForm.commodityId}
                onChange={(e) => setReceiveForm({ ...receiveForm, commodityId: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-emerald-500/80 focus:outline-none"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - Unit: {c.measurementUnit}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={receiveForm.batchNumber}
                  onChange={(e) => setReceiveForm({ ...receiveForm, batchNumber: e.target.value })}
                  placeholder="e.g. BATCH-2026-RICE-03"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:border-emerald-500/80 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Warehouse Challan / Ref
                </label>
                <input
                  type="text"
                  value={receiveForm.warehouseRef}
                  onChange={(e) => setReceiveForm({ ...receiveForm, warehouseRef: e.target.value })}
                  placeholder="e.g. FCI-WH-BLR-904"
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:border-emerald-500/80 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Received Date
                </label>
                <input
                  type="date"
                  value={receiveForm.receivedDate}
                  onChange={(e) => setReceiveForm({ ...receiveForm, receivedDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:border-emerald-500/80 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Received Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={receiveForm.quantity}
                  onChange={(e) => setReceiveForm({ ...receiveForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-bold focus:border-emerald-500/80 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
              >
                <ArrowDownRight size={15} />
                Save Inward Receipt
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 4. STOCK ADJUSTMENT TAB */}
      {activeTab === 'adjust' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900 border border-slate-700/70 rounded-3xl p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] max-w-xl mx-auto space-y-5 text-slate-100"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertOctagon size={20} className="text-amber-400" />
              <span>Record Authorized Stock Adjustment</span>
            </h3>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAdjustStock} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Commodity to Adjust
              </label>
              <select
                value={adjustForm.commodityId}
                onChange={(e) => setAdjustForm({ ...adjustForm, commodityId: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-amber-400/80 focus:outline-none"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.measurementUnit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustForm.movementType}
                  onChange={(e) => setAdjustForm({ ...adjustForm, movementType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-amber-400/80 focus:outline-none"
                >
                  <option value="ADJUSTMENT_DAMAGE">Damage (Moisture / Pest)</option>
                  <option value="ADJUSTMENT_CORRECTION">Correction (Scale Calibration)</option>
                  <option value="ADJUSTMENT_TRANSFER">Inter-Shop Stock Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Quantity to Deduct
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-bold focus:border-amber-400/80 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Mandatory Audit Reason & Responsible Officer
              </label>
              <textarea
                rows={3}
                required
                value={adjustForm.reason}
                onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                placeholder="Explain justification for adjustment for inspector verification..."
                className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:outline-none focus:border-amber-400/80 font-sans"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3 font-sans">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-950/50 transition-all"
              >
                Submit Adjustment
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 5. ADD COMMODITY MODAL (Super Admin) */}
      <AnimatePresence>
        {isAddCommodityOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0c1629] border border-white/10 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PlusCircle size={16} className="text-emerald-400" />
                  <span>Register New Ration Commodity</span>
                </h3>
                <button
                  onClick={() => setIsAddCommodityOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateCommodity} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Commodity Code (Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GRAM_DAL"
                    value={commodityForm.code}
                    onChange={(e) => setCommodityForm({ ...commodityForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white uppercase focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Commodity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengal Gram / கொண்டக்கடலை"
                    value={commodityForm.name}
                    onChange={(e) => setCommodityForm({ ...commodityForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Unit</label>
                    <select
                      value={commodityForm.measurementUnit}
                      onChange={(e) => setCommodityForm({ ...commodityForm, measurementUnit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none font-mono"
                    >
                      <option value="KG">KG</option>
                      <option value="LITRE">LITRE</option>
                      <option value="PACKET">PACKET</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Price (₹)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={commodityForm.subsidizedPrice}
                      onChange={(e) => setCommodityForm({ ...commodityForm, subsidizedPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Low Buffer</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={commodityForm.lowStockThreshold}
                      onChange={(e) => setCommodityForm({ ...commodityForm, lowStockThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddCommodityOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md"
                  >
                    Register Commodity
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default StockManagementPage;
