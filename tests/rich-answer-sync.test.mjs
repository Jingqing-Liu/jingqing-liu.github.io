import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { registerHooks, stripTypeScriptTypes } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { createInitialState, validateStudyState, migrateStudyState } = await import('../src/lib/study-model.ts');
const { serializeRichAnswer, parseRichAnswer, richAnswerText, RICH_ANSWER_LIMIT } = await import('../src/lib/rich-answer.ts');
const dataModule = source => `data:text/javascript,${encodeURIComponent(source).replaceAll("'", '%27')}`;
const hooksModule = dataModule(['useState', 'useRef', 'useCallback', 'useEffect'].map(name => `export const ${name} = (...args) => globalThis.__richAnswerSyncTest.hooks.${name}(...args);`).join('\n'));
// Exercise the real REST serialization and auth code against an in-memory HTTP
// response boundary. No real credentials, network requests or schema changes.
const apiUrl = 'https://rich-answer-test.supabase.co';
const cloudSource = ts.transpileModule(readFileSync(new URL('../src/lib/study-cloud.ts', import.meta.url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
  .replaceAll('process.env.NEXT_PUBLIC_SUPABASE_URL', JSON.stringify(apiUrl))
  .replaceAll('process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', JSON.stringify('sb_publishable_test'))
  .replaceAll('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY', 'undefined');
const cloudModule = dataModule(cloudSource);
const storeSource = stripTypeScriptTypes(readFileSync(new URL('../src/lib/use-study-store.ts', import.meta.url), 'utf8'))
  .replace("from 'react'", `from '${hooksModule}'`)
  .replaceAll("from './study-model'", `from '${new URL('../src/lib/study-model.ts', import.meta.url).href}'`)
  .replace("from './study-template-update'", `from '${new URL('../src/lib/study-template-update.ts', import.meta.url).href}'`)
  .replace("from './study-cloud'", `from '${cloudModule}'`);
const { useStudyStore } = await import(dataModule(storeSource));

class HookHarness {
  slots = [];
  index = 0;
  effects = [];
  useState(initial) {
    const i = this.index++;
    if (!(i in this.slots)) this.slots[i] = typeof initial === 'function' ? initial() : initial;
    return [this.slots[i], value => { this.slots[i] = typeof value === 'function' ? value(this.slots[i]) : value; }];
  }
  useRef(initial) {
    const i = this.index++;
    if (!(i in this.slots)) this.slots[i] = { current: initial };
    return this.slots[i];
  }
  same(a, b) { return a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i])); }
  useCallback(callback, deps) {
    const i = this.index++;
    if (!this.slots[i] || !this.same(this.slots[i].deps, deps)) this.slots[i] = { deps, callback };
    return this.slots[i].callback;
  }
  useEffect(callback, deps) {
    const i = this.index++;
    const old = this.slots[i];
    if (!old || !this.same(old.deps, deps)) this.effects.push(() => { old?.cleanup?.(); this.slots[i] = { deps, cleanup: callback() }; });
  }
  render() {
    this.index = 0;
    // Test hook host; this is not a React class component.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    this.store = useStudyStore();
    this.effects.splice(0).forEach(effect => effect());
    return this.store;
  }
  unmount() { this.slots.forEach(slot => slot?.cleanup?.()); }
}
const initial = createInitialState();
const projectId = initial.projects[0].id;
const pack = initial.projects[0].chapters[0].packs[0];
const stamp = '2026-09-23T12:00:00Z';
const answer = (learnerId, value) => ({ id: `${learnerId}:${projectId}:${pack.id}:${pack.questions[0].id}`, projectId, packId: pack.id, questionId: pack.questions[0].id, learnerId, text: value, updatedAt: stamp });
const p = content => ({ type: 'paragraph', content });
const t = text => ({ type: 'text', text });
function rich(learner) {
  return serializeRichAnswer({ type: 'doc', content: [
    p([{ ...t(`${learner} 的推导`), marks: [{ type: 'textStyle', attrs: { color: learner === 'A' ? '#2563eb' : '#be185d', fontSize: '18px' } }] }, { type: 'inlineMath', attrs: { latex: 'd_{trans}=\\frac{L}{R}' } }]),
    { type: 'table', content: [{ type: 'tableRow', content: [
      { type: 'tableHeader', content: [p([t('分组长度')])] },
      { type: 'tableCell', content: [p([t(learner === 'A' ? '1500 B' : '1000 B')])] },
    ] }] },
  ] });
}
const richA = rich('A');
const richB = rich('B');
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });

