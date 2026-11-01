import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Shield, Activity, Terminal } from 'lucide-react';
import { auditLogApi } from '../services';
import type { AuditLog } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await auditLogApi.getAuditLogs({
        action: actionFilter || undefined,
        page,
        size: 15,
      });
      setLogs(data.content);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer
      title="System Audit & Security Logs"
      subtitle="Read-only tamper-proof administrative ledger recording user access, transactions, and adjustments"
    >
      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-emerald-400" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
            style={{ backgroundColor: '#0b1528', color: '#f8fafc', colorScheme: 'dark' }}
            className="px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-[#0b1528] text-white font-semibold focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 focus:outline-none font-mono shadow-md cursor-pointer"
          >
            <option value="" style={{ backgroundColor: '#0b1528', color: '#f8fafc' }} className="bg-[#0b1528] text-white py-1.5">All Audited Actions</option>
            <option value="USER_LOGIN" style={{ backgroundColor: '#0b1528', color: '#f8fafc' }} className="bg-[#0b1528] text-white py-1.5">USER_LOGIN</option>
            <option value="DISTRIBUTE_COMMODITIES" style={{ backgroundColor: '#0b1528', color: '#f8fafc' }} className="bg-[#0b1528] text-white py-1.5">DISTRIBUTE_COMMODITIES</option>
            <option value="STOCK_INWARD_RECEIPT" style={{ backgroundColor: '#0b1528', color: '#f8fafc' }} className="bg-[#0b1528] text-white py-1.5">STOCK_INWARD_RECEIPT</option>
            <option value="STOCK_ADJUSTMENT" style={{ backgroundColor: '#0b1528', color: '#f8fafc' }} className="bg-[#0b1528] text-white py-1.5">STOCK_ADJUSTMENT</option>
            <option value="CREATE_RATION_CARD" style={{ backgroundColor: '#0b1528', color: '#f8fafc' }} className="bg-[#0b1528] text-white py-1.5">CREATE_RATION_CARD</option>
            <option value="SUBMIT_COMPLAINT" style={{ backgroundColor: '#0b1528', color: '#f8fafc' }} className="bg-[#0b1528] text-white py-1.5">SUBMIT_COMPLAINT</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
          <Activity size={13} className="text-emerald-400" />
          {isLoading ? 'Updating records...' : `Showing Page ${page + 1} of ${totalPages || 1}`}
        </span>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl overflow-hidden"
      >
        <div className="p-4 border-b border-slate-800 bg-slate-950/30 flex items-center gap-2 text-white font-bold text-xs">
          <Terminal size={15} className="text-emerald-400" />
          <span>Immutable Ledger Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    {isLoading ? 'Loading security audit logs...' : 'No audit records match the current filter.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">
                      {log.username}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={log.userRole} />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                      <Shield size={12} className="text-emerald-500/70" />
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {log.entityType} #{log.entityId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate font-sans">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-400 font-mono">Page {page + 1} of {totalPages || 1}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      </motion.div>
    </PageContainer>
  );
};

export default AuditLogsPage;
