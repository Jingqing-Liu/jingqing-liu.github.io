'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Bold, Code, Heading1, Heading2, Italic, List, ListOrdered, Quote, RemoveFormatting, Strikethrough } from 'lucide-react';
import { richTextFromDom, richTextToHtml } from '../../lib/rich-text';
import s from './StudySpace.module.css';

interface Format { bold: boolean; italic: boolean; strike: boolean; bullet: boolean; ordered: boolean; code: boolean; heading: string; quote: boolean }
const blank: Format = { bold: false, italic: false, strike: false, bullet: false, ordered: false, code: false, heading: '', quote: false };

export default function RichAnswerEditor({ value, editable, label, placeholder, onChange, onActive }: {
  value: string; editable: boolean; label: string; placeholder: string;
  onChange: (value: string) => void; onActive: (active: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  const latest = useRef<string | null>(null);
  const [empty, setEmpty] = useState(!value.trim());
  const [format, setFormat] = useState<Format>(blank);

  // Repaint only while the caret is elsewhere, so typing (and IME composition) is never interrupted.
  useEffect(() => {
    if (!host.current || focused.current || latest.current === value) return;
    host.current.innerHTML = richTextToHtml(value);
    latest.current = value;
    setEmpty(!value.trim());
  }, [value]);

  const emit = useCallback(() => {
    if (!host.current) return;
    const markdown = richTextFromDom(host.current);
    latest.current = markdown;
    setEmpty(!markdown.trim());
    onChange(markdown);
  }, [onChange]);

  const readFormat = useCallback(() => {
    const root = host.current;
    const anchor = window.getSelection()?.anchorNode;
    if (!root || !anchor || !root.contains(anchor)) return;
    let heading = '';
    let quote = false;
    let code = false;
    for (let node: Node | null = anchor; node && node !== root; node = node.parentNode) {
      const tag = node.nodeType === 1 ? (node as HTMLElement).tagName : '';
      if (!heading && /^H[1-6]$/.test(tag)) heading = tag;
      if (tag === 'BLOCKQUOTE') quote = true;
      if (tag === 'CODE') code = true;
    }
    const state = (command: string) => { try { return document.queryCommandState(command); } catch { return false; } };
    setFormat({ bold: state('bold'), italic: state('italic'), strike: state('strikeThrough'), bullet: state('insertUnorderedList'), ordered: state('insertOrderedList'), code, heading, quote });
  }, []);

  useEffect(() => {
    if (!editable) return;
    const listener = () => readFormat();
    document.addEventListener('selectionchange', listener);
    return () => document.removeEventListener('selectionchange', listener);
  }, [editable, readFormat]);

  const command = (name: string, argument?: string) => {
    if (!host.current || !editable) return;
    host.current.focus();
    try { document.execCommand('styleWithCSS', false, 'false'); } catch { /* not every browser exposes it */ }
    try { document.execCommand(name, false, argument); } catch { /* an unsupported command simply does nothing */ }
    emit();
    readFormat();
  };

  const toggleHeading = (tag: string) => command('formatBlock', format.heading === tag ? 'p' : tag);
  const toggleQuote = () => command(format.quote ? 'outdent' : 'formatBlock', format.quote ? undefined : 'blockquote');
  const toggleCode = () => {
    const root = host.current;
    const selection = window.getSelection();
    if (!root || !editable || !selection) return;
    if (format.code) {
      for (let node: Node | null = selection.anchorNode; node && node !== root; node = node.parentNode) {
        const parent = node.parentNode;
        if (node.nodeType !== 1 || (node as HTMLElement).tagName !== 'CODE' || !parent) continue;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
        break;
      }
      root.focus();
      emit();
      readFormat();
      return;
    }
    if (selection.isCollapsed) return;
    const text = selection.toString().replace(/[&<>]/g, character => (character === '&' ? '&amp;' : character === '<' ? '&lt;' : '&gt;'));
    command('insertHTML', `<code>${text}</code>`);
  };
  const clearFormat = () => {
    if (!host.current || !editable) return;
    host.current.focus();
    try { document.execCommand('styleWithCSS', false, 'false'); } catch { /* ignored */ }
    if (format.bullet) document.execCommand('insertUnorderedList');
    if (format.ordered) document.execCommand('insertOrderedList');
    if (format.quote) document.execCommand('outdent');
    document.execCommand('removeFormat');
    document.execCommand('formatBlock', false, 'p');
    emit();
    readFormat();
  };

  const button = (key: string, active: boolean | undefined, title: string, icon: ReactNode, action: () => void) => (
    <button key={key} type="button" title={title} aria-label={title} aria-pressed={active} data-on={!!active} disabled={!editable}
      onMouseDown={event => event.preventDefault()} onClick={action}>{icon}</button>
  );

  return <>
    {editable && <div className={s.answerToolbar} role="toolbar" aria-label={`${label}的排版工具`}>
      {button('bold', format.bold, '加粗', <Bold size={13} />, () => command('bold'))}
      {button('italic', format.italic, '斜体', <Italic size={13} />, () => command('italic'))}
      {button('strike', format.strike, '删除线', <Strikethrough size={13} />, () => command('strikeThrough'))}
      <span aria-hidden="true" />
      {button('h4', format.heading === 'H4', '大标题', <Heading1 size={13} />, () => toggleHeading('h4'))}
      {button('h5', format.heading === 'H5', '小标题', <Heading2 size={13} />, () => toggleHeading('h5'))}
      <span aria-hidden="true" />
      {button('ul', format.bullet, '项目符号', <List size={13} />, () => command('insertUnorderedList'))}
      {button('ol', format.ordered, '编号列表', <ListOrdered size={13} />, () => command('insertOrderedList'))}
      {button('quote', format.quote, '引用', <Quote size={13} />, toggleQuote)}
      {button('code', format.code, '行内代码', <Code size={13} />, toggleCode)}
      <span aria-hidden="true" />
      {button('clear', undefined, '清除格式', <RemoveFormatting size={13} />, clearFormat)}
    </div>}
    <div ref={host} className={s.answerEditor} contentEditable={editable} suppressContentEditableWarning
      role="textbox" aria-multiline="true" aria-label={label} aria-readonly={!editable} tabIndex={0}
      data-empty={empty} data-editable={editable} data-placeholder={placeholder}
      onInput={emit}
      onFocus={() => {
        if (!editable) return;
        focused.current = true;
        onActive(true);
        try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* ignored */ }
        readFormat();
      }}
      onBlur={() => { if (!editable) return; focused.current = false; onActive(false); setFormat(blank); }}
      onPaste={event => {
        if (!editable) return;
        event.preventDefault();
        document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
        emit();
      }}
      onDrop={event => {
        if (!editable) return;
        event.preventDefault();
        document.execCommand('insertText', false, event.dataTransfer.getData('text/plain'));
        emit();
      }} />
  </>;
}
