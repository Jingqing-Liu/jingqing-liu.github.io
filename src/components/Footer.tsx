import React from 'react';
import Link from 'next/link';
import { Mail, Github, Linkedin } from 'lucide-react';
import { navItems, personalInfo } from '../data';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    { name: 'Email', href: `mailto:${personalInfo.email}`, icon: Mail, label: 'Email' },
    { name: 'GitHub', href: personalInfo.github, icon: Github, label: 'GitHub' },
    { name: 'LinkedIn', href: personalInfo.linkedin, icon: Linkedin, label: 'LinkedIn' },
  ];

  return (
    <footer style={{ background: '#e5e5ea' }} className="border-t border-black/5">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-[#1c1c1e] tracking-tight">{personalInfo.name}</h3>
              <p className="text-base text-[#48484a] font-medium">{personalInfo.title}</p>
            </div>
            <div className="w-12 h-0.5 bg-[#007aff] rounded-full" />
            <div className="space-y-1.5 text-sm text-[#8e8e93]">
              <p className="font-medium text-[#48484a]">{personalInfo.address.room}</p>
              <p>{personalInfo.address.institution}</p>
              <p>{personalInfo.address.city}, {personalInfo.address.state} {personalInfo.address.zipCode}</p>
            </div>
            <a href={`mailto:${personalInfo.email}`} className="inline-block text-sm text-[#007aff] hover:text-[#0051d5] font-medium">
              {personalInfo.email}
            </a>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-xs font-semibold text-[#8e8e93] tracking-wider uppercase">Navigation</h4>
            <nav>
              <ul className="space-y-4" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {navItems.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-[#48484a] hover:text-[#007aff] transition-colors text-sm no-underline">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-semibold text-[#8e8e93] tracking-wider uppercase">Connect</h4>
            <div className="space-y-4">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-[#48484a] hover:text-[#007aff] transition-colors group no-underline">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <link.icon size={18} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-xs text-[#8e8e93]">
              <p>&copy; {currentYear} {personalInfo.name}</p>
              <p className="mt-1">All rights reserved.</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-[#8e8e93]">Available for opportunities</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
