import type { Book } from '../reading';

export const ddia: Book = {
  id: 'ddia',
  title: 'Designing Data-Intensive Application',
  title_zh: '数据密集型应用系统设计',
  author: 'Martin Kleppmann',
  author_zh: 'Martin Kleppmann',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      title_zh: '概述',
      content: [
        {
          type: 'paragraph',
          text: 'This book explores the fundamental ideas behind reliable, scalable, and maintainable data systems. It bridges the gap between distributed systems theory and real-world engineering practice.',
          text_zh: '本书探讨了可靠、可扩展、可维护的数据系统背后的核心思想，弥合了分布式系统理论与实际工程实践之间的鸿沟。',
        },
        {
          type: 'quote',
          text: 'A data-intensive application is typically built from standard building blocks that provide commonly needed functionality.',
          text_zh: '数据密集型应用通常由提供常用功能的标准构建块组合而成。',
          source: 'Preface',
          source_zh: '前言',
        },
      ],
    },
    {
      id: 'part1',
      title: 'Part I — Foundations of Data Systems',
      title_zh: '第一部分——数据系统基础',
      content: [
        {
          type: 'paragraph',
          text: 'The first part covers the fundamental concepts that apply to all data systems, whether running on a single machine or distributed across many.',
          text_zh: '第一部分涵盖了适用于所有数据系统的基本概念，无论是运行在单机上还是分布在多台机器上。',
        },
      ],
      subsections: [
        {
          id: 'part1-reliability',
          title: 'Reliability',
          title_zh: '可靠性',
          content: [
            {
              type: 'paragraph',
              text: 'The system should continue to work correctly even when things go wrong — hardware faults, software bugs, and human errors.',
              text_zh: '系统应当在出现问题时——硬件故障、软件缺陷、人为错误——仍然能够正确工作。',
            },
            {
              type: 'heading',
              text: 'What is a Fault?',
              text_zh: '什么是故障（Fault）？',
            },
            {
              type: 'paragraph',
              text: 'Things that can go wrong are called faults, and systems that can cope with faults are called fault-tolerant or resilient. The term is slightly misleading: it suggests a system can tolerate every possible kind of fault, which is obviously not realistic. If the entire planet (and all servers on it) were swallowed by a black hole, tolerating that fault would require web-hosting in space — so fault tolerance only makes sense in terms of specific types of faults.',
              text_zh: '可能出错的事情称为错误（faults）或故障，系统可应对错误则称为容错（fault-tolerant）或者弹性（resilient）。前一个词略显误导：似乎暗示着系统可以容忍各种可能的故障类型，显然实际中这是不可能的。举一个夸张一些的例子，如果整个地球（及其上的所有服务器）都被黑洞吞噬，那么要在这个级别容错就意味着必须在宇宙范围内进行系统冗余。试想，这将是天价的预算。因此，容错总是指特定类型的故障，这样的系统才更有实际意义。',
            },
            {
              type: 'heading',
              text: 'Types of Faults',
              text_zh: '故障的类型',
            },
            {
              type: 'list',
              items: [
                'Hardware faults: disk crashes, power outages — use redundancy (RAID, dual power, hot-swap CPUs).',
                'Software errors: systematic bugs are harder to anticipate than hardware faults, and tend to cause correlated failures across nodes.',
                'Human errors: the leading cause of outages. Mitigate with good abstractions, sandbox environments, testing, and easy rollback.',
              ],
              items_zh: [
                '硬件故障：磁盘损坏、断电——使用冗余（RAID、双路电源、热插拔 CPU）。',
                '软件错误：系统性缺陷比硬件故障更难预料，且容易导致跨节点的关联性故障。',
                '人为错误：宕机的首要原因。通过良好的抽象、沙盒环境、测试和便捷回滚来缓解。',
              ],
            },
          ],
        },
        {
          id: 'part1-scalability',
          title: 'Scalability',
          title_zh: '可扩展性',
          content: [
            {
              type: 'paragraph',
              text: 'Scalability is not a one-dimensional label — it means having strategies for coping with growth in data volume, traffic, or complexity.',
              text_zh: '可扩展性不是一个一维的标签——它意味着拥有应对数据量、流量或复杂度增长的策略。',
            },
            {
              type: 'quote',
              text: 'An architecture that scales well for a particular application is built around assumptions of which operations will be common and which will be rare.',
              text_zh: '一个能良好扩展的架构是围绕"哪些操作常见、哪些操作罕见"的假设构建的。',
            },
          ],
        },
        {
          id: 'part1-maintainability',
          title: 'Maintainability',
          title_zh: '可维护性',
          content: [
            {
              type: 'paragraph',
              text: 'The majority of software cost is in ongoing maintenance. Good design minimizes pain for the people who need to work on the system in the future.',
              text_zh: '软件的大部分成本在于持续维护。好的设计能最大限度减少未来维护者的痛苦。',
            },
            {
              type: 'list',
              items: [
                'Operability: make it easy for ops teams to keep the system running smoothly.',
                'Simplicity: manage complexity with good abstractions — remove accidental complexity.',
                'Evolvability: make it easy to adapt the system to new requirements.',
              ],
              items_zh: [
                '可运维性：让运维团队能轻松保持系统平稳运行。',
                '简洁性：用好的抽象管理复杂度——消除偶发复杂性。',
                '可演化性：让系统易于适应新需求。',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'reflection',
      title: 'Personal Reflection',
      title_zh: '个人感悟',
      content: [
        {
          type: 'paragraph',
          text: 'DDIA changed how I reason about system design trade-offs. The clarity with which Kleppmann explains consistency models, replication strategies, and partitioning schemes makes this an essential reference for anyone building distributed systems.',
          text_zh: 'DDIA 改变了我对系统设计权衡的思考方式。Kleppmann 对一致性模型、复制策略和分区方案的清晰讲解，使这本书成为所有构建分布式系统的人的必备参考。',
        },
      ],
    },
  ],
};
