export interface PersonalInfo {
  name: string;
  title: string;
  description: string;
  email: string;
  office: string;
  linkedin: string;
  github: string;
  address: {
    room: string;
    institution: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const personalInfo: PersonalInfo = {
  name: 'Jingqing Liu',
  title: 'Master of Computer Science at Brown University',
  description: 'Specializing in Network Security and Cybersecurity Research',
  email: 'jingqing_liu@brown.edu',
  office: 'Arnold Lab Room 317, Brown University',
  linkedin: 'https://www.linkedin.com/in/jingqing-liu',
  github: 'https://github.com/Jingqing-Liu',
  address: {
    room: 'Arnold Lab Room 317',
    institution: 'Brown University',
    city: 'Providence',
    state: 'RI',
    zipCode: '02912',
    country: 'United States',
  },
};
