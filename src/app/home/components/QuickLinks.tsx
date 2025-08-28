'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { navItems } from '../../../data';

const QuickLinks = () => {
  const quickLinkItems = navItems.filter(item => item.href !== '/');

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-4">
              Explore My Work
            </h2>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickLinkItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.4 + (index * 0.1), 
                  duration: 0.6, 
                  ease: "easeOut" 
                }}
                className="group"
              >
                <motion.a
                  href={item.href}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  className="block bg-white rounded-3xl p-10 text-center hover:shadow-2xl transition-all duration-500 ease-out h-full"
                >
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-gray-100 transition-colors duration-300">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4">
                      <div className="inline-flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                        <span>Explore</span>
                        <motion.svg 
                          className="w-4 h-4 ml-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          initial={{ x: 0 }}
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </div>
                    </div>
                  </div>
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
