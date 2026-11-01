import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'RESOLVED':
      case 'ACTIVE':
      case 'BALANCED':
      case 'AAY':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'IN_REVIEW':
      case 'BPL':
      case 'ADJUSTMENT_DAMAGE':
      case 'LOW_STOCK':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'REJECTED':
      case 'DISCREPANCY_FLAGGED':
      case 'INACTIVE':
      case 'VOIDED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      case 'SUBMITTED':
      case 'INWARD_RECEIPT':
      case 'APL':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()} font-mono`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
