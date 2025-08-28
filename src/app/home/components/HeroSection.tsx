'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { personalInfo } from '../../../data';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-0">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
            {personalInfo.name}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
          >
            {personalInfo.title}
          </motion.p>
          {/* <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            {personalInfo.description}
          </motion.p> */}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
