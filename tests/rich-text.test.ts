import assert from 'node:assert/strict';
import test from 'node:test';
import { richTextFromDom, richTextToHtml, type RichNode } from '../src/lib/rich-text';

interface FakeNode extends RichNode { childNodes: FakeNode[] }

// Enough of a parser for the markup the editor's commands produce; the browser supplies the real DOM.
const voids = new Set(['BR', 'HR', 'IMG']);
function parse(html: string): FakeNode {
  const root: FakeNode = { nodeType: 1, nodeName: 'DIV', childNodes: [] };
  const open: FakeNode[] = [root];
  const token = /<\/?([a-zA-Z0-9]+)([^>]*)>|[^<]+/g;
  let match: RegExpExecArray | null;
  while ((match = token.exec(html))) {
    const parent = open[open.length - 1];
    if (match[0][0] !== '<') {
      const value = match[0].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      parent.childNodes.push({ nodeType: 3, nodeName: '#text', nodeValue: value, childNodes: [] });
      continue;
    }
    const tag = match[1].toUpperCase();
    if (match[0][1] === '/') { if (open.length > 1) open.pop(); continue; }
    const style = /style="([^"]*)"/.exec(match[2] || '');
    const node: FakeNode = { nodeType: 1, nodeName: tag, childNodes: [], getAttribute: name => (name === 'style' && style ? style[1] : null) };
    parent.childNodes.push(node);
    if (!voids.has(tag)) open.push(node);
  }
  return root;
}

const roundTrip = (markdown: string) => richTextFromDom(parse(richTextToHtml(markdown)));

test('plain answers written before the editor existed survive untouched', () => {
  for (const answer of ['hello', '第一行\n第二行', '段落一\n\n段落二', '普通中文回答，包含 TCP/IP 的说明。', '2 * 3 * 4 = 24', '']) {
    assert.equal(roundTrip(answer), answer);
  }
});

test('every formatting the toolbar offers round-trips through markdown', () => {
  for (const answer of [
    '**粗体** 与 *斜体* 与 ~~删除~~ 与 `code`',
    '## 大标题\n### 小标题\n正文',
    '- 要点一\n- **要点二**',
    '1. 第一\n2. 第二',
    '> 引用一行\n> 引用两行',
    '> - 引用里的列表',
    '## 标题\n- 一\n- 二\n\n结尾',
  ]) {
    assert.equal(roundTrip(answer), answer);
  }
});

test('answers are escaped rather than rendered as markup', () => {
  assert.equal(richTextToHtml('<img src=x onerror=alert(1)>'), '<p>&lt;img src=x onerror=alert(1)&gt;</p>');
  assert.equal(richTextToHtml('a < b & "c"'), '<p>a &lt; b &amp; &quot;c&quot;</p>');
  assert.equal(roundTrip('<script>alert(1)</script>'), '<script>alert(1)</script>');
});

test('browser editing commands serialise back to the markdown subset', () => {
  const cases: [string, string][] = [
    ['<div>first</div><div>second</div>', 'first\nsecond'],
    ['first<br>second', 'first\nsecond'],
    ['<div>a</div><div><br></div><div>b</div>', 'a\n\nb'],
    ['<p>a<b>bold</b>c</p>', 'a**bold**c'],
    ['<p><span style="font-weight: bold;">heavy</span></p>', '**heavy**'],
    ['<p><span style="font-style: italic;">lean</span></p>', '*lean*'],
    ['<p><span style="color: red">plain</span></p>', 'plain'],
    ['<ul><li>one</li><li><b>two</b></li></ul>', '- one\n- **two**'],
    ['<ol><li>one</li><li>two</li></ol>', '1. one\n2. two'],
    ['<ul><li>outer<ul><li>inner</li></ul></li></ul>', '- outer\n- inner'],
    ['<blockquote><div>quoted</div></blockquote>', '> quoted'],
    ['<h4>Big</h4><h5>Small</h5>', '## Big\n### Small'],
    ['<p><br></p>', ''],
    ['<div>text<img src="x">more</div>', 'textmore'],
  ];
  for (const [html, markdown] of cases) assert.equal(richTextFromDom(parse(html)), markdown);
});

test('an empty answer stays empty so the answered count is unchanged', () => {
  assert.equal(richTextFromDom(parse('<p><br></p><p><br></p>')).trim(), '');
  assert.equal(richTextFromDom(parse('<p> </p>')).trim(), '');
});
