'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Users, Calendar } from 'lucide-react';
import { educationData } from '../../data';
import Card from '../../components/Card';

export default function Education() {
  const [graduate, undergraduate] = educationData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
              Education
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            >
              My academic journey spans from undergraduate excellence at the University of Delaware 
              to advanced graduate studies at Brown University, focusing on cutting-edge computer science research.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Graduate Studies */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <Card delay={0.5} className="max-w-4xl mx-auto mb-12">
            <div className="flex items-start mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Graduate Studies</h2>
                <p className="text-xl text-blue-600 font-semibold">{graduate.institution}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Details</h3>
                <ul className="space-y-3">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Degree:</strong> {graduate.degree}</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Period:</strong> {graduate.period}</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Research Focus:</strong> {graduate.focus}</span>
                  </motion.li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Activities</h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-gray-600 leading-relaxed"
                >
                  {graduate.description}
                </motion.p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Undergraduate Degree */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <Card delay={1.1} className="max-w-4xl mx-auto">
            <div className="flex items-start mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Undergraduate Degree</h2>
                <p className="text-xl text-green-600 font-semibold">{undergraduate.institution}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Excellence</h3>
                <ul className="space-y-3">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Degree:</strong> {undergraduate.degree}</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>GPA:</strong> {undergraduate.gpa}</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Graduation:</strong> {undergraduate.period.split(' - ')[1]}, {undergraduate.status}</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Research Area:</strong> {undergraduate.focus}</span>
                  </motion.li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Overview</h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.7 }}
                  className="text-gray-600 leading-relaxed"
                >
                  {undergraduate.description}
                </motion.p>
              </div>
            </div>

            {/* Awards and Recognition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
              >
                <div className="flex items-center mb-4">
                  <Award className="w-6 h-6 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Awards & Honors</h3>
                </div>
                <ul className="space-y-2">
                  {undergraduate.awards?.map((award, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.9 + (index * 0.1) }}
                      className="flex items-start text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      {award}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3 }}
              >
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-purple-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Extracurricular Activities</h3>
                </div>
                <ul className="space-y-2">
                  {undergraduate.activities?.map((activity, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.4 + (index * 0.1) }}
                      className="flex items-start text-gray-600"
                    >
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      {activity}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </Card>
        </div>
      </section>

      {/* Academic Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            className="text-3xl font-bold text-center mb-12 text-gray-900"
          >
            Academic Timeline
          </motion.h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-green-500"></div>
              
              {/* Graduate Studies */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.6 }}
                className="relative flex items-center mb-12"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center relative z-10">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-8">
                  <h3 className="text-xl font-semibold text-gray-900">{graduate.period}</h3>
                  <p className="text-gray-600">{graduate.degree}, {graduate.institution}</p>
                  <p className="text-sm text-gray-500">{graduate.focus} Research</p>
                </div>
              </motion.div>
              
              {/* Undergraduate Studies */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.7 }}
                className="relative flex items-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center relative z-10">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-8">
                  <h3 className="text-xl font-semibold text-gray-900">{undergraduate.period}</h3>
                  <p className="text-gray-600">{undergraduate.degree}, {undergraduate.institution}</p>
                  <p className="text-sm text-gray-500">{undergraduate.status}, GPA: {undergraduate.gpa}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
