import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSse } from '../hooks/useSse';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FallingLeavesAndSand from '../components/FallingLeavesAndSand';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected } = useSse();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-[0_0_25px_rgba(16,185,129,0.4)]" />
          <span className="text-xs text-emerald-400 font-mono font-bold tracking-widest uppercase">
            INITIALIZING SECURE PORTAL...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Ambient Gradient Lighting */}
      <div className="fixed top-20 left-1/4 w-[600px] h-[450px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/3 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Falling Green Leaves & Sand Dust Particles Engine */}
      <FallingLeavesAndSand />

      {/* Navigation Topbar */}
      <Navbar isSseConnected={isConnected} />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-2 sm:p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
