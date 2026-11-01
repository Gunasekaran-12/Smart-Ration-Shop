import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Plus,
  X,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { shopApi, userApi } from '../services';
import type { RationShop, User, Role } from '../types';
import PageContainer from '../components/PageContainer';
import StatusBadge from '../components/StatusBadge';

export const UsersShopsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shops' | 'users'>('shops');
  const [shops, setShops] = useState<RationShop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Shop Form
  const [shopForm, setShopForm] = useState({
    shopNumber: '',
    shopName: '',
    district: 'Bengaluru Urban',
    talukBlock: 'Central Ward',
    address: '',
    contactPerson: '',
    contactPhone: '+91 98765 43210',
    isActive: true,
  });

  // User Form
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'SHOP_OPERATOR' as Role,
    shopId: 1,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shopsData, usersData] = await Promise.all([shopApi.getAll(), userApi.getAll()]);
      setShops(shopsData);
      setUsers(usersData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shopApi.create(shopForm);
      setIsShopModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create shop');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.create(userForm);
      setIsUserModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user account');
    }
  };

  return (
    <PageContainer
      title="Fair Price Shops & Staff Governance"
      subtitle="Super Admin governance: Register outlets, provision operator & auditor credentials, and assign jurisdictions"
      actions={
        <div className="flex items-center gap-2">
          {activeTab === 'shops' ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShopForm({
                  shopNumber: `FPS-${Math.floor(Math.random() * 8999 + 1000)}`,
                  shopName: '',
                  district: 'Bengaluru Urban',
                  talukBlock: 'Central Ward',
                  address: '',
                  contactPerson: '',
                  contactPhone: '+91 98765 43210',
                  isActive: true,
                });
                setIsShopModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
            >
              <Plus size={16} />
              Register New Shop
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setUserForm({
                  username: '',
                  password: '',
                  fullName: '',
                  email: '',
                  phone: '',
                  role: 'SHOP_OPERATOR',
                  shopId: shops[0]?.id || 1,
                  isActive: true,
                });
                setIsUserModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center gap-1.5 transition-all"
            >
              <Plus size={16} />
              Provision Account
            </motion.button>
          )}
        </div>
      }
    >
      {/* Switcher */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('shops')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'shops'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building2 size={16} className={activeTab === 'shops' ? 'text-emerald-400' : 'text-slate-500'} />
          Fair Price Shops ({shops.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users size={16} className={activeTab === 'users' ? 'text-amber-400' : 'text-slate-500'} />
          User Accounts ({users.length})
        </button>
      </div>

      {/* Shops Table */}
      {activeTab === 'shops' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
                  <th className="py-3.5 px-4">Shop Number</th>
                  <th className="py-3.5 px-4">Shop Name</th>
                  <th className="py-3.5 px-4">District / Taluk</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {shops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No Fair Price Shops registered yet.
                    </td>
                  </tr>
                ) : (
                  shops.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                        <Building2 size={13} className="text-emerald-500/70" />
                        {s.shopNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">
                        {s.shopName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {s.district} &bull; {s.talukBlock}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate font-sans">
                        {s.address}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {s.contactPerson} <span className="text-slate-400 font-mono">({s.contactPhone})</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={s.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 font-mono text-[11px]">
                  <th className="py-3.5 px-4">Username</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Assigned Shop</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <UserCheck size={13} className="text-amber-500/70" />
                        {u.username}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">
                        {u.fullName}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={u.role} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-sans">
                        {u.shopName || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans">
                        {u.email || u.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={u.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700/70 rounded-3xl max-w-lg w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-4 text-xs text-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 size={18} className="text-emerald-400" />
                  <span>Register New Fair Price Shop</span>
                </h3>
                <button
                  onClick={() => setIsShopModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateShop} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Shop Code / Number</label>
                    <input
                      type="text"
                      required
                      value={shopForm.shopNumber}
                      onChange={(e) => setShopForm({ ...shopForm, shopNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 font-mono font-bold text-emerald-400 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Shop Name</label>
                    <input
                      type="text"
                      required
                      value={shopForm.shopName}
                      onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                      placeholder="e.g. Gandhi Nagar FPS"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">District</label>
                    <input
                      type="text"
                      required
                      value={shopForm.district}
                      onChange={(e) => setShopForm({ ...shopForm, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Taluk / Block</label>
                    <input
                      type="text"
                      required
                      value={shopForm.talukBlock}
                      onChange={(e) => setShopForm({ ...shopForm, talukBlock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Physical Address</label>
                  <textarea
                    rows={2}
                    required
                    value={shopForm.address}
                    onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Operator In-Charge</label>
                    <input
                      type="text"
                      value={shopForm.contactPerson}
                      onChange={(e) => setShopForm({ ...shopForm, contactPerson: e.target.value })}
                      placeholder="Person name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Phone Helpline</label>
                    <input
                      type="text"
                      value={shopForm.contactPhone}
                      onChange={(e) => setShopForm({ ...shopForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsShopModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    Create Shop
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700/70 rounded-3xl max-w-lg w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-4 text-xs text-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-amber-400" />
                  <span>Provision User Account</span>
                </h3>
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Username</label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="e.g. operator_blrw"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 font-mono text-emerald-400 font-bold focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Secure password"
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:bg-slate-950 focus:border-emerald-500/80 focus:outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 font-semibold focus:border-emerald-500/80 focus:outline-none font-sans"
                    >
                      <option value="SHOP_OPERATOR">Ration Shop Operator</option>
                      <option value="AUDITOR">Auditor / Quality Inspector</option>
                      <option value="SUPER_ADMIN">Super Admin / Department Officer</option>
                    </select>
                  </div>

                  {userForm.role === 'SHOP_OPERATOR' && (
                    <div>
                      <label className="block font-semibold mb-1 text-slate-300">Assigned Shop</label>
                      <select
                        value={userForm.shopId}
                        onChange={(e) => setUserForm({ ...userForm, shopId: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-700/70 bg-slate-950/60 text-slate-100 focus:border-emerald-500/80 focus:outline-none font-sans"
                      >
                        {shops.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.shopName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3 font-sans">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-950/50 transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} />
                    Create Account
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

export default UsersShopsPage;
