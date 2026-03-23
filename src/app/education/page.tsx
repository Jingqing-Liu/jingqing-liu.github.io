'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Award, BookOpen, MapPin, Star } from 'lucide-react';
import { educationData } from '../../data';

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
  const [graduate, undergraduate] = educationData;

  // Build unified timeline entries sorted by year (newest first)
  type TimelineEntry =
    | { type: 'education'; data: typeof graduate; year: number }
    | { type: 'award'; title: string; year: number };

  const timelineEntries: TimelineEntry[] = [
    { type: 'education' as const, data: graduate, year: 2026 },
    { type: 'education' as const, data: undergraduate, year: 2020 },
    ...(undergraduate.awards?.map((a) => ({
      type: 'award' as const,
      title: a.title,
      year: a.year,
    })) || []),
  ].sort((a, b) => b.year - a.year || (a.type === 'education' ? 1 : -1));

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
                Academic Journey
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-[#1c1c1e] tracking-tight leading-tight mb-6"
            >
              Education
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-[#48484a] leading-relaxed mx-auto"
              style={{ textAlign: 'center' }}
            >
              A journey through Computer Science — from cybersecurity foundations
              at Delaware to AI and systems research at Brown.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Academic Timeline */}
      <AnimatedSection>
        <section className="py-8 pb-16">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#007aff]/30 via-[#007aff]/10 to-transparent" />

                {timelineEntries.map((entry, index) => {
                  const isLeft = index % 2 === 0;

                  if (entry.type === 'education') {
                    const edu = entry.data;
                    const isCurrent = edu.id === 'brown-ms';
                    return (
                      <motion.div
                        key={edu.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-6 mb-10`}
                      >
                        {/* Dot */}
                        <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10 ${isCurrent ? 'bg-[#007aff] shadow-[0_0_12px_rgba(0,122,255,0.4)]' : 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'}`} />

                        {/* Card */}
                        <div className="ml-14 md:ml-0 md:w-[calc(50%-2rem)] liquid-glass-card p-6">
                          <div className="flex items-center gap-2 mb-3">
                            {edu.status && (
                              <span className={`text-[10px] font-mono uppercase tracking-wider liquid-glass-pill px-2 py-0.5 ${isCurrent ? 'text-[#007aff]' : 'text-purple-600'}`}>
                                {edu.status}
                              </span>
                            )}
                            <span className="text-xs text-[#8e8e93] font-mono">{edu.period}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-[#1c1c1e] mb-3">{edu.institution}</h3>

                          {/* Program Details */}
                          <div className="space-y-2 mb-4">
                            {([
                                  ...(edu.degreeType ? [{ label: 'Degree', value: edu.degreeType, icon: GraduationCap }] : []),
                                  ...(edu.major ? [{ label: 'Major', value: edu.major, icon: BookOpen }] : []),
                                  { label: 'GPA', value: edu.gpa || '', icon: Star },
                                  { label: 'Focus', value: edu.focus, icon: BookOpen },
                                  { label: 'Location', value: isCurrent ? 'Providence, RI' : 'Newark, Delaware', icon: MapPin },
                                ]
                            ).map((item) => (
                              <div key={item.label} className="flex items-center py-0.5">
                                <item.icon size={13} className="text-[#007aff] flex-shrink-0 w-4" />
                                <span className="text-xs text-[#636366] w-16 flex-shrink-0 ml-2">{item.label}</span>
                                <span className="text-sm text-[#1c1c1e] font-medium">{item.value}</span>
                              </div>
                            ))}
                          </div>

                          {/* Overview */}
                          <p className={`text-xs text-[#48484a] leading-relaxed ${edu.activities && edu.activities.length > 0 ? 'mb-4' : ''}`}>
                            {edu.description}
                          </p>

                          {/* Activities */}
                          {edu.activities && edu.activities.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase flex items-center gap-1.5">
                                <BookOpen size={12} className="text-[#007aff]" />
                                Activities
                              </h4>
                              {edu.activities.map((activity, i) => (
                                <div key={i} className="flex items-center gap-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                                  <span className="text-xs text-[#1c1c1e]">{activity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  }

                  // Award entry
                  return (
                    <motion.div
                      key={`award-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-6 mb-10`}
                    >
                      {/* Dot */}
                      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)] z-10" />

                      {/* Card */}
                      <div className="ml-14 md:ml-0 md:w-[calc(50%-2rem)] liquid-glass-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-600 liquid-glass-pill px-2 py-0.5">
                            <Award size={10} />
                            Award
                          </span>
                          <span className="text-xs text-[#8e8e93] font-mono">{entry.year}</span>
                        </div>
                        <p className="text-sm font-medium text-[#1c1c1e]">{entry.title}</p>
                      </div>
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
