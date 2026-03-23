'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { personalInfo } from '../data';
import { useLanguage } from '../i18n/LanguageContext';

const navKeys = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.education', href: '/education' },
  { key: 'nav.research', href: '/research' },
  { key: 'nav.experience', href: '/experience' },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'liquid-glass-nav' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-semibold text-lg no-underline">
              <motion.span whileHover={{ scale: 1.05 }} className="text-[#1c1c1e]">
                {personalInfo.name}
              </motion.span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navKeys.map((item) => (
                <Link key={item.key} href={item.href} className="relative group no-underline">
                  <motion.span
                    whileHover={{ y: -2 }}
                    className="text-[#48484a] hover:text-[#007aff] transition-colors duration-200 font-medium text-sm"
                  >
                    {t(item.key)}
                  </motion.span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#007aff] rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              ))}

              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                className="text-xs font-mono text-[#8e8e93] hover:text-[#007aff] transition-colors border-0 bg-transparent cursor-pointer px-2 py-1 liquid-glass-pill"
              >
                {lang === 'en' ? '中文' : 'EN'}
              </button>
            </div>

            <div className="md:hidden flex items-center gap-3">
              {/* Mobile Language Toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                className="text-xs font-mono text-[#8e8e93] hover:text-[#007aff] transition-colors border-0 bg-transparent cursor-pointer px-2 py-1 liquid-glass-pill"
              >
                {lang === 'en' ? '中文' : 'EN'}
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl hover:bg-black/5 transition-colors text-[#1c1c1e] border-0 bg-transparent cursor-pointer"
              >
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 z-50 md:hidden liquid-glass-nav"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px) saturate(200%)' }}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-black/5">
                  <span className="font-semibold text-xl text-[#1c1c1e]">{t('nav.menu')}</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-black/5 transition-colors text-[#1c1c1e] border-0 bg-transparent cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 p-6">
                  <div className="space-y-6">
                    {navKeys.map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block text-xl font-medium text-[#48484a] hover:text-[#007aff] transition-colors no-underline"
                        >
                          {t(item.key)}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
};

export default Navigation;
