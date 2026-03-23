'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { educationData } from '../../../data';

const EducationSummary = () => {
  const [graduate, undergraduate] = educationData;

  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={16} className="text-[#007aff]" />
                <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93]">Education</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1c1c1e] tracking-tight">
                Academic Background
              </h2>
            </div>
            <Link href="/education" className="hidden md:flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="liquid-glass-card p-8"
            >
              <div className="mb-4">
                <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 text-[#007aff] liquid-glass-pill">
                  {graduate.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[#1c1c1e] mb-2">{graduate.degree}</h3>
              <p className="text-base text-[#007aff] font-medium mb-3">{graduate.institution}</p>
              <div className="space-y-1">
                <p className="text-sm text-[#48484a] mb-0">Computer Science</p>
                <p className="text-xs text-[#8e8e93] mb-0">{graduate.focus}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="liquid-glass-card p-8"
            >
              <div className="mb-4">
                <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 text-purple-600 liquid-glass-pill">
                  {undergraduate.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[#1c1c1e] mb-2">{undergraduate.degree}</h3>
              <p className="text-base text-[#007aff] font-medium mb-3">{undergraduate.institution}</p>
              <div className="space-y-1">
                <p className="text-sm text-[#48484a] mb-0">Computer and Information Science</p>
                <p className="text-xs text-[#8e8e93] mb-0">GPA: {undergraduate.gpa} &bull; Graduated 2024</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSummary;
