/** A small, versioned JSON format stored in the existing answer text column. */
export const RICH_ANSWER_PREFIX = 'study-rich-v1:';
export const RICH_ANSWER_LIMIT = 20_000;
// Parse oversized local drafts too; saving still uses the separate UI limit.
const MAX_ENCODED_DRAFT = 1_000_000;
export const RICH_FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px'] as const;
export const RICH_TABLE_MAX_ROWS = 20;
export const RICH_TABLE_MAX_COLUMNS = 12;

type RichAttribute = string | number | null | number[];
export interface RichMark { type: string; attrs?: Record<string, RichAttribute> }
export interface RichNode {
  type: string;
  attrs?: Record<string, RichAttribute>;
  content?: RichNode[];
  marks?: RichMark[];
  text?: string;
}
export interface RichDocument extends RichNode { type: 'doc'; content: RichNode[] }

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : null;
const paragraph = (content: RichNode[] = []): RichNode => content.length ? { type: 'paragraph', content } : { type: 'paragraph' };
const plainMarks = new Set(['bold', 'italic', 'strike', 'underline', 'code', 'superscript', 'subscript']);
const inlineTypes = new Set(['text', 'hardBreak', 'inlineMath']);
const MAX_DEPTH = 16;
const MAX_NODES = 2_000;
const MAX_TEXT = 100_000;
const MAX_LATEX = 4_000;

/** Only explicit colors are persisted, never arbitrary CSS expressions. */
export function safeRichColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const color = value.trim().toLowerCase();
  if (/^#[\da-f]{6}$/.test(color)) return color;
  if (/^#[\da-f]{3}$/.test(color)) return `#${[...color.slice(1)].map(char => char + char).join('')}`;
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(color);
  if (rgb && rgb.slice(1).every(channel => Number(channel) <= 255)) return `#${rgb.slice(1).map(channel => Number(channel).toString(16).padStart(2, '0')).join('')}`;
  return null;
}

/** No relative, data, javascript, credential-bearing, or control-character URLs. */
export function safeRichLink(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2_048) return null;
  const href = value.trim();
  if (/[\u0000-\u0020\u007f<>\\]/.test(href)) return null;
  try {
    const url = new URL(href);
    if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname && !url.username && !url.password) return url.href;
    if (url.protocol === 'mailto:' && /^[^?\s@]+@[^?\s@]+\.[^?\s@]+$/.test(url.pathname) && !url.search && !url.hash) return url.href;
  } catch { /* Invalid URLs are discarded. */ }
  return null;
}

function marksFrom(value: unknown): RichMark[] {
  if (!Array.isArray(value)) return [];
  const marks: RichMark[] = [];
  const seen = new Set<string>();
  for (const entry of value.slice(0, 20)) {
    const mark = object(entry);
    if (!mark || typeof mark.type !== 'string' || seen.has(mark.type)) continue;
    let next: RichMark | null = null;
    const attrs = object(mark.attrs) || {};
    if (plainMarks.has(mark.type)) next = { type: mark.type };
    if (mark.type === 'textStyle') {
      const style: Record<string, RichAttribute> = {};
      const color = safeRichColor(attrs.color);
      if (color) style.color = color;
      if (typeof attrs.fontSize === 'string' && (RICH_FONT_SIZES as readonly string[]).includes(attrs.fontSize)) style.fontSize = attrs.fontSize;
      if (Object.keys(style).length) next = { type: 'textStyle', attrs: style };
    }
    if (mark.type === 'highlight') {
      const color = safeRichColor(attrs.color);
      next = color ? { type: 'highlight', attrs: { color } } : { type: 'highlight' };
    }
    if (mark.type === 'link') {
      const href = safeRichLink(attrs.href);
      if (href) next = { type: 'link', attrs: { href, target: '_blank', rel: 'noopener noreferrer nofollow' } };
    }
    if (next) { marks.push(next); seen.add(mark.type); }
  }
  return marks;
}

function inlineContent(nodes: RichNode[]): RichNode[] {
  const result: RichNode[] = [];
  for (const node of nodes) {
    if (inlineTypes.has(node.type)) result.push(node);
    else if (node.type === 'blockMath') result.push({ type: 'inlineMath', attrs: node.attrs });
    else if (node.content) {
      const children = inlineContent(node.content);
      if (result.length && children.length) result.push({ type: 'hardBreak' });
      result.push(...children);
    }
  }
  return result;
}

function blockContent(nodes: RichNode[]): RichNode[] {
  const result: RichNode[] = [];
  let inline: RichNode[] = [];
  const flush = () => { if (inline.length) { result.push(paragraph(inline)); inline = []; } };
  for (const node of nodes) {
    if (inlineTypes.has(node.type)) { inline.push(node); continue; }
    flush();
    if (node.type === 'doc' || node.type === 'tableRow' || node.type === 'tableCell' || node.type === 'tableHeader' || node.type === 'listItem') result.push(...blockContent(node.content || []));
    else result.push(node);
  }
  flush();
  return result;
}

function textFromNode(node: RichNode): string {
  if (node.type === 'text') return node.text || '';
  if (node.type === 'inlineMath' || node.type === 'blockMath') return String(node.attrs?.latex || '');
  if (node.type === 'hardBreak') return '\n';
  const children = node.content || [];
  const separator = node.type === 'tableRow' ? '\t' : ['doc', 'bulletList', 'orderedList', 'listItem', 'blockquote', 'table', 'tableCell', 'tableHeader'].includes(node.type) ? '\n' : '';
  return children.map(textFromNode).join(separator);
}

