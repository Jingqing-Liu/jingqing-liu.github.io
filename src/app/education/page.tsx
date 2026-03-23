'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, Award, BookOpen, Calendar, MapPin, Star } from 'lucide-react';
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
                Academic Background
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
              From undergraduate excellence at the University of Delaware
              to advanced graduate studies at Brown University.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Graduate Studies */}
      <AnimatedSection>
        <section className="pb-8">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="liquid-glass-card p-8 md:p-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono tracking-wider uppercase text-[#007aff] liquid-glass-pill mb-4">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Current
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-2">
                      Graduate Studies
                    </h2>
                    <p className="text-xl text-[#007aff] font-semibold">{graduate.institution}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8e8e93] liquid-glass-pill px-3 py-1.5">
                    <Calendar size={14} />
                    <span className="font-mono">{graduate.period}</span>
                  </div>
                </div>

                {/* Program Details */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase">Program Details</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Degree', value: graduate.degree, icon: GraduationCap },
                      { label: 'Expected', value: graduate.status, icon: Calendar },
                      { label: 'Focus', value: graduate.focus, icon: BookOpen },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center py-1">
                        <item.icon size={14} className="text-[#007aff] flex-shrink-0 w-5" />
                        <span className="text-xs text-[#636366] w-20 flex-shrink-0 ml-2">{item.label}</span>
                        <span className="text-sm text-[#1c1c1e] font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overview */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase">Overview</h3>
                  <p className="text-sm text-[#48484a] leading-relaxed">
                    {graduate.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Undergraduate Degree */}
      <AnimatedSection>
        <section className="py-8">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="liquid-glass-card p-8 md:p-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono tracking-wider uppercase text-purple-600 liquid-glass-pill mb-4">
                      <Award size={12} />
                      {undergraduate.status}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-2">
                      Undergraduate Degree
                    </h2>
                    <p className="text-xl text-[#007aff] font-semibold">{undergraduate.institution}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8e8e93] liquid-glass-pill px-3 py-1.5">
                    <Calendar size={14} />
                    <span className="font-mono">{undergraduate.period}</span>
                  </div>
                </div>

                {/* Details + Awards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase">Program Details</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Degree', value: undergraduate.degree, icon: GraduationCap },
                        { label: 'GPA', value: undergraduate.gpa || '', icon: Star },
                        { label: 'Focus', value: undergraduate.focus, icon: BookOpen },
                        { label: 'Location', value: 'Newark, Delaware', icon: MapPin },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center py-1">
                          <item.icon size={14} className="text-[#007aff] flex-shrink-0 w-5" />
                          <span className="text-xs text-[#636366] w-20 flex-shrink-0 ml-2">{item.label}</span>
                          <span className="text-sm text-[#1c1c1e] font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase flex items-center gap-2">
                      <Award size={13} className="text-[#007aff]" />
                      Awards & Honors
                    </h3>
                    <div className="space-y-2">
                      {undergraduate.awards?.map((award, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl liquid-glass-pill"
                          style={{ borderRadius: '12px' }}
                        >
                          <div className="w-1.5 h-1.5 bg-[#007aff] rounded-full flex-shrink-0" />
                          <span className="text-sm text-[#1c1c1e]">{award}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Overview + Activities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase">Overview</h3>
                    <p className="text-sm text-[#48484a] leading-relaxed">
                      {undergraduate.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase flex items-center gap-2">
                      <BookOpen size={13} className="text-[#007aff]" />
                      Activities
                    </h3>
                    <div className="space-y-2">
                      {undergraduate.activities?.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-xl liquid-glass-pill"
                          style={{ borderRadius: '12px' }}
                        >
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                          <span className="text-sm text-[#1c1c1e]">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Academic Timeline */}
      <AnimatedSection>
        <section className="py-16">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-0">
                  Academic Timeline
                </h2>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#007aff]/30 via-[#007aff]/10 to-transparent" />

                {/* Graduate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative flex flex-col md:flex-row items-start gap-6 mb-8"
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#007aff] shadow-[0_0_12px_rgba(0,122,255,0.4)] z-10" />

                  {/* Card */}
                  <div className="ml-14 md:ml-0 md:w-[calc(50%-2rem)] liquid-glass-card p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#007aff] liquid-glass-pill px-2 py-0.5">
                        Current
                      </span>
                      <span className="text-xs text-[#8e8e93] font-mono">{graduate.period}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1c1c1e] mb-1">{graduate.degree}</h3>
                    <p className="text-sm text-[#007aff] font-medium mb-1">{graduate.institution}</p>
                    <p className="text-xs text-[#8e8e93] mb-0">{graduate.focus}</p>
                  </div>
                </motion.div>

                {/* Undergraduate */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="relative flex flex-col md:flex-row-reverse items-start gap-6"
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)] z-10" />

                  {/* Card */}
                  <div className="ml-14 md:ml-0 md:w-[calc(50%-2rem)] liquid-glass-card p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 liquid-glass-pill px-2 py-0.5">
                        {undergraduate.status}
                      </span>
                      <span className="text-xs text-[#8e8e93] font-mono">{undergraduate.period}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1c1c1e] mb-1">{undergraduate.degree}</h3>
                    <p className="text-sm text-[#007aff] font-medium mb-1">{undergraduate.institution}</p>
                    <p className="text-xs text-[#8e8e93] mb-0">GPA: {undergraduate.gpa}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
