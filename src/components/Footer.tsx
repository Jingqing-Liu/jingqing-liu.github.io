'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Heart } from 'lucide-react';
import { navItems, personalInfo } from '../data';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Email',
      href: `mailto:${personalInfo.email}`,
      icon: Mail,
    },
    {
      name: 'GitHub',
      href: personalInfo.github,
      icon: Github,
    },
    {
      name: 'LinkedIn',
      href: personalInfo.linkedin,
      icon: Linkedin,
    },
  ];

  return (
    <footer className="bg-gray-50/50 border-t border-gray-200/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-gray-900">{personalInfo.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              {personalInfo.title}, {personalInfo.description.toLowerCase()}.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900">Navigation</h4>
            <ul className="space-y-2">
              {navItems.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900">Connect</h4>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <link.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500"
        >
          <div className="flex items-center space-x-1 mb-4 md:mb-0">
            <span>© {currentYear} {personalInfo.name}. Made with</span>
            <Heart size={14} className="text-red-500" fill="currentColor" />
            <span>using Next.js</span>
          </div>
          <div className="text-center md:text-right">
            <p>{personalInfo.office}</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
