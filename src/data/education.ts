export interface AwardItem {
  title: string;
  year: number;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  gpa?: string;
  status?: string;
  degreeType?: string;
  major?: string;
  focus: string;
  description: string;
  awards?: AwardItem[];
  activities?: string[];
}

export const educationData: Education[] = [
  {
    id: 'brown-ms',
    degree: "Master's Degree",
    degreeType: 'Master of Science',
    major: 'Computer Science',
    institution: 'Brown University',
    period: '2024 - 2026',
    gpa: '4.00/4.00',
    focus: 'AI, Security, and Systems',
    description: 'Currently pursuing advanced research in network security and cybersecurity, actively participating in research projects and academic conferences. Working on innovative solutions to modern security challenges in distributed systems.',
  },
  {
    id: 'udel-bs',
    degree: "Bachelor's Degree",
    degreeType: 'Bachelor of Science',
    major: 'Computer Science',
    institution: 'University of Delaware',
    period: '2020 - 2024',
    gpa: '3.95/4.00',
    status: 'Magna Cum Laude',
    focus: 'Cybersecurity',
    description: 'Completed a comprehensive Computer Science program with exceptional academic performance. Focused on cybersecurity research and participated in various research projects under distinguished faculty mentorship. Demonstrated leadership in academic and extracurricular activities.',
    awards: [
      { title: 'All Semesters Dean\'s List', year: 2024 },
      { title: 'Summer Scholar with Scholarship', year: 2023 },
      { title: 'Summer Scholar with Scholarship', year: 2022 },
      { title: 'CIS Undergraduate Honorable Mention', year: 2022 },
      { title: 'First Place, "Best in Show" Category for Product Design', year: 2020 },
    ],
    activities: [
      'Peer Note Taker, Delta Alpha Pi'
    ]
  }
];
