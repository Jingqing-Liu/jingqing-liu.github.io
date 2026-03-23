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
    id: 'twomoresteps-intern',
    title: 'Software Engineering Intern',
    company: 'TwoMoreSteps Educational Technology / Coding Minds Academy',
    period: 'May 2025 - Aug 2025',
    type: 'Industry',
    description: 'Contributed to the development of comprehensive educational management platforms serving the global Chinese community with STEM and academic preparation courses. Gained deep exposure to educational technology solutions, full-stack development, and building systems that directly impact student learning outcomes in a multicultural educational environment.',
    projects: [
      'ShareWorks - Comprehensive Learning Management System',
      'Multilingual Marketing Website',
      'Automated Communication Systems',
      'Payment Processing Integration'
    ],
    responsibilities: [
      'Architected and developed a comprehensive learning management system supporting multi-organization educational operations',
      'Built robust backend APIs using Node.js and LoopBack framework with MongoDB for managing students, instructors, courses, and enrollment workflows',
      'Engineered React-based administrative dashboards and student interfaces with Material-UI for enhanced user experience',
      'Implemented automated data analytics and reporting systems for tracking educational metrics and organizational performance',
      'Designed and implemented secure JWT-based authentication and authorization mechanisms',
      'Developed role-based access control for students, instructors, and administrators across multiple educational organizations',
      'Integrated payment processing systems using Stripe for course enrollment and billing management',
      'Built automated notification systems using Twilio (SMS) and Mailgun (email) for course updates and reminders',
      'Developed template-based communication systems supporting both English and Chinese languages',
      'Created responsive, multilingual marketing website using Jekyll and GitHub Pages for company branding'
    ],
    achievements: [
      'Successfully delivered a scalable educational management platform supporting multiple organizations and hundreds of users',
      'Implemented comprehensive data analytics dashboard providing real-time insights into educational operations',
      'Built multilingual support systems serving diverse global Chinese community educational needs',
      'Contributed to platform supporting various educational programs from K-12 tutoring to adult professional development'
    ],
    technologies: [
      'React', 'Material-UI', 'JavaScript (ES6+)', 'HTML5', 'CSS3',
      'Node.js', 'LoopBack', 'Express.js', 'RESTful APIs',
      'MongoDB', 'JWT', 'OAuth',
      'AWS (ECS, S3)', 'Heroku',
      'Stripe API', 'Twilio SMS API', 'Mailgun Email API',
      'Docker', 'Git', 'ESLint', 'Webpack',
      'Azure AI Text Analytics', 'Jekyll', 'GitHub Pages'
    ]
  },
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
    title: 'Software Engineer Intern ',
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
    title: 'Human Resources Intern',
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