async function setup() {
  const storage = new Map();
  const calls = [];
  const room = { id: 'room-rich', name: '学习空间', members: initial.learners };
  let records = [{ id: projectId, kind: 'project', room_id: room.id, owner_id: 'A', revision: 1, updated_at: stamp, payload: { ...structuredClone(initial.projects[0]), revision: 1 } }];
  let offline = false;
  const original = { window: globalThis.window, document: globalThis.document, localStorage: globalThis.localStorage, fetch: globalThis.fetch, navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator') };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  globalThis.window = { setTimeout: () => 0, setInterval: () => 0, clearInterval() {}, addEventListener() {}, removeEventListener() {} };
  globalThis.document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
  globalThis.fetch = async (url, options) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ path, body });
    if (offline) throw new Error('offline');
    if (path.endsWith('/study_my_room')) return json(room);
    if (path.endsWith('/study_records')) return json(records);
    if (path.endsWith('/study_save_record')) {
      const actor = options.headers.Authorization.replace('Bearer token-', '');
      assert.equal(body.p_room_id, room.id);
      assert.equal(body.p_payload.learnerId, actor);
      const old = records.find(record => record.kind === body.p_kind && record.id === body.p_id);
      if (body.p_expected_revision !== (old?.revision ?? 0)) return json({ code: 'P0001', message: 'STUDY_CONFLICT' }, 400);
      const record = { id: body.p_id, kind: body.p_kind, room_id: room.id, owner_id: actor, revision: (old?.revision ?? 0) + 1, updated_at: stamp, payload: body.p_payload };
      records = [...records.filter(item => !(item.kind === record.kind && item.id === record.id)), record];
      return json([record]);
    }
    throw new Error(`Unexpected test endpoint ${path}`);
  };
  const hooks = new HookHarness();
  globalThis.__richAnswerSyncTest = { hooks };
  hooks.render();
  await new Promise(setImmediate);
  hooks.render();
  return {
    hooks, storage, calls,
    get records() { return records; },
    setOffline(value) { offline = value; },
    async connect(id) {
      storage.set(`studyshare.auth.v1.${apiUrl}`, JSON.stringify({ user: { id }, access_token: `token-${id}`, refresh_token: `refresh-${id}`, expires_at: Date.now() / 1000 + 3600 }));
      await hooks.store.connect();
      return hooks.render();
    },
    close() {
      hooks.unmount();
      for (const key of ['window', 'document', 'localStorage', 'fetch']) {
        if (original[key] === undefined) delete globalThis[key]; else globalThis[key] = original[key];
      }
      if (original.navigator) Object.defineProperty(globalThis, 'navigator', original.navigator); else delete globalThis.navigator;
      delete globalThis.__richAnswerSyncTest;
    },
  };
}

