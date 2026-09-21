'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BookOpen, Check, CheckCheck, ChevronRight, Clock3, Eye, FileText, Pause, Play, Plus, RotateCcw, Save } from 'lucide-react';
import { dateInTimeZone, getActiveSessions, getPackStatus, getProjectLearners, getReviewStatus, isPackCompleted, isProjectMember, progressKey, type StudyState, type StudyProject, type StudyPack, type StudyChapter, type StudyQuestion, type StudySession, type Progress } from '../../lib/study-model';
import type { useStudyStore } from '../../lib/use-study-store';
import { allocateTimerMinutes, freezeTimer, timerSeconds, type StudyTimer as Timer } from '../../lib/study-timer';
import { Avatar, kindNames } from './StudySpace';
import s from './StudySpace.module.css';

const duration = (minutes: number) => `${Number(minutes.toFixed(2))} 分钟`;
const reviewNames = { unsubmitted: '尚未互检', pending: '等待互检', changes: '待订正', passed: '互检通过' };
const sessionSnapshot = (session: StudySession) => JSON.stringify([
  session.id, session.projectId, session.packId, session.chapterId, session.learnerId,
  session.date, session.minutes, session.note, session.createdAt, session.updatedAt,
  session.voidedAt, session.timeZone, session.timerAdjusted,
  session.timerSegments?.map(segment => [segment.start, segment.end]),
]);

