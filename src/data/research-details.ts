// Poster images
const poster1 = '/postrs/postr.png';
const poster2 = '/postrs/postr2.png';

export interface ResearchDetailSection {
  subtitle: string;
  paragraphs: string[];
}

export interface ResearchDetailType {
  title: string;
  advisor?: string;
  abstract: ResearchDetailSection[];
  poster?: string;
}

export const researchDetails: { [key: string]: ResearchDetailType } = {
    'Research-and-Testing-of-API-Calls-in-WeChat': {
        title: 'Research and Testing of API Calls in WeChat',
        advisor: 'Advisor: Xing Gao (Assistant Professor, U Delaware)',
        abstract: [
            {
                subtitle: 'Architectural Overview',
                paragraphs: [
                    'WeChat\'s architecture comprises a subapplication tier for storage and a subapplication runtime, which connects JavaScript API calls to the host application\'s native tier (Java for Android, Objective-C for iOS). This structure aims to facilitate seamless integration and resource access while enforcing native permissions.',
                ],
            },
            {
                subtitle: 'Comparison with Traditional Apps',
                paragraphs: [
                    'Unlike traditional app frameworks and sandboxes, WeChat establishes its own API system for subapplications, offering direct access to system resources. This unique approach raises significant differences in API management, particularly regarding installation requirements, background operations, cross-platform functionality, and review processes before deployment.',
                ],
            },
            {
                subtitle: 'Security Concerns',
                paragraphs: [
                    'The study identifies several API discrepancies that pose security risks:',
                    'System Resource Exposure: Inconsistencies in permission requirements between sub-app APIs and system APIs can lead to unauthorized access to sensitive system resources. For example, the wx.getWifiList API exposes user location through WiFi scan capabilities without adequate permission checks.',
                    'Sub-window Deception: Malicious sub-apps can display fake UIs to deceive users into providing sensitive information, such as wallet passwords, mimicking legitimate interfaces like those of Facebook or payment gateways.',
                    'Sub-app Lifecycle Hijacking: Sub-applications on WeChat can exploit task management processes on mobile devices, silently recycling tasks to remain active beyond intended limits, particularly on iOS and Android platforms.',
                    'Exploiting API Permission Discrepancies: Mini-apps can bypass permission restrictions to collect user data, track locations, eavesdrop on conversations, and capture photos or videos stealthily. This is facilitated by APIs like wx.getLocation, wx.startRecord, and wx.createCameraContext.',
                    'Fingerprinting Attacks: Malicious mini-apps can use APIs such as wx.getSystemInfo to collect device-specific information and create unique fingerprints, enabling cross-device tracking and user behavior monitoring.',
                    'Misleading Documentation: WeChat\'s API documentation exhibits discrepancies between languages, leading to potential misunderstandings about API restrictions and capabilities, as observed with wx.getLocation.',
                ],
            },
            {
                subtitle: 'Conclusion',
                paragraphs: [
                    'The findings highlight significant security vulnerabilities arising from API differences across platforms and devices. These discrepancies can be exploited for malicious purposes, including user tracking and data theft. Ensuring a secure and consistent environment for API execution within WeChat\'s mini-programs is crucial to mitigate these risks and protect user privacy.',
                ],
            },
            {
                subtitle: 'Keywords',
                paragraphs: [
                    'WeChat, mini-programs, API security, system architecture, cross-platform, user privacy, mobile security.',
                ],
            },
        ],

    },
    "Invisible-Threats-in-the-Met-Averse:-Roblox's-Security-Vulnerabilities": {
        title: "Invisible Threats in the Met-Averse: Roblox's Security Vulnerabilities",
        abstract: [
            {
                subtitle: '',
                paragraphs: [
                    "Meta-universe gaming, represented by platforms such as Roblox, is at the forefront of the gaming industry. These platforms provide a virtual world that offers users an engaging experience that can be created and interacted with on demand. Despite these platforms' tremendous progress, they are still susceptible to malicious exploitation, posing severe security concerns.",
                    "Roblox is one of the leading meta-universe gaming platforms, and this study explores its security vulnerabilities. The study highlights how Roblox's infrastructure circumvents firewall restrictions, providing a hidden route for unauthorized network communication. This study also explores the possibility of misusing Roblox's distributed resources for cost-effective neural network training. These malicious activities can then be hidden from normal gaming activities without the user's awareness, unknowingly causing unintended harm.",
                    "The investigation uncovered two noteworthy vulnerabilities. First, Roblox can indeed be manipulated by local malware to launch connections or open web pages in-game, thereby bypassing traditional security measures. Second, Roblox's distributed computing resources can be used for resource-intensive tasks such as neural network training. Given Roblox's relatively young user base, this exposed vulnerability could have a particularly damaging impact, potentially spreading harmful information or links that could threaten user security.",
                    "This study emphasizes that metaverse gaming platforms, especially those targeting younger audiences, need to adopt strong security measures and must continuously improve them to ensure a safe gaming environment, prevent misuse of the platform's computational resources and disseminate potentially harmful content to protect users, especially children, from potential harm. Finally, we propose several policies for metaverse gaming platforms to protect their valuable computing resources from malicious exploitation.",
                ],
            },
        ],
        poster: poster2,
    },
    'Verification-of-Account-Balances-in-the-Bitcoin-System-Using-Merkle-Trees': {
        title: 'Verification of Account Balances in the Bitcoin System Using Merkle Trees',
        advisor: 'Vipul Goyal (Professor, Carnegie Mellon University)',
        abstract: [
            {
                subtitle: '',
                paragraphs: [
                    "This study investigates the intricate structure of the Bitcoin protocol, focusing on block architecture, node classification, and transaction validation mechanisms. The primary challenge addressed is the difficulty light nodes face in verifying account balances using current Bitcoin practices. The research proposes an innovative solution that incorporates the Merkle tree root of the UTXO set into the unused portion of the coinbase transaction input field. This integration allows light nodes to leverage Merkle proofs for verifying account balances, enhancing accuracy and trust within the network. The proposed changes adhere to soft fork standards, encouraging node upgrades while preserving network integrity.",
                ],
            },
            {
                subtitle: 'Introduction',
                paragraphs: [
                    "Bitcoin revolutionized digital finance with its decentralized system grounded in cryptographic principles. Despite the security and transparency provided by its protocol, Bitcoin faces challenges, particularly in node-light transaction validation. This study examines the block structure, node types, and validation methods within the Bitcoin protocol to address the issue of light nodes being unable to independently verify account balances. An innovative solution is proposed to bridge the trust gap while maintaining decentralization.",
                ],
            },
            {
                subtitle: 'Previous Work',
                paragraphs: [
                    "To develop the proposed solution, a comprehensive review of the Bitcoin protocol was conducted. Key findings include:",
                    "Block Structure: Bitcoin blocks consist of a header and body. The header contains crucial data, including the Merkle root, ensuring transaction integrity. The body, significantly larger, records transaction information.",
                    "Node Classification: Bitcoin nodes are categorized as full or light nodes. Full nodes store the entire blockchain and perform comprehensive verification tasks, whereas light nodes store only block headers and partial transaction data, utilizing Merkle trees for transaction verification.",
                    "Merkle Trees and Proofs: Merkle trees store transaction information in a hierarchical hash structure, enabling light nodes to verify transactions using Merkle proofs provided by full nodes.",
                    "UTXO Set: The UTXO set represents unspent transaction outputs, maintained by full nodes and essential for verifying account balances.",
                ],
            },
            {
                subtitle: 'Approach',
                paragraphs: [
                    "The proposed solution involves using the input field of coinbase transactions to store the Merkle root of the UTXO set. This allows light nodes to verify account balances through a two-layer Merkle proof process. The inner layer verifies the UTXO Merkle tree, while the outer layer verifies the entire block's Merkle tree.",
                    "Innovation: By organizing the UTXO set into a Merkle tree and storing its root in the coinbase transaction's input, light nodes can independently verify their account balances using Merkle proofs.",
                    "Implementation: Light nodes request a Merkle proof from full nodes, including transaction details and hash values. The light node calculates the Merkle root and compares it with the stored root, ensuring transaction validity.",
                    "Protocol Enhancement: The proposed changes constitute a soft fork, as they modify the coinbase transaction input field. This incentivizes nodes to upgrade their protocols, ensuring widespread adoption.",
                ],
            },
            {
                subtitle: 'Conclusion',
                paragraphs: [
                    "The study proposes utilizing the unused portion of the coinbase transaction input field to include the UTXO Merkle tree root. This enables light nodes to verify account balances using Merkle proofs, enhancing trust and accuracy in the Bitcoin network. The protocol changes align with soft fork standards, incentivizing node upgrades and maintaining network integrity.",
                ],
            },
            {
                subtitle: 'Keywords',
                paragraphs: [
                    'Bitcoin, Merkle trees, light nodes, UTXO, transaction verification, soft fork, blockchain security',
                ],
            }
        ],
    },
    'A-Design-of-Router-Firewall': {
        title: 'A Design of Router Firewall',
        advisor: 'Rui Zhang (Associate Prof., U Delaware)',
        abstract: [
            {
                subtitle: 'Router Firewall: An Essential Tool for Network Security',
                paragraphs: [
                    "This research examines the critical role of router firewalls in ensuring network security for both personal and organizational environments. Firewalls act as a combination of hardware and software that isolate internal networks from the internet, allowing selective packet transmission while blocking potentially harmful data. This study focuses on various aspects of firewalls, including their architecture, functionalities, and future development prospects.",
                ],
            },
            {
                subtitle: 'Background and Functionality',
                paragraphs: [
                    "Firewalls serve multiple purposes, such as protecting personal computers from malware and enabling governments to filter and monitor internet content for political reasons. This dual function underscores the importance of firewalls in maintaining both individual and national security. The study explores the architecture of firewalls, highlighting their evolution and the necessity for continuous upgrades to combat emerging threats.",
                ],
            },
            {
                subtitle: 'Analysis of the Great Firewall',
                paragraphs: [
                    "The Great Firewall of China (GFW) exemplifies a sophisticated combination of software and hardware used to censor and monitor internet content. The GFW employs various blocking methods, including DNS pollution, IP route hijacking, and deep packet inspection, to control the information flow. This section provides a detailed analysis of the GFW's operational mechanisms and its impact on internet freedom.",
                ],
            },
            {
                subtitle: 'User Interaction and Security Measures',
                paragraphs: [
                    "A survey conducted as part of this study reveals common user practices and attitudes towards firewalls. The findings indicate a significant gap in user knowledge and the proper utilization of firewalls, contributing to security breaches. The study emphasizes the importance of user education and the implementation of robust security protocols to mitigate human errors, which account for a substantial portion of data breaches.",
                ],
            },
            {
                subtitle: 'Advantages and Disadvantages of Router Firewalls',
                paragraphs: [
                    "Router firewalls offer several advantages over software-based firewalls, such as minimizing human error, blocking viruses before they enter the network, and not being susceptible to tampering like software firewalls. However, router firewalls can also reduce network transmission speeds, presenting a trade-off between security and performance. The study examines various router firewall products in the market, such as those from TP-Link and Asus, and their features.",
                ],
            },
            {
                subtitle: 'Conclusion and Future Development',
                paragraphs: [
                    "The research concludes that router firewalls are vital for establishing the first line of defense in network security. Their ability to control network standards directly impacts both home and corporate environments. Future development of router firewalls should focus on integrating new technologies to reduce the impact of complex filtering systems on network speed. Additionally, continuous efforts in user education and protocol enhancement are necessary to maintain a secure network environment.",
                ],
            },
            {
                subtitle: 'Keywords',
                paragraphs: [
                    'Router firewall, network security, Great Firewall, malware protection, internet censorship, user education, TP-Link, Asus.',
                ],
            }
        ],
        poster: poster1,
    },
    'GUI-Development-for-Water-Network-Assessment-and-Simulation-System': {
        title: 'GUI Development for Water Network Assessment and Simulation System',
        advisor: 'Sina Naeimi Dafchahi (Doctoral Candidate / Graduate Research Assistant, U Delaware)',
        abstract: [
            {
                subtitle: 'Project Overview',
                paragraphs: [
                    "This project focuses on developing an intuitive Graphic User Interface (GUI) for water network assessment and simulation systems. The GUI serves as a crucial bridge between complex water network analysis algorithms and end-users, enabling researchers and engineers to effectively interact with sophisticated simulation tools.",
                ],
            },
            {
                subtitle: 'Technical Implementation',
                paragraphs: [
                    "The GUI was developed using PyQT, a powerful cross-platform GUI toolkit that provides native look and feel across different operating systems. The implementation adopted a multiple window format to organize different functionalities and improve user experience.",
                    "Key technical features include modular window design, real-time data visualization, interactive parameter adjustment, and comprehensive result analysis tools. The interface supports various input formats and provides flexible output options for different analysis requirements.",
                ],
            },
            {
                subtitle: 'Interface Enhancement',
                paragraphs: [
                    "The project involved significant improvements to existing user interfaces based on Python's native Tkinter GUI module. Enhanced features include improved visual aesthetics, better usability through intuitive navigation, and enhanced scalability to accommodate growing system requirements.",
                    "The redesigned interface provides better user workflow management, streamlined data input processes, and more effective visualization of simulation results, making complex water network analysis more accessible to researchers and practitioners.",
                ],
            },
            {
                subtitle: 'Impact and Applications',
                paragraphs: [
                    "The developed GUI significantly improves the accessibility of water network simulation tools, enabling researchers to focus on analysis rather than technical implementation details. The interface supports various water network assessment scenarios and provides comprehensive simulation capabilities for different research and practical applications.",
                ],
            },
            {
                subtitle: 'Keywords',
                paragraphs: [
                    'GUI development, PyQT, Tkinter, water network simulation, user interface design, Python development, simulation tools.',
                ],
            }
        ],
    },
};
