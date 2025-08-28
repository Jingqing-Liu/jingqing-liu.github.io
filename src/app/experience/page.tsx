'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Building, Calendar } from 'lucide-react';
import { experienceData, skillCategories } from '../../data';
import Card from '../../components/Card';

export default function Experience() {
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'Research': return GraduationCap;
      case 'Academic': return GraduationCap;
      case 'Industry': return Briefcase;
      case 'Finance': return Building;
      default: return Briefcase;
    }
  };

  const getIconColors = (type: string) => {
    switch (type) {
      case 'Research': return { color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'Academic': return { color: 'text-green-600', bg: 'bg-green-100' };
      case 'Industry': return { color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'Finance': return { color: 'text-orange-600', bg: 'bg-orange-100' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

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
              Professional Experience
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            >
              My professional journey spans research, academia, and industry, providing me with 
              diverse perspectives on technology, security, and innovation.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-16 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-green-500 via-purple-500 to-orange-500"></div>
              
                          {experienceData.map((exp, index) => {
              const IconComponent = getIconComponent(exp.type);
              const colors = getIconColors(exp.type);
              
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.2) }}
                  className="relative mb-12 last:mb-0"
                >
                  <Card delay={0.7 + (index * 0.2)} className="ml-16 md:ml-32">
                    {/* Icon */}
                    <div className={`absolute -left-24 md:-left-40 top-8 w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`w-8 h-8 ${colors.color}`} />
                    </div>

                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{exp.title}</h3>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {exp.period}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          <span className="font-semibold text-blue-600">{exp.company}</span>
                        </div>
                        {exp.supervisor && (
                          <div className="md:ml-6 mt-1 md:mt-0">
                            <span className="text-sm">Supervisor: {exp.supervisor}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">{exp.description}</p>
                    </div>

                    {/* Projects (for research roles) */}
                    {exp.projects && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Research Projects</h4>
                        <ul className="space-y-2">
                          {exp.projects.map((project, projIndex) => (
                            <li key={projIndex} className="flex items-start text-gray-600">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              {project}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Achievements */}
                    {exp.achievements && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h4>
                        <ul className="space-y-2">
                          {exp.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="flex items-start text-gray-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Responsibilities */}
                    {exp.responsibilities && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Responsibilities</h4>
                        <ul className="space-y-2">
                          {exp.responsibilities.map((responsibility, respIndex) => (
                            <li key={respIndex} className="flex items-start text-gray-600">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              {responsibility}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technologies */}
                    {exp.technologies && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Summary */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-12 text-gray-900">Skills & Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {Object.entries(skillCategories).map(([key, skill], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.6 + (index * 0.1) }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{skill.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{skill.name}</h3>
                  <p className="text-gray-600 text-sm">{skill.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
