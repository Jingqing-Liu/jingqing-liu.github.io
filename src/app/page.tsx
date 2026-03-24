'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import HeroSection from './home/components/HeroSection';
import EducationSummary from './home/components/EducationSummary';
import { researchProjects } from '../data/research';
import { experienceData } from '../data/experience';
import { ChevronRight, Briefcase, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useLanguage, localize } from '../i18n/LanguageContext';

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
  const { t, lang } = useLanguage();
  const topExperiences = experienceData.slice(0, 3);

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={16} className="text-[#007aff]" />
                <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93]">{t('home.experience.tag')}</span>
              </div>
              <h2 className="text-[1.625rem] md:text-[2.625rem] font-bold text-[#1c1c1e] tracking-tight">
                {t('home.experience.title')}
              </h2>
            </div>
            <Link href="/experience" className="hidden md:flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
              {t('home.experience.viewAll')} <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-[#c6c6c8]/40">
            {topExperiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={`/experience/${exp.id}`} className="no-underline group block py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${
                          exp.type === 'Research' ? 'text-purple-600' :
                          exp.type === 'Industry' ? 'text-[#007aff]' :
                          exp.type === 'Academic' ? 'text-green-600' :
                          'text-orange-600'
                        }`}>
                          {t(`exp.type.${exp.type}`)}
                        </span>
                        <span className="text-xs text-[#aeaeb2] font-mono">{exp.period}</span>
                      </div>
                      <h3 className="text-[#1c1c1e] font-semibold text-base mb-1 leading-snug group-hover:text-[#007aff] transition-colors">
                        {localize(lang, exp.title, exp.title_zh)}
                      </h3>
                      <p className="text-sm text-[#8e8e93]">{localize(lang, exp.company, exp.company_zh)}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#c7c7cc] group-hover:text-[#007aff] transition-colors flex-shrink-0 mt-2" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <Link href="/experience" className="md:hidden flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors mt-6 no-underline">
            {t('home.experience.viewAllMobile')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const ResearchHighlights = () => {
  const { t, lang } = useLanguage();
  const topResearch = researchProjects.slice(0, 3);

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-[#007aff]" />
                <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93]">{t('home.research.tag')}</span>
              </div>
              <h2 className="text-[1.625rem] md:text-[2.625rem] font-bold text-[#1c1c1e] tracking-tight">
                {t('home.research.title')}
              </h2>
            </div>
            <Link href="/research" className="hidden md:flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
              {t('home.research.viewAll')} <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-[#c6c6c8]/40">
            {topResearch.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={project.detailsLink} className="no-underline group block py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93]">
                          {t('research.advisor')}: {localize(lang, project.advisor, project.advisor_zh)}
                        </span>
                      </div>
                      <h3 className="text-[#1c1c1e] font-semibold text-base leading-snug group-hover:text-[#007aff] transition-colors mb-2">
                        {localize(lang, project.title, project.title_zh)}
                      </h3>
                      <p className="text-sm text-[#8e8e93] leading-relaxed line-clamp-2">
                        {lang === 'zh' && project.keyPoints_zh ? project.keyPoints_zh[0] : project.keyPoints[0]}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-[#c7c7cc] group-hover:text-[#007aff] transition-colors flex-shrink-0 mt-2" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <Link href="/research" className="md:hidden flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors mt-6 no-underline">
            {t('home.research.viewAllMobile')} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Fixed background: base color + gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{ background: '#f2f2f7' }}>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }} />
        <div className="absolute top-[10%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #c7b8ea 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #ffd6a5 0%, transparent 70%)' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a5d6ff 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] left-[40%] w-[350px] h-[350px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffc0cb 0%, transparent 70%)' }} />
      </div>

      <HeroSection />
      <div className="max-w-5xl mx-auto px-6 md:px-8"><div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #c6c6c8, transparent)' }} /></div>
      <AnimatedSection><ExperienceHighlights /></AnimatedSection>
      <div className="max-w-5xl mx-auto px-6 md:px-8"><div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #c6c6c8, transparent)' }} /></div>
      <AnimatedSection><ResearchHighlights /></AnimatedSection>
      <div className="max-w-5xl mx-auto px-6 md:px-8"><div className="h-px" style={{ background: 'linear-gradient(to right, transparent, #c6c6c8, transparent)' }} /></div>
      <AnimatedSection><EducationSummary /></AnimatedSection>
    </div>
  );
}
