import assert from 'node:assert/strict';
import test from 'node:test';
import { Editor, getExtensionField, getSchema, type KeyboardShortcutCommand } from '@tiptap/core';
import { Fragment, Slice, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState, TextSelection } from '@tiptap/pm/state';
import { Transform } from '@tiptap/pm/transform';
import { createRichAnswerExtensions, sanitizeRichAnswerSlice } from '../src/lib/rich-answer-extensions';
import { RICH_TABLE_MAX_ROWS, parseRichAnswer, richAnswerText, serializeRichAnswer } from '../src/lib/rich-answer';

const schema = getSchema(createRichAnswerExtensions());
const text = (value: string) => schema.text(value);
const paragraph = (...content: ProseMirrorNode[]) => schema.nodes.paragraph.create(null, content);
const document = (...content: ProseMirrorNode[]) => schema.nodes.doc.create(null, content);
const inlineMath = (latex = 'x^2') => schema.nodes.inlineMath.create({ latex });
const blockMath = (latex = '\\frac{L}{R}') => schema.nodes.blockMath.create({ latex });

const tableEditor = (rows: number, columns = 1) => {
  const doc = document(schema.nodes.table.create(null, Array.from({ length: rows }, (_, row) =>
    schema.nodes.tableRow.create(null, Array.from({ length: columns }, (_, column) =>
      schema.nodes.tableCell.create(null, paragraph(text(`row ${row}, col ${column}`))),
    )),
  )));
  const editor = new Editor({ element: null, extensions: createRichAnswerExtensions(), content: doc.toJSON() });
  const extension = editor.extensionManager.extensions.find(item => item.name === 'table')!;
  const shortcuts = getExtensionField<() => Record<string, KeyboardShortcutCommand>>(extension, 'addKeyboardShortcuts', {
    name: extension.name, options: extension.options, storage: extension.storage, editor, type: editor.schema.nodes.table,
  })();
  const cells: number[] = [];
  editor.state.doc.descendants((node, position) => { if (node.type.name === 'paragraph') cells.push(position + 1); });
  return { editor, shortcuts, cells };
};

test('the editor schema reloads colors, highlighting, links, formulas and tables without losing content', () => {
  const initial = document(
    schema.nodes.heading.create({ level: 4, textAlign: 'center' }, text('时延')),
    paragraph(text('重点'), inlineMath()),
    blockMath(),
    schema.nodes.table.create(null, [schema.nodes.tableRow.create(null, [
      schema.nodes.tableHeader.create(null, paragraph(text('L'))),
      schema.nodes.tableCell.create(null, paragraph(text('1500 B'))),
    ])]),
    schema.nodes.codeBlock.create(null, text('  const delay = L / R;\n\treturn delay;')),
  );
  const paragraphPosition = initial.firstChild!.nodeSize + 1;
  const formatted = new Transform(initial)
    .addMark(paragraphPosition, paragraphPosition + 2, schema.marks.textStyle.create({ color: '#0369a1', fontSize: '18px' }))
    .addMark(paragraphPosition, paragraphPosition + 2, schema.marks.highlight.create({ color: '#fef08a' }))
    .addMark(paragraphPosition, paragraphPosition + 2, schema.marks.underline.create())
    .addMark(paragraphPosition, paragraphPosition + 2, schema.marks.link.create({ href: 'https://example.com/study', target: '_blank', rel: 'noopener noreferrer nofollow' })).doc;
  const saved = serializeRichAnswer(formatted.toJSON());
  const restored = schema.nodeFromJSON(parseRichAnswer(saved));
  restored.check();
  assert.equal(serializeRichAnswer(restored.toJSON()), saved);
  const marks = restored.child(1).firstChild!.marks;
  assert.equal(marks.find(mark => mark.type.name === 'textStyle')?.attrs.color, '#0369a1');
  assert.equal(marks.find(mark => mark.type.name === 'textStyle')?.attrs.fontSize, '18px');
  assert.equal(marks.find(mark => mark.type.name === 'highlight')?.attrs.color, '#fef08a');
  assert.equal(marks.find(mark => mark.type.name === 'link')?.attrs.target, '_blank');
  assert.equal(restored.child(3).child(0).childCount, 2);
  assert.equal(restored.child(4).textContent, '  const delay = L / R;\n\treturn delay;');
  assert.match(richAnswerText(saved), /重点x\^2\n\\frac\{L\}\{R\}/);
});

