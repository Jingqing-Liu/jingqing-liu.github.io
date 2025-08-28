'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { educationData } from '../../data';

// Advanced Animated Section Wrapper for Education Page
const AnimatedSection = ({ 
  children, 
  index, 
  animationType = "luxury",
  className = "" 
}: { 
  children: React.ReactNode; 
  index: number;
  animationType?: "luxury" | "depth" | "parallax" | "float";
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, // Allow bidirectional scroll animations
    margin: "-15% 0px -15% 0px" 
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform values for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.85, 1, 1, 0.85]);

  const animationVariants = {
    luxury: {
      initial: { 
        opacity: 0, 
        y: 100, 
        scale: 0.85,
        rotateX: 12
      },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0
      }
    },
    depth: {
      initial: { 
        opacity: 0, 
        z: -150,
        rotateY: 15,
        scale: 0.9
      },
      animate: { 
        opacity: 1, 
        z: 0,
        rotateY: 0,
        scale: 1
      }
    },
    parallax: {
      initial: {},
      animate: {}
    },
    float: {
      initial: { 
        opacity: 0, 
        y: 50,
        scale: 0.96
      },
      animate: { 
        opacity: 1, 
        y: 0,
        scale: 1
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
            rotateY: 1,
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
      animate={isInView ? "animate" : "initial"}
      transition={
        animationType === 'luxury' ? {
          duration: 1.0,
          delay: index * 0.15,
          ease: "backOut",
          scale: { type: "spring", damping: 25, stiffness: 300 }
        } : animationType === 'depth' ? {
          duration: 0.9,
          delay: index * 0.1,
          ease: "easeOut"
        } : animationType === 'float' ? {
          duration: 0.7,
          delay: index * 0.08,
          ease: "easeOut"
        } : {
          duration: isInView ? 0.5 : 0.4,
          ease: "easeOut"
        }
      }
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
      className={`will-change-transform ${className}`}
    >
      <motion.div
        whileHover={{ 
          y: -6, 
          scale: 1.005,
          rotateX: 1,
          transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
        }}
        className="transform-gpu"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Enhanced Background for Education Page
const EducationBackground = () => {
  const { scrollYProgress } = useScroll();
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity1 = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [1, 0.9, 0.7, 0.5]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.6, 1], [0.2, 0.5, 0.8]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        style={{ y: backgroundY, opacity: opacity1 }}
        className="absolute inset-0 bg-white"
      />
      <motion.div 
        style={{ opacity: opacity2 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-50/30 to-blue-50/20"
      />
      
      {/* Floating Academic Elements */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/3 right-1/5 w-72 h-72 bg-gradient-to-r from-blue-400/3 to-indigo-400/3 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 0.85, 1]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/3 left-1/5 w-96 h-96 bg-gradient-to-r from-purple-400/3 to-pink-400/3 rounded-full blur-3xl"
      />
    </div>
  );
};

export default function Education() {
  const [graduate, undergraduate] = educationData;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <EducationBackground />
      
      {/* Header */}
      <AnimatedSection index={0} animationType="luxury">
        <section className="pt-24 pb-20">
          <div className="container mx-auto px-8">
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-light text-gray-900 tracking-tight leading-tight mb-8">
                Education
              </h1>
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-5xl mx-auto font-medium">
                  My academic journey spans from undergraduate excellence at the University of Delaware 
                  to advanced graduate studies at Brown University, focusing on cutting-edge computer science research.
                </p>
                <div className="w-16 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Graduate Studies */}
      <AnimatedSection index={1} animationType="parallax">
        <section className="pb-20 bg-gray-50">
          <div className="container mx-auto px-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl p-12 shadow-sm">
              <div className="text-center mb-12">
                <div className="inline-block">
                  <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-gray-50 px-4 py-2 rounded-full">
                    Current
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mt-4 mb-2">
                  Graduate Studies
                </h2>
                <p className="text-xl text-gray-700 font-medium">{graduate.institution}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Program Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Degree</p>
                      <p className="text-gray-800">{graduate.degree}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Period</p>
                      <p className="text-gray-800">{graduate.period}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Research Focus</p>
                      <p className="text-gray-800">{graduate.focus}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Research Activities</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {graduate.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </AnimatedSection>

      {/* Undergraduate Degree */}
      <AnimatedSection index={2} animationType="depth">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gray-50 rounded-3xl p-12">
              <div className="text-center mb-12">
                <div className="inline-block">
                  <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-white px-4 py-2 rounded-full">
                    {undergraduate.status}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight mt-4 mb-2">
                  Undergraduate Degree
                </h2>
                <p className="text-xl text-gray-700 font-medium">{undergraduate.institution}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Academic Excellence</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Degree</p>
                      <p className="text-gray-800">{undergraduate.degree}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">GPA</p>
                      <p className="text-gray-800">{undergraduate.gpa}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Graduation</p>
                      <p className="text-gray-800">{undergraduate.period.split(' - ')[1]}, {undergraduate.status}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Research Area</p>
                      <p className="text-gray-800">{undergraduate.focus}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Program Overview</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {undergraduate.description}
                  </p>
                </div>
              </div>

              {/* Awards and Recognition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Awards & Honors</h3>
                  <div className="space-y-3">
                    {undergraduate.awards?.map((award, index) => (
                      <div
                        key={index}
                        className="flex items-start"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-gray-600 text-sm leading-relaxed">{award}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Extracurricular Activities</h3>
                  <div className="space-y-3">
                    {undergraduate.activities?.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-gray-600 text-sm leading-relaxed">{activity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </AnimatedSection>

      {/* Academic Timeline */}
      <AnimatedSection index={3} animationType="float">
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-4">
                Academic Timeline
              </h2>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto rounded-full"></div>
            </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Graduate Studies */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-block">
                    <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-gray-50 px-3 py-1 rounded-full">
                      Current
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{graduate.period}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                    {graduate.degree}
                  </h3>
                  <p className="text-gray-700 font-medium">{graduate.institution}</p>
                  <p className="text-sm text-gray-500">{graduate.focus} Research</p>
                </div>
              </div>
              
              {/* Undergraduate Studies */}
              <div className="bg-white rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-block">
                    <span className="text-xs font-medium text-gray-500 tracking-widest uppercase bg-gray-50 px-3 py-1 rounded-full">
                      {undergraduate.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{undergraduate.period}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                    {undergraduate.degree}
                  </h3>
                  <p className="text-gray-700 font-medium">{undergraduate.institution}</p>
                  <p className="text-sm text-gray-500">GPA: {undergraduate.gpa}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
