'use client';

import { BookOpen, Check, Play, RotateCcw } from 'lucide-react';
import { isPackCompleted, isProjectMember, getProjectLearners, getReadingCheckinStep, progressKey, type StudyState, type StudyProject, type StudyPack, type StudyChapter } from '../../lib/study-model';
import type { useStudyStore } from '../../lib/use-study-store';
import { Avatar } from './StudySpace';
import s from './StudySpace.module.css';

export default function StudyReadingDesk({ state, actor, project, pack, chapter, viewLearner, onViewLearner, onSelectPack, save, notify }: {
  state: StudyState; actor: string; project: StudyProject; pack: StudyPack; chapter: StudyChapter;
  viewLearner: string; onViewLearner: (id: string) => void; onSelectPack: (p: StudyPack) => void;
  save: ReturnType<typeof useStudyStore>['save']; notify: (message: string) => void;
}) {
  const members = getProjectLearners(state, project.id, true);
  const viewing = members.some(member => member.id === viewLearner) ? viewLearner : actor;
  const completed = isPackCompleted(state, project.id, pack.id, viewing);
  const progress = state.progress.find(item => item.id === progressKey(project.id, pack.id, viewing));
  const step = getReadingCheckinStep(progress);
  const canEdit = viewing === actor && isProjectMember(state, project.id, actor) && !pack.archived;
  function checkin() {
    if (!canEdit) return;
    if (save('progress', { id: progressKey(project.id, pack.id, actor), projectId: project.id,
      packId: pack.id, learnerId: actor, status: step.nextStatus, note: progress?.note || '',
      evidence: step.nextStatus === 'submitted' ? `已阅读 ${pack.title}` : progress?.evidence || '', updatedAt: new Date().toISOString() })) notify(step.notice);
  }
  return <div className={s.desk}>
    <section className={s.lessonIntro}><div className={s.cardEyebrow}><BookOpen size={14} />{chapter.unit}</div><h2>章节目录</h2><p>按 1.1、1.2 等二级章节打卡，三级小节仅作目录。</p></section>
    <div className={s.personTabs}>{members.map(member => <button key={member.id} onClick={() => onViewLearner(member.id)} className={viewing === member.id ? s.personActive : ''}><Avatar learner={member} small />{member.name}的打卡</button>)}</div>
    <section className={s.record}><div className={s.sectionTitle}><h2>{pack.title}</h2><span>{completed ? `已完成 · ${progress?.completedDate || ''}` : progress ? '阅读中' : '未开始'}</span></div>{canEdit && <button className={s.primaryButton} onClick={checkin} aria-pressed={completed}>{completed ? <RotateCcw size={14} /> : <>{progress ? <Check size={14} /> : <Play size={14} />}</>}{step.label}</button>}</section>
    {Array.from(new Set(project.chapters.map(item => item.unit))).map(unit => <section key={unit}>
      <div className={s.sectionTitle}><h2>{unit}</h2></div>
      {project.chapters.filter(item => item.unit === unit).map(item => <details key={item.id} open className={s.bookPractice}>
        <summary>{item.title}</summary>
        {item.packs.filter(p => !p.archived).map(p => <div key={p.id} className={s.record}>
          <button className={s.packLink} aria-current={p.id === pack.id ? 'true' : undefined} onClick={() => onSelectPack(p)}><strong>{p.title} {isPackCompleted(state, project.id, p.id, viewing) && <Check size={12} aria-label="已打卡" />}</strong></button>
          {!!p.outline?.length && <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: '#8e8e93', fontSize: 13, lineHeight: 1.8 }}>{p.outline.map(title => <li key={title}>{title}</li>)}</ul>}
        </div>)}
      </details>)}
    </section>)}
  </div>;
}