test('plain-text paste stays in the current paragraph and leaves the caret after inserted text', () => {
  const original = document(paragraph(text('before after')));
  const state = EditorState.create({ schema, doc: original, selection: TextSelection.create(original, 8) });
  const incoming = new Slice(Fragment.from(paragraph(text('pasted '))), 1, 1);
  const result = state.tr.replaceSelection(sanitizeRichAnswerSlice(schema, incoming));
  result.doc.check();
  assert.equal(result.doc.childCount, 1);
  assert.equal(result.doc.textContent, 'before pasted after');
  assert.equal(result.selection.from, 15);
  assert.equal(result.selection.to, 15);
});

test('multi-paragraph paste merges its open edges with the surrounding paragraph', () => {
  const original = document(paragraph(text('before after')));
  const state = EditorState.create({ schema, doc: original, selection: TextSelection.create(original, 8) });
  const incoming = new Slice(Fragment.from([paragraph(text('first')), paragraph(text('second'))]), 1, 1);
  const result = state.tr.replaceSelection(sanitizeRichAnswerSlice(schema, incoming));
  result.doc.check();
  assert.deepEqual(Array.from({ length: result.doc.childCount }, (_, index) => result.doc.child(index).textContent), ['before first', 'secondafter']);
  assert.equal(result.selection.$from.parent.textContent, 'secondafter');
  assert.equal(result.selection.$from.parentOffset, 'second'.length);
});

test('clipboard colors and links are sanitized before insertion, and excessive open depths cannot break the editor', () => {
  const maliciousMarks = [
    schema.marks.textStyle.create({ color: 'url(javascript:alert(1))', fontSize: '999999px' }),
    schema.marks.link.create({ href: 'javascript:alert(1)', target: '_self', rel: 'opener' }),
  ];
  const incoming = new Slice(Fragment.from(paragraph(schema.text('visible', maliciousMarks))), 8, 8);
  const safe = sanitizeRichAnswerSlice(schema, incoming);
  assert.equal(safe.openStart, 1);
  assert.equal(safe.openEnd, 1);
  const original = document(paragraph(text('left right')));
  const state = EditorState.create({ schema, doc: original, selection: TextSelection.create(original, 6) });
  const result = state.tr.replaceSelection(safe);
  result.doc.check();
  assert.equal(result.doc.textContent, 'left visibleright');
  result.doc.descendants(node => { if (node.isText) assert.deepEqual(node.marks, []); });
  assert.equal(sanitizeRichAnswerSlice(schema, Slice.empty), Slice.empty);
});

test('an inline formula can become a standalone formula without deleting adjacent text', () => {
  const original = document(paragraph(text('before'), inlineMath(), text('after')));
  const result = new Transform(original).replaceWith(7, 8, blockMath()).doc;
  result.check();
  assert.equal(result.childCount, 3);
  assert.equal(result.child(0).textContent, 'before');
  assert.equal(result.child(1).type.name, 'blockMath');
  assert.equal(result.child(1).attrs.latex, '\\frac{L}{R}');
  assert.equal(result.child(2).textContent, 'after');
});

test('a standalone formula can become inline and can be inserted at a restored selection', () => {
  const original = document(paragraph(text('before')), blockMath(), paragraph(text('after')));
  const blockPosition = original.child(0).nodeSize;
  const converted = new Transform(original).replaceWith(blockPosition, blockPosition + 1, inlineMath()).doc;
  converted.check();
  assert.equal(converted.child(0).textContent, 'before');
  assert.equal(converted.child(1).firstChild?.type.name, 'inlineMath');
  assert.equal(converted.child(2).textContent, 'after');

  const writing = document(paragraph(text('left old right')));
  const state = EditorState.create({ schema, doc: writing, selection: TextSelection.create(writing, 2) });
  const result = state.tr.setSelection(TextSelection.create(writing, 6, 9)).replaceSelectionWith(inlineMath(), false);
  result.doc.check();
  assert.equal(result.doc.firstChild?.child(0).text, 'left ');
  assert.equal(result.doc.firstChild?.child(1).type.name, 'inlineMath');
  assert.equal(result.doc.firstChild?.child(2).text, ' right');
  assert.equal(result.selection.from, 7);
  assert.equal(result.selection.empty, true);
});

