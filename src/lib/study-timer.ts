import { splitStudyInterval } from './study-model';

export type TimerSegment = { start: number; end: number };
export type StudyTimer = {
  id: string; projectId: string; packId: string; chapterId: string; learnerId: string;
  startedAt: number | null;
  /** Already-paused seconds from v1/v2 timers, whose interval history was unavailable. */
  seconds: number;
  date: string;
  segments: TimerSegment[];
};
export type TimerDay = { date: string; minutes: number; segments: { start: string; end: string }[] };

export function timerSeconds(timer: StudyTimer, now = Date.now()): number {
  return timer.seconds + timer.segments.reduce((sum, segment) => sum + (segment.end - segment.start) / 1000, 0) +
    (timer.startedAt === null ? 0 : Math.max(0, (now - timer.startedAt) / 1000));
}

export function freezeTimer(timer: StudyTimer, now = Date.now()): StudyTimer {
  return timer.startedAt === null ? timer : {
    ...timer, startedAt: null,
    segments: [...timer.segments, { start: timer.startedAt, end: Math.max(timer.startedAt, now) }],
  };
}

/** Aggregate only active intervals; pauses never contribute to any calendar day. */
export function allocateTimerMinutes(timer: StudyTimer, timeZone = 'Asia/Shanghai', now = Date.now()): TimerDay[] {
  const stopped = freezeTimer(timer, now);
  const byDate = new Map<string, TimerDay>();
  if (stopped.seconds > 0) byDate.set(stopped.date, { date: stopped.date, minutes: stopped.seconds / 60, segments: [] });
  for (const segment of stopped.segments) {
    let cursor = segment.start;
    for (const part of splitStudyInterval(new Date(segment.start), new Date(segment.end), timeZone)) {
      const end = Math.min(segment.end, cursor + Math.round(part.minutes * 60_000));
      if (part.minutes > 0) {
        const day = byDate.get(part.date) || { date: part.date, minutes: 0, segments: [] };
        day.minutes += part.minutes;
        day.segments.push({ start: new Date(cursor).toISOString(), end: new Date(end).toISOString() });
        byDate.set(part.date, day);
      }
      cursor = end;
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
