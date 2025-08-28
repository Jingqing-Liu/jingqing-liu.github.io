'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building } from 'lucide-react';
import { educationData } from '../../../data';
import Card from '../../../components/Card';

const EducationSummary = () => {
  const [graduate, undergraduate] = educationData;

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-3xl font-bold text-center mb-12 text-gray-900"
        >
          Education
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card delay={1.3}>
            <div className="flex items-start">
              <GraduationCap className="w-8 h-8 text-blue-500 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{graduate.degree}</h3>
                <p className="text-blue-600 font-medium mb-2">{graduate.institution}</p>
                <p className="text-gray-600 mb-1">Computer Science</p>
                <p className="text-sm text-gray-500">{graduate.status} • {graduate.focus}</p>
              </div>
            </div>
          </Card>
          
          <Card delay={1.4}>
            <div className="flex items-start">
              <Building className="w-8 h-8 text-blue-500 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{undergraduate.degree}</h3>
                <p className="text-blue-600 font-medium mb-2">{undergraduate.institution}</p>
                <p className="text-gray-600 mb-1">Computer and Information Science</p>
                <p className="text-sm text-gray-500">GPA: {undergraduate.gpa}</p>
                <p className="text-sm text-gray-500">Graduated 2024 • {undergraduate.status}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EducationSummary;
