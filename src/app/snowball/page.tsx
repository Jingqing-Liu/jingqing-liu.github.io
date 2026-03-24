'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Cat } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '../../i18n/LanguageContext';

const photos = [
  { src: '/snowball/snowball-1.jpeg', alt: 'Snowball 1' },
  { src: '/snowball/snowball-2.jpeg', alt: 'Snowball 2' },
  { src: '/snowball/snowball-3.jpeg', alt: 'Snowball 3' },
  { src: '/snowball/snowball-4.jpeg', alt: 'Snowball 4' },
  { src: '/snowball/snowball-5.jpeg', alt: 'Snowball 5' },
];

export default function SnowballPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative" style={{ background: '#f2f2f7' }}>
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #ffd6a5 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] left-[-10%] w-[450px] h-[450px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #a8d8ff 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ffc0cb 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono tracking-wider uppercase text-[#48484a] liquid-glass-pill">
                <Cat size={14} className="text-[#007aff]" />
                {t('snowball.badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[2.625rem] md:text-[4.25rem] font-bold text-[#1c1c1e] tracking-tight leading-tight mb-6"
            >
              {t('snowball.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base text-[#48484a] leading-relaxed text-center"
            >
              {t('snowball.subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-5xl mx-auto columns-1 md:columns-2 gap-4 space-y-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="break-inside-avoid"
              >
                <div className="liquid-glass-card overflow-hidden">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority={index < 2}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="pb-16">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-sm text-[#636366] leading-relaxed"
            >
              {t('snowball.description')}
            </motion.p>
          </div>
        </div>
      </section>
    </div>
  );
}
