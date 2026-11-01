import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import FallingLeavesAndSand from '../components/FallingLeavesAndSand';

export const SplashIntroPage: React.FC = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/login');
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070d18] overflow-hidden flex flex-col items-center justify-center p-4 text-slate-100 select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Falling Green Leaves & Golden Sand Particles */}
      <FallingLeavesAndSand />

      <AnimatePresence>
        {!isExiting ? (
          <motion.div
            key="splash-content"
            initial={{ opacity: 0, scale: 0.7, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -40, filter: 'blur(8px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto space-y-7"
            style={{ perspective: '1000px' }}
          >
            {/* Top National Food Security Pill */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono tracking-wider shadow-lg shadow-emerald-950/50 backdrop-blur-md"
            >
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span>SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS</span>
            </motion.div>

            {/* Official Smart Ration Emblem with 3D Hover & Float */}
            <motion.div
              initial={{ scale: 0.8, rotateX: 18 }}
              animate={{
                scale: [1, 1.03, 1],
                y: [0, -10, 0],
                rotateX: [0, 4, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.06, rotateX: 0 }}
              className="relative p-2"
            >
              {/* Soft Ambient Radial Halo behind logo */}
              <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-amber-500/15 blur-2xl pointer-events-none" />

              <img
                src="/smart-ration-logo.png"
                alt="SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS"
                className="relative z-10 w-64 sm:w-72 md:w-80 h-auto object-contain drop-shadow-[0_20px_35px_rgba(16,185,129,0.25)] select-none pointer-events-none"
              />
            </motion.div>

            {/* 5-Second Progress Timer & Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-full flex flex-col items-center space-y-3 pt-2"
            >
              {/* Progress bar (5 seconds fill) */}
              <div className="w-64 h-2 bg-slate-900/90 rounded-full overflow-hidden shadow-inner border border-slate-700/60">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full"
                />
              </div>

              {/* Status Indicator & Skip Button */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-mono text-slate-400 font-semibold tracking-wide">
                  Opening Portal in <strong className="text-emerald-400">{secondsLeft}s</strong>...
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExit}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <span>Continue to Login</span>
                  <ArrowRight size={13} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Transitioning to Login Page */
          <motion.div
            key="splash-exit"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex flex-col items-center gap-3 text-slate-300 font-mono text-xs"
          >
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-bold tracking-wider text-emerald-400">
              INITIALIZING SECURE LOGIN COUNTER...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SplashIntroPage;
