export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  gpa?: string;
  status: string;
  focus: string;
  description: string;
  awards?: string[];
  activities?: string[];
}

export const educationData: Education[] = [
  {
    id: 'brown-ms',
    degree: "Master's Degree",
    institution: 'Brown University',
    period: '2024 - Present',
    status: 'Expected 2026',
    focus: 'AI, Security, and Systems',
    description: 'Currently pursuing advanced research in network security and cybersecurity, actively participating in research projects and academic conferences. Working on innovative solutions to modern security challenges in distributed systems.',
  },
  {
    id: 'udel-bs',
    degree: "Bachelor's Degree",
    institution: 'University of Delaware',
    period: '2020 - 2024',
    gpa: '3.95/4.00',
    status: 'Magna Cum Laude',
    focus: 'Cybersecurity',
    description: 'Completed a comprehensive Computer Science program with exceptional academic performance. Focused on cybersecurity research and participated in various research projects under distinguished faculty mentorship. Demonstrated leadership in academic and extracurricular activities.',
    awards: [
      'All Semesters Dean\'s List',
      '2022 Summer Scholar with Scholarship',
      '2022 CIS Undergraduate Honorable Mention',
      '2023 Summer Scholar with Scholarship',
      '2020 First Place, "Best in Show" Category for Product Design'
    ],
    activities: [
      'Peer Note Taker, Delta Alpha Pi'
    ]
  }
];
