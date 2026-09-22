'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUpRight, ArrowRight, BookOpen, CalendarDays, Check, CheckCheck, ChevronDown, Clock3, Cloud, Download, GraduationCap, LayoutGrid, ListChecks, MoreHorizontal, Plus, Settings2, Users, X, Upload, LogOut, RefreshCw, CircleHelp, Sparkles } from 'lucide-react';
import { dateKey, getPackStatus, getProjectStats, getReviewStatus, getProjectLearners, isProjectMember, getActiveSessions, getSharedCompleted, isPackCompleted, networkingStudyProject, progressKey, migrateStudyState, type StudyProject, type StudyPack, type StudyChapter, type StudyState, type Learner } from '../../lib/study-model';
import { getNetworkingChapterOneUpdate } from '../../lib/study-template-update';
import { useStudyStore } from '../../lib/use-study-store';
import * as cloud from '../../lib/study-cloud';
import StudyCalendar from './StudyCalendar';
import StudyDesk from './StudyDesk';
import StudyRoomOverview from './StudyRoomOverview';
import s from './StudySpace.module.css';

export const statusNames = { unrecorded: '未登记', studying: '进行中', submitted: '已完成', revision: '待订正', passed: '互检通过' };
export const kindNames = { reading: '阅读', review: '复习题', practice: '习题', lab: '实验' };
export function duration(minutes: number) { const value = Math.round(minutes * 10) / 10; const remainder = Math.round(value % 60 * 10) / 10; return value >= 60 ? `${Math.floor(value / 60)} 小时${remainder ? ` ${remainder} 分` : ''}` : `${value} 分钟`; }
export function Avatar({ learner, small = false }: { learner: Learner; small?: boolean }) { return <span className={`${s.avatar} ${small ? s.avatarSmall : ''}`} style={{ '--person': learner.color } as React.CSSProperties}>{learner.name.slice(0, 1)}</span>; }
export function Modal({ title, children, onClose, error, wide = false }: { wide?: boolean; title: string; children: ReactNode; onClose: () => void; error?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const el = ref.current; el?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !el) return;
      const nodes = Array.from(el.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),a[href],summary,[tabindex]:not([tabindex="-1"])')).filter(node => node.tabIndex >= 0 && node.getClientRects().length > 0);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) { e.preventDefault(); el.focus(); return; }
      const outside = !el.contains(document.activeElement) || document.activeElement === el;
      if (e.shiftKey && (document.activeElement === first || outside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || outside)) { e.preventDefault(); first.focus(); }
    };
    const keepFocus = (e: FocusEvent) => { if (el && !el.contains(e.target as Node)) el.focus(); };
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', keepFocus);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); document.removeEventListener('focusin', keepFocus); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} className={`${s.modal} ${wide ? s.modalWide : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}><div className={s.modalTitle}><h2>{title}</h2><button className={s.iconButton} onClick={onClose} aria-label="关闭弹窗"><X size={18} /></button></div>{children}{error && <p className={s.error} role="alert">{error}</p>}</div></div>;
}

