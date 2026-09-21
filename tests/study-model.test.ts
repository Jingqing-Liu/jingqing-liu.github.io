import assert from "node:assert/strict";
import test from "node:test";
import {
  createInitialState,
  dateKey,
  dateInTimeZone,
  getActiveSessions,
  getProjectLearners,
  getReviewStatus,
  isPackCompleted,
  isProjectMember,
  migrateStudyState,
  splitStudyInterval,
  getPackStatus,
  getProjectStats,
  getSharedCompleted,
  networkingStudyProject,
  progressKey,
  validateStudyState,
  type PeerReview,
  type Progress,
  type StudyState,
} from "../src/lib/study-model";

const projectId = "computer-networking";
const now = "2026-09-21T10:00:00.000Z";
const later = "2026-09-21T11:00:00.000Z";

function submission(learnerId = "A", packId = "1-01"): Progress {
  return { id: progressKey(projectId, packId, learnerId), projectId, packId, learnerId, status: "submitted", note: "已完成并订正", evidence: "我的学习笔记，第 1 页", updatedAt: now };
}

function review(targetLearnerId = "A", packId = "1-01"): PeerReview {
  const learnerId = targetLearnerId === "A" ? "B" : "A";
  return { id: `${learnerId}:${projectId}:${packId}:${targetLearnerId}`, projectId, packId, learnerId, targetLearnerId, outcome: "passed", note: "已抽问并核对", submissionUpdatedAt: now, updatedAt: later };
}

function answerPack(state: StudyState, learnerId = "A", packId = "1-01") {
  const pack = state.projects[0].chapters.flatMap(chapter => chapter.packs).find(item => item.id === packId)!;
  for (const question of pack.questions) {
    state.answers.push({ id: `${learnerId}:${projectId}:${packId}:${question.id}`, projectId, packId, questionId: question.id, learnerId, text: "已独立作答", updatedAt: now });
  }
}

function populatedState(): StudyState {
  const state = createInitialState();
  state.progress.push(submission());
  state.reviews.push(review());
  answerPack(state);
  state.sessions.push({ id: "A:session-1", projectId, packId: "1-01", chapterId: "1", learnerId: "A", date: "2026-09-21", minutes: 45, note: "完成前半包", createdAt: now });
  return state;
}

test("the full source plan is imported without invented progress or original-book questions", () => {
  const packs = networkingStudyProject.chapters.flatMap((chapter) => chapter.packs);
  assert.equal(networkingStudyProject.chapters.length, 8);
  assert.equal(packs.length, 60);
  assert.equal(packs.filter((pack) => pack.kind === "reading").length, 44);
  assert.equal(packs.filter((pack) => pack.kind === "review").length, 8);
  assert.equal(packs.filter((pack) => pack.kind === "practice").length, 8);
  assert.equal(packs.flatMap((pack) => pack.questions).length, 132);
  assert.ok(packs.every((pack) => pack.base));
  assert.ok(packs.filter((pack) => pack.kind === "reading").every((pack) => pack.questions.length === 3 && pack.questions.every((question) => question.hint)));
  assert.ok(packs.filter((pack) => pack.kind !== "reading").every((pack) => pack.questions.length === 0));
  assert.match(packs.find((pack) => pack.id === "8-P")!.bookPractice, /p\.452：TLS实验、IPsec实验/);
  assert.equal(packs[0].questions[0].prompt, "用具体例子分别说明端系统、通信链路、分组交换设备。");
  const state = createInitialState();
  assert.deepEqual([state.progress, state.answers, state.sessions, state.reviews], [[], [], [], []]);
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "unrecorded");
  assert.equal(getProjectStats(state, projectId, "A").percent, 0);
});

test("initial states are independent and all record keys start with the acting learner", () => {
  const first = createInitialState();
  first.projects[0].chapters[0].packs[0].title = "临时修改";
  assert.notEqual(createInitialState().projects[0].chapters[0].packs[0].title, "临时修改");
  assert.equal(progressKey(projectId, "1-01", "A"), "A:computer-networking:1-01");
});

