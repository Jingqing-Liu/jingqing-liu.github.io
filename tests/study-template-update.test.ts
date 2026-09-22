import assert from 'node:assert/strict';
import test from 'node:test';
import { legacyNetworkingStudyProject, networkingStudyProject } from '../src/data/study/networking';
import { getNetworkingChapterOneUpdate } from '../src/lib/study-template-update';
import { getPackStatus, getProjectStats, progressKey, validateStudyState, type StudyProject, type StudyState } from '../src/lib/study-model';

function oldProject(id = 'computer-networking'): StudyProject {
  return {
    ...structuredClone(legacyNetworkingStudyProject), id,
    memberIds: ['A', 'B'], formerMemberIds: ['C'], ownerId: 'A', revision: 19, timeZone: 'Asia/Shanghai',
  };
}

function stateWith(project: StudyProject): StudyState {
  return {
    version: 1, projects: [project], learners: ['A', 'B', 'C'].map(id => ({ id, name: id, color: '#007aff' })),
    progress: [], answers: [], sessions: [], reviews: [],
  };
}

test('chapter replacement archives all former exercises and installs only the photographed template as active content', () => {
  const original = oldProject();
  const before = structuredClone(original);
  const result = getNetworkingChapterOneUpdate(original)!;
  const chapter = result.project.chapters[0];
  const active = chapter.packs.filter(pack => !pack.archived);
  const history = chapter.packs.filter(pack => pack.archived);
  assert.deepEqual(active, networkingStudyProject.chapters[0].packs);
  assert.ok(active.every(pack => pack.id.startsWith('ch1-')));
  assert.deepEqual(history, before.chapters[0].packs.map(pack => ({ ...pack, base: false, archived: true })));
  assert.equal(result.archivedPacks, before.chapters[0].packs.length);
  assert.equal(result.addedPacks, active.length);
  assert.equal(result.addedQuestions, active.flatMap(pack => pack.questions).length);
  assert.equal(result.retainedQuestions, history.flatMap(pack => pack.questions).length);
  assert.deepEqual(result.project.chapters.slice(1), before.chapters.slice(1));
  assert.equal(result.project.revision, 19);
  assert.deepEqual(result.project.memberIds, before.memberIds);
  assert.deepEqual(result.project.formerMemberIds, before.formerMemberIds);
  assert.equal(result.project.ownerId, 'A');
  assert.equal(result.project.timeZone, 'Asia/Shanghai');
  assert.equal(result.project.description, networkingStudyProject.description);
  assert.deepEqual(original, before, 'preparing an update must not mutate saved content');
  assert.ok(validateStudyState(stateWith(result.project)));
});

test('answers, submissions, sessions, and reviews still reference their unchanged historical packs', () => {
  const state = stateWith(oldProject());
  const project = state.projects[0];
  const pack = project.chapters[0].packs[0];
  const updatedAt = '2026-09-21T10:00:00Z';
  state.progress.push({
    id: progressKey(project.id, pack.id, 'A'), projectId: project.id, packId: pack.id,
    learnerId: 'A', status: 'submitted', note: '已完成的原始笔记', evidence: '笔记第 1 页',
    updatedAt, completedAt: updatedAt, completedDate: '2026-09-21',
  });
  state.answers.push(...pack.questions.map(question => ({
    id: `A:${project.id}:${pack.id}:${question.id}`, projectId: project.id, packId: pack.id,
    questionId: question.id, learnerId: 'A', text: `原有答案 ${question.id}`, updatedAt,
  })));
  state.sessions.push({
    id: 'A:existing-session', projectId: project.id, packId: pack.id, chapterId: '1', learnerId: 'A',
    date: '2026-09-21', minutes: 45, note: '原有时间', createdAt: updatedAt,
  });
  state.reviews.push({
    id: `B:${project.id}:${pack.id}:A`, projectId: project.id, packId: pack.id, learnerId: 'B',
    targetLearnerId: 'A', outcome: 'passed', note: '原有互评', submissionUpdatedAt: updatedAt, updatedAt,
  });
  assert.ok(validateStudyState(state));
  const before = structuredClone(state);
  const update = getNetworkingChapterOneUpdate(project)!;
  const next = { ...state, projects: [update.project] };
  assert.ok(validateStudyState(next), 'every saved reference must remain valid');
  for (const key of ['progress', 'answers', 'sessions', 'reviews'] as const) assert.deepEqual(next[key], before[key]);
  assert.equal(getPackStatus(next, project.id, pack.id, 'A'), 'passed');
  assert.equal(getProjectStats(next, project.id, 'A').minutes, 45);
  assert.equal(getProjectStats(next, project.id, 'A').completed, 0, 'old answers must not complete replacement exercises');
  const oldOtherPacks = before.projects[0].chapters.slice(1).flatMap(chapter => chapter.packs).filter(pack => pack.base).length;
  const newChapterPacks = networkingStudyProject.chapters[0].packs.filter(pack => pack.base).length;
  assert.equal(getProjectStats(next, project.id, 'A').total, oldOtherPacks + newChapterPacks);
  assert.deepEqual(state, before);
});

