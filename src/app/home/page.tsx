'use client';

import React from 'react';
import HeroSection from './components/HeroSection';
import ContactSection from './components/ContactSection';
import EducationSummary from './components/EducationSummary';
import QuickLinks from './components/QuickLinks';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HeroSection />
      <ContactSection />
      <EducationSummary />
      <QuickLinks />
    </div>
  );
}