type Tab = 'overview' | 'checkins' | 'calendar' | 'work';
type SessionTarget = { actor: string; project: StudyProject; pack: StudyPack; chapter: StudyChapter; learner: Learner };
type ReviewTarget = { projectId: string; packId: string; learnerId: string; reviewerId: string; submissionUpdatedAt: string; questionsSnapshot: string };
export default function StudySpace() {
  const store = useStudyStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const { state, actor, ready, room } = store;
  const [projectId, setProjectId] = useState('computer-networking');
  const [inRoom, setInRoom] = useState(true);
  const [projectActor, setProjectActor] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [packId, setPackId] = useState('1-01');
  const [viewLearner, setViewLearner] = useState('');
  const [modal, setModal] = useState<'settings' | 'project' | 'session' | 'review' | 'members' | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [sessionTarget, setSessionTarget] = useState<SessionTarget | null>(null);
  const [notice, setNotice] = useState('');
  const [allCalendar, setAllCalendar] = useState(false);
  const [compareIds, setCompareIds] = useState<string[] | null>(null);
  const [showFormer, setShowFormer] = useState(false);
  const visibleProjects = state.projects.filter(p => isProjectMember(state, p.id, actor));
  const project = visibleProjects.find(p => p.id === projectId) || visibleProjects[0];
  const showRoom = inRoom || !project || projectActor !== actor;
  const headerMembers = showRoom ? state.learners : getProjectLearners(state, project.id);
  const allPacks = project?.chapters.flatMap(c => c.packs) || [];
  const packs = allPacks.filter(p => !p.archived);
  const templateUpdate = project ? getNetworkingChapterOneUpdate(project) : null;
  const pack = allPacks.find(p => p.id === packId) || packs[0];
  const chapter = project?.chapters.find(c => c.packs.some(p => p.id === pack?.id)) || project?.chapters[0];
  const me = state.learners.find(l => l.id === actor) || state.learners[0];
  const members = project ? getProjectLearners(state, project.id) : [];
  const comparable = project ? getProjectLearners(state, project.id, showFormer) : [];
  const defaultIds = [actor, ...comparable.map(l => l.id).filter(id => id !== actor)].slice(0, 6);
  const displayed = comparable.filter(l => (compareIds ?? defaultIds).includes(l.id));
  const visibleIds = new Set(visibleProjects.map(p => p.id));
  const calendarState = { ...state, projects: visibleProjects, sessions: state.sessions.filter(ss => visibleIds.has(ss.projectId)), progress: state.progress.filter(p => visibleIds.has(p.projectId)) };
  const sessions = getActiveSessions(state).filter(ss => ss.projectId === project?.id && members.some(l => l.id === ss.learnerId));
  const totalMinutes = Math.round(sessions.reduce((sum, session) => sum + session.minutes, 0));
  const joint = project ? getSharedCompleted(state, project.id) : 0;
  const average = members.length ? Math.round(members.reduce((sum, l) => sum + getProjectStats(state, project.id, l.id).percent, 0) / members.length) : 0;
  const today = dateKey(new Date(), project?.timeZone);
  const weekStart = new Date(`${today}T12:00:00Z`); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
  const weekSessions = sessions.filter(session => session.date >= weekStart.toISOString().slice(0, 10) && session.date <= today);
  const weekDays = new Set(weekSessions.map(session => session.date)).size;
  const hasCompleted = (packId: string, learnerId: string) => !!project && isPackCompleted(state, project.id, packId, learnerId);
  const nextPack = packs.find(p => p.base && !hasCompleted(p.id, actor));
  const openPack = (p: StudyPack, learnerId = actor) => { setPackId(p.id); setViewLearner(learnerId); setTab('work'); };
  const focusContent = () => window.requestAnimationFrame(() => { contentRef.current?.focus({ preventScroll: true }); contentRef.current?.scrollIntoView({ block: 'start' }); });
  const showOverview = () => { setInRoom(true); focusContent(); };
  const changeProject = (id: string) => { const p = visibleProjects.find(item => item.id === id); if (!p) return; setProjectActor(actor); setInRoom(false); setTab('overview'); setProjectId(id); setPackId(p.chapters.flatMap(c => c.packs).find(p => !p.archived)?.id || ''); setChapterFilter('all'); setViewLearner(actor); setCompareIds(null); setShowFormer(false); focusContent(); };
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3500); };
  const openReview = (learnerId: string) => {
    if (!project || !pack) return;
    const submission = state.progress.find(item => item.id === progressKey(project.id, pack.id, learnerId));
    if (!project || learnerId === actor || !submission || submission.status !== 'submitted' || !isProjectMember(state, project.id, learnerId) || !isProjectMember(state, project.id, actor)) {
      notify('伙伴尚未提交可验收的完整记录。'); return;
    }
    setReviewTarget({ projectId: project.id, packId: pack.id, learnerId, reviewerId: actor, submissionUpdatedAt: submission.updatedAt, questionsSnapshot: JSON.stringify(pack.questions) });
    setModal('review');
  };
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `studyshare-${dateKey(new Date())}.json`; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (!ready) return <div className={s.loading}>正在打开学习空间…</div>;
  if (cloud.cloudConfigured && !store.user) return <LoginPage store={store} />;
  if (cloud.cloudConfigured && !room) return <LoginPage store={store} waiting />;
  const addTemplate = () => {
    const p = structuredClone(networkingStudyProject);
    p.id = `networking-${crypto.randomUUID()}`;
    p.ownerId = actor; p.memberIds = [actor]; p.formerMemberIds = []; p.timeZone = 'Asia/Shanghai'; p.revision = 0;
    if (store.save('project', p)) { setProjectId(p.id); setPackId(p.chapters[0].packs[0].id); setTab('overview'); setProjectActor(actor); setInRoom(false); focusContent(); notify('学习计划已加入书架'); }
  };


  return <div className={s.page} lang="zh-CN"><div className={s.shell}>
    <header className={s.header}>
      <div><div className={s.eyebrow}><span className={s.brandMark}><BookOpen size={14} /></span> STUDY TOGETHER <span className={s.eyebrowLine} /></div><h1>一起学<span className={s.titleDot}>.</span></h1><p>各自前进，也一起走远。让每一次专注，都有迹可循。</p></div>
      <div className={s.headerRight}><div className={s.people}>{headerMembers.slice(0, 4).map(l => <Avatar key={l.id} learner={l} />)}{headerMembers.length > 4 && <span className={s.avatarPlaceholder}>+{headerMembers.length - 4}</span>}<div><strong>{room?.name || '我们的学习空间'}</strong><span>{headerMembers.length} 位{showRoom ? '空间成员' : '本书学习伙伴'}</span></div></div><button className={s.iconButton} aria-label="空间设置" onClick={() => setModal('settings')}><Settings2 size={19} /></button></div>
    </header>

    <div className={s.layout}>
      <aside className={s.sidebar}><div className={s.sidebarLabel}>学习书架 <span>{visibleProjects.length.toString().padStart(2, '0')}</span></div>
        <nav className={s.projectNav} aria-label="空间导航"><button className={`${s.projectButton} ${showRoom ? s.projectActive : ''}`} aria-current={showRoom ? 'page' : undefined} onClick={showOverview}><span className={s.projectIcon}><LayoutGrid size={18} /></span><span><strong>空间总览</strong><small>所有书籍 · 成员进度</small></span>{showRoom && <span className={s.activeDot} />}</button>{visibleProjects.map(p => <button key={p.id} aria-current={!showRoom && project.id === p.id ? 'page' : undefined} onClick={() => changeProject(p.id)} className={`${s.projectButton} ${!showRoom && project.id === p.id ? s.projectActive : ''}`}><span className={s.projectIcon} style={{ color: p.color }}>{p.kind === 'book' ? <BookOpen size={18} /> : <GraduationCap size={18} />}</span><span><strong>{p.title}</strong><small>{p.subtitle || `${p.chapters.length} 个章节`}</small></span>{!showRoom && project.id === p.id && <span className={s.activeDot} />}</button>)}</nav>
        <button className={s.addProject} onClick={() => setModal('project')}><Plus size={15} /> 添加书籍 / 项目</button>
        <div className={s.sidebarBottom}><div className={s.smallLabel}>当前记录人</div>{room ? <div className={s.currentPerson}><Avatar learner={me} small /><strong>{me.name}</strong></div> : <label className={s.actorSelect}><Avatar learner={me} small /><select aria-label="切换本机记录人" value={actor} onChange={e => { store.selectActor(e.target.value); setInRoom(true); setViewLearner(e.target.value); setCompareIds(null); setChapterFilter('all'); }}>{state.learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select><ChevronDown size={13} /></label>}
        <button className={s.connection} onClick={() => setModal('settings')}><span className={room ? s.onlineDot : s.localDot} />{room ? store.syncing ? '正在同步' : store.pending ? `${store.pending} 条待同步` : '共享空间 · 自动同步' : '本机模式 · 已开启保存'}<ArrowUpRight size={12} /></button>
        {!room && <p className={s.localNote}>记录仅保存在当前浏览器。连接共享空间后，可与伙伴跨设备同步。</p>}
        <button className={s.subtleButton} onClick={exportBackup}><Download size={14} /> 导出学习备份</button></div>
      </aside>

      <div className={s.content} ref={contentRef} tabIndex={-1}>
        {store.editMessage && <p className={s.error} role="status">{store.editMessage}</p>}
        {store.error && <div role="alert" className={s.error}>{store.error}<button onClick={() => void store.sync()}>重试同步</button></div>}
        <ConflictPanel store={store} />
        {showRoom ? <StudyRoomOverview key={actor} state={state} actor={actor} onOpenProject={changeProject} onAddProject={() => setModal('project')} onAddTemplate={addTemplate} /> : <>
        <div className={s.roomBreadcrumb}><button onClick={showOverview}><LayoutGrid size={13} />空间总览</button><span aria-hidden="true">/</span><span>{project.title}</span></div>
        <nav className={s.tabs} aria-label="学习空间视图">{([{ id: 'overview', label: '本书总览', icon: LayoutGrid }, { id: 'checkins', label: '学习打卡', icon: ListChecks }, { id: 'calendar', label: '学习日历', icon: CalendarDays }, { id: 'work', label: '习题与笔记', icon: BookOpen }] as const).map(item => <button key={item.id} className={tab === item.id ? s.tabActive : ''} onClick={() => { setTab(item.id); setViewLearner(actor); }} aria-current={tab === item.id ? 'page' : undefined}><item.icon size={15} />{item.label}</button>)}</nav>
        <div className={s.memberToolbar}><span>{project.title} · {members.length} 人参与</span><div>{(tab === 'overview' || tab === 'checkins') && <details className={s.comparePicker}><summary><Users size={13} /> 对比成员 {displayed.length}</summary><div><label className={s.checkLabel}><input type="checkbox" checked={showFormer} onChange={e => { setShowFormer(e.target.checked); setCompareIds(null); }} />包含已退出成员</label>{comparable.map(l => <label key={l.id} className={s.checkLabel}><input type="checkbox" checked={displayed.some(p => p.id === l.id)} disabled={!displayed.some(p => p.id === l.id) && displayed.length >= 6} onChange={e => setCompareIds(e.target.checked ? [...displayed.map(p => p.id), l.id] : displayed.filter(p => p.id !== l.id).map(p => p.id))} /><Avatar learner={l} small />{l.name}{!isProjectMember(state, project.id, l.id) ? ' · 已退出' : ''}</label>)}<small>一次最多对比 6 人，可随时切换。</small></div></details>}<button className={s.subtleButton} onClick={() => setModal('members')}><Plus size={13} />管理成员</button></div></div>

        {templateUpdate && <details className={s.curriculumNotice}><summary><span className={s.curriculumNoticeIcon}><BookOpen size={15} /></span><span><strong>{templateUpdate.addedPacks ? '第一章 · 教材原题已就绪' : '第一章 · 整理旧版内容'}</strong><small>{templateUpdate.addedPacks ? '更新习题与 Wireshark 实验' : '只留下新版学习内容'}</small></span><span className={s.curriculumNoticeAction}>查看<ChevronDown size={14} /></span></summary><div><p>将永久删除 {templateUpdate.removedPackIds.length} 个旧学习包，以及所有成员对应的答案、打卡、互检和学习时间。新版记录及其他章节保留。</p>{project.ownerId === actor ? <button className={s.secondaryButton} disabled={store.replacingChapter} onClick={() => {
          void store.replaceChapterOne(project.id).then(saved => {
            if (saved) { setPackId('ch1-01'); notify('旧学习包及其记录已删除，只保留新版内容'); }
          });
        }}><RefreshCw size={13} />{store.replacingChapter ? '正在更新…' : templateUpdate.addedPacks ? '替换为新版习题' : '删除旧学习包'}</button> : <small>请由本书创建者完成整理。</small>}</div></details>}

        {tab === 'overview' && <>
          <div className={s.stats}><div><span><Clock3 size={14} /> 累计一起投入</span><strong>{Math.floor(totalMinutes / 60)}<small>小时</small>{totalMinutes % 60}<small>分钟</small></strong><p>当前项目 · {members.length} 人合计</p></div><div><span><CalendarDays size={14} /> 本周学习足迹</span><strong>{weekDays}<small>天 / 本周</small></strong><p>{weekSessions.length ? `留下了 ${weekSessions.length} 次专注记录` : '从今天的一次专注开始'}</p></div><div><span><CheckCheck size={14} /> 小组平均进度</span><strong>{average}<small>%</small></strong><p>当前 {members.length} 人 · 共同完成 {joint} 包</p></div></div>
          <section className={s.featured}><div className={s.bookArt} aria-hidden="true"><span>LEARN<br />CONNECT<br />GROW.</span><div className={s.orbitOne} /><div className={s.orbitTwo} /><div className={s.orbitThree} /><small>{project.kind === 'book' ? 'READING TOGETHER' : 'BUILDING TOGETHER'}</small></div><div className={s.featuredBody}><div className={s.cardEyebrow}><span className={s.blueDot} /> 正在一起学习 <span>{project.kind === 'book' ? '书籍' : '项目'}</span></div><h2>{project.title}</h2><p>{project.subtitle}</p><div className={s.bookMeta}><span>{project.chapters.length} 个章节</span><span>{packs.filter(p => p.base).length} 个基础学习包</span><span>{packs.reduce((n, p) => n + p.questions.length, 0)} 道练习</span></div><div className={s.progressList}>{displayed.map(l => { const stats = getProjectStats(state, project.id, l.id); return <div key={l.id} className={s.progressRow}><Avatar learner={l} small /><span>{l.name}</span><div className={s.progressTrack}><i style={{ width: `${stats.percent}%`, background: l.color }} /></div><strong>{stats.percent}%</strong><small title={`已完成 ${stats.completed} / ${stats.total}，互检通过 ${stats.verified}`}>{stats.completed}/{stats.total} · 互检 {stats.verified}</small></div>; })}</div><div className={s.featuredFoot}><span><Users size={13} /> {members.length} 位成员 · 按自己的节奏前进</span><button onClick={() => setTab('checkins')}>查看进度 <ArrowRight size={14} /></button></div></div></section>
          <div className={s.nextRow}><section className={s.nextCard}><div className={s.cardEyebrow}><Sparkles size={14} /> 下一步，从这里开始</div><small>{nextPack?.id.replace(/^ch1-/, '1-')} · {nextPack ? kindNames[nextPack.kind] : ''}</small><h3>{nextPack?.title || '基础计划已完成'}</h3><p>{nextPack?.minutes ? `预计 ${nextPack.minutes} 分钟 · 可以分几次完成` : '一点一滴，也是在前进。'}</p><button className={s.primaryButton} onClick={() => nextPack ? openPack(nextPack) : setTab('checkins')}>{nextPack ? '进入学习' : '回顾学习'} <ArrowRight size={15} /></button></section><section className={s.rhythmCard}><div className={s.cardEyebrow}><Users size={14} /> 伙伴动态</div>{displayed.map(l => { const recent = sessions.filter(ss => ss.learnerId === l.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]; return <div className={s.activity} key={l.id}><Avatar learner={l} small /><div><strong>{l.name}</strong><p>{recent ? `${recent.date.slice(5).replace('-', '/')} · 专注 ${duration(recent.minutes)}` : '还没有登记学习记录'}</p></div></div>; })}<p className={s.gentleNote}>进度可以不同，坚持可以一起。</p></section></div>
          <div className={s.sectionTitle}><h2>章节路线</h2><span>{project.chapters.length} 个章节 · 按包推进，不赶进度</span></div><div className={s.chapterGrid}>{project.chapters.map((c, i) => <button className={s.chapterCard} key={c.id} onClick={() => { setChapterFilter(c.id); setTab('checkins'); }}><span className={s.chapterNumber}>{String(i + 1).padStart(2, '0')}</span><div><h3>{c.title}</h3><p>{c.packs.filter(p => !p.archived).length} 个学习包 <span>{c.packs.filter(p => !p.archived).reduce((n, p) => n + p.questions.length, 0)} 道练习</span></p><div className={s.miniTracks}>{displayed.map(l => { const base = c.packs.filter(p => p.base); const count = base.filter(p => hasCompleted(p.id, l.id)).length; return <span key={l.id} title={`${l.name}：${count}/${base.length}`}><i style={{ background: l.color, width: `${base.length ? count / base.length * 100 : 0}%` }} /></span>; })}</div></div><ArrowUpRight size={15} /></button>)}</div>
          <p className={s.footnote}><CircleHelp size={13} /> 完成进度记录自己的学习，互检单独显示。追加练习不改变基础进度；完成基础包不等于完成原书全部习题。</p>
        </>}
        {tab === 'checkins' && <>
          <div className={s.viewHeading}><div><h2>学习打卡</h2><p>每一格，都记录着一个人的努力。</p></div><select aria-label="筛选章节" className={s.select} value={chapterFilter} onChange={e => setChapterFilter(e.target.value)}><option value="all">全部章节</option>{project.chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
          <div className={s.tableScroll}><table className={s.checkinTable}><thead><tr><th>学习包 / 章节</th><th>预计用时</th>{displayed.map(l => <th key={l.id}><span className={s.tablePerson}><Avatar learner={l} small />{l.name}</span></th>)}</tr></thead><tbody>{project.chapters.filter(c => chapterFilter === 'all' || c.id === chapterFilter).map(c => <ChapterRows key={c.id} chapter={c} project={project} state={state} learners={displayed} openPack={openPack} />)}</tbody></table></div>
          <div className={s.legend}>{Object.entries(statusNames).map(([key, value]) => <span key={key}><i data-status={key} />{value}</span>)}</div><p className={s.footnote}>点击自己的状态，进入学习并打卡；点击伙伴的状态，查看作答与互检。同一学习包可分多天记录，完成只计算一次。</p>
          {project.ownerId === actor && <AddPack project={project} onAdd={p => { const saved = store.save('project', p); if (saved) notify('学习包已添加'); return saved; }} />}
        </>}
        {tab === 'calendar' && <><div className={s.viewHeading}><div><h2>学习日历</h2><p>把时间留在这里，看见彼此的坚持。</p></div><label className={s.checkLabel}><input type="checkbox" checked={allCalendar} onChange={e => setAllCalendar(e.target.checked)} />全部项目</label></div><StudyCalendar actor={actor} state={calendarState} projectId={allCalendar ? undefined : project.id} /></>}
        {tab === 'work' && pack && <StudyDesk key={`${project.id}:${actor}`} state={state} actor={actor} project={project} pack={pack} chapter={chapter} viewLearner={viewLearner || actor} onViewLearner={setViewLearner} onSelectPack={p => { setPackId(p.id); focusContent(); }} managementError={store.error} busy={store.replacingChapter} onDeleteQuestion={id => store.deleteQuestion(project.id, pack.id, id).then(saved => { if (saved) notify('题目及所有成员的对应作答已删除'); return saved; })} save={store.save} notify={notify} onRecord={() => { setSessionTarget({ actor, project, pack, chapter, learner: me }); setModal('session'); }} onReview={openReview} />}


        </>}
      </div>
    </div><footer className={s.spaceFooter}><span>STUDY TOGETHER</span><span>不必每天满分，只要继续向前。</span><button onClick={() => setModal('settings')}><MoreHorizontal size={18} /><span className={s.srOnly}>空间设置</span></button></footer>
    {notice && <div role="status" className={s.toast}><Check size={15} />{notice}</div>}
    {modal === 'project' && <Modal error={store.error} title="开启一段新的学习" onClose={() => setModal(null)}><ProjectForm learners={state.learners} actor={actor} onSave={p => { if (store.save('project', p)) { setProjectId(p.id); setPackId(p.chapters[0].packs[0].id); setChapterFilter('all'); setViewLearner(actor); setCompareIds(null); setShowFormer(false); setTab('overview'); setProjectActor(actor); setInRoom(false); setModal(null); focusContent(); notify('新项目已加入书架'); } }} /></Modal>}
    {modal === 'session' && sessionTarget && <Modal error={store.error} title="记录这次专注" onClose={() => setModal(null)}><SessionForm project={sessionTarget.project} pack={sessionTarget.pack} learner={sessionTarget.learner} onSave={(date, minutes, note) => {
      const target = sessionTarget;
      if (actor !== target.actor || !isProjectMember(state, target.project.id, actor)) { notify('账号或本书成员资格已经变化。此记录尚未保存，请核对后重新打开。'); return; }
      const saved = store.save('session', { id: `${actor}:${crypto.randomUUID()}`, projectId: target.project.id, packId: target.pack.id, chapterId: target.chapter.id, learnerId: actor, date, minutes, note, createdAt: new Date().toISOString() });
      if (saved) { setModal(null); notify('学习时间已记入日历'); }
    }} /></Modal>}
    {modal === 'review' && reviewTarget && <Modal error={store.error} title="给伙伴一次真实的反馈" onClose={() => setModal(null)}><ReviewForm onSave={(outcome, note) => {
      const target = reviewTarget;
      const currentPack = state.projects.find(p => p.id === target.projectId)?.chapters.flatMap(c => c.packs).find(p => p.id === target.packId);
      if (!currentPack || JSON.stringify(currentPack.questions) !== target.questionsSnapshot) { notify('习题内容已更新，请关闭弹窗重新查看作答后再互检。'); return; }
      const submission = state.progress.find(item => item.id === progressKey(target.projectId, target.packId, target.learnerId));
      if (actor !== target.reviewerId || target.learnerId === actor || !isProjectMember(state, target.projectId, target.learnerId) || !isProjectMember(state, target.projectId, actor)) { notify('记录人已变化，请关闭弹窗后重新查看伙伴的作答。'); return; }
      if (!submission || submission.updatedAt !== target.submissionUpdatedAt) { notify('伙伴已更新这份学习，请关闭弹窗，重新查看作答后再验收。'); return; }
      if (submission.status !== 'submitted' || !submission.evidence.trim()) { notify('这份学习当前不可验收，请关闭弹窗后查看最新状态。'); return; }
      if (!note.trim()) { notify('请填写实际核查内容或订正建议。'); return; }
      if (store.save('review', { id: `${actor}:${target.projectId}:${target.packId}:${target.learnerId}`, projectId: target.projectId, packId: target.packId, learnerId: actor, targetLearnerId: target.learnerId, outcome, note: note.trim(), submissionUpdatedAt: target.submissionUpdatedAt, updatedAt: new Date().toISOString() })) { setModal(null); notify(outcome === 'passed' ? '已记录你的互检反馈' : '已留下订正建议'); }
    }} /></Modal>}
    {modal === 'members' && project && <Modal error={store.error} title={`${project.title} · 学习成员`} onClose={() => setModal(null)}><MembersPanel project={project} store={store} onSaved={() => { setModal(null); setCompareIds(null); notify('本书成员已更新'); }} /></Modal>}
    {modal === 'settings' && <Modal error={store.error} title="我们的学习空间" onClose={() => setModal(null)}><SettingsPanel store={store} exportBackup={exportBackup} notify={notify} /></Modal>}
  </div></div>;
}

function ChapterRows({ chapter, project, state, learners, openPack }: { chapter: StudyChapter; project: StudyProject; state: StudyState; learners: Learner[]; openPack: (p: StudyPack, learnerId?: string) => void }) {
  const reviewNames = { unsubmitted: '尚未互检', pending: '待互检', changes: '待订正', passed: '互检通过' };
  return <><tr className={s.chapterHeading}><th colSpan={2 + learners.length}>{chapter.title}</th></tr>{chapter.packs.filter(p => !p.archived).map(p => <tr key={p.id}><td><button className={s.packLink} onClick={() => openPack(p)}><small>{p.id.replace(/^ch1-/, '1-')} <span>{kindNames[p.kind]}{!p.base ? ' · 追加' : ''}</span></small><strong>{p.title}</strong></button></td><td className={s.timeCell}>{p.minutes || '自行安排'}</td>{learners.map(l => {
    const status = getPackStatus(state, project.id, p.id, l.id);
    const completed = isPackCompleted(state, project.id, p.id, l.id);
    const review = getReviewStatus(state, project.id, p.id, l.id);
    const label = completed ? '已完成' : status === 'unrecorded' ? '未登记' : '进行中';
    const minutes = getActiveSessions(state, project.id, l.id).filter(ss => ss.packId === p.id).reduce((n, ss) => n + ss.minutes, 0);
    return <td key={l.id}><button className={s.statusButton} data-status={completed ? 'submitted' : status === 'unrecorded' ? 'unrecorded' : 'studying'} aria-label={`${l.name} ${p.id} ${label}，${reviewNames[review]}`} onClick={() => openPack(p, l.id)}>{completed ? <Check size={12} /> : <span className={s.statusDot} />}{label}</button>{(completed || review !== 'unsubmitted') && <span className={s.cellReview} data-status={review}>{reviewNames[review]}</span>}{minutes > 0 && <span className={s.cellMinutes}>{duration(minutes)}</span>}</td>;
  })}</tr>)}</>;
}

function ProjectForm({ learners, actor, onSave }: { learners: Learner[]; actor: string; onSave: (p: StudyProject) => void }) {
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const data = new FormData(e.currentTarget); const id = `project-${crypto.randomUUID()}`; const titles = String(data.get('chapters')).split('\n').map(v => v.trim()).filter(Boolean).slice(0, 100); if (!titles.length || !String(data.get('title')).trim()) return; onSave({ id, ownerId: actor, memberIds: Array.from(new Set([actor, ...data.getAll('members').map(String)])), formerMemberIds: [], timeZone: 'Asia/Shanghai', revision: 0, title: String(data.get('title')).trim(), subtitle: String(data.get('subtitle')).trim(), description: '', kind: data.get('kind') as 'book' | 'project', color: '#6288ad', chapters: titles.map((title, i) => ({ id: `${id}-ch-${i + 1}`, title, packs: [{ id: `${i + 1}-01`, title: `${title} · 学习与练习`, kind: 'reading', reading: '', minutes: '', output: '留下你的笔记、练习作答或学习产物。', bookPractice: '', base: true, questions: [] }] })) }); };
  return <form className={s.form} onSubmit={submit}><p>一本书、一门课程，或一个想和朋友完成的项目。</p><label>名称<input name="title" required maxLength={120} placeholder="例如：路由交换技术基础" /></label><div className={s.formRow}><label>类型<select name="kind"><option value="book">书籍</option><option value="project">课程 / 学习项目</option></select></label><label>作者 / 简介<input name="subtitle" maxLength={160} placeholder="可选" /></label></div><label>章节或阶段 <small>每行一个，之后可继续添加</small><textarea name="chapters" required maxLength={40000} rows={5} placeholder={'网络基础\n交换技术\n路由技术'} /></label><fieldset className={s.memberChoices}><legend>一起学习的人</legend>{learners.map(l => <label key={l.id}><input type="checkbox" name="members" value={l.id} defaultChecked={l.id === actor} disabled={l.id === actor} /><Avatar learner={l} small />{l.name}{l.id === actor ? ' · 创建人' : ''}</label>)}</fieldset><button className={s.primaryButton}>加入学习书架 <Plus size={15} /></button></form>;
}
function SessionForm({ project, pack, learner, onSave }: { project: StudyProject; pack: StudyPack; learner: Learner; onSave: (date: string, minutes: number, note: string) => void }) {
  return <form className={s.form} onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); onSave(String(d.get('date')), Number(d.get('minutes')), String(d.get('note'))); }}><p><b>{learner.name}</b> · {project.title}<br />{pack.id} · {pack.title}</p><div className={s.formRow}><label>学习日期<input type="date" name="date" required defaultValue={dateKey(new Date(), project.timeZone)} max={dateKey(new Date(), project.timeZone)} /></label><label>本次新增分钟<input type="number" name="minutes" min={1} max={1440} step={1} required placeholder="例如 45" /></label></div><label>停在哪里 / 下次从哪继续<textarea name="note" rows={3} maxLength={4000} placeholder="可选，记下一句就好。" /></label><p className={s.formHint}>同一个包可以学习多次。只记录这一次新增的时间，系统会自动累计。</p><button className={s.primaryButton}>保存到日历 <Check size={15} /></button></form>;
}
function ReviewForm({ onSave }: { onSave: (outcome: 'passed' | 'changes', note: string) => void }) { return <form className={s.form} onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); onSave(d.get('outcome') as 'passed' | 'changes', String(d.get('note')).trim()); }}><p>请先看过伙伴的作答与产物，再记录真实的抽问或核查结果。</p><label>验收结果<select name="outcome"><option value="passed">通过，已经掌握</option><option value="changes">需要订正，再试一次</option></select></label><label>你检查了什么 / 订正建议<textarea name="note" required rows={4} maxLength={4000} placeholder="例如：能独立解释发送时延与传播时延，计算过程正确。" /></label><button className={s.primaryButton}>保存伙伴反馈 <CheckCheck size={15} /></button></form>; }
function AddPack({ project, onAdd }: { project: StudyProject; onAdd: (p: StudyProject) => boolean }) {
  const [open, setOpen] = useState(false);
  return <details className={s.addPack} open={open} onToggle={e => setOpen(e.currentTarget.open)}><summary><Plus size={14} /> 添加后续学习包 / 新章节</summary><form className={s.form} onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); const c = String(d.get('chapter')); const isNew = c === 'new'; const title = String(d.get('title')).trim(); if (!title) return; const newChapter = String(d.get('newChapter')).trim(); if (isNew && !newChapter) return; const id = `extra-${crypto.randomUUID()}`; const pack: StudyPack = { id, title, kind: d.get('kind') as StudyPack['kind'], reading: String(d.get('reading')), minutes: '', output: '记录学习产物与完成情况。', bookPractice: '', questions: [], base: false }; if (onAdd({ ...project, chapters: isNew ? [...project.chapters, { id: `chapter-${crypto.randomUUID()}`, title: newChapter, packs: [pack] }] : project.chapters.map(ch => ch.id === c ? { ...ch, packs: [...ch.packs, pack] } : ch) })) { setOpen(false); e.currentTarget.reset(); } }}><div className={s.formRow}><label>所属章节<select name="chapter">{project.chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}<option value="new">+ 新建章节</option></select></label><label>新章节名称<input name="newChapter" placeholder="仅新建章节时填写" maxLength={120} /></label></div><div className={s.formRow}><label>学习包名称<input required name="title" maxLength={120} placeholder="例如：第一章习题 · 第二批" /></label><label>类型<select name="kind">{Object.entries(kindNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label></div><label>阅读 / 练习范围<input name="reading" maxLength={1000} placeholder="填写真实页码或题号，可选" /></label><button className={s.secondaryButton}>添加学习包</button></form></details>;
}

function LoginPage({ store, waiting = false }: { store: ReturnType<typeof useStudyStore>; waiting?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return <div className={s.page} lang="zh-CN"><main className={s.loginCard}><div className={s.eyebrow}><BookOpen size={16} /> STUDY TOGETHER</div><h1>一起学<span className={s.titleDot}>.</span></h1><p>用自己的账号，继续和朋友的学习旅程。</p>{waiting ? <><p className={s.settingsMessage}>账号尚未加入学习空间，请联系空间负责人。</p><button className={s.secondaryButton} onClick={() => { void cloud.signOut().then(() => store.connect()).catch(e => setMessage(e.message)); }}>退出账号</button><button className={s.subtleButton} onClick={() => { void store.connect().catch(e => setMessage(e.message)); }}>重新连接</button></> : <form className={s.form} onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); setBusy(true); setMessage(''); void cloud.signInWithPassword(String(data.get('email')).trim(), String(data.get('password'))).then(() => store.connect()).catch(e => setMessage(e instanceof Error ? e.message : '暂时无法登录，请重试。')).finally(() => setBusy(false)); }}><label>邮箱<input name="email" type="email" autoComplete="username" required maxLength={254} /></label><label>密码<input name="password" type="password" autoComplete="current-password" required maxLength={200} /></label><button disabled={busy} className={s.primaryButton}>{busy ? '正在登录…' : '登录学习空间'}<ArrowRight size={15} /></button><small>账号由空间负责人提供。</small></form>}{(message || store.error) && <p className={s.settingsMessage} role="alert">{message || store.error}</p>}</main></div>;
}

