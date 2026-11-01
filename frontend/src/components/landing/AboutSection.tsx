import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Scale,
  Cpu,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AboutSection: React.FC = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      title: 'Ledger Transparency',
      desc: 'Cryptographic batch traceability from regional warehouses to final citizen receipt, eliminating diversion.',
      icon: Scale,
      color: 'emerald',
    },
    {
      title: 'Automated Precision',
      desc: 'Sub-second quota calculations adhering strictly to statutory household limits and member categories.',
      icon: Cpu,
      color: 'cyan',
    },
    {
      title: 'Zero-Waste Supply',
      desc: 'Continuous depletion velocity modeling that prevents stockouts and reduces warehouse holding spoilage.',
      icon: ShieldCheck,
      color: 'teal',
    },
    {
      title: 'Citizen Empowerment',
      desc: 'Transparent entitlement visibility, instant digital receipts, and direct grievance submission channels.',
      icon: HeartHandshake,
      color: 'amber',
    },
  ];

  return (
    <section id="about" className="relative py-20 lg:py-28 bg-[#0b1528] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Mission Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles size={13} />
              <span>OUR PLATFORM ARCHITECTURE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Modernizing Food Security Through{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Verifiable Systems
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              The <strong className="text-white">Smart Ration Shop Management System with Real-Time Stock Analytics</strong> is
              designed to solve core supply-chain challenges in the Public Distribution System (PDS). By unifying warehouse
              consignment intakes, FIFO inventory ledgers, and atomic point-of-sale transactions into a single
              synchronized architecture, shops gain effortless compliance and complete stock clarity.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-400 mt-1 shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Statutory Rule Compliance:</strong> Dynamic quota
                  computation supporting AAY, BPL/PHH, and APL allocation schedules.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-cyan-400 mt-1 shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Strict Double-Dip Prevention:</strong> Database-level
                  atomic transactions prevent cards from multiple distributions within the same period.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-teal-400 mt-1 shrink-0" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Immutable Audit Ledger:</strong> Every receipt, issue,
                  and physical discrepancy audit generates an immutable security log.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
              >
                <span>Access the Operations Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Core Pillars Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 shadow-lg backdrop-blur-md space-y-3 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-3 rounded-xl bg-slate-800 text-emerald-400 border border-white/10 w-fit">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {p.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
