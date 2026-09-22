'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, FileText, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import type { StudyPack, StudyProject, StudyQuestion, StudyState } from '../../lib/study-model';
import { Modal } from './StudySpace';
import s from './StudySpace.module.css';

type Panel = { type: 'list' } | { type: 'add' } | { type: 'edit' | 'delete'; question: StudyQuestion };

export default function StudyQuestionManager({ project, pack, state, busy, errorMessage, onSave, onDelete, onClose }: {
  project: StudyProject; pack: StudyPack; state: StudyState; busy: boolean; errorMessage?: string;
  onSave: (project: StudyProject) => boolean; onDelete: (id: string) => Promise<boolean>; onClose: () => void;
}) {
  const [panel, setPanel] = useState<Panel>({ type: 'list' });
  const [search, setSearch] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const pending = busy || deleting;
  const answers = (id: string) => new Set(state.answers.filter(answer => answer.projectId === project.id && answer.packId === pack.id && answer.questionId === id && answer.text.trim()).map(answer => answer.learnerId)).size;
  const openPanel = (next: Panel) => { setPanel(next); setError(''); setFailed(false); setPrompt(next.type === 'edit' ? next.question.prompt : ''); };
  useEffect(() => { if (panel.type === 'edit' || panel.type === 'add') input.current?.focus(); else if (panel.type === 'delete') back.current?.focus(); }, [panel.type]);
  const close = () => { if (!pending) onClose(); };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (pending || (panel.type !== 'add' && panel.type !== 'edit') || !prompt.trim()) return;
    if (panel.type === 'edit' && pack.questions.find(question => question.id === panel.question.id)?.prompt !== panel.question.prompt) {
      setError('这道题已在其他设备修改。请复制当前内容，返回列表后重新打开。'); return;
    }
    const question = panel.type === 'add' ? { id: `custom-${crypto.randomUUID()}`, prompt: prompt.trim() } : { ...panel.question, prompt: prompt.trim() };
    const questions = panel.type === 'add' ? [...pack.questions, question] : pack.questions.map(item => item.id === question.id ? question : item);
    const saved = onSave({ ...project, chapters: project.chapters.map(chapter => ({ ...chapter, packs: chapter.packs.map(item => item.id === pack.id ? { ...item, questions } : item) })) });
    if (saved) openPanel({ type: 'list' }); else setFailed(true);
  };
  const remove = async () => {
    if (panel.type !== 'delete' || pending) return;
    setDeleting(true); setFailed(false);
    try { if (await onDelete(panel.question.id)) openPanel({ type: 'list' }); else setFailed(true); }
    catch { setFailed(true); }
    finally { setDeleting(false); }
  };
  const filtered = pack.questions.filter(question => question.prompt.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <Modal title="管理习题" wide onClose={close}>
    <div className={s.questionManager}>
      <div className={s.managerContext}><span><FileText size={14} />{pack.title}</span><small>创建者管理</small></div>
      {panel.type === 'list' ? <>
        <div className={s.managerToolbar}><div><strong>{pack.questions.length}<span> 道题目</span></strong><p>一起学习，各自作答。</p></div><button className={s.primaryButton} disabled={pending || pack.questions.length >= 1000} onClick={() => openPanel({ type: 'add' })}><Plus size={15} />新增题目</button></div>
        {pack.questions.length > 5 && <label className={s.managerSearch}><Search size={15} /><input aria-label="搜索题号或题目" placeholder="搜索题号或题目" value={search} onChange={event => setSearch(event.target.value)} /></label>}
        <div className={s.managerList} aria-label="本学习包题目列表">
          {filtered.map(question => {
            const index = pack.questions.indexOf(question);
            const [title, ...body] = question.prompt.split('\n');
            const count = answers(question.id);
            return <div key={question.id} className={s.managerRow}>
              <span className={s.managerNumber}>{String(index + 1).padStart(2, '0')}</span>
              <div className={s.managerQuestion}><h3>{title}</h3>{body.length > 0 && <p>{body.join(' ')}</p>}<small><Users size={11} />{count ? `${count} 人已作答` : '还没有作答'}</small></div>
              <div className={s.managerRowActions}><button onClick={() => openPanel({ type: 'edit', question })} disabled={pending} aria-label={`编辑第 ${index + 1} 题`}><Pencil size={14} /><span>编辑</span></button><button onClick={() => openPanel({ type: 'delete', question })} disabled={pending} aria-label={`删除第 ${index + 1} 题`}><Trash2 size={14} /><span>删除</span></button></div>
            </div>;
          })}
          {!filtered.length && <div className={s.managerEmpty}><FileText size={25} /><strong>{search ? '没有找到相关题目' : '从第一道题开始'}</strong><p>{search ? '换一个关键词试试。' : '添加教材习题或自己的练习，邀请伙伴一起作答。'}</p></div>}
        </div>
        <p className={s.managerFootnote}><Check size={13} />修改题干保留已有作答；删除题目会清除对应作答。</p>
      </> : <>
        <button ref={back} className={s.managerBack} disabled={pending} onClick={() => openPanel({ type: 'list' })}><ArrowLeft size={14} />返回题目列表</button>
        {panel.type === 'delete' ? <div className={s.managerDelete}>
          <span className={s.deleteSymbol}><Trash2 size={21} /></span><h3>删除这道题？</h3><p>这道题及 {answers(panel.question.id)} 位成员的作答将永久删除。<br />其他题目、打卡和学习时间保留。</p>
          <blockquote>{panel.question.prompt}</blockquote>
          <div className={s.managerFormActions}><button className={s.secondaryButton} disabled={pending} onClick={() => openPanel({ type: 'list' })}>保留题目</button><button className={s.dangerButton} disabled={pending} onClick={() => void remove()}>{pending ? '正在删除…' : '确认删除'}</button></div>
        </div> : <form className={s.managerEditor} onSubmit={save}>
          <div><h3>{panel.type === 'add' ? '新增一道题目' : '编辑题目'}</h3><p>{panel.type === 'add' ? '保存后，所有学习伙伴都可以独立作答。' : '修改对所有学习伙伴生效，已有作答保留。'}</p></div>
          <label htmlFor="study-question-prompt">题目内容<span>可包含题号、小问与计算条件</span></label>
          <textarea id="study-question-prompt" ref={input} rows={10} required maxLength={100000} value={prompt} disabled={pending} placeholder={'例如：R1 · 主机与端系统\n主机与端系统有什么不同？列举几种端系统。'} onChange={event => setPrompt(event.target.value)} />
          <div className={s.managerFormActions}><small>{prompt.length.toLocaleString()} 字符</small><button type="button" className={s.secondaryButton} disabled={pending} onClick={() => openPanel({ type: 'list' })}>取消</button><button className={s.primaryButton} disabled={pending || !prompt.trim()}><Check size={14} />{panel.type === 'add' ? '添加题目' : '保存修改'}</button></div>
        </form>}
      </>}
      {(error || failed) && <p role="alert" className={s.managerError}>{error || errorMessage || '操作未完成，当前内容已保留，请重试。'}</p>}
    </div>
  </Modal>;
}
