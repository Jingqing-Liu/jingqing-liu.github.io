'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'en' | 'zh';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

/** Pick the right string based on the current language */
export function localize(lang: Lang, en: string, zh?: string): string {
  return lang === 'zh' && zh ? zh : en;
}

/** Pick the right array based on the current language */
export function localizeArray(lang: Lang, en: string[], zh?: string[]): string[] {
  return lang === 'zh' && zh && zh.length > 0 ? zh : en;
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.education': 'Education',
    'nav.research': 'Research',
    'nav.experience': 'Experience',
    'nav.snowball': 'My Cats',
    'nav.menu': 'Menu',

    // Hero
    'hero.tag': 'Cybersecurity Researcher & Engineer',
    'hero.tagline': 'Security Researcher specializing in vulnerability discovery across distributed systems and real-world protocols.',
    'hero.subtitle': 'M.S. Computer Science',
    'hero.proof.label': 'Worked on:',
    'hero.proof.items': 'WeChat API · Roblox · Bitcoin protocol',
    'hero.cta.research': 'View Research',
    'hero.cta.resume': 'Resume',
    'hero.highlight.security': 'Network Security',
    'hero.highlight.security.desc': 'API & Platform Vulnerability Research',
    'hero.highlight.systems': 'Systems Architecture',
    'hero.highlight.systems.desc': 'Full-Stack & Distributed Systems',
    'hero.highlight.blockchain': 'Applied Cryptography',
    'hero.highlight.blockchain.desc': 'Blockchain & Cryptographic Protocol Analysis',

    // Home sections
    'home.experience.tag': 'Experience',
    'home.experience.title': "Where I've Worked",
    'home.experience.viewAll': 'View all',
    'home.experience.viewAllMobile': 'View all experience',
    'home.research.tag': 'Research',
    'home.research.title': 'Security Research',
    'home.research.readMore': 'Read more',
    'home.research.viewAll': 'View all',
    'home.research.viewAllMobile': 'View all research',
    'home.education.tag': 'Education',
    'home.education.title': 'Academic Background',
    'home.education.viewAll': 'View all',

    // Education page
    'edu.badge': 'Academic Background',
    'edu.title': 'Education',
    'edu.subtitle': 'Computer Science — from cybersecurity at Delaware to AI, security, and systems at Brown.',
    'edu.label.degree': 'Degree',
    'edu.label.major': 'Major',
    'edu.label.gpa': 'GPA',
    'edu.label.focus': 'Focus',
    'edu.label.location': 'Location',
    'edu.label.activities': 'Activities',
    'edu.award': 'Award',

    // Research page
    'research.badge': 'Research Portfolio',
    'research.title': 'Research',
    'research.subtitle': 'Exploring cybersecurity, network security, and distributed systems — from platform vulnerabilities to blockchain protocol design.',
    'research.search': 'Search projects, advisors, keywords...',
    'research.advisor': 'Advisor',
    'research.viewDetails': 'View Details & Poster',
    'research.learnMore': 'Learn More',
    'research.back': 'Back to Research',
    'research.backAll': 'Back to All Research',
    'research.poster': 'Research Poster',

    // Experience page
    'exp.badge': 'Professional Journey',
    'exp.title': 'Experience',
    'exp.subtitle': 'From research and academia to industry — diverse perspectives on technology, security, and innovation.',
    'exp.viewDetails': 'View details',
    'exp.back': 'Back to Experience',
    'exp.projects': 'Projects',
    'exp.achievements': 'Key Achievements',
    'exp.responsibilities': 'Responsibilities',
    'exp.technologies': 'Technologies',
    'exp.supervisor': 'Supervisor',
    'exp.type.Research': 'Research',
    'exp.type.Academic': 'Academic',
    'exp.type.Industry': 'Industry',
    'exp.type.Finance': 'Finance',

    // Cats
    'cats.badge': 'My Cats',
    'cats.title': 'My Cats',
    'cats.subtitle': 'My beloved companions.',
    'cats.snowball': 'Snowball',
    'cats.latte': 'Latte',

    // Footer
    'footer.navigation': 'Navigation',
    'footer.connect': 'Connect',
    'footer.rights': 'All rights reserved.',
    'footer.available': 'Available for opportunities',
  },
  zh: {
    // Nav
    'nav.home': '首页',
    'nav.education': '教育',
    'nav.research': '研究',
    'nav.experience': '经历',
    'nav.snowball': '我的猫咪',
    'nav.menu': '菜单',

    // Hero
    'hero.tag': '网络安全研究员 & 工程师',
    'hero.tagline': '专注于分布式系统与真实协议中的漏洞发现与安全研究。',
    'hero.subtitle': '计算机科学硕士',
    'hero.proof.label': '研究涉及：',
    'hero.proof.items': '微信 API · Roblox · 比特币协议',
    'hero.cta.research': '查看研究',
    'hero.cta.resume': '简历',
    'hero.highlight.security': '网络安全',
    'hero.highlight.security.desc': 'API 与平台漏洞研究',
    'hero.highlight.systems': '系统架构',
    'hero.highlight.systems.desc': '全栈与分布式系统',
    'hero.highlight.blockchain': '应用密码学',
    'hero.highlight.blockchain.desc': '区块链与密码协议分析',

    // Home sections
    'home.experience.tag': '经历',
    'home.experience.title': '工作经历',
    'home.experience.viewAll': '查看全部',
    'home.experience.viewAllMobile': '查看全部经历',
    'home.research.tag': '研究',
    'home.research.title': '安全研究',
    'home.research.readMore': '了解更多',
    'home.research.viewAll': '查看全部',
    'home.research.viewAllMobile': '查看全部研究',
    'home.education.tag': '教育',
    'home.education.title': '学术背景',
    'home.education.viewAll': '查看全部',

    // Education page
    'edu.badge': '学术背景',
    'edu.title': '教育经历',
    'edu.subtitle': '从特拉华大学的网络安全到布朗大学的 AI、安全与系统方向。',
    'edu.label.degree': '学位',
    'edu.label.major': '专业',
    'edu.label.gpa': 'GPA',
    'edu.label.focus': '方向',
    'edu.label.location': '地点',
    'edu.label.activities': '活动',
    'edu.award': '荣誉',

    // Research page
    'research.badge': '研究成果',
    'research.title': '研究',
    'research.subtitle': '探索网络安全、分布式系统——从平台漏洞到区块链协议设计。',
    'research.search': '搜索项目、导师、关键词...',
    'research.advisor': '导师',
    'research.viewDetails': '查看详情与海报',
    'research.learnMore': '了解更多',
    'research.back': '返回研究',
    'research.backAll': '返回全部研究',
    'research.poster': '研究海报',

    // Experience page
    'exp.badge': '职业历程',
    'exp.title': '工作经历',
    'exp.subtitle': '从科研与学术到工业界——对技术、安全与创新的多元视角。',
    'exp.viewDetails': '查看详情',
    'exp.back': '返回经历',
    'exp.projects': '项目',
    'exp.achievements': '主要成就',
    'exp.responsibilities': '工作职责',
    'exp.technologies': '技术栈',
    'exp.supervisor': '导师',
    'exp.type.Research': '科研',
    'exp.type.Academic': '学术',
    'exp.type.Industry': '工业',
    'exp.type.Finance': '金融',

    // Cats
    'cats.badge': '我的猫咪',
    'cats.title': '我的猫咪',
    'cats.subtitle': '我最亲爱的伙伴们。',
    'cats.snowball': '雪球',
    'cats.latte': '拿铁',

    // Footer
    'footer.navigation': '导航',
    'footer.connect': '联系',
    'footer.rights': '保留所有权利。',
    'footer.available': '开放合作机会',
  },
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved === 'en' || saved === 'zh') setLang(saved);
  }, []);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
