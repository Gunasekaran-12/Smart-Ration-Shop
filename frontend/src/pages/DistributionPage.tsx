import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  AlertCircle,
  CreditCard,
  Users,
  ShieldCheck,
  Key,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { rationCardApi, distributionApi, otpApi } from '../services';
import type { RationCard, CardEntitlement, Receipt, OtpResponse } from '../types';
import PageContainer from '../components/PageContainer';
import ReceiptModal from '../components/ReceiptModal';
import StatusBadge from '../components/StatusBadge';

export const DistributionPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('RC-KA-01-987654');
  const [card, setCard] = useState<RationCard | null>(null);
  const [entitlements, setEntitlements] = useState<CardEntitlement[]>([]);
  const [quantities, setQuantities] = useState<{ [commodityId: number]: number }>({});
  const [receiptNotes, setReceiptNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<Receipt | null>(null);

  // OTP Verification State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpChallenge, setOtpChallenge] = useState<OtpResponse | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setCard(null);
    setEntitlements([]);
    setQuantities({});

    try {
      const foundCard = await rationCardApi.getCardByNumber(searchQuery.trim().toUpperCase());
      setCard(foundCard);

      const ents = await rationCardApi.getCardEntitlements(foundCard.id);
      setEntitlements(ents);

      // Pre-fill quantities with max eligible remaining quota (clamped to available stock)
      const initialQtys: { [key: number]: number } = {};
      ents.forEach((e) => {
        if (e.isEligibleForDistribution) {
          const maxPossible = Math.min(Number(e.remainingQuantity), Number(e.availableShopStock));
          initialQtys[e.commodityId] = maxPossible > 0 ? maxPossible : 0;
        } else {
          initialQtys[e.commodityId] = 0;
        }
      });
      setQuantities(initialQtys);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        `Ration card "${searchQuery}" was not found or is not accessible at this shop.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (commodityId: number, val: number, maxAllowed: number) => {
    const clamped = Math.max(0, Math.min(val, maxAllowed));
    setQuantities((prev) => ({ ...prev, [commodityId]: clamped }));
  };

  const calculateTotal = () => {
    let sum = 0;
    entitlements.forEach((e) => {
      const qty = quantities[e.commodityId] || 0;
      sum += qty * Number(e.unitPrice);
    });
    return sum;
  };

  // Step 1: Initiate OTP Challenge
  const handleInitiateDistribution = async () => {
    if (!card) return;
    const items = Object.entries(quantities)
      .map(([commodityId, quantity]) => ({
        commodityId: Number(commodityId),
        quantity,
      }))
      .filter((i) => i.quantity > 0);

    if (items.length === 0) {
      setError('Please specify at least one commodity quantity to issue.');
      return;
    }

    setError(null);
    setOtpError(null);
    setEnteredOtp('');
    setIsSubmitting(true);

    try {
      // Trigger cryptographic OTP challenge for the cardholder
      const challenge = await otpApi.generateChallenge(card.id);
      setOtpChallenge(challenge);
      setIsOtpModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate beneficiary OTP challenge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Commit Distribution
  const handleVerifyOtpAndProceed = async () => {
    if (!otpChallenge || !enteredOtp.trim()) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      // Verify OTP challenge with backend
      await otpApi.verifyOtp(otpChallenge.challengeId, enteredOtp.trim());

      // If valid, close modal and execute final distribution
      setIsOtpModalOpen(false);
      await executeFinalDistribution();
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP challenge.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Final Transaction Execution
  const executeFinalDistribution = async () => {
    if (!card) return;
    const items = Object.entries(quantities)
      .map(([commodityId, quantity]) => ({
        commodityId: Number(commodityId),
        quantity,
      }))
      .filter((i) => i.quantity > 0);

    setIsSubmitting(true);
    setError(null);

    try {
      const dist = await distributionApi.processDistribution({
        rationCardId: card.id,
        shopId: user?.shopId || card.shopId,
        receiptNotes: receiptNotes || undefined,
        idempotencyKey: `POS-${card.cardNumber}-${Date.now()}`,
        items,
      });

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#f59e0b', '#34d399'],
      });

      // Load receipt
      const receiptData = await distributionApi.getReceipt(dist.transactionReference);
      setSuccessReceipt(receiptData);

      // Refresh remaining entitlements
      const updatedEnts = await rationCardApi.getCardEntitlements(card.id);
      setEntitlements(updatedEnts);
      const resetQtys: { [key: number]: number } = {};
      updatedEnts.forEach((e) => {
        resetQtys[e.commodityId] = 0;
      });
      setQuantities(resetQtys);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transaction failed. Please verify stock balances.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Point-of-Sale (POS) Distribution Counter"
      subtitle="Search cardholders, verify remaining monthly quotas against physical shop stock, and issue digitally signed receipts"
    >
      {/* Search Bar & Quick Fill */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Ration Card Number (e.g. RC-KA-01-987654)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/90 border border-white/10 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all font-mono font-bold"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <Search size={18} />
            )}
            <span>Search Card</span>
          </button>
        </div>

        {/* Quick Fill Tags for Demo */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Quick Demo Cards:</span>
          {['RC-KA-01-987654', 'RC-KA-01-445566', 'RC-KA-01-112233'].map((demo) => (
            <button
              key={demo}
              onClick={() => {
                setSearchQuery(demo);
                setTimeout(handleSearch, 50);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-white/10 text-[11px] font-mono transition-colors"
            >
              {demo}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3 shadow-lg"
        >
          <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Card Details Card */}
      {card && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
                <CreditCard size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white font-mono tracking-wide">
                    {card.cardNumber}
                  </h3>
                  <StatusBadge status={card.cardCategory} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Head of Family: <span className="text-slate-200 font-bold">{card.headOfFamily}</span> &bull; FPS: {card.shopName || card.shopNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5">
                <Users size={16} className="text-emerald-400" />
                <span>Members: <strong>{card.familyMemberCount}</strong></span>
              </div>
              <div className="border-l border-white/10 pl-3">
                Status: <span className="text-emerald-400 font-bold">{card.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
          </div>

          {/* Entitlements & Allocation Table */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-mono text-[11px] uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Commodity</th>
                  <th className="py-3 px-4 text-right">Quota Entitled</th>
                  <th className="py-3 px-4 text-right">Distributed (MTD)</th>
                  <th className="py-3 px-4 text-right">Remaining Quota</th>
                  <th className="py-3 px-4 text-right">Shop Stock</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-center">Issue Quantity</th>
                  <th className="py-3 px-4 text-right">Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200 font-mono">
                {entitlements.map((e) => {
                  const issueQty = quantities[e.commodityId] || 0;
                  const itemTotal = issueQty * Number(e.unitPrice);
                  const maxAllowed = Math.min(Number(e.remainingQuantity), Number(e.availableShopStock));

                  return (
                    <tr key={e.commodityId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white font-sans flex items-center gap-2">
                        <span>{e.commodityName}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          ({e.commodityCode})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {e.totalEntitledQuantity} {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {e.distributedQuantity} {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {e.remainingQuantity} {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300">
                        {e.availableShopStock} {e.measurementUnit}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        ₹{Number(e.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={maxAllowed}
                            step="0.5"
                            value={quantities[e.commodityId] ?? 0}
                            disabled={!e.isEligibleForDistribution || maxAllowed <= 0}
                            onChange={(ev) =>
                              handleQuantityChange(
                                e.commodityId,
                                parseFloat(ev.target.value) || 0,
                                maxAllowed
                              )
                            }
                            className="w-24 px-2.5 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-right font-bold text-white focus:outline-none focus:border-emerald-400 disabled:opacity-40"
                          />
                          <span className="text-[11px] text-slate-400 font-medium font-sans">
                            {e.measurementUnit}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-white">
                        ₹{itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-800/80 font-bold border-t-2 border-white/10">
                  <td colSpan={7} className="py-3.5 px-4 text-right text-slate-300 font-mono">
                    Grand Total Subsidized Payable:
                  </td>
                  <td className="py-3.5 px-4 text-right text-base text-emerald-400 font-black font-mono">
                    ₹{calculateTotal().toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes and Authorization Confirmation */}
          <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-1/2">
              <input
                type="text"
                value={receiptNotes}
                onChange={(e) => setReceiptNotes(e.target.value)}
                placeholder="Optional receipt notes (e.g., Authorized representative collection)..."
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-slate-800/90 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInitiateDistribution}
              disabled={isSubmitting || calculateTotal() <= 0}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  Initiating OTP Challenge...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Authorize Distribution via OTP (₹{calculateTotal().toFixed(2)})
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Cryptographic Beneficiary OTP Verification Modal */}
      <AnimatePresence>
        {isOtpModalOpen && otpChallenge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Beneficiary OTP Challenge</h3>
                    <p className="text-[11px] text-slate-400">Cryptographic Dispatched Verification</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOtpModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Demo Mode OTP Helper */}
              {otpChallenge.simulatedOtpForDemo && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-amber-300 font-bold block">
                      Demo Test Mode OTP
                    </span>
                    <span className="text-lg font-black text-amber-200 tracking-wider">
                      {otpChallenge.simulatedOtpForDemo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(otpChallenge.simulatedOtpForDemo || '')}
                    className="px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[11px] font-bold border border-amber-400/30 transition-all cursor-pointer"
                  >
                    Quick Paste
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase font-bold mb-1.5">
                  Enter 6-Digit Beneficiary OTP
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Key size={16} />
                  </span>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white font-mono text-center text-lg tracking-[0.3em] font-bold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Challenge ID: {otpChallenge.challengeId.slice(0, 16)}... &bull; 3 attempts allowed
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtpAndProceed}
                  disabled={isVerifyingOtp || enteredOtp.length < 4}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isVerifyingOtp ? (
                    <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <span>Verify & Issue Ration</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Receipt Modal */}
      <ReceiptModal receipt={successReceipt} onClose={() => setSuccessReceipt(null)} />
    </PageContainer>
  );
};

export default DistributionPage;
