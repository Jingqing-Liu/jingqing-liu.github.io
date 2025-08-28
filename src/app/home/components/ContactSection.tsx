'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Github, Linkedin } from 'lucide-react';
import { personalInfo } from '../../../data';
import Card from '../../../components/Card';

const ContactSection = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <Card delay={0.6}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">Contact Information</h2>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center text-gray-600"
                >
                  <Mail className="w-5 h-5 mr-3 text-blue-500" />
                  <a 
                    href={`mailto:${personalInfo.email}`} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    {personalInfo.email}
                  </a>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center text-gray-600"
                >
                  <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                  <span>{personalInfo.office}</span>
                </motion.div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-900">Connect With Me</h3>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex items-center text-gray-600"
                >
                  <Linkedin className="w-5 h-5 mr-3 text-blue-500" />
                  <a 
                    href={personalInfo.linkedin}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    LinkedIn Profile
                  </a>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center text-gray-600"
                >
                  <Github className="w-5 h-5 mr-3 text-blue-500" />
                  <a 
                    href={personalInfo.github}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    GitHub Profile
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ContactSection;
