import React from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, subtitle, actions, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-3 sm:p-5 md:p-6 max-w-7xl mx-auto space-y-6 relative z-10"
    >
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            {title && (
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default PageContainer;
