'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Briefcase, GraduationCap, Building, Clock, Wrench } from 'lucide-react';
import type { Experience } from '../../../data/experience';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Research': return GraduationCap;
    case 'Academic': return GraduationCap;
    case 'Industry': return Briefcase;
    case 'Finance': return Building;
    default: return Briefcase;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Research': return 'text-purple-600';
    case 'Academic': return 'text-[#007aff]';
    case 'Industry': return 'text-emerald-600';
    case 'Finance': return 'text-amber-600';
    default: return 'text-[#007aff]';
  }
};

const BulletList = ({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: string[] }) => (
  <div className="space-y-2">
    <h4 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase flex items-center gap-1.5">
      <Icon size={12} className="text-[#007aff]" />
      {title}
    </h4>
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-2">
        <div className="w-1.5 h-1.5 bg-[#007aff] rounded-full flex-shrink-0 mt-1.5" />
        <p className="text-sm text-[#48484a] leading-snug">{item}</p>
      </div>
    ))}
  </div>
);

export default function ExperienceDetailClient({ exp }: { exp: Experience }) {
  const IconComponent = getTypeIcon(exp.type);
  const typeColor = getTypeColor(exp.type);

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
              href="/experience"
              className="inline-flex items-center gap-2 text-sm text-[#8e8e93] hover:text-[#007aff] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Experience
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${typeColor} liquid-glass-pill px-2 py-0.5`}>
                <IconComponent size={10} />
                {exp.type}
              </span>
              <span className="text-xs text-[#8e8e93] font-mono">{exp.period}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-2">{exp.title}</h1>
            <p className="text-lg text-[#007aff] font-medium">{exp.company}</p>
            {exp.supervisor && (
              <p className="text-sm text-[#636366] mt-2">Supervisor: {exp.supervisor}</p>
            )}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Description */}
            <p className="text-sm text-[#48484a] leading-relaxed">{exp.description}</p>

            {/* Projects */}
            {exp.projects && exp.projects.length > 0 && (
              <BulletList title="Projects" icon={Clock} items={exp.projects} />
            )}

            {/* Achievements */}
            {exp.achievements && exp.achievements.length > 0 && (
              <BulletList title="Key Achievements" icon={GraduationCap} items={exp.achievements} />
            )}

            {/* Responsibilities */}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <BulletList title="Responsibilities" icon={Briefcase} items={exp.responsibilities} />
            )}

            {/* Technologies */}
            {exp.technologies && exp.technologies.length > 0 && (
              <div>
                <h4 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase flex items-center gap-1.5 mb-3">
                  <Wrench size={12} className="text-[#007aff]" />
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech, i) => (
                    <span key={i} className="text-xs font-mono text-[#636366] liquid-glass-pill px-3 py-1">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
