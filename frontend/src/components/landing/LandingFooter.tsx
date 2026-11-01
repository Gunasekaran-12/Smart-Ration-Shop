import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#050a12] border-t border-white/10 text-slate-400 overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Info (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/smart-ration-logo.png"
                alt="SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS"
                className="w-10 h-10 object-contain rounded-lg bg-[#0b1528] p-0.5 border border-emerald-500/30 shadow-md"
              />
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                Smart Ration Shop Management System with Real-Time Stock Analytics
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
              An enterprise digital Public Distribution System platform engineered to modernize
              Fair Price Shops with cryptographic batch ledgers, atomic distributions, and live
              inventory telemetry.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 pt-1">
              <ShieldCheck size={16} />
              <span>Verifiable Cryptographic Ledger • Role-Based Governance</span>
            </div>
          </div>

          {/* Quick Navigation (Col 3) */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => handleScrollTo(e, '#hero')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  onClick={(e) => handleScrollTo(e, '#features')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Features & Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleScrollTo(e, '#how-it-works')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#analytics"
                  onClick={(e) => handleScrollTo(e, '#analytics')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Real-Time Analytics
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleScrollTo(e, '#about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Portals & Access (Col 4) */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Portal Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Operator POS Counter</span>
                  <ArrowRight size={12} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Super Admin Terminal</span>
                  <ArrowRight size={12} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Beneficiary Card Portal</span>
                  <ArrowRight size={12} />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Auditor Security Ledger</span>
                  <ArrowRight size={12} />
                </button>
              </li>
            </ul>
          </div>

          {/* System Status (Col 5) */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              System Status
            </h4>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white">ALL SYSTEMS NOMINAL</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                Spring Boot REST APIs and MySQL database operational.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full mt-2 py-2 px-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-lg transition-all"
              >
                Log In to Platform
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© 2026 SMART RATION SHOP MANAGEMENT SYSTEM WITH REAL-TIME STOCK ANALYTICS. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Precision Public Distribution Infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
