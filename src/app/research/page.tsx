'use client';

import React, { useRef, useState, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { FlaskConical, User, FileImage, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { researchProjects } from '../../data';

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

export default function Research() {
  const [query, setQuery] = useState('');

  const filteredProjects = useMemo(() => {
    if (!query.trim()) return researchProjects;
    const q = query.toLowerCase();
    return researchProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.advisor.toLowerCase().includes(q) ||
        p.keyPoints.some((k) => k.toLowerCase().includes(q))
    );
  }, [query]);

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
                <FlaskConical size={14} className="text-[#007aff]" />
                Research Portfolio
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-[#1c1c1e] tracking-tight leading-tight mb-6"
            >
              Research
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-[#48484a] leading-relaxed mx-auto text-center"
            >
              Exploring cybersecurity, network security, and distributed systems
              — from platform vulnerabilities to blockchain protocol design.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
            <input
              type="text"
              placeholder="Search projects, advisors, keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm text-[#1c1c1e] placeholder-[#8e8e93] liquid-glass-card border-none outline-none focus:ring-2 focus:ring-[#007aff]/30 rounded-2xl transition-all"
            />
          </div>
        </div>
      </div>

      {/* Research Posts List */}
      <AnimatedSection>
        <section className="py-8 pb-16">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="liquid-glass-card p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        {/* Advisor Tag */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#007aff] liquid-glass-pill px-2 py-0.5">
                            <User size={10} />
                            Advisor
                          </span>
                          <span className="text-xs text-[#8e8e93] font-mono truncate">{project.advisor}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-[#1c1c1e] mb-3 leading-snug">
                          {project.title}
                        </h3>

                        {/* Key Points */}
                        <div className="space-y-1 mb-4">
                          {project.keyPoints.map((point, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-[#007aff] rounded-full flex-shrink-0 mt-1.5" />
                              <p className="text-xs text-[#48484a] leading-snug">{point}</p>
                            </div>
                          ))}
                        </div>

                        {/* Action Link */}
                        {project.showDetails && (
                          <Link
                            href={`/research/${project.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#007aff] hover:text-[#0056b3] transition-colors"
                          >
                            {project.poster && <FileImage size={12} />}
                            <span>{project.poster ? 'View Details & Poster' : 'Learn More'}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                      </div>

                      {/* Poster Thumbnail */}
                      {project.poster && (
                        <div className="md:w-48 flex-shrink-0">
                          <div className="rounded-xl overflow-hidden">
                            <Image
                              src={project.poster}
                              alt={`${project.title} poster`}
                              width={192}
                              height={128}
                              className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
