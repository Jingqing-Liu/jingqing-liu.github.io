'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Quote } from 'lucide-react';
import { useLanguage, localize, localizeArray } from '../../i18n/LanguageContext';
import { books, type ContentBlock } from '../../data/reading';

function BlockRenderer({ block, lang }: { block: ContentBlock; lang: 'en' | 'zh' }) {
  switch (block.type) {
    case 'heading':
      return (
        <h4 className="text-xs font-semibold text-[#3a3a3c] uppercase tracking-wide mt-5 mb-2">
          {localize(lang, block.text, block.text_zh)}
        </h4>
      );
    case 'paragraph':
      return (
        <p className="text-sm text-[#48484a] leading-loose max-w-3xl">
          {localize(lang, block.text, block.text_zh)}
        </p>
      );
    case 'quote':
      return (
        <blockquote className="relative pl-5 py-3 my-4 border-l-2 border-[#007aff]/40 bg-[#007aff]/[0.03] rounded-r-lg">
          <Quote size={14} className="absolute top-3 left-1.5 text-[#007aff]/30" />
          <p className="text-sm text-[#48484a] italic leading-relaxed pl-4">
            &ldquo;{localize(lang, block.text, block.text_zh)}&rdquo;
          </p>
          {block.source && (
            <p className="text-xs text-[#8e8e93] mt-2 pl-4">
              — {localize(lang, block.source, block.source_zh)}
            </p>
          )}
        </blockquote>
      );
    case 'list':
      return (
        <ul className="space-y-2 my-3 max-w-3xl">
          {localizeArray(lang, block.items, block.items_zh).map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#48484a] leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#007aff]/50 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default function ReadingPage() {
  const { lang, t } = useLanguage();
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [bookMenuOpen, setBookMenuOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>('');
  const isClickScrolling = useRef(false);

  const selectedBook = books.find((b) => b.id === selectedBookId);

  // Track active section on scroll (disabled during click-driven scrolling)
  useEffect(() => {
    if (!selectedBook) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    for (const section of selectedBook.sections) {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
      for (const sub of section.subsections || []) {
        const subEl = sectionRefs.current[sub.id];
        if (subEl) observer.observe(subEl);
      }
    }

    return () => observer.disconnect();
  }, [selectedBook]);

  // Reset active section when book changes
  useEffect(() => {
    if (selectedBook?.sections[0]) {
      setActiveSection(selectedBook.sections[0].id);
    }
  }, [selectedBook]);

  const scrollToSection = (sectionId: string) => {
    isClickScrolling.current = true;
    setActiveSection(sectionId);
    const el = sectionRefs.current[sectionId] || document.getElementById(sectionId);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    // Re-enable observer after scroll animation finishes
    setTimeout(() => { isClickScrolling.current = false; }, 800);
  };

  const selectBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setBookMenuOpen(false);
    // Scroll to top of content
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#f2f2f7' }}>
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #c7b8ea 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffd6a5 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#48484a] liquid-glass-pill">
                <BookOpen size={14} className="text-[#007aff]" />
                {t('reading.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[2.625rem] md:text-[4.25rem] font-bold text-[#1c1c1e] tracking-tight leading-tight mb-6"
            >
              {t('reading.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base text-[#48484a] leading-relaxed text-center"
            >
              {t('reading.subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="md:w-56 flex-shrink-0 md:sticky md:top-24 md:self-start"
            >
              {/* Book selector */}
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93] mb-3 px-2">
                {t('reading.bookList')}
              </h3>

              {/* Dropdown on mobile, list on desktop */}
              <div className="relative mb-6">
                {/* Mobile dropdown trigger */}
                <button
                  onClick={() => setBookMenuOpen(!bookMenuOpen)}
                  className="md:hidden w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#1c1c1e] bg-white/60 backdrop-blur-sm rounded-lg border border-[#c6c6c8]/30 cursor-pointer"
                >
                  <span className="truncate">
                    {selectedBook ? localize(lang, selectedBook.title, selectedBook.title_zh) : ''}
                  </span>
                  <ChevronDown size={16} className={`text-[#8e8e93] transition-transform ${bookMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile dropdown menu */}
                <AnimatePresence>
                  {bookMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="md:hidden absolute z-20 top-full mt-1 w-full bg-white/90 backdrop-blur-xl rounded-lg border border-[#c6c6c8]/30 shadow-lg overflow-hidden"
                    >
                      {books.map((book) => (
                        <button
                          key={book.id}
                          onClick={() => selectBook(book.id)}
                          className={`w-full text-left px-3 py-2.5 text-sm border-0 cursor-pointer transition-colors ${
                            selectedBookId === book.id
                              ? 'bg-[#007aff]/10 text-[#007aff]'
                              : 'text-[#1c1c1e] hover:bg-[#f2f2f7]'
                          }`}
                        >
                          <p className="font-medium truncate">{localize(lang, book.title, book.title_zh)}</p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop book list */}
                <div className="hidden md:block space-y-1">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => selectBook(book.id)}
                      className={`w-full text-left px-3 h-10 border-0 cursor-pointer transition-all duration-200 rounded-lg flex items-center ${
                        selectedBookId === book.id
                          ? 'bg-[#007aff]/[0.08]'
                          : 'bg-transparent hover:bg-[#1c1c1e]/[0.05]'
                      }`}
                    >
                      <span className={`text-sm font-medium truncate transition-colors ${
                        selectedBookId === book.id ? 'text-[#007aff]' : 'text-[#1c1c1e]'
                      }`}>
                        {localize(lang, book.title, book.title_zh)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section navigation */}
              {selectedBook && selectedBook.sections.length > 1 && (
                <div>
                  <h3 className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93] mb-3 px-2">
                    {t('reading.sections')}
                  </h3>
                  <nav className="space-y-0.5">
                    {selectedBook.sections.map((section) => (
                      <React.Fragment key={section.id}>
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left px-2 py-1.5 text-xs rounded-md border-0 cursor-pointer transition-all duration-200 ${
                            activeSection === section.id
                              ? 'text-[#007aff] bg-[#007aff]/[0.06] font-medium'
                              : 'text-[#8e8e93] hover:text-[#48484a] bg-transparent'
                          }`}
                        >
                          {localize(lang, section.title, section.title_zh)}
                        </button>
                        {section.subsections?.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => scrollToSection(sub.id)}
                            className={`w-full text-left pl-5 pr-2 py-1 text-[11px] rounded-md border-0 cursor-pointer transition-all duration-200 ${
                              activeSection === sub.id
                                ? 'text-[#007aff] bg-[#007aff]/[0.06] font-medium'
                                : 'text-[#8e8e93] hover:text-[#48484a] bg-transparent'
                            }`}
                          >
                            {localize(lang, sub.title, sub.title_zh)}
                          </button>
                        ))}
                      </React.Fragment>
                    ))}
                  </nav>
                </div>
              )}
            </motion.div>

            {/* Vertical divider */}
            <div className="hidden md:block w-px flex-shrink-0" style={{ background: 'linear-gradient(to bottom, transparent, #c6c6c8, transparent)' }} />

            {/* Notes Area */}
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex-1 min-w-0"
            >
              <AnimatePresence mode="wait">
                {selectedBook ? (
                  <motion.div
                    key={selectedBook.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-[1.625rem] md:text-[2.625rem] font-bold text-[#1c1c1e] tracking-tight mb-1">
                      {localize(lang, selectedBook.title, selectedBook.title_zh)}
                    </h2>
                    <p className="text-sm text-[#8e8e93] mb-8">
                      {localize(lang, selectedBook.author, selectedBook.author_zh)}
                    </p>

                    <div className="h-px mb-8" style={{ background: 'linear-gradient(to right, #c6c6c8, transparent)' }} />

                    {/* Sections */}
                    <div className="space-y-10">
                      {selectedBook.sections.map((section) => (
                        <div
                          key={section.id}
                          id={section.id}
                          ref={(el) => { sectionRefs.current[section.id] = el; }}
                          className="scroll-mt-24"
                        >
                          <h3 className="text-base font-semibold text-[#1c1c1e] mb-4 pb-2 border-b border-[#c6c6c8]/30">
                            {localize(lang, section.title, section.title_zh)}
                          </h3>
                          <div className="space-y-4">
                            {section.content.map((block, i) => (
                              <BlockRenderer key={i} block={block} lang={lang} />
                            ))}
                          </div>
                          {section.subsections?.map((sub) => (
                            <div
                              key={sub.id}
                              id={sub.id}
                              ref={(el) => { sectionRefs.current[sub.id] = el; }}
                              className="scroll-mt-24 mt-6"
                            >
                              <h4 className="text-sm font-semibold text-[#3a3a3c] mb-3">
                                {localize(lang, sub.title, sub.title_zh)}
                              </h4>
                              <div className="space-y-4">
                                {sub.content.map((block, i) => (
                                  <BlockRenderer key={i} block={block} lang={lang} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-sm text-[#8e8e93] pt-4">{t('reading.selectBook')}</p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