test("completion requires a current submission, evidence, and a distinct actual peer", () => {
  const state = createInitialState();
  state.progress.push(submission());
  answerPack(state);
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "submitted");
  state.reviews.push(review());
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "passed");
  state.progress[0].evidence = "  ";
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "submitted");
  state.progress[0].evidence = "笔记";
  state.reviews[0].learnerId = "A";
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "submitted");
  state.reviews[0].learnerId = "unknown";
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "submitted");
  state.reviews[0].learnerId = "B";
  state.progress[0].status = "studying";
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "studying");
});

test("editing a submission invalidates its old review and the newest current review wins", () => {
  const state = populatedState();
  state.progress[0].updatedAt = later;
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "submitted");
  state.reviews[0].submissionUpdatedAt = later;
  state.reviews.push({ ...review(), id: "B:revision", submissionUpdatedAt: later, outcome: "changes", updatedAt: "2026-09-21T12:00:00Z" });
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "revision");
  state.reviews.push({ ...review(), id: "B:unrelated", targetLearnerId: "B", updatedAt: "2026-09-21T13:00:00Z" });
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "revision");
});

test("statistics keep the base denominator stable and sum only the learner's actual sessions", () => {
  const state = populatedState();
  const extraPack = { ...state.projects[0].chapters[0].packs[0], id: "1-X-01", base: false, questions: [] };
  state.projects[0].chapters[0].packs.push(extraPack);
  state.progress.push(submission("A", "1-X-01"), submission("A", "1-02"), submission("B"));
  answerPack(state, "A", "1-02");
  answerPack(state, "B");
  state.reviews.push(review("A", "1-X-01"));
  state.sessions.push({ ...state.sessions[0], id: "A:session-2", packId: "1-X-01", minutes: 30 });
  state.sessions.push({ ...state.sessions[0], id: "B:session-3", learnerId: "B", minutes: 90 });
  assert.deepEqual(getProjectStats(state, projectId, "A"), { completed: 2, verified: 1, submitted: 1, total: 60, minutes: 75, percent: 3 });
  assert.equal(getSharedCompleted(state, projectId), 1);
  state.reviews.push(review("B"));
  assert.equal(getSharedCompleted(state, projectId), 1);
  assert.deepEqual(getProjectStats(state, "missing", "A"), { completed: 0, verified: 0, submitted: 0, total: 0, minutes: 0, percent: 0 });
});

test("adding questions or changing answers invalidates approval until a fresh submission is reviewed", () => {
  const state = populatedState();
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "passed");
  state.projects[0].chapters[0].packs[0].questions.push({ id: "extra-q", prompt: "新增原书题" });
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "revision");
  state.answers.push({ id: `A:${projectId}:1-01:extra-q`, projectId, packId: "1-01", questionId: "extra-q", learnerId: "A", text: "补充作答", updatedAt: later });
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "revision");
  state.progress[0].updatedAt = later;
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "submitted");
  state.reviews[0].submissionUpdatedAt = later;
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "passed");
  state.answers[0].text = "  ";
  assert.equal(getPackStatus(state, projectId, "1-01", "A"), "revision");
});

