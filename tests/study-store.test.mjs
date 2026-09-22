import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { registerHooks, stripTypeScriptTypes } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { createInitialState } = await import('../src/lib/study-model.ts');
const dataModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
const hooksModule = dataModule(['useState', 'useRef', 'useCallback', 'useEffect'].map(name => `export const ${name} = (...args) => globalThis.__studyStoreTest.hooks.${name}(...args);`).join('\n'));
const cloudModule = dataModule(`export const cloudConfigured = true;\n${['getCloudSession', 'getMyRoom', 'listRecords', 'saveRecord', 'subscribeAuth'].map(name => `export const ${name} = (...args) => globalThis.__studyStoreTest.cloud.${name}(...args);`).join('\n')}`);
const source = stripTypeScriptTypes(readFileSync(new URL('../src/lib/use-study-store.ts', import.meta.url), 'utf8'))
  .replace("from 'react'", `from '${hooksModule}'`)
  .replace("from './study-model'", `from '${new URL('../src/lib/study-model.ts', import.meta.url).href}'`)
  .replace("from './study-cloud'", `from '${cloudModule}'`);
const { useStudyStore } = await import(dataModule(source));

class HookHarness {
  slots = [];
  index = 0;
  effects = [];
  useState(initial) {
    const index = this.index++;
    if (!(index in this.slots)) this.slots[index] = typeof initial === 'function' ? initial() : initial;
    return [this.slots[index], value => { this.slots[index] = typeof value === 'function' ? value(this.slots[index]) : value; }];
  }
  useRef(initial) {
    const index = this.index++;
    if (!(index in this.slots)) this.slots[index] = { current: initial };
    return this.slots[index];
  }
  same(a, b) { return a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i])); }
  useCallback(callback, deps) {
    const index = this.index++;
    const previous = this.slots[index];
    if (!previous || !this.same(previous.deps, deps)) this.slots[index] = { deps, callback };
    return this.slots[index].callback;
  }
  useEffect(callback, deps) {
    const index = this.index++;
    const previous = this.slots[index];
    if (!previous || !this.same(previous.deps, deps)) {
      this.effects.push(() => { previous?.cleanup?.(); this.slots[index] = { deps, cleanup: callback() }; });
    }
  }
  render() {
    this.index = 0;
    // This harness supplies the React hooks; it is not a React class component.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    this.store = useStudyStore();
    this.effects.splice(0).forEach(effect => effect());
    return this.store;
  }
  unmount() { this.slots.forEach(slot => slot?.cleanup?.()); }
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
const localKey = 'studyshare.local.v1';
const projectId = 'computer-networking';
const roomFor = id => ({ id: `room-${id}`, name: '学习空间', inviteCode: 'CODE', members: [{ id, name: id, color: '#007aff' }] });
const progressFor = id => ({ id: `${id}:${projectId}:ch1-01`, projectId, packId: 'ch1-01', learnerId: id, status: 'studying', note: '第一版', evidence: '', updatedAt: '2026-09-21T10:00:00Z' });
const cloudProject = id => ({ id: projectId, room_id: `room-${id}`, kind: 'project', owner_id: id, revision: 1, updated_at: '2026-09-21T10:00:00Z', payload: { ...createInitialState().projects[0], ownerId: id, memberIds: [id], formerMemberIds: [], revision: 1 } });

