import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ArrowRight, Menu, X, Sparkles, BarChart3, Layers, Clock, Info } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero', icon: Sparkles },
    { label: 'Features', href: '#features', icon: Layers },
    { label: 'How It Works', href: '#how-it-works', icon: Clock },
    { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    { label: 'About', href: '#about', icon: Info },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070d18]/85 backdrop-blur-xl border-b border-emerald-500/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group focus:outline-none"
            aria-label="SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-60 blur-sm group-hover:opacity-100 transition duration-300" />
              <img
                src="/smart-ration-logo.png"
                alt="SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS"
                className="relative w-10 h-10 object-contain rounded-lg bg-[#0b1528] p-0.5 border border-emerald-500/30 shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  Smart Ration Shop Management System
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  with Real-Time Stock Analytics
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide -mt-0.5 hidden xs:block">
                Smart Ration Shop Management System with Real-Time Stock Analytics
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-900/40 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleScrollTo(e, item.href)}
                className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-full transition-all duration-200 hover:bg-white/10"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: Authentication Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 rounded-lg transition-all duration-200 shadow-sm"
            >
              <LogIn size={15} className="text-emerald-400" />
              <span>Log In</span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="relative inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_28px_rgba(16,185,129,0.55)] group transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
            >
              Log In
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-[#070d18]/95 backdrop-blur-2xl border-b border-emerald-500/20 px-4 pt-2 pb-6 space-y-3"
          >
            <div className="grid grid-cols-1 gap-1 pt-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleScrollTo(e, item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    <Icon size={16} className="text-emerald-400" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-800 border border-slate-700 rounded-lg"
              >
                <LogIn size={16} className="text-emerald-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg shadow-md"
              >
                <span>Get Started / Sign Up</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingNavbar;
