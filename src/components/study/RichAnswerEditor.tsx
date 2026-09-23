'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Check, Code, SquareCode, Highlighter, Italic, Link2, List, ListOrdered, MoreHorizontal, Palette, Quote, Redo2, RemoveFormatting, Sigma, Strikethrough, Subscript as SubIcon, Superscript as SuperIcon, Table2, Underline, Undo2, X } from 'lucide-react';
import { richTextToHtml } from '../../lib/rich-text';
import { parseRichAnswer, serializeRichAnswer, safeRichLink, richAnswerText } from '../../lib/rich-answer';
import { createRichAnswerExtensions, sanitizeRichAnswerSlice } from '../../lib/rich-answer-extensions';
import FormulaPanel from './FormulaPanel';
import 'katex/dist/katex.min.css';
import s from './RichAnswerEditor.module.css';

type Panel = { kind: 'color' | 'highlight' | 'link' | 'table' } | { kind: 'formula'; latex: string; display: boolean; pos?: number };
const textColors = [['#475569', '默认'], ['#dc2626', '红色'], ['#c2410c', '橙色'], ['#a16207', '金色'], ['#15803d', '绿色'], ['#0369a1', '蓝色'], ['#7e22ce', '紫色'], ['#be185d', '粉色']];
const highlights = [['#fef08a', '黄色'], ['#fed7aa', '橙色'], ['#bbf7d0', '绿色'], ['#bae6fd', '蓝色'], ['#e9d5ff', '紫色'], ['#fbcfe8', '粉色']];
const contentFor = (value: string) => value ? parseRichAnswer(value) || richTextToHtml(value) : { type: 'doc', content: [{ type: 'paragraph' }] };

