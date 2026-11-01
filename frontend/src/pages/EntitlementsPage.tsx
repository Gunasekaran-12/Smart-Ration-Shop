import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  HelpCircle,
  Calculator,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { entitlementApi } from '../services';
import type { EntitlementRule, CardCategory, CalculationType } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const EntitlementsPage: React.FC = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<EntitlementRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<EntitlementRule | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit form
  const [ruleForm, setRuleForm] = useState({
    cardCategory: 'BPL' as CardCategory,
    commodityId: 1,
    calculationType: 'PER_MEMBER' as CalculationType,
    baseQuantity: 3.0,
    maxQuantity: 25.0,
    pricePerUnit: 3.0,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await entitlementApi.getRules();
      setRules(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (r: EntitlementRule) => {
    setSelectedRule(r);
    setRuleForm({
      cardCategory: r.cardCategory,
      commodityId: r.commodity.id,
      calculationType: r.calculationType,
      baseQuantity: Number(r.baseQuantity),
      maxQuantity: r.maxQuantity ? Number(r.maxQuantity) : 30,
      pricePerUnit: Number(r.pricePerUnit),
    });
    setIsEditOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await entitlementApi.saveRule({
        cardCategory: ruleForm.cardCategory,
        commodityId: ruleForm.commodityId,
        calculationType: ruleForm.calculationType,
        baseQuantity: ruleForm.baseQuantity,
        maxQuantity: ruleForm.maxQuantity,
        pricePerUnit: ruleForm.pricePerUnit,
      });
      setIsEditOpen(false);
      loadRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update entitlement rule');
    }
  };

  return (
    <PageContainer
      title="Configurable Monthly Entitlement Engine"
      subtitle="Define statutory grain quotas, per-member scaling formulas, and subsidized tariffs across poverty thresholds"
    >
      {/* Policy Explanation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-slate-900/80 border border-emerald-500/30 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl space-y-2 text-xs"
      >
        <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-wide">
          <HelpCircle size={17} className="text-emerald-400" />
          <span>Statutory National Food Security Allocation Rules</span>
          <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-[10px] text-emerald-300 font-semibold border border-emerald-500/40">
            <ShieldCheck size={12} className="text-emerald-400" />
            NFSA Regulated
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed max-w-4xl">
          <strong className="text-emerald-400 font-bold">AAY (Antyodaya Anna Yojana):</strong> Fixed statutory allocation of 35 kg grain per household (25kg Rice + 10kg Wheat) irrespective of family member count at maximum state subsidies.
          <br />
          <strong className="text-amber-300 font-bold">BPL / Priority Households (PHH):</strong> Scaled dynamically at 3kg Rice + 2kg Wheat per enrolled family member with statutory household caps to prevent diversion.
        </p>
      </motion.div>

      {/* Rules Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator size={18} className="text-emerald-400" />
              <span>Active Entitlement Rules Matrix</span>
              <Sparkles size={14} className="text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Validated automatically during every distribution counter transaction
            </p>
          </div>
          <span className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full font-mono font-bold">
            {rules.length} Rules Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3.5 px-4">Card Category</th>
                <th className="py-3.5 px-4">Commodity</th>
                <th className="py-3.5 px-4">Calculation Mode</th>
                <th className="py-3.5 px-4 text-right">Base Allowance</th>
                <th className="py-3.5 px-4 text-right">Max Cap</th>
                <th className="py-3.5 px-4 text-right">Subsidized Tariff</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {user?.role === 'SUPER_ADMIN' && <th className="py-3.5 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <StatusBadge status={r.cardCategory} />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">
                    {r.commodity.name}
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Unit: {r.commodity.measurementUnit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300 font-sans">
                    {r.calculationType === 'FIXED_PER_CARD' ? 'Fixed per Household' : 'Per Enrolled Member'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                    {r.baseQuantity} {r.commodity.measurementUnit}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400">
                    {r.maxQuantity ? `${r.maxQuantity} ${r.commodity.measurementUnit}` : 'No Cap'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                    ₹{Number(r.pricePerUnit).toFixed(2)} / {r.commodity.measurementUnit}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  {user?.role === 'SUPER_ADMIN' && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Edit Rule Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700/70 rounded-3xl max-w-md w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-4 text-xs text-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator size={18} className="text-emerald-400" />
                  <span>Configure Entitlement Rule</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono font-bold">
                    {ruleForm.cardCategory} - {selectedRule?.commodity.name}
                  </span>
                  <button
                    onClick={() => setIsEditOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveRule} className="space-y-4 font-mono">
                <div>
                  <label className="block font-semibold mb-1 text-slate-300 font-sans">Calculation Type</label>
                  <select
                    value={ruleForm.calculationType}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, calculationType: e.target.value as CalculationType })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                  >
                    <option value="FIXED_PER_CARD">Fixed per Household</option>
                    <option value="PER_MEMBER">Per Enrolled Member</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300 font-sans">Base Quantity</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={ruleForm.baseQuantity}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, baseQuantity: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-bold focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-300 font-sans">Max Cap Quantity</label>
                    <input
                      type="number"
                      step="0.5"
                      value={ruleForm.maxQuantity}
                      onChange={(e) =>
                        setRuleForm({ ...ruleForm, maxQuantity: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-300 font-sans">Subsidized Tariff (INR per unit)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={ruleForm.pricePerUnit}
                    onChange={(e) =>
                      setRuleForm({ ...ruleForm, pricePerUnit: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 font-extrabold text-emerald-400 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default EntitlementsPage;