test('custom content and unknown extra fields survive in history without affecting other chapters', () => {
  const project = oldProject();
  project.title = '我们改过的书名';
  project.description = '我们自己的学习说明';
  project.subtitle = '自定义副标题';
  Object.assign(project, { futureProjectField: { keep: true } });
  const chapter = project.chapters[0];
  chapter.title = '自定义章名';
  Object.assign(chapter, { futureChapterField: ['keep'] });
  const first = chapter.packs[0];
  first.title = '自定义阅读安排';
  first.output = '保留这份产物要求';
  Object.assign(first, { futurePackField: { keep: 'value' } });
  first.questions[0].prompt = '我改过的旧问题';
  Object.assign(first.questions[0], { futureQuestionField: true });
  first.questions.push({ id: 'my-added-question', prompt: '自定义题目', hint: '自己的提示' });
  chapter.packs.push({ ...structuredClone(first), id: 'my-custom-pack', base: false });
  project.chapters[2].packs[0].title = '其他章的自定义内容';
  project.chapters.push({ id: 'custom-chapter', title: '额外章节', packs: [{ ...structuredClone(first), id: 'outside-custom-pack' }] });
  const before = structuredClone(project);
  const update = getNetworkingChapterOneUpdate(project)!;
  const oldPacks = update.project.chapters[0].packs.filter(pack => pack.archived);
  assert.deepEqual(oldPacks, before.chapters[0].packs.map(pack => ({ ...pack, base: false, archived: true })));
  assert.equal(update.project.title, before.title);
  assert.equal(update.project.subtitle, before.subtitle);
  assert.equal(update.project.description, before.description);
  assert.deepEqual(Object.assign({}, update.project, { chapters: undefined }), Object.assign({}, before, { chapters: undefined }));
  assert.deepEqual(Object.assign({}, update.project.chapters[0], { packs: undefined }), Object.assign({}, before.chapters[0], { packs: undefined }));
  assert.deepEqual(update.project.chapters.slice(1), before.chapters.slice(1));
  assert.ok(validateStudyState(stateWith(update.project)));
});

test('both legacy project ID variants update once and current templates need no update', () => {
  for (const id of ['computer-networking', 'networking-11111111-1111-4111-8111-111111111111']) {
    const update = getNetworkingChapterOneUpdate(oldProject(id));
    assert.ok(update);
    assert.equal(update.project.id, id);
    assert.equal(getNetworkingChapterOneUpdate(update.project), null);
  }
  assert.equal(getNetworkingChapterOneUpdate(structuredClone(networkingStudyProject)), null);
});

test('template names and isolated matching IDs never opt unrelated books into replacement', () => {
  assert.equal(getNetworkingChapterOneUpdate(oldProject('my-networking-book')), null);
  assert.equal(getNetworkingChapterOneUpdate(oldProject('networking-not-a-uuid')), null);
  const sparse = oldProject();
  sparse.chapters = [sparse.chapters[0]];
  assert.equal(getNetworkingChapterOneUpdate(sparse), null);
  const moved = oldProject();
  const movedPack = moved.chapters[1].packs.pop()!;
  moved.chapters[2].packs.push(movedPack);
  assert.equal(getNetworkingChapterOneUpdate(moved), null);
  const nonbook = oldProject();
  nonbook.kind = 'project';
  assert.equal(getNetworkingChapterOneUpdate(nonbook), null);
});

test('new pack ID collisions abort replacement without overwriting or moving custom content', () => {
  for (const chapterIndex of [0, 1]) {
    const project = oldProject();
    project.chapters[chapterIndex].packs.push({
      ...structuredClone(project.chapters[0].packs[0]),
      id: networkingStudyProject.chapters[0].packs[0].id,
      title: '恰好重名的自定义包',
    });
    const before = structuredClone(project);
    assert.equal(getNetworkingChapterOneUpdate(project), null);
    assert.deepEqual(project, before);
  }
});

test('new template content is cloned while historical question identities and chapter positions stay stable', () => {
  const project = oldProject();
  [project.chapters[0], project.chapters[1]] = [project.chapters[1], project.chapters[0]];
  const update = getNetworkingChapterOneUpdate(project)!;
  assert.equal(update.project.chapters[0], project.chapters[0]);
  const oldChapter = project.chapters[1];
  const updatedChapter = update.project.chapters[1];
  for (const oldPack of oldChapter.packs) {
    const history = updatedChapter.packs.find(pack => pack.id === oldPack.id)!;
    assert.equal(history.questions, oldPack.questions);
  }
  const active = updatedChapter.packs.find(pack => !pack.archived)!;
  const templateQuestion = structuredClone(networkingStudyProject.chapters[0].packs[0].questions[0]);
  active.questions[0].prompt = '修改本书的副本';
  assert.deepEqual(networkingStudyProject.chapters[0].packs[0].questions[0], templateQuestion);
});
