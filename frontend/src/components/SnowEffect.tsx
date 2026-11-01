import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Snowflake {
  id: number;
  x: number; // percentage horizontal
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

export const SnowEffect: React.FC = () => {
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // 0 to 100%
      size: Math.random() * 6 + 3, // 3px to 9px
      duration: Math.random() * 7 + 6, // 6s to 13s
      delay: Math.random() * 6, // 0 to 6s
      drift: (Math.random() - 0.5) * 60, // horizontal wind sway
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{
            y: -20,
            x: `${flake.x}vw`,
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            y: ['0vh', '105vh'],
            x: [`${flake.x}vw`, `${flake.x + flake.drift / 10}vw`, `${flake.x - flake.drift / 15}vw`, `${flake.x}vw`],
            opacity: [0, flake.opacity, flake.opacity * 0.9, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: flake.size,
            height: flake.size,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            boxShadow: `0 0 ${flake.size + 2}px rgba(255, 255, 255, 0.8)`,
          }}
        />
      ))}
    </div>
  );
};

export default SnowEffect;
