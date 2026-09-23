import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RICH_ANSWER_PREFIX, RICH_ANSWER_LIMIT, parseRichAnswer, serializeRichAnswer,
  sanitizeRichDocument, richAnswerText, safeRichColor, safeRichLink,
} from '../src/lib/rich-answer';

const text = (value: string) => ({ type: 'text', text: value });
const paragraph = (...content: unknown[]) => ({ type: 'paragraph', content });
const doc = (...content: unknown[]) => ({ type: 'doc', content });
const formula = (latex: string, type = 'inlineMath') => ({ type, attrs: { latex } });

test('rich answers round-trip formatting, equations, tables and readable text', () => {
  const rich = doc(
    { type: 'heading', attrs: { level: 4, textAlign: 'center' }, content: [text('传输时间')] },
    paragraph({ ...text('重点'), marks: [
      { type: 'bold' }, { type: 'underline' }, { type: 'textStyle', attrs: { color: '#2563eb', fontSize: '18px' } },
      { type: 'highlight', attrs: { color: '#fef08a' } },
    ] }, text('：'), formula('d_{trans}=\\frac{L}{R}')),
    formula('\\int_0^1 x^2\\,dx = \\frac13', 'blockMath'),
    { type: 'orderedList', attrs: { start: 3 }, content: [{ type: 'listItem', content: [paragraph(text('记录单位'))] }] },
    { type: 'table', content: [{ type: 'tableRow', content: [
      { type: 'tableHeader', content: [paragraph(text('L'))] },
      { type: 'tableCell', content: [paragraph(text('1500 B'))] },
    ] }] },
    { type: 'codeBlock', attrs: { language: 'python' }, content: [text('print(1500 * 8)')] },
  );
  const stored = serializeRichAnswer(rich);
  assert.ok(stored.startsWith(RICH_ANSWER_PREFIX));
  assert.equal(serializeRichAnswer(parseRichAnswer(stored)), stored);
  const readable = richAnswerText(stored);
  assert.match(readable, /传输时间\n重点：d_\{trans\}/);
  assert.match(readable, /L\t1500 B/);
  assert.match(readable, /print\(1500 \* 8\)/);
});