async function setup(initial = {}, locks) {
  const storage = new Map(Object.entries(initial));
  // Node 26 also exposes Web Locks; ordinary unit cases intentionally exercise fallback.
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: locks ? { locks } : {} });
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  globalThis.window = { setTimeout: () => 0, setInterval: () => 0, addEventListener() {}, removeEventListener() {} };
  const cloud = {
    session: null, room: null, records: [],
    async getCloudSession() { return this.session; },
    async getMyRoom() { return this.room; },
    async listRecords() { return [...this.records]; },
    async saveRecord(roomId, kind, id, payload, expectedRevision) {
      const previous = this.records.find(item => item.id === id && item.kind === kind);
      if ((previous?.revision ?? 0) !== expectedRevision) throw Object.assign(new Error('conflict'), { code: 'STUDY_CONFLICT' });
      const record = { id, room_id: roomId, kind, owner_id: payload.learnerId ?? payload.ownerId, payload, revision: (previous?.revision ?? 0) + 1, updated_at: payload.updatedAt };
      this.records = [...this.records.filter(item => !(item.id === id && item.kind === kind)), record];
      return record;
    },
    subscribeAuth() { return () => {}; },
  };
  const hooks = new HookHarness();
  globalThis.__studyStoreTest = { hooks, cloud };
  const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); return hooks.render(); };
  hooks.render();
  await settle();
  const connect = async id => {
    cloud.session = { user: { id } }; cloud.room = roomFor(id);
    cloud.records = [cloudProject(id)];
    await hooks.store.connect(); return hooks.render();
  };
  return { hooks, cloud, storage, settle, connect };
}

test('corrupt local content cannot be overwritten by a save and is archived on explicit recovery', async () => {
  const h = await setup({ [localKey]: '{broken json' });
  assert.equal(h.hooks.store.save('progress', progressFor('A')), false);
  assert.equal(h.storage.get(localKey), '{broken json');
  h.hooks.store.replaceLocal(createInitialState());
  h.hooks.render();
  assert.ok([...h.storage.entries()].some(([key, value]) => key.startsWith(`${localKey}.recovery.`) && value === '{broken json'));
  assert.equal(h.hooks.store.save('progress', progressFor('A')), true);
  h.hooks.unmount();
});

test('a restored cloud backup normalizes and persists an obsolete local actor ID', async () => {
  const state = createInitialState();
  state.learners = [{ id: 'cloud-user', name: '我', color: '#007aff' }];
  state.projects[0].memberIds = ['cloud-user']; state.projects[0].ownerId = 'cloud-user';
  const h = await setup({ [localKey]: JSON.stringify(state), 'studyshare.actor': 'A' });
  assert.equal(h.hooks.store.actor, 'cloud-user');
  assert.equal(h.storage.get('studyshare.actor'), 'cloud-user');
  h.hooks.unmount();
});

test('an older overlapping account connection cannot replace the newer room', async () => {
  const h = await setup();
  const firstRoom = deferred();
  h.cloud.session = { user: { id: 'user-one' } };
  h.cloud.getMyRoom = () => firstRoom.promise;
  const first = h.hooks.store.connect();
  await h.settle();
  h.cloud.session = { user: { id: 'user-two' } };
  h.cloud.getMyRoom = async () => roomFor('user-two');
  await h.hooks.store.connect();
  firstRoom.resolve(roomFor('user-one'));
  await first;
  const store = h.hooks.render();
  assert.equal(store.room.id, 'room-user-two');
  assert.equal(store.actor, 'user-two');
  assert.deepEqual(store.state.learners.map(learner => learner.id), ['user-two']);
  h.hooks.unmount();
});

test('failed cloud writes remain queued and a later retry clears them once', async () => {
  const h = await setup();
  await h.connect('user-one');
  assert.equal(h.hooks.store.save('progress', progressFor('user-one')), true);
  const saveRecord = h.cloud.saveRecord.bind(h.cloud);
  h.cloud.saveRecord = async () => { throw new Error('offline'); };
  await h.hooks.store.sync();
  let store = h.hooks.render();
  assert.equal(store.pending, 1);
  assert.equal(Object.keys(JSON.parse(h.storage.get('studyshare.outbox.room-user-one.user-one'))).length, 1);
  h.cloud.saveRecord = saveRecord;
  await store.sync();
  store = h.hooks.render();
  assert.equal(store.pending, 0);
  assert.equal(h.cloud.records.filter(record => record.kind === 'progress').length, 1);
  assert.equal(store.state.progress[0].note, '第一版');
  h.hooks.unmount();
});

