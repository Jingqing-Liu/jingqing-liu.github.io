'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin } from 'lucide-react';
import { personalInfo } from '../../../data';

const ContactSection = () => {
  const contactLinks = [
    { name: 'Email', value: personalInfo.email, href: `mailto:${personalInfo.email}`, icon: Mail },
    { name: 'LinkedIn', value: 'Connect on LinkedIn', href: personalInfo.linkedin, icon: Linkedin },
    { name: 'GitHub', value: 'View on GitHub', href: personalInfo.github, icon: Github },
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[5%] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffd6a5 0%, transparent 70%)' }} />
      </div>
      <div className="container mx-auto px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-xs font-mono tracking-wider uppercase text-[#8e8e93] mb-3 block">Contact</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1e] tracking-tight mb-0">
              Let&apos;s Connect
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <motion.a
                  href={link.href}
                  target={link.name !== 'Email' ? "_blank" : undefined}
                  rel={link.name !== 'Email' ? "noopener noreferrer" : undefined}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="block liquid-glass-card p-8 text-center group no-underline"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 liquid-glass-pill group-hover:scale-105 transition-transform"
                    style={{ borderRadius: '16px' }}
                  >
                    <link.icon size={22} className="text-[#007aff]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#1c1c1e] mb-2">{link.name}</h3>
                  <p className="text-sm text-[#8e8e93] mb-0">{link.value}</p>
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
