'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ChevronRight, BookOpen, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { educationData } from '../../../data';
import { useLanguage, localize } from '../../../i18n/LanguageContext';

const EducationSummary = () => {
  const [graduate, undergraduate] = educationData;
  const { t, lang } = useLanguage();

  const eduCards = [
    { edu: graduate, color: 'text-[#007aff]', location: 'Providence, RI' },
    { edu: undergraduate, color: 'text-purple-600', location: 'Newark, Delaware' },
  ];

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
              <h2 className="text-[1.625rem] md:text-[2.625rem] font-bold text-[#1c1c1e] tracking-tight">
                {t('home.education.title')}
              </h2>
            </div>
            <Link href="/education" className="hidden md:flex items-center gap-1 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
              {t('home.education.viewAll')} <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eduCards.map(({ edu, color, location }, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                className="liquid-glass-card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  {edu.status && (
                    <span className={`text-[10px] font-mono uppercase tracking-wider liquid-glass-pill px-2 py-0.5 ${color}`}>
                      {localize(lang, edu.status, edu.status_zh)}
                    </span>
                  )}
                  <span className="text-xs text-[#8e8e93] font-mono">{edu.period}</span>
                </div>

                <h3 className="text-[1.625rem] font-semibold text-[#1c1c1e] mb-3">
                  {localize(lang, edu.institution, edu.institution_zh)}
                </h3>

                <div className="space-y-2">
                  {[
                    ...(edu.degreeType ? [{ label: t('edu.label.degree'), value: localize(lang, edu.degreeType, edu.degreeType_zh), icon: GraduationCap }] : []),
                    ...(edu.major ? [{ label: t('edu.label.major'), value: localize(lang, edu.major, edu.major_zh), icon: BookOpen }] : []),
                    { label: t('edu.label.gpa'), value: edu.gpa || '', icon: Star },
                    { label: t('edu.label.focus'), value: localize(lang, edu.focus, edu.focus_zh), icon: BookOpen },
                    { label: t('edu.label.location'), value: location, icon: MapPin },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center py-0.5">
                      <item.icon size={13} className="text-[#007aff] flex-shrink-0 w-4" />
                      <span className="text-xs text-[#636366] w-16 flex-shrink-0 ml-2">{item.label}</span>
                      <span className="text-sm text-[#1c1c1e] font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSummary;
