'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, User } from 'lucide-react';
import Card from './Card';

interface ResearchCardProps {
  title: string;
  advisor: string;
  keyPoints: string[];
  poster?: string;
  delay?: number;
  showDetails?: boolean;
}

const ResearchCard: React.FC<ResearchCardProps> = ({
  title,
  advisor,
  keyPoints,
  poster,
  delay = 0,
  showDetails = true
}) => {
  return (
    <Card delay={delay} className="h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
            {title}
          </h3>
          <div className="flex items-center text-gray-600 mb-4">
            <User size={16} className="mr-2" />
            <span className="text-sm">{advisor}</span>
          </div>
        </div>

        {/* Poster Image */}
        {poster && (
          <div className="mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative rounded-xl overflow-hidden shadow-md"
            >
              <Image
                src={poster}
                alt={`${title} poster`}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
            </motion.div>
          </div>
        )}

        {/* Key Points */}
        {showDetails && (
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
              Key Findings
            </h4>
            <ul className="space-y-3">
              {keyPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + (index * 0.1) }}
                  className="flex items-start text-sm text-gray-600 leading-relaxed"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0" />
                  {point}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <button className="group flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium">
              <span>Learn More</span>
              <ExternalLink 
                size={14} 
                className="ml-2 group-hover:translate-x-1 transition-transform" 
              />
            </button>
          </motion.div>
        )}
      </div>
    </Card>
  );
};

export default ResearchCard;
