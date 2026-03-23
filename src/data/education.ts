export interface AwardItem {
  title: string;
  title_zh?: string;
  year: number;
}

export interface Education {
  id: string;
  degree: string;
  degree_zh?: string;
  institution: string;
  institution_zh?: string;
  period: string;
  gpa?: string;
  status?: string;
  status_zh?: string;
  degreeType?: string;
  degreeType_zh?: string;
  major?: string;
  major_zh?: string;
  focus: string;
  focus_zh?: string;
  description: string;
  description_zh?: string;
  awards?: AwardItem[];
  activities?: string[];
  activities_zh?: string[];
}

export const educationData: Education[] = [
  {
    id: 'brown-ms',
    degree: "Master's Degree",
    degree_zh: '硕士学位',
    degreeType: 'Master of Science',
    degreeType_zh: '理学硕士',
    major: 'Computer Science',
    major_zh: '计算机科学',
    institution: 'Brown University',
    institution_zh: '布朗大学',
    period: '2024 - 2026',
    gpa: '4.00/4.00',
    focus: 'AI, Security, and Systems',
    focus_zh: '人工智能、安全与系统',
    description: 'Currently pursuing advanced research in network security and cybersecurity, actively participating in research projects and academic conferences. Working on innovative solutions to modern security challenges in distributed systems.',
    description_zh: '目前专注于网络安全与信息安全的前沿研究，积极参与科研项目和学术会议。致力于解决分布式系统中的现代安全挑战，开发创新解决方案。',
  },
  {
    id: 'udel-bs',
    degree: "Bachelor's Degree",
    degree_zh: '学士学位',
    degreeType: 'Bachelor of Science',
    degreeType_zh: '理学学士',
    major: 'Computer Science',
    major_zh: '计算机科学',
    institution: 'University of Delaware',
    institution_zh: '特拉华大学',
    period: '2020 - 2024',
    gpa: '3.95/4.00',
    status: 'Magna Cum Laude',
    status_zh: '优等毕业',
    focus: 'Cybersecurity',
    focus_zh: '网络安全',
    description: 'Completed a comprehensive Computer Science program with exceptional academic performance. Focused on cybersecurity research and participated in various research projects under distinguished faculty mentorship. Demonstrated leadership in academic and extracurricular activities.',
    description_zh: '以优异成绩完成计算机科学课程体系。专注于网络安全研究，在多位杰出教授指导下参与多项科研项目。在学术和课外活动中展现出卓越的领导力。',
    awards: [
      { title: 'All Semesters Dean\'s List', title_zh: '全学期院长名单', year: 2024 },
      { title: 'Summer Scholar with Scholarship', title_zh: '暑期学者（含奖学金）', year: 2023 },
      { title: 'Summer Scholar with Scholarship', title_zh: '暑期学者（含奖学金）', year: 2022 },
      { title: 'CIS Undergraduate Honorable Mention', title_zh: 'CIS 本科生荣誉提名', year: 2022 },
      { title: 'First Place, "Best in Show" Category for Product Design', title_zh: '产品设计 "Best in Show" 类别第一名', year: 2020 },
    ],
    activities: [
      'Peer Note Taker, Delta Alpha Pi'
    ],
    activities_zh: [
      '同伴笔记员，Delta Alpha Pi 荣誉协会'
    ]
  }
];