test('editing while an older cloud write is in flight preserves the newer queued edit', async () => {
  const h = await setup();
  await h.connect('user-one');
  const old = progressFor('user-one');
  h.hooks.store.save('progress', old);
  const acknowledgement = deferred();
  const entered = deferred();
  const saveRecord = h.cloud.saveRecord.bind(h.cloud);
  h.cloud.saveRecord = async (...args) => { entered.resolve(); await acknowledgement.promise; return saveRecord(...args); };
  const sync = h.hooks.store.sync();
  await entered.promise;
  h.hooks.store.save('progress', { ...old, note: '第二版', updatedAt: '2026-09-21T11:00:00Z' });
  acknowledgement.resolve();
  await sync;
  let store = h.hooks.render();
  assert.equal(store.pending, 1);
  assert.equal(store.state.progress[0].note, '第二版');
  h.cloud.saveRecord = saveRecord;
  await store.sync();
  store = h.hooks.render();
  assert.equal(store.pending, 0);
  assert.equal(store.state.progress[0].note, '第二版');
  h.hooks.unmount();
});

test('a sync completing after sign-out cannot reapply the previous room state', async () => {
  const h = await setup();
  await h.connect('user-one');
  const oldRoom = deferred();
  h.cloud.getMyRoom = () => oldRoom.promise;
  const sync = h.hooks.store.sync();
  await h.settle();
  h.cloud.session = null;
  await h.hooks.store.connect();
  oldRoom.resolve(roomFor('user-one'));
  await sync;
  const store = h.hooks.render();
  assert.equal(store.room, null);
  assert.equal(store.user, null);
  assert.equal(store.actor, 'A');
  assert.equal(store.state.progress.length, 0);
  h.hooks.unmount();
});

test('switching to a logged-in account without a room restores local state and clears the active outbox', async () => {
  const h = await setup();
  await h.connect('user-one');
  h.hooks.store.save('progress', progressFor('user-one'));
  h.cloud.session = { user: { id: 'new-account' } }; h.cloud.room = null;
  await h.hooks.store.connect();
  const store = h.hooks.render();
  assert.equal(store.user.id, 'new-account');
  assert.equal(store.room, null);
  assert.equal(store.pending, 0);
  assert.equal(store.actor, 'A');
  assert.equal(store.state.progress.length, 0);
  assert.equal(Object.keys(JSON.parse(h.storage.get('studyshare.outbox.room-user-one.user-one'))).length, 1);
  h.hooks.unmount();
});

test('a corrupt cloud outbox remains intact and prevents accidentally replacing pending work', async () => {
  const key = 'studyshare.outbox.room-user-one.user-one';
  const h = await setup({ [key]: '{broken pending data' });
  await assert.rejects(h.connect('user-one'));
  assert.equal(h.hooks.store.save('progress', progressFor('A')), false);
  assert.equal(h.storage.get(key), '{broken pending data');
  h.hooks.unmount();
});

test('failure to persist a cloud acknowledgement keeps the operation safely retryable', async () => {
  const h = await setup();
  await h.connect('user-one');
  h.hooks.store.save('progress', progressFor('user-one'));
  const persist = localStorage.setItem;
  localStorage.setItem = () => { throw new Error('storage unavailable'); };
  await h.hooks.store.sync();
  let store = h.hooks.render();
  assert.equal(store.pending, 1);
  assert.equal(h.cloud.records.filter(record => record.kind === 'progress').length, 1);
  localStorage.setItem = persist;
  await store.sync();
  store = h.hooks.render();
  assert.equal(store.pending, 0);
  assert.equal(h.cloud.records.filter(record => record.kind === 'progress').length, 1);
  h.hooks.unmount();
});

