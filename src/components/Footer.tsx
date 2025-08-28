import React from 'react';
import Link from 'next/link';
import { Mail, Github, Linkedin } from 'lucide-react';
import { navItems, personalInfo } from '../data';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Email',
      href: `mailto:${personalInfo.email}`,
      icon: Mail,
      label: 'Email'
    },
    {
      name: 'GitHub',
      href: personalInfo.github,
      icon: Github,
      label: 'GitHub'
    },
    {
      name: 'LinkedIn',
      href: personalInfo.linkedin,
      icon: Linkedin,
      label: 'LinkedIn'
    },
  ];

  return (
    <footer className="bg-gray-50/30 backdrop-blur-sm border-t border-gray-200/50">
      <div className="max-w-7xl mx-auto px-8 py-20">
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Contact */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-3xl font-light text-gray-900 tracking-tight">
                  {personalInfo.name}
                </h3>
                <p className="text-lg text-gray-600 font-medium">
                  {personalInfo.title}
                </p>
              </div>
              
              <div className="h-px w-16 bg-gray-300"></div>
              
              <div className="space-y-1.5 text-sm leading-relaxed text-gray-600">
                <p className="font-medium text-gray-800">{personalInfo.address.room}</p>
                <p>{personalInfo.address.institution}</p>
                <p>{personalInfo.address.city}, {personalInfo.address.state} {personalInfo.address.zipCode}</p>
                <p className="text-gray-500">{personalInfo.address.country}</p>
              </div>
            </div>
            
            {/* Quick Contact */}
            <div className="space-y-3">
              <a 
                href={`mailto:${personalInfo.email}`}
                className="inline-block text-sm text-gray-900 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {personalInfo.email}
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
              Navigation
            </h4>
            <nav>
              <ul className="space-y-4">
                {navItems.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm leading-relaxed"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Connect */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
              Connect
            </h4>
            
            {/* Social Links */}
            <div className="space-y-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <link.icon size={18} className="group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            
            {/* Copyright */}
            <div className="text-xs text-gray-500 leading-relaxed">
              <p>© {currentYear} {personalInfo.name}</p>
              <p className="mt-1">All rights reserved.</p>
            </div>
            
            {/* Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-gray-600">
                Available for opportunities
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
