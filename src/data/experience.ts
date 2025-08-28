export interface Experience {
  id: string;
  title: string;
  company: string;
  supervisor?: string;
  period: string;
  type: 'Research' | 'Academic' | 'Industry' | 'Finance';
  description: string;
  projects?: string[];
  achievements?: string[];
  responsibilities?: string[];
  technologies?: string[];
}

export const experienceData: Experience[] = [
  {
    id: 'xlab-researcher',
    title: 'Researcher, X-Lab',
    company: 'University of Delaware',
    supervisor: 'Dr. Xing Gao',
    period: 'Jun 2023 - Dec 2023',
    type: 'Research',
    description: 'Conducted cutting-edge research in cybersecurity and network security under the supervision of Dr. Xing Gao.',
    projects: [
      'Research and Testing of API Calls in WeChat',
      'Invisible Threats in the Met-Averse: Roblox\'s Security Vulnerabilities'
    ],
    achievements: [
      'Published research findings on WeChat API security vulnerabilities',
      'Identified critical security flaws in Roblox\'s infrastructure',
      'Developed innovative testing methodologies for platform security assessment'
    ]
  },
  {
    id: 'teaching-assistant',
    title: 'Student Teaching Assistant',
    company: 'University of Delaware',
    period: 'Feb 2022 - Dec 2022',
    type: 'Academic',
    description: 'Supported mathematics and computer science education through teaching assistance and student mentorship.',
    responsibilities: [
      'Facilitated weekly exam review sessions, enhancing students\' understanding and performance in mathematics',
      'Led lab sessions to reinforce computer science concepts, assisting students in practical application of theoretical knowledge',
      'Provided individual guidance during office hours, resolving student queries',
      'Contributed to grading and feedback processes for assignments, improving educational outcomes for a diverse student body'
    ]
  },
  {
    id: 'eetrust-intern',
    title: 'Intern Software Engineer',
    company: 'Beijing Eetrust Tech Co, ltd.',
    period: 'May 2022 - Aug 2022',
    type: 'Industry',
    description: 'Gained hands-on experience in full-stack development and financial technology solutions.',
    responsibilities: [
      'Developed robust logging systems for financial institutions, enhancing security and operational efficiency',
      'Engineered user-friendly service consoles and client interfaces with React and Node.js',
      'Implemented secure authentication and authorization mechanisms with OAuth for client access'
    ],
    technologies: ['React', 'Node.js', 'OAuth', 'Financial Systems']
  },
  {
    id: 'ccb-intern',
    title: 'Intern',
    company: 'China Construction Bank',
    period: 'Jun 2021 - Aug 2021',
    type: 'Finance',
    description: 'Gained valuable experience in financial services and organizational management.',
    responsibilities: [
      'Managed coordination and digitalization of departmental materials, improving resource deployment efficiency',
      'Analyzed personnel data, contributing to strategic workforce management planning',
      'Oversaw internal position transfers, ensuring operational continuity during departmental restructuring'
    ]
  }
];

export const skillCategories = {
  research: {
    name: 'Research',
    description: 'Cybersecurity, Network Security, Platform Analysis',
    icon: '🔬'
  },
  development: {
    name: 'Development',
    description: 'React, Node.js, Python, Full-Stack Development',
    icon: '💻'
  },
  teaching: {
    name: 'Teaching',
    description: 'Student Mentorship, Academic Support, Curriculum Development',
    icon: '🎓'
  },
  analysis: {
    name: 'Analysis',
    description: 'Data Analysis, Security Assessment, System Evaluation',
    icon: '📊'
  }
};
