import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Package,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Database,
  Radio,
} from 'lucide-react';

export const Hero3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Mouse tilt physics for 3D parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl h-[520px] sm:h-[580px] lg:h-[620px] flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none transform -translate-y-4" />

      {/* Main 3D Tilting Stage */}
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* ========================================================= */}
        {/* LAYER 1: 3D Holographic Platform Base (translateZ: 0px) */}
        {/* ========================================================= */}
        <div
          className="absolute w-[360px] sm:w-[460px] h-[360px] sm:h-[460px] rounded-full border border-emerald-500/30 flex items-center justify-center"
          style={{
            transform: 'translateZ(0px) rotateX(65deg)',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.05) 45%, transparent 70%)',
            boxShadow: '0 0 60px rgba(16,185,129,0.2)',
          }}
        >
          {/* Cyber Grid Lines */}
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/25 animate-spin-slow" />
          <div className="w-[280px] sm:w-[350px] h-[280px] sm:h-[350px] rounded-full border border-emerald-400/40 flex items-center justify-center">
            <div className="w-[180px] sm:w-[220px] h-[180px] sm:h-[220px] rounded-full border border-cyan-300/30 bg-emerald-950/20 shadow-inner" />
          </div>

          {/* Holographic Compass Crosshairs */}
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
        </div>

        {/* Dynamic Sweeping Radar Scanner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full pointer-events-none"
          style={{
            transform: 'translateZ(10px) rotateX(65deg)',
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(16,185,129,0) 0deg, rgba(16,185,129,0.22) 60deg, transparent 65deg)',
          }}
        />

        {/* ========================================================= */}
        {/* LAYER 2: 3D Warehouse Central Hub (translateZ: 60px)       */}
        {/* ========================================================= */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [0, -12, 0],
                }
          }
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-20 flex flex-col items-center justify-center"
          style={{ transform: 'translateZ(60px)' }}
        >
          {/* Central Holographic Hub Cylinder / Core */}
          <div className="relative w-44 sm:w-52 h-36 sm:h-44 rounded-2xl bg-gradient-to-b from-slate-900/90 via-[#0a192f]/95 to-slate-950/95 border-2 border-emerald-400/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.25)] backdrop-blur-xl p-4 flex flex-col justify-between overflow-hidden">
            {/* Top Scanning Line */}
            <motion.div
              animate={{ y: [0, 140, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 blur-[1px]"
            />

            {/* Hub Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-300 uppercase">
                  CENTRAL HUB
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold">FPS-1001</span>
            </div>

            {/* Hub Telemetry Display */}
            <div className="space-y-1.5 my-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Database size={12} className="text-emerald-400" /> Stock Inward
                </span>
                <span className="font-mono font-bold text-white">10,800 KG</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Zap size={12} className="text-amber-400" /> POS Velocity
                </span>
                <span className="font-mono font-bold text-emerald-400">0.08s</span>
              </div>
            </div>

            {/* Hub Footer Status */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>FIFO ENGINE</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={11} /> VERIFIED
              </span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* LAYER 3: 4 Orbiting 3D Commodity Modules (translateZ: 90px) */}
        {/* ========================================================= */}

        {/* 1. RICE Commodity Vault (Top-Left) */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [-8, 8, -8],
                  x: [0, -4, 0],
                }
          }
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 sm:-top-8 left-2 sm:left-6 z-30"
          style={{ transform: 'translateZ(90px)' }}
        >
          <div className="relative group bg-slate-900/85 hover:bg-slate-800/90 border border-emerald-500/40 hover:border-emerald-400 rounded-xl p-3 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md transition-all duration-300 w-44 sm:w-48">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Package size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Rice (Grade A)</div>
                  <div className="text-[10px] font-mono text-emerald-400">BATCH-2026-R01</div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold">
                98%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400 font-mono">Available:</span>
              <span className="font-mono font-bold text-emerald-300">2,450 KG</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full w-[84%]" />
            </div>
          </div>
        </motion.div>

        {/* 2. WHEAT Commodity Silo (Top-Right) */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [6, -10, 6],
                  x: [0, 4, 0],
                }
          }
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-2 sm:-top-6 right-2 sm:right-6 z-30"
          style={{ transform: 'translateZ(95px)' }}
        >
          <div className="relative group bg-slate-900/85 hover:bg-slate-800/90 border border-amber-500/40 hover:border-amber-400 rounded-xl p-3 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md transition-all duration-300 w-44 sm:w-48">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Layers size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Milling Wheat</div>
                  <div className="text-[10px] font-mono text-amber-400">BATCH-2026-W04</div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono font-bold">
                73%
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-400 font-mono">Available:</span>
              <span className="font-mono font-bold text-amber-300">1,820 KG</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1.5 overflow-hidden">
              <div className="bg-amber-400 h-full w-[73%]" />
            </div>
          </div>
        </motion.div>

        {/* 3. SUGAR Commodity Crate (Bottom-Left) */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [8, -8, 8],
                  x: [-3, 3, -3],
                }
          }
          transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-4 sm:-bottom-8 left-4 sm:left-10 z-30"
          style={{ transform: 'translateZ(85px)' }}
        >
          <div className="relative group bg-slate-900/85 hover:bg-slate-800/90 border border-cyan-500/40 hover:border-cyan-400 rounded-xl p-3 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-md transition-all duration-300 w-40 sm:w-44">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Refined Sugar
              </span>
              <span className="text-[10px] text-cyan-300 font-mono">BUFFER OK</span>
            </div>
            <div className="text-sm font-mono font-bold text-cyan-300">640 KG</div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-1">
              <span>Statutory: ₹13.50/kg</span>
              <span className="text-emerald-400 font-semibold">92% Cap</span>
            </div>
          </div>
        </motion.div>

        {/* 4. ESSENTIAL PULSES / DAL (Bottom-Right) */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [-6, 10, -6],
                  x: [4, -2, 4],
                }
          }
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-6 sm:-bottom-10 right-4 sm:right-10 z-30"
          style={{ transform: 'translateZ(90px)' }}
        >
          <div className="relative group bg-slate-900/85 hover:bg-slate-800/90 border border-purple-500/40 hover:border-purple-400 rounded-xl p-3 shadow-[0_10px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-md transition-all duration-300 w-40 sm:w-44">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Toor Dal
              </span>
              <span className="text-[10px] text-purple-300 font-mono">FCI INWARD</span>
            </div>
            <div className="text-sm font-mono font-bold text-purple-300">920 KG</div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-1">
              <span>Quota: 2kg/Card</span>
              <span className="text-emerald-400 font-semibold">65% Cap</span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* LAYER 4: Floating HUD Badges & Telemetry (translateZ: 140px) */}
        {/* ========================================================= */}

        {/* Holographic Pill 1: Top Floating Indicator */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [-4, 6, -4],
                }
          }
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 sm:top-14 z-40"
          style={{ transform: 'translateZ(130px)' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-400/60 shadow-[0_4px_20px_rgba(16,185,129,0.35)] backdrop-blur-md">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-semibold text-emerald-300">
              Live Stock Stream Active
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200">
              0.12s
            </span>
          </div>
        </motion.div>

        {/* Holographic Pill 2: Bottom Floating Indicator */}
        <motion.div
          animate={
            prefersReducedMotion
              ? {}
              : {
                  y: [5, -5, 5],
                }
          }
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 sm:bottom-8 z-40"
          style={{ transform: 'translateZ(140px)' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/50 shadow-[0_4px_20px_rgba(6,182,212,0.3)] backdrop-blur-md">
            <ShieldCheck size={13} className="text-cyan-400" />
            <span className="text-[11px] font-mono font-semibold text-slate-200">
              Tamper-Evident POS Ledger
            </span>
            <CheckCircle2 size={12} className="text-emerald-400" />
          </div>
        </motion.div>
      </motion.div>

      {/* Demo Data Disclaimer Watermark */}
      <div className="absolute bottom-1 right-2 z-40">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest bg-slate-950/70 px-2 py-0.5 rounded border border-white/5">
          Interactive 3D Demo Preview
        </span>
      </div>
    </div>
  );
};

export default Hero3DScene;
