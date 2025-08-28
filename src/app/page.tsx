'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import HeroSection from './home/components/HeroSection';
import ContactSection from './home/components/ContactSection';
import EducationSummary from './home/components/EducationSummary';
import QuickLinks from './home/components/QuickLinks';

// Advanced Animated Section Wrapper with Bidirectional Scroll Effects
const AnimatedSection = ({ 
  children, 
  index, 
  animationType = "luxury" 
}: { 
  children: React.ReactNode; 
  index: number;
  animationType?: "luxury" | "depth" | "parallax" | "float";
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: false, // Allow animations on both scroll directions
    margin: "-20% 0px -20% 0px" // Trigger earlier for smoother experience
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform values for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  const rotateX = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [15, 0, 0, -15]);

  // Animation variants for different effects
  const animationVariants = {
    luxury: {
      initial: { 
        opacity: 0, 
        y: 120, 
        scale: 0.8,
        rotateX: 15,
        rotateY: -10
      },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: 0,
        rotateY: 0
      }
    },
    depth: {
      initial: { 
        opacity: 0, 
        z: -200,
        rotateX: 20,
        scale: 0.9
      },
      animate: { 
        opacity: 1, 
        z: 0,
        rotateX: 0,
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
        y: 60,
        scale: 0.95
      },
      animate: { 
        opacity: 1, 
        y: 0,
        scale: 1
      }
    }
  };

  // Transition configurations
  const getTransition = (type: string) => {
    if (!isInView) {
      return { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any };
    }
    
    switch (type) {
      case 'luxury':
        return {
          duration: 1.2,
          delay: index * 0.2,
          ease: [0.175, 0.885, 0.32, 1.275] as any,
          scale: { type: "spring", damping: 20, stiffness: 300 }
        };
      case 'depth':
        return {
          duration: 1.0,
          delay: index * 0.15,
          ease: [0.4, 0, 0.2, 1] as any
        };
      case 'float':
        return {
          duration: 0.8,
          delay: index * 0.1,
          ease: [0.4, 0, 0.2, 1] as any
        };
      default:
        return { duration: 0.6, ease: [0.4, 0, 0.2, 1] as any };
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
          rotateX: rotateX,
          perspective: "1000px",
          transformStyle: "preserve-3d"
        }}
        className="will-change-transform"
      >
        <motion.div
          whileHover={{ 
            scale: 1.02, 
            rotateX: 2, 
            rotateY: 2,
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
      transition={getTransition(animationType)}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
      className="will-change-transform"
    >
      <motion.div
        whileHover={{ 
          y: -8, 
          scale: 1.01,
          rotateX: 2,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className="transform-gpu"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Enhanced Page Background with Animated Gradients
const AnimatedBackground = () => {
  const { scrollYProgress } = useScroll();
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity1 = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.8, 0.6, 0.4]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.7, 1]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        style={{ y: backgroundY, opacity: opacity1 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"
      />
      <motion.div 
        style={{ opacity: opacity2 }}
        className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 to-purple-50/20"
      />
      
      {/* Floating Elements */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-full blur-3xl"
      />
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Hero Section with Luxury Animation */}
      <AnimatedSection index={0} animationType="luxury">
        <HeroSection />
      </AnimatedSection>

      {/* Contact Section with Parallax Effect */}
      <AnimatedSection index={1} animationType="parallax">
        <ContactSection />
      </AnimatedSection>

      {/* Education Summary with Depth Effect */}
      <AnimatedSection index={2} animationType="depth">
        <EducationSummary />
      </AnimatedSection>

      {/* Quick Links with Float Effect */}
      <AnimatedSection index={3} animationType="float">
        <QuickLinks />
      </AnimatedSection>

      {/* Scroll Indicator */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
