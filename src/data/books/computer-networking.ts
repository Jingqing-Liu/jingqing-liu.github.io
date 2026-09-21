import type { Book, ContentBlock } from '../reading';

interface Chapter {
  title: string;
  reviewQuestions: ContentBlock[];
  problems: ContentBlock[];
  labs: ContentBlock[];
}

// 第八版目录：https://gaia.cs.umass.edu/kurose_ross/Kurose_Ross_TOC_8E.pdf
// 在对应章节的 reviewQuestions、problems、labs 中添加内容。
// 题目示例（将占位文本替换为自己的题目与解答后加入数组）：
// { type: 'question', number: 'R1', text: '题目', answer: '我的解答' }
// 习题使用 P1、P2 等编号；answer 留空时显示“待解答”。
// text 和 answer 按原文填写，不区分语言；答案支持换行。
export const networkingChapters: Chapter[] = [
  {
    title: '计算机网络和因特网',
    reviewQuestions: [
      { type: 'question', number: 'R1', text: '题目', answer: `我的解答` }
    ], problems: [], labs: [],
  },
  {
    title: '应用层',
    reviewQuestions: [], problems: [], labs: [],
  },
  {
    title: '运输层',
    reviewQuestions: [], problems: [], labs: [],
  },
  {
    title: '网络层：数据平面',
    reviewQuestions: [], problems: [], labs: [],
  },
  {
    title: '网络层：控制平面',
    reviewQuestions: [], problems: [], labs: [],
  },
  {
    title: '链路层和局域网',
    reviewQuestions: [], problems: [], labs: [],
  },
  {
    title: '无线网络和移动网络',
    reviewQuestions: [], problems: [], labs: [],
  },
  {
    title: '计算机网络中的安全',
    reviewQuestions: [], problems: [], labs: [],
  },
];

export const computerNetworking: Book = {
  id: 'computer-networking',
  title: '计算机网络：自顶向下方法 · 第八版',
  author: 'James F. Kurose · Keith W. Ross',
  sections: networkingChapters.map((chapter, index) => {
    const id = `networking-chapter-${index + 1}`;
    return {
      id,
      title: `第 ${index + 1} 章 · ${chapter.title}`,
      subsections: [
        { id: `${id}-review`, title: '复习题', content: chapter.reviewQuestions },
        { id: `${id}-problems`, title: '习题', content: chapter.problems },
        { id: `${id}-labs`, title: '实验', content: chapter.labs },
      ],
    };
  }),
};
