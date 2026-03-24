'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Terminal, Network, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { personalInfo } from '../../../data';
import { useLanguage } from '../../../i18n/LanguageContext';

const TerminalSnippet = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 1.0 }}
    className="liquid-glass-card overflow-hidden"
  >
    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-black/5">
      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-2 text-[0.625rem] text-[#8e8e93] font-mono">~/security-research</span>
    </div>
    <div className="p-4 font-mono text-[0.625rem] leading-relaxed space-y-1">
      <div><span className="text-[#007aff]">$</span> <span className="text-[#48484a]">nmap -sV --script vuln target.local</span></div>
      <div className="text-[#8e8e93]">Starting vulnerability scan...</div>
      <div className="text-[#8e8e93]">Discovered 3 open ports on distributed nodes</div>
      <div><span className="text-[#007aff]">$</span> <span className="text-[#48484a]">python3 exploit_poc.py --protocol merkle</span></div>
      <div className="text-emerald-600">✓ Protocol analysis complete — report generated</div>
      <div><span className="text-[#007aff]">$</span> <span className="text-[#48484a] inline-flex items-center">_<span className="w-1.5 h-3.5 bg-[#007aff] ml-0.5 animate-pulse inline-block" /></span></div>
    </div>
  </motion.div>
);

const HeroSection = () => {
  const { t } = useLanguage();

  const highlights = [
    { icon: Shield, label: t('hero.highlight.security'), desc: t('hero.highlight.security.desc') },
    { icon: Terminal, label: t('hero.highlight.systems'), desc: t('hero.highlight.systems.desc') },
    { icon: Network, label: t('hero.highlight.blockchain'), desc: t('hero.highlight.blockchain.desc') },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Top tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#48484a] liquid-glass-pill">
              <span className="w-1.5 h-1.5 bg-[#007aff] rounded-full animate-pulse" />
              {t('hero.tag')}
            </span>
          </motion.div>

          {/* Name — H1: 6rem */}
          <div className="mb-10">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-[4.25rem] md:text-[6.875rem] font-bold text-[#1c1c1e] tracking-tighter leading-[0.85] mb-2"
            >
              {personalInfo.name.split(' ')[0]}
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="text-[4.25rem] md:text-[6.875rem] font-bold text-[#1c1c1e] tracking-tighter leading-[0.85]"
            >
              {personalInfo.name.split(' ')[1]}
            </motion.h1>
          </div>

          {/* Two-column: tagline + terminal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            {/* Left: tagline + CTA */}
            <div>
              {/* Tagline — Body: 0.875rem */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-8"
              >
                <p className="text-base text-[#636366] font-light leading-relaxed">
                  {t('hero.tagline')}
                </p>
                <div className="mt-4 flex items-center gap-3 text-sm text-[#aeaeb2]">
                  <span className="font-mono">{t('hero.subtitle')}</span>
                  <span className="w-1 h-1 bg-[#aeaeb2] rounded-full" />
                  <span className="font-mono">{personalInfo.address.institution}</span>
                </div>
              </motion.div>

              {/* Proof line */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.85 }}
                className="mb-8 text-sm text-[#8e8e93]"
              >
                <span className="font-mono text-[#aeaeb2]">{t('hero.proof.label')}</span>{' '}
                <span className="text-[#48484a]">{t('hero.proof.items')}</span>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="flex items-center gap-4"
              >
                <Link
                  href="/research"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-base font-medium text-[#007aff] liquid-glass-pill hover:text-[#0056b3] transition-colors no-underline"
                  style={{ borderRadius: '99em' }}
                >
                  {t('hero.cta.research')}
                  <ArrowRight size={14} />
                </Link>
{/* Resume button hidden until PDF is ready
                <Link
                  href="/resume.pdf"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-base font-medium text-[#636366] liquid-glass-pill hover:text-[#007aff] transition-colors no-underline"
                  style={{ borderRadius: '99em' }}
                >
                  {t('hero.cta.resume')}
                </Link>
*/}
              </motion.div>
            </div>

            {/* Right: Terminal visual anchor */}
            <TerminalSnippet />
          </div>

          {/* Direction tags — lightweight pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-wrap gap-3"
          >
            {highlights.map((item, index) => (
              <motion.span
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#636366] liquid-glass-pill cursor-default"
              >
                <item.icon size={12} className="text-[#007aff]" />
                {item.label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
