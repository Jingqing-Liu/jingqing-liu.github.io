'use client';

import React from 'react';
import HeroSection from './home/components/HeroSection';
import ContactSection from './home/components/ContactSection';
import EducationSummary from './home/components/EducationSummary';
import QuickLinks from './home/components/QuickLinks';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HeroSection />
      <ContactSection />
      <EducationSummary />
      <QuickLinks />
    </div>
  );
}
