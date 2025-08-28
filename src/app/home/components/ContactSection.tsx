'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin } from 'lucide-react';
import { personalInfo } from '../../../data';

const ContactSection = () => {
  const contactLinks = [
    {
      name: 'Email',
      value: personalInfo.email,
      href: `mailto:${personalInfo.email}`,
      icon: Mail,
    },
    {
      name: 'LinkedIn',
      value: 'Connect on LinkedIn',
      href: personalInfo.linkedin,
      icon: Linkedin,
    },
    {
      name: 'GitHub',
      value: 'View on GitHub',
      href: personalInfo.github,
      icon: Github,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-4">
              Let&apos;s Connect
            </h2>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.4 + (index * 0.1), 
                  duration: 0.6, 
                  ease: "easeOut" 
                }}
                className="text-center group"
              >
                <motion.a
                  href={link.href}
                  target={link.name !== 'Email' ? "_blank" : undefined}
                  rel={link.name !== 'Email' ? "noopener noreferrer" : undefined}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="block p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 ease-out"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors duration-300">
                    <link.icon size={24} className="text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 tracking-tight">
                    {link.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {link.value}
                  </p>
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
