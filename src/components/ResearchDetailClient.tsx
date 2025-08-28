'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileImage } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ResearchDetailType } from '../data/research-details';

interface ResearchDetailClientProps {
  detail: ResearchDetailType;
}

export default function ResearchDetailClient({ detail }: ResearchDetailClientProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              className="mb-8"
            >
              <Link 
                href="/research"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium group"
              >
                <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Research
              </Link>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight leading-tight mb-6"
            >
              {detail.title}
            </motion.h1>

            {/* Advisor */}
            {detail.advisor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                className="mb-8"
              >
                <span className="text-sm font-medium text-gray-500 tracking-widest uppercase bg-gray-50 px-4 py-2 rounded-full">
                  {detail.advisor}
                </span>
              </motion.div>
            )}

            <div className="w-16 h-0.5 bg-gray-300 rounded-full mb-12"></div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Poster Image */}
            {detail.poster && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="mb-16"
              >
                <div className="bg-gray-50 rounded-3xl p-8">
                  <div className="flex items-center mb-6">
                    <FileImage size={20} className="text-gray-600 mr-3" />
                    <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Research Poster</h2>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={detail.poster}
                      alt={`${detail.title} poster`}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Abstract Sections */}
            <div className="space-y-12">
              {detail.abstract.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.5 + (index * 0.1), 
                    duration: 0.6, 
                    ease: "easeOut" 
                  }}
                  className="bg-gray-50 rounded-3xl p-8"
                >
                  {section.subtitle && (
                    <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-6">
                      {section.subtitle}
                    </h2>
                  )}
                  <div className="space-y-4">
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p 
                        key={pIndex}
                        className="text-gray-700 leading-relaxed text-sm md:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Back to Top */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6, ease: "easeOut" }}
              className="text-center mt-16"
            >
              <Link 
                href="/research"
                className="inline-flex items-center px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-2xl transition-all duration-300 font-medium"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to All Research
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
