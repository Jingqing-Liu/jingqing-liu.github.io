// Poster images
const poster1 = '/postrs/postr.png';
const poster2 = '/postrs/postr2.png';

export interface ResearchProject {
  id: string;
  title: string;
  title_zh?: string;
  advisor: string;
  advisor_zh?: string;
  detailsLink: string;
  keyPoints: string[];
  keyPoints_zh?: string[];
  poster?: string;
  showDetails: boolean;
}

export const researchProjects: ResearchProject[] = [
    {
        id: '1',
        title: 'Research and Testing of API Calls in WeChat',
        title_zh: '微信 API 调用研究与测试',
        advisor: 'Xing Gao (Assistant Professor, U Delaware)',
        advisor_zh: '高星（助理教授，特拉华大学）',
        detailsLink: '/research/1',
        keyPoints: ["Comprehensively examined WeChat's API system, focusing on its technical operation principles and associated security vulnerabilities",
            "Found the variability in API implementation across different operating systems, unauthorized exposure of system resources and discrepancies in permission settings, the threat of sub-window spoofing, and other security risks"
        ],
        keyPoints_zh: ["全面研究了微信的 API 系统，重点关注其技术运行原理和相关安全漏洞",
            "发现了不同操作系统间 API 实现的差异性、系统资源的未授权暴露和权限设置的不一致性、子窗口欺骗威胁及其他安全风险"
        ],
        showDetails: true,
    },
    {
        id: '2',
        title: "Invisible Threats in the Met-Averse: Roblox's Security Vulnerabilities",
        title_zh: '元宇宙中的隐形威胁：Roblox 的安全漏洞',
        advisor: 'Xing Gao (Assistant Professor, U Delaware)',
        advisor_zh: '高星（助理教授，特拉华大学）',
        poster: poster2,
        detailsLink: '/research/2',
        keyPoints: ["Explored how Roblox's infrastructure circumvents firewall restrictions; Found that Roblox can be manipulated by local malware to launch connections",
            "Found that Roblox's distributed computing resources can be used for resource-intensive tasks such as neural network training"
        ],
        keyPoints_zh: ["探索了 Roblox 基础设施如何绕过防火墙限制；发现 Roblox 可被本地恶意软件操纵以发起连接",
            "发现 Roblox 的分布式计算资源可被用于神经网络训练等资源密集型任务"
        ],
        showDetails: true,
    },
    {
        id: '3',
        title: 'Verification of Account Balances in the Bitcoin System Using Merkle Trees',
        title_zh: '基于 Merkle 树的比特币系统账户余额验证',
        advisor: 'Vipul Goyal (Professor, Carnegie Mellon University)',
        advisor_zh: 'Vipul Goyal（教授，卡内基梅隆大学）',
        detailsLink: '/research/3',
        keyPoints: ["Delved into the complex structure of the Bitcoin protocol, focusing on block architecture, node categorization, and transaction validation mechanisms",
            "Proposed an innovative solution that integrates the Merkle tree root of the UTXO set into the unused portion of the coinbase transaction input field, to address the challenges of verifying light node account balances",
            "Proposed a solution that allows light nodes to use Merkle proofs when verifying their account balances, thus improving accuracy and trust; Ensured the alignment with soft fork standards, incentivizing node upgrades while maintaining the integrity of the network"
        ],
        keyPoints_zh: ["深入研究了比特币协议的复杂结构，重点关注区块架构、节点分类和交易验证机制",
            "提出了将 UTXO 集的 Merkle 树根集成到 coinbase 交易输入字段未使用部分的创新方案，以解决轻节点账户余额验证的难题",
            "提出的方案允许轻节点在验证账户余额时使用 Merkle 证明，从而提高准确性和信任度；确保符合软分叉标准，激励节点升级同时维护网络完整性"
        ],
        showDetails: true,
    },
    {
        id: '4',
        title: 'GUI Development for Water Network Assessment and Simulation System',
        title_zh: '供水管网评估与仿真系统的图形用户界面开发',
        advisor: 'Sina Naeimi Dafchahi (Doctoral Candidate / Graduate Research Assistant, U Delaware)',
        advisor_zh: 'Sina Naeimi Dafchahi（博士研究生 / 研究助理，特拉华大学）',
        detailsLink: '/research/4',
        keyPoints: ["Developed a Graphic User Interface based on PyQT according to the research needs and the provided framework; Adopted a multiple window format",
            "Improved the existing user interface based on Python's own GUI module, Tkinter, by enhancing its outlook, usability, and scalability"
        ],
        keyPoints_zh: ["根据研究需求和提供的框架，基于 PyQT 开发了图形用户界面；采用多窗口格式",
            "改进了基于 Python 原生 GUI 模块 Tkinter 的现有用户界面，提升了外观、可用性和可扩展性"
        ],
        showDetails: true,
    },
    {
        id: '5',
        title: 'A Design of Router Firewall',
        title_zh: '路由器防火墙设计',
        advisor: 'Rui Zhang (Associate Prof., U Delaware)',
        advisor_zh: '张锐（副教授，特拉华大学）',
        poster: poster1,
        detailsLink: '/research/5',
        keyPoints: ["Conducted a survey with nearly 1000 respondents; Found that user errors caused most security breaches",
            "Designed a router-based firewall system that eliminates human operation errors and thus better protects users' computers from Viruses and illegal websites"
        ],
        keyPoints_zh: ["开展了近 1000 人参与的调查；发现用户操作失误是导致大多数安全漏洞的原因",
            "设计了基于路由器的防火墙系统，消除人为操作失误，从而更好地保护用户计算机免受病毒和非法网站的侵害"
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