function MembersPanel({ project, store, onSaved }: { project: StudyProject; store: ReturnType<typeof useStudyStore>; onSaved: () => void }) {
  const members = getProjectLearners(store.state, project.id);
  const canManage = project.ownerId === store.actor;
  const [selected, setSelected] = useState(members.map(l => l.id));
  const initialRevision = useRef(project.revision ?? 0);
  const [message, setMessage] = useState('');
  return <form className={s.form} onSubmit={e => { e.preventDefault(); if ((project.revision ?? 0) !== initialRevision.current) { setMessage('这本书已在其他地方更新。你的选择还在，请关闭后重新打开，核对最新成员再保存。'); return; } const previous = members.map(l => l.id); const next = { ...project, memberIds: selected, formerMemberIds: Array.from(new Set([...(project.formerMemberIds || []), ...previous.filter(id => !selected.includes(id))])).filter(id => !selected.includes(id)) }; if (store.save('project', next)) onSaved(); }}><p>{canManage ? '选择一起学习这本书的人。其他书籍的成员不受影响。' : '本书成员由项目创建人管理。'}</p><fieldset className={s.memberChoices}><legend>参与本书的账号</legend>{store.state.learners.map(l => <label key={l.id}><input type="checkbox" checked={selected.includes(l.id)} disabled={!canManage || l.id === project.ownerId} onChange={e => setSelected(e.target.checked ? [...selected, l.id] : selected.filter(id => id !== l.id))} /><Avatar learner={l} small />{l.name}{l.id === project.ownerId ? ' · 创建人' : ''}{project.formerMemberIds?.includes(l.id) ? ' · 曾参与' : ''}</label>)}</fieldset><p className={s.formHint}>加入后从自己的记录开始，可以补录以前的学习。移出成员会停止其访问，保留历史作答与时间；再次加入可继续原进度。</p>{!store.room && <p className={s.formHint}>可在空间设置里添加本机体验身份，再选择参与本书的人。</p>}{message && <p className={s.settingsMessage} role="alert">{message}</p>}{canManage && <button className={s.primaryButton}>保存本书成员<Check size={15} /></button>}</form>;
}

