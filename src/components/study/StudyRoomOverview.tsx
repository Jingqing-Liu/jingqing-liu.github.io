'use client';

import { useState, type CSSProperties } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, ChevronDown, Clock3, LayoutGrid, Plus, Search, Users } from 'lucide-react';
import { type Learner, type StudyState } from '../../lib/study-model';
import { getRoomOverview, type RoomMetrics } from '../../lib/study-room';
import StudyCalendar from './StudyCalendar';
import s from './StudyRoomOverview.module.css';

type Props = {
  state: StudyState;
  actor: string;
  onOpenProject: (id: string) => void;
  onAddProject: () => void;
  onAddTemplate?: () => void;
};
type Sort = 'weekMinutes' | 'minutes' | 'percent';
type Filter = 'all' | 'in-progress' | 'completed' | 'not-started';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'in-progress', label: '进行中' },
  { id: 'completed', label: '已完成' },
  { id: 'not-started', label: '未开始' },
];
const statusLabels = { 'in-progress': '进行中', completed: '已完成', 'not-started': '未开始' };

function duration(minutes: number) {
  const rounded = Math.round(minutes * 10) / 10;
  if (rounded < 60) return `${rounded} 分钟`;
  const remaining = Math.round(rounded % 60 * 10) / 10;
  return `${Math.floor(rounded / 60)} 小时${remaining ? ` ${remaining} 分` : ''}`;
}

function percentage(value: number | null) {
  return value === null ? '暂无计划' : `${Math.round(value)}%`;
}

function Avatar({ learner }: { learner: Learner }) {
  return <span className={s.avatar} style={{ '--person': learner.color } as CSSProperties} aria-hidden="true">{learner.name.slice(0, 1)}</span>;
}

function ProgressBar({ metrics, color, label }: { metrics: RoomMetrics; color?: string; label: string }) {
  if (metrics.percent === null) return <span className={s.emptyTrack} aria-hidden="true" />;
  return <span className={s.track} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={metrics.percent} aria-valuetext={`已完成 ${metrics.completed} / ${metrics.total} 个基础学习包`}><span style={{ width: `${metrics.percent}%`, backgroundColor: color }} /></span>;
}

