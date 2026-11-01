import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  User,
  LogIn,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Calendar,
  Key,
  Eye,
  EyeOff,
  Users,
  FileCheck2,
  Headset,
  Store,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Wheat,
  Scale,
  Check,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type RoleType = 'SHOP_OPERATOR' | 'BENEFICIARY' | 'SUPER_ADMIN' | 'AUDITOR' | 'SUPPORT_STAFF';

interface RoleOption {
  id: RoleType;
  title: string;
  tagline: string;
  simpleDescription: string;
  mode: 'STAFF' | 'BENEFICIARY';
  icon: React.ElementType;
  theme: {
    accentColor: string;
    bgHover: string;
    selectedBorder: string;
    selectedBg: string;
    iconBg: string;
    iconColor: string;
    pillBg: string;
    pillText: string;
  };
  defaultCredentials: {
    username?: string;
    password?: string;
    card?: string;
    dob?: string;
    initialPwd?: string;
  };
}

const ROLES: RoleOption[] = [
  {
    id: 'BENEFICIARY',
    title: 'Beneficiary',
    tagline: 'Family Ration Card',
    simpleDescription: 'Check your food grains quota, book a shop visit, and view your family details.',
    mode: 'BENEFICIARY',
    icon: Users,
    theme: {
      accentColor: '#059669',
      bgHover: 'hover:border-emerald-500/60',
      selectedBorder: 'border-emerald-600 ring-2 ring-emerald-500/20',
      selectedBg: 'bg-emerald-50/70',
      iconBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      iconColor: 'text-emerald-700',
      pillBg: 'bg-emerald-100 text-emerald-800',
      pillText: 'text-emerald-800',
    },
    defaultCredentials: {
      card: 'RC-KA-01-456123',
      dob: '1982-05-14',
      initialPwd: 'RAME1982',
    },
  },
  {
    id: 'SHOP_OPERATOR',
    title: 'Shop Operator',
    tagline: 'Ration Shop Counter',
    simpleDescription: 'Distribute rice, wheat, and sugar, scan tokens, and manage daily shop stock.',
    mode: 'STAFF',
    icon: Store,
    theme: {
      accentColor: '#0284c7',
      bgHover: 'hover:border-sky-500/60',
      selectedBorder: 'border-sky-600 ring-2 ring-sky-500/20',
      selectedBg: 'bg-sky-50/70',
      iconBg: 'bg-sky-100 text-sky-800 border-sky-300',
      iconColor: 'text-sky-700',
      pillBg: 'bg-sky-100 text-sky-800',
      pillText: 'text-sky-800',
    },
    defaultCredentials: {
      username: 'operator',
      password: 'operator123',
    },
  },
  {
    id: 'SUPER_ADMIN',
    title: 'Super Admin',
    tagline: 'Head Office Control',
    simpleDescription: 'Manage user accounts, add ration cards, check total state stock, and change settings.',
    mode: 'STAFF',
    icon: ShieldCheck,
    theme: {
      accentColor: '#7c3aed',
      bgHover: 'hover:border-purple-500/60',
      selectedBorder: 'border-purple-600 ring-2 ring-purple-500/20',
      selectedBg: 'bg-purple-50/70',
      iconBg: 'bg-purple-100 text-purple-800 border-purple-300',
      iconColor: 'text-purple-700',
      pillBg: 'bg-purple-100 text-purple-800',
      pillText: 'text-purple-800',
    },
    defaultCredentials: {
      username: 'admin',
      password: 'admin123',
    },
  },
  {
    id: 'AUDITOR',
    title: 'Auditor',
    tagline: 'Quality & Stock Check',
    simpleDescription: 'Review distribution records, verify grain stock in warehouses, and ensure fair weights.',
    mode: 'STAFF',
    icon: FileCheck2,
    theme: {
      accentColor: '#0891b2',
      bgHover: 'hover:border-cyan-500/60',
      selectedBorder: 'border-cyan-600 ring-2 ring-cyan-500/20',
      selectedBg: 'bg-cyan-50/70',
      iconBg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      iconColor: 'text-cyan-700',
      pillBg: 'bg-cyan-100 text-cyan-800',
      pillText: 'text-cyan-800',
    },
    defaultCredentials: {
      username: 'auditor',
      password: 'auditor123',
    },
  },
  {
    id: 'SUPPORT_STAFF',
    title: 'Support Staff',
    tagline: 'Citizen Helpdesk',
    simpleDescription: 'Help families with card updates, solve shop problems, and reply to complaints.',
    mode: 'STAFF',
    icon: Headset,
    theme: {
      accentColor: '#d97706',
      bgHover: 'hover:border-amber-500/60',
      selectedBorder: 'border-amber-600 ring-2 ring-amber-500/20',
      selectedBg: 'bg-amber-50/70',
      iconBg: 'bg-amber-100 text-amber-800 border-amber-300',
      iconColor: 'text-amber-700',
      pillBg: 'bg-amber-100 text-amber-800',
      pillText: 'text-amber-800',
    },
    defaultCredentials: {
      username: 'operator2',
      password: 'operator123',
    },
  },
];

