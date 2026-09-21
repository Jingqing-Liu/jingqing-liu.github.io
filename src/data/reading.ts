export interface ContentBlock {
  type: 'question';
  number: string;
  text: string;
  answer?: string;
}

export interface BookSubSection {
  id: string;
  title: string;
  content: ContentBlock[];
}

export interface BookSection {
  id: string;
  title: string;
  subsections: BookSubSection[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  sections: BookSection[];
}

export { books } from './books';