export default function StudyDesk({ state, actor, project, pack, chapter, viewLearner, onViewLearner, onSelectPack, save, notify, onRecord, onReview }: {
  state: StudyState; actor: string; project: StudyProject; pack: StudyPack; chapter: StudyChapter; viewLearner: string; onViewLearner: (id: string) => void; onSelectPack: (p: StudyPack) => void;
  save: ReturnType<typeof useStudyStore>['save']; notify: (message: string) => void; onRecord: () => void; onReview: (learnerId: string) => void;
}) {
  const members = getProjectLearners(state, project.id, true);
  const viewing = members.some(learner => learner.id === viewLearner) ? viewLearner : members.some(learner => learner.id === actor) ? actor : members[0]?.id || actor;
  const actorIsMember = isProjectMember(state, project.id, actor);
  const canEdit = viewing === actor && actorIsMember;
  const learner = members.find(person => person.id === viewing);
  const key = progressKey(project.id, pack.id, viewing);
  const progress = state.progress.find(item => item.id === key);
  const status = getPackStatus(state, project.id, pack.id, viewing);
  const completed = isPackCompleted(state, project.id, pack.id, viewing);
  const reviewStatus = getReviewStatus(state, project.id, pack.id, viewing);
  const sessions = getActiveSessions(state, project.id, viewing).filter(session => session.packId === pack.id);
  const voidedSessions = state.sessions.filter(session => session.projectId === project.id && session.packId === pack.id && session.learnerId === viewing && session.voidedAt);
  const minutes = sessions.reduce((total, session) => total + session.minutes, 0);
  const answered = pack.questions.filter(question => state.answers.some(answer => answer.projectId === project.id && answer.packId === pack.id && answer.questionId === question.id && answer.learnerId === viewing && answer.text.trim())).length;
  const [timer, setTimer] = useState<Timer | null>(null);
  const [now, setNow] = useState(Date.now());
  const timerKey = `studyshare.timer.v2.${actor}`;
  useEffect(() => {
    setTimer(null);
    try {
      const scoped = localStorage.getItem(timerKey);
      const raw = scoped || localStorage.getItem('studyshare.timer.v1');
      if (!raw) return;
      const value: unknown = JSON.parse(raw);
      if (!value || typeof value !== 'object') return;
      const candidate = value as Partial<Timer>;
      if (candidate.learnerId !== actor || !['projectId', 'packId', 'chapterId'].every(field => typeof candidate[field as keyof Timer] === 'string') ||
        typeof candidate.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.date) || typeof candidate.seconds !== 'number' || !Number.isFinite(candidate.seconds) || candidate.seconds < 0 ||
        !(candidate.startedAt === null || (typeof candidate.startedAt === 'number' && Number.isFinite(candidate.startedAt) && candidate.startedAt > 0))) return;
      const segments = candidate.segments || [];
      if (!Array.isArray(segments) || !segments.every(segment => segment && Number.isFinite(segment.start) && Number.isFinite(segment.end) && segment.start > 0 && segment.end >= segment.start)) return;
      const restored = { ...candidate, id: typeof candidate.id === 'string' && candidate.id.startsWith(`${actor}:`) ? candidate.id : `${actor}:${crypto.randomUUID()}`, segments } as Timer;
      // Older paused totals have no interval history. Keep their original learning date.
      localStorage.setItem(timerKey, JSON.stringify(restored));
      setTimer(restored);
      if (!scoped) localStorage.removeItem('studyshare.timer.v1');
    } catch { /* Leave the original timer intact if storage is unavailable. */ }
  }, [actor, timerKey]);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const elapsed = timer ? Math.floor(timerSeconds(timer, now)) : 0;
  const sameTimer = timer?.projectId === project.id && timer?.packId === pack.id && timer?.learnerId === actor;
  const writeTimer = (next: Timer | null) => {
    try { if (next) localStorage.setItem(timerKey, JSON.stringify(next)); else localStorage.removeItem(timerKey); setTimer(next); return true; }
    catch { notify('计时器未能保存，原记录仍保留。请稍后重试或手动记录。'); return false; }
  };
  const currentProgress = (): Progress => ({ id: progressKey(project.id, pack.id, actor), projectId: project.id, packId: pack.id, learnerId: actor, status: 'studying', note: '', evidence: '', ...state.progress.find(item => item.id === progressKey(project.id, pack.id, actor)), updatedAt: new Date().toISOString() });
  const saveAnswer = (questionId: string, text: string) => {
    if (!canEdit) return false;
    const previous = state.answers.find(answer => answer.projectId === project.id && answer.packId === pack.id && answer.questionId === questionId && answer.learnerId === actor);
    if ((previous?.text || '') === text) return true;
    if (!save('progress', { ...currentProgress(), status: 'studying' })) return false;
    return save('answer', { id: `${actor}:${project.id}:${pack.id}:${questionId}`, projectId: project.id, packId: pack.id, questionId, learnerId: actor, text, updatedAt: new Date().toISOString() });
  };
  const startTimer = () => {
    if (!canEdit) return;
    if (timer && !sameTimer) { notify('另一个学习包正在计时，请先保存或清除该计时。'); return; }
    const timestamp = Date.now();
    const next: Timer = timer ? timer.startedAt === null ? { ...timer, startedAt: timestamp } : freezeTimer(timer, timestamp) : { id: `${actor}:${crypto.randomUUID()}`, projectId: project.id, packId: pack.id, chapterId: chapter.id, learnerId: actor, startedAt: timestamp, seconds: 0, date: dateInTimeZone(new Date(timestamp), project.timeZone || 'Asia/Shanghai'), segments: [] };
    if (writeTimer(next) && !progress && !timer) save('progress', currentProgress());
    setNow(timestamp);
  };
  const saveTimer = () => {
    if (!timer || timer.learnerId !== actor) return;
    const stopped = freezeTimer(timer);
    if (timerSeconds(stopped) < 1) { notify('开始专注后即可保存，也可以手动记录。'); return; }
    const timerProject = state.projects.find(item => item.id === timer.projectId);
    const timerChapter = timerProject?.chapters.find(item => item.id === timer.chapterId);
    if (!timerChapter?.packs.some(item => item.id === timer.packId)) { notify('对应学习包已不存在，计时仍保留，请手动记录后再清除。'); return; }
    if (!isProjectMember(state, timer.projectId, actor)) { notify('你已退出该项目。计时仍保留，重新加入后可保存。'); return; }
    if (!writeTimer(stopped)) return;
    try {
      const byDate = allocateTimerMinutes(stopped, timerProject?.timeZone || 'Asia/Shanghai');
      const timestamp = new Date().toISOString();
      for (const { date, minutes, segments } of byDate) {
        if (minutes <= 0) continue;
        const legacy = state.sessions.find(session => session.id === timer.id && session.date === date);
        const id = legacy?.id || `${timer.id}:${date}`;
        const previous = state.sessions.find(session => session.id === id);
        if (!save('session', { id, projectId: timer.projectId, packId: timer.packId, chapterId: timer.chapterId, learnerId: actor, date, minutes, note: stopped.seconds > 0 && date === stopped.date ? '专注计时 · 含旧版累计时间' : '专注计时', createdAt: previous?.createdAt || timestamp, updatedAt: timestamp, ...(segments.length ? { timerSegments: segments } : {}), timeZone: timerProject?.timeZone || 'Asia/Shanghai', timerAdjusted: false })) { notify('保存尚未完成，计时已暂停并保留。重试会补全记录，不会重复计入。'); return; }
      }
      if (writeTimer(null)) notify(`${duration(timerSeconds(stopped) / 60)}已保存，按项目时区分配到 ${byDate.length} 天。`);
    } catch { notify('计时拆分未完成，原计时仍保留。请检查项目时区后重试。'); }
  };
  const reviews = state.reviews.filter(review => review.projectId === project.id && review.packId === pack.id && review.targetLearnerId === viewing).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return <div className={s.desk}>
    <div className={s.deskToolbar}><label>章节<select value={chapter.id} aria-label="选择学习章节" onChange={e => { const c = project.chapters.find(item => item.id === e.target.value); if (c?.packs[0]) onSelectPack(c.packs[0]); }}>{project.chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label><label>学习包<select value={pack.id} aria-label="选择学习包" onChange={e => { const p = chapter.packs.find(p => p.id === e.target.value); if (p) onSelectPack(p); }}>{chapter.packs.map(p => <option key={p.id} value={p.id}>{p.id.startsWith('extra-') ? '+' : p.id} · {p.title}</option>)}</select></label></div>
    <section className={s.lessonIntro}><div className={s.cardEyebrow}><BookOpen size={14} />{kindNames[pack.kind]}<span>{pack.base ? '基础学习包' : '追加学习包'}</span></div><h2>{pack.title}</h2><p>{pack.reading || '按照自己的学习材料推进，在下方记下产物和练习。'}</p><div className={s.lessonMeta}><span><Clock3 size={13} />预计 {pack.minutes ? `${pack.minutes} 分钟` : '自行安排'}</span><span><FileText size={13} />{pack.questions.length} 道练习</span></div>{pack.output && <div className={s.output}><strong>这次留下什么</strong><p>{pack.output}</p></div>}{pack.bookPractice && <details className={s.bookPractice}><summary>原书练习与批次说明 <ChevronRight size={13} /></summary><p>{pack.bookPractice}</p></details>}</section>
    <div className={s.workspaceBar}><div className={s.personTabs}>{members.map(member => <button key={member.id} onClick={() => onViewLearner(member.id)} className={viewing === member.id ? s.personActive : ''}><Avatar learner={member} small />{member.name}{!isProjectMember(state, project.id, member.id) ? ' · 已退出' : member.id === actor ? '的作答' : '的记录'}</button>)}</div><div className={s.sessionActions}><span className={s.statusButton} data-status={completed ? 'submitted' : status}>{completed ? '个人已完成' : progress ? '学习中' : '未开始'}</span><span className={s.statusButton} data-status={reviewStatus === 'passed' ? 'passed' : reviewStatus === 'changes' ? 'revision' : 'studying'}>{reviewNames[reviewStatus]}</span></div></div>
    {!canEdit && <div className={s.readonly}><Eye size={14} />正在查看 {learner?.name || '成员'} 的记录；仅项目中的本人可以作答和记录。</div>}
    {canEdit && <div className={s.timerBar}><span className={s.timerIcon}><Clock3 size={18} /></span><div><strong>{timer ? `${String(Math.floor(elapsed / 3600)).padStart(2, '0')}:${String(Math.floor(elapsed / 60) % 60).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}` : '留一段时间给学习'}</strong><small>{timer ? sameTimer ? timer.startedAt ? '正在专注 · 跨天自动按项目时区拆分' : '已暂停，可继续或保存' : `正在计时：${timer.packId}` : '开始计时，或补记已经完成的学习'}</small></div><div className={s.timerActions}><button className={s.secondaryButton} onClick={startTimer} disabled={!!timer && !sameTimer}>{timer?.startedAt && sameTimer ? <Pause size={13} /> : <Play size={13} />}{timer?.startedAt && sameTimer ? '暂停' : '开始'}</button>{timer && <><button className={s.secondaryButton} onClick={saveTimer}><Save size={13} />保存</button><button className={s.iconButton} aria-label="清除当前计时" onClick={() => { if (window.confirm('清除这次尚未保存的计时？已保存记录不会受影响。')) writeTimer(null); }}><RotateCcw size={13} /></button></>}<button className={s.subtleButton} onClick={onRecord}>手动记录</button></div></div>}
    <div className={s.sectionTitle}><h2>动手练习</h2><span>{answered} / {pack.questions.length} 已作答 · 输入后自动保存</span></div>
    <div className={s.questions}>{pack.questions.map((q, index) => { const answer = state.answers.find(a => a.projectId === project.id && a.packId === pack.id && a.questionId === q.id && a.learnerId === viewing); return <QuestionEditor key={`${key}:${q.id}`} question={q} index={index} value={answer?.text || ''} canEdit={canEdit} onSave={value => saveAnswer(q.id, value)} />; })}</div>
    {!pack.questions.length && <div className={s.emptyQuestions}><FileText size={24} /><h3>给真实的练习，留一个位置</h3><p>把原书题目或你自己的练习添加到这个包里。<br />没有题页时，我们不会虚构原书题号和答案。</p></div>}
    {canEdit && <AddQuestion project={project} pack={pack} onSave={p => { const saved = save('project', p); if (saved) notify('练习已添加，项目成员都可以独立作答'); return saved; }} />}
    <RecordEditor key={`${key}:record`} progress={progress} canEdit={canEdit} answered={answered} total={pack.questions.length} completed={completed} reviewStatus={reviewStatus} onSave={(note, evidence, submit) => {
      if (!canEdit) return false;
      if (submit && (!evidence.trim() || answered < pack.questions.length)) { notify('请先完成本包练习，并留下产物或笔记位置。'); return false; }
      const previous = currentProgress();
      // An unchanged manual save must not withdraw a submission or invalidate peer feedback.
      if (!submit && previous.note === note && previous.evidence === evidence) return true;
      const saved = save('progress', { ...previous, note, evidence, status: submit ? 'submitted' : 'studying' });
      if (saved && submit) notify(completed ? '最新作答已提交互检，首次完成日期保持不变' : '个人学习已完成；互检结果会单独记录');
      return saved;
    }} />
    <section className={s.sessionHistory}><div className={s.sectionTitle}><h2>这份学习的时间</h2><span>累计 {duration(minutes)} · {project.timeZone || 'Asia/Shanghai'}</span></div>{sessions.length ? sessions.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map(session => <SessionRecord key={session.id} session={session} canEdit={canEdit} timeZone={project.timeZone || 'Asia/Shanghai'} onSave={next => save('session', next)} />) : <p>还没有记录时间，学完后记下这一次的投入。</p>}{voidedSessions.length > 0 && <details><summary>已撤销的时间记录 · {voidedSessions.length} 条</summary>{voidedSessions.map(session => <SessionRecord key={session.id} session={session} canEdit={canEdit} timeZone={project.timeZone || 'Asia/Shanghai'} onSave={next => save('session', next)} />)}</details>}<p className={s.formHint}>调整或撤销时间只改变学习时长，不会重复增加完成包数。跨天专注自动按项目时区拆分，暂停时间不计入。</p></section>
    {reviews.map(review => <div className={s.reviewNote} key={review.id}><CheckCheck size={18} /><div><strong>{state.learners.find(member => member.id === review.learnerId)?.name || '伙伴'}的反馈 · {review.outcome === 'passed' ? '通过' : '待订正'}{review.submissionUpdatedAt !== progress?.updatedAt ? '（此前版本）' : ''}</strong><p>{review.note}</p><small>{new Date(review.updatedAt).toLocaleDateString('zh-CN')}</small></div></div>)}
    {viewing !== actor && actorIsMember && reviewStatus === 'pending' && <button className={s.primaryButton} onClick={() => onReview(viewing)}><CheckCheck size={15} />为伙伴验收这份学习</button>}
  </div>;
}

