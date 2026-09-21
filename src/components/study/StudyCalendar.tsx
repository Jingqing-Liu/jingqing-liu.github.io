"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { dateInTimeZone, getActiveSessions, getProjectLearners, type StudyState } from "../../lib/study-model";
import styles from "./StudyCalendar.module.css";

type StudyCalendarProps = { state: StudyState; projectId?: string; actor?: string };
type Metric = "minutes" | "completed";
const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
const reviewDate = (date: string) => { const [year, month, day] = date.split("-").map(Number); return `${year} 年 ${month} 月 ${day} 日`; };
const minuteText = (minutes: number) => `${Number(minutes.toFixed(2))} 分钟`;
const heatLevel = (value: number, metric: Metric) => value <= 0 ? 0 : metric === "completed" ? Math.min(4, value) : value < 30 ? 1 : value < 60 ? 2 : value < 120 ? 3 : 4;
const heatColors = ["00", "20", "55", "aa", "ff"];

export default function StudyCalendar({ state, projectId, actor }: StudyCalendarProps) {
  const timeZone = state.projects.find(project => project.id === projectId)?.timeZone || "Asia/Shanghai";
  const today = dateInTimeZone(new Date(), timeZone);
  const [viewMonth, setViewMonth] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }));
  const [selectedDate, setSelectedDate] = useState(today);
  const [metric, setMetric] = useState<Metric>("minutes");
  const [showFormer, setShowFormer] = useState(false);
  const [selectedLearners, setSelectedLearners] = useState<string[] | null>(null);
  const monthPrefix = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}`;

  const data = useMemo(() => {
    const projects = state.projects.filter(project => !projectId || project.id === projectId);
    const participants = new Map(projects.map(project => [project.id, new Set(getProjectLearners(state, project.id, showFormer).map(learner => learner.id))]));
    const active = new Set(projects.flatMap(project => getProjectLearners(state, project.id).map(learner => learner.id)));
    const visible = new Set(Array.from(participants.values()).flatMap(ids => [...ids]));
    const learners = state.learners.filter(learner => visible.has(learner.id));
    const hasFormer = projects.some(project => getProjectLearners(state, project.id, true).some(learner => !getProjectLearners(state, project.id).some(member => member.id === learner.id)));
    const sessions = getActiveSessions(state).filter(session => participants.get(session.projectId)?.has(session.learnerId) && session.date.startsWith(`${monthPrefix}-`));
    const completions = state.progress.filter(progress => participants.get(progress.projectId)?.has(progress.learnerId) && progress.completedDate?.startsWith(`${monthPrefix}-`));
    const days = new Map<string, Map<string, { minutes: number; completed: number }>>();
    const totals = new Map(learners.map(learner => [learner.id, { minutes: 0, completed: 0, days: new Set<string>() }]));
    const day = (date: string, learnerId: string) => {
      if (!days.has(date)) days.set(date, new Map());
      const people = days.get(date)!;
      if (!people.has(learnerId)) people.set(learnerId, { minutes: 0, completed: 0 });
      return people.get(learnerId)!;
    };
    sessions.forEach(session => {
      day(session.date, session.learnerId).minutes += session.minutes;
      const total = totals.get(session.learnerId)!;
      total.minutes += session.minutes;
      total.days.add(session.date);
    });
    completions.forEach(progress => {
      day(progress.completedDate!, progress.learnerId).completed += 1;
      const total = totals.get(progress.learnerId)!;
      total.completed += 1;
      total.days.add(progress.completedDate!);
    });
    return { learners, active, hasFormer, sessions, completions, days, totals };
  }, [state, projectId, showFormer, monthPrefix]);

  const availableIds = data.learners.map(learner => learner.id);
  const defaults = [...(actor && availableIds.includes(actor) ? [actor] : []), ...availableIds.filter(id => id !== actor)].slice(0, 6);
  const stillAvailable = selectedLearners?.filter(id => availableIds.includes(id));
  const comparedIds = stillAvailable?.length ? stillAvailable : defaults;
  const comparedLearners = data.learners.filter(learner => comparedIds.includes(learner.id));
  const daySessions = data.sessions.filter(session => session.date === selectedDate && comparedIds.includes(session.learnerId)).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const dayCompletions = data.completions.filter(progress => progress.completedDate === selectedDate && comparedIds.includes(progress.learnerId));
  const firstWeekday = (new Date(viewMonth.year, viewMonth.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const calendarCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const thresholds = metric === "minutes" ? ["0", "1–29", "30–59", "60–119", "120+"] : ["0", "1", "2", "3", "4+"];
  const changeMonth = (offset: number) => {
    const next = new Date(viewMonth.year, viewMonth.month + offset, 1);
    const prefix = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    setViewMonth({ year: next.getFullYear(), month: next.getMonth() });
    setSelectedDate(today.startsWith(prefix) ? today : `${prefix}-01`);
  };
  const goToToday = () => { setViewMonth({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }); setSelectedDate(today); };

  return <section className={styles.root} aria-label="成员学习日历对比">
    <div className={styles.calendarPanel}>
      <div className={styles.calendarHeading}>
        <h3 aria-live="polite">{viewMonth.year} 年 <span>{viewMonth.month + 1} 月</span></h3>
        <div className={styles.monthControls}>
          <button className={styles.iconButton} type="button" onClick={() => changeMonth(-1)} aria-label="上个月"><ChevronLeft size={17} /></button>
          <button className={styles.todayButton} type="button" onClick={goToToday}>今天</button>
          <button className={styles.iconButton} type="button" onClick={() => changeMonth(1)} aria-label="下个月"><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className={styles.calendarOptions}>
        <div className={styles.metricSwitch} role="group" aria-label="日历比较指标">
          <button type="button" aria-pressed={metric === "minutes"} onClick={() => setMetric("minutes")}><Clock3 size={12} />学习分钟</button>
          <button type="button" aria-pressed={metric === "completed"} onClick={() => setMetric("completed")}><Check size={12} />首次完成包数</button>
        </div>
        <details className={styles.comparisonPicker}>
          <summary>对比成员 · {comparedIds.length} / 6</summary>
          <div>{data.learners.map(learner => {
            const checked = comparedIds.includes(learner.id);
            return <label key={learner.id}><input type="checkbox" checked={checked} disabled={checked ? comparedIds.length === 1 : comparedIds.length >= 6} onChange={event => setSelectedLearners(event.target.checked ? [...comparedIds, learner.id] : comparedIds.filter(id => id !== learner.id))} /><i style={{ backgroundColor: learner.color }} />{learner.name}{!data.active.has(learner.id) ? ' · 已退出' : ''}</label>;
          })}<p>一次最多对比 6 位成员。</p></div>
        </details>
        {data.hasFormer && <label className={styles.formerToggle}><input type="checkbox" checked={showFormer} onChange={event => setShowFormer(event.target.checked)} />显示已退出成员</label>}
      </div>
      <div className={styles.heatLegend} aria-label="固定热力档位">
        <span>{metric === "minutes" ? "分钟" : "学习包"}</span>
        {thresholds.map((label, level) => <span key={label}><i style={{ background: level ? `#6288ad${heatColors[level]}` : "#f0f0f5" }} />{label}</span>)}
        {metric === "completed" && <span><i className={styles.studiedLegend} />已学习，尚无首次完成</span>}
      </div>
      <p className={styles.calendarExplanation}>所有月份使用相同档位。{metric === "minutes" ? "按实际学习时长着色，不足 1 分钟也计入第一档。" : "每个学习包只在第一次完成时计数；补记时长、订正与互检不会重复增加。"}</p>
    </div>

    <div className={styles.memberCalendars}>
      {comparedLearners.map(learner => {
        const total = data.totals.get(learner.id)!;
        return <article className={styles.memberCalendar} key={learner.id} aria-label={`${learner.name}的学习日历`}>
          <div className={styles.learnerIdentity}><span className={styles.avatar} style={{ color: learner.color, backgroundColor: `${learner.color}12` }}>{learner.name.slice(0, 1)}</span><strong className={styles.learnerName}>{learner.name}</strong>{!data.active.has(learner.id) && <span className={styles.formerBadge}>已退出</span>}<span className={styles.dayCount}>{total.days.size} 天学习</span></div>
          <div className={styles.memberTotals}><span><strong>{Number(total.minutes.toFixed(2))}</strong> 分钟</span><span><strong>{total.completed}</strong> 包首次完成</span></div>
          <div className={styles.weekdays} aria-hidden="true">{weekdays.map(weekday => <span key={weekday}>{weekday}</span>)}</div>
          <div className={styles.calendarGrid} role="group" aria-label={`${learner.name} ${viewMonth.year} 年 ${viewMonth.month + 1} 月`}>
            {Array.from({ length: calendarCells }, (_, index) => {
              const number = index - firstWeekday + 1;
              if (number < 1 || number > daysInMonth) return <div key={`blank-${index}`} aria-hidden="true" />;
              const date = `${monthPrefix}-${String(number).padStart(2, "0")}`;
              const amounts = data.days.get(date)?.get(learner.id) || { minutes: 0, completed: 0 };
              const level = heatLevel(amounts[metric], metric);
              return <button key={date} type="button" className={`${styles.heatDay} ${date === selectedDate ? styles.selectedHeatDay : ""}`} style={{ backgroundColor: level ? `${learner.color}${heatColors[level]}` : "#f6f6f9", color: level >= 3 ? "white" : "#48484a" }} aria-label={`${learner.name}，${reviewDate(date)}${date === today ? "，今天" : ""}，${minuteText(amounts.minutes)}，首次完成 ${amounts.completed} 包`} aria-pressed={date === selectedDate} aria-current={date === today ? "date" : undefined} onClick={() => setSelectedDate(date)}><span>{number}</span>{date === today && <i className={styles.todayMark} aria-hidden="true" />}{metric === "completed" && amounts.minutes > 0 && amounts.completed === 0 && <i className={styles.studiedMark} style={{ backgroundColor: learner.color }} aria-hidden="true" />}</button>;
            })}
          </div>
        </article>;
      })}
    </div>
    {!data.learners.length && <div className={styles.emptyState}><CalendarDays size={24} /><p>这个范围还没有学习成员</p><span>加入一个学习项目后，即可在这里比较每日投入。</span></div>}

    <div className={styles.detailPanel}>
      <div className={styles.detailHeading}><div><h3>{Number(selectedDate.slice(5, 7))} 月 {Number(selectedDate.slice(8, 10))} 日<span>{selectedDate === today ? "今天" : "学习记录"}</span></h3><p>对比中的成员 · {daySessions.length} 段学习 · {dayCompletions.length} 包首次完成</p></div><div className={styles.selectedTotals}>{comparedLearners.map(learner => { const values = data.days.get(selectedDate)?.get(learner.id); return <span key={learner.id}><i style={{ backgroundColor: learner.color }} />{learner.name}<strong>{metric === "minutes" ? minuteText(values?.minutes || 0) : `${values?.completed || 0} 包`}</strong></span>; })}</div></div>
      {(daySessions.length > 0 || dayCompletions.length > 0) ? <ul className={styles.sessions}>
        {dayCompletions.map(progress => {
          const learner = data.learners.find(person => person.id === progress.learnerId);
          const project = state.projects.find(item => item.id === progress.projectId);
          const pack = project?.chapters.flatMap(item => item.packs).find(item => item.id === progress.packId);
          return <li className={styles.session} key={`completed-${progress.id}`}><span className={styles.sessionDot} style={{ backgroundColor: learner?.color }} /><div className={styles.sessionContent}><div className={styles.sessionTitle}><span>{learner?.name}</span><strong>{pack?.title || "学习包"}</strong></div><p className={styles.sessionPath}>{project?.title}</p></div><span className={styles.sessionDuration}><Check size={13} />首次完成</span></li>;
        })}
        {daySessions.map(session => {
          const learner = data.learners.find(person => person.id === session.learnerId);
          const project = state.projects.find(item => item.id === session.projectId);
          const chapter = project?.chapters.find(item => item.id === session.chapterId);
          const pack = chapter?.packs.find(item => item.id === session.packId);
          return <li className={styles.session} key={session.id}><span className={styles.sessionDot} style={{ backgroundColor: learner?.color || "#8e8e93" }} /><div className={styles.sessionContent}><div className={styles.sessionTitle}><span>{learner?.name || "学习者"}</span><strong>{pack?.title || "学习记录"}</strong></div><p className={styles.sessionPath}>{[project?.title, chapter?.title].filter(Boolean).join(" / ")}</p>{session.note && <p className={styles.sessionNote}>{session.note}</p>}</div><span className={styles.sessionDuration}><Clock3 size={13} />{minuteText(session.minutes)}</span></li>;
        })}
      </ul> : <div className={styles.emptyState}><div className={styles.emptyIcon}><Clock3 size={23} strokeWidth={1.4} /></div><p>给这一天留一点学习的时间</p><span>记录专注时长或完成学习包后，就会出现在这里。</span></div>}
      <p className={styles.calendarExplanation}>{projectId ? `项目时区：${timeZone}` : "各项目按自己的时区记录日期。全局「今天」以 Asia/Shanghai 为准。"}</p>
    </div>
  </section>;
}
