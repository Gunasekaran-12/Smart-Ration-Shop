import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AnalyticsShowcase from '../components/landing/AnalyticsShowcase';
import AboutSection from '../components/landing/AboutSection';
import LandingFooter from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Scroll to top on initial mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 antialiased relative">
      {/* Top Fixed Navigation */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section with 3D Cyber-Warehouse & Commodity Scene */}
        <HeroSection />

        {/* 2. Features Section (6 Core Pillars) */}
        <FeaturesSection />

        {/* 3. How It Works Timeline Flow */}
        <HowItWorksSection />

        {/* 4. Live Analytics Showcase Preview */}
        <AnalyticsShowcase />

        {/* 5. Platform Architecture & About Section */}
        <AboutSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;