function downloadPending(store: ReturnType<typeof useStudyStore>) {
  const blob = new Blob([store.exportPending()], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = `studyshare-drafts-${dateKey(new Date())}.json`; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function ConflictPanel({ store }: { store: ReturnType<typeof useStudyStore> }) {
  return <>{store.conflicts.map(conflict => <div className={s.conflict} key={conflict.key} role="alert"><strong>有一份待同步内容需要处理</strong><p>{conflict.message}</p><div><button className={s.secondaryButton} onClick={() => { void store.resolveConflict(conflict.key, 'remote'); }}>采用云端，放弃本机修改</button><button className={s.secondaryButton} onClick={() => { if (window.confirm('将以当前本机内容覆盖这份记录的云端版本。确认已核对修改？')) void store.resolveConflict(conflict.key, 'local'); }}>保留本机版本并重新提交</button><button className={s.subtleButton} onClick={() => downloadPending(store)}>先导出待同步草稿</button></div></div>)}</>;
}

function SettingsPanel({ store, exportBackup, notify }: { store: ReturnType<typeof useStudyStore>; exportBackup: () => void; notify: (s: string) => void }) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const execute = async (action: () => Promise<void>) => { setBusy(true); setMessage(''); try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); } };
  return <div className={s.settings}>
    <div className={s.settingIntro}><Cloud size={22} /><div><h3>{store.room?.name || '本机学习空间'}</h3><p>{store.room ? `${store.user?.email || ''} · 每个人使用自己的账号，书籍成员独立管理。` : '记录保存在当前浏览器，可导出备份。'}</p></div></div>
    {store.room && <button className={s.secondaryButton} disabled={busy} onClick={() => void execute(async () => { await store.sync(); setMessage('已尝试同步，请查看空间状态。'); })}><RefreshCw size={13} />立即同步</button>}
    {store.user && <button className={s.subtleButton} disabled={busy} onClick={() => void execute(async () => { await cloud.signOut(); await store.connect(); })}><LogOut size={14} />{store.pending ? '退出账号（待同步内容留在本机）' : '退出账号'}</button>}
    {!store.room && <><form className={s.form} onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); try { store.replaceLocal({ ...store.state, learners: store.state.learners.map(l => ({ ...l, name: String(d.get(l.id)).trim() || l.name })) }); notify('称呼已保存'); } catch (e) { setMessage(String(e)); } }}><h3>本机体验身份</h3><label>当前记录人<select value={store.actor} onChange={e => store.selectActor(e.target.value)}>{store.state.learners.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label><div className={s.localPeople}>{store.state.learners.map(l => <label key={l.id}>称呼<input name={l.id} defaultValue={l.name} maxLength={24} required /></label>)}</div><p className={s.formHint}>身份切换仅用于本机体验，实际共享时每个人独立登录。</p><button className={s.secondaryButton}>保存称呼</button></form><form className={s.form} onSubmit={e => { e.preventDefault(); const form = e.currentTarget; const d = new FormData(form); const name = String(d.get('name')).trim(); if (!name) return; const colors = ['#007aff', '#9675ce', '#389c87', '#d78b53', '#bd6694', '#748cbe']; try { store.replaceLocal({ ...store.state, learners: [...store.state.learners, { id: `local-${crypto.randomUUID()}`, name, color: colors[store.state.learners.length % colors.length] }] }); form.reset(); setMessage('身份已添加。可在本书的“管理成员”中加入。'); } catch (e) { setMessage(String(e)); } }}><label>添加体验身份<input name="name" required maxLength={24} placeholder="学习伙伴的称呼" /></label><button className={s.secondaryButton}><Plus size={14} />添加成员</button></form></>}
    <div className={s.backupActions}>{store.pending > 0 && <button className={s.secondaryButton} onClick={() => downloadPending(store)}><Download size={14} />导出待同步草稿</button>}<button className={s.secondaryButton} onClick={exportBackup}><Download size={14} />导出 JSON 备份</button>{!store.room && <label className={s.fileLabel}><Upload size={14} />恢复本机备份<input type="file" accept="application/json,.json" onChange={e => { const file = e.target.files?.[0]; if (!file) return; void execute(async () => { if (file.size > 15_000_000) throw new Error('备份文件过大，请选择小于 15 MB 的文件。'); const data = migrateStudyState(JSON.parse(await file.text())); if (!data) throw new Error('备份格式不完整，现有记录未更改。'); if (window.confirm('恢复将替换本机记录。请确认已导出当前备份，是否继续？')) { store.replaceLocal(data); setMessage('备份已恢复。'); } }); e.target.value = ''; }} /></label>}</div>
    {message && <p className={s.settingsMessage} role="status">{message}</p>}
  </div>;
}
