import assert from "node:assert/strict";
import test from "node:test";
import { getRoomOverview } from "../src/lib/study-room";
import { progressKey, type StudyProject, type StudySession, type StudyState } from "../src/lib/study-model";

const now = new Date("2026-09-21T00:30:00Z");

function project(id: string, memberIds: string[], packs = 2, timeZone = "Asia/Shanghai"): StudyProject {
  return {
    id, title: id, subtitle: "", kind: "book", description: "", color: "#007aff", memberIds, timeZone,
    chapters: [{ id: "chapter", title: "第一章", packs: Array.from({ length: packs }, (_, index) => ({
      id: `pack-${index}`, title: `学习包 ${index}`, kind: "reading", reading: "", minutes: "", output: "", bookPractice: "", questions: [], base: true,
    })) }],
  };
}

function stateWith(...projects: StudyProject[]): StudyState {
  return {
    version: 1,
    learners: ["A", "B", "C", "D"].map(id => ({ id, name: id, color: "#007aff" })),
    projects, progress: [], answers: [], sessions: [], reviews: [],
  };
}

function complete(state: StudyState, projectId: string, learnerId: string, packId = "pack-0") {
  state.progress.push({
    id: progressKey(projectId, packId, learnerId), projectId, packId, learnerId,
    status: "submitted", note: "", evidence: "已完成练习", updatedAt: "2026-09-19T10:00:00Z",
  });
}

function session(state: StudyState, projectId: string, learnerId: string, date: string, minutes: number, overrides: Partial<StudySession> = {}) {
  state.sessions.push({
    id: `${learnerId}:${state.sessions.length}`, projectId, packId: "pack-0", chapterId: "chapter",
    learnerId, date, minutes, note: "", createdAt: "2026-09-19T10:00:00Z", ...overrides,
  });
}

test("room overview never exposes a project the viewer left or unrelated learner records", () => {
  const state = stateWith(project("visible", ["A", "B"]), project("hidden", ["B", "C"]));
  state.projects[1].formerMemberIds = ["A"];
  complete(state, "hidden", "B");
  session(state, "hidden", "B", "2026-09-21", 600);
  const before = JSON.stringify(state);
  const room = getRoomOverview(state, "A", now);
  assert.deepEqual(room.projects.map(item => item.project.id), ["visible"]);
  assert.equal(room.learners.length, 4);
  assert.equal(room.learners[1].totals.minutes, 0);
  assert.equal(room.learners[1].totals.completed, 0);
  assert.equal(room.learners[2].projectCount, 0);
  assert.equal(room.learners[2].cells.visible, null);
  assert.equal(room.learners[1].cells.hidden, undefined);
  assert.ok(!JSON.stringify(room).includes('"hidden"'));
  assert.equal(JSON.stringify(state), before);
  const outsider = getRoomOverview(state, "unknown", now);
  assert.deepEqual(outsider.projects, []);
  assert.equal(outsider.totals.percent, null);
  assert.equal(outsider.totals.minutes, 0);
});

test("members join different books and room totals weight every current member's base packs", () => {
  const state = stateWith(project("short", ["A", "B"], 1), project("long", ["A", "C"], 9));
  complete(state, "short", "A");
  complete(state, "short", "B");
  complete(state, "long", "C");
  const room = getRoomOverview(state, "A", now);
  assert.deepEqual(room.totals, {
    total: 20, completed: 3, percent: 15, minutes: 0, weekMinutes: 0, todayMinutes: 0,
    studyDays: 0, weekStudyDays: 0, projectCount: 2, memberCount: 4, participatingMemberCount: 3,
  });
  assert.equal(room.learners[0].totals.percent, 10);
  assert.equal(room.learners[1].totals.percent, 100);
  assert.equal(room.learners[1].cells.long, null);
  assert.equal(room.learners[2].cells.short, null);
  assert.equal(room.projects[0].totals.percent, 100);
  assert.equal(room.projects[1].totals.percent, 6);
  assert.deepEqual([room.learners[0].completedProjects, room.learners[0].inProgressProjects, room.learners[0].notStartedProjects], [1, 0, 1]);
  assert.deepEqual([room.learners[2].completedProjects, room.learners[2].inProgressProjects, room.learners[2].notStartedProjects], [0, 1, 0]);
});

test("former members and even leftover records from nonmembers never affect visible totals", () => {
  const state = stateWith(project("book", ["A", "B"]));
  state.projects[0].formerMemberIds = ["C"];
  complete(state, "book", "C");
  complete(state, "book", "D");
  session(state, "book", "C", "2026-09-21", 120);
  session(state, "book", "D", "2026-09-21", 240);
  const room = getRoomOverview(state, "A", now);
  assert.equal(room.totals.total, 4);
  assert.equal(room.totals.completed, 0);
  assert.equal(room.totals.minutes, 0);
  assert.deepEqual(room.projects[0].members.map(item => item.learnerId), ["A", "B"]);
  assert.equal(room.learners[2].cells.book, null);
  assert.equal(room.learners[3].cells.book, null);
});

