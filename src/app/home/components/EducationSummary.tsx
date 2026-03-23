'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { educationData } from '../../../data';

const EducationSummary = () => {
  const [graduate, undergraduate] = educationData;

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[-5%] w-[350px] h-[350px] rounded-full opacity-12"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }} />
      </div>
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <GraduationCap size={18} className="text-[#007aff]" />
              <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93]">Education</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-0">
              Academic Background
            </h2>
          </motion.div>

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
