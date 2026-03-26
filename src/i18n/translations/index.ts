import { nav } from './nav';
import { home } from './home';
import { education } from './education';
import { research } from './research';
import { experience } from './experience';
import { reading } from './reading';
import { cats } from './cats';
import { footer } from './footer';

type Lang = 'en' | 'zh';

const modules = [nav, home, education, research, experience, reading, cats, footer];

export const translations: Record<Lang, Record<string, string>> = {
  en: Object.assign({}, ...modules.map((m) => m.en)),
  zh: Object.assign({}, ...modules.map((m) => m.zh)),
};
