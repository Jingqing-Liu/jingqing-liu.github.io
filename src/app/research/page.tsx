'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { researchProjects, researchCategories } from '../../data';
import ResearchCard from '../../components/ResearchCard';

export default function Research() {

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
              Research Projects
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            >
              Explore my research work in cybersecurity, network security, and distributed systems. 
              Each project represents a deep dive into cutting-edge technologies and security challenges.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Research Projects Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {researchProjects.map((project, index) => (
              <div
                key={index}
                className={`
                  ${project.poster ? 'lg:col-span-2' : ''}
                  ${!project.poster && index % 2 === 1 ? 'lg:col-start-2' : ''}
                `}
              >
                <ResearchCard
                  title={project.title}
                  advisor={project.advisor}
                  keyPoints={project.keyPoints}
                  poster={project.poster}
                  delay={0.5 + (index * 0.2)}
                  showDetails={project.showDetails}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Focus Areas */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-12 text-gray-900">Research Focus Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(researchCategories).slice(0, 3).map(([key, category], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + (index * 0.1) }}
                  className="text-center p-6"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{category.name}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
