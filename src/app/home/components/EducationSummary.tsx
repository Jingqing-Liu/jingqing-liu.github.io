'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { educationData } from '../../../data';
import { useLanguage, localize } from '../../../i18n/LanguageContext';

const EducationSummary = () => {
  const [graduate, undergraduate] = educationData;
  const { t, lang } = useLanguage();

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap size={16} className="text-[#007aff]" />
                <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93]">{t('home.education.tag')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight">
                {t('home.education.title')}
              </h2>
            </div>
            <Link href="/education" className="hidden md:flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
              {t('home.education.viewAll')} <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="liquid-glass-card p-8"
            >
              <div className="mb-4">
                <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 text-[#007aff] liquid-glass-pill">
                  {graduate.status ? localize(lang, graduate.status, graduate.status_zh) : ''}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[#1c1c1e] mb-2">{localize(lang, graduate.degree, graduate.degree_zh)}</h3>
              <p className="text-base text-[#007aff] font-medium mb-3">{localize(lang, graduate.institution, graduate.institution_zh)}</p>
              <div className="space-y-1">
                <p className="text-sm text-[#48484a] mb-0">{localize(lang, 'Computer Science', '计算机科学')}</p>
                <p className="text-xs text-[#8e8e93] mb-0">{localize(lang, graduate.focus, graduate.focus_zh)}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="liquid-glass-card p-8"
            >
              <div className="mb-4">
                <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 text-purple-600 liquid-glass-pill">
                  {undergraduate.status ? localize(lang, undergraduate.status, undergraduate.status_zh) : ''}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-[#1c1c1e] mb-2">{localize(lang, undergraduate.degree, undergraduate.degree_zh)}</h3>
              <p className="text-base text-[#007aff] font-medium mb-3">{localize(lang, undergraduate.institution, undergraduate.institution_zh)}</p>
              <div className="space-y-1">
                <p className="text-sm text-[#48484a] mb-0">{localize(lang, 'Computer and Information Science', '计算机与信息科学')}</p>
                <p className="text-xs text-[#8e8e93] mb-0">GPA: {undergraduate.gpa} &bull; {localize(lang, 'Graduated 2024', '2024 年毕业')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSummary;
