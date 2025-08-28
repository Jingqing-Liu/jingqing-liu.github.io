'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { researchProjects, researchCategories } from '../../data';
import ResearchCard from '../../components/ResearchCard';

// Advanced Animated Section Wrapper for Research Page
const AnimatedSection = ({ 
  children, 
  index, 
  animationType = "luxury",
  className = "" 
}: { 
  children: React.ReactNode; 
  index: number;
  animationType?: "luxury" | "depth" | "parallax" | "float" | "slide";
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, // Allow bidirectional scroll animations
    margin: "-10% 0px -10% 0px" 
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform values for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  const animationVariants = {
    luxury: {
      initial: { 
        opacity: 0, 
        y: 80, 
        scale: 0.9,
        rotateX: 8
      },
      animate: isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0,
        transition: {
          duration: 0.9,
          delay: index * 0.12,
          ease: [0.175, 0.885, 0.32, 1.275] as any,
          scale: {
            type: "spring",
            damping: 20,
            stiffness: 400
          }
        }
      } : {
        opacity: 0, 
        y: 80, 
        scale: 0.9,
        rotateX: 8,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] as any
        }
      }
    },
    depth: {
      initial: { 
        opacity: 0, 
        z: -100,
        rotateY: 10,
        scale: 0.95
      },
      animate: isInView ? { 
        opacity: 1, 
        z: 0,
        rotateY: 0,
        scale: 1,
        transition: {
          duration: 0.8,
          delay: index * 0.1,
          ease: [0.4, 0, 0.2, 1] as any
        }
      } : {
        opacity: 0, 
        z: -100,
        rotateY: 10,
        scale: 0.95,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as any
        }
      }
    },
    parallax: {
      initial: {},
      animate: {}
    },
    float: {
      initial: { 
        opacity: 0, 
        y: 40,
        scale: 0.98
      },
      animate: isInView ? { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          delay: index * 0.08,
          ease: [0.4, 0, 0.2, 1] as any
        }
      } : {
        opacity: 0, 
        y: 40,
        scale: 0.98,
        transition: {
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1] as any
        }
      }
    },
    slide: {
      initial: { 
        opacity: 0, 
        x: -60,
        rotateY: 15
      },
      animate: isInView ? { 
        opacity: 1, 
        x: 0,
        rotateY: 0,
        transition: {
          duration: 0.7,
          delay: index * 0.1,
          ease: [0.4, 0, 0.2, 1] as any
        }
      } : {
        opacity: 0, 
        x: -60,
        rotateY: 15,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as any
        }
      }
    }
  };

  if (animationType === "parallax") {
    return (
      <motion.div
        ref={ref}
        style={{ 
          y: y,
          opacity: opacity,
          scale: scale,
          perspective: "1000px",
          transformStyle: "preserve-3d"
        }}
        className={`will-change-transform ${className}`}
      >
        <motion.div
          whileHover={{ 
            scale: 1.01, 
            rotateX: 1,
            transition: { duration: 0.3 }
          }}
          className="transform-gpu"
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      variants={animationVariants[animationType]}
      initial="initial"
      animate="animate"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
      className={`will-change-transform ${className}`}
    >
      <motion.div
        whileHover={{ 
          y: -4, 
          scale: 1.005,
          rotateX: 0.5,
          transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as any }
        }}
        className="transform-gpu"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Enhanced Background for Research Page
const ResearchBackground = () => {
  const { scrollYProgress } = useScroll();
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity1 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.1, 0.3, 0.6, 0.9]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        style={{ y: backgroundY, opacity: opacity1 }}
        className="absolute inset-0 bg-white"
      />
      <motion.div 
        style={{ opacity: opacity2 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-50/40 to-cyan-50/20"
      />
      
      {/* Floating Research Elements */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-cyan-400/4 to-blue-400/4 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-indigo-400/4 to-purple-400/4 rounded-full blur-3xl"
      />
    </div>
  );
};

export default function Research() {

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ResearchBackground />
      
      {/* Header */}
      <AnimatedSection index={0} animationType="luxury">
        <section className="pt-24 pb-20">
          <div className="container mx-auto px-8">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-light text-gray-900 tracking-tight leading-tight mb-8">
                Research
              </h1>
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-5xl mx-auto font-medium text-center">
                  Explore my research work in cybersecurity, network security, and distributed systems. Each project represents a deep dive into cutting-edge technologies and security challenges.
                </p>
                <div className="w-16 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Research Projects Grid */}
      <AnimatedSection index={1} animationType="parallax">
        <section className="pb-20 bg-gray-50">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-4">
                Projects
              </h2>
              <div className="w-12 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {researchProjects.map((project, index) => (
                <AnimatedSection key={project.id} index={index} animationType="slide">
                  <ResearchCard
                    id={project.id}
                    title={project.title}
                    advisor={project.advisor}
                    keyPoints={project.keyPoints}
                    poster={project.poster}
                    delay={0}
                    showDetails={project.showDetails}
                  />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Research Focus Areas */}
      <AnimatedSection index={2} animationType="depth">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mb-4">
                Focus Areas
              </h2>
              <div className="w-12 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.entries(researchCategories).slice(0, 3).map(([key, category], index) => (
                  <AnimatedSection key={key} index={index} animationType="float">
                    <div className="group">
                      <div className="bg-gray-50 rounded-3xl p-8 text-center h-full hover:shadow-lg transition-all duration-300 ease-out">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors duration-300">
                          <span className="text-3xl">{category.icon}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 tracking-tight">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
