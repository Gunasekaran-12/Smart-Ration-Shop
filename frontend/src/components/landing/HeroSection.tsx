import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import Hero3DScene from './Hero3DScene';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleScrollToFeatures = () => {
    const element = document.querySelector('#features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] pt-24 sm:pt-28 pb-16 lg:pb-24 flex flex-col justify-center overflow-hidden"
    >
      {/* Background Gradients & Glow Spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] bg-gradient-to-tr from-emerald-600/15 via-cyan-500/10 to-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
          >
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono tracking-wide uppercase text-[11px]">
                NEXT-GEN PDS PLATFORM
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-normal">Real-Time Stock Analytics</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Smart Ration Shop Management System with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Real-Time Stock Analytics.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              Transform ration-shop operations with intelligent inventory tracking, real-time stock
              analytics, transparent distribution, and data-driven decisions.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              {/* Primary CTA */}
              <button
                onClick={handleScrollToFeatures}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Explore the Platform</span>
                <ChevronDown size={17} className="text-slate-950" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 shadow-sm transform hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <span>Get Started</span>
                <ArrowRight size={16} className="text-emerald-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Trust Points / Micro Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 w-full max-w-xl">
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  99.8%
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  Distribution Precision
                </div>
              </div>
              <div className="space-y-0.5 border-l border-white/10 pl-4">
                <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                  &lt; 0.12s
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  SSE Live Telemetry
                </div>
              </div>
              <div className="space-y-0.5 border-l border-white/10 pl-4">
                <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                  100%
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  FIFO Traceability
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Holographic Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex items-center justify-center"
          >
            <Hero3DScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
