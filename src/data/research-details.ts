// Poster images
const poster1 = '/postrs/postr.png';
const poster2 = '/postrs/postr2.png';

export interface ResearchDetailSection {
  subtitle: string;
  subtitle_zh?: string;
  paragraphs: string[];
  paragraphs_zh?: string[];
}

export interface ResearchDetailType {
  title: string;
  title_zh?: string;
  advisor?: string;
  advisor_zh?: string;
  abstract: ResearchDetailSection[];
  poster?: string;
}

export const researchDetails: { [key: string]: ResearchDetailType } = {
    'Research-and-Testing-of-API-Calls-in-WeChat': {
        title: 'Research and Testing of API Calls in WeChat',
        title_zh: '微信 API 调用研究与测试',
        advisor: 'Advisor: Xing Gao (Assistant Professor, U Delaware)',
        advisor_zh: '导师：高星（助理教授，特拉华大学）',
        abstract: [
            {
                subtitle: 'Architectural Overview',
                subtitle_zh: '架构概述',
                paragraphs: [
                    'WeChat\'s architecture comprises a subapplication tier for storage and a subapplication runtime, which connects JavaScript API calls to the host application\'s native tier (Java for Android, Objective-C for iOS). This structure aims to facilitate seamless integration and resource access while enforcing native permissions.',
                ],
                paragraphs_zh: [
                    '微信的架构包含一个用于存储的子应用层和一个子应用运行时，该运行时将 JavaScript API 调用连接到宿主应用的原生层（Android 使用 Java，iOS 使用 Objective-C）。这种结构旨在促进无缝集成和资源访问，同时实施原生权限管理。',
                ],
            },
            {
                subtitle: 'Comparison with Traditional Apps',
                subtitle_zh: '与传统应用的比较',
                paragraphs: [
                    'Unlike traditional app frameworks and sandboxes, WeChat establishes its own API system for subapplications, offering direct access to system resources. This unique approach raises significant differences in API management, particularly regarding installation requirements, background operations, cross-platform functionality, and review processes before deployment.',
                ],
                paragraphs_zh: [
                    '与传统应用框架和沙箱不同，微信为子应用建立了自己的 API 系统，提供对系统资源的直接访问。这种独特的方式在 API 管理方面产生了显著差异，特别是在安装要求、后台操作、跨平台功能和部署前审核流程等方面。',
                ],
            },
            {
                subtitle: 'Security Concerns',
                subtitle_zh: '安全隐患',
                paragraphs: [
                    'The study identifies several API discrepancies that pose security risks:',
                    'System Resource Exposure: Inconsistencies in permission requirements between sub-app APIs and system APIs can lead to unauthorized access to sensitive system resources. For example, the wx.getWifiList API exposes user location through WiFi scan capabilities without adequate permission checks.',
                    'Sub-window Deception: Malicious sub-apps can display fake UIs to deceive users into providing sensitive information, such as wallet passwords, mimicking legitimate interfaces like those of Facebook or payment gateways.',
                    'Sub-app Lifecycle Hijacking: Sub-applications on WeChat can exploit task management processes on mobile devices, silently recycling tasks to remain active beyond intended limits, particularly on iOS and Android platforms.',
                    'Exploiting API Permission Discrepancies: Mini-apps can bypass permission restrictions to collect user data, track locations, eavesdrop on conversations, and capture photos or videos stealthily. This is facilitated by APIs like wx.getLocation, wx.startRecord, and wx.createCameraContext.',
                    'Fingerprinting Attacks: Malicious mini-apps can use APIs such as wx.getSystemInfo to collect device-specific information and create unique fingerprints, enabling cross-device tracking and user behavior monitoring.',
                    'Misleading Documentation: WeChat\'s API documentation exhibits discrepancies between languages, leading to potential misunderstandings about API restrictions and capabilities, as observed with wx.getLocation.',
                ],
                paragraphs_zh: [
                    '研究识别出多个构成安全风险的 API 差异：',
                    '系统资源暴露：子应用 API 与系统 API 之间权限要求的不一致可能导致对敏感系统资源的未授权访问。例如，wx.getWifiList API 在没有充分权限检查的情况下，通过 WiFi 扫描功能暴露用户位置。',
                    '子窗口欺骗：恶意子应用可以显示伪造界面来诱导用户提供敏感信息（如钱包密码），模仿 Facebook 或支付网关等合法界面。',
                    '子应用生命周期劫持：微信上的子应用可以利用移动设备的任务管理流程，静默回收任务以超出预期限制保持活跃，特别是在 iOS 和 Android 平台上。',
                    '利用 API 权限差异：小程序可以绕过权限限制来收集用户数据、追踪位置、窃听对话、秘密拍摄照片或视频。这通过 wx.getLocation、wx.startRecord 和 wx.createCameraContext 等 API 实现。',
                    '指纹攻击：恶意小程序可以使用 wx.getSystemInfo 等 API 收集设备特定信息并创建唯一指纹，实现跨设备追踪和用户行为监控。',
                    '误导性文档：微信的 API 文档在不同语言版本之间存在差异，导致对 API 限制和功能的潜在误解，如 wx.getLocation 所示。',
                ],
            },
            {
                subtitle: 'Conclusion',
                subtitle_zh: '结论',
                paragraphs: [
                    'The findings highlight significant security vulnerabilities arising from API differences across platforms and devices. These discrepancies can be exploited for malicious purposes, including user tracking and data theft. Ensuring a secure and consistent environment for API execution within WeChat\'s mini-programs is crucial to mitigate these risks and protect user privacy.',
                ],
                paragraphs_zh: [
                    '研究结果揭示了因跨平台和设备间 API 差异而产生的重大安全漏洞。这些差异可被恶意利用，包括用户追踪和数据窃取。确保微信小程序内 API 执行环境的安全性和一致性对于减轻这些风险和保护用户隐私至关重要。',
                ],
            },
            {
                subtitle: 'Keywords',
                subtitle_zh: '关键词',
                paragraphs: [
                    'WeChat, mini-programs, API security, system architecture, cross-platform, user privacy, mobile security.',
                ],
                paragraphs_zh: [
                    '微信、小程序、API 安全、系统架构、跨平台、用户隐私、移动安全。',
                ],
            },
        ],

    },
    "Invisible-Threats-in-the-Met-Averse:-Roblox's-Security-Vulnerabilities": {
        title: "Invisible Threats in the Met-Averse: Roblox's Security Vulnerabilities",
        title_zh: '元宇宙中的隐形威胁：Roblox 的安全漏洞',
        abstract: [
            {
                subtitle: '',
                subtitle_zh: '',
                paragraphs: [
                    "Meta-universe gaming, represented by platforms such as Roblox, is at the forefront of the gaming industry. These platforms provide a virtual world that offers users an engaging experience that can be created and interacted with on demand. Despite these platforms' tremendous progress, they are still susceptible to malicious exploitation, posing severe security concerns.",
                    "Roblox is one of the leading meta-universe gaming platforms, and this study explores its security vulnerabilities. The study highlights how Roblox's infrastructure circumvents firewall restrictions, providing a hidden route for unauthorized network communication. This study also explores the possibility of misusing Roblox's distributed resources for cost-effective neural network training. These malicious activities can then be hidden from normal gaming activities without the user's awareness, unknowingly causing unintended harm.",
                    "The investigation uncovered two noteworthy vulnerabilities. First, Roblox can indeed be manipulated by local malware to launch connections or open web pages in-game, thereby bypassing traditional security measures. Second, Roblox's distributed computing resources can be used for resource-intensive tasks such as neural network training. Given Roblox's relatively young user base, this exposed vulnerability could have a particularly damaging impact, potentially spreading harmful information or links that could threaten user security.",
                    "This study emphasizes that metaverse gaming platforms, especially those targeting younger audiences, need to adopt strong security measures and must continuously improve them to ensure a safe gaming environment, prevent misuse of the platform's computational resources and disseminate potentially harmful content to protect users, especially children, from potential harm. Finally, we propose several policies for metaverse gaming platforms to protect their valuable computing resources from malicious exploitation.",
                ],
                paragraphs_zh: [
                    "以 Roblox 等平台为代表的元宇宙游戏处于游戏行业的前沿。这些平台提供了一个虚拟世界，为用户提供可按需创建和交互的沉浸式体验。尽管这些平台取得了巨大进步，但它们仍然容易受到恶意利用，带来严重的安全隐患。",
                    "Roblox 是领先的元宇宙游戏平台之一，本研究探讨了其安全漏洞。研究重点揭示了 Roblox 的基础设施如何绕过防火墙限制，为未授权的网络通信提供隐蔽通道。本研究还探讨了滥用 Roblox 分布式资源进行低成本神经网络训练的可能性。这些恶意活动可以隐藏在正常游戏活动中，用户毫不知情地造成非预期的危害。",
                    "调查发现了两个值得注意的漏洞。首先，Roblox 确实可以被本地恶意软件操纵，在游戏内发起连接或打开网页，从而绕过传统安全措施。其次，Roblox 的分布式计算资源可被用于神经网络训练等资源密集型任务。鉴于 Roblox 的用户群体相对年轻，这一暴露的漏洞可能产生特别严重的影响，可能传播有害信息或链接，威胁用户安全。",
                    "本研究强调，元宇宙游戏平台，特别是面向年轻用户的平台，需要采取强有力的安全措施并持续改进，以确保安全的游戏环境，防止平台计算资源被滥用，阻止传播潜在有害内容，保护用户特别是儿童免受潜在危害。最后，我们提出了多项针对元宇宙游戏平台的策略，以保护其宝贵的计算资源免受恶意利用。",
                ],
            },
        ],
        poster: poster2,
    },
    'Verification-of-Account-Balances-in-the-Bitcoin-System-Using-Merkle-Trees': {
        title: 'Verification of Account Balances in the Bitcoin System Using Merkle Trees',
        title_zh: '基于 Merkle 树的比特币系统账户余额验证',
        advisor: 'Vipul Goyal (Professor, Carnegie Mellon University)',
        advisor_zh: 'Vipul Goyal（教授，卡内基梅隆大学）',
        abstract: [
            {
                subtitle: '',
                subtitle_zh: '',
                paragraphs: [
                    "This study investigates the intricate structure of the Bitcoin protocol, focusing on block architecture, node classification, and transaction validation mechanisms. The primary challenge addressed is the difficulty light nodes face in verifying account balances using current Bitcoin practices. The research proposes an innovative solution that incorporates the Merkle tree root of the UTXO set into the unused portion of the coinbase transaction input field. This integration allows light nodes to leverage Merkle proofs for verifying account balances, enhancing accuracy and trust within the network. The proposed changes adhere to soft fork standards, encouraging node upgrades while preserving network integrity.",
                ],
                paragraphs_zh: [
                    "本研究深入探讨了比特币协议的复杂结构，重点关注区块架构、节点分类和交易验证机制。研究解决的主要挑战是轻节点在使用当前比特币实践验证账户余额时面临的困难。研究提出了一种创新方案，将 UTXO 集的 Merkle 树根纳入 coinbase 交易输入字段的未使用部分。这种集成允许轻节点利用 Merkle 证明来验证账户余额，提高网络中的准确性和信任度。提出的更改符合软分叉标准，鼓励节点升级同时维护网络完整性。",
                ],
            },
            {
                subtitle: 'Introduction',
                subtitle_zh: '引言',
                paragraphs: [
                    "Bitcoin revolutionized digital finance with its decentralized system grounded in cryptographic principles. Despite the security and transparency provided by its protocol, Bitcoin faces challenges, particularly in node-light transaction validation. This study examines the block structure, node types, and validation methods within the Bitcoin protocol to address the issue of light nodes being unable to independently verify account balances. An innovative solution is proposed to bridge the trust gap while maintaining decentralization.",
                ],
                paragraphs_zh: [
                    "比特币以其基于密码学原理的去中心化系统革新了数字金融。尽管其协议提供了安全性和透明度，但比特币仍面临挑战，特别是在轻节点交易验证方面。本研究检验了比特币协议中的区块结构、节点类型和验证方法，以解决轻节点无法独立验证账户余额的问题。提出了一种创新方案来弥合信任差距，同时维持去中心化。",
                ],
            },
            {
                subtitle: 'Previous Work',
                subtitle_zh: '先前工作',
                paragraphs: [
                    "To develop the proposed solution, a comprehensive review of the Bitcoin protocol was conducted. Key findings include:",
                    "Block Structure: Bitcoin blocks consist of a header and body. The header contains crucial data, including the Merkle root, ensuring transaction integrity. The body, significantly larger, records transaction information.",
                    "Node Classification: Bitcoin nodes are categorized as full or light nodes. Full nodes store the entire blockchain and perform comprehensive verification tasks, whereas light nodes store only block headers and partial transaction data, utilizing Merkle trees for transaction verification.",
                    "Merkle Trees and Proofs: Merkle trees store transaction information in a hierarchical hash structure, enabling light nodes to verify transactions using Merkle proofs provided by full nodes.",
                    "UTXO Set: The UTXO set represents unspent transaction outputs, maintained by full nodes and essential for verifying account balances.",
                ],
                paragraphs_zh: [
                    "为了开发提出的方案，对比特币协议进行了全面的文献综述。主要发现包括：",
                    "区块结构：比特币区块由区块头和区块体组成。区块头包含关键数据（包括 Merkle 根），确保交易完整性。区块体体积更大，记录交易信息。",
                    "节点分类：比特币节点分为全节点和轻节点。全节点存储整个区块链并执行全面的验证任务，而轻节点仅存储区块头和部分交易数据，利用 Merkle 树进行交易验证。",
                    "Merkle 树和证明：Merkle 树以层级哈希结构存储交易信息，使轻节点能够使用全节点提供的 Merkle 证明来验证交易。",
                    "UTXO 集：UTXO 集代表未花费的交易输出，由全节点维护，对验证账户余额至关重要。",
                ],
            },
            {
                subtitle: 'Approach',
                subtitle_zh: '方法',
                paragraphs: [
                    "The proposed solution involves using the input field of coinbase transactions to store the Merkle root of the UTXO set. This allows light nodes to verify account balances through a two-layer Merkle proof process. The inner layer verifies the UTXO Merkle tree, while the outer layer verifies the entire block's Merkle tree.",
                    "Innovation: By organizing the UTXO set into a Merkle tree and storing its root in the coinbase transaction's input, light nodes can independently verify their account balances using Merkle proofs.",
                    "Implementation: Light nodes request a Merkle proof from full nodes, including transaction details and hash values. The light node calculates the Merkle root and compares it with the stored root, ensuring transaction validity.",
                    "Protocol Enhancement: The proposed changes constitute a soft fork, as they modify the coinbase transaction input field. This incentivizes nodes to upgrade their protocols, ensuring widespread adoption.",
                ],
                paragraphs_zh: [
                    "提出的方案涉及使用 coinbase 交易的输入字段来存储 UTXO 集的 Merkle 根。这允许轻节点通过双层 Merkle 证明过程验证账户余额。内层验证 UTXO Merkle 树，外层验证整个区块的 Merkle 树。",
                    "创新点：通过将 UTXO 集组织成 Merkle 树并将其根存储在 coinbase 交易的输入中，轻节点可以独立使用 Merkle 证明验证其账户余额。",
                    "实现：轻节点向全节点请求 Merkle 证明，包括交易详情和哈希值。轻节点计算 Merkle 根并与存储的根进行比较，确保交易有效性。",
                    "协议增强：提出的更改构成软分叉，因为它们修改了 coinbase 交易输入字段。这激励节点升级协议，确保广泛采用。",
                ],
            },
            {
                subtitle: 'Conclusion',
                subtitle_zh: '结论',
                paragraphs: [
                    "The study proposes utilizing the unused portion of the coinbase transaction input field to include the UTXO Merkle tree root. This enables light nodes to verify account balances using Merkle proofs, enhancing trust and accuracy in the Bitcoin network. The protocol changes align with soft fork standards, incentivizing node upgrades and maintaining network integrity.",
                ],
                paragraphs_zh: [
                    "本研究提出利用 coinbase 交易输入字段的未使用部分来包含 UTXO Merkle 树根。这使轻节点能够使用 Merkle 证明验证账户余额，增强比特币网络中的信任度和准确性。协议更改符合软分叉标准，激励节点升级并维护网络完整性。",
                ],
            },
            {
                subtitle: 'Keywords',
                subtitle_zh: '关键词',
                paragraphs: [
                    'Bitcoin, Merkle trees, light nodes, UTXO, transaction verification, soft fork, blockchain security',
                ],
                paragraphs_zh: [
                    '比特币、Merkle 树、轻节点、UTXO、交易验证、软分叉、区块链安全',
                ],
            }
        ],
    },
    'A-Design-of-Router-Firewall': {
        title: 'A Design of Router Firewall',
        title_zh: '路由器防火墙设计',
        advisor: 'Rui Zhang (Associate Prof., U Delaware)',
        advisor_zh: '张锐（副教授，特拉华大学）',
        abstract: [
            {
                subtitle: 'Router Firewall: An Essential Tool for Network Security',
                subtitle_zh: '路由器防火墙：网络安全的关键工具',
                paragraphs: [
                    "This research examines the critical role of router firewalls in ensuring network security for both personal and organizational environments. Firewalls act as a combination of hardware and software that isolate internal networks from the internet, allowing selective packet transmission while blocking potentially harmful data. This study focuses on various aspects of firewalls, including their architecture, functionalities, and future development prospects.",
                ],
                paragraphs_zh: [
                    "本研究考察了路由器防火墙在确保个人和组织环境网络安全中的关键作用。防火墙是硬件和软件的结合体，将内部网络与互联网隔离，允许选择性数据包传输同时阻止潜在有害数据。本研究重点关注防火墙的各个方面，包括其架构、功能和未来发展前景。",
                ],
            },
            {
                subtitle: 'Background and Functionality',
                subtitle_zh: '背景与功能',
                paragraphs: [
                    "Firewalls serve multiple purposes, such as protecting personal computers from malware and enabling governments to filter and monitor internet content for political reasons. This dual function underscores the importance of firewalls in maintaining both individual and national security. The study explores the architecture of firewalls, highlighting their evolution and the necessity for continuous upgrades to combat emerging threats.",
                ],
                paragraphs_zh: [
                    "防火墙服务于多种目的，例如保护个人计算机免受恶意软件侵害，以及使政府能够出于政治原因过滤和监控互联网内容。这种双重功能强调了防火墙在维护个人和国家安全方面的重要性。本研究探讨了防火墙的架构，强调了其演进和持续升级以对抗新兴威胁的必要性。",
                ],
            },
            {
                subtitle: 'Analysis of the Great Firewall',
                subtitle_zh: '防火长城分析',
                paragraphs: [
                    "The Great Firewall of China (GFW) exemplifies a sophisticated combination of software and hardware used to censor and monitor internet content. The GFW employs various blocking methods, including DNS pollution, IP route hijacking, and deep packet inspection, to control the information flow. This section provides a detailed analysis of the GFW's operational mechanisms and its impact on internet freedom.",
                ],
                paragraphs_zh: [
                    "中国防火长城（GFW）是用于审查和监控互联网内容的软硬件精密组合的典范。GFW 采用各种封锁方法，包括 DNS 污染、IP 路由劫持和深度包检测，来控制信息流。本节详细分析了 GFW 的运行机制及其对互联网自由的影响。",
                ],
            },
            {
                subtitle: 'User Interaction and Security Measures',
                subtitle_zh: '用户交互与安全措施',
                paragraphs: [
                    "A survey conducted as part of this study reveals common user practices and attitudes towards firewalls. The findings indicate a significant gap in user knowledge and the proper utilization of firewalls, contributing to security breaches. The study emphasizes the importance of user education and the implementation of robust security protocols to mitigate human errors, which account for a substantial portion of data breaches.",
                ],
                paragraphs_zh: [
                    "作为本研究一部分进行的调查揭示了用户使用防火墙的常见做法和态度。研究结果表明，用户知识和防火墙正确使用方面存在显著差距，这导致了安全漏洞。研究强调了用户教育和实施健壮安全协议的重要性，以减少人为错误——这些错误占数据泄露的很大比例。",
                ],
            },
            {
                subtitle: 'Advantages and Disadvantages of Router Firewalls',
                subtitle_zh: '路由器防火墙的优缺点',
                paragraphs: [
                    "Router firewalls offer several advantages over software-based firewalls, such as minimizing human error, blocking viruses before they enter the network, and not being susceptible to tampering like software firewalls. However, router firewalls can also reduce network transmission speeds, presenting a trade-off between security and performance. The study examines various router firewall products in the market, such as those from TP-Link and Asus, and their features.",
                ],
                paragraphs_zh: [
                    "与软件防火墙相比，路由器防火墙具有多项优势，如最小化人为错误、在病毒进入网络之前将其阻止、不像软件防火墙那样容易被篡改。然而，路由器防火墙也可能降低网络传输速度，在安全性和性能之间进行权衡。本研究考察了市场上各种路由器防火墙产品，如 TP-Link 和 Asus 的产品及其特性。",
                ],
            },
            {
                subtitle: 'Conclusion and Future Development',
                subtitle_zh: '结论与未来展望',
                paragraphs: [
                    "The research concludes that router firewalls are vital for establishing the first line of defense in network security. Their ability to control network standards directly impacts both home and corporate environments. Future development of router firewalls should focus on integrating new technologies to reduce the impact of complex filtering systems on network speed. Additionally, continuous efforts in user education and protocol enhancement are necessary to maintain a secure network environment.",
                ],
                paragraphs_zh: [
                    "研究得出结论，路由器防火墙对于建立网络安全的第一道防线至关重要。其控制网络标准的能力直接影响家庭和企业环境。路由器防火墙的未来发展应着重于整合新技术，以减少复杂过滤系统对网络速度的影响。此外，在用户教育和协议增强方面的持续努力对于维护安全的网络环境也是必要的。",
                ],
            },
            {
                subtitle: 'Keywords',
                subtitle_zh: '关键词',
                paragraphs: [
                    'Router firewall, network security, Great Firewall, malware protection, internet censorship, user education, TP-Link, Asus.',
                ],
                paragraphs_zh: [
                    '路由器防火墙、网络安全、防火长城、恶意软件防护、互联网审查、用户教育、TP-Link、Asus。',
                ],
            }
        ],
        poster: poster1,
    },
    'GUI-Development-for-Water-Network-Assessment-and-Simulation-System': {
        title: 'GUI Development for Water Network Assessment and Simulation System',
        title_zh: '供水管网评估与仿真系统的图形用户界面开发',
        advisor: 'Sina Naeimi Dafchahi (Doctoral Candidate / Graduate Research Assistant, U Delaware)',
        advisor_zh: 'Sina Naeimi Dafchahi（博士研究生 / 研究助理，特拉华大学）',
        abstract: [
            {
                subtitle: 'Project Overview',
                subtitle_zh: '项目概述',
                paragraphs: [
                    "This project focuses on developing an intuitive Graphic User Interface (GUI) for water network assessment and simulation systems. The GUI serves as a crucial bridge between complex water network analysis algorithms and end-users, enabling researchers and engineers to effectively interact with sophisticated simulation tools.",
                ],
                paragraphs_zh: [
                    "本项目专注于为供水管网评估与仿真系统开发直观的图形用户界面（GUI）。该 GUI 充当复杂供水管网分析算法与最终用户之间的关键桥梁，使研究人员和工程师能够有效地与精密的仿真工具进行交互。",
                ],
            },
            {
                subtitle: 'Technical Implementation',
                subtitle_zh: '技术实现',
                paragraphs: [
                    "The GUI was developed using PyQT, a powerful cross-platform GUI toolkit that provides native look and feel across different operating systems. The implementation adopted a multiple window format to organize different functionalities and improve user experience.",
                    "Key technical features include modular window design, real-time data visualization, interactive parameter adjustment, and comprehensive result analysis tools. The interface supports various input formats and provides flexible output options for different analysis requirements.",
                ],
                paragraphs_zh: [
                    "GUI 使用 PyQT 开发，这是一个强大的跨平台 GUI 工具包，在不同操作系统上提供原生外观和体验。实现采用了多窗口格式来组织不同功能并改善用户体验。",
                    "关键技术特性包括模块化窗口设计、实时数据可视化、交互式参数调整和综合结果分析工具。界面支持各种输入格式，并为不同的分析需求提供灵活的输出选项。",
                ],
            },
            {
                subtitle: 'Interface Enhancement',
                subtitle_zh: '界面改进',
                paragraphs: [
                    "The project involved significant improvements to existing user interfaces based on Python's native Tkinter GUI module. Enhanced features include improved visual aesthetics, better usability through intuitive navigation, and enhanced scalability to accommodate growing system requirements.",
                    "The redesigned interface provides better user workflow management, streamlined data input processes, and more effective visualization of simulation results, making complex water network analysis more accessible to researchers and practitioners.",
                ],
                paragraphs_zh: [
                    "项目对基于 Python 原生 Tkinter GUI 模块的现有用户界面进行了重大改进。增强的功能包括改进的视觉美学、通过直观导航提升的可用性，以及增强的可扩展性以适应不断增长的系统需求。",
                    "重新设计的界面提供了更好的用户工作流管理、简化的数据输入流程和更有效的仿真结果可视化，使复杂的供水管网分析对研究人员和从业者更加便捷。",
                ],
            },
            {
                subtitle: 'Impact and Applications',
                subtitle_zh: '影响与应用',
                paragraphs: [
                    "The developed GUI significantly improves the accessibility of water network simulation tools, enabling researchers to focus on analysis rather than technical implementation details. The interface supports various water network assessment scenarios and provides comprehensive simulation capabilities for different research and practical applications.",
                ],
                paragraphs_zh: [
                    "开发的 GUI 显著提高了供水管网仿真工具的可访问性，使研究人员能够专注于分析而非技术实现细节。该界面支持各种供水管网评估场景，并为不同的研究和实际应用提供全面的仿真能力。",
                ],
            },
            {
                subtitle: 'Keywords',
                subtitle_zh: '关键词',
                paragraphs: [
                    'GUI development, PyQT, Tkinter, water network simulation, user interface design, Python development, simulation tools.',
                ],
                paragraphs_zh: [
                    'GUI 开发、PyQT、Tkinter、供水管网仿真、用户界面设计、Python 开发、仿真工具。',
                ],
            }
        ],
    },
};
