// Legacy plain-text and Markdown answers remain readable without rewriting them.
// RichAnswerEditor imports this renderer only when no versioned rich document exists.
// Raw HTML is escaped before rendering.

export interface RichNode {
  nodeType: number;
  nodeName: string;
  nodeValue?: string | null;
  childNodes: ArrayLike<RichNode>;
  getAttribute?: (name: string) => string | null;
}

const ELEMENT = 1;
const TEXT = 3;
const MARK = '';
const blockTags = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'SECTION', 'ARTICLE', 'FIGURE', 'FIGCAPTION', 'ADDRESS', 'HR', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'DL', 'DT', 'DD']);
const skipTags = new Set(['SCRIPT', 'STYLE', 'IMG', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'VIDEO', 'AUDIO', 'INPUT', 'TEXTAREA', 'BUTTON', 'SELECT']);
const listMarker = /^([-*]|\d+\.)[ \t]/;

const clean = (value: string) => value.replace(new RegExp(MARK, 'g'), '').replace(/\r\n?/g, '\n');
const childList = (node: RichNode) => Array.from(node.childNodes);
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, character => (
  character === '&' ? '&amp;' : character === '<' ? '&lt;' : character === '>' ? '&gt;' : '&quot;'
));

// Markdown -> HTML, for painting the editor and the read-only view of an answer.
function inlineToHtml(text: string): string {
  const codes: string[] = [];
  let html = escapeHtml(text).replace(/`([^`]+)`/g, (_match, code: string) => {
    codes.push(code);
    return `${MARK}${codes.length - 1}${MARK}`;
  });
  html = html.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<s>$1</s>');
  html = html.replace(/(^|[^*])\*(?=\S)([^*]*?\S|\S)\*/g, '$1<em>$2</em>');
  return html.replace(new RegExp(`${MARK}(\\d+)${MARK}`, 'g'), (_match, index: string) => `<code>${codes[Number(index)]}</code>`);
}

export function richTextToHtml(markdown: string): string {
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let quoted = false;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  const closeQuote = () => { if (quoted) { out.push('</blockquote>'); quoted = false; } };
  for (const raw of clean(markdown).split('\n')) {
    const line = raw.replace(/[ \t]+$/, '');
    const quote = /^>[ \t]?([\s\S]*)$/.exec(line);
    const content = quote ? quote[1] : line;
    if (quote && !quoted) { closeList(); out.push('<blockquote>'); quoted = true; }
    if (!quote && quoted) { closeList(); closeQuote(); }
    const bullet = /^[-*](?:[ \t]+([\s\S]*))?$/.exec(content);
    const ordered = /^\d+\.(?:[ \t]+([\s\S]*))?$/.exec(content);
    if (bullet || ordered) {
      const kind = bullet ? 'ul' : 'ol';
      if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
      out.push(`<li>${inlineToHtml((bullet || ordered)![1] || '') || '<br>'}</li>`);
      continue;
    }
    closeList();
    const heading = /^(#{2,6})(?:[ \t]+([\s\S]*))?$/.exec(content);
    if (heading) {
      const tag = heading[1].length === 2 ? 'h4' : 'h5';
      out.push(`<${tag}>${inlineToHtml(heading[2] || '') || '<br>'}</${tag}>`);
      continue;
    }
    out.push(`<p>${inlineToHtml(content) || '<br>'}</p>`);
  }
  closeList();
  closeQuote();
  return out.join('');
}

// HTML -> Markdown, for whatever the browser's editing commands leave behind.
const wrap = (value: string, marker: string) => value.split('\n').map(part => {
  const match = /^([ \t]*)([\s\S]*?)([ \t]*)$/.exec(part);
  return match && match[2] ? `${match[1]}${marker}${match[2]}${marker}${match[3]}` : part;
}).join('\n');

function inlineToText(node: RichNode): string {
  if (node.nodeType === TEXT) return clean(node.nodeValue || '');
  if (node.nodeType !== ELEMENT) return '';
  const tag = node.nodeName.toUpperCase();
  if (tag === 'BR') return '\n';
  if (skipTags.has(tag)) return '';
  const inner = childList(node).map(inlineToText).join('');
  if (!inner.trim()) return inner;
  const style = node.getAttribute?.('style') || '';
  let text = inner;
  if (tag === 'CODE' || tag === 'KBD' || tag === 'SAMP') text = wrap(text, '`');
  if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL' || /line-through/i.test(style)) text = wrap(text, '~~');
  if (tag === 'I' || tag === 'EM' || /font-style:\s*italic/i.test(style)) text = wrap(text, '*');
  if (tag === 'B' || tag === 'STRONG' || /font-weight:\s*(bold|[6-9]00)/i.test(style)) text = wrap(text, '**');
  return text;
}

function walkBlocks(node: RichNode, out: string[], prefix: string): void {
  let buffer: string[] = [];
  const flush = () => {
    const text = buffer.join('');
    buffer = [];
    if (!text) return;
    const lines = text.split('\n');
    if (lines.length > 1 && !lines[lines.length - 1]) lines.pop();
    for (const line of lines) out.push(prefix + line);
  };
  const nested = (child: RichNode) => {
    const lines: string[] = [];
    walkBlocks(child, lines, '');
    return lines.length ? lines : [''];
  };
  for (const child of childList(node)) {
    if (child.nodeType === TEXT) { buffer.push(clean(child.nodeValue || '')); continue; }
    if (child.nodeType !== ELEMENT) continue;
    const tag = child.nodeName.toUpperCase();
    if (skipTags.has(tag)) continue;
    if (!blockTags.has(tag)) { buffer.push(inlineToText(child)); continue; }
    flush();
    if (tag === 'UL' || tag === 'OL') {
      let index = 0;
      for (const item of childList(child)) {
        if (item.nodeType !== ELEMENT || item.nodeName.toUpperCase() !== 'LI') continue;
        index += 1;
        const marker = tag === 'OL' ? `${index}. ` : '- ';
        for (const line of nested(item)) out.push(prefix + (listMarker.test(line) ? line : marker + line));
      }
      continue;
    }
    if (tag === 'BLOCKQUOTE') { walkBlocks(child, out, `${prefix}> `); continue; }
    if (/^H[1-6]$/.test(tag)) {
      const marker = Number(tag[1]) <= 4 ? '## ' : '### ';
      const lines = inlineToText(child).split('\n').map(line => line.trim()).filter(Boolean);
      for (const line of lines) out.push(prefix + marker + line);
      if (!lines.length) out.push(prefix + marker.trim());
      continue;
    }
    for (const line of nested(child)) out.push(prefix + line);
  }
  flush();
}

export function richTextFromDom(root: RichNode): string {
  const out: string[] = [];
  walkBlocks(root, out, '');
  return out.map(line => line.replace(/[ \t]+$/, '')).join('\n').replace(/\n+$/, '');
}