test('empty formatting, lists, tables, rules and whitespace remain unanswered', () => {
  const empty = [
    doc(), doc(paragraph()), doc(paragraph(text(' \n\t\u200b\ufeff'))),
    doc({ type: 'horizontalRule' }), doc(formula('   ')),
    doc({ type: 'bulletList', content: [{ type: 'listItem', content: [paragraph()] }] }),
    doc({ type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableCell', content: [paragraph()] }] }] }),
    doc({ type: 'heading', attrs: { level: 5 }, content: [{ ...text(' '), marks: [{ type: 'bold' }] }] }),
  ];
  for (const value of empty) assert.equal(serializeRichAnswer(value), '');
  for (const type of ['inlineMath', 'blockMath']) {
    const stored = serializeRichAnswer(doc(type === 'inlineMath' ? paragraph(formula('x^2', type)) : formula('x^2', type)));
    assert.notEqual(stored, '');
    assert.equal(richAnswerText(stored), 'x^2');
  }
});

test('legacy answers and malformed prefixed answers are never rewritten or lost', () => {
  for (const legacy of ['老答案\n**重点**', '#plain', '<script>alert(1)</script>', '', `${RICH_ANSWER_PREFIX}{broken`, `${RICH_ANSWER_PREFIX}{"type":"doc"}`, `${RICH_ANSWER_PREFIX}[]`]) {
    assert.equal(parseRichAnswer(legacy), null);
    assert.equal(richAnswerText(legacy), legacy);
  }
  assert.equal(parseRichAnswer(`study-rich-v2:{"type":"doc","content":[]}`), null);
});

test('dangerous nodes, attributes, CSS and links lose executable behavior', () => {
  const value = doc({ type: 'custom', attrs: { onclick: 'alert(1)' }, content: [
    paragraph({ ...text('<script>literal</script>'), marks: [
      { type: 'textStyle', attrs: { color: 'url(javascript:alert(1))', fontSize: 'expression(alert(1))', style: 'position:fixed' } },
      { type: 'link', attrs: { href: 'javascript:alert(1)' } },
      { type: 'html', attrs: { html: '<iframe>' } },
      { type: 'bold', attrs: { onclick: 'alert(1)' } },
    ] }),
    { type: 'image', attrs: { src: 'https://tracker.test/secret' } },
    { type: 'iframe', content: [paragraph(text('可读文字'))] },
  ] });
  const sanitized = sanitizeRichDocument(value);
  assert.deepEqual(sanitized, doc(
    paragraph({ ...text('<script>literal</script>'), marks: [{ type: 'bold' }] }),
    paragraph(text('可读文字')),
  ));
  assert.equal(serializeRichAnswer(sanitized), serializeRichAnswer(value));
});

test('links use an explicit safe protocol and fixed new-window protections', () => {
  assert.equal(safeRichLink('https://example.com/a?q=1'), 'https://example.com/a?q=1');
  assert.equal(safeRichLink('http://example.com'), 'http://example.com/');
  assert.equal(safeRichLink('mailto:learner@example.com'), 'mailto:learner@example.com');
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//example.com', '/local', 'https://name:pass@example.com', 'java\nscript:alert(1)', 'https://example.com/\nscript', 'mailto:me@example.com?body=secret', 'file:///etc/passwd', 'https:\\example.com']) assert.equal(safeRichLink(href), null);
  const clean = sanitizeRichDocument(doc(paragraph({ ...text('课件'), marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_self', rel: 'opener', onclick: 'evil' } }] })));
  assert.deepEqual(clean.content[0].content?.[0].marks, [{ type: 'link', attrs: { href: 'https://example.com/', target: '_blank', rel: 'noopener noreferrer nofollow' } }]);
});

test('colors and formatting normalize to a small explicit palette and size set', () => {
  assert.equal(safeRichColor('#ABC'), '#aabbcc');
  assert.equal(safeRichColor('rgb( 0, 128, 255 )'), '#0080ff');
  assert.equal(safeRichColor('#aabbcc'), '#aabbcc');
  for (const value of ['red', 'rgb(256,0,0)', 'rgba(0,0,0,0)', 'var(--color)', '#ffff', 'url(x)']) assert.equal(safeRichColor(value), null);
  const clean = sanitizeRichDocument(doc({ type: 'heading', attrs: { level: 1, textAlign: 'justify', class: 'hack' }, content: [
    { ...text('平方'), marks: [{ type: 'superscript' }, { type: 'textStyle', attrs: { color: 'rgb(0,0,0)', fontSize: '99px' } }] },
  ] }));
  assert.deepEqual(clean.content[0].attrs, { level: 4 });
  assert.deepEqual(clean.content[0].content?.[0].marks, [{ type: 'superscript' }, { type: 'textStyle', attrs: { color: '#000000' } }]);
});

test('table dimensions and malformed geometry are bounded and rectangular', () => {
  const table = { type: 'table', content: Array.from({ length: 25 }, (_, row) => ({ type: 'tableRow', content: Array.from({ length: row ? 1 : 15 }, (_, column) => ({ type: 'tableCell', attrs: { colspan: 1000000, rowspan: -1, colwidth: [999999999] }, content: [paragraph(text(`${row}:${column}`))] })) })) };
  const result = sanitizeRichDocument(doc(table)).content[0];
  assert.equal(result.content?.length, 20);
  for (const row of result.content || []) {
    assert.equal(row.content?.length, 12);
    assert.ok(row.content?.every(cell => !cell.attrs));
  }
  assert.equal(result.content?.[1].content?.[0].content?.[0].content?.[0].text, '1:0');
  assert.deepEqual(sanitizeRichDocument(sanitizeRichDocument(doc(table))), sanitizeRichDocument(doc(table)));
});

test('deep, cyclic and very wide untrusted documents terminate within fixed bounds', () => {
  const cyclic: { type: string; content: unknown[] } = { type: 'unknown', content: [] };
  cyclic.content.push(cyclic);
  assert.equal(serializeRichAnswer(cyclic), '');
  const wide = sanitizeRichDocument(doc(...Array.from({ length: 10000 }, () => paragraph(text('x')))));
  assert.ok(wide.content.length <= 2000);
  const longFormula = doc(formula('x'.repeat(4001), 'blockMath'));
  assert.equal(serializeRichAnswer(longFormula), '');
  assert.ok(serializeRichAnswer(doc(formula('x'.repeat(4000), 'blockMath'))).length > 4000);
});

test('oversized rich drafts remain serializable so the save boundary can report capacity', () => {
  const oversized = serializeRichAnswer(doc(paragraph(text('x'.repeat(RICH_ANSWER_LIMIT)))));
  assert.ok(oversized.length > RICH_ANSWER_LIMIT);
  assert.equal(JSON.parse(oversized.slice(RICH_ANSWER_PREFIX.length)).content[0].content[0].text.length, RICH_ANSWER_LIMIT);
  assert.notEqual(parseRichAnswer(oversized), null);
  assert.equal(richAnswerText(oversized).length, RICH_ANSWER_LIMIT);
  assert.equal(parseRichAnswer(RICH_ANSWER_PREFIX + 'x'.repeat(1_000_000)), null);
  assert.equal(parseRichAnswer(RICH_ANSWER_PREFIX + 'x'.repeat(RICH_ANSWER_LIMIT)), null);
  const valid = serializeRichAnswer(doc(paragraph(text('x'.repeat(1000)))));
  assert.ok(valid.length <= RICH_ANSWER_LIMIT);
  assert.equal(richAnswerText(valid).length, 1000);
});


test('inline formulas and line breaks preserve only supported marks while block formulas stay unmarked', () => {
  const marks = [{ type: 'bold' }, { type: 'textStyle', attrs: { color: '#ABC', fontSize: '18px', onclick: 'evil' } }, { type: 'highlight', attrs: { color: '#fef08a' } }, { type: 'link', attrs: { href: 'javascript:alert(1)' } }];
  const clean = sanitizeRichDocument(doc(
    { ...paragraph({ ...formula('x^2'), marks }, { type: 'hardBreak', marks }), attrs: { textAlign: 'left' } },
    { ...formula('x^2', 'blockMath'), marks },
  ));
  const expected = [{ type: 'bold' }, { type: 'textStyle', attrs: { color: '#aabbcc', fontSize: '18px' } }, { type: 'highlight', attrs: { color: '#fef08a' } }];
  assert.deepEqual(clean.content[0].content?.[0].marks, expected);
  assert.deepEqual(clean.content[0].content?.[1].marks, expected);
  assert.deepEqual(clean.content[0].attrs, { textAlign: 'left' });
  assert.equal(clean.content[1].marks, undefined);
  assert.equal(serializeRichAnswer(parseRichAnswer(serializeRichAnswer(clean))), serializeRichAnswer(clean));
});