test('formatted answers survive local saves, JSON backup import and existing migration unchanged', async () => {
  const h = await setup();
  try {
    assert.equal(h.hooks.store.save('answer', answer('A', richA)), true);
    h.hooks.render();
    h.hooks.store.selectActor('B');
    h.hooks.render();
    assert.equal(h.hooks.store.save('answer', answer('B', richB)), true);
    let store = h.hooks.render();
    const exported = JSON.stringify(store.state, null, 2);
    assert.equal(validateStudyState(JSON.parse(exported)), true);
    const imported = migrateStudyState(JSON.parse(exported));
    assert.equal(imported.version, 1);
    assert.deepEqual(imported.answers, [answer('A', richA), answer('B', richB)]);
    store.replaceLocal(createInitialState());
    store = h.hooks.render();
    assert.equal(store.state.answers.length, 0);
    store.replaceLocal(imported);
    store = h.hooks.render();
    assert.deepEqual(store.state.answers.map(value => value.text), [richA, richB]);
    assert.deepEqual(JSON.parse(h.storage.get('studyshare.local.v1')).answers, imported.answers);
    assert.equal(parseRichAnswer(store.state.answers[0].text).content[0].content[0].marks[0].attrs.color, '#2563eb');
    assert.match(richAnswerText(store.state.answers[1].text), /1000 B/);
    assert.equal(h.calls.length, 0);
  } finally { h.close(); }
});

test('rich answer drafts, REST saves and shared-room reads preserve exact content for separate authors', async () => {
  const h = await setup();
  try {
    await h.connect('A');
    assert.equal(h.hooks.store.save('answer', answer('A', richA)), true);
    h.setOffline(true);
    await h.hooks.store.sync();
    let store = h.hooks.render();
    assert.equal(store.pending, 1);
    const exported = JSON.parse(store.exportPending());
    assert.equal(exported.entries[`answer:${answer('A', richA).id}`].item.text, richA);
    const queued = JSON.parse(h.storage.get('studyshare.outbox.room-rich.A'));
    assert.equal(Object.values(queued)[0].item.text, richA);
    h.setOffline(false);
    await store.sync();
    store = h.hooks.render();
    assert.equal(store.pending, 0);
    const written = h.calls.find(call => call.path.endsWith('/study_save_record'));
    assert.equal(written.body.p_payload.text, richA);
    assert.equal(written.body.p_kind, 'answer');
    assert.equal(written.body.p_expected_revision, 0);
    await h.connect('B');
    store = h.hooks.render();
    assert.equal(store.state.answers[0].text, richA);
    assert.equal(store.save('answer', answer('A', richB)), false, 'shared visibility does not grant edit rights');
    assert.equal(store.save('answer', answer('B', richB)), true);
    await h.hooks.store.sync();
    store = h.hooks.render();
    assert.equal(store.pending, 0);
    assert.deepEqual(store.state.answers.map(value => [value.learnerId, value.text]).sort(), [['A', richA], ['B', richB]]);
    await h.connect('A');
    store = h.hooks.render();
    assert.equal(store.state.version, 1);
    assert.equal(store.state.answers.find(value => value.learnerId === 'B').text, richB);
    assert.equal(h.records.filter(record => record.kind === 'answer').length, 2);
    assert.equal(h.records[0].revision, 1, 'answer formatting does not modify the project or require a migration');
    assert.ok(h.calls.every(call => ['/rest/v1/rpc/study_my_room', '/rest/v1/study_records', '/rest/v1/rpc/study_save_record'].includes(call.path)));
  } finally { h.close(); }
});

test('oversized formatted drafts are retained by the caller while existing save validation leaves stored answers intact', async () => {
  const h = await setup();
  try {
    assert.equal(h.hooks.store.save('answer', answer('A', richA)), true);
    const draft = serializeRichAnswer({ type: 'doc', content: [p([t('x'.repeat(100_000))])] });
    assert.ok(draft.length > RICH_ANSWER_LIMIT);
    assert.equal(h.hooks.store.save('answer', answer('A', draft)), false);
    const store = h.hooks.render();
    assert.equal(store.state.answers[0].text, richA);
    assert.equal(JSON.parse(h.storage.get('studyshare.local.v1')).answers[0].text, richA);
    assert.ok(draft.includes('x'.repeat(100_000)));
  } finally { h.close(); }
});
