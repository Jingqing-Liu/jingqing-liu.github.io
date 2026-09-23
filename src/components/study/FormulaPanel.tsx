'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, Sigma, X } from 'lucide-react';
import katex from 'katex';
import s from './FormulaPanel.module.css';

interface FormulaPanelProps {
  initialLatex?: string;
  initialDisplay?: boolean;
  editing?: boolean;
  onSubmit: (value: { latex: string; display: boolean }) => void;
  onCancel: () => void;
}

const maxLength = 4000;
const templates = [
  { label: '分数', symbol: 'a/b', latex: '\\frac{a}{b}', select: '{a}', inset: 1 },
  { label: '上标', symbol: 'x²', latex: 'x^{2}', select: '2' },
  { label: '下标', symbol: 'xᵢ', latex: 'x_{i}', select: 'i' },
  { label: '根号', symbol: '√x', latex: '\\sqrt{x}', select: 'x' },
  { label: '求和', symbol: '∑', latex: '\\sum_{i=1}^{n} x_i', select: 'n' },
  { label: '积分', symbol: '∫', latex: '\\int_{a}^{b} f(x)\\,dx', select: 'a' },
  { label: '矩阵', symbol: '[a b]', latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', select: ' a ', inset: 1 },
  { label: '传输时延', symbol: 'L/R', latex: 'd_{\\mathrm{trans}} = \\frac{L}{R}', select: 'L' },
];

export default function FormulaPanel({ initialLatex = '', initialDisplay = false, editing = false, onSubmit, onCancel }: FormulaPanelProps) {
  const [latex, setLatex] = useState(initialLatex);
  const [display, setDisplay] = useState(initialDisplay);
  const [insertionError, setInsertionError] = useState('');
  const field = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({ start: initialLatex.length, end: initialLatex.length });
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);
  const id = useId();

  useEffect(() => {
    field.current?.focus();
    field.current?.setSelectionRange(initialLatex.length, initialLatex.length);
    // The editor mounts a fresh panel for each formula, keeping unsaved input local.
  }, [initialLatex]);

  useEffect(() => {
    const next = pendingSelection.current;
    if (!next || !field.current) return;
    field.current.focus();
    field.current.setSelectionRange(next.start, next.end);
    selection.current = next;
    pendingSelection.current = null;
  }, [latex]);

  const preview = useMemo(() => {
    if (!latex.trim()) return { html: '', error: '' };
    if (latex.length > maxLength) return { html: '', error: '公式最多可输入 4,000 个字符，请精简后再插入。' };
    try {
      return {
        html: katex.renderToString(latex, {
          displayMode: display,
          throwOnError: true,
          trust: false,
          strict: 'error',
          maxExpand: 1000,
          maxSize: 20,
        }),
        error: '',
      };
    } catch {
      return { html: '', error: '公式暂时无法解析，请检查命令、括号和上下标。' };
    }
  }, [latex, display]);

  const canSubmit = !!preview.html && !preview.error;
  const submit = () => {
    if (canSubmit) onSubmit({ latex: latex.trim(), display });
  };

  const insert = (template: (typeof templates)[number]) => {
    const start = Math.min(selection.current.start, latex.length);
    const end = Math.min(selection.current.end, latex.length);
    const next = latex.slice(0, start) + template.latex + latex.slice(end);
    if (next.length > maxLength) {
      setInsertionError('空间不够了，请先精简公式，再添加模板。');
      field.current?.focus();
      return;
    }
    const offset = template.latex.indexOf(template.select);
    const inset = template.inset ?? 0;
    pendingSelection.current = { start: start + offset + inset, end: start + offset + template.select.length - inset };
    setInsertionError('');
    if (next === latex) {
      field.current?.focus();
      field.current?.setSelectionRange(pendingSelection.current.start, pendingSelection.current.end);
      selection.current = pendingSelection.current;
      pendingSelection.current = null;
    } else {
      setLatex(next);
    }
  };

  return <section className={s.panel} aria-labelledby={`${id}-title`} onKeyDown={event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    onCancel();
  }}>
    <div className={s.header}>
      <div className={s.title}>
        <span className={s.icon}><Sigma size={17} aria-hidden="true" /></span>
        <div><h4 id={`${id}-title`}>{editing ? '编辑公式' : '插入公式'}</h4><p>选择一个模板，或直接输入表达式。</p></div>
      </div>
      <button type="button" className={s.close} onClick={onCancel} aria-label="关闭公式编辑"><X size={16} /></button>
    </div>

    <div className={s.templates} role="group" aria-label="常用公式模板">
      {templates.map(template => <button type="button" key={template.label} onMouseDown={event => event.preventDefault()} onClick={() => insert(template)} title={`插入${template.label}模板`}>
        <span aria-hidden="true">{template.symbol}</span><small>{template.label}</small>
      </button>)}
    </div>

    <div className={s.fieldHead}>
      <label htmlFor={`${id}-input`}>公式表达式 <span>LaTeX</span></label>
      <span className={s.count}>{latex.length.toLocaleString()} / 4,000</span>
    </div>
    <textarea ref={field} id={`${id}-input`} className={s.input} value={latex} maxLength={maxLength} rows={3} spellCheck={false} autoCapitalize="off" autoCorrect="off"
      placeholder={'例如：\\frac{L}{R} + d_{\\mathrm{prop}}'}
      aria-invalid={!!preview.error} aria-describedby={`${id}-hint${preview.error || insertionError ? ` ${id}-error` : ''}`}
      onSelect={event => { selection.current = { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd }; }}
      onChange={event => {
        selection.current = { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd };
        setLatex(event.currentTarget.value);
        setInsertionError('');
      }}
      onKeyDown={event => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
          event.preventDefault();
          event.stopPropagation();
          submit();
        }
      }} />
    <p id={`${id}-hint`} className={s.hint}>模板会插入光标所在位置，选中的部分可以直接替换。</p>
    {(preview.error || insertionError) && <p id={`${id}-error`} className={s.error} role="status">{preview.error || insertionError}</p>}

    <div className={s.previewHead}>
      <span>效果预览</span>
      <fieldset className={s.mode}>
        <legend className={s.srOnly}>公式排版方式</legend>
        <label data-selected={!display}><input type="radio" name={`${id}-mode`} checked={!display} onChange={() => setDisplay(false)} />行内</label>
        <label data-selected={display}><input type="radio" name={`${id}-mode`} checked={display} onChange={() => setDisplay(true)} />独立一行</label>
      </fieldset>
    </div>
    <div className={s.preview} data-display={display} role="region" aria-label="公式效果预览" tabIndex={0}>
      {preview.html ? <div dangerouslySetInnerHTML={{ __html: preview.html }} /> : <span className={s.emptyPreview}>{preview.error ? '调整表达式后，这里会更新预览' : '输入公式，即可查看效果'}</span>}
    </div>

    <div className={s.footer}>
      <span>⌘ / Ctrl + Enter 确认</span>
      <div>
        <button type="button" className={s.cancel} onClick={onCancel}>取消</button>
        <button type="button" className={s.submit} disabled={!canSubmit} onClick={submit}>{editing ? '更新公式' : '插入公式'}<ArrowRight size={13} aria-hidden="true" /></button>
      </div>
    </div>
  </section>;
}
