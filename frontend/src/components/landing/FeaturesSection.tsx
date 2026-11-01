import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Layers,
  AlertTriangle,
  Scale,
  LineChart,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      id: 'real-time-analytics',
      title: 'Real-Time Stock Analytics',
      description:
        'Monitor stock levels and visualize inventory trends across all counters with dynamic updates and live analytics streaming.',
      icon: Activity,
      accentColor: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      iconColor: 'text-emerald-400',
      badge: 'Live Telemetry',
    },
    {
      id: 'smart-inventory',
      title: 'Smart Inventory Management',
      description:
        'Track commodity quantities, stock movements, batch receipts, and automated FIFO issuance from FCI warehouse to local shop.',
      icon: Layers,
      accentColor: 'from-cyan-500/20 to-blue-500/10',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      iconColor: 'text-cyan-400',
      badge: 'FIFO Batch Ledger',
    },
    {
      id: 'low-stock-alerts',
      title: 'Low-Stock Alerts',
      description:
        'Proactively highlight inventory needing replenishment before critical buffer stock thresholds are reached, preventing supply disruptions.',
      icon: AlertTriangle,
      accentColor: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      iconColor: 'text-amber-400',
      badge: 'Automated Thresholds',
    },
    {
      id: 'transparent-distribution',
      title: 'Transparent Distribution',
      description:
        'Support accurate ration stock records and traceable point-of-sale transactions with atomic deductions and digital receipts.',
      icon: Scale,
      accentColor: 'from-teal-500/20 to-emerald-500/10',
      borderColor: 'border-teal-500/30 hover:border-teal-400',
      iconColor: 'text-teal-400',
      badge: 'Atomic Deductions',
    },
    {
      id: 'data-driven-insights',
      title: 'Data-Driven Insights',
      description:
        'Present useful historical analytics and consumption trends for precise monthly allocation planning and buffer management.',
      icon: LineChart,
      accentColor: 'from-indigo-500/20 to-purple-500/10',
      borderColor: 'border-indigo-500/30 hover:border-indigo-400',
      iconColor: 'text-indigo-400',
      badge: 'Predictive Runway',
    },
    {
      id: 'role-based-access',
      title: 'Secure Role-Based Access',
      description:
        'Enforce strict security governance across System Administrators, Fair Price Shop Dealers, Beneficiaries, and Authorized Auditors.',
      icon: ShieldCheck,
      accentColor: 'from-emerald-500/20 to-cyan-500/10',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      iconColor: 'text-emerald-300',
      badge: 'RBAC & JWT',
    },
  ];

  return (
    <section id="features" className="relative py-20 lg:py-28 bg-[#070d18] overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles size={13} />
            <span>ENTERPRISE CAPABILITIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Comprehensive Control Across the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Distribution Chain
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Engineered to modernize traditional ration operations with atomic transactional
            integrity, end-to-end ledger verification, and real-time inventory intelligence.
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                whileHover={{ y: -6, scale: 1.015 }}
                className={`relative group rounded-2xl bg-slate-900/70 border ${feature.borderColor} p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between overflow-hidden`}
              >
                {/* Ambient Card Header Glow */}
                <div
                  className={`absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br ${feature.accentColor} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition duration-500 pointer-events-none`}
                />

                <div>
                  {/* Top Icon & Badge Row */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`p-3 rounded-xl bg-slate-800/90 border border-white/10 ${feature.iconColor} shadow-inner group-hover:scale-105 transition-transform duration-300`}
                    >
                      <Icon size={22} />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2.5 group-hover:text-emerald-300 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Visual Indicator */}
                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>MODULE 0{idx + 1}</span>
                  <span className="text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Integrated <ArrowUpRight size={13} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

