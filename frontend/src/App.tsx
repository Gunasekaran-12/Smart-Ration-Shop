import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import SplashIntroPage from './pages/SplashIntroPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DistributionPage from './pages/DistributionPage';
import RationCardsPage from './pages/RationCardsPage';
import StockManagementPage from './pages/StockManagementPage';
import EntitlementsPage from './pages/EntitlementsPage';
import ReportsPage from './pages/ReportsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import UsersShopsPage from './pages/UsersShopsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import BookingPage from './pages/BookingPage';
import ChatbotPage from './pages/ChatbotPage';
import ChatbotWidget from './components/ChatbotWidget';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Premium 3D Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Splash Screen Intro (Preserved) */}
          <Route path="/splash" element={<SplashIntroPage />} />

          {/* 3. Login Page with 3D Ledger Book Animation */}
          <Route path="/login" element={<LoginPage />} />

          {/* 4. Protected Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/distribution" element={<DistributionPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/cards" element={<RationCardsPage />} />
            <Route path="/stock" element={<StockManagementPage />} />
            <Route path="/entitlements" element={<EntitlementsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/users-shops" element={<UsersShopsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Floating Database AI Assistant */}
        <ChatbotWidget />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
