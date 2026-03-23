'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Terminal, Network } from 'lucide-react';
import { personalInfo } from '../../../data';

const highlights = [
  { icon: Shield, label: 'Network Security', desc: 'API & Platform Vulnerability Research' },
  { icon: Terminal, label: 'Systems Architecture', desc: 'Full-Stack & Distributed Systems' },
  { icon: Network, label: 'Blockchain Security', desc: 'Cryptographic Protocol Analysis' },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#f2f2f7' }}>
      {/* Gradient mesh background - gives the glass something to refract */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft color orbs */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[10%] right-[-15%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #c7b8ea 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #ffd6a5 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a5d6ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[50%] left-[40%] w-[350px] h-[350px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffc0cb 0%, transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Top tag - liquid glass pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#48484a] liquid-glass-pill">
              <span className="w-1.5 h-1.5 bg-[#007aff] rounded-full animate-pulse" />
              Cybersecurity Researcher & Engineer
            </span>
          </motion.div>

          {/* Name */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#1c1c1e] tracking-tight leading-[0.9] mb-2"
            >
              {personalInfo.name.split(' ')[0]}
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#1c1c1e] tracking-tight leading-[0.9]"
            >
              {personalInfo.name.split(' ')[1]}
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12 max-w-2xl"
          >
            <p className="text-xl md:text-2xl text-[#48484a] font-light leading-relaxed">
              Securing the digital frontier through
              <span className="text-[#1c1c1e] font-medium"> vulnerability research</span>,
              <span className="text-[#1c1c1e] font-medium"> systems architecture</span>, and
              <span className="text-[#1c1c1e] font-medium"> protocol analysis</span>.
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-[#8e8e93]">
              <span className="font-mono">M.S. Computer Science</span>
              <span className="w-1 h-1 bg-[#8e8e93] rounded-full" />
              <span className="font-mono">{personalInfo.address.institution}</span>
            </div>
          </motion.div>

          {/* Highlight cards - Liquid Glass */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            {highlights.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="liquid-glass-card p-6 group cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 liquid-glass-pill"
                    style={{ borderRadius: '12px' }}
                  >
                    <item.icon size={20} className="text-[#007aff]" />
                  </div>
                  <div>
                    <h3 className="text-[#1c1c1e] font-semibold text-sm mb-1">{item.label}</h3>
                    <p className="text-[#8e8e93] text-xs leading-relaxed mb-0">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Skills - Liquid Glass pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-wrap gap-2"
          >
            {['Network Security', 'Penetration Testing', 'React', 'Node.js', 'Python', 'Distributed Systems', 'Blockchain', 'API Security'].map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.5 + i * 0.06 }}
                className="skill-tag liquid-glass-pill"
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
