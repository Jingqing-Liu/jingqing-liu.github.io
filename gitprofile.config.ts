// gitprofile.config.ts

const CONFIG = {
  github: {
    username: 'Jingqing-Liu', // Your GitHub org/user name. (This is the only required config)
  },
  /**
   * If you are deploying to https://<USERNAME>.github.io/, for example your repository is at https://github.com/arifszn/arifszn.github.io, set base to '/'.
   * If you are deploying to https://<USERNAME>.github.io/<REPO_NAME>/,
   * for example your repository is at https://github.com/arifszn/portfolio, then set base to '/portfolio/'.
   */
  base: '/',
  projects: {
    github: {
      display: true, // Display GitHub projects?
      header: 'Github Projects',
      mode: 'automatic', // Mode can be: 'automatic' or 'manual'
      automatic: {
        sortBy: 'updated', // Sort projects by 'stars' or 'updated'
        limit: 4, // How many projects to display.
        exclude: {
          forks: false, // Forked projects will not be displayed if set to true.
          projects: [], // These projects will not be displayed. example: ['arifszn/my-project1', 'arifszn/my-project2']
        },
      },
      manual: {
        // Properties for manually specifying projects
        projects: ['arifszn/gitprofile', 'arifszn/pandora'], // List of repository names to display. example: ['arifszn/my-project1', 'arifszn/my-project2']
      },
    },
    external: {
      header: 'My Researches',
      // To hide the `External Projects` section, keep it empty.
      projects: [
        {
          title: 'Research and Testing of API Calls in WeChat',
          time: '06/2023 - 12/2023',
          mentor:
            'X-Lab of Dr. Xing Gao | Advisor: Xing Gao (Assistant Professor, U Delaware)',
          description:
            "※ Comprehensively examined WeChat's API system, focusing on its technical operation principles and associated security vulnerabilities.\n ※ Found the variability in API implementation across different operating systems, unauthorized exposure of system resources and discrepancies in permission settings, the threat of sub-window spoofing, and other security risks. ",
          // imageUrl:
          //   'https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg',
          // link: 'https://xgao-work.github.io/members.html',
        },
        {
          title:
            'Invisible Threats in the Met-Averse: Roblox’s Security Vulnerabilities',
          time: '06/2023 - 12/2023',
          mentor:
            'X-Lab of Dr. Xing Gao | Advisor: Xing Gao (Assistant Professor, U Delaware)',
          description:
            '※ Explored how Roblox’s infrastructure circumvents firewall restrictions; Found that Roblox can be manipulated by local malware to launch connections.\n ※ Found that Roblox’s distributed computing resources can be used for resource-intensive tasks such as neural network training. ',
          link: 'https://www.urp.udel.edu/summer-sym-pres/invisible-threats-in-the-met-averse-investigating-robloxs-security-vulnerabilities/',
        },
        {
          title:
            'Verification of Account Balances in the Bitcoin System Using Merkle Trees',
          time: '2023 Summer',
          mentor:
            'Advisor: Vipul Goyal (Professor, Carnegie Mellon University)',
          description:
            '※ Delved into the complex structure of the Bitcoin protocol, focusing on block architecture, node categorization, and transaction validation mechanisms.\n ※ Proposed an innovative solution that integrates the Merkle tree root of the UTXO set into the unused portion of the coinbase transaction input field, to address the challenges of verifying light node account balances. \n ※ Proposed a solution that allows light nodes to use Merkle proofs when verifying their account balances, thus improving accuracy and trust; Ensured the alignment with soft fork standards, incentivizing node upgrades while maintaining the integrity of the network. ',
          // link: 'https://www.urp.udel.edu/summer-sym-pres/invisible-threats-in-the-met-averse-investigating-robloxs-security-vulnerabilities/',
        },
        {
          title: 'A Design of Router Firewall',
          time: '2022 Summer',
          mentor: 'Advisor: Rui Zhang (Associate Prof., U Delaware)',
          description:
            '※ Conducted a survey with nearly 1000 respondents; Found that user errors caused most security breaches.\n ※ Designed a router-based firewall system that eliminates human operation errors and thus better protects users’ computers from Viruses and illegal websites. ',
          // link: 'https://www.urp.udel.edu/summer-sym-pres/invisible-threats-in-the-met-averse-investigating-robloxs-security-vulnerabilities/',
        },
      ],
    },
  },
  seo: {
    title: 'Portfolio of Jingqing Liu',
    description: '',
    imageURL: '',
  },
  social: {
    linkedin: 'jingqing-liu',
    instagram: '',
    website: 'https://jingqing-liu.github.io',
    phone: '+1 978-568-7206',
    email: 'jingqing@udel.edu',
  },
  resume: {
    fileUrl:
      'https://github.com/Jingqing-Liu/jingqing-liu.github.io/blob/main/public/CV-JingqingLiu.pdf', // Empty fileUrl will hide the `Download Resume` button.
  },
  skills: ['JavaScript', 'React', 'Git', 'Docker', 'CSS', 'C++', 'Python'],
  experiences: [
    {
      company: 'University of Delaware',
      position:
        'Student Teaching Assistants Mathematics Department and Computer Science Department',
      from: 'Feb 2022',
      to: 'Dec 2022',
      // companyLink: 'https://example.com',
    },
    {
      company: 'Beijing Eetrust Tech Co, ltd.',
      position: 'Intern Software Engineer Research and Development Department',
      from: 'May 2022',
      to: 'Aug 2022',
      // companyLink: 'https://example.com',
    },
    {
      company: 'China Construction Bank',
      position: 'Intern Human Resource Department',
      from: 'Jun 2021',
      to: 'Aug 2021',
      // companyLink: 'https://example.com',
    },
  ],
  // certifications: [
  //   {
  //     name: 'Lorem ipsum',
  //     body: 'Lorem ipsum dolor sit amet',
  //     year: 'March 2022',
  //     link: 'https://example.com',
  //   },
  // ],
  educations: [
    {
      institution: 'Brown University',
      degree: 'Computer Science Master of Science',
      from: 'Sep 2024',
      to: 'Jun 2026',
    },
    {
      institution: 'University of Delaware',
      degree: 'Computer Science Cybersecurity Bachelor of Science',
      from: 'Sep 2020',
      to: 'Dec 2023',
    },
  ],
  publications: [
    {
      title:
        'Enhancing Network Security Through Router-Based Firewalls: An Investigation into Design, Effectiveness, and Human Factors',
      conferenceName: '',
      journalName:
        '2023 5th International Conference on Computer Science and Intelligent Communication (CSIC 2023)',
      authors: 'Jingqing Liu',
      link: 'https://drpress.org/ojs/index.php/HSET/article/view/18476',
      description: `A firewall serves as a crucial computer program designed to block malicious software, thereby safeguarding the user's system. It helps prevent the unauthorized dissemination of personal information and the incursion of harmful viruses. Taking inspiration from China's "Great Firewall"—a sophisticated system utilizing advanced software and hardware to automatically filter, censor, and monitor internet content—this research aims to devise a router-based firewall system capable of autonomously shielding users' computers from viruses and unauthorized websites.`,
    },
  ],
  // Display articles from your medium or dev account. (Optional)
  blog: {
    source: 'dev', // medium | dev
    username: 'arifszn', // to hide blog section, keep it empty
    limit: 2, // How many articles to display. Max is 10.
  },
  googleAnalytics: {
    id: '', // GA3 tracking id/GA4 tag id UA-XXXXXXXXX-X | G-XXXXXXXXXX
  },
  // Track visitor interaction and behavior. https://www.hotjar.com
  hotjar: {
    id: '',
    snippetVersion: 6,
  },
  themeConfig: {
    defaultTheme: 'winter',

    // Hides the switch in the navbar
    // Useful if you want to support a single color mode
    disableSwitch: false,

    // Should use the prefers-color-scheme media-query,
    // using user system preferences, instead of the hardcoded defaultTheme
    respectPrefersColorScheme: false,

    // Display the ring in Profile picture
    displayAvatarRing: true,

    // Available themes. To remove any theme, exclude from here.
    themes: [
      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter',
      'dim',
      'nord',
      'sunset',
      'procyon',
    ],

    // Custom theme, applied to `procyon` theme
    customTheme: {
      primary: '#fc055b',
      secondary: '#219aaf',
      accent: '#e8d03a',
      neutral: '#2A2730',
      'base-100': '#E3E3ED',
      '--rounded-box': '3rem',
      '--rounded-btn': '3rem',
    },
  },

  // Optional Footer. Supports plain text or HTML.
  footer: `Made with <a 
      class="text-primary" href="https://github.com/arifszn/gitprofile"
      target="_blank"
      rel="noreferrer"
    >GitProfile</a> and ❤️`,

  enablePWA: true,
};

export default CONFIG;