test('local learner creation does not enroll them in every book, and only the owner can change membership', async () => {
  const h = await setup();
  const learner = h.hooks.store.addLearner('第三位伙伴');
  let store = h.hooks.render();
  assert.equal(store.state.learners.length, 3);
  assert.equal(store.state.projects[0].memberIds.includes(learner.id), false);
  store.selectActor(learner.id); store = h.hooks.render();
  assert.equal(store.save('progress', progressFor(learner.id)), false);
  store.selectActor('B'); store = h.hooks.render();
  assert.equal(store.save('project', { ...store.state.projects[0], memberIds: ['A', 'B', learner.id] }), false);
  store.selectActor('A'); store = h.hooks.render();
  assert.equal(store.save('project', { ...store.state.projects[0], memberIds: ['A', learner.id] }), true);
  store = h.hooks.render();
  assert.deepEqual(store.state.projects[0].formerMemberIds, ['B']);
  store.selectActor(learner.id); store = h.hooks.render();
  assert.equal(store.save('progress', progressFor(learner.id)), true);
  assert.equal(store.save('progress', progressFor('A')), false);
  h.hooks.unmount();
});

test('first personal completion date survives revision, editing, and later resubmission', async () => {
  const h = await setup();
  let store = h.hooks.store;
  for (const question of store.state.projects[0].chapters[0].packs[0].questions) {
    assert.equal(store.save('answer', { id: `A:${projectId}:ch1-01:${question.id}`, learnerId: 'A', projectId, packId: 'ch1-01', questionId: question.id, text: '已独立作答', updatedAt: '2026-09-21T15:00:00Z' }), true);
  }
  const submitted = { ...progressFor('A'), status: 'submitted', evidence: '上方作答', updatedAt: '2026-09-21T15:30:00Z' };
  assert.equal(store.save('progress', submitted), true);
  store = h.hooks.render();
  assert.equal(store.state.progress[0].completedDate, '2026-09-21');
  assert.equal(store.save('progress', { ...submitted, status: 'studying', updatedAt: '2026-09-22T03:00:00Z' }), true);
  assert.equal(store.save('progress', { ...submitted, updatedAt: '2026-09-22T04:00:00Z' }), true);
  store = h.hooks.render();
  assert.equal(store.state.progress[0].completedAt, '2026-09-21T15:30:00Z');
  assert.equal(store.state.progress[0].completedDate, '2026-09-21');
  h.hooks.unmount();
});

test('session correction replaces its ID and a tombstone cannot be resurrected by an old edit', async () => {
  const h = await setup();
  const session = { id: 'A:session', learnerId: 'A', projectId, packId: 'ch1-01', chapterId: '1', date: '2026-09-21', minutes: 30.5, note: '', createdAt: '2026-09-21T10:00:00Z' };
  assert.equal(h.hooks.store.save('session', session), true);
  assert.equal(h.hooks.store.save('session', { ...session, minutes: 20 }), true);
  let store = h.hooks.render();
  assert.equal(store.state.sessions.length, 1);
  assert.equal(store.state.sessions[0].minutes, 20);
  assert.equal(store.save('session', { ...store.state.sessions[0], voidedAt: '2026-09-21T12:00:00Z' }), true);
  assert.equal(store.save('session', session), false);
  h.hooks.unmount();
});

test('CAS conflict preserves local work and remote data until the user explicitly chooses a version', async () => {
  const h = await setup();
  await h.connect('user-one');
  const item = progressFor('user-one');
  h.hooks.store.save('progress', item);
  await h.hooks.store.sync();
  let store = h.hooks.render();
  store.save('progress', { ...item, note: '本机修改', updatedAt: '2026-09-21T11:00:00Z' });
  const remote = h.cloud.records.find(record => record.kind === 'progress');
  remote.payload = { ...remote.payload, note: '另一台设备修改', updatedAt: '2026-09-21T12:00:00Z' }; remote.revision = 2;
  await store.sync(); store = h.hooks.render();
  assert.equal(store.conflicts.length, 1);
  assert.equal(store.pending, 1);
  assert.equal(h.cloud.records.find(record => record.kind === 'progress').payload.note, '另一台设备修改');
  assert.equal(store.state.progress[0].note, '本机修改');
  assert.equal(await store.resolveConflict(store.conflicts[0].key, 'local'), true);
  store = h.hooks.render();
  assert.equal(store.pending, 0);
  assert.equal(h.cloud.records.find(record => record.kind === 'progress').revision, 3);
  assert.equal(h.cloud.records.find(record => record.kind === 'progress').payload.note, '本机修改');
  h.hooks.unmount();
});

