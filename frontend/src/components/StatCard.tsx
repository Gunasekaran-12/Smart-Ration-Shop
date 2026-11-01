import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
}) => {
  const styles = {
    blue: {
      border: 'border-white/10 hover:border-cyan-400/50',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      accent: 'text-cyan-400',
      glow: 'from-cyan-500/15 to-transparent',
    },
    emerald: {
      border: 'border-white/10 hover:border-emerald-400/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      accent: 'text-emerald-400',
      glow: 'from-emerald-500/15 to-transparent',
    },
    amber: {
      border: 'border-white/10 hover:border-amber-400/50',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      accent: 'text-amber-400',
      glow: 'from-amber-500/15 to-transparent',
    },
    purple: {
      border: 'border-white/10 hover:border-purple-400/50',
      iconBg: 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      accent: 'text-purple-400',
      glow: 'from-purple-500/15 to-transparent',
    },
    rose: {
      border: 'border-white/10 hover:border-rose-400/50',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
      accent: 'text-rose-400',
      glow: 'from-rose-500/15 to-transparent',
    },
  }[variant];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.2, ease: 'easeOut' } }}
      className={`p-5 rounded-2xl bg-slate-900/80 border ${styles.border} shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden group`}
    >
      {/* Top Corner Radial Glow */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${styles.glow} rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
              {value}
            </span>
            {trend && (
              <span className={`text-xs font-bold font-mono ${styles.accent}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.iconBg} group-hover:scale-110 transition-transform`}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
