export interface NavItem {
  name: string;
  href: string;
  description?: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { 
    name: 'Home', 
    href: '/',
    description: 'Personal introduction and overview'
  },
  { 
    name: 'Education', 
    href: '/education',
    description: 'Academic background and achievements'
  },
  { 
    name: 'Research', 
    href: '/research',
    description: 'Research projects and publications'
  },
  { 
    name: 'Experience', 
    href: '/experience',
    description: 'Professional and academic experience'
  },
];

export const socialLinks: SocialLink[] = [
  {
    name: 'Email',
    href: 'mailto:jingqing_liu@brown.edu',
    icon: 'Mail'
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Jingqing-Liu',
    icon: 'Github'
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jingqing-liu',
    icon: 'Linkedin'
  }
];
