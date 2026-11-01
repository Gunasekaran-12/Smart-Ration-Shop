import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Ticket,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingApi, rationCardApi } from '../services';
import type { SlotAvailability, RationBooking } from '../types';
import PageContainer from '../components/PageContainer';

export const BookingPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const shopId = user?.shopId || 1;
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [myBookings, setMyBookings] = useState<RationBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Booking Modal
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [cardInput, setCardInput] = useState<string>(user?.cardNumber || 'RC-01-987654');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSlots();
    loadMyBookings();
  }, [selectedDate, shopId]);

  const loadSlots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingApi.getAvailableSlots(shopId, selectedDate);
      const mapped = (data || []).map((s: any) => ({
        ...s,
        slotId: s.slotId || s.id,
        slotTime: s.slotTime || (s.startTime && s.endTime ? s.startTime.toString().slice(0, 5) + ' - ' + s.endTime.toString().slice(0, 5) : '09:00 - 09:30'),
        availableCapacity: s.remainingCapacity !== undefined ? s.remainingCapacity : (s.availableCapacity !== undefined ? s.availableCapacity : Math.max(0, s.maxCapacity - s.bookedCount)),
      }));
      setSlots(mapped);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve slot availability.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const data = await bookingApi.getMyBookings(user?.rationCardId);
      const mapped = (data || []).map((b: any) => ({
        ...b,
        slotDate: b.slotDate || b.bookingDate,
        slotTime: b.slotTime || (b.startTime && b.endTime ? b.startTime.toString().slice(0, 5) + ' - ' + b.endTime.toString().slice(0, 5) : '09:00 - 09:30'),
      }));
      setMyBookings(mapped);
    } catch (err: any) {
      console.error('Failed to load my bookings', err);
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Find card ID from card number if needed
      let targetCardId = user?.rationCardId;
      if (!targetCardId) {
        const found = await rationCardApi.getCardByNumber(cardInput.trim());
        targetCardId = found.id;
      }

      const res = await bookingApi.createBooking({
        rationCardId: targetCardId,
        shopId,
        slotId: selectedSlot.slotId || (selectedSlot as any).id,
        bookingDate: selectedDate,
        slotDate: selectedDate,
        slotTime: selectedSlot.slotTime,
      });

      setSuccessMessage(
        `Token booked successfully! Reference: ${res.bookingReference} for ${res.slotDate} at ${res.slotTime}.`
      );
      setSelectedSlot(null);
      loadSlots();
      loadMyBookings();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking reservation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking slot?')) return;
    try {
      await bookingApi.cancelBooking(id);
      loadSlots();
      loadMyBookings();
      setSuccessMessage('Booking cancelled and stock reservation released.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  return (
    <PageContainer
      title="Ration Slot Booking & Token Management"
      subtitle="Reserve 30-minute crowd-management slots (max 20 beneficiaries per window) with real-time atomic quota reservation"
    >
      {/* Alert Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <XCircle size={16} />
          </button>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <XCircle size={16} />
          </button>
        </motion.div>
      )}

      {/* Date & Shop Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase font-bold mb-1">
              Select Distribution Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase font-bold mb-1">
              Target Fair Price Shop
            </label>
            <div className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-medium">
              Shop #FPS-{shopId.toString().padStart(4, '0')} (Central Outlet)
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            loadSlots();
            loadMyBookings();
          }}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
          <span>Refresh Live Slots</span>
        </button>
      </motion.div>

      {/* 30-Minute Interval Slot Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              30-Minute Operational Intervals &bull; {selectedDate}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Capacity Rule: Max 20 Beneficiaries / Interval
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-900/60 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slots.map((slot) => {
              const isFull = slot.bookedCount >= slot.maxCapacity;
              const ratio = Math.min(100, Math.round((slot.bookedCount / slot.maxCapacity) * 100));

              return (
                <motion.div
                  key={slot.slotTime}
                  whileHover={!isFull ? { y: -4, scale: 1.01 } : {}}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isFull
                      ? 'bg-slate-900/40 border-rose-500/20 opacity-60'
                      : 'bg-slate-900/80 border-white/10 hover:border-emerald-500/50 hover:shadow-[0_10px_25px_rgba(16,185,129,0.15)] backdrop-blur-xl'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-white">
                        <Clock size={15} className="text-emerald-400" />
                        <span>{slot.slotTime}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                          isFull
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : slot.availableCapacity <= 5
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isFull ? 'SLOT FULL' : `${slot.availableCapacity} LEFT`}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Booked Capacity</span>
                        <span className="font-bold text-slate-200">
                          {slot.bookedCount} / {slot.maxCapacity}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            ratio >= 100 ? 'bg-rose-500' : ratio >= 75 ? 'bg-amber-500' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">30-Min Window</span>
                    <button
                      disabled={isFull}
                      onClick={() => setSelectedSlot(slot)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
                    >
                      <Ticket size={13} />
                      <span>{isFull ? 'Exhausted' : 'Book Token'}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active User Bookings List */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-2">
          <Ticket size={18} className="text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            My Registered Ration Tokens
          </h3>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No active tokens booked. Choose a date and time slot above to reserve your slot.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-xl shadow-lg relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                      BOOKING TOKEN
                    </span>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      {b.bookingReference}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : b.status === 'COMPLETED'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border border-white/10'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Number:</span>
                    <span className="font-bold text-white">{b.cardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Head of Family:</span>
                    <span className="text-slate-200">{b.headOfFamily}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reserved Slot:</span>
                    <span className="font-bold text-emerald-300">{b.slotDate} &bull; {b.slotTime}</span>
                  </div>
                </div>

                {b.status === 'CONFIRMED' && (
                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-medium cursor-pointer"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket size={20} className="text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Confirm Slot Reservation</h3>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-bold text-white">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Interval:</span>
                  <span className="font-bold text-emerald-400">{selectedSlot.slotTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shop:</span>
                  <span className="text-white">FPS-{shopId.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity Remaining:</span>
                  <span className="text-white">{selectedSlot.availableCapacity} / {selectedSlot.maxCapacity}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase font-bold mb-1">
                  Ration Card Number
                </label>
                <input
                  type="text"
                  value={cardInput}
                  onChange={(e) => setCardInput(e.target.value)}
                  placeholder="Enter Ration Card Number"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                Reserving this slot guarantees counter priority during this window and holds atomic entitlement reservation.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSlot}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm & Generate Token'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default BookingPage;
