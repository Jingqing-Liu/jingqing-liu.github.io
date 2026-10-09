import type { StudyProject } from '../../lib/study-model';

// 根据用户提供的下册目录 I—VIII 页照片整理，保留原书章节编号。
export const h3cneLowerStudyProject: StudyProject = {
  "id": "h3cne-rs-plus-lower",
  "title": "H3CNE-RS+ 路由交换技术基础 V1.0 · 学习指导书（下册）",
  "subtitle": "新华三技术培训中心",
  "kind": "book",
  "description": "按篇与章节阅读，二级章节打卡，三级小节仅展示目录。",
  "color": "#7667ad",
  "checkinOnly": true,
  "chapters": [
    {
      "id": "h3c-lower-ch-16",
      "title": "第 16 章 IP 子网划分",
      "unit": "第 4 篇 高级 TCP/IP 知识",
      "packs": [
        {
          "id": "16.1",
          "title": "16.1 本章目标",
          "kind": "reading",
          "reading": "16.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "16.2",
          "title": "16.2 IP 子网划分的需求背景",
          "kind": "reading",
          "reading": "16.2 IP 子网划分的需求背景",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "16.3",
          "title": "16.3 IP 子网划分基础知识",
          "kind": "reading",
          "reading": "16.3 IP 子网划分基础知识",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "16.3.1 IP 子网划分的方法",
            "16.3.2 子网掩码"
          ]
        },
        {
          "id": "16.4",
          "title": "16.4 IP 子网划分的常用计算",
          "kind": "reading",
          "reading": "16.4 IP 子网划分的常用计算",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "16.4.1 计算子网内可用地址数",
            "16.4.2 根据主机地址数划分子网",
            "16.4.3 根据子网掩码计算子网数",
            "16.4.4 根据子网数划分子网"
          ]
        },
        {
          "id": "16.5",
          "title": "16.5 VLSM 和 CIDR",
          "kind": "reading",
          "reading": "16.5 VLSM 和 CIDR",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "16.5.1 VLSM",
            "16.5.2 CIDR"
          ]
        },
        {
          "id": "16.6",
          "title": "16.6 本章总结",
          "kind": "reading",
          "reading": "16.6 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-17",
      "title": "第 17 章 DNS",
      "unit": "第 4 篇 高级 TCP/IP 知识",
      "packs": [
        {
          "id": "17.1",
          "title": "17.1 本章目标",
          "kind": "reading",
          "reading": "17.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "17.2",
          "title": "17.2 DNS 域名系统概述",
          "kind": "reading",
          "reading": "17.2 DNS 域名系统概述",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "17.2.1 主机名与 IP 地址映射需求",
            "17.2.2 Hosts 文件",
            "17.2.3 DNS 简介"
          ]
        },
        {
          "id": "17.3",
          "title": "17.3 域名及域名结构",
          "kind": "reading",
          "reading": "17.3 域名及域名结构",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "17.3.1 域名",
            "17.3.2 因特网域名结构树"
          ]
        },
        {
          "id": "17.4",
          "title": "17.4 DNS 域名解析",
          "kind": "reading",
          "reading": "17.4 DNS 域名解析",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "17.4.1 DNS 域名解析",
            "17.4.2 DNS 域名解析过程"
          ]
        },
        {
          "id": "17.5",
          "title": "17.5 DNS 查询方式",
          "kind": "reading",
          "reading": "17.5 DNS 查询方式",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "17.5.1 递归查询",
            "17.5.2 迭代查询"
          ]
        },
        {
          "id": "17.6",
          "title": "17.6 DNS 反向查询",
          "kind": "reading",
          "reading": "17.6 DNS 反向查询",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "17.7",
          "title": "17.7 H3C 设备 DNS 特性及配置",
          "kind": "reading",
          "reading": "17.7 H3C 设备 DNS 特性及配置",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "17.7.1 H3C 设备 DNS 特性",
            "17.7.2 配置静态和动态域名解析",
            "17.7.3 配置 DNS 代理",
            "17.7.4 域名解析显示及维护"
          ]
        },
        {
          "id": "17.8",
          "title": "17.8 本章总结",
          "kind": "reading",
          "reading": "17.8 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-18",
      "title": "第 18 章 文件传输协议",
      "unit": "第 4 篇 高级 TCP/IP 知识",
      "packs": [
        {
          "id": "18.1",
          "title": "18.1 本章目标",
          "kind": "reading",
          "reading": "18.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "18.2",
          "title": "18.2 FTP 协议",
          "kind": "reading",
          "reading": "18.2 FTP 协议",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "18.2.1 FTP 协议介绍",
            "18.2.2 FTP 双连接方式",
            "18.2.3 FTP 文件传输模式",
            "18.2.4 FTP 主动数据传输方式",
            "18.2.5 FTP 被动数据传输方式"
          ]
        },
        {
          "id": "18.3",
          "title": "18.3 TFTP 协议",
          "kind": "reading",
          "reading": "18.3 TFTP 协议",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "18.3.1 TFTP 协议介绍",
            "18.3.2 TFTP 文件传输过程"
          ]
        },
        {
          "id": "18.4",
          "title": "18.4 配置 FTP 与 TFTP",
          "kind": "reading",
          "reading": "18.4 配置 FTP 与 TFTP",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "18.4.1 FTP 客户端配置方法",
            "18.4.2 FTP 服务器端配置",
            "18.4.3 TFTP 客户端配置"
          ]
        },
        {
          "id": "18.5",
          "title": "18.5 本章总结",
          "kind": "reading",
          "reading": "18.5 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-19",
      "title": "第 19 章 DHCP",
      "unit": "第 4 篇 高级 TCP/IP 知识",
      "packs": [
        {
          "id": "19.1",
          "title": "19.1 本章目标",
          "kind": "reading",
          "reading": "19.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "19.2",
          "title": "19.2 DHCP 简介",
          "kind": "reading",
          "reading": "19.2 DHCP 简介",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "19.2.1 DHCP 协议特点",
            "19.2.2 DHCP 系统组成",
            "19.2.3 DHCP 地址分配方式"
          ]
        },
        {
          "id": "19.3",
          "title": "19.3 IP 地址动态获取过程",
          "kind": "reading",
          "reading": "19.3 IP 地址动态获取过程",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "19.4",
          "title": "19.4 DHCP 租约更新",
          "kind": "reading",
          "reading": "19.4 DHCP 租约更新",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "19.5",
          "title": "19.5 DHCP 中继介绍",
          "kind": "reading",
          "reading": "19.5 DHCP 中继介绍",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "19.6",
          "title": "19.6 DHCP 服务器配置",
          "kind": "reading",
          "reading": "19.6 DHCP 服务器配置",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "19.6.1 DHCP 服务器基本配置",
            "19.6.2 DHCP 服务器可选配置",
            "19.6.3 DHCP 服务器配置示例",
            "19.6.4 DHCP 服务器的显示及维护"
          ]
        },
        {
          "id": "19.7",
          "title": "19.7 DHCP 中继配置",
          "kind": "reading",
          "reading": "19.7 DHCP 中继配置",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "19.7.1 DHCP 中继基本配置",
            "19.7.2 DHCP 中继的显示与维护"
          ]
        },
        {
          "id": "19.8",
          "title": "19.8 本章总结",
          "kind": "reading",
          "reading": "19.8 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-20",
      "title": "第 20 章 IPv6 基础",
      "unit": "第 4 篇 高级 TCP/IP 知识",
      "packs": [
        {
          "id": "20.1",
          "title": "20.1 本章目标",
          "kind": "reading",
          "reading": "20.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "20.2",
          "title": "20.2 IPv6 的特点",
          "kind": "reading",
          "reading": "20.2 IPv6 的特点",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "20.3",
          "title": "20.3 IPv6 地址",
          "kind": "reading",
          "reading": "20.3 IPv6 地址",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "20.4",
          "title": "20.4 邻居发现协议",
          "kind": "reading",
          "reading": "20.4 邻居发现协议",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "20.5",
          "title": "20.5 IPv6 地址配置",
          "kind": "reading",
          "reading": "20.5 IPv6 地址配置",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "20.6",
          "title": "20.6 本章总结",
          "kind": "reading",
          "reading": "20.6 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-21",
      "title": "第 21 章 IP 路由原理",
      "unit": "第 5 篇 配置 IP 路由",
      "packs": [
        {
          "id": "21.1",
          "title": "21.1 本章目标",
          "kind": "reading",
          "reading": "21.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.2",
          "title": "21.2 什么是路由",
          "kind": "reading",
          "reading": "21.2 什么是路由",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.3",
          "title": "21.3 路由表",
          "kind": "reading",
          "reading": "21.3 路由表",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.4",
          "title": "21.4 路由器单跳操作",
          "kind": "reading",
          "reading": "21.4 路由器单跳操作",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.5",
          "title": "21.5 路由的来源",
          "kind": "reading",
          "reading": "21.5 路由的来源",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.6",
          "title": "21.6 路由的度量",
          "kind": "reading",
          "reading": "21.6 路由的度量",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.7",
          "title": "21.7 路由优先级",
          "kind": "reading",
          "reading": "21.7 路由优先级",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.8",
          "title": "21.8 路由环路",
          "kind": "reading",
          "reading": "21.8 路由环路",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.9",
          "title": "21.9 查看设备的路由表",
          "kind": "reading",
          "reading": "21.9 查看设备的路由表",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "21.10",
          "title": "21.10 本章总结",
          "kind": "reading",
          "reading": "21.10 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-22",
      "title": "第 22 章 直连路由和静态路由",
      "unit": "第 5 篇 配置 IP 路由",
      "packs": [
        {
          "id": "22.1",
          "title": "22.1 本章目标",
          "kind": "reading",
          "reading": "22.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "22.2",
          "title": "22.2 直连路由",
          "kind": "reading",
          "reading": "22.2 直连路由",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "22.3",
          "title": "22.3 VLAN 间路由",
          "kind": "reading",
          "reading": "22.3 VLAN 间路由",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "22.3.1 不适当的 VLAN 间路由方式",
            "22.3.2 用 802.1Q 和子接口实现 VLAN 间路由",
            "22.3.3 用三层交换机实现 VLAN 间路由"
          ]
        },
        {
          "id": "22.4",
          "title": "22.4 静态路由",
          "kind": "reading",
          "reading": "22.4 静态路由",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "22.4.1 静态路由配置",
            "22.4.2 静态路由配置示例"
          ]
        },
        {
          "id": "22.5",
          "title": "22.5 静态默认路由的配置",
          "kind": "reading",
          "reading": "22.5 静态默认路由的配置",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "22.6",
          "title": "22.6 用静态路由实现路由备份和负载分担",
          "kind": "reading",
          "reading": "22.6 用静态路由实现路由备份和负载分担",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "22.7",
          "title": "22.7 静态黑洞路由的应用",
          "kind": "reading",
          "reading": "22.7 静态黑洞路由的应用",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "22.8",
          "title": "22.8 本章总结",
          "kind": "reading",
          "reading": "22.8 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-23",
      "title": "第 23 章 路由协议概述",
      "unit": "第 5 篇 配置 IP 路由",
      "packs": [
        {
          "id": "23.1",
          "title": "23.1 本章目标",
          "kind": "reading",
          "reading": "23.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "23.2",
          "title": "23.2 可路由协议与路由协议",
          "kind": "reading",
          "reading": "23.2 可路由协议与路由协议",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "23.3",
          "title": "23.3 路由协议概述",
          "kind": "reading",
          "reading": "23.3 路由协议概述",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "23.3.1 路由协议在协议栈中的位置",
            "23.3.2 路由协议的基本原理",
            "23.3.3 路由协议的分类"
          ]
        },
        {
          "id": "23.4",
          "title": "23.4 衡量路由协议的主要指标",
          "kind": "reading",
          "reading": "23.4 衡量路由协议的主要指标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "23.5",
          "title": "23.5 本章总结",
          "kind": "reading",
          "reading": "23.5 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-24",
      "title": "第 24 章 OSPF 基础",
      "unit": "第 5 篇 配置 IP 路由",
      "packs": [
        {
          "id": "24.1",
          "title": "24.1 本章目标",
          "kind": "reading",
          "reading": "24.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "24.2",
          "title": "24.2 OSPF 基本原理",
          "kind": "reading",
          "reading": "24.2 OSPF 基本原理",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "24.2.1 什么是 OSPF",
            "24.2.2 OSPF 协议工作过程概述",
            "24.2.3 寻找邻居",
            "24.2.4 建立邻接关系",
            "24.2.5 链路状态信息传递",
            "24.2.6 路由计算",
            "24.2.7 OSPF 分区域管理"
          ]
        },
        {
          "id": "24.3",
          "title": "24.3 配置 OSPF",
          "kind": "reading",
          "reading": "24.3 配置 OSPF",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "24.3.1 OSPF 基本配置命令",
            "24.3.2 OSPF 可选配置命令",
            "24.3.3 单区域 OSPF 配置示例一",
            "24.3.4 单区域 OSPF 配置示例二",
            "24.3.5 多区域 OSPF 配置示例"
          ]
        },
        {
          "id": "24.4",
          "title": "24.4 OSPF 信息显示与调试",
          "kind": "reading",
          "reading": "24.4 OSPF 信息显示与调试",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "24.4.1 OSPF 信息显示",
            "24.4.2 调试 OSPF"
          ]
        },
        {
          "id": "24.5",
          "title": "24.5 本章总结",
          "kind": "reading",
          "reading": "24.5 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-25",
      "title": "第 25 章 用访问控制列表实现包过滤",
      "unit": "第 6 篇 配置安全的分支网络",
      "packs": [
        {
          "id": "25.1",
          "title": "25.1 本章目标",
          "kind": "reading",
          "reading": "25.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "25.2",
          "title": "25.2 ACL 概述",
          "kind": "reading",
          "reading": "25.2 ACL 概述",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "25.3",
          "title": "25.3 基于 ACL 的包过滤",
          "kind": "reading",
          "reading": "25.3 基于 ACL 的包过滤",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "25.3.1 基本工作原理",
            "25.3.2 ACL 包过滤工作流程",
            "25.3.3 通配符掩码"
          ]
        },
        {
          "id": "25.4",
          "title": "25.4 ACL 分类",
          "kind": "reading",
          "reading": "25.4 ACL 分类",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "25.4.1 ACL 的标识",
            "25.4.2 基本 ACL",
            "25.4.3 高级 ACL",
            "25.4.4 二层 ACL"
          ]
        },
        {
          "id": "25.5",
          "title": "25.5 配置 ACL 包过滤",
          "kind": "reading",
          "reading": "25.5 配置 ACL 包过滤",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "25.5.1 ACL 包过滤配置任务",
            "25.5.2 设置包过滤规则",
            "25.5.3 配置基本 ACL",
            "25.5.4 配置高级 ACL",
            "25.5.5 配置二层 ACL",
            "25.5.6 在接口上应用 ACL",
            "25.5.7 ACL 包过滤信息显示与调试"
          ]
        },
        {
          "id": "25.6",
          "title": "25.6 ACL 包过滤的注意事项",
          "kind": "reading",
          "reading": "25.6 ACL 包过滤的注意事项",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "25.6.1 ACL 规则的匹配顺序",
            "25.6.2 在网络中的正确位置配置 ACL 包过滤",
            "25.6.3 ACL 包过滤的局限性"
          ]
        },
        {
          "id": "25.7",
          "title": "25.7 本章总结",
          "kind": "reading",
          "reading": "25.7 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-26",
      "title": "第 26 章 网络地址转换",
      "unit": "第 6 篇 配置安全的分支网络",
      "packs": [
        {
          "id": "26.1",
          "title": "26.1 本章目标",
          "kind": "reading",
          "reading": "26.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "26.2",
          "title": "26.2 NAT 概述",
          "kind": "reading",
          "reading": "26.2 NAT 概述",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "26.2.1 公有地址和私有地址",
            "26.2.2 NAT 组网和常用术语"
          ]
        },
        {
          "id": "26.3",
          "title": "26.3 BASIC NAT",
          "kind": "reading",
          "reading": "26.3 BASIC NAT",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "26.3.1 Basic NAT 原理",
            "26.3.2 配置 Basic NAT",
            "26.3.3 Basic NAT 配置示例"
          ]
        },
        {
          "id": "26.4",
          "title": "26.4 NAPT",
          "kind": "reading",
          "reading": "26.4 NAPT",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "26.4.1 NAPT 原理",
            "26.4.2 配置 NAPT",
            "26.4.3 NAPT 配置示例"
          ]
        },
        {
          "id": "26.5",
          "title": "26.5 EASY IP",
          "kind": "reading",
          "reading": "26.5 EASY IP",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "26.5.1 Easy IP 原理",
            "26.5.2 配置 Easy IP",
            "26.5.3 Easy IP 配置示例"
          ]
        },
        {
          "id": "26.6",
          "title": "26.6 NAT Server",
          "kind": "reading",
          "reading": "26.6 NAT Server",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "26.6.1 NAT Server 原理",
            "26.6.2 配置 NAT Server",
            "26.6.3 NAT Server 配置示例"
          ]
        },
        {
          "id": "26.7",
          "title": "26.7 NAT ALG",
          "kind": "reading",
          "reading": "26.7 NAT ALG",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "26.8",
          "title": "26.8 NAT 的信息显示和调试",
          "kind": "reading",
          "reading": "26.8 NAT 的信息显示和调试",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "26.9",
          "title": "26.9 本章总结",
          "kind": "reading",
          "reading": "26.9 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-27",
      "title": "第 27 章 广域网基本原理",
      "unit": "第 7 篇 广域网接入和互连",
      "packs": [
        {
          "id": "27.1",
          "title": "27.1 本章目标",
          "kind": "reading",
          "reading": "27.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "27.2",
          "title": "27.2 广域网的作用",
          "kind": "reading",
          "reading": "27.2 广域网的作用",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "27.3",
          "title": "27.3 广域网基本概念",
          "kind": "reading",
          "reading": "27.3 广域网基本概念",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "27.3.1 广域网与 OSI 参考模型",
            "27.3.2 广域网连接方式",
            "27.3.3 广域网络设备角色",
            "27.3.4 广域网技术应用"
          ]
        },
        {
          "id": "27.4",
          "title": "27.4 本章总结",
          "kind": "reading",
          "reading": "27.4 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-28",
      "title": "第 28 章 配置 PPP",
      "unit": "第 7 篇 广域网接入和互连",
      "packs": [
        {
          "id": "28.1",
          "title": "28.1 本章目标",
          "kind": "reading",
          "reading": "28.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "28.2",
          "title": "28.2 PPP 协议概述",
          "kind": "reading",
          "reading": "28.2 PPP 协议概述",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "28.2.1 PPP 基本概念",
            "28.2.2 PPP 的特点",
            "28.2.3 PPP 协议的组成"
          ]
        },
        {
          "id": "28.3",
          "title": "28.3 PPP 协议会话",
          "kind": "reading",
          "reading": "28.3 PPP 协议会话",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "28.3.1 PPP 会话建立的过程",
            "28.3.2 PPP 会话流程"
          ]
        },
        {
          "id": "28.4",
          "title": "28.4 PPP 验证",
          "kind": "reading",
          "reading": "28.4 PPP 验证",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "28.4.1 PAP 验证",
            "28.4.2 CHAP 验证",
            "28.4.3 PAP 与 CHAP 的对比"
          ]
        },
        {
          "id": "28.5",
          "title": "28.5 配置 PPP",
          "kind": "reading",
          "reading": "28.5 配置 PPP",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "28.5.1 PPP 基本配置",
            "28.5.2 配置 PPP PAP 验证",
            "28.5.3 配置 PPP CHAP 验证",
            "28.5.4 PPP 配置示例"
          ]
        },
        {
          "id": "28.6",
          "title": "28.6 PPP 协议显示与调试",
          "kind": "reading",
          "reading": "28.6 PPP 协议显示与调试",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "28.7",
          "title": "28.7 本章总结",
          "kind": "reading",
          "reading": "28.7 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-29",
      "title": "第 29 章 以太网接入",
      "unit": "第 7 篇 广域网接入和互连",
      "packs": [
        {
          "id": "29.1",
          "title": "29.1 本章目标",
          "kind": "reading",
          "reading": "29.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "29.2",
          "title": "29.2 以太网接入的典型应用",
          "kind": "reading",
          "reading": "29.2 以太网接入的典型应用",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "29.3",
          "title": "29.3 PPPoE 原理及配置",
          "kind": "reading",
          "reading": "29.3 PPPoE 原理及配置",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "29.3.1 PPPoE 原理",
            "29.3.2 PPPoE 的配置命令",
            "29.3.3 PPPoE 典型配置实例"
          ]
        },
        {
          "id": "29.4",
          "title": "29.4 本章总结",
          "kind": "reading",
          "reading": "29.4 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-30",
      "title": "第 30 章 SR 技术基础",
      "unit": "第 7 篇 广域网接入和互连",
      "packs": [
        {
          "id": "30.1",
          "title": "30.1 本章目标",
          "kind": "reading",
          "reading": "30.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "30.2",
          "title": "30.2 SR 技术产生的背景",
          "kind": "reading",
          "reading": "30.2 SR 技术产生的背景",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "30.2.1 IP 转发的问题",
            "30.2.2 MPLS 转发的特点和劣势",
            "30.2.3 SR 技术的优势"
          ]
        },
        {
          "id": "30.3",
          "title": "30.3 SR 基本概念及工作原理",
          "kind": "reading",
          "reading": "30.3 SR 基本概念及工作原理",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "30.3.1 SR 基本概念",
            "30.3.2 SR 转发方式案例"
          ]
        },
        {
          "id": "30.4",
          "title": "30.4 SR 应用场景",
          "kind": "reading",
          "reading": "30.4 SR 应用场景",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "30.5",
          "title": "30.5 本章总结",
          "kind": "reading",
          "reading": "30.5 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-31",
      "title": "第 31 章 配置 4G/5G",
      "unit": "第 7 篇 广域网接入和互连",
      "packs": [
        {
          "id": "31.1",
          "title": "31.1 本章目标",
          "kind": "reading",
          "reading": "31.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "31.2",
          "title": "31.2 4G/5G 技术概述",
          "kind": "reading",
          "reading": "31.2 4G/5G 技术概述",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "31.2.1 4G/5G 基本概念",
            "31.2.2 4G/5G 技术标准",
            "31.2.3 4G/5G 频段划分"
          ]
        },
        {
          "id": "31.3",
          "title": "31.3 4G/5G 接入方式",
          "kind": "reading",
          "reading": "31.3 4G/5G 接入方式",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "31.3.1 4G/5G 接入方式",
            "31.3.2 SIM 卡接入",
            "31.3.3 USB Modem 接入",
            "31.3.4 SIC-4G/5G 模块接入"
          ]
        },
        {
          "id": "31.4",
          "title": "31.4 配置 4G/5G",
          "kind": "reading",
          "reading": "31.4 配置 4G/5G",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "31.4.1 4G/5G 基本配置",
            "31.4.2 4G/5G 配置示例"
          ]
        },
        {
          "id": "31.5",
          "title": "31.5 4G/5G 的显示与调试",
          "kind": "reading",
          "reading": "31.5 4G/5G 的显示与调试",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "31.6",
          "title": "31.6 本章总结",
          "kind": "reading",
          "reading": "31.6 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-32",
      "title": "第 32 章 虚拟化技术基础",
      "unit": "第 8 篇 网络技术发展",
      "packs": [
        {
          "id": "32.1",
          "title": "32.1 本章目标",
          "kind": "reading",
          "reading": "32.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "32.2",
          "title": "32.2 虚拟化技术",
          "kind": "reading",
          "reading": "32.2 虚拟化技术",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "32.2.1 传统数据中心挑战",
            "32.2.2 数据中心虚拟化实现",
            "32.2.3 虚拟化的特点",
            "32.2.4 虚拟化的优势与不足"
          ]
        },
        {
          "id": "32.3",
          "title": "32.3 计算虚拟化",
          "kind": "reading",
          "reading": "32.3 计算虚拟化",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "32.3.1 计算虚拟化概念",
            "32.3.2 寄居虚拟化",
            "32.3.3 裸金属虚拟化",
            "32.3.4 操作系统虚拟化"
          ]
        },
        {
          "id": "32.4",
          "title": "32.4 存储虚拟化",
          "kind": "reading",
          "reading": "32.4 存储虚拟化",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "32.4.1 存储虚拟化定义",
            "32.4.2 基于主机的虚拟化",
            "32.4.3 基于存储设备的虚拟化"
          ]
        },
        {
          "id": "32.5",
          "title": "32.5 网络虚拟化",
          "kind": "reading",
          "reading": "32.5 网络虚拟化",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "32.5.1 网络虚拟化分类",
            "32.5.2 虚拟网卡",
            "32.5.3 虚拟交换机",
            "32.5.4 硬件设备虚拟化",
            "32.5.5 虚拟网络"
          ]
        },
        {
          "id": "32.6",
          "title": "32.6 本章总结",
          "kind": "reading",
          "reading": "32.6 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-33",
      "title": "第 33 章 SDN 概述",
      "unit": "第 8 篇 网络技术发展",
      "packs": [
        {
          "id": "33.1",
          "title": "33.1 本章目标",
          "kind": "reading",
          "reading": "33.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "33.2",
          "title": "33.2 SDN 的由来",
          "kind": "reading",
          "reading": "33.2 SDN 的由来",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "33.2.1 计算机产业现状",
            "33.2.2 传统网络架构",
            "33.2.3 传统网络面临的问题",
            "33.2.4 SDN 思想诞生"
          ]
        },
        {
          "id": "33.3",
          "title": "33.3 SDN 基本概念",
          "kind": "reading",
          "reading": "33.3 SDN 基本概念",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "33.3.1 SDN 的起源-OpenFlow",
            "33.3.2 流表",
            "33.3.3 传统网络与 SDN 网络转发方式对比",
            "33.3.4 SDN 定义及特点",
            "33.3.5 SDN 网络架构"
          ]
        },
        {
          "id": "33.4",
          "title": "33.4 SDN 的价值",
          "kind": "reading",
          "reading": "33.4 SDN 的价值",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "33.4.1 SDN 网络价值",
            "33.4.2 SDN 网络演进"
          ]
        },
        {
          "id": "33.5",
          "title": "33.5 本章总结",
          "kind": "reading",
          "reading": "33.5 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    },
    {
      "id": "h3c-lower-ch-34",
      "title": "第 34 章 NFV 概述",
      "unit": "第 8 篇 网络技术发展",
      "packs": [
        {
          "id": "34.1",
          "title": "34.1 本章目标",
          "kind": "reading",
          "reading": "34.1 本章目标",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        },
        {
          "id": "34.2",
          "title": "34.2 NFV 基本概念",
          "kind": "reading",
          "reading": "34.2 NFV 基本概念",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "34.2.1 NFV 产生背景",
            "34.2.2 NFV 起源",
            "34.2.3 NFV 基本概念",
            "34.2.4 NFV 价值",
            "34.2.5 NFV 与 SDN 的区别"
          ]
        },
        {
          "id": "34.3",
          "title": "34.3 NFV 架构及 H3C 的 NFV 实现",
          "kind": "reading",
          "reading": "34.3 NFV 架构及 H3C 的 NFV 实现",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": [
            "34.3.1 NFV 架构",
            "34.3.2 H3C NFV 架构"
          ]
        },
        {
          "id": "34.4",
          "title": "34.4 本章总结",
          "kind": "reading",
          "reading": "34.4 本章总结",
          "minutes": "",
          "output": "",
          "bookPractice": "",
          "questions": [],
          "base": true,
          "outline": []
        }
      ]
    }
  ]
};
