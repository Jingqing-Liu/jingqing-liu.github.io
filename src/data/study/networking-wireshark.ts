import type { StudyPack } from "../../lib/study-model";

// Adapted into short study stages from Kurose & Ross's Getting Started lab.
// Original labs: © 2005–2025 J. F. Kurose and K. W. Ross. All rights reserved.
// Prompts and hints below are rewritten for this site's saved-answer workflow.
export const networkingWiresharkPacks: StudyPack[] = [
  {
    id: "1-X01",
    title: "Wireshark ① · 安装与第一次抓包",
    kind: "lab",
    reading: "教材 p.50：Wireshark 实验；先完成 1.1—1.5 的阅读",
    minutes: "30—45",
    output: "保存一份抓包文件，并留下实验环境、接口选择与一条报文的观察记录。",
    bookPractice: "① 从 Wireshark 官网安装适合自己系统的版本，按安装提示配置抓包组件。已经安装则直接打开，记录版本。\n② 在欢迎页找到当前联网的接口（如 Wi-Fi 或 Ethernet），双击开始捕获；访问一次普通网页，页面加载后点停止。\n③ 认识分组列表、分组详情、字节内容三个区域；用 File → Save As 将记录保存为 .pcapng，再打开一次确认文件可读。\n④ 若暂时不能本机抓包，从作者实验页下载配套 Trace files，打开 Getting Started 的 intro 抓包文件；明确标注“官方样例分析”，接口无法确认就写未知。\n\n下载：https://www.wireshark.org/download.html\n捕获操作：https://www.wireshark.org/docs/wsug_html_chunked/ChCapCapturingSection.html\n保存文件：https://www.wireshark.org/docs/wsug_html_chunked/ChIOSaveSection.html\n实验与样例：https://gaia.cs.umass.edu/kurose_ross/wireshark.php\n\n这三个分段依照教材 p.50 与 Getting Started 实验范围改编；原实验版权 © 2005—2025 J. F. Kurose、K. W. Ross。",
    questions: [
      {
        id: "1-X01-q1",
        prompt: "环境记录：填写操作系统、Wireshark 版本、实验日期，以及“本机抓包”或“官方样例分析”。本机抓包请写接口名称和选择它的依据；使用样例请写来源链接与实际文件名。",
        hint: "接口名因系统而异，不照抄 en0。用当前联网方式和接口上的流量变化判断；样例里的地址不代表你自己的设备。",
      },
      {
        id: "1-X01-q2",
        prompt: "选择一条报文，记录它的 No.、Time、Source、Destination、Protocol 和 Length，并分别说明列表、详情、字节区域能回答什么问题。",
        hint: "No. 是这份文件中的分组序号，不是 TCP 序号；Length 通常以字节计。按界面实际显示记录，不要求三处展示相同信息。",
      },
      {
        id: "1-X01-q3",
        prompt: "描述从“开始捕获”到“停止”的操作过程，列出实际观察到的协议。为什么打开一个网页时，列表里可能出现不属于该网页的流量？Wireshark 在这里扮演什么角色？",
        hint: "它观察所选接口的流量，其他应用也可能在通信。不要把 Protocol 列的单个标签当作这条报文包含的全部协议。",
      },
      {
        id: "1-X01-q4",
        prompt: "保存并重新打开抓包文件，写下本地文件名、总分组数，以及重新找到第 2 题那条报文的方法。若尚未成功，记录卡住的步骤与提示，留待下次继续。",
        hint: "在本页记录文件名和包号即可，抓包文件留在自己的电脑；使用样例时保留原文件名及来源。重新打开后核对包号与字段是否一致。",
      },
    ],
    base: true,
  },
  {
    id: "1-X02",
    title: "Wireshark ② · 一次网页请求与协议分层",
    kind: "lab",
    reading: "教材 p.50 的首次 Web 抓包；联系 1.1 的协议与 1.5 的封装",
    minutes: "35—50",
    output: "找到一对 HTTP 请求与响应，用真实包号和字段说明一次通信及其封装层次。",
    bookPractice: "① 开始一次新捕获，再访问作者的入门实验网页：http://gaia.cs.umass.edu/wireshark-labs/INTRO-wireshark-file1.html；页面出现后停止并保存。\n② 在顶部显示过滤器输入 http 并应用，找到该页面的请求和对应响应。若浏览器升级为 HTTPS、VPN 改变了可见流量，或网页不可达，改用作者 Getting Started 配套的 intro 抓包文件。无需为了实验关闭浏览器的整体安全设置。\n③ 展开分组详情，观察 HTTP、TCP、IP 与实际链路层的关系。HTTPS 的应用内容通常被加密；看到 TLS 或 QUIC 而没有 HTTP 明文，不等于没有捕获到通信。\n\n第 8 版入门实验：https://www-net.cs.umass.edu/wireshark-labs/Wireshark_Intro_v8.0.pdf\n实验与样例：https://gaia.cs.umass.edu/kurose_ross/wireshark.php\n显示过滤器：https://www.wireshark.org/docs/wsug_html_chunked/ChWorkBuildDisplayFilterSection.html\nHTTP 字段：https://www.wireshark.org/docs/dfref/h/http.html",
    questions: [
      {
        id: "1-X02-q1",
        prompt: "本阶段用了哪份文件？说明是本机捕获还是官方样例。输入 http 后是否能看到目标网页？如果不能，记录实际看到的协议、排查过程，以及最终采用的样例或下一步计划。",
        hint: "先核对开始捕获的时机、接口和地址中的 http/https。加密流量不会因为输入 http 过滤器而变成明文；没有看到的字段就写未观察到。",
      },
      {
        id: "1-X02-q2",
        prompt: "找到目标页面的一条 HTTP 请求，记录包号、请求方法、Host、请求路径，以及客户端和服务器的 IP 地址与 TCP 端口。写明哪些信息来自 HTTP，哪些来自 TCP 或 IP。",
        hint: "可用 http.request 缩小范围，再在详情中核对目标页面；地址和端口按捕获结果填写，不预设固定服务器地址。",
      },
      {
        id: "1-X02-q3",
        prompt: "找到与上一题请求对应的 HTTP 响应，记录包号、状态码及配对依据。请求和响应的源、目的地址与端口有什么变化？",
        hint: "可结合 HTTP 详情里的 Request in frame / Response in frame 关联与同一 TCP 流核对。不要直接把列表中下一条报文当作响应；重定向响应也如实记录。",
      },
      {
        id: "1-X02-q4",
        prompt: "以其中一条 HTTP 报文为例，从外到内列出详情中实际出现的链路层、网络层、运输层和应用层协议；每层各选一个可见字段，说明它的用途。物理层是否以同样方式出现在这棵协议树里？",
        hint: "常见结构是链路层 → IP → TCP → HTTP，但按实际文件填写。Frame 是捕获记录信息；不能把它直接认作物理层，也不能据 Ethernet 标签断定电脑一定插着网线。",
      },
      {
        id: "1-X02-q5",
        prompt: "在字节区域查找请求方法或路径的可读文本，记下能找到的内容与包号。结合这次观察，说明为什么 HTTPS 抓包通常不能直接读出同样的网页内容。",
        hint: "只引用实验网页的少量字段。HTTP 内容可能跨分组重组，不能断言所有字段都在同一个包；HTTPS 保护应用数据，IP 等必要的传输信息仍可能可见。",
      },
    ],
    base: true,
  },
  {
    id: "1-X03",
    title: "Wireshark ③ · 过滤、时间差与实验报告",
    kind: "lab",
    reading: "延续 1-X02 的同一份抓包；联系 1.4 的时延与 1.5 的分层",
    minutes: "30—45",
    output: "留下可复查的过滤结果、请求响应时间差和一份简短报告，供伙伴互检。",
    bookPractice: "① 打开上一阶段的文件，依次应用 tcp、http、http.request、http.response 四个显示过滤器，记录显示数量；最后清除过滤器。\n② 找回已经配对的请求与响应。在 View → Time Display Format 选择 Seconds Since First Captured Packet，保证两条记录使用同一时间参考；读取时间并相减。\n③ 汇总文件来源、包号、过滤器、时间与结论，写入下方作答及“本次产物或笔记位置”。伙伴可根据这些记录复查；本页保存文字记录，原始抓包文件仍留在本地。\n\n过滤器说明：https://www.wireshark.org/docs/wsug_html_chunked/ChWorkDisplayFilterSection.html\n时间显示：https://www.wireshark.org/docs/wsug_html_chunked/ChWorkTimeFormatsSection.html\n实验来源：https://gaia.cs.umass.edu/kurose_ross/wireshark.php",
    questions: [
      {
        id: "1-X03-q1",
        prompt: "记录同一份文件中 tcp、http、http.request、http.response 四种显示过滤器各自显示的数量，解释至少一处数量差异。清除过滤器后，总分组数是否恢复？这与在捕获时过滤有什么区别？",
        hint: "显示过滤器隐藏不匹配的记录，不删除已捕获数据。纯 TCP 控制报文未必包含 HTTP；捕获过滤器则决定哪些流量被收进来，两类过滤语法也不同。",
      },
      {
        id: "1-X03-q2",
        prompt: "写下配对的 HTTP 请求和响应包号、使用的时间显示格式、两个时间值，计算 Δt = 响应时间 − 请求时间（同时给出秒和毫秒）。这能直接当作单程传播时延或链路带宽吗？解释你的测量范围。",
        hint: "先确认来自同一捕获、同一时间参考和同一次交互。它是所选捕获位置上两个报文的观察间隔，可能包含网络往返和服务器处理等；不等于完整页面加载时间，也不能直接反推带宽。",
      },
      {
        id: "1-X03-q3",
        prompt: "用 3—5 句话把实验现象连接到第一章：本次通信的端系统是谁？看到了哪些协议层？哪一个结论有报文字段支撑？再写一个仅凭这份抓包仍不能确定的问题。",
        hint: "把实际证据与推测分开。例如单个客户端的捕获不能直接展示沿途所有路由器，也不足以分别量出每一跳的排队和传播时延。",
      },
      {
        id: "1-X03-q4",
        prompt: "整理实验报告：文件名与来源 → 复现步骤 → 关键包号和过滤器 → 时间计算 → 结论与未解决问题。为伙伴写下一项具体核对任务；收到反馈后，在这里追加订正内容。",
        hint: "报告应让伙伴知道如何复查，而不只写“实验成功”。可以请对方核对请求响应配对、秒与毫秒换算或协议层归属；样例分析与本机抓包要分别注明。",
      },
    ],
    base: true,
  },
];
