export interface Experience {
  id: string;
  title: string;
  title_zh?: string;
  company: string;
  company_zh?: string;
  supervisor?: string;
  supervisor_zh?: string;
  period: string;
  type: 'Research' | 'Academic' | 'Industry' | 'Finance';
  description: string;
  description_zh?: string;
  projects?: string[];
  projects_zh?: string[];
  achievements?: string[];
  achievements_zh?: string[];
  responsibilities?: string[];
  responsibilities_zh?: string[];
  technologies?: string[];
}

export const experienceData: Experience[] = [
  {
    id: 'twomoresteps-intern',
    title: 'Software Engineering Intern',
    title_zh: '软件工程实习生',
    company: 'TwoMoreSteps Educational Technology / Coding Minds Academy',
    company_zh: 'TwoMoreSteps 教育科技 / Coding Minds Academy',
    period: 'May 2025 - Aug 2025',
    type: 'Industry',
    description: 'Contributed to the development of comprehensive educational management platforms serving the global Chinese community with STEM and academic preparation courses. Gained deep exposure to educational technology solutions, full-stack development, and building systems that directly impact student learning outcomes in a multicultural educational environment.',
    description_zh: '参与开发面向全球华人社区的综合性教育管理平台，提供 STEM 和学术预备课程。深入接触教育科技解决方案、全栈开发，以及构建直接影响多元文化教育环境中学生学习成果的系统。',
    projects: [
      'ShareWorks - Comprehensive Learning Management System',
      'Multilingual Marketing Website',
      'Automated Communication Systems',
      'Payment Processing Integration'
    ],
    projects_zh: [
      'ShareWorks - 综合学习管理系统',
      '多语言营销网站',
      '自动化通讯系统',
      '支付处理集成'
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
    responsibilities_zh: [
      '架构并开发了支持多组织教育运营的综合学习管理系统',
      '使用 Node.js 和 LoopBack 框架配合 MongoDB 构建了健壮的后端 API，用于管理学生、教师、课程和注册流程',
      '基于 React 和 Material-UI 开发了管理后台和学生界面，提升用户体验',
      '实现了自动化数据分析和报告系统，用于追踪教育指标和组织绩效',
      '设计并实现了基于 JWT 的安全认证和授权机制',
      '开发了覆盖多个教育组织的学生、教师和管理员角色访问控制系统',
      '集成了 Stripe 支付处理系统，用于课程注册和账单管理',
      '使用 Twilio（短信）和 Mailgun（邮件）构建了自动化通知系统，用于课程更新和提醒',
      '开发了支持中英双语的模板化通讯系统',
      '使用 Jekyll 和 GitHub Pages 创建了响应式多语言营销网站'
    ],
    achievements: [
      'Successfully delivered a scalable educational management platform supporting multiple organizations and hundreds of users',
      'Implemented comprehensive data analytics dashboard providing real-time insights into educational operations',
      'Built multilingual support systems serving diverse global Chinese community educational needs',
      'Contributed to platform supporting various educational programs from K-12 tutoring to adult professional development'
    ],
    achievements_zh: [
      '成功交付了支持多组织和数百用户的可扩展教育管理平台',
      '实现了提供教育运营实时洞察的综合数据分析仪表板',
      '构建了服务全球华人社区多元教育需求的多语言支持系统',
      '为支持从 K-12 辅导到成人职业发展的各类教育项目做出贡献'
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
    title_zh: '研究员，X-Lab',
    company: 'University of Delaware',
    company_zh: '特拉华大学',
    supervisor: 'Dr. Xing Gao',
    supervisor_zh: '高星博士',
    period: 'Jun 2023 - Dec 2023',
    type: 'Research',
    description: 'Conducted cutting-edge research in cybersecurity and network security under the supervision of Dr. Xing Gao.',
    description_zh: '在高星博士指导下，开展网络安全与信息安全前沿研究。',
    projects: [
      'Research and Testing of API Calls in WeChat',
      'Invisible Threats in the Met-Averse: Roblox\'s Security Vulnerabilities'
    ],
    projects_zh: [
      '微信 API 调用研究与测试',
      '元宇宙中的隐形威胁：Roblox 的安全漏洞'
    ],
    achievements: [
      'Published research findings on WeChat API security vulnerabilities',
      'Identified critical security flaws in Roblox\'s infrastructure',
      'Developed innovative testing methodologies for platform security assessment'
    ],
    achievements_zh: [
      '发表了关于微信 API 安全漏洞的研究成果',
      '发现了 Roblox 基础设施中的关键安全缺陷',
      '开发了用于平台安全评估的创新测试方法'
    ]
  },
  {
    id: 'teaching-assistant',
    title: 'Student Teaching Assistant',
    title_zh: '学生助教',
    company: 'University of Delaware',
    company_zh: '特拉华大学',
    period: 'Feb 2022 - Dec 2022',
    type: 'Academic',
    description: 'Supported mathematics and computer science education through teaching assistance and student mentorship.',
    description_zh: '通过助教和学生辅导支持数学和计算机科学教学。',
    responsibilities: [
      'Facilitated weekly exam review sessions, enhancing students\' understanding and performance in mathematics',
      'Led lab sessions to reinforce computer science concepts, assisting students in practical application of theoretical knowledge',
      'Provided individual guidance during office hours, resolving student queries',
      'Contributed to grading and feedback processes for assignments, improving educational outcomes for a diverse student body'
    ],
    responsibilities_zh: [
      '组织每周考试复习课，提升学生对数学的理解和成绩',
      '主持实验课，巩固计算机科学概念，帮助学生将理论知识应用于实践',
      '在答疑时间提供个别辅导，解答学生疑问',
      '参与作业评分和反馈工作，为多元化的学生群体改善教学成果'
    ]
  },
  {
    id: 'eetrust-intern',
    title: 'Software Engineer Intern ',
    title_zh: '软件工程实习生',
    company: 'Beijing Eetrust Tech Co, ltd.',
    company_zh: '北京时代亿信科技股份有限公司',
    period: 'May 2022 - Aug 2022',
    type: 'Industry',
    description: 'Gained hands-on experience in full-stack development and financial technology solutions.',
    description_zh: '在全栈开发和金融科技解决方案领域积累了实践经验。',
    responsibilities: [
      'Developed robust logging systems for financial institutions, enhancing security and operational efficiency',
      'Engineered user-friendly service consoles and client interfaces with React and Node.js',
      'Implemented secure authentication and authorization mechanisms with OAuth for client access'
    ],
    responsibilities_zh: [
      '为金融机构开发了健壮的日志系统，提升了安全性和运营效率',
      '使用 React 和 Node.js 开发了用户友好的服务控制台和客户端界面',
      '实现了基于 OAuth 的安全认证和授权机制'
    ],
    technologies: ['React', 'Node.js', 'OAuth', 'Financial Systems']
  },
  {
    id: 'ccb-intern',
    title: 'Human Resources Intern',
    title_zh: '人力资源实习生',
    company: 'China Construction Bank',
    company_zh: '中国建设银行',
    period: 'Jun 2021 - Aug 2021',
    type: 'Finance',
    description: 'Gained valuable experience in financial services and organizational management.',
    description_zh: '在金融服务和组织管理领域积累了宝贵经验。',
    responsibilities: [
      'Managed coordination and digitalization of departmental materials, improving resource deployment efficiency',
      'Analyzed personnel data, contributing to strategic workforce management planning',
      'Oversaw internal position transfers, ensuring operational continuity during departmental restructuring'
    ],
    responsibilities_zh: [
      '管理部门资料的协调与数字化，提高了资源调配效率',
      '分析人事数据，为战略人力资源管理规划做出贡献',
      '监管内部岗位调动，确保部门重组期间的运营连续性'
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
