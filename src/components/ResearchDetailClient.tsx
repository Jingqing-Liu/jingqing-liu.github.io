'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FlaskConical, User, FileImage } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ResearchDetailType } from '../data/research-details';
import { useLanguage, localize, localizeArray } from '../i18n/LanguageContext';

interface ResearchDetailClientProps {
  detail: ResearchDetailType;
}

export default function ResearchDetailClient({ detail }: ResearchDetailClientProps) {
  const { t, lang } = useLanguage();
  return (
    <div className="min-h-screen relative" style={{ background: '#f2f2f7' }}>
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #c7b8ea 0%, transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-6 md:px-8 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors"
            >
              <ArrowLeft size={16} />
              {t('research.back')}
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#007aff] liquid-glass-pill px-2 py-0.5">
                <FlaskConical size={10} />
                {t('research.title')}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight leading-tight mb-4">
              {localize(lang, detail.title, detail.title_zh)}
            </h1>
            {detail.advisor && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#8e8e93]" />
                <span className="text-sm text-[#636366]">{localize(lang, detail.advisor, detail.advisor_zh)}</span>
              </div>
            )}
          </motion.div>

          {/* Poster */}
          {detail.poster && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileImage size={14} className="text-[#007aff]" />
                <h2 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase">{t('research.poster')}</h2>
              </div>
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src={detail.poster}
                  alt={`${detail.title} poster`}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Abstract Sections */}
          <div className="space-y-8">
            {detail.abstract.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.6 }}
              >
                {section.subtitle && (
                  <h2 className="text-sm font-semibold text-[#1c1c1e] tracking-tight mb-2">
                    {localize(lang, section.subtitle, section.subtitle_zh)}
                  </h2>
                )}
                <div className="space-y-3">
                  {localizeArray(lang, section.paragraphs, section.paragraphs_zh).map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-sm text-[#48484a] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-[#007aff]/20 mx-auto my-12" />

          {/* Back to bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors"
            >
              <ArrowLeft size={14} />
              {t('research.backAll')}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
