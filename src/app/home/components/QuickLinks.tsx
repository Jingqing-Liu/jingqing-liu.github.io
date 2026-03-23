'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import { navItems } from '../../../data';

const iconMap: Record<string, React.ElementType> = {
  'Education': GraduationCap,
  'Research': BookOpen,
  'Experience': Briefcase,
};

const QuickLinks = () => {
  const quickLinkItems = navItems.filter(item => item.href !== '/');

  return (
    <section className="py-12">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-0">
              Explore My Work
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinkItems.map((item, index) => {
              const Icon = iconMap[item.name] || BookOpen;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <motion.a
                    href={item.href}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.98 }}
                    className="block liquid-glass-card p-8 text-center h-full group no-underline"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 liquid-glass-pill group-hover:scale-105 transition-transform"
                      style={{ borderRadius: '16px' }}
                    >
                      <Icon size={22} className="text-[#007aff]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1c1c1e] mb-2">{item.name}</h3>
                    <p className="text-sm text-[#8e8e93] leading-relaxed mb-4">{item.description}</p>
                    <div className="inline-flex items-center gap-1.5 text-sm text-[#007aff] group-hover:gap-2.5 transition-all">
                      <span>Explore</span>
                      <ArrowRight size={14} />
                    </div>
                  </motion.a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
