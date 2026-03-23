'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, GraduationCap, Building } from 'lucide-react';
import { experienceData } from '../../data';
import type { Experience } from '../../data/experience';

const AnimatedSection = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Research': return GraduationCap;
    case 'Academic': return GraduationCap;
    case 'Industry': return Briefcase;
    case 'Finance': return Building;
    default: return Briefcase;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Research': return 'text-purple-600';
    case 'Academic': return 'text-[#007aff]';
    case 'Industry': return 'text-emerald-600';
    case 'Finance': return 'text-amber-600';
    default: return 'text-[#007aff]';
  }
};

const getDotColor = (type: string) => {
  switch (type) {
    case 'Research': return 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]';
    case 'Academic': return 'bg-[#007aff] shadow-[0_0_12px_rgba(0,122,255,0.4)]';
    case 'Industry': return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]';
    case 'Finance': return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]';
    default: return 'bg-[#007aff] shadow-[0_0_12px_rgba(0,122,255,0.4)]';
  }
};

export default function ExperiencePage() {
  return (
    <div className="min-h-screen relative" style={{ background: '#f2f2f7' }}>
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #c7b8ea 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffd6a5 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#48484a] liquid-glass-pill">
                <Briefcase size={14} className="text-[#007aff]" />
                Professional Journey
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-[#1c1c1e] tracking-tight leading-tight mb-6"
            >
              Experience
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-[#48484a] leading-relaxed mx-auto text-center"
            >
              From research and academia to industry — diverse perspectives
              on technology, security, and innovation.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <AnimatedSection>
        <section className="py-8 pb-16">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#007aff]/30 via-[#007aff]/10 to-transparent" />

                {experienceData.map((exp: Experience, index: number) => {
                  const isLeft = index % 2 === 0;
                  const IconComponent = getTypeIcon(exp.type);
                  const typeColor = getTypeColor(exp.type);
                  const dotColor = getDotColor(exp.type);

                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-6 mb-10`}
                    >
                      {/* Dot */}
                      <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10 ${dotColor}`} />

                      {/* Card */}
                      <Link
                        href={`/experience/${exp.id}`}
                        className="ml-14 md:ml-0 md:w-[calc(50%-2rem)] block"
                      >
                        <div className="liquid-glass-card p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                          {/* Type & Period */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${typeColor} liquid-glass-pill px-2 py-0.5`}>
                              <IconComponent size={10} />
                              {exp.type}
                            </span>
                            <span className="text-xs text-[#8e8e93] font-mono">{exp.period}</span>
                          </div>

                          {/* Title & Company */}
                          <h3 className="text-base font-semibold text-[#1c1c1e] mb-1 group-hover:text-[#007aff] transition-colors">{exp.title}</h3>
                          <p className="text-sm text-[#636366]">{exp.company}</p>

                          {/* Arrow hint */}
                          <div className="mt-3 flex items-center text-xs text-[#8e8e93] group-hover:text-[#007aff] transition-colors">
                            <span>View details</span>
                            <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