test('accepting the remote CAS version discards only the selected local draft', async () => {
  const h = await setup(); await h.connect('user-one');
  const project = h.hooks.store.state.projects[0];
  h.hooks.store.save('project', { ...project, title: '本机标题' });
  h.cloud.records[0].payload = { ...h.cloud.records[0].payload, title: '云端标题' }; h.cloud.records[0].revision = 2;
  await h.hooks.store.sync(); let store = h.hooks.render();
  assert.equal(store.conflicts.length, 1);
  assert.equal(await store.resolveConflict(store.conflicts[0].key, 'remote'), true);
  store = h.hooks.render();
  assert.equal(store.state.projects[0].title, '云端标题');
  assert.equal(store.pending, 0);
  h.hooks.unmount();
});

test('revoked books disappear while unsent drafts remain exportable and durable after sign-out', async () => {
  const h = await setup(); await h.connect('user-one');
  h.hooks.store.save('progress', progressFor('user-one'));
  h.cloud.records = []; // RLS no longer returns this book after member removal.
  await h.hooks.store.sync(); let store = h.hooks.render();
  assert.equal(store.state.projects.length, 0);
  assert.equal(store.state.progress.length, 0);
  assert.equal(store.conflicts.length, 1);
  assert.equal(Object.keys(JSON.parse(store.exportPending()).entries).length, 1);
  const key = 'studyshare.outbox.room-user-one.user-one';
  const durable = h.storage.get(key);
  h.cloud.session = null; await store.connect(); store = h.hooks.render();
  assert.equal(store.room, null);
  assert.equal(h.storage.get(key), durable);
  h.hooks.unmount();
});

test('answers upload before a submitted progress record even when progress entered the outbox first', async () => {
  const h = await setup(); await h.connect('user-one');
  const store = h.hooks.store;
  store.save('progress', progressFor('user-one'));
  for (const question of store.state.projects[0].chapters[0].packs[0].questions) store.save('answer', { id: `user-one:${projectId}:ch1-01:${question.id}`, learnerId: 'user-one', projectId, packId: 'ch1-01', questionId: question.id, text: '完成作答', updatedAt: '2026-09-21T10:00:00Z' });
  assert.equal(store.save('progress', { ...progressFor('user-one'), status: 'submitted', evidence: '上方作答', updatedAt: '2026-09-21T11:00:00Z' }), true);
  const order = []; const saveRecord = h.cloud.saveRecord.bind(h.cloud);
  h.cloud.saveRecord = async (...args) => { order.push(args[1]); return saveRecord(...args); };
  await store.sync();
  assert.deepEqual(order, [...store.state.projects[0].chapters[0].packs[0].questions.map(() => 'answer'), 'progress']);
  assert.equal(h.hooks.render().pending, 0);
  h.hooks.unmount();
});

