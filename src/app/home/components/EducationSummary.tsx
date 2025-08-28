'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { educationData } from '../../../data';

const EducationSummary = () => {
  const [graduate, undergraduate] = educationData;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-4">
              Education
            </h2>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
          </motion.div>

          <div className="space-y-12">
            {/* Graduate Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <div className="bg-gray-50 rounded-3xl p-12 max-w-3xl mx-auto">
                <div className="space-y-4">
                  <div className="inline-block">
                    <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-white px-4 py-2 rounded-full">
                      {graduate.status}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">
                    {graduate.degree}
                  </h3>
                  <p className="text-lg text-gray-700 font-medium">
                    {graduate.institution}
                  </p>
                  <div className="space-y-1 pt-2">
                    <p className="text-sm text-gray-600">Computer Science</p>
                    <p className="text-sm text-gray-500">{graduate.focus}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Undergraduate Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <div className="bg-gray-50 rounded-3xl p-12 max-w-3xl mx-auto">
                <div className="space-y-4">
                  <div className="inline-block">
                    <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-white px-4 py-2 rounded-full">
                      {undergraduate.status}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-gray-900 tracking-tight">
                    {undergraduate.degree}
                  </h3>
                  <p className="text-lg text-gray-700 font-medium">
                    {undergraduate.institution}
                  </p>
                  <div className="space-y-1 pt-2">
                    <p className="text-sm text-gray-600">Computer and Information Science</p>
                    <p className="text-sm text-gray-500">GPA: {undergraduate.gpa} • Graduated 2024</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationSummary;
