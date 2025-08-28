'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { personalInfo } from '../../../data';

const HeroSection = () => {
  return (
    <section className="pt-24 pb-20 min-h-[80vh] flex items-center">
      <div className="container mx-auto px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center space-y-8"
          >
            {/* Main Title */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                className="text-6xl md:text-8xl lg:text-9xl font-light text-gray-900 tracking-tight leading-none"
              >
                {personalInfo.name.split(' ')[0]}
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                className="text-6xl md:text-8xl lg:text-9xl font-light text-gray-900 tracking-tight leading-none"
              >
                {personalInfo.name.split(' ')[1]}
              </motion.h1>
            </div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="space-y-2"
            >
              <p className="text-lg md:text-xl text-gray-600 font-medium tracking-wide">
                {personalInfo.title}
              </p>
              <div className="w-12 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
              className="pt-4"
            >
              <p className="text-sm text-gray-500 tracking-widest uppercase font-medium">
                {personalInfo.address.institution}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {personalInfo.address.city}, {personalInfo.address.state}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
