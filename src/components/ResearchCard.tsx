'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileImage } from 'lucide-react';

interface ResearchCardProps {
  id: string;
  title: string;
  advisor: string;
  keyPoints: string[];
  poster?: string;
  delay?: number;
  showDetails?: boolean;
}

const ResearchCard: React.FC<ResearchCardProps> = ({
  id,
  title,
  advisor,
  keyPoints,
  poster,
  delay = 0,
  showDetails = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group h-full"
    >
      <div className="bg-white rounded-3xl p-8 h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 ease-out">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight tracking-tight">
            {title}
          </h3>
          <div className="inline-block">
            <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-gray-50 px-3 py-1 rounded-full">
              {advisor}
            </span>
          </div>
        </div>

        {/* Poster Image */}
        {poster && (
          <div className="mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative rounded-2xl overflow-hidden"
            >
              <Image
                src={poster}
                alt={`${title} poster`}
                width={400}
                height={240}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </motion.div>
          </div>
        )}

        {/* Key Points */}
        {showDetails && (
          <div className="flex-1 space-y-6">
            <h4 className="text-sm font-semibold text-gray-900 tracking-tight">
              Key Findings
            </h4>
            <div className="space-y-4">
              {keyPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: delay + 0.2 + (index * 0.1), 
                    duration: 0.4, 
                    ease: "easeOut" 
                  }}
                  className="flex items-start"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Area */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.4, ease: "easeOut" }}
            className="mt-8 pt-6"
          >
            <Link 
              href={`/research/${id}`}
              className="inline-flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 hover:text-blue-600"
            >
              {poster && (
                <FileImage size={16} className="mr-2" />
              )}
              <span>{poster ? 'View Details & Poster' : 'Learn More'}</span>
              <motion.svg 
                className="w-4 h-4 ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ResearchCard;
