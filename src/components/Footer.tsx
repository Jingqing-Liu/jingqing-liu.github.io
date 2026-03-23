'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Github, Linkedin } from 'lucide-react';
import { personalInfo } from '../data';
import { useLanguage } from '../i18n/LanguageContext';

const navKeys = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.education', href: '/education' },
  { key: 'nav.research', href: '/research' },
  { key: 'nav.experience', href: '/experience' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const socialLinks = [
    { name: 'Email', href: `mailto:${personalInfo.email}`, icon: Mail },
    { name: 'GitHub', href: personalInfo.github, icon: Github },
    { name: 'LinkedIn', href: personalInfo.linkedin, icon: Linkedin },
  ];

  return (
    <footer className="border-t border-black/5" style={{ background: '#f2f2f7' }}>
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-8">
          {/* Personal info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#1c1c1e]">{personalInfo.name}</h3>
            <p className="text-xs text-[#8e8e93]">{personalInfo.title}</p>
            <p className="text-xs text-[#8e8e93]">{personalInfo.address.institution}</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase mb-3">{t('footer.navigation')}</h4>
            <nav className="flex flex-col gap-2">
              {navKeys.map((item) => (
                <Link key={item.key} href={item.href} className="text-xs text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#636366] tracking-wider uppercase mb-3">{t('footer.connect')}</h4>
            <div className="flex flex-col gap-2">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.href} target={link.name !== 'Email' ? '_blank' : undefined} rel={link.name !== 'Email' ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 text-xs text-[#8e8e93] hover:text-[#007aff] transition-colors no-underline">
                  <link.icon size={13} />
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-black/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-[11px] text-[#aeaeb2]">&copy; {currentYear} {personalInfo.name}. {t('footer.rights')}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[11px] text-[#aeaeb2]">{t('footer.available')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
