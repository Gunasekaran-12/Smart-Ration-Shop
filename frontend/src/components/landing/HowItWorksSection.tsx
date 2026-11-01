import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PackageCheck,
  ClipboardList,
  BarChart2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Manage Inventory',
      subtitle: 'Central Warehouse Intake',
      description:
        'Fair Price Shops receive verified grain shipments from FCI or state buffer depots. Every inward consignment is logged with unique batch identifiers and warehouse references.',
      icon: PackageCheck,
      color: 'emerald',
      metric: 'Batch Tagged: 100%',
    },
    {
      step: '02',
      title: 'Record Stock Movements',
      subtitle: 'Traceable Stock Movements',
      description:
        'All inward receipts, POS outward distributions, physical audit reconciliations, and damage adjustments are tracked in an immutable FIFO stock ledger.',
      icon: ClipboardList,
      color: 'cyan',
      metric: 'FIFO Queue: Active',
    },
    {
      step: '03',
      title: 'Monitor Stock Analytics',
      subtitle: 'Real-Time Velocity Tracking',
      description:
        'Live Server-Sent Events (SSE) stream point-of-sale activities and depletion velocities straight to the central dashboard with sub-second responsiveness.',
      icon: BarChart2,
      color: 'teal',
      metric: 'Telemetry: < 0.12s',
    },
    {
      step: '04',
      title: 'Identify Shortages & Trends',
      subtitle: 'Predictive Runway Warning',
      description:
        'Automated low-stock threshold algorithms analyze daily consumption velocities to project days-until-stockout and flag replenishment needs before shortages occur.',
      icon: AlertCircle,
      color: 'amber',
      metric: 'Alert Runway: 14.2 Days',
    },
    {
      step: '05',
      title: 'Informed Distribution Decisions',
      subtitle: 'Accurate Citizen Entitlement Delivery',
      description:
        'Dealers execute biometric or OTP-verified distributions with statutory category caps (AAY, BPL, APL). Atomic database locks prevent duplicate monthly claims.',
      icon: CheckCircle,
      color: 'emerald',
      metric: 'Zero Double-Dips',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 lg:py-28 bg-[#0b1528] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles size={13} />
            <span>OPERATIONAL WORKFLOW</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            How Smart Ration Shop Management System{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Operates with Real-Time Stock Analytics
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            From FCI warehouse inwarding to biometric citizen distribution, every grain is accounted
            for in a verifiable digital pipeline.
          </p>
        </div>

        {/* Step Tabs / Indicators for Interactive Flow */}
        <div className="hidden lg:flex items-center justify-between relative mb-12 px-6">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-16 right-16 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-16 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${(activeStep / (steps.length - 1)) * 85}%` }}
          />

          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = activeStep === idx;
            const isCompleted = activeStep > idx;

            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className="relative z-10 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-110'
                      : isCompleted
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border border-slate-700/60 hover:border-slate-500'
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span
                  className={`mt-3 text-xs font-mono font-bold tracking-wider ${
                    isCurrent ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  STEP {s.step}
                </span>
                <span className="text-xs text-slate-300 font-medium hidden xl:block max-w-[120px] text-center truncate">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Highlight Card (Desktop & Mobile) */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Step Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STEP {steps[activeStep].step} OF 05
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  {steps[activeStep].subtitle}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {steps[activeStep].title}
              </h3>

              <p className="text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
                {steps[activeStep].description}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono font-semibold text-emerald-300 border border-white/10">
                  <Sparkles size={13} className="text-emerald-400" />
                  {steps[activeStep].metric}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-mono text-slate-300 border border-white/10">
                  Verifiable Audit Logged
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-stretch">
              <button
                onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200"
              >
                <span>{activeStep === steps.length - 1 ? 'Restart Flow' : 'Next Step'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStep === i ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