test('a project CAS conflict pauses its dependent new answers without blocking another project', async () => {
  const h = await setup(); await h.connect('user-one');
  let store = h.hooks.store;
  const project = structuredClone(store.state.projects[0]);
  project.chapters[0].packs[0].questions.push({ id: 'new-question', prompt: '新题目' });
  assert.equal(store.save('project', project), true);
  assert.equal(store.save('answer', { id: `user-one:${projectId}:ch1-01:new-question`, learnerId: 'user-one', projectId, packId: 'ch1-01', questionId: 'new-question', text: '作答', updatedAt: '2026-09-21T10:00:00Z' }), true);
  const second = { ...createInitialState().projects[0], id: 'second-book', ownerId: 'user-one', memberIds: ['user-one'], revision: 0 };
  assert.equal(store.save('project', second), true);
  assert.equal(store.save('session', { id: 'user-one:second-session', learnerId: 'user-one', projectId: 'second-book', packId: 'ch1-01', chapterId: '1', date: '2026-09-21', minutes: 20, note: '', createdAt: '2026-09-21T10:00:00Z' }), true);
  h.cloud.records[0].revision = 2;
  await store.sync(); store = h.hooks.render();
  assert.equal(store.conflicts.length, 1);
  assert.equal(store.pending, 2);
  assert.ok(h.cloud.records.some(record => record.kind === 'project' && record.id === 'second-book'));
  assert.ok(h.cloud.records.some(record => record.kind === 'session'));
  assert.equal(h.cloud.records.some(record => record.kind === 'answer'), false);
  h.hooks.unmount();
});

test('a browser editor lock makes a second page read-only and releases on unmount', async () => {
  const held = new Set();
  const locks = { request(name, options, callback) {
    assert.equal(options.ifAvailable, true);
    if (held.has(name)) return Promise.resolve(callback(null));
    held.add(name);
    return Promise.resolve(callback({ name })).finally(() => held.delete(name));
  } };
  const first = await setup({}, locks);
  assert.equal(first.hooks.store.editable, true);
  assert.equal(first.hooks.store.editStatus, 'editing');
  const second = await setup({}, locks);
  assert.equal(second.hooks.store.editable, false);
  assert.equal(second.hooks.store.editStatus, 'readonly');
  assert.match(second.hooks.store.editMessage, /已有一个学习页面正在编辑/);
  assert.equal(second.hooks.store.save('progress', progressFor('A')), false);
  assert.throws(() => second.hooks.store.replaceLocal(createInitialState()), /已有一个学习页面/);
  await second.hooks.store.sync();
  assert.equal(await second.hooks.store.resolveConflict('missing', 'local'), false);
  assert.equal(second.storage.has(localKey), false);
  first.hooks.unmount();
  second.hooks.unmount();
  await Promise.resolve(); await Promise.resolve();
  const afterClose = await setup({}, locks);
  assert.equal(afterClose.hooks.store.editable, true);
  assert.equal(afterClose.hooks.store.save('progress', progressFor('A')), true);
  afterClose.hooks.unmount();
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
});


test('recreated accounts surface missing membership without changing records or pending work', async () => {
  const pendingKey = 'studyshare.outbox.room-user-one.user-one';
  const pending = JSON.stringify({ ['progress:' + progressFor('user-one').id]: { kind: 'progress', item: progressFor('user-one'), expectedRevision: 0 } });
  const h = await setup({ [pendingKey]: pending });
  h.cloud.session = { user: { id: 'user-one' } };
  h.cloud.room = roomFor('user-one');
  h.cloud.room.members.push({ id: 'friend-new', name: '学习伙伴', color: '#9675ce' });
  const project = cloudProject('user-one');
  project.payload.memberIds.push('friend-deleted');
  h.cloud.records = [project];
  const snapshot = JSON.stringify(h.cloud.records);
  await assert.rejects(h.hooks.store.connect(), /重新创建同邮箱账号会产生新的身份/);
  assert.equal(JSON.stringify(h.cloud.records), snapshot);
  assert.equal(h.storage.get(pendingKey), pending);
  // Only an explicit administrator repair of the reference restores a valid room.
  project.payload.memberIds = ['user-one', 'friend-new'];
  project.revision += 1;
  await h.hooks.store.connect();
  const store = h.hooks.render();
  assert.equal(store.actor, 'user-one');
  assert.deepEqual(store.state.projects[0].memberIds, ['user-one', 'friend-new']);
  assert.equal(store.state.progress[0].note, '第一版');
  assert.equal(h.storage.get(pendingKey), pending);
  h.hooks.unmount();
});
