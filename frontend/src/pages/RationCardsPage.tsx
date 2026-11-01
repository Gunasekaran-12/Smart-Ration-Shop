import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  X,
  Users,
  CreditCard,
  Power,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rationCardApi, shopApi } from '../services';
import type { RationCard, CardCategory, RationShop } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const RationCardsPage: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<RationCard[]>([]);
  const [shops, setShops] = useState<RationShop[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Selected Card for detailed inspection
  const [selectedCard, setSelectedCard] = useState<RationCard | null>(null);

  // Card Creation / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    headOfFamily: '',
    dateOfBirth: '',
    cardCategory: 'BPL' as CardCategory,
    shopId: 1,
    address: '',
    phoneNumber: '',
    isActive: true,
    familyMembers: [
      { fullName: '', relationship: 'HEAD', age: 42, gender: 'MALE' },
    ],
  });

  useEffect(() => {
    loadCards();
    shopApi.getAll().then(setShops).catch(console.error);
  }, [page, selectedCategory]);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      if (user?.role === 'BENEFICIARY') {
        const myCard = await rationCardApi.getCardByNumber(user.cardNumber || 'RC-KA-01-987654');
        setCards([myCard]);
        setTotalPages(1);
      } else {
        const data = await rationCardApi.searchCards({
          shopId: user?.role === 'SHOP_OPERATOR' ? user.shopId : undefined,
          category: selectedCategory || undefined,
          query: searchQuery.trim() || undefined,
          page,
          size: 10,
        });
        setCards(data.content);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadCards();
  };

  const openCreateModal = () => {
    setEditingCardId(null);
    setFormData({
      cardNumber: `RC-KA-01-${Math.floor(Math.random() * 899999 + 100000)}`,
      headOfFamily: '',
      dateOfBirth: '1985-06-15',
      cardCategory: 'BPL',
      shopId: user?.shopId || shops[0]?.id || 1,
      address: '',
      phoneNumber: '+91 9',
      isActive: true,
      familyMembers: [
        { fullName: '', relationship: 'HEAD', age: 40, gender: 'MALE' },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: RationCard) => {
    setEditingCardId(c.id);
    setFormData({
      cardNumber: c.cardNumber,
      headOfFamily: c.headOfFamily,
      dateOfBirth: c.dateOfBirth || '',
      cardCategory: c.cardCategory,
      shopId: c.shopId,
      address: c.address || '',
      phoneNumber: c.phoneNumber || '',
      isActive: c.isActive,
      familyMembers: c.familyMembers && c.familyMembers.length > 0
        ? c.familyMembers
        : [{ fullName: c.headOfFamily, relationship: 'HEAD', age: 40, gender: 'MALE' }],
    });
    setIsModalOpen(true);
  };

  const addFamilyMemberRow = () => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: [
        ...prev.familyMembers,
        { fullName: '', relationship: 'SON', age: 15, gender: 'MALE' },
      ],
    }));
  };

  const removeFamilyMemberRow = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((_, i) => i !== idx),
    }));
  };

  const handleToggleStatus = async (card: RationCard) => {
    const action = card.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ration card ${card.cardNumber}?`)) return;
    try {
      await rationCardApi.toggleStatus(card.id);
      loadCards();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} ration card`);
    }
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCardId) {
        await rationCardApi.updateCard(editingCardId, formData);
      } else {
        await rationCardApi.createCard(formData);
      }
      setIsModalOpen(false);
      loadCards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save ration card');
    }
  };

  return (
    <PageContainer
      title="Ration Cardholders Directory"
      subtitle="Manage fictional beneficiary cards, family member records, and category entitlement quotas"
      actions={
        user?.role !== 'BENEFICIARY' && user?.role !== 'AUDITOR' ? (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            Enroll New Card
          </button>
        ) : undefined
      }
    >
      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-center justify-between"
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by card number or head of family..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-xs text-slate-100 placeholder-slate-500 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-emerald-400" />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-xs text-slate-200 font-semibold focus:border-emerald-500/80 focus:outline-none font-mono shadow-sm"
          >
            <option value="">All Categories (AAY, BPL, APL)</option>
            <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
            <option value="BPL">BPL (Below Poverty Line)</option>
            <option value="APL">APL (Above Poverty Line)</option>
          </select>
        </div>
      </motion.div>

      {/* Cards Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
                <th className="py-3 px-4">Card Number</th>
                <th className="py-3 px-4">Head of Family</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Family Count</th>
                <th className="py-3 px-4">Assigned Shop</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    {isLoading ? 'Loading card directory...' : 'No ration cards found matching criteria.'}
                  </td>
                </tr>
              ) : (
                cards.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-emerald-400 flex items-center gap-2">
                      <CreditCard size={14} className="text-emerald-500/70" />
                      {c.cardNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">
                      {c.headOfFamily}
                      {c.phoneNumber && (
                        <span className="block text-[11px] text-slate-400 font-normal font-mono">
                          {c.phoneNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.cardCategory} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                      {c.familyMemberCount} Persons
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">
                      {c.shopName} <span className="text-slate-500 font-mono">({c.shopNumber})</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCard(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/70 transition-colors"
                          title="View Details & Family Members"
                        >
                          <Eye size={16} />
                        </button>
                        {user?.role !== 'BENEFICIARY' && user?.role !== 'AUDITOR' && (
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/70 transition-colors"
                            title="Edit Card & Family Members"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'SHOP_OPERATOR') && (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.isActive
                                ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/70'
                                : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800/70'
                            }`}
                            title={c.isActive ? 'Deactivate Card' : 'Activate Card'}
                          >
                            <Power size={16} />
                          </button>
                        )}
                      </div>
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
          <span className="text-slate-400 font-mono">
            {isLoading ? 'Loading cards...' : `Page ${page + 1} of ${totalPages || 1}`}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      </motion.div>

      {/* Card Details Modal */}
      <AnimatePresence>
        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700/70 rounded-3xl max-w-lg w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-4 text-slate-100"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedCard.headOfFamily}
                  </h3>
                  <span className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <CreditCard size={13} />
                    {selectedCard.cardNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Category</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedCard.cardCategory} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Assigned Shop</span>
                  <span className="font-bold text-slate-200 font-sans block mt-1">{selectedCard.shopName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Address</span>
                  <span className="text-slate-300 font-sans block mt-0.5">{selectedCard.address || 'Address on record'}</span>
                </div>
              </div>

              {/* Family Members list */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                  <Users size={14} className="text-emerald-400" />
                  <span>Enrolled Family Members ({selectedCard.familyMembers?.length || 0})</span>
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedCard.familyMembers?.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-200">{m.fullName}</span>
                      <span className="text-slate-400 font-mono">{m.relationship} &bull; {m.age} yrs &bull; {m.gender}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors border border-slate-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700/70 rounded-3xl max-w-2xl w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.7)] my-8 space-y-4 text-xs font-mono text-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-400" />
                  {editingCardId ? 'Edit Ration Cardholder' : 'Enroll New Ration Card'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Card Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        placeholder="e.g. RC-KA-01-123456"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 font-bold text-emerald-400 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cardNumber: `RC-KA-01-${Math.floor(Math.random() * 899999 + 100000)}` })}
                        className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-[11px] font-bold border border-slate-700 cursor-pointer"
                        title="Generate Unique Card Number"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Head of Family
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.headOfFamily}
                      onChange={(e) => setFormData({ ...formData, headOfFamily: e.target.value })}
                      placeholder="Full Name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-sans focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Date of Birth (Head of Family)
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-mono focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-200">
                        {formData.isActive ? 'Active (Eligible for Quotas)' : 'Deactivated / Suspended'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.cardCategory}
                      onChange={(e) => setFormData({ ...formData, cardCategory: e.target.value as CardCategory })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-emerald-500/80 focus:outline-none"
                    >
                      <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                      <option value="BPL">BPL (Below Poverty Line)</option>
                      <option value="APL">APL (Above Poverty Line)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Assigned Fair Price Shop
                    </label>
                    <select
                      value={formData.shopId}
                      onChange={(e) => setFormData({ ...formData, shopId: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:border-emerald-500/80 focus:outline-none font-sans"
                    >
                      {shops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.shopName} ({s.shopNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1 font-mono">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Residential address"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1 font-mono">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+91 94444 11223"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Family Members Rows */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">
                      Family Members ({formData.familyMembers.length})
                    </span>
                    <button
                      type="button"
                      onClick={addFamilyMemberRow}
                      className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
                    >
                      + Add Member
                    </button>
                  </div>

                  {formData.familyMembers.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Member Full Name"
                        value={m.fullName}
                        required
                        onChange={(e) => {
                          const updated = [...formData.familyMembers];
                          updated[idx].fullName = e.target.value;
                          setFormData({ ...formData, familyMembers: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-700/70 bg-slate-950/60 text-slate-100 font-sans focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                      />
                      <select
                        value={m.relationship}
                        onChange={(e) => {
                          const updated = [...formData.familyMembers];
                          updated[idx].relationship = e.target.value;
                          setFormData({ ...formData, familyMembers: updated });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-700/70 bg-slate-950/60 text-slate-200 focus:border-emerald-500/80 focus:outline-none"
                      >
                        <option value="HEAD">HEAD</option>
                        <option value="SPOUSE">SPOUSE</option>
                        <option value="SON">SON</option>
                        <option value="DAUGHTER">DAUGHTER</option>
                        <option value="PARENT">PARENT</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={m.age}
                        onChange={(e) => {
                          const updated = [...formData.familyMembers];
                          updated[idx].age = parseInt(e.target.value) || 1;
                          setFormData({ ...formData, familyMembers: updated });
                        }}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-700/70 bg-slate-950/60 text-center text-slate-100 focus:border-emerald-500/80 focus:outline-none"
                      />
                      <select
                        value={m.gender}
                        onChange={(e) => {
                          const updated = [...formData.familyMembers];
                          updated[idx].gender = e.target.value;
                          setFormData({ ...formData, familyMembers: updated });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-700/70 bg-slate-950/60 text-slate-200 focus:border-emerald-500/80 focus:outline-none"
                      >
                        <option value="MALE">M</option>
                        <option value="FEMALE">F</option>
                      </select>
                      {formData.familyMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFamilyMemberRow(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    {editingCardId ? 'Save Changes' : 'Enroll Card'}
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

export default RationCardsPage;
