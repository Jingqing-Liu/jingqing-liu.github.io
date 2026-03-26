export type ContentBlock =
  | { type: 'paragraph'; text: string; text_zh?: string }
  | { type: 'quote'; text: string; text_zh?: string; source?: string; source_zh?: string }
  | { type: 'list'; items: string[]; items_zh?: string[] }
  | { type: 'heading'; text: string; text_zh?: string };

export interface BookSubSection {
  id: string;
  title: string;
  title_zh?: string;
  content: ContentBlock[];
}

export interface BookSection {
  id: string;
  title: string;
  title_zh?: string;
  content: ContentBlock[];
  subsections?: BookSubSection[];
}

export interface Book {
  id: string;
  title: string;
  title_zh?: string;
  author: string;
  author_zh?: string;
  cover?: string;
  sections: BookSection[];
}

// Re-export the book list from individual files
export { books } from './books';