test("empty plans keep an unknown percentage, while time or an answer can start a book", () => {
  const empty = project("empty", ["A"], 0);
  const state = stateWith(empty, project("answer", ["A"]));
  session(state, "empty", "A", "2026-09-21", 30);
  state.answers.push({ id: "A:answer:q", projectId: "answer", packId: "pack-0", questionId: "q", learnerId: "A", text: "我的草稿", updatedAt: now.toISOString() });
  const room = getRoomOverview(state, "A", now);
  assert.equal(room.projects[0].totals.percent, null);
  assert.equal(room.learners[0].cells.empty?.percent, null);
  assert.equal(room.learners[0].cells.empty?.status, "in-progress");
  assert.equal(room.learners[0].cells.answer?.status, "in-progress");
  assert.equal(room.learners[0].completedProjects, 0);
  assert.equal(room.learners[0].inProgressProjects, 2);
  assert.equal(room.learners[3].totals.percent, null);
  assert.equal(room.learners[3].projectCount, 0);
  const noProjects = getRoomOverview(stateWith(), "A", now);
  assert.equal(noProjects.totals.percent, null);
  assert.equal(noProjects.totals.total, 0);
});

test("one pack studied on multiple days sums time once per session without implying completion", () => {
  const state = stateWith(project("book", ["A", "B"]), project("other", ["A"]));
  session(state, "book", "A", "2026-09-20", 25);
  session(state, "book", "A", "2026-09-21", 35);
  session(state, "book", "A", "2026-09-21", 99, { voidedAt: now.toISOString() });
  session(state, "other", "A", "2026-09-21", 20);
  session(state, "book", "B", "2026-09-21", 15);
  const room = getRoomOverview(state, "A", now);
  assert.equal(room.learners[0].totals.minutes, 80);
  assert.equal(room.learners[0].totals.weekMinutes, 55);
  assert.equal(room.learners[0].totals.studyDays, 2);
  assert.equal(room.learners[0].totals.weekStudyDays, 1);
  assert.equal(room.learners[0].totals.completed, 0);
  assert.equal(room.learners[0].cells.book?.status, "in-progress");
  assert.equal(room.totals.minutes, 95);
  assert.equal(room.totals.studyDays, 2);
  complete(state, "book", "A");
  assert.equal(getRoomOverview(state, "A", now).learners[0].totals.completed, 1);
});

test("completion shares the book page rules, excludes optional packs and preserves first completion", () => {
  const state = stateWith(project("book", ["A"], 3));
  const packs = state.projects[0].chapters[0].packs;
  packs[0].questions = [{ id: "question", prompt: "练习" }];
  packs[2].base = false;
  complete(state, "book", "A", "pack-0");
  complete(state, "book", "A", "pack-1");
  complete(state, "book", "A", "pack-2");
  assert.equal(getRoomOverview(state, "A", now).totals.completed, 1);
  state.answers.push({ id: "A:book:question", projectId: "book", packId: "pack-0", questionId: "question", learnerId: "A", text: "回答", updatedAt: "2026-09-19T09:00:00Z" });
  assert.equal(getRoomOverview(state, "A", now).totals.percent, 100);
  state.progress[0].completedAt = "2026-09-19T10:00:00Z";
  state.progress[0].status = "revision";
  state.answers[0].text = "";
  const room = getRoomOverview(state, "A", now);
  assert.equal(room.totals.completed, 2);
  assert.equal(room.learners[0].cells.book?.status, "completed");
});

test("week boundaries follow each project timezone and future dates do not count", () => {
  const state = stateWith(project("shanghai", ["A"]), project("los-angeles", ["A"], 2, "America/Los_Angeles"));
  // The same instant is Monday morning in Shanghai and Sunday afternoon in LA.
  session(state, "shanghai", "A", "2026-09-20", 10);
  session(state, "shanghai", "A", "2026-09-21", 20);
  session(state, "shanghai", "A", "2026-09-22", 100);
  session(state, "los-angeles", "A", "2026-09-13", 7);
  session(state, "los-angeles", "A", "2026-09-14", 30);
  session(state, "los-angeles", "A", "2026-09-20", 40);
  session(state, "los-angeles", "A", "2026-09-21", 200);
  const room = getRoomOverview(state, "A", now);
  assert.equal(room.projects[0].totals.weekMinutes, 20);
  assert.equal(room.projects[1].totals.weekMinutes, 70);
  assert.equal(room.projects[0].totals.todayMinutes, 20);
  assert.equal(room.projects[1].totals.todayMinutes, 40);
  assert.equal(room.totals.minutes, 107);
  assert.equal(room.totals.weekMinutes, 90);
  assert.equal(room.totals.todayMinutes, 60);
  assert.equal(room.totals.studyDays, 4);
  assert.equal(room.totals.weekStudyDays, 3);
});

test("civil week arithmetic handles year boundaries independently of host timezone", () => {
  const state = stateWith(project("book", ["A"], 1, "America/New_York"));
  session(state, "book", "A", "2025-12-28", 50);
  session(state, "book", "A", "2025-12-29", 10);
  session(state, "book", "A", "2025-12-31", 20);
  session(state, "book", "A", "2026-01-01", 100);
  const room = getRoomOverview(state, "A", new Date("2026-01-01T02:00:00Z"));
  assert.equal(room.totals.weekMinutes, 30);
  assert.equal(room.totals.todayMinutes, 20);
  assert.equal(room.totals.studyDays, 3);
  assert.equal(room.totals.minutes, 80);
});
