'use client';

import { useState } from 'react';
import styles from './BookDetail.module.css';
import Link from 'next/link';
import type { Book, ContentBlock } from '../data/reading';

function Question({ question }: { question?: ContentBlock }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#c6c6c8]/40 bg-white/70">
      {question && (
        <div className="border-b border-[#c6c6c8]/30 px-4 py-2.5 text-xs font-mono text-[#007aff]">
          {question.number}
        </div>
      )}
      <div className="p-4">
        <h5 className="mb-2 text-xs font-semibold text-[#8e8e93]">题目</h5>
        <p className="whitespace-pre-wrap break-words text-xs leading-6 text-[#1c1c1e]">
          {question?.text || '待补充题目。'}
        </p>
      </div>
      <div className="border-t border-[#c6c6c8]/30 bg-[#007aff]/[0.025] p-4">
        <h5 className="mb-2 text-xs font-semibold text-[#007aff]">答案</h5>
        <p className="whitespace-pre-wrap break-words text-xs leading-6 text-[#48484a]">
          {question?.answer || '待解答。'}
        </p>
      </div>
    </article>
  );
}

export default function BookDetail({ book }: { book: Book }) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const chapter = book.sections[chapterIndex];
  const section = chapter?.subsections[sectionIndex];

  return (
    <main className={`${styles.page} min-h-screen bg-[#f2f2f7] pb-20 pt-24`}>
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Link href="/books/" className="text-xs text-[#007aff] no-underline">← 返回阅读列表</Link>
        <header className="mb-6 mt-5">
          <p className="mb-3 text-xs tracking-widest text-[#8e8e93]">读书笔记 / {book.sections.length} 章</p>
          <h1 className="text-base font-medium leading-snug tracking-tight text-[#1c1c1e] md:text-lg">{book.title}</h1>
          <p className="mt-2 text-xs text-[#8e8e93]">{book.author}</p>
        </header>
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <aside className="md:sticky md:top-24 md:w-60 md:shrink-0 md:self-start">
            <h2 className="mb-3 text-xs font-semibold text-[#8e8e93]">章节目录</h2>
            <nav aria-label="章节目录" className="flex gap-2 overflow-x-auto pb-2 md:max-h-[calc(100dvh-10rem)] md:flex-col md:overflow-y-auto">
              {book.sections.map((item, index) => (
                <button key={item.id} aria-current={index === chapterIndex ? 'true' : undefined}
                  onClick={() => { setChapterIndex(index); setSectionIndex(0); }}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left text-xs transition-colors md:shrink ${index === chapterIndex ? 'bg-[#007aff]/10 font-medium text-[#007aff]' : 'text-[#48484a] hover:bg-white/70'}`}>
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 flex-1">
            <h2 className="mb-3 text-sm font-medium text-[#1c1c1e]">{chapter?.title}</h2>
            <div aria-label="内容分类" className="mb-5 flex gap-2 rounded-xl bg-[#e5e5ea]/60 p-1.5">
              {chapter?.subsections.map((item, index) => (
                <button key={item.id} aria-pressed={index === sectionIndex} aria-controls="book-content"
                  onClick={() => setSectionIndex(index)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs transition-colors ${index === sectionIndex ? 'bg-white font-semibold text-[#007aff] shadow-sm' : 'text-[#8e8e93] hover:text-[#48484a]'}`}>
                  {item.title}
                </button>
              ))}
            </div>
            {section && (
              <section id="book-content" aria-labelledby="content-title" key={section.id}>
                <h3 id="content-title" className="mb-4 text-xs font-medium text-[#48484a]">{section.title} <span className="ml-2 text-xs text-[#8e8e93]">{section.content.length} 项</span></h3>
                <div className="space-y-4">
                  {section.content.length ? section.content.map((question) => <Question key={question.number} question={question} />) : (
                    <div className="rounded-xl border border-dashed border-[#c6c6c8] bg-white/40 px-6 py-12 text-center">
                      <p className="text-xs text-[#8e8e93]">本章{section.title}尚未整理。</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