function QuestionEditor({ question, index, value, canEdit, onSave }: { question: StudyQuestion; index: number; value: string; canEdit: boolean; onSave: (value: string) => boolean }) {
  const [draft, setDraft] = useState(value); const [saved, setSaved] = useState(true); const [hint, setHint] = useState(false);
  const active = useRef(false);
  useEffect(() => { if (!active.current) setDraft(value); }, [value]);
  return <article className={s.question}><div className={s.questionTitle}><span>{String(index + 1).padStart(2, '0')}</span><h3>{question.prompt}</h3></div><textarea aria-label={`第 ${index + 1} 题的作答`} placeholder={canEdit ? '先用自己的话试着回答，思路也值得记录…' : '伙伴还没有填写答案。'} rows={4} readOnly={!canEdit} value={draft} maxLength={20000} onFocus={() => { active.current = true; }} onBlur={() => { active.current = false; }} onChange={e => { setDraft(e.target.value); setSaved(onSave(e.target.value)); }} /><div className={s.questionFoot}><span>{canEdit ? saved ? <><Check size={12} />已保存到本机{value ? '' : ' · 等你动笔'}</> : '保存失败，请复制答案备份' : '伙伴的独立作答'}</span>{question.hint && <button onClick={() => setHint(!hint)}><Eye size={13} />{hint ? '收起线索' : '作答后核对线索'}</button>}</div>{hint && <div className={s.hint}><strong>核对线索 · 自拟题参考，非原书标准答案</strong><p>{question.hint}</p></div>}</article>;
}
function RecordEditor({ progress, canEdit, answered, total, completed, reviewStatus, onSave }: { progress?: Progress; canEdit: boolean; answered: number; total: number; completed: boolean; reviewStatus: ReturnType<typeof getReviewStatus>; onSave: (note: string, evidence: string, submit: boolean) => boolean }) {
  const [note, setNote] = useState(progress?.note || ''); const [evidence, setEvidence] = useState(progress?.evidence || '');
  const [saved, setSaved] = useState(true);
  const dirty = useRef(false);
  useEffect(() => { if (!dirty.current) { setNote(progress?.note || ''); setEvidence(progress?.evidence || ''); } }, [progress?.note, progress?.evidence]);
  const handleSave = (submit: boolean, nextNote = note, nextEvidence = evidence) => {
    if (!canEdit) return;
    dirty.current = true;
    const success = onSave(nextNote, nextEvidence, submit);
    setSaved(success);
    if (success) dirty.current = false;
  };
  return <section className={s.record}><div className={s.sectionTitle}><h2>笔记与打卡</h2><span>留下一点理解，也留下下次的起点</span></div><label>笔记 / 卡点 / 实际完成的原书题号<textarea rows={4} maxLength={20000} value={note} readOnly={!canEdit} placeholder="原书题请填写真实题号、页码和完成情况。还没解决的问题，也可以写在这里。" onChange={e => { setNote(e.target.value); handleSave(false, e.target.value, evidence); }} onBlur={() => { if (canEdit && dirty.current) handleSave(false); }} /></label><label>本次产物或笔记位置<textarea rows={2} maxLength={4000} value={evidence} readOnly={!canEdit} placeholder="例如：上方三道题的作答；家庭网络图在个人笔记第 3 页。" onChange={e => { setEvidence(e.target.value); handleSave(false, note, e.target.value); }} onBlur={() => { if (canEdit && dirty.current) handleSave(false); }} /></label>{canEdit && <><p className={s.formHint} role="status">{saved ? '输入后自动保存到本机。' : '保存失败，草稿仍在当前页面。请复制备份，或点击保存笔记重试。'}</p><div className={s.recordActions}><button className={s.secondaryButton} onClick={() => handleSave(false)}><Save size={14} />保存笔记</button><button className={s.primaryButton} disabled={!saved || !evidence.trim() || answered < total || reviewStatus === 'pending' || reviewStatus === 'passed'} onClick={() => handleSave(true)}><Check size={14} />{reviewStatus === 'passed' ? '互检已通过' : reviewStatus === 'pending' ? '已完成 · 等待互检' : completed ? '提交最新作答互检' : '完成本包学习'}</button></div></>}<p className={s.formHint}>完成需要当前练习作答及学习产物。个人完成与互检分别记录；修改、订正或补记时间不会改变首次完成日期。</p></section>;
}
function AddQuestion({ project, pack, onSave }: { project: StudyProject; pack: StudyPack; onSave: (p: StudyProject) => boolean }) {
  const [open, setOpen] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const d = new FormData(e.currentTarget); const prompt = String(d.get('prompt')).trim(); if (!prompt) return; const label = String(d.get('label')).trim(); const q: StudyQuestion = { id: `custom-${crypto.randomUUID()}`, prompt: label ? `${label} · ${prompt}` : prompt, hint: String(d.get('hint')).trim() }; if (onSave({ ...project, chapters: project.chapters.map(c => ({ ...c, packs: c.packs.map(p => p.id === pack.id ? { ...p, questions: [...p.questions, q] } : p) })) })) { setOpen(false); e.currentTarget.reset(); } };
  return <details className={s.addPack} open={open} onToggle={e => setOpen(e.currentTarget.open)}><summary><Plus size={14} />添加一道练习 / 原书题</summary><form className={s.form} onSubmit={submit}><label>实际题号或位置<input name="label" maxLength={120} placeholder="例如：第 1 章，p.44，第 2 题（可选）" /></label><label>题目<textarea name="prompt" required rows={3} maxLength={12000} /></label><label>核对线索 <small>可选，默认折叠</small><textarea name="hint" rows={2} maxLength={12000} /></label><button className={s.secondaryButton}>添加练习</button></form></details>;
}

