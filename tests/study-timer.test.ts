import assert from 'node:assert/strict';
import test from 'node:test';
import { allocateTimerMinutes, freezeTimer, timerSeconds, type StudyTimer, type TimerDay } from '../src/lib/study-timer';

function timer(start: string): StudyTimer {
  return { id: 'A:timer-test', projectId: 'book', packId: 'chapter', chapterId: 'one', learnerId: 'A', startedAt: Date.parse(start), seconds: 0, date: '2026-09-21', segments: [] };
}
const totals = (days: TimerDay[]) => days.map(({ date, minutes }) => ({ date, minutes }));

test('cross-midnight study conserves minutes and preserves exact per-day source intervals', () => {
  const value = timer('2026-09-21T15:30:00Z');
  assert.deepEqual(allocateTimerMinutes(value, 'Asia/Shanghai', Date.parse('2026-09-21T16:30:00Z')), [
    { date: '2026-09-21', minutes: 30, segments: [{ start: '2026-09-21T15:30:00.000Z', end: '2026-09-21T16:00:00.000Z' }] },
    { date: '2026-09-22', minutes: 30, segments: [{ start: '2026-09-21T16:00:00.000Z', end: '2026-09-21T16:30:00.000Z' }] },
  ]);
});

test('pausing across midnight contributes no learning time or source interval to the gap', () => {
  const paused = freezeTimer(timer('2026-09-21T15:40:00Z'), Date.parse('2026-09-21T15:50:00Z'));
  assert.equal(timerSeconds(paused, Date.parse('2026-09-21T16:10:00Z')), 600);
  const resumed = { ...paused, startedAt: Date.parse('2026-09-21T16:10:00Z') };
  const saved = freezeTimer(resumed, Date.parse('2026-09-21T16:30:00Z'));
  assert.equal(timerSeconds(saved), 1800);
  assert.deepEqual(allocateTimerMinutes(saved), [
    { date: '2026-09-21', minutes: 10, segments: [{ start: '2026-09-21T15:40:00.000Z', end: '2026-09-21T15:50:00.000Z' }] },
    { date: '2026-09-22', minutes: 20, segments: [{ start: '2026-09-21T16:10:00.000Z', end: '2026-09-21T16:30:00.000Z' }] },
  ]);
});

test('legacy paused totals keep their date without inventing unavailable source intervals', () => {
  const legacy = { ...timer('2026-09-21T16:30:00Z'), seconds: 1800 };
  const parts = allocateTimerMinutes(legacy, 'Asia/Shanghai', Date.parse('2026-09-21T17:00:00Z'));
  assert.deepEqual(totals(parts), [{ date: '2026-09-21', minutes: 30 }, { date: '2026-09-22', minutes: 30 }]);
  assert.deepEqual(parts[0].segments, []);
  assert.deepEqual(parts[1].segments, [{ start: '2026-09-21T16:30:00.000Z', end: '2026-09-21T17:00:00.000Z' }]);
});

test('retrying a frozen timer does not include time spent waiting for storage', () => {
  const saved = freezeTimer(timer('2026-09-21T10:00:00Z'), Date.parse('2026-09-21T10:01:30Z'));
  const early = allocateTimerMinutes(saved, 'Asia/Shanghai', Date.parse('2026-09-21T10:02:00Z'));
  const late = allocateTimerMinutes(saved, 'Asia/Shanghai', Date.parse('2026-09-22T10:02:00Z'));
  assert.deepEqual(early, late);
  assert.deepEqual(totals(early), [{ date: '2026-09-21', minutes: 1.5 }]);
  assert.equal(freezeTimer(saved), saved);
});

test('seconds near midnight are retained instead of rounded away', () => {
  const value = timer('2026-09-21T15:59:45Z');
  const parts = allocateTimerMinutes(value, 'Asia/Shanghai', Date.parse('2026-09-21T16:00:15Z'));
  assert.deepEqual(totals(parts), [{ date: '2026-09-21', minutes: 0.25 }, { date: '2026-09-22', minutes: 0.25 }]);
});
