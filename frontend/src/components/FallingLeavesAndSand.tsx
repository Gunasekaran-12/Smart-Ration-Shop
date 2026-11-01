import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface LeafParticle {
  id: number;
  startX: number; // percentage across screen 0-100
  size: number;
  duration: number;
  delay: number;
  rotationDirection: number;
  swayDistance: number;
  color: string;
  leafType: number;
}

interface SandParticle {
  id: number;
  startX: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  color: string;
  opacity: number;
}

export const FallingLeavesAndSand: React.FC = () => {
  // Generate 22 Fluttering Green Leaves
  const leaves = useMemo<LeafParticle[]>(() => {
    const leafColors = [
      '#10b981', // Vibrant emerald
      '#059669', // Rich forest green
      '#22c55e', // Fresh spring leaf
      '#15803d', // Deep foliage green
      '#34d399', // Mint tea leaf
      '#4ade80', // Young shoot green
    ];

    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      startX: (i * 4.6 + Math.random() * 4) % 100, // evenly spread across width
      size: Math.random() * 12 + 14, // 14px to 26px
      duration: Math.random() * 8 + 11, // 11s to 19s
      delay: Math.random() * 12,
      rotationDirection: i % 2 === 0 ? 1 : -1,
      swayDistance: Math.random() * 40 + 30, // 30px to 70px horizontal sway
      color: leafColors[i % leafColors.length],
      leafType: i % 3,
    }));
  }, []);

  // Generate 48 Falling Sand & Golden Grain Dust Particles
  const sandParticles = useMemo<SandParticle[]>(() => {
    const sandColors = [
      '#f59e0b', // Warm amber gold
      '#fbbf24', // Radiant sand gold
      '#d97706', // Harvest grain amber
      '#eab308', // Sunlit grain dust
      '#fde047', // Pale golden sand
    ];

    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      startX: (i * 2.1 + Math.random() * 3) % 100,
      size: Math.random() * 3.5 + 1.8, // 1.8px to 5.3px
      duration: Math.random() * 6 + 7, // 7s to 13s
      delay: Math.random() * 10,
      driftX: (Math.random() - 0.4) * 80, // slight drift to the right/left
      color: sandColors[i % sandColors.length],
      opacity: Math.random() * 0.45 + 0.35,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Light Ambient Sun & Meadow Aura (Subtle warm gradients on white background) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-100/50 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-amber-100/40 blur-[130px]" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-emerald-100/45 blur-[120px]" />

      {/* Gentle Sunlight Breeze Flow Line */}
      <motion.div
        className="absolute left-0 right-0 top-[20%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 1600 60" className="w-[130%] h-8 -ml-[15%]" fill="none">
          <path
            d="M 0,30 Q 400,10 800,30 T 1600,30"
            stroke="url(#leafBreezeGrad)"
            strokeWidth="1.5"
            strokeDasharray="12 24"
          />
          <defs>
            <linearGradient id="leafBreezeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="30%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Falling Sand / Golden Grain Dust Particles */}
      {sandParticles.map((s) => (
        <motion.div
          key={`sand-${s.id}`}
          className="absolute rounded-full"
          style={{
            left: `${s.startX}%`,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}66`,
          }}
          initial={{
            y: '-4vh',
            x: 0,
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            y: ['0vh', '108vh'],
            x: [0, s.driftX * 0.5, s.driftX, s.driftX * 1.2],
            opacity: [0, s.opacity, s.opacity, 0],
            scale: [0.8, 1.2, 1, 0.6],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Falling & Fluttering Green Leaves */}
      {leaves.map((leaf) => (
        <motion.div
          key={`leaf-${leaf.id}`}
          className="absolute"
          style={{
            left: `${leaf.startX}%`,
            width: leaf.size,
            height: leaf.size * 1.3,
          }}
          initial={{
            y: '-6vh',
            x: 0,
            rotateZ: 0,
            rotateX: 0,
            opacity: 0,
          }}
          animate={{
            y: ['-6vh', '108vh'],
            x: [
              0,
              leaf.swayDistance * leaf.rotationDirection,
              -leaf.swayDistance * 0.7 * leaf.rotationDirection,
              leaf.swayDistance * 0.9 * leaf.rotationDirection,
              0,
            ],
            rotateZ: [
              0,
              90 * leaf.rotationDirection,
              180 * leaf.rotationDirection,
              270 * leaf.rotationDirection,
              360 * leaf.rotationDirection,
            ],
            rotateX: [0, 45, -30, 40, 0],
            opacity: [0, 0.85, 0.9, 0.75, 0],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: 'easeInOut',
          }}
        >
          {/* Beautiful SVG Leaf Vector */}
          <svg
            viewBox="0 0 32 40"
            className="w-full h-full drop-shadow-sm"
            fill="none"
          >
            {leaf.leafType === 0 ? (
              // Classic Oval Lanceolate Leaf (Tea/Neem/Ashoka)
              <>
                <path
                  d="M16 2 C28 10 30 26 16 38 C2 26 4 10 16 2 Z"
                  fill={leaf.color}
                  fillOpacity="0.78"
                />
                {/* Central leaf vein */}
                <path
                  d="M16 4 Q16 20 16 38"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeOpacity="0.5"
                  strokeLinecap="round"
                />
                {/* Lateral veins */}
                <path
                  d="M16 12 Q21 15 25 18 M16 20 Q21 23 24 26 M16 12 Q11 15 7 18 M16 20 Q11 23 8 26"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  strokeOpacity="0.35"
                />
              </>
            ) : leaf.leafType === 1 ? (
              // Slender Curved Paddy / Wheat Leaf
              <>
                <path
                  d="M16 1 C24 12 26 28 17 39 C9 32 10 14 16 1 Z"
                  fill={leaf.color}
                  fillOpacity="0.82"
                />
                <path
                  d="M16 3 Q17 18 17 39"
                  stroke="#fde047"
                  strokeWidth="1"
                  strokeOpacity="0.55"
                  strokeLinecap="round"
                />
              </>
            ) : (
              // Broad Heart-shaped Betel / Bodhi Leaf
              <>
                <path
                  d="M16 2 C26 7 30 22 16 38 C2 22 6 7 16 2 Z"
                  fill={leaf.color}
                  fillOpacity="0.75"
                />
                <circle cx="16" cy="18" r="6" fill="#fef08a" fillOpacity="0.2" />
                <path
                  d="M16 3 L16 38"
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              </>
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default FallingLeavesAndSand;
