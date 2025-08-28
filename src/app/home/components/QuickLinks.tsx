'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { navItems } from '../../../data';
import Card from '../../../components/Card';

const QuickLinks = () => {
  const quickLinkItems = navItems.filter(item => item.href !== '/');
  
  const getIconEmoji = (name: string) => {
    switch (name.toLowerCase()) {
      case 'research': return '🔬';
      case 'education': return '🎓';
      case 'experience': return '💼';
      default: return '📄';
    }
  };

  const getColorClass = (index: number) => {
    const colors = ['blue', 'green', 'purple'];
    return colors[index % colors.length];
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-3xl font-bold text-center mb-12 text-gray-900"
        >
          Explore My Work
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {quickLinkItems.map((item, index) => {
            const colorClass = getColorClass(index);
            return (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + (index * 0.1) }}
                className="group"
              >
                <Card 
                  hover={false} 
                  className="h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2"
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 bg-${colorClass}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-2xl">{getIconEmoji(item.name)}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </Card>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