/** Produces only the schema subset our editor and read-only viewer understand. */
export function sanitizeRichDocument(value: unknown): RichDocument {
  let remainingNodes = MAX_NODES;
  let remainingText = MAX_TEXT;
  const visit = (raw: unknown, depth: number): RichNode[] => {
    if (depth > MAX_DEPTH || remainingNodes-- <= 0) return [];
    const node = object(raw);
    if (!node) return [];
    const type = typeof node.type === 'string' ? node.type : '';
    const attrs = object(node.attrs) || {};
    const children = () => Array.isArray(node.content) ? node.content.slice(0, MAX_NODES).flatMap(child => visit(child, depth + 1)) : [];
    if (type === 'text') {
      if (typeof node.text !== 'string' || !remainingText) return [];
      const text = node.text.replace(/\r\n?/g, '\n').replace(/\u0000/g, '').slice(0, remainingText);
      remainingText -= text.length;
      if (!text) return [];
      const marks = marksFrom(node.marks);
      return [{ type, text, ...(marks.length ? { marks } : {}) }];
    }
    if (type === 'hardBreak') {
      const marks = marksFrom(node.marks);
      return [{ type, ...(marks.length ? { marks } : {}) }];
    }
    if (type === 'horizontalRule') return [{ type }];
    if (type === 'inlineMath' || type === 'blockMath') {
      if (typeof attrs.latex !== 'string' || attrs.latex.length > MAX_LATEX || attrs.latex.length > remainingText || !attrs.latex.trim()) return [];
      const latex = attrs.latex.replace(/\u0000/g, '');
      remainingText -= latex.length;
      const marks = type === 'inlineMath' ? marksFrom(node.marks) : [];
      return [{ type, attrs: { latex }, ...(marks.length ? { marks } : {}) }];
    }
    const content = children();
    if (type === 'paragraph' || type === 'heading') {
      const cleanAttrs: Record<string, RichAttribute> = {};
      if (type === 'heading') cleanAttrs.level = attrs.level === 5 ? 5 : 4;
      if (attrs.textAlign === 'left' || attrs.textAlign === 'center' || attrs.textAlign === 'right') cleanAttrs.textAlign = attrs.textAlign;
      const inline = inlineContent(content);
      return [{ type, ...(Object.keys(cleanAttrs).length ? { attrs: cleanAttrs } : {}), ...(inline.length ? { content: inline } : {}) }];
    }
    if (type === 'codeBlock') {
      const language = typeof attrs.language === 'string' && /^[\w-]{1,40}$/.test(attrs.language) ? attrs.language : null;
      const text = content.map(textFromNode).join('');
      return [{ type, ...(language ? { attrs: { language } } : {}), ...(text ? { content: [{ type: 'text', text }] } : {}) }];
    }
    if (type === 'doc' || type === 'blockquote' || type === 'listItem') {
      const blocks = blockContent(content);
      if (type === 'listItem' && blocks[0]?.type !== 'paragraph') blocks.unshift(paragraph());
      return [{ type, content: blocks.length ? blocks : [paragraph()] }];
    }
    if (type === 'bulletList' || type === 'orderedList') {
      const items = content.map(child => child.type === 'listItem' ? child : { type: 'listItem', content: [paragraph(inlineContent([child]))] });
      const start = Number.isInteger(attrs.start) && Number(attrs.start) > 0 && Number(attrs.start) <= 100_000 ? Number(attrs.start) : 1;
      return [{ type, ...(type === 'orderedList' && start !== 1 ? { attrs: { start } } : {}), content: items.length ? items : [{ type: 'listItem', content: [paragraph()] }] }];
    }
    if (type === 'tableCell' || type === 'tableHeader') {
      const blocks = blockContent(content).filter(child => child.type !== 'table');
      return [{ type, content: blocks.length ? blocks : [paragraph()] }];
    }
    if (type === 'tableRow') return [{ type, content: content.filter(child => child.type === 'tableCell' || child.type === 'tableHeader').slice(0, RICH_TABLE_MAX_COLUMNS) }];
    if (type === 'table') {
      const rows = content.filter(child => child.type === 'tableRow').slice(0, RICH_TABLE_MAX_ROWS);
      if (!rows.length) return [];
      const columns = Math.max(1, ...rows.map(row => row.content?.length || 0));
      for (const row of rows) {
        const cells = row.content || [];
        while (cells.length < columns) cells.push({ type: 'tableCell', content: [paragraph()] });
        row.content = cells;
      }
      return [{ type, content: rows }];
    }
    // Unrecognized containers lose their behavior and attributes, but their
    // supported children remain readable. No raw HTML or external media survive.
    return content;
  };
  const result = visit(value, 0);
  const content = blockContent(result);
  return { type: 'doc', content: content.length ? content : [paragraph()] };
}

export function parseRichAnswer(value: string): RichDocument | null {
  if (!value.startsWith(RICH_ANSWER_PREFIX) || value.length > MAX_ENCODED_DRAFT) return null;
  try {
    const raw: unknown = JSON.parse(value.slice(RICH_ANSWER_PREFIX.length));
    if (object(raw)?.type !== 'doc' || !Array.isArray(object(raw)?.content)) return null;
    return sanitizeRichDocument(raw);
  } catch { return null; }
}

export function serializeRichAnswer(doc: unknown): string {
  const clean = sanitizeRichDocument(doc);
  if (!textFromNode(clean).replace(/[\s\u200b-\u200d\ufeff]/g, '')) return '';
  // Keep oversized drafts editable. The existing save boundary reports the
  // save limit without discarding text or interrupting editor updates.
  return RICH_ANSWER_PREFIX + JSON.stringify(clean);
}

/** Search/export text; legacy plaintext and Markdown are returned unchanged. */
export function richAnswerText(value: string): string {
  const doc = parseRichAnswer(value);
  return doc ? textFromNode(doc).trim() : value;
}