export default function StudyRoomOverview({ state, actor, onOpenProject, onAddProject, onAddTemplate }: Props) {
  const [view, setView] = useState<'overview' | 'calendar'>('overview');
  const [sort, setSort] = useState<Sort>('weekMinutes');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const overview = getRoomOverview(state, actor);
  const search = query.trim().toLocaleLowerCase();
  const searchedProjects = overview.projects.filter(({ project }) => `${project.title} ${project.subtitle}`.toLocaleLowerCase().includes(search));
  const myProjects = searchedProjects.filter(project => filter === 'all' || project.members.find(member => member.learnerId === actor)?.status === filter);
  const learners = [...overview.learners].sort((a, b) => (b.totals[sort] ?? -1) - (a.totals[sort] ?? -1) || (a.learner.id === actor ? -1 : b.learner.id === actor ? 1 : a.learner.name.localeCompare(b.learner.name, 'zh-CN')));
  const activeMembers = new Map(overview.projects.map(project => [project.project.id, new Set(project.members.map(member => member.learnerId))]));
  const recordIsVisible = (record: { projectId: string; learnerId: string }) => activeMembers.get(record.projectId)?.has(record.learnerId) ?? false;
  const calendarState: StudyState = {
    ...state,
    projects: overview.projects.map(({ project }) => ({ ...project, formerMemberIds: [] })),
    progress: state.progress.filter(recordIsVisible),
    sessions: state.sessions.filter(recordIsVisible),
    answers: state.answers.filter(recordIsVisible),
    reviews: state.reviews.filter(review => recordIsVisible(review) && activeMembers.get(review.projectId)?.has(review.targetLearnerId)),
  };
  const totalTime = overview.totals.minutes >= 60
    ? { value: Number((overview.totals.minutes / 60).toFixed(1)), unit: '小时' }
    : { value: Number(overview.totals.minutes.toFixed(1)), unit: '分钟' };

  return <div className={s.root}>
    <header className={s.heading}>
      <div><span className={s.eyebrow}>OUR LEARNING SPACE</span><h2>空间总览<span>.</span></h2><p>把每一本书的积累，放在一起看。</p></div>
      <button type="button" className={s.addButton} onClick={onAddProject}><Plus size={15} />添加书籍 / 项目</button>
    </header>

    <div className={s.metrics} aria-label="学习空间汇总">
      <article className={s.metric}><span><BookOpen size={14} />书籍与项目</span><strong>{overview.totals.projectCount}<small>个</small></strong><p>你参与的全部学习计划</p></article>
      <article className={s.metric}><span><Users size={14} />空间成员</span><strong>{overview.totals.memberCount}<small>人</small></strong><p>{overview.totals.participatingMemberCount} 人参与可见书籍</p></article>
      <article className={s.metric}><span><Clock3 size={14} />累计专注</span><strong>{totalTime.value}<small>{totalTime.unit}</small></strong><p>本周一起学了 {duration(overview.totals.weekMinutes)}</p></article>
      <article className={`${s.metric} ${s.progressMetric}`}><span><Check size={14} />整体进度</span><strong>{overview.totals.percent === null ? '—' : Math.round(overview.totals.percent)}{overview.totals.percent !== null && <small>%</small>}</strong><p>{overview.totals.total ? `已完成 ${overview.totals.completed} / ${overview.totals.total} 份基础包` : '添加学习计划后开始积累'}</p><ProgressBar metrics={overview.totals} label="空间整体进度" /></article>
    </div>

    {!overview.projects.length ? <section className={s.emptySpace}>
      <div className={s.emptyBooks} aria-hidden="true"><span /><BookOpen size={29} strokeWidth={1.3} /><span /></div>
      <span className={s.eyebrow}>A NEW CHAPTER</span><h3>从第一本书开始，一起慢慢读完。</h3><p>添加一本书或一个学习项目，选择同行的朋友。<br />每个人的进度、专注时间和日历都会汇集在这里。</p>
      <div className={s.emptyActions}><button type="button" className={s.addButton} onClick={onAddProject}><Plus size={15} />添加第一本书</button>{onAddTemplate && <button type="button" className={s.secondaryButton} onClick={onAddTemplate}>使用《计算机网络》学习计划<ArrowRight size={14} /></button>}</div>
      <p className={s.emptyFootnote}>朋友已经建了书籍？让创建人在那本书的「管理成员」中添加你。</p>
    </section> : <>
      <div className={s.viewBar}>
        <div className={s.viewSwitch} role="group" aria-label="总览视图"><button type="button" aria-pressed={view === 'overview'} onClick={() => setView('overview')}><LayoutGrid size={14} />学习概览</button><button type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}><CalendarDays size={14} />全部学习日历</button></div>
        <span className={s.scope}>{overview.totals.projectCount} 个计划 · 共同的积累</span>
      </div>

      {view === 'calendar' ? <section className={s.calendar} aria-label="所有可见书籍的学习日历"><div className={s.sectionHeading}><div><h3>每天的投入，都有迹可循</h3><p>汇集可见书籍中当前参与成员的学习记录；日期以各项目时区为准。</p></div></div><StudyCalendar state={calendarState} actor={actor} /></section> : <>
        <section className={s.comparison} aria-labelledby="room-comparison-heading">
          <div className={s.sectionHeading}><div><span className={s.eyebrow}>LEARN TOGETHER</span><h3 id="room-comparison-heading">每个人，都在向前</h3><p>从整体投入，到每一本书的进度。</p></div><label className={s.sortLabel}>成员排序<span><select value={sort} onChange={event => setSort(event.target.value as Sort)}><option value="weekMinutes">本周学习时长</option><option value="minutes">累计学习时长</option><option value="percent">总学习进度</option></select><ChevronDown size={12} aria-hidden="true" /></span></label></div>
          <div className={s.comparisonToolbar}><label className={s.search}><Search size={14} aria-hidden="true" /><input type="search" aria-label="搜索书籍与项目" placeholder="搜索书籍或项目" value={query} onChange={event => setQuery(event.target.value)} /></label><span>{search ? `找到 ${searchedProjects.length} 个计划 · 总计不受搜索影响` : '左右滑动对比各书 · 点击进度进入'}</span></div>
          <div className={s.tableScroll} tabIndex={0} role="region" aria-label="成员与书籍进度对比表，可横向滚动">
            <table className={s.table}><caption className={s.srOnly}>所有空间成员的可见书籍学习进度。未参与显示横线。</caption><thead><tr><th scope="col" className={s.memberColumn}>学习成员</th><th scope="col" className={s.summaryColumn}>个人总进度<small>按本人参与的基础包加权</small></th><th scope="col" className={s.timeColumn}>学习投入<small>累计 / 本周</small></th>{searchedProjects.map(({ project }) => <th scope="col" key={project.id} className={s.projectColumn}><button type="button" onClick={() => onOpenProject(project.id)}><i style={{ backgroundColor: project.color }} /><span>{project.title}</span><ArrowUpRight size={12} /></button></th>)}</tr></thead><tbody>{learners.map(({ learner, totals, cells, projectCount }) => <tr key={learner.id} data-self={learner.id === actor}>
              <th scope="row" className={s.memberColumn}><div className={s.identity}><Avatar learner={learner} /><span><strong>{learner.name}{learner.id === actor && <em>我</em>}</strong><small>{projectCount ? `参与 ${projectCount} 个计划` : '尚未参与可见计划'}</small></span></div></th>
              <td className={s.summaryColumn}><div className={s.totalProgress}><strong>{percentage(totals.percent)}</strong><span>{totals.total ? `${totals.completed} / ${totals.total} 包` : '—'}</span></div><ProgressBar metrics={totals} color={learner.color} label={`${learner.name}的总学习进度`} /></td>
              <td className={s.timeColumn}><strong className={s.timeTotal}>{duration(totals.minutes)}</strong><span className={s.weekTime}>本周 {duration(totals.weekMinutes)}</span><small className={s.studyDays}>累计学习 {totals.studyDays} 天</small></td>
              {searchedProjects.map(({ project }) => {
                const cell = cells[project.id];
                return <td key={project.id} className={s.projectColumn}>{cell ? <button type="button" className={s.cellButton} onClick={() => onOpenProject(project.id)} aria-label={`查看${project.title}，${learner.name}${cell.percent === null ? '暂无计划' : `已完成 ${cell.completed} / ${cell.total} 个基础包`}`}><span className={s.cellNumbers}><strong>{percentage(cell.percent)}</strong><small>{cell.total ? `${cell.completed} / ${cell.total}` : '—'}</small></span><ProgressBar metrics={cell} color={learner.color} label={`${learner.name}的${project.title}进度`} /><span className={s.cellTime}>{duration(cell.minutes)}<ArrowUpRight size={10} aria-hidden="true" /></span></button> : <span className={s.notParticipating} aria-label="未参与">—<small>未参与</small></span>}</td>;
              })}
            </tr>)}</tbody></table>
          </div>
          <div className={s.comparisonFootnote}><span>只统计你可见的书籍及各书当前参与成员，未参与的书籍不计入个人进度。</span><details><summary>统计口径</summary><p>总进度 = 已完成基础学习包 ÷ 应完成基础学习包。每本书按基础包数量加权，空间进度同时按参与人数计算；追加包不改变基础进度。同一章节分多天学习、复习或补记的有效时长会累加，完成进度只计一次。学习天数按各项目当地日期去重。</p></details></div>
        </section>

        <section className={s.library} aria-labelledby="room-library-heading"><div className={s.sectionHeading}><div><span className={s.eyebrow}>ONE BOOK AT A TIME</span><h3 id="room-library-heading">我的学习书架</h3><p>选择一本书，继续上次的学习。</p></div><div className={s.filters} role="group" aria-label="按我的学习状态筛选书籍">{filters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div></div>
          <div className={s.bookGrid}>{myProjects.map(item => {
            const { project, totals, members } = item;
            const mine = members.find(member => member.learnerId === actor);
            return <article className={s.bookCard} key={project.id} style={{ '--book': project.color } as CSSProperties}>
              <div className={s.bookTop}><span className={s.bookIcon}><BookOpen size={20} strokeWidth={1.5} /></span><span className={s.bookType}>{project.kind === 'book' ? 'BOOK' : 'PROJECT'}</span>{mine && <span className={s.status} data-status={mine.status}>{statusLabels[mine.status]}</span>}</div>
              <button type="button" className={s.bookTitle} onClick={() => onOpenProject(project.id)}>{project.title}<ArrowUpRight size={16} /></button><p className={s.bookSubtitle}>{project.subtitle || `${project.chapters.length} 个章节 · 一起学习，一点点积累`}</p>
              <div className={s.bookProgress}><div><span>全体成员进度</span><strong>{percentage(totals.percent)}</strong></div><ProgressBar metrics={totals} color={project.color} label={`${project.title}的全体成员进度`} /><small>{totals.total ? `已完成 ${totals.completed} / ${totals.total} 份基础包` : '这本书还没有基础学习包'}</small></div>
              <div className={s.myProgress}><span>我的进度</span><strong>{mine ? percentage(mine.percent) : '未参与'}</strong>{mine && <small>{mine.total ? `${mine.completed} / ${mine.total} 包` : '暂无计划'}</small>}</div>
              <div className={s.bookPeople}><div className={s.avatarGroup}>{members.slice(0, 4).map(member => { const learner = state.learners.find(person => person.id === member.learnerId); return learner ? <Avatar key={learner.id} learner={learner} /> : null; })}{members.length > 4 && <span className={s.morePeople}>+{members.length - 4}</span>}</div><span>{members.length} 人同行</span><span><Clock3 size={11} />{duration(totals.minutes)}</span></div>
              <button type="button" className={s.openBook} onClick={() => onOpenProject(project.id)}>{mine?.status === 'completed' ? '回顾这本书' : mine?.status === 'in-progress' ? '继续学习' : '进入学习'}<ArrowRight size={15} /></button>
            </article>;
          })}</div>
          {!myProjects.length && <div className={s.noResults}><Search size={23} strokeWidth={1.5} /><h4>{search ? '没有找到符合条件的书籍' : '这个分类还没有书籍'}</h4><p>{search ? '试试其他关键词，或查看全部学习计划。' : '状态按照你自己的学习进度归类。'}</p><button type="button" className={s.secondaryButton} onClick={() => { setQuery(''); setFilter('all'); }}>查看全部书籍<ArrowRight size={13} /></button></div>}
        </section>
      </>}
    </>}
  </div>;
}