function SessionRecord({ session, canEdit, timeZone, onSave }: { session: StudySession; canEdit: boolean; timeZone: string; onSave: (session: StudySession) => boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ date: session.date, minutes: String(session.minutes), note: session.note });
  const [version, setVersion] = useState(() => sessionSnapshot(session));
  const [error, setError] = useState('');
  const beginEdit = () => {
    setDraft({ date: session.date, minutes: String(session.minutes), note: session.note });
    setVersion(sessionSnapshot(session));
    setError(''); setEditing(true);
  };
  const persist = (next: StudySession) => {
    if (!canEdit) return false;
    if (onSave({ ...next, updatedAt: new Date().toISOString() })) { setError(''); return true; }
    setError('保存失败，原记录与当前输入已保留，请稍后重试。'); return false;
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sessionSnapshot(session) !== version) { setError('这条记录已在其他设备更新。请先复制当前输入，再取消并重新打开编辑。'); return; }
    const minutes = Number(draft.minutes);
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 1500) { setError('请输入大于 0 且不超过 1500 的学习分钟数。'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !Number.isFinite(Date.parse(`${draft.date}T12:00:00Z`)) || new Date(`${draft.date}T12:00:00Z`).toISOString().slice(0, 10) !== draft.date || draft.date > dateInTimeZone(new Date(), timeZone)) { setError('请选择有效日期，且不能晚于项目时区的今天。'); return; }
    const adjusted = session.timerSegments !== undefined && (draft.date !== session.date || minutes !== session.minutes);
    if (persist({ ...session, date: draft.date, minutes, note: draft.note, ...(adjusted ? { timerAdjusted: true } : {}) })) setEditing(false);
  };
  return <div className={s.sessionEntry}>
    <div className={s.sessionEntryTop}><time>{session.date}</time><span>{session.note || '一次专注'}{session.voidedAt ? ' · 已撤销' : ''}{session.timerAdjusted ? ' · 时长或日期已调整' : ''}</span><strong>{duration(session.minutes)}</strong></div>
    {!!session.timerSegments?.length && <details><summary>原始计时片段 · {session.timeZone || timeZone}</summary>{session.timerSegments.map((segment, index) => <p className={s.formHint} key={`${segment.start}:${index}`}>{new Date(segment.start).toLocaleString('zh-CN', { timeZone: session.timeZone || timeZone, hour12: false })} → {new Date(segment.end).toLocaleString('zh-CN', { timeZone: session.timeZone || timeZone, hour12: false })}</p>)}{session.timerAdjusted && <p className={s.formHint}>统计使用调整后的日期与分钟；以上起止保留为原始凭据。</p>}</details>}
    {canEdit && !editing && <div className={s.sessionActions}>{session.voidedAt ? <p className={s.formHint}>已撤销，需重新记录时可手动补录。</p> : <><button type="button" className={s.subtleButton} onClick={beginEdit}>编辑日期 / 时长 / 备注</button><button type="button" className={s.subtleButton} onClick={() => persist({ ...session, voidedAt: new Date().toISOString() })}>撤销记录</button></>}</div>}
    {canEdit && editing && <form className={`${s.form} ${s.sessionEdit}`} onSubmit={submit}><div className={s.formRow}><label>学习日期<input type="date" required max={dateInTimeZone(new Date(), timeZone)} value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} /></label><label>实际分钟<input type="number" required min="0.00000001" max={1500} step="any" value={draft.minutes} onChange={event => setDraft({ ...draft, minutes: event.target.value })} /></label></div><label>备注<textarea rows={2} maxLength={4000} value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} /></label><div className={s.sessionActions}><button className={s.secondaryButton} type="submit"><Save size={12} />保存修改</button><button className={s.subtleButton} type="button" onClick={() => { setEditing(false); setError(''); }}>取消编辑</button></div></form>}
    {error && <p className={s.formHint} role="alert">{error}</p>}
  </div>;
}