const DEMO_BENEFICIARY_CARDS = [
  { card: 'RC-KA-01-456123', name: 'Ramesh Sharma', dob: '1982-05-14', initialPwd: 'RAME1982', category: 'BPL Card' },
  { card: 'RC-KA-01-987654', name: 'Suresh Kumar', dob: '1982-05-14', initialPwd: 'SURE1982', category: 'BPL Card' },
  { card: 'RC-KA-01-987655', name: 'Lakshmi Bai', dob: '1964-08-25', initialPwd: 'LAKS1964', category: 'AAY (Antyodaya)' },
  { card: 'RC-KA-01-987656', name: 'Mohammed Rafiq', dob: '1976-12-10', initialPwd: 'MOHA1976', category: 'BPL Card' },
  { card: 'RC-KA-01-987657', name: 'Sunita Patil', dob: '1985-04-18', initialPwd: 'SUNI1985', category: 'APL Card' },
  { card: 'RC-KA-02-123450', name: 'Anand Hegde', dob: '1980-07-03', initialPwd: 'ANAN1980', category: 'BPL Card' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, beneficiaryLogin } = useAuth();

  // Active Selected Role (Default: Beneficiary - citizen-first)
  const [selectedRoleId, setSelectedRoleId] = useState<RoleType>('BENEFICIARY');

  // Staff Credentials
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  // Beneficiary Credentials (Default demo: Ramesh Sharma -> RAME1982)
  const [cardNumber, setCardNumber] = useState('RC-KA-01-456123');
  const [dateOfBirth, setDateOfBirth] = useState('1982-05-14');
  const [beneficiaryPass, setBeneficiaryPass] = useState('RAME1982');

  // Password Visibility Toggles
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [showBeneficiaryPassword, setShowBeneficiaryPassword] = useState(false);

  // Status & Error
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeRole = ROLES.find((r) => r.id === selectedRoleId) || ROLES[0];
  const ActiveIcon = activeRole.icon;

  // Handle Role Switch
  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRoleId(role.id);
    setError(null);

    if (role.mode === 'BENEFICIARY') {
      setCardNumber(role.defaultCredentials.card || 'RC-KA-01-456123');
      setDateOfBirth(role.defaultCredentials.dob || '1982-05-14');
      setBeneficiaryPass(role.defaultCredentials.initialPwd || 'RAME1982');
    } else {
      setUsername(role.defaultCredentials.username || 'operator');
      setPassword(role.defaultCredentials.password || 'operator123');
    }
  };

  // Quick reset to demo credentials
  const handleResetDemo = () => {
    if (activeRole.mode === 'BENEFICIARY') {
      setCardNumber(activeRole.defaultCredentials.card || 'RC-KA-01-456123');
      setDateOfBirth(activeRole.defaultCredentials.dob || '1982-05-14');
      setBeneficiaryPass(activeRole.defaultCredentials.initialPwd || 'RAME1982');
    } else {
      setUsername(activeRole.defaultCredentials.username || 'operator');
      setPassword(activeRole.defaultCredentials.password || 'operator123');
    }
    setError(null);
  };

  // Select one of the 6 demo beneficiary cards
  const handleSelectBeneficiaryCard = (card: (typeof DEMO_BENEFICIARY_CARDS)[0]) => {
    setCardNumber(card.card);
    setDateOfBirth(card.dob);
    setBeneficiaryPass(card.initialPwd);
    setError(null);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeRole.mode === 'BENEFICIARY') {
        await beneficiaryLogin(
          cardNumber.trim().toUpperCase(),
          dateOfBirth.trim(),
          beneficiaryPass.trim()
        );
      } else {
        await login(username.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        (activeRole.mode === 'BENEFICIARY'
          ? 'Card number or date of birth is incorrect. Please check and try again.'
          : 'Invalid username or password. Please try again.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-x-hidden">
      {/* Soft decorative background layers */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-100/60 via-amber-50/40 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <div className="absolute top-48 -left-20 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-4">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-emerald-700 font-semibold text-xs border border-slate-200 shadow-sm transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-emerald-600" />
          <span>Back to Home</span>
        </button>

        {/* Small trust badge */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <BadgeCheck size={14} className="text-emerald-600" />
          <span className="hidden sm:inline">Official Public Distribution System</span>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="text-emerald-700 font-bold">Secure Portal</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        {/* WELCOME BANNER & LOGO (Logo on Top, Titles Underneath) */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 space-y-3">
          {/* ========================================================================= */}
          {/* LOGO ON TOP: Change 'w-28 h-28 sm:w-32 sm:h-32' to adjust size */}
          {/* ========================================================================= */}
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Centered Top Logo Card */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white border-2 border-emerald-500/20 shadow-md p-3 flex items-center justify-center hover:scale-105 transition-transform">
              <img
                src="/smart-ration-logo.png"
                alt="SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS"
                className="w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
              />
            </div>

            {/* Title & Details Directly Underneath Logo */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 leading-tight">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">SMART</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600">RATION SHOP</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider">
                Real-Time Stock Analytics
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Public Distribution & Food Security System
              </p>
            </div>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-slate-700 pt-1">
            Welcome to Smart Ration Shop &bull; Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Choose who you are below, then enter your details to sign in and view your ration information.
          </p>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Role Selection (7 Columns on Desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Choose Your Role
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on your role to see your login form:
                </p>
              </div>

              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                5 Roles Available
              </span>
            </div>

            {/* 5 Distinct Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRoleId === role.id;

                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between ${isSelected
                        ? `${role.theme.selectedBg} ${role.theme.selectedBorder} shadow-md`
                        : `bg-white border-slate-200/90 ${role.theme.bgHover} hover:shadow-md`
                      } ${role.id === 'BENEFICIARY' ? 'sm:col-span-2' : ''}`}
                  >
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-start justify-between gap-2 mb-2 w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform ${isSelected ? role.theme.iconBg : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                        >
                          <Icon size={20} className={isSelected ? role.theme.iconColor : 'text-slate-700'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900">
                              {role.title}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                                <Check size={10} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 block">
                            {role.tagline}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${isSelected
                            ? `${role.theme.pillBg} border-current`
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                      >
                        {isSelected ? 'Selected' : 'Click to select'}
                      </span>
                    </div>

                    {/* Simple Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {role.simpleDescription}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            {/* Indian Public Service Feature Highlights */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-emerald-50/50">
                <Wheat size={18} className="text-emerald-700" />
                <span className="text-[11px] font-bold text-slate-900">Subsidized Food</span>
                <span className="text-[10px] text-slate-500">Rice, Wheat & Sugar</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-amber-50/50">
                <Scale size={18} className="text-amber-700" />
                <span className="text-[11px] font-bold text-slate-900">Fair Weight</span>
                <span className="text-[10px] text-slate-500">Electronic Scale Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-sky-50/50">
                <Sparkles size={18} className="text-sky-700" />
                <span className="text-[11px] font-bold text-slate-900">Smart Token</span>
                <span className="text-[10px] text-slate-500">No Long Queues</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Login Form (5 Columns on Desktop) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-7 space-y-5 relative">
              {/* Form Header with Selected Role */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${activeRole.theme.iconBg}`}>
                    <ActiveIcon size={20} className={activeRole.theme.iconColor} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Login as {activeRole.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {activeRole.mode === 'BENEFICIARY'
                        ? 'Enter your card number and birth date'
                        : 'Enter your username and password'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetDemo}
                  title="Refill demo login details"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Refill Demo</span>
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5"
                  >
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span className="font-medium leading-tight">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeRole.mode === 'STAFF' ? (
                  /* STAFF FORM: Username & Password */
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Username
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User size={16} />
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          placeholder="Please enter your username"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Password
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Demo: {activeRole.defaultCredentials.password}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={16} />
                        </span>
                        <input
                          type={showStaffPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Please enter your password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStaffPassword(!showStaffPassword)}
                          aria-label={showStaffPassword ? 'Hide Password' : 'Show Password'}
                          title={showStaffPassword ? 'Hide Password' : 'Show Password'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* BENEFICIARY FORM: Card Number, DOB, Password */
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Ration Card Number
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <CreditCard size={16} />
                        </span>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          required
                          placeholder="e.g. RC-KA-01-456123"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono uppercase placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Date of Birth (Head of Family)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Calendar size={16} />
                        </span>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          required
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Password
                        </label>
                        <span className="text-[11px] font-medium text-emerald-700">
                          First 4 Letters + Birth Year
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Key size={16} />
                        </span>
                        <input
                          type={showBeneficiaryPassword ? 'text' : 'password'}
                          value={beneficiaryPass}
                          onChange={(e) => setBeneficiaryPass(e.target.value)}
                          required
                          placeholder="e.g. RAME1982"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBeneficiaryPassword(!showBeneficiaryPassword)}
                          aria-label={showBeneficiaryPassword ? 'Hide Password' : 'Show Password'}
                          title={showBeneficiaryPassword ? 'Hide Password' : 'Show Password'}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showBeneficiaryPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Demo Ration Cards Switcher */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span>Tap any demo card to test:</span>
                        <span className="text-emerald-700 font-bold">6 Demo Cards</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-0.5">
                        {DEMO_BENEFICIARY_CARDS.map((c) => {
                          const isActive = cardNumber === c.card;
                          return (
                            <button
                              key={c.card}
                              type="button"
                              onClick={() => handleSelectBeneficiaryCard(c)}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${isActive
                                  ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                              <div className="text-[11px] font-bold truncate leading-tight">
                                {c.name}
                              </div>
                              <div className="text-[9px] text-slate-500 flex items-center justify-between mt-0.5">
                                <span>{c.category}</span>
                                <span className="text-emerald-700 font-semibold">{c.initialPwd}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    <>
                      <LogIn size={17} />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </form>

              {/* Form Footer */}
              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>Need help with your ration card? Contact support or visit your nearest Fair Price Shop.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-slate-200/80 text-xs text-slate-500 mt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS</span>
          <div className="flex items-center gap-3">
            <span>Fair Price Shop: FPS-1001</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-medium">Safe & Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