test('formula extensions use distinct display modes with bounded, untrusted rendering', () => {
  const extensions = createRichAnswerExtensions();
  for (const [name, displayMode] of [['inlineMath', false], ['blockMath', true]] as const) {
    const extension = extensions.find(item => item.name === name)!;
    assert.ok(extension);
    assert.deepEqual(extension.options.katexOptions, { throwOnError: false, trust: false, strict: 'error', maxExpand: 1000, maxSize: 20, displayMode });
    const addInputRules = extension.config.addInputRules;
    assert.ok(addInputRules);
    assert.deepEqual(Reflect.apply(addInputRules, undefined, []), []);
  }
});

test('Tab may add a final supported table row but cannot create rows that would be clipped on save', () => {
  const { editor, shortcuts, cells } = tableEditor(RICH_TABLE_MAX_ROWS - 1);
  try {
    editor.commands.setTextSelection(cells[cells.length - 1]);
    assert.equal(shortcuts.Tab({ editor }), true);
    assert.equal(editor.state.doc.firstChild!.childCount, RICH_TABLE_MAX_ROWS);
    const atLimit = editor.state.doc.toJSON();
    assert.equal(shortcuts.Tab({ editor }), false);
    assert.deepEqual(editor.state.doc.toJSON(), atLimit);
    assert.equal(parseRichAnswer(serializeRichAnswer(atLimit))!.content[0].content!.length, RICH_TABLE_MAX_ROWS);
  } finally { editor.destroy(); }
});

test('Tab and Shift-Tab continue navigating cells in a table already at its row limit', () => {
  const { editor, shortcuts, cells } = tableEditor(RICH_TABLE_MAX_ROWS, 2);
  try {
    editor.commands.setTextSelection(cells[cells.length - 2]);
    assert.equal(shortcuts.Tab({ editor }), true);
    assert.equal(editor.state.selection.from, cells[cells.length - 1]);
    assert.equal(shortcuts['Shift-Tab']({ editor }), true);
    assert.equal(editor.state.selection.from, cells[cells.length - 2]);
    assert.equal(editor.state.doc.firstChild!.childCount, RICH_TABLE_MAX_ROWS);
  } finally { editor.destroy(); }
});

test('formatting selected inline equations and line breaks survives save, reload and clipboard sanitization', () => {
  const initial = document(schema.nodes.paragraph.create({ textAlign: 'left' }, [
    text('L = '), inlineMath('\\frac{8000}{2\\times10^6}'), schema.nodes.hardBreak.create(), text('seconds'),
  ]));
  const marked = new Transform(initial)
    .addMark(1, initial.firstChild!.nodeSize - 1, schema.marks.bold.create())
    .addMark(1, initial.firstChild!.nodeSize - 1, schema.marks.textStyle.create({ color: '#be185d', fontSize: '20px' }))
    .addMark(1, initial.firstChild!.nodeSize - 1, schema.marks.highlight.create({ color: '#fef08a' })).doc;
  marked.check();
  const stored = serializeRichAnswer(marked.toJSON());
  const restored = schema.nodeFromJSON(parseRichAnswer(stored));
  restored.check();
  assert.equal(restored.firstChild!.attrs.textAlign, 'left');
  for (const index of [1, 2]) {
    const before = marked.firstChild!.child(index);
    const after = restored.firstChild!.child(index);
    assert.equal(after.type.name, index === 1 ? 'inlineMath' : 'hardBreak');
    assert.deepEqual(after.marks.map(mark => mark.toJSON()), before.marks.map(mark => mark.toJSON()));
    assert.equal(after.marks.find(mark => mark.type.name === 'textStyle')?.attrs.color, '#be185d');
    assert.equal(after.marks.find(mark => mark.type.name === 'textStyle')?.attrs.fontSize, '20px');
    assert.equal(after.marks.find(mark => mark.type.name === 'highlight')?.attrs.color, '#fef08a');
    assert.ok(after.marks.some(mark => mark.type.name === 'bold'));
  }
  const clipboard = sanitizeRichAnswerSlice(schema, new Slice(marked.content, 0, 0));
  const pasted = schema.nodes.doc.create(null, clipboard.content);
  pasted.check();
  assert.equal(serializeRichAnswer(pasted.toJSON()), stored);
  assert.equal(serializeRichAnswer(restored.toJSON()), stored);
});
