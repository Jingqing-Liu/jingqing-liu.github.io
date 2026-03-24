export interface PersonalInfo {
  name: string;
  name_zh: string;
  title: string;
  title_zh?: string;
  description: string;
  email: string;
  office: string;
  linkedin: string;
  github: string;
  address: {
    room: string;
    institution: string;
    institution_zh?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const personalInfo: PersonalInfo = {
  name: 'Jingqing Liu',
  name_zh: '柳景清',
  title: 'Master of Computer Science',
  title_zh: '计算机科学硕士',
  description: 'Specializing in Network Security and Cybersecurity Research',
  email: 'jingqing_liu@brown.edu',
  office: 'Arnold Lab Room 317, Brown University',
  linkedin: 'https://www.linkedin.com/in/jingqing-liu',
  github: 'https://github.com/Jingqing-Liu',
  address: {
    room: 'Arnold Lab Room 317',
    institution: 'Brown University',
    institution_zh: '布朗大学',
    city: 'Providence',
    state: 'RI',
    zipCode: '02912',
    country: 'United States',
  },
};
