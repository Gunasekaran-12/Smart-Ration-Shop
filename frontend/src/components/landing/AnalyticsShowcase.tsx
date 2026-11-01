import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Package,
  Layers,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const AnalyticsShowcase: React.FC = () => {

  const commodities = [
    {
      code: 'RICE',
      name: 'Boiled Rice (Grade A)',
      totalStock: 2450,
      capacity: 3000,
      distributed: 2550,
      allocated: 5000,
      status: 'OPTIMAL',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      runwayDays: 18,
      percentage: 82,
      fillColor: 'from-emerald-500 to-teal-400',
    },
    {
      code: 'WHEAT',
      name: 'Whole Milling Wheat',
      totalStock: 1820,
      capacity: 2500,
      distributed: 1680,
      allocated: 3500,
      status: 'STABLE',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      runwayDays: 14,
      percentage: 73,
      fillColor: 'from-amber-500 to-yellow-400',
    },
    {
      code: 'SUGAR',
      name: 'Refined Cane Sugar',
      totalStock: 640,
      capacity: 800,
      distributed: 160,
      allocated: 800,
      status: 'OPTIMAL',
      statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      runwayDays: 24,
      percentage: 80,
      fillColor: 'from-cyan-500 to-blue-400',
    },
    {
      code: 'DAL',
      name: 'Toor Dal (Pigeon Peas)',
      totalStock: 920,
      capacity: 1500,
      distributed: 580,
      allocated: 1500,
      status: 'HEALTHY',
      statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      runwayDays: 16,
      percentage: 61,
      fillColor: 'from-purple-500 to-indigo-400',
    },
  ];

  const weeklyTrend = [
    { day: 'Mon', rice: 420, wheat: 310, height: '65%' },
    { day: 'Tue', rice: 510, wheat: 380, height: '80%' },
    { day: 'Wed', rice: 680, wheat: 460, height: '95%' },
    { day: 'Thu', rice: 490, wheat: 340, height: '72%' },
    { day: 'Fri', rice: 380, wheat: 280, height: '58%' },
    { day: 'Sat', rice: 720, wheat: 530, height: '100%' },
    { day: 'Sun', rice: 210, wheat: 150, height: '35%' },
  ];

  return (
    <section id="analytics" className="relative py-20 lg:py-28 bg-[#070d18] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-cyan-600/10 via-emerald-600/10 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase">
            <BarChart3 size={13} />
            <span>EXECUTIVE DASHBOARD PREVIEW</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            High-Velocity{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Real-Time Stock Analytics
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Gain complete operational transparency with continuous stock level tracking, buffer stockout
            projections, and category-wise quota distributions.
          </p>
        </div>

        {/* The Dashboard Frame */}
        <div className="relative rounded-3xl bg-slate-950/80 border border-emerald-500/30 p-4 sm:p-7 lg:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-2xl overflow-hidden">
          {/* Top Banner: Explicit Demo Disclaimer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                LIVE FPS OUTLET MONITOR
              </span>
              <span className="text-slate-500">|</span>
              <span className="font-mono text-xs text-emerald-400 font-semibold">
                SHOP: FPS-1001 (Gandhi Nagar Central)
              </span>
            </div>

            {/* Clear Demo Data Tag Required by Prompt */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <AlertCircle size={13} />
              <span>DEMO DATA • SIMULATED METRICS</span>
            </div>
          </div>

          {/* 4 KPI Counter Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-6 sm:my-8">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Total Buffer Stock</span>
                <Package size={15} className="text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white">5,830 KG</div>
              <div className="text-[11px] font-mono text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp size={12} /> 82.4% Optimal Fill
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Distributed (MTD)</span>
                <TrendingUp size={15} className="text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">4,970 KG</div>
              <div className="text-[11px] font-mono text-slate-400 font-medium">
                450 Families Served
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Avg. Stock Runway</span>
                <Clock size={15} className="text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">14.2 Days</div>
              <div className="text-[11px] font-mono text-emerald-400 font-medium">
                No Stockouts Projected
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Audit Accuracy</span>
                <ShieldCheck size={15} className="text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300">99.8%</div>
              <div className="text-[11px] font-mono text-slate-400 font-medium">
                0 Physical Discrepancies
              </div>
            </div>
          </div>

          {/* Main Grid: Commodity Breakdown + Weekly Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left: 4 Commodity Level Meters */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers size={16} className="text-emerald-400" /> Primary Commodity Stock Reserves
                </span>
                <span className="text-xs font-mono text-slate-400">Monthly Allocation: 10,800 KG</span>
              </div>

              <div className="space-y-3.5">
                {commodities.map((item) => (
                  <div
                    key={item.code}
                    className="p-4 rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.name}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {item.totalStock.toLocaleString()} KG
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${item.fillColor}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Distributed: {item.distributed.toLocaleString()} KG</span>
                      <span>Runway: ~{item.runwayDays} Days</span>
                      <span>Cap: {item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Simulated Weekly Distribution Trend Visualization */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/60 border border-white/10 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-cyan-400" /> Daily Distribution Velocity
                </span>
                <span className="text-[11px] font-mono text-slate-400">Grain Volume (KG)</span>
              </div>

              {/* Weekly Vertical Bar Simulation */}
              <div className="h-52 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
                {weeklyTrend.map((col) => (
                  <div key={col.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.rice}kg
                    </div>
                    <div className="w-full max-w-[28px] bg-slate-800/80 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: col.height }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="w-full bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t-md group-hover:brightness-125 transition-all"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-white transition-colors">
                      {col.day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  Peak Days: Wed & Sat
                </span>
                <span className="text-emerald-400 font-semibold">Real-Time Sync Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsShowcase;
