'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import HeroSection from './home/components/HeroSection';
import ContactSection from './home/components/ContactSection';
import EducationSummary from './home/components/EducationSummary';
import QuickLinks from './home/components/QuickLinks';
import { researchProjects } from '../data/research';
import { experienceData } from '../data/experience';
import { Shield, ExternalLink, ChevronRight, Briefcase, BookOpen } from 'lucide-react';
import Link from 'next/link';

const AnimatedSection = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => {
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

const ExperienceHighlights = () => {
  const topExperiences = experienceData.slice(0, 3);

  return (
    <section className="py-24 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[-10%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }} />
      </div>
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Briefcase size={18} className="text-[#007aff]" />
                <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93]">Experience</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-0">
                Where I&apos;ve Worked
              </h2>
            </div>
            <Link href="/experience" className="hidden md:flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {topExperiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="liquid-glass-card p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider liquid-glass-pill ${
                        exp.type === 'Research' ? 'text-purple-600' :
                        exp.type === 'Industry' ? 'text-[#007aff]' :
                        exp.type === 'Academic' ? 'text-green-600' :
                        'text-orange-600'
                      }`} style={{ borderRadius: '99em' }}>
                        {exp.type}
                      </span>
                      <span className="text-xs text-[#8e8e93] font-mono">{exp.period}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#1c1c1e] mb-1">{exp.title}</h3>
                    <p className="text-sm text-[#48484a] mb-0">{exp.company}</p>
                  </div>
                  {exp.technologies && (
                    <div className="flex flex-wrap gap-1.5 md:max-w-xs">
                      {exp.technologies.slice(0, 5).map(tech => (
                        <span key={tech} className="text-[10px] px-2 py-0.5 text-[#8e8e93] liquid-glass-pill">
                          {tech}
                        </span>
                      ))}
                      {exp.technologies.length > 5 && (
                        <span className="text-[10px] px-2 py-0.5 text-[#aeaeb2] liquid-glass-pill">
                          +{exp.technologies.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <Link href="/experience" className="md:hidden flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors mt-6 no-underline">
            View all experience <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const ResearchHighlights = () => {
  const topResearch = researchProjects.slice(0, 3);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-[-5%] w-[350px] h-[350px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #c7b8ea 0%, transparent 70%)' }} />
      </div>
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <BookOpen size={18} className="text-[#007aff]" />
                <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93]">Research</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-0">
                Security Research
              </h2>
            </div>
            <Link href="/research" className="hidden md:flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topResearch.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={project.detailsLink} className="no-underline">
                  <div className="liquid-glass-card p-6 h-full group cursor-pointer">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield size={16} className="text-[#007aff]" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93]">
                        {project.advisor.split('(')[0].trim()}
                      </span>
                    </div>
                    <h3 className="text-[#1c1c1e] font-semibold text-sm mb-3 leading-snug group-hover:text-[#007aff] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#8e8e93] leading-relaxed mb-4 line-clamp-3">
                      {project.keyPoints[0]}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#007aff]">
                      <span>Read more</span>
                      <ExternalLink size={10} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <Link href="/research" className="md:hidden flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors mt-6 no-underline">
            View all research <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen relative" style={{ background: '#f2f2f7' }}>
      <HeroSection />
      <div className="section-divider" />
      <AnimatedSection><ExperienceHighlights /></AnimatedSection>
      <div className="section-divider" />
      <AnimatedSection><ResearchHighlights /></AnimatedSection>
      <div className="section-divider" />
      <AnimatedSection><EducationSummary /></AnimatedSection>
      <div className="section-divider" />
      <AnimatedSection><ContactSection /></AnimatedSection>
      <AnimatedSection><QuickLinks /></AnimatedSection>
    </div>
  );
}