test("calendar keys use the user's civil date around midnight", () => {
  const originalTimezone = process.env.TZ;
  process.env.TZ = "Asia/Shanghai";
  try {
    assert.equal(dateKey(new Date("2026-09-20T16:05:00Z")), "2026-09-21");
    assert.equal(dateKey(new Date("2026-12-31T16:05:00Z")), "2027-01-01");
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});

test("valid initial and populated backup states pass validation", () => {
  assert.ok(validateStudyState(createInitialState()));
  assert.ok(validateStudyState(populatedState()));
  assert.ok(validateStudyState(JSON.parse(JSON.stringify(populatedState()))));
});

test("backup validation rejects malformed nested content and dangling references", () => {
  const changes: ((state: StudyState) => void)[] = [
    (state) => { state.projects = []; },
    (state) => { state.projects[0].chapters = []; },
    (state) => { state.projects[0].chapters[0].packs = []; },
    (state) => { state.projects[0].chapters[0].packs[0].questions[0].prompt = ""; },
    (state) => { state.projects[0].chapters[0].packs.push(state.projects[0].chapters[0].packs[0]); },
    (state) => { state.learners.push(state.learners[0]); },
    (state) => { state.progress[0].learnerId = "unknown"; },
    (state) => { state.progress[0].packId = "unknown"; },
    (state) => { state.answers[0].questionId = "unknown"; },
    (state) => { state.sessions[0].chapterId = "2"; },
    (state) => { state.reviews[0].targetLearnerId = "B"; },
    (state) => { state.reviews[0].targetLearnerId = "unknown"; },
    (state) => { state.progress.push({ ...state.progress[0], id: "another-id" }); },
    (state) => { state.answers.push({ ...state.answers[0], id: "another-id" }); },
    (state) => { state.sessions.push({ ...state.sessions[0] }); },
    (state) => { state.progress[0].updatedAt = "not a date"; },
    (state) => { state.progress[0].updatedAt = "2026-02-30T10:00:00Z"; },
    (state) => { state.progress[0].id = "noncanonical"; },
    (state) => { state.answers[0].id = "noncanonical"; },
    (state) => { state.reviews[0].id = "noncanonical"; },
    (state) => { state.sessions[0].id = "B:wrong-owner"; },
  ];
  for (const change of changes) {
    const state = populatedState();
    change(state);
    assert.equal(validateStudyState(state), false, change.toString());
  }
  for (const bad of [null, [], {}, { ...createInitialState(), version: 2 }, { ...populatedState(), progress: [{ ...submission(), status: "passed" }] }, { ...populatedState(), reviews: [{ ...review(), outcome: "maybe" }] }]) {
    assert.equal(validateStudyState(bad), false);
  }
});

test("backup sessions reject impossible dates and non-finite, negative, or excessive durations", () => {
  for (const minutes of [0, -1, NaN, Infinity, 1501]) {
    const state = populatedState();
    state.sessions[0].minutes = minutes;
    assert.equal(validateStudyState(state), false);
  }
  for (const date of ["2026-02-30", "2026-13-01", "2026-09-1", "2026-09-21T00:00:00Z"]) {
    const state = populatedState();
    state.sessions[0].date = date;
    assert.equal(validateStudyState(state), false);
  }
  const state = populatedState();
  state.sessions[0].date = "2028-02-29";
  state.sessions[0].minutes = 1500;
  assert.ok(validateStudyState(state));
});

test('book enrollment scopes members independently, while former members keep historical attribution', () => {
  const state = populatedState();
  state.learners.push({ id: 'C', name: '第三位伙伴', color: '#3d9278' });
  state.projects[0].memberIds = ['A', 'C'];
  state.projects[0].formerMemberIds = ['B'];
  assert.deepEqual(getProjectLearners(state, projectId).map(learner => learner.id), ['A', 'C']);
  assert.deepEqual(getProjectLearners(state, projectId, true).map(learner => learner.id), ['A', 'B', 'C']);
  assert.equal(isProjectMember(state, projectId, 'B'), false);
  assert.equal(isProjectMember(state, projectId, 'C'), true);
  assert.equal(getReviewStatus(state, projectId, '1-01', 'A'), 'passed');
  assert.ok(validateStudyState(state));
});

test('legacy migration retains IDs and backfills only genuine submitted completion', () => {
  const state = populatedState();
  delete state.projects[0].memberIds;
  delete state.projects[0].ownerId;
  delete state.projects[0].formerMemberIds;
  state.progress.push({ ...submission('B'), status: 'studying' });
  const migrated = migrateStudyState(state);
  assert.deepEqual(migrated.projects[0].memberIds, ['A', 'B']);
  assert.equal(migrated.progress[0].id, state.progress[0].id);
  assert.equal(migrated.progress[0].completedAt, now);
  assert.equal(migrated.progress[0].completedDate, '2026-09-21');
  assert.equal(migrated.progress[1].completedAt, undefined);
  assert.equal(state.progress[0].completedAt, undefined);
  assert.equal(migrateStudyState({ broken: true }), null);
});

test('personal completion survives editing and peer revision; every current reviewer can block verification', () => {
  const state = migrateStudyState(populatedState());
  state.learners.push({ id: 'C', name: '第三位伙伴', color: '#3d9278' });
  state.projects[0].memberIds!.push('C');
  state.reviews.push({ ...review(), id: `C:${projectId}:1-01:A`, learnerId: 'C', outcome: 'changes' });
  assert.equal(getReviewStatus(state, projectId, '1-01', 'A'), 'changes');
  assert.equal(getProjectStats(state, projectId, 'A').completed, 1);
  assert.equal(getProjectStats(state, projectId, 'A').verified, 0);
  state.progress[0].status = 'studying';
  assert.equal(getReviewStatus(state, projectId, '1-01', 'A'), 'unsubmitted');
  assert.equal(isPackCompleted(state, projectId, '1-01', 'A'), true);
  assert.equal(state.progress[0].completedDate, '2026-09-21');
});

test('sessions can be corrected or voided without double-counting daily or project time', () => {
  const state = populatedState();
  state.sessions.push({ ...state.sessions[0], id: 'A:second-day', date: '2026-09-22', minutes: 30.5 });
  assert.equal(getProjectStats(state, projectId, 'A').minutes, 75.5);
  state.sessions[0] = { ...state.sessions[0], minutes: 20, updatedAt: later };
  assert.equal(getProjectStats(state, projectId, 'A').minutes, 50.5);
  state.sessions[0].voidedAt = later;
  assert.equal(getActiveSessions(state, projectId, 'A').length, 1);
  assert.equal(getProjectStats(state, projectId, 'A').minutes, 30.5);
  assert.ok(validateStudyState(state));
});

test('study intervals split at project midnight and preserve real DST duration', () => {
  assert.deepEqual(splitStudyInterval('2026-09-21T15:30:00Z', '2026-09-21T16:45:00Z'), [{ date: '2026-09-21', minutes: 30 }, { date: '2026-09-22', minutes: 45 }]);
  assert.deepEqual(splitStudyInterval('2026-11-01T04:00:00Z', '2026-11-02T05:00:00Z', 'America/New_York'), [{ date: '2026-11-01', minutes: 1500 }]);
  assert.deepEqual(splitStudyInterval('2026-03-08T05:00:00Z', '2026-03-09T04:00:00Z', 'America/New_York'), [{ date: '2026-03-08', minutes: 1380 }]);
  assert.deepEqual(splitStudyInterval(now, now), []);
  assert.equal(dateInTimeZone('2026-09-21T16:00:00Z'), '2026-09-22');
  assert.throws(() => splitStudyInterval(later, now));
  assert.throws(() => splitStudyInterval(now, later, 'not/a-zone'));
});

test('empty bookshelves are valid but malformed memberships, completion dates, and timezones are rejected', () => {
  const empty = createInitialState(); empty.projects = [];
  assert.ok(validateStudyState(empty));
  for (const change of [
    (state: StudyState) => { state.projects[0].memberIds = ['unknown']; },
    (state: StudyState) => { state.projects[0].memberIds = ['A', 'A']; },
    (state: StudyState) => { state.projects[0].formerMemberIds = ['A']; },
    (state: StudyState) => { state.projects[0].ownerId = 'B'; state.projects[0].memberIds = ['A']; },
    (state: StudyState) => { state.projects[0].timeZone = 'not/a-zone'; },
    (state: StudyState) => { state.progress[0].completedAt = now; },
  ]) {
    const state = populatedState(); change(state); assert.equal(validateStudyState(state), false);
  }
});

test('timer evidence accepts ordered real segments and rejects overlapping or invalid segments', () => {
  const state = populatedState();
  state.sessions[0].timerSegments = [{ start: '2026-09-21T10:00:00Z', end: '2026-09-21T10:10:00Z' }, { start: '2026-09-21T10:15:00Z', end: '2026-09-21T10:30:00Z' }];
  state.sessions[0].timeZone = 'Asia/Shanghai';
  state.sessions[0].timerAdjusted = true;
  assert.ok(validateStudyState(state));
  state.sessions[0].timerSegments[1].start = '2026-09-21T10:09:00Z';
  assert.equal(validateStudyState(state), false);
  state.sessions[0].timerSegments = [{ start: 'invalid', end: later }];
  assert.equal(validateStudyState(state), false);
});
