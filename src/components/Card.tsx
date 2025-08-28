'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={hover ? { 
        y: -8, 
        transition: { duration: 0.2 } 
      } : {}}
      className={`
        bg-white/80 backdrop-blur-xl
        border border-gray-200/50
        rounded-2xl
        p-8
        shadow-lg shadow-gray-900/5
        hover:shadow-xl hover:shadow-gray-900/10
        transition-all duration-300
        ${className}
      `}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
