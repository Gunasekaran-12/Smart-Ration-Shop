import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wheat,
  Scale,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  QrCode,
} from 'lucide-react';

interface SlidingWindowLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  autoSlide?: boolean;
  className?: string;
}

export const SlidingWindowLogo3D: React.FC<SlidingWindowLogoProps> = ({
  size = 'hero',
  autoSlide = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(true);

  if (size === 'sm' || size === 'md') {
    const dim = size === 'sm' ? { w: 42, h: 42, scale: 0.8 } : { w: 56, h: 56, scale: 1 };
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: dim.w, height: dim.h, perspective: '600px' }}
      >
        <div
          className="relative w-full h-full rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-1 shadow-md border border-emerald-400/40 flex items-center justify-center overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Interior Ration Info Symbol */}
          <div className="absolute inset-1 rounded-lg bg-emerald-950 flex flex-col items-center justify-center text-amber-300">
            <Scale size={18} className="text-amber-400" />
            <span className="text-[7px] font-mono font-bold text-emerald-200">PDS</span>
          </div>

          {/* Left Sliding Glass Pane */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-emerald-500/80 via-white/40 to-teal-400/80 backdrop-blur-sm border-r border-amber-300/60 rounded-l-lg shadow-inner z-10"
            animate={
              autoSlide
                ? {
                    x: ['0%', '-65%', '-65%', '0%'],
                  }
                : {}
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="h-full flex items-center justify-end pr-0.5">
              <div className="w-1 h-4 rounded-full bg-amber-400/90 shadow-sm" />
            </div>
          </motion.div>

          {/* Right Sliding Glass Pane */}
          <motion.div
            className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-emerald-500/80 via-white/40 to-teal-400/80 backdrop-blur-sm border-l border-amber-300/60 rounded-r-lg shadow-inner z-10"
            animate={
              autoSlide
                ? {
                    x: ['0%', '65%', '65%', '0%'],
                  }
                : {}
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="h-full flex items-center justify-start pl-0.5">
              <div className="w-1 h-4 rounded-full bg-amber-400/90 shadow-sm" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // HERO SIZE 3D SLIDING WINDOW DISPENSATION PORTAL
  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* 3D Window Casing / Architectural Frame */}
      <motion.div
        initial={{ scale: 0.9, rotateX: 12, y: 20 }}
        animate={{ scale: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-[340px] sm:w-[480px] md:w-[560px] h-[340px] sm:h-[380px] rounded-3xl bg-gradient-to-b from-white via-slate-50 to-emerald-50/50 p-3 sm:p-4 border-2 border-emerald-500/40 shadow-[0_20px_50px_rgba(16,185,129,0.18)]"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Window Top Canopy / Header Bar with Smart Ration Info Title */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200/80 px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-800 ml-1 uppercase">
              SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>PORTAL READY</span>
          </div>
        </div>

        {/* Interior Chamber (Inside the 3D Window - Visible when panels slide open) */}
        <div className="relative w-full h-[calc(100%-3rem)] rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-5 text-white overflow-hidden shadow-inner flex flex-col justify-between border border-emerald-600/30">
          {/* Subtle Chamber Grid lines */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Info Header inside window */}
          <div className="relative z-10 flex items-center justify-between border-b border-emerald-500/30 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30">
                <Wheat size={20} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-mono">
                    NFSA v2.4
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-300/80">
                  Targeted Public Distribution System & Fair Price Shop Network
                </p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end text-[10px] font-mono text-slate-400">
              <span className="text-amber-400 font-bold">SUBSIDIZED GRAIN TARIFFS</span>
              <span>Rice: ₹3.00/kg • Wheat: ₹2.00/kg</span>
            </div>
          </div>

          {/* Central 3D Information Cards Array */}
          <div className="relative z-10 grid grid-cols-2 gap-2.5 my-auto">
            {/* Card 1: Grain Entitlement */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-emerald-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
                <Scale size={15} />
                <span>Fair Quota Allocation</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                35 KG Antyodaya (AAY) monthly quota & 5 KG per Priority member.
              </p>
            </div>

            {/* Card 2: Biometric Aadhaar */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-emerald-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                <ShieldCheck size={15} />
                <span>Biometric e-PoS Verified</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Fingerprint & OTP multi-factor authentication prevents fake withdrawals.
              </p>
            </div>

            {/* Card 3: Real-Time Stock */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-emerald-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs mb-1">
                <Database size={15} />
                <span>Traceable Stock Ledger</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Batch tracking from central food silos to local fair price shop counters.
              </p>
            </div>

            {/* Card 4: Leakage Free */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-emerald-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <CheckCircle2 size={15} />
                <span>100% Zero Leakage</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Instant digital SMS receipts & transparent citizen grievance redressal.
              </p>
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-emerald-500/20 text-[11px] font-mono text-emerald-300/80">
            <span className="flex items-center gap-1.5">
              <QrCode size={14} className="text-amber-400" />
              <span>Smart Ration Card Enrolled: 25.4 Lakh Families</span>
            </span>
            <span className="text-amber-400 font-bold">100% TRANSPARENT</span>
          </div>

          {/* ======================================================== */}
          {/* 3D SLIDING WINDOW PANES (FRONT OF THE COUNTER) */}
          {/* ======================================================== */}

          {/* Left Sliding Window Panel */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2 z-20 cursor-pointer overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
            }}
            initial={{ x: '0%' }}
            animate={
              isOpen
                ? { x: '-85%', rotateY: 18 }
                : { x: '0%', rotateY: 0 }
            }
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Frosted Glass Look & Metallic Frame */}
            <div className="w-full h-full bg-gradient-to-r from-emerald-900/90 via-teal-800/80 to-slate-900/90 backdrop-blur-md border-r-4 border-amber-400 p-4 flex flex-col justify-between shadow-2xl relative">
              {/* Glass Reflection Highlight */}
              <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

              <div className="flex items-center justify-between text-amber-300 text-xs font-mono font-bold">
                <span>WINDOW SLIDE [L]</span>
                <SlidersHorizontal size={14} />
              </div>

              <div className="my-auto text-center space-y-1">
                <Wheat size={32} className="mx-auto text-amber-400 animate-pulse" />
                <p className="text-xs font-extrabold text-white tracking-wide uppercase">
                  Fair Price Counter
                </p>
                <p className="text-[10px] text-emerald-300 font-mono">Click to Slide</p>
              </div>

              {/* Window Handle Bar */}
              <div className="self-end mr-1 flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-1 rounded-md text-[10px] font-bold shadow-md">
                <ChevronLeft size={12} />
                <span>SLIDE</span>
              </div>
            </div>
          </motion.div>

          {/* Right Sliding Window Panel */}
          <motion.div
            className="absolute top-0 bottom-0 right-0 w-1/2 z-20 cursor-pointer overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
            }}
            initial={{ x: '0%' }}
            animate={
              isOpen
                ? { x: '85%', rotateY: -18 }
                : { x: '0%', rotateY: 0 }
            }
            transition={{
              duration: 1.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Frosted Glass Look & Metallic Frame */}
            <div className="w-full h-full bg-gradient-to-l from-emerald-900/90 via-teal-800/80 to-slate-900/90 backdrop-blur-md border-l-4 border-amber-400 p-4 flex flex-col justify-between shadow-2xl relative">
              <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-bl from-white/20 via-transparent to-transparent pointer-events-none" />

              <div className="flex items-center justify-between text-amber-300 text-xs font-mono font-bold">
                <SlidersHorizontal size={14} />
                <span>WINDOW SLIDE [R]</span>
              </div>

              <div className="my-auto text-center space-y-1">
                <Scale size={32} className="mx-auto text-emerald-400 animate-pulse" />
                <p className="text-xs font-extrabold text-white tracking-wide uppercase">
                  Electronic Scales
                </p>
                <p className="text-[10px] text-emerald-300 font-mono">Digital PDS</p>
              </div>

              {/* Window Handle Bar */}
              <div className="self-start ml-1 flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-1 rounded-md text-[10px] font-bold shadow-md">
                <span>SLIDE</span>
                <ChevronRight size={12} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Interactive Controls Pill beneath the 3D Window */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 shadow-sm flex items-center gap-2 transition-all hover:scale-105"
        >
          <SlidersHorizontal size={14} className="text-emerald-600" />
          <span>{isOpen ? 'Close 3D Sliding Window' : 'Slide 3D Window Open'}</span>
        </button>
        <span className="text-[11px] text-slate-500 font-mono">
          {isOpen ? 'Window Open: PDS Information Revealed' : 'Window Closed: Click to Open'}
        </span>
      </div>
    </div>
  );
};

export default SlidingWindowLogo3D;