export default function RichAnswerEditor({ value, editable, label, placeholder, onChange, onActive }: {
  value: string; editable: boolean; label: string; placeholder: string;
  onChange: (value: string) => void; onActive: (active: boolean) => void;
}) {
  const editorRef = useRef<Editor | null>(null);
  const callbacks = useRef({ onChange, onActive });
  callbacks.current = { onChange, onActive };
  const latest = useRef(value);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [more, setMore] = useState(false);
  const [url, setUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [customColor, setCustomColor] = useState('#0369a1');
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [active, setActive] = useState(false);
  const selection = useRef({ from: 1, to: 1 });
  const open = (next: Panel) => {
    const current = editorRef.current;
    if (!current?.isEditable) return;
    selection.current = { from: current.state.selection.from, to: current.state.selection.to };
    setNotice(''); setPanel(next);
    if (next.kind === 'link') setUrl(current.getAttributes('link').href || '');
  };
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable,
    parseOptions: { preserveWhitespace: 'full' },
    extensions: createRichAnswerExtensions({
      onInlineMathClick: (node, pos) => open({ kind: 'formula', latex: node.attrs.latex, display: false, pos }),
      onBlockMathClick: (node, pos) => open({ kind: 'formula', latex: node.attrs.latex, display: true, pos }),
    }),
    content: contentFor(value),
    editorProps: {
      attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': label, 'aria-readonly': String(!editable), spellcheck: 'true' },
      handlePaste: (view, _event, slice) => {
        const current = editorRef.current;
        if (!current?.isEditable) return true;
        const safeSlice = sanitizeRichAnswerSlice(view.state.schema, slice);
        view.dispatch(view.state.tr.replaceSelection(safeSlice).scrollIntoView().setMeta('paste', true).setMeta('uiEvent', 'paste'));
        return true;
      },
      handleDrop: (_view, event) => !!event.dataTransfer?.files.length,
    },
    onUpdate: ({ editor: current }) => {
      setPanel(null);
      const encoded = serializeRichAnswer(current.getJSON());
      latest.current = encoded;
      callbacks.current.onChange(encoded);
    },
  });
  useEffect(() => { editorRef.current = editor; return () => { editorRef.current = null; }; }, [editor]);
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable, false);
    editor.setOptions({ editorProps: { ...editor.options.editorProps, attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': label, 'aria-readonly': String(!editable), spellcheck: 'true' } } });
    if (latest.current !== value && (!active || !editable)) {
      editor.commands.setContent(contentFor(value), { emitUpdate: false, parseOptions: { preserveWhitespace: 'full' } });
      setPanel(null);
      latest.current = value;
    }
    if (!editable) setPanel(null);
  }, [editor, value, editable, label, active]);

  if (!editor) return <div className={s.loading}>{value ? '正在载入作答…' : placeholder}</div>;
  const command = (run: (editor: Editor) => void) => { if (editable) { run(editor); setNotice(''); } };
  const restore = () => editor.chain().focus().setTextSelection({ from: Math.min(selection.current.from, editor.state.doc.content.size), to: Math.min(selection.current.to, editor.state.doc.content.size) });
  const button = (title: string, icon: ReactNode, run: () => void, pressed?: boolean, disabled = false, text?: string) => <button type="button" aria-label={title} title={title} aria-pressed={pressed} data-on={!!pressed} disabled={!editable || disabled} onMouseDown={event => event.preventDefault()} onClick={run}>{icon}{text && <span>{text}</span>}</button>;
  const color = editor.getAttributes('textStyle').color || '#475569';
  let tableRows = 0; let tableCols = 0;
  for (let depth = editor.state.selection.$from.depth; depth > 0; depth--) {
    const node = editor.state.selection.$from.node(depth);
    if (node.type.name === 'table') { tableRows = node.childCount; tableCols = node.firstChild?.childCount || 0; break; }
  }
  const changeColor = (next: string | null) => {
    const chain = restore();
    if (panel?.kind === 'highlight') { if (next) chain.setHighlight({ color: next }).run(); else chain.unsetHighlight().run(); }
    else { if (next) chain.setColor(next).run(); else chain.unsetColor().run(); }
    setPanel(null);
  };
  const insertFormula = ({ latex, display }: { latex: string; display: boolean }) => {
    if (panel?.kind !== 'formula') return;
    if (panel.pos !== undefined) {
      const node = editor.state.doc.nodeAt(panel.pos);
      if (!node || !['inlineMath', 'blockMath'].includes(node.type.name) || node.attrs.latex !== panel.latex) { setNotice('公式位置已变化，请关闭面板后重新选择公式。'); return; }
      if (display === panel.display) {
        if (display) editor.chain().focus().updateBlockMath({ pos: panel.pos, latex }).run();
        else editor.chain().focus().updateInlineMath({ pos: panel.pos, latex }).run();
      } else editor.chain().focus().insertContentAt({ from: panel.pos, to: panel.pos + node.nodeSize }, { type: display ? 'blockMath' : 'inlineMath', attrs: { latex } }).run();
    } else {
      restore().insertContent({ type: display ? 'blockMath' : 'inlineMath', attrs: { latex } }).run();
    }
    setPanel(null);
  };
  return <div className={s.editor} data-editable={editable} onFocusCapture={() => { setActive(true); callbacks.current.onActive(true); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { setActive(false); callbacks.current.onActive(false); } }}>
    {editable && <>
      <div className={s.toolbar} role="toolbar" aria-label={`${label}的排版工具`}>
        <div className={s.toolsGroup}>
          <select aria-label="段落样式" value={editor.isActive('heading', { level: 4 }) ? 'h4' : editor.isActive('heading', { level: 5 }) ? 'h5' : 'p'} onChange={event => command(e => event.target.value === 'p' ? e.chain().focus().setParagraph().run() : e.chain().focus().setHeading({ level: event.target.value === 'h4' ? 4 : 5 }).run())}><option value="p">正文</option><option value="h4">大标题</option><option value="h5">小标题</option></select>
          <select aria-label="文字大小" value={editor.getAttributes('textStyle').fontSize || ''} onChange={event => command(e => event.target.value ? e.chain().focus().setFontSize(event.target.value).run() : e.chain().focus().unsetFontSize().run())}><option value="">字号</option>{[12, 14, 16, 18, 20, 24].map(size => <option value={`${size}px`} key={size}>{size}</option>)}</select>
        </div>
        <div className={s.toolsGroup}>
          {button('加粗', <Bold size={15} />, () => command(e => e.chain().focus().toggleBold().run()), editor.isActive('bold'))}
          {button('斜体', <Italic size={15} />, () => command(e => e.chain().focus().toggleItalic().run()), editor.isActive('italic'))}
          {button('下划线', <Underline size={15} />, () => command(e => e.chain().focus().toggleUnderline().run()), editor.isActive('underline'))}
          {button('文字颜色', <span className={s.colorIcon} style={{ borderColor: color }}><Palette size={15} /></span>, () => panel?.kind === 'color' ? setPanel(null) : open({ kind: 'color' }), panel?.kind === 'color')}
          {button('荧光标记', <Highlighter size={15} />, () => panel?.kind === 'highlight' ? setPanel(null) : open({ kind: 'highlight' }), editor.isActive('highlight'))}
        </div>
        <div className={s.toolsGroup}>{button('插入公式', <Sigma size={16} />, () => open({ kind: 'formula', latex: '', display: false }), panel?.kind === 'formula', false, '公式')}{button('更多排版工具', <MoreHorizontal size={17} />, () => setMore(!more), more)}</div>
        <div className={`${s.toolsGroup} ${s.history}`}>{button('撤销', <Undo2 size={14} />, () => command(e => e.chain().focus().undo().run()), undefined, !editor.can().undo())}{button('重做', <Redo2 size={14} />, () => command(e => e.chain().focus().redo().run()), undefined, !editor.can().redo())}</div>
      </div>
      {more && <div className={`${s.toolbar} ${s.secondary}`} role="toolbar" aria-label="更多排版工具">
        <div className={s.toolsGroup}>
          {button('删除线', <Strikethrough size={15} />, () => command(e => e.chain().focus().toggleStrike().run()), editor.isActive('strike'))}
          {button('上标', <SuperIcon size={15} />, () => command(e => e.chain().focus().toggleSuperscript().run()), editor.isActive('superscript'))}
          {button('下标', <SubIcon size={15} />, () => command(e => e.chain().focus().toggleSubscript().run()), editor.isActive('subscript'))}
        </div><div className={s.toolsGroup}>
          {button('项目符号', <List size={15} />, () => command(e => e.chain().focus().toggleBulletList().run()), editor.isActive('bulletList'))}
          {button('编号列表', <ListOrdered size={15} />, () => command(e => e.chain().focus().toggleOrderedList().run()), editor.isActive('orderedList'))}
          {button('引用', <Quote size={14} />, () => command(e => e.chain().focus().toggleBlockquote().run()), editor.isActive('blockquote'))}
          {button('行内代码', <Code size={15} />, () => command(e => e.chain().focus().toggleCode().run()), editor.isActive('code'))}
          {button('代码块', <SquareCode size={15} />, () => command(e => e.chain().focus().toggleCodeBlock().run()), editor.isActive('codeBlock'))}
        </div><div className={s.toolsGroup}>
          {button('左对齐', <AlignLeft size={14} />, () => command(e => e.chain().focus().setTextAlign('left').run()), editor.isActive({ textAlign: 'left' }))}
          {button('居中', <AlignCenter size={14} />, () => command(e => e.chain().focus().setTextAlign('center').run()), editor.isActive({ textAlign: 'center' }))}
          {button('右对齐', <AlignRight size={14} />, () => command(e => e.chain().focus().setTextAlign('right').run()), editor.isActive({ textAlign: 'right' }))}
        </div><div className={s.toolsGroup}>
          {button('插入或修改链接', <Link2 size={15} />, () => open({ kind: 'link' }), editor.isActive('link'))}
          {button('插入或调整表格', <Table2 size={15} />, () => open({ kind: 'table' }), editor.isActive('table'))}
          {button('清除所选内容格式', <RemoveFormatting size={15} />, () => command(e => e.chain().focus().unsetAllMarks().clearNodes().unsetTextAlign().run()))}
        </div>
      </div>}
      {panel && <div className={s.panel}>
        {panel.kind === 'formula' ? <FormulaPanel key={`${panel.pos ?? 'new'}:${panel.display}`} initialLatex={panel.latex} initialDisplay={panel.display} editing={panel.pos !== undefined} onCancel={() => { setPanel(null); editor.commands.focus(); }} onSubmit={insertFormula} /> : <>
          <div className={s.panelHeader}><strong>{panel.kind === 'color' ? '文字颜色' : panel.kind === 'highlight' ? '荧光标记' : panel.kind === 'link' ? '插入链接' : '表格'}</strong><button type="button" aria-label="关闭工具面板" onClick={() => { setPanel(null); editor.commands.focus(); }}><X size={15} /></button></div>
          {(panel.kind === 'color' || panel.kind === 'highlight') && <><div className={s.swatches}>{(panel.kind === 'color' ? textColors : highlights).map(([hex, name]) => <button key={hex} type="button" aria-label={`${name}${panel.kind === 'color' ? '文字' : '标记'}`} title={name} style={{ background: hex }} onClick={() => changeColor(hex)}>{(panel.kind === 'color' ? color : editor.getAttributes('highlight').color) === hex && <Check size={14} />}</button>)}<button type="button" className={s.resetColor} onClick={() => changeColor(null)}>清除</button></div><div className={s.customColor}><label>自选颜色<input aria-label="自选颜色" type="color" value={customColor} onChange={event => setCustomColor(event.target.value)} /></label><button type="button" onClick={() => changeColor(customColor)}>应用颜色</button><small>选中文字后设置，也可设置接下来输入的颜色。</small></div></>}
          {panel.kind === 'link' && <form className={s.linkForm} onSubmit={event => { event.preventDefault(); const href = safeRichLink(url.trim()); if (!href) { setNotice('请输入完整的 https://、http:// 或 mailto: 链接。'); return; } const chain = restore(); if (selection.current.from === selection.current.to && !editor.isActive('link')) chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href, target: '_blank', rel: 'noopener noreferrer nofollow' } }] }).run(); else chain.extendMarkRange('link').setLink({ href }).run(); setPanel(null); }}><label>链接地址<input aria-label="链接地址" type="text" autoFocus value={url} placeholder="https://…" onChange={event => setUrl(event.target.value)} /></label><div><button type="button" onClick={() => { restore().extendMarkRange('link').unsetLink().run(); setPanel(null); }}>移除链接</button><button type="submit">保存链接</button></div></form>}
          {panel.kind === 'table' && (editor.isActive('table') ? <div className={s.tableTools}><span>{tableRows} 行 × {tableCols} 列</span><button type="button" disabled={tableRows >= 20} onClick={() => command(e => e.chain().focus().addRowAfter().run())}>添加行</button><button type="button" disabled={tableCols >= 12} onClick={() => command(e => e.chain().focus().addColumnAfter().run())}>添加列</button><button type="button" onClick={() => command(e => e.chain().focus().deleteRow().run())}>删除行</button><button type="button" onClick={() => command(e => e.chain().focus().deleteColumn().run())}>删除列</button><button type="button" onClick={() => { command(e => e.chain().focus().deleteTable().run()); setPanel(null); }}>删除表格</button></div> : <form className={s.tableTools} onSubmit={event => { event.preventDefault(); restore().insertTable({ rows, cols: columns, withHeaderRow: true }).run(); setPanel(null); }}><label>行<input type="number" min={1} max={20} required value={rows} onChange={event => setRows(Number(event.target.value))} /></label><label>列<input type="number" min={1} max={12} required value={columns} onChange={event => setColumns(Number(event.target.value))} /></label><button type="submit">插入表格</button></form>)}
        </>}
        {notice && <p role="alert" className={s.notice}>{notice}</p>}
      </div>}
    </>}
    <div className={s.body} data-empty={editor.isEmpty} data-placeholder={placeholder}><EditorContent editor={editor} /></div>
    {editable && <div className={s.editorFoot}><span>{richAnswerText(value).length.toLocaleString()} 字</span><span>颜色、排版与公式随作答一起保存</span></div>}
  </div>;
}
