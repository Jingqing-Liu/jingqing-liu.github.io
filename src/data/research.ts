// Poster images
const poster1 = '/postrs/postr.png';
const poster2 = '/postrs/postr2.png';

export interface ResearchProject {
  id: string;
  title: string;
  advisor: string;
  detailsLink: string;
  keyPoints: string[];
  poster?: string;
  showDetails: boolean;
}

export const researchProjects: ResearchProject[] = [
    {
        id: '1',
        title: 'Research and Testing of API Calls in WeChat',
        advisor: 'Xing Gao (Assistant Professor, U Delaware)',
        detailsLink: '/research/1',
        keyPoints: ["Comprehensively examined WeChat's API system, focusing on its technical operation principles and associated security vulnerabilities", 
            "Found the variability in API implementation across different operating systems, unauthorized exposure of system resources and discrepancies in permission settings, the threat of sub-window spoofing, and other security risks"
        ],
        showDetails: true,
    },
    {
        id: '2',
        title: "Invisible Threats in the Met-Averse: Roblox's Security Vulnerabilities",
        advisor: 'Xing Gao (Assistant Professor, U Delaware)',
        poster: poster2,
        detailsLink: '/research/2',
        keyPoints: ["Explored how Roblox's infrastructure circumvents firewall restrictions; Found that Roblox can be manipulated by local malware to launch connections", 
            "Found that Roblox's distributed computing resources can be used for resource-intensive tasks such as neural network training"
        ],
        showDetails: true,
    },
    {
        id: '3',
        title: 'Verification of Account Balances in the Bitcoin System Using Merkle Trees',
        advisor: 'Vipul Goyal (Professor, Carnegie Mellon University)',
        detailsLink: '/research/3',
        keyPoints: ["Delved into the complex structure of the Bitcoin protocol, focusing on block architecture, node categorization, and transaction validation mechanisms",
            "Proposed an innovative solution that integrates the Merkle tree root of the UTXO set into the unused portion of the coinbase transaction input field, to address the challenges of verifying light node account balances",
            "Proposed a solution that allows light nodes to use Merkle proofs when verifying their account balances, thus improving accuracy and trust; Ensured the alignment with soft fork standards, incentivizing node upgrades while maintaining the integrity of the network"
        ],
        showDetails: true,
    },
    {
        id: '4',
        title: 'GUI Development for Water Network Assessment and Simulation System',
        advisor: 'Sina Naeimi Dafchahi (Doctoral Candidate / Graduate Research Assistant, U Delaware)',
        detailsLink: '/research/4',
        keyPoints: ["Developed a Graphic User Interface based on PyQT according to the research needs and the provided framework; Adopted a multiple window format",
            "Improved the existing user interface based on Python's own GUI module, Tkinter, by enhancing its outlook, usability, and scalability"
        ],
        showDetails: true,
    },
    {
        id: '5',
        title: 'A Design of Router Firewall',
        advisor: 'Rui Zhang (Associate Prof., U Delaware)',
        poster: poster1,
        detailsLink: '/research/5',
        keyPoints: ["Conducted a survey with nearly 1000 respondents; Found that user errors caused most security breaches",
            "Designed a router-based firewall system that eliminates human operation errors and thus better protects users' computers from Viruses and illegal websites"
        ],
        showDetails: true,
    },
];

export const researchCategories = {
  security: {
    name: 'Network Security',
    description: 'Investigating vulnerabilities in modern network protocols and developing innovative security solutions',
    icon: '🔐'
  },
  blockchain: {
    name: 'Blockchain Security',
    description: 'Exploring cryptographic methods and consensus mechanisms to enhance blockchain system security',
    icon: '⛓️'
  },
  platform: {
    name: 'Platform Security',
    description: 'Analyzing security vulnerabilities in popular platforms and applications',
    icon: '🎮'
  },
  network: {
    name: 'Network Systems',
    description: 'Research in distributed systems and network infrastructure',
    icon: '🌐'
  },
  gui: {
    name: 'User Interface',
    description: 'Development of user-friendly interfaces for complex systems',
    icon: '🖥️'
  }
};
