'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Briefcase, GraduationCap, Building, Calendar } from 'lucide-react';
import { experienceData, skillCategories } from '../../data';

// Enhanced Background for Experience Page
const ExperienceBackground = () => {
  const { scrollYProgress } = useScroll();
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity1 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.9, 0.7, 0.5]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.1, 0.4, 0.7, 1]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        style={{ y: backgroundY, opacity: opacity1 }}
        className="absolute inset-0 bg-white"
      />
      <motion.div 
        style={{ opacity: opacity2 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-green-50/20"
      />
      
      {/* Floating Experience Elements */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/5 right-1/4 w-96 h-96 bg-gradient-to-r from-green-400/3 to-teal-400/3 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/5 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/3 to-indigo-400/3 rounded-full blur-3xl"
      />
    </div>
  );
};

// Individual Experience Card Component with Bidirectional Scroll Animations
const ExperienceCard = ({ exp, index }: { exp: any; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, // Allow bidirectional scroll animations
    margin: "-10% 0px -10% 0px" 
  });

  const getIconComponent = (type: string) => {
    switch (type) {
      case 'Research': return GraduationCap;
      case 'Academic': return GraduationCap;
      case 'Industry': return Briefcase;
      case 'Finance': return Building;
      default: return Briefcase;
    }
  };

  const IconComponent = getIconComponent(exp.type);

  // Multiple Animation Effect Options
  const animationVariants = {
    // Option 1: 3D Flip Effect
    flip: {
      hidden: { 
        opacity: 0,
        rotateY: -90,
        scale: 0.8
      },
      visible: { 
        opacity: 1,
        rotateY: 0,
        scale: 1
      }
    },
    // Option 2: Flash Appear Effect
    flash: {
      hidden: { 
        opacity: 0,
        scale: 0.3
      },
      visible: { 
        opacity: 1,
        scale: 1
      }
    },
    // Option 3: Slide In from Left
    slideIn: {
      hidden: { 
        opacity: 0,
        x: -100,
        rotateX: -15
      },
      visible: { 
        opacity: 1,
        x: 0,
        rotateX: 0
      }
    },
    // Option 4: Luxury Combined Effect
    luxury: {
      hidden: { 
        opacity: 0,
        scale: 0.5,
        rotateY: -180,
        y: 100
      },
      visible: { 
        opacity: 1,
        scale: 1,
        rotateY: 0,
        y: 0
      }
    }
  };

  // Corresponding transition configurations
  const transitionConfigs = {
    flip: {
      duration: 0.8,
      delay: index * 0.2,
      ease: [0.4, 0, 0.2, 1] as any
    },
    flash: {
      duration: 0.6,
      delay: index * 0.15,
      ease: [0.175, 0.885, 0.32, 1.275] as any,
      scale: {
        type: "spring",
        damping: 15,
        stiffness: 300
      }
    },
    slideIn: {
      duration: 0.7,
      delay: index * 0.2,
      ease: [0.4, 0, 0.2, 1] as any
    },
    luxury: {
      duration: 1.2,
      delay: index * 0.25,
      ease: [0.175, 0.885, 0.32, 1.275] as any,
      scale: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className="relative mb-12 last:mb-0 group"
      variants={animationVariants.flip} // 🎨 Animation effect selection: flip(3D Flip) | flash(Flash Pop) | slideIn(Slide from Left) | luxury(Luxury Combined)
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={transitionConfigs.flip} // 🎨 Corresponding transition config: flip | flash | slideIn | luxury
      style={{
        perspective: "1000px"
      }}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="ml-16 md:ml-32 bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d"
        }}
      >
        {/* Icon */}
        <motion.div 
          className="absolute -left-24 md:-left-40 top-8 w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm"
          animate={isInView ? {
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0]
          } : {}}
          transition={{
            delay: index * 0.2 + 0.3,
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          <IconComponent className="w-8 h-8 text-gray-700" />
        </motion.div>

        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{exp.title}</h3>
            <div className="inline-block mt-2 md:mt-0">
              <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-gray-50 px-3 py-1 rounded-full">
                {exp.period}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg text-gray-700 font-medium">{exp.company}</p>
            {exp.supervisor && (
              <p className="text-sm text-gray-500">Supervisor: {exp.supervisor}</p>
            )}
            <p className="text-gray-600 leading-relaxed">{exp.description}</p>
          </div>
        </div>

        {/* Projects (for research roles) */}
        {exp.projects && (
          <div className="mb-8 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 tracking-tight">Research Projects</h4>
            <div className="space-y-3">
              {exp.projects.map((project: string, projIndex: number) => (
                <motion.div 
                  key={projIndex} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{
                    delay: index * 0.2 + 0.5 + projIndex * 0.1,
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">{project}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {exp.achievements && (
          <div className="mb-8 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 tracking-tight">Key Achievements</h4>
            <div className="space-y-3">
              {exp.achievements.map((achievement: string, achIndex: number) => (
                <motion.div 
                  key={achIndex} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{
                    delay: index * 0.2 + 0.6 + achIndex * 0.1,
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">{achievement}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {exp.responsibilities && (
          <div className="mb-8 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 tracking-tight">Key Responsibilities</h4>
            <div className="space-y-3">
              {exp.responsibilities.map((responsibility: string, respIndex: number) => (
                <motion.div 
                  key={respIndex} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{
                    delay: index * 0.2 + 0.7 + respIndex * 0.1,
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">{responsibility}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Technologies */}
        {exp.technologies && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 tracking-tight">Technologies Used</h4>
            <div className="flex flex-wrap gap-2">
              {exp.technologies.map((tech: string, techIndex: number) => (
                <motion.span
                  key={techIndex}
                  className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{
                    delay: index * 0.2 + 0.8 + techIndex * 0.05,
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Skills Grid Component with Bidirectional Scroll Animations
const SkillsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {Object.entries(skillCategories).map(([key, skill], index) => {
        const ref = useRef(null);
        const isInView = useInView(ref, { 
          once: false, // Allow bidirectional scroll animations
          margin: "-5% 0px -5% 0px" 
        });

        return (
          <motion.div
            key={key}
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0, 
              scale: 1 
            } : { 
              opacity: 0, 
              y: 50, 
              scale: 0.8 
            }}
            transition={{ 
              delay: index * 0.15, 
              duration: 0.6, 
              ease: [0.175, 0.885, 0.32, 1.275],
              scale: {
                type: "spring",
                damping: 20,
                stiffness: 300
              }
            }}
            className="group"
          >
            <motion.div
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                rotateX: 5,
                rotateY: 5 
              }}
              transition={{ 
                duration: 0.3, 
                ease: [0.4, 0, 0.2, 1]
              }}
              className="bg-gray-50 rounded-3xl p-8 text-center h-full hover:shadow-2xl transition-all duration-500 ease-out"
              style={{
                transformStyle: "preserve-3d"
              }}
            >
              <motion.div 
                className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors duration-300"
                animate={isInView ? {
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={{
                  delay: index * 0.15 + 0.3,
                  duration: 0.8,
                  ease: [0.4, 0, 0.6, 1]
                }}
              >
                <span className="text-3xl">{skill.icon}</span>
              </motion.div>
              
              <motion.h3 
                className="text-xl font-semibold mb-4 text-gray-900 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  delay: index * 0.15 + 0.4,
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {skill.name}
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 leading-relaxed text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  delay: index * 0.15 + 0.5,
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                {skill.description}
              </motion.p>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function Experience() {

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ExperienceBackground />
      
      {/* Header */}
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as any }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] as any }}
              className="text-5xl md:text-7xl font-light text-gray-900 tracking-tight leading-tight mb-8"
            >
              Experience
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] as any }}
              className="space-y-4"
            >
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-5xl mx-auto font-medium text-center">
                My professional journey spans research, academia, and industry, providing me with 
                diverse perspectives on technology, security, and innovation.
              </p>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="pb-20 bg-gray-50">
        <div className="container mx-auto px-8">
          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-16 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
              
              {experienceData.map((exp, index) => (
                <ExperienceCard 
                  key={exp.id} 
                  exp={exp} 
                  index={index} 
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Summary */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.6, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-4">
              Skills & Expertise
            </h2>
            <div className="w-12 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <SkillsGrid />
          </div>
        </div>
      </section>
    </div>
  );
}

