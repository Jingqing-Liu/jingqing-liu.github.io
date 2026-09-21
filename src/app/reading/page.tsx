import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import { books } from '../../data/reading';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ReadingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f2f2f7] pb-24 pt-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]" style={{ background: 'radial-gradient(ellipse at 25% 0%, #c7b8ea33, transparent 55%), radial-gradient(ellipse at 85% 20%, #a8d8ff33, transparent 50%)' }} />
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <header className="pb-16 text-center md:pb-20">
          <span className="liquid-glass-pill mb-6 inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wider text-[#48484a]">
            <BookOpen size={14} className="text-[#007aff]" />
            阅读与思考
          </span>
          <h1 className="mb-6 text-[2.625rem] font-bold leading-tight tracking-tight text-[#1c1c1e] md:text-[4.25rem]">读书笔记</h1>
          <p className="text-base leading-relaxed text-[#48484a]">逐章阅读，逐题思考。把理解留在这里。</p>
        </header>

        <section aria-labelledby="book-list-title">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 id="book-list-title" className="text-xs font-medium tracking-wider text-[#8e8e93]">阅读列表</h2>
            <span className="text-xs tabular-nums text-[#aeaeb2]">{books.length} 本书</span>
          </div>
          <ul className="divide-y divide-[#c6c6c8]/40 border-y border-[#c6c6c8]/40">
            {books.map((book, index) => (
              <li key={book.id}>
                <Link href={`/books/${book.id}/`} className="group -mx-3 flex items-start gap-4 rounded-xl px-3 py-8 text-inherit no-underline transition-colors duration-200 hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007aff] md:gap-7 md:py-10">
                  <span aria-hidden="true" className="hidden pt-1.5 font-mono text-xs text-[#aeaeb2] sm:block">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold leading-snug tracking-tight text-[#1c1c1e] transition-colors group-hover:text-[#007aff] md:text-2xl">{book.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#8e8e93]">{book.author}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#8e8e93]">
                      <span className="inline-flex items-center gap-1.5"><BookOpen size={13} className="text-[#007aff]/70" />{book.sections.length} 个章节</span>
                      <span aria-hidden="true" className="text-[#c6c6c8]">/</span>
                      <span>复习题 · 习题 · 实验</span>
                    </div>
                  </div>
                  <span className="mt-1 flex shrink-0 items-center gap-2 text-[#aeaeb2] transition-colors group-hover:text-[#007aff]">
                    <span className="hidden text-xs md:inline">查看笔记</span>
                    <ArrowUpRight size={18} className="transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
