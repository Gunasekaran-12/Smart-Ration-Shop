import React from 'react';
import { motion } from 'framer-motion';

interface BookLogo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  autoAnimate?: boolean;
  className?: string;
}

export const BookLogo3D: React.FC<BookLogo3DProps> = ({
  size = 'md',
  autoAnimate = true,
  className = '',
}) => {
  // Dimension mappings
  const dimensions = {
    sm: { width: 38, height: 32, scale: 0.35 },
    md: { width: 56, height: 46, scale: 0.52 },
    lg: { width: 110, height: 90, scale: 0.95 },
    hero: { width: 170, height: 135, scale: 1.4 },
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{
        perspective: '1000px',
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      {/* 3D Floating Book Container */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
        initial={{ rotateX: 18, rotateY: -16 }}
        animate={
          autoAnimate
            ? {
                rotateX: [16, 22, 16],
                rotateY: [-18, -12, -18],
                y: [0, -4, 0],
              }
            : {}
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{
          scale: 1.08,
          rotateX: 10,
          rotateY: -8,
          transition: { duration: 0.3 },
        }}
      >
        {/* Soft Drop Shadow under the book */}
        <div
          className="absolute -bottom-3 left-2 right-2 h-4 rounded-full bg-emerald-950/20 blur-md pointer-events-none"
          style={{ transform: 'translateZ(-30px)' }}
        />

        {/* Book Spine (Left side binding) */}
        <div
          className="absolute left-1 top-1 bottom-1 w-3 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 rounded-l-md shadow-inner border-y border-l border-amber-400/40"
          style={{
            transform: 'translateZ(1px)',
          }}
        >
          {/* Gold Ribs on Spine */}
          <div className="absolute top-2 left-0 right-0 h-[1.5px] bg-amber-400/70" />
          <div className="absolute top-4 left-0 right-0 h-[1.5px] bg-amber-400/70" />
          <div className="absolute bottom-4 left-0 right-0 h-[1.5px] bg-amber-400/70" />
          <div className="absolute bottom-2 left-0 right-0 h-[1.5px] bg-amber-400/70" />
        </div>

        {/* Back Cover (Bottom Right) */}
        <div
          className="absolute left-3 right-0 top-0 bottom-0 bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-r-md border border-amber-400/40 shadow-lg"
          style={{
            transform: 'translateZ(-14px)',
          }}
        />

        {/* Page Block Thickness (Stacked parchment pages effect) */}
        <div
          className="absolute left-3 right-1 top-1 bottom-1 bg-gradient-to-b from-[#fefce8] via-[#fef9c3] to-[#fef08a] rounded-r border-r-2 border-b-2 border-amber-600/30 shadow-inner"
          style={{
            transform: 'translateZ(-8px)',
          }}
        >
          {/* Micro page line grooves */}
          <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(to_bottom,#d97706_0px,#d97706_1px,transparent_1px,transparent_3px)]" />
        </div>

        {/* Open Left Page (Base Interior) */}
        <motion.div
          className="absolute left-3 right-[50%] top-0.5 bottom-0.5 bg-gradient-to-br from-amber-50 via-white to-amber-100/90 rounded-l-sm border-l border-emerald-800 shadow-md p-1.5 flex flex-col justify-between overflow-hidden"
          style={{
            transformOrigin: 'left center',
            transform: 'rotateY(0deg) translateZ(-4px)',
          }}
        >
          {/* Gold Foil Header Lines */}
          <div className="flex items-center gap-1 border-b border-amber-300/60 pb-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <div className="h-1 w-8 bg-amber-400/60 rounded" />
          </div>

          {/* Left Page Crest: Scales of Justice & Fairness */}
          <div className="flex items-center justify-center my-auto">
            <svg
              viewBox="0 0 24 24"
              className="w-full h-auto max-h-8 text-emerald-700"
              fill="currentColor"
            >
              {/* Scales Beam */}
              <rect x="11" y="2" width="2" height="18" rx="1" fill="#059669" />
              <rect x="4" y="6" width="16" height="2" rx="1" fill="#d97706" />
              <circle cx="12" cy="4" r="2.5" fill="#f59e0b" />
              {/* Left pan */}
              <line x1="5" y1="8" x2="3" y2="13" stroke="#d97706" strokeWidth="1.2" />
              <line x1="5" y1="8" x2="7" y2="13" stroke="#d97706" strokeWidth="1.2" />
              <path d="M 2,13 Q 5,16 8,13 Z" fill="#10b981" />
              {/* Right pan */}
              <line x1="19" y1="8" x2="17" y2="13" stroke="#d97706" strokeWidth="1.2" />
              <line x1="19" y1="8" x2="21" y2="13" stroke="#d97706" strokeWidth="1.2" />
              <path d="M 16,13 Q 19,16 22,13 Z" fill="#10b981" />
            </svg>
          </div>

          {/* Page text mockups */}
          <div className="space-y-0.5">
            <div className="h-0.5 w-full bg-slate-300/80 rounded" />
            <div className="h-0.5 w-4/5 bg-slate-300/80 rounded" />
          </div>
        </motion.div>

        {/* Open Right Page */}
        <motion.div
          className="absolute left-[50%] right-1 top-0.5 bottom-0.5 bg-gradient-to-bl from-amber-50 via-white to-amber-100/90 rounded-r-sm border-r border-amber-300/50 shadow-md p-1.5 flex flex-col justify-between overflow-hidden"
          style={{
            transformOrigin: 'left center',
            transform: 'translateZ(-4px)',
          }}
        >
          {/* Right Page Header */}
          <div className="flex items-center justify-end gap-1 border-b border-amber-300/60 pb-0.5">
            <div className="h-1 w-10 bg-amber-400/60 rounded" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>

          {/* Right Page Emblem: Golden Harvest Wheat / Grain Sheaf */}
          <div className="flex items-center justify-center my-auto">
            <svg
              viewBox="0 0 24 24"
              className="w-full h-auto max-h-8 text-amber-500"
              fill="currentColor"
            >
              {/* Wheat stem & grains */}
              <path d="M12 22 V 4" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 6 C10 4 8 6 9 8 C10 9 12 7 12 6 Z" fill="#f59e0b" />
              <path d="M12 6 C14 4 16 6 15 8 C14 9 12 7 12 6 Z" fill="#f59e0b" />
              <path d="M12 10 C9 8 7 10 8 12 C10 13 12 11 12 10 Z" fill="#eab308" />
              <path d="M12 10 C15 8 17 10 16 12 C14 13 12 11 12 10 Z" fill="#eab308" />
              <path d="M12 14 C9 12 7 14 8 16 C10 17 12 15 12 14 Z" fill="#f59e0b" />
              <path d="M12 14 C15 12 17 14 16 16 C14 17 12 15 12 14 Z" fill="#f59e0b" />
            </svg>
          </div>

          {/* Page text mockups */}
          <div className="space-y-0.5">
            <div className="h-0.5 w-full bg-slate-300/80 rounded" />
            <div className="h-0.5 w-3/4 bg-slate-300/80 rounded" />
          </div>
        </motion.div>

        {/* Animated Flipping Page in 3D (Dictionary / Ledger turning page) */}
        <motion.div
          className="absolute left-[50%] right-1 top-0.5 bottom-0.5 bg-gradient-to-l from-white via-amber-50/95 to-amber-100 rounded-r-sm border-r border-amber-200/80 shadow-xl pointer-events-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
          }}
          initial={{ rotateY: 0 }}
          animate={
            autoAnimate
              ? {
                  rotateY: [0, -35, -95, -145, -35, 0],
                  opacity: [1, 0.95, 0.9, 0.8, 0.95, 1],
                }
              : {}
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 1.5,
          }}
        >
          {/* Subtle text lines on turning page */}
          <div className="p-1 space-y-1 opacity-40">
            <div className="h-0.5 w-3/4 bg-amber-600 rounded" />
            <div className="h-0.5 w-1/2 bg-emerald-600 rounded" />
            <div className="h-0.5 w-5/6 bg-amber-500 rounded" />
          </div>
        </motion.div>

        {/* Hardcover Front Cover Opening in 3D Perspective */}
        <motion.div
          className="absolute left-2.5 right-0 top-0 bottom-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 rounded-r-md border border-amber-400/80 shadow-2xl p-1 flex flex-col items-center justify-center pointer-events-none"
          style={{
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
          initial={{ rotateY: -35 }}
          animate={
            autoAnimate
              ? {
                  rotateY: [-30, -50, -30],
                }
              : {}
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Gold Embossed Emblem on Cover */}
          <div className="w-full h-full border border-amber-400/60 rounded flex flex-col items-center justify-center p-1 bg-emerald-900/40">
            <div className="w-5 h-5 rounded-full border border-amber-400/80 flex items-center justify-center bg-amber-400/10">
              <span className="text-[8px] font-black text-amber-300">PDS</span>
            </div>
            {size !== 'sm' && (
              <span className="text-[6px] tracking-wider font-bold text-amber-200 mt-1 uppercase">
                Smart Ration
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookLogo3D;
