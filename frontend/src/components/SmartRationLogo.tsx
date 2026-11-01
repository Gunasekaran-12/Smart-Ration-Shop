import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
}

export const SmartRationLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const dimensions = {
    sm: { imgWidth: 38, text: 'text-base', sub: 'text-[9px]' },
    md: { imgWidth: 48, text: 'text-lg', sub: 'text-[10px]' },
    lg: { imgWidth: 72, text: 'text-2xl', sub: 'text-xs' },
    xl: { imgWidth: 140, text: 'text-3xl', sub: 'text-sm' },
    hero: { imgWidth: 280, text: 'text-4xl', sub: 'text-base' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Smart Ration Shield Emblem */}
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="relative flex items-center justify-center flex-shrink-0"
      >
        <div className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-md pointer-events-none" />
        <img
          src="/smart-ration-logo.png"
          alt="SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS"
          style={{ width: dimensions.imgWidth, height: 'auto' }}
          className="relative z-10 object-contain drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)] select-none pointer-events-none"
        />
      </motion.div>

      {showText && size !== 'hero' && size !== 'xl' && (
        <div className="flex flex-col">
          <div
            className={`font-black tracking-tight flex items-center gap-1.5 ${dimensions.text}`}
          >
            <span className="text-white font-extrabold tracking-tight">SMART</span>
            <span className="text-emerald-400 font-black tracking-tight">RATION SHOP</span>
            <span className="text-emerald-300 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 shadow-sm">
              PDS
            </span>
          </div>
          <span
            className={`font-semibold tracking-wider uppercase text-slate-400 ${dimensions.sub}`}
          >
            Real-Time Stock Analytics
          </span>
        </div>
      )}
    </div>
  );
};

export default SmartRationLogo;
