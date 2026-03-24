'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Award, BookOpen } from 'lucide-react';
import { educationData } from '../../data';
import { useLanguage, localize, localizeArray } from '../../i18n/LanguageContext';

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

export default function Education() {
  const { t, lang } = useLanguage();

  const eduEntries = [
    { edu: educationData[0], color: 'text-[#007aff]', location: 'Providence, RI' },
    { edu: educationData[1], color: 'text-purple-600', location: 'Newark, Delaware' },
  ];

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
                <GraduationCap size={14} className="text-[#007aff]" />
                {t('edu.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[2.625rem] md:text-[4.25rem] font-bold text-[#1c1c1e] tracking-tight leading-tight mb-6"
            >
              {t('edu.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base text-[#48484a] leading-relaxed mx-auto text-center"
            >
              {t('edu.subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Education Sections */}
      <AnimatedSection>
        <section className="py-8 pb-16">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              {eduEntries.map(({ edu, color, location }, index) => (
                <div key={edu.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="py-10"
                  >
                    {/* Status & Period */}
                    <div className="flex items-center gap-3 mb-3">
                      {edu.status && (
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${color}`}>
                          {localize(lang, edu.status, edu.status_zh)}
                        </span>
                      )}
                      <span className="text-xs text-[#aeaeb2] font-mono">{edu.period}</span>
                    </div>

                    {/* Institution */}
                    <h2 className="text-[1.625rem] md:text-[2.625rem] font-bold text-[#1c1c1e] tracking-tight mb-6">
                      {localize(lang, edu.institution, edu.institution_zh)}
                    </h2>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mb-8">
                      {[
                        ...(edu.degreeType ? [{ label: t('edu.label.degree'), value: localize(lang, edu.degreeType, edu.degreeType_zh) }] : []),
                        ...(edu.major ? [{ label: t('edu.label.major'), value: localize(lang, edu.major, edu.major_zh) }] : []),
                        { label: t('edu.label.gpa'), value: edu.gpa || '' },
                        { label: t('edu.label.focus'), value: localize(lang, edu.focus, edu.focus_zh) },
                        { label: t('edu.label.location'), value: location },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93] block mb-1">{item.label}</span>
                          <span className="text-sm text-[#1c1c1e] font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-[#48484a] leading-relaxed mb-8 max-w-3xl">
                      {localize(lang, edu.description, edu.description_zh)}
                    </p>

                    {/* Activities */}
                    {edu.activities && edu.activities.length > 0 && (
                      <div className="mb-8">
                        <h4 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase flex items-center gap-1.5 mb-3">
                          <BookOpen size={12} className="text-[#007aff]" />
                          {t('edu.label.activities')}
                        </h4>
                        <div className="space-y-2">
                          {localizeArray(lang, edu.activities, edu.activities_zh).map((activity, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-[#007aff] rounded-full flex-shrink-0 mt-1.5" />
                              <span className="text-sm text-[#48484a]">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Awards */}
                    {edu.awards && edu.awards.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase flex items-center gap-1.5 mb-3">
                          <Award size={12} className="text-amber-500" />
                          {t('edu.awards')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {edu.awards.map((award, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-mono text-[#636366] liquid-glass-pill px-3 py-1.5">
                              <span className="text-amber-500">{award.year}</span>
                              {localize(lang, award.title, award.title_zh)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Gradient divider between schools */}
                  {index < eduEntries.length - 1 && (
                    <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #c6c6c8, transparent)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
