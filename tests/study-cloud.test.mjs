import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(fs.readFileSync(new URL('../src/lib/study-cloud.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const projectUrl = 'https://study-test.supabase.co';
const storageKey = `studyshare.auth.v1.${projectUrl}`;
const user = { id: '10000000-0000-4000-8000-000000000001', email: 'a@example.com' };
const session = (extra = {}) => ({ user, access_token: 'access-old', refresh_token: 'refresh-old', expires_at: Date.now() / 1000 + 3600, ...extra });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function harness({ configured = true, initial, fetcher = () => json(null) } = {}) {
  const stored = new Map(initial ? [[storageKey, JSON.stringify(initial)]] : []);
  const calls = [];
  const handlers = new Map();
  let locks = 0;
  const events = {
    addEventListener(type, fn) { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); },
    removeEventListener(type, fn) { handlers.get(type)?.delete(fn); },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    process: { env: configured ? { NEXT_PUBLIC_SUPABASE_URL: projectUrl, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test' } : {} },
    window: { ...events, setInterval: () => 1, clearInterval() {} },
    document: { ...events, visibilityState: 'visible' },
    navigator: { locks: { request: async (_key, fn) => { locks += 1; return fn(); } } },
    localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) },
    fetch: async (url, options) => { calls.push({ url, options }); return fetcher(url, options); },
    setTimeout, clearTimeout, AbortController, URLSearchParams, Error, Date,
  });
  return { api: exports, stored, calls, handlers, get locks() { return locks; } };
}

test('unconfigured mode stays local and never calls the network', async () => {
  const h = harness({ configured: false });
  assert.equal(h.api.cloudConfigured, false);
  assert.equal(await h.api.getCloudSession(), null);
  await assert.rejects(h.api.signInWithPassword('a@example.com', 'example-password'), /暂时无法连接/);
  assert.equal(h.calls.length, 0);
});

test('password login normalizes email, preserves exact password, and never signs up or sends mail', async () => {
  const h = harness({ fetcher: () => json(session()) });
  const result = await h.api.signInWithPassword(' A@Example.com ', ' leading and trailing spaces ');
  assert.deepEqual(JSON.parse(h.calls[0].options.body), { email: 'a@example.com', password: ' leading and trailing spaces ' });
  assert.ok(h.calls[0].url.endsWith('/auth/v1/token?grant_type=password'));
  assert.equal(result.user.id, user.id);
  assert.equal(result.access_token, undefined);
  assert.equal((await h.api.getCloudSession()).user.id, user.id);
  assert.equal(h.calls.length, 1);
  assert.equal(h.api.sendLoginCode, undefined);
  assert.equal(h.api.createRoom, undefined);
  assert.equal(h.api.joinRoom, undefined);
  assert.ok(h.stored.has(storageKey));
  assert.equal(h.stored.get(storageKey).includes('leading and trailing'), false);
  await assert.rejects(h.api.signInWithPassword('a@example.com', ''), /请输入密码/);
});

test('invalid credentials and missing backend surface user-facing messages without setup details', async () => {
  const bad = harness({ fetcher: () => json({ error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400) });
  await assert.rejects(bad.api.signInWithPassword('a@example.com', 'bad'), /邮箱或密码不正确/);
  const unavailable = harness({ initial: session(), fetcher: () => json({ code: 'PGRST202', message: 'function public.study_my_room not found in schema cache' }, 404) });
  await assert.rejects(unavailable.api.getMyRoom(), error => !/Supabase|SQL|schema|study.sql/.test(error.message) && /联系空间负责人/.test(error.message));
});

test('concurrent expired sessions perform one token rotation under a browser lock', async () => {
  const h = harness({ initial: session({ expires_at: 1 }), fetcher: () => json(session({ access_token: 'access-new', refresh_token: 'refresh-new' })) });
  const values = await Promise.all(Array.from({ length: 5 }, () => h.api.getCloudSession()));
  assert.equal(values.length, 5);
  assert.equal(h.calls.length, 1);
  assert.equal(h.locks, 1);
  assert.equal(JSON.parse(h.stored.get(storageKey)).refresh_token, 'refresh-new');
});

test('transient refresh failure preserves session for retry; revoked refresh clears it', async () => {
  const offline = harness({ initial: session({ expires_at: 1 }), fetcher: () => { throw new TypeError('network offline'); } });
  await assert.rejects(offline.api.getCloudSession(), /network offline/);
  assert.ok(offline.stored.has(storageKey));
  const revoked = harness({ initial: session({ expires_at: 1 }), fetcher: () => json({ error_code: 'refresh_token_not_found', msg: 'Revoked' }, 400) });
  await assert.rejects(revoked.api.getCloudSession(), /暂时无法完成操作/);
  assert.equal(revoked.stored.has(storageKey), false);
});

test('401 from the database refreshes and retries once with the new access token', async () => {
  let queries = 0;
  const h = harness({ initial: session(), fetcher: (url, options) => {
    if (url.includes('/token?')) return json(session({ access_token: 'access-new', refresh_token: 'refresh-new' }));
    queries += 1;
    if (queries === 1) return json({ message: 'JWT expired' }, 401);
    assert.equal(options.headers.Authorization, 'Bearer access-new');
    return json({ id: 'room', members: [] });
  } });
  assert.equal((await h.api.getMyRoom()).id, 'room');
  assert.equal(queries, 2);
  assert.equal(h.calls.length, 3);
});

test('a refresh response arriving after sign-out cannot restore the old login', async () => {
  let finishRefresh;
  const h = harness({ initial: session({ expires_at: 1 }), fetcher: url => {
    if (url.includes('/token?')) return new Promise(resolve => { finishRefresh = resolve; });
    return json({});
  } });
  const pending = h.api.getCloudSession();
  await Promise.resolve();
  await h.api.signOut();
  finishRefresh(json(session({ access_token: 'access-new', refresh_token: 'refresh-new' })));
  assert.equal(await pending, null);
  assert.equal(h.stored.has(storageKey), false);
  assert.ok(h.calls.some(call => call.url.endsWith('/logout?scope=local')));
});

test('record pagination retains data beyond one server response', async () => {
  const h = harness({ initial: session(), fetcher: url => {
    const query = new URL(url).searchParams;
    assert.equal(query.get('room_id'), 'eq.room-one');
    assert.equal(query.get('order'), 'kind.asc,id.asc');
    const offset = Number(query.get('offset'));
    return json(Array.from({ length: offset === 0 ? 500 : 1 }, (_, index) => ({ id: String(offset + index) })));
  } });
  const records = await h.api.listRecords('room-one');
  assert.equal(records.length, 501);
  assert.equal(records[500].id, '500');
  assert.equal(h.calls.length, 2);
});

test('record save delegates owner determination to the authenticated SQL function', async () => {
  const h = harness({ initial: session(), fetcher: () => json([{ id: `${user.id}:answer`, owner_id: user.id, payload: { learnerId: user.id } }]) });
  const record = await h.api.saveRecord('room', 'answer', `${user.id}:answer`, { text: 'saved' }, 0);
  const body = JSON.parse(h.calls[0].options.body);
  assert.equal(body.p_room_id, 'room');
  assert.equal(body.owner_id, undefined);
  assert.equal(body.p_expected_revision, 0);
  assert.equal(record.owner_id, user.id);
  assert.equal(h.calls[0].options.headers.apikey, 'sb_publishable_test');
  assert.equal(h.calls[0].options.headers.Authorization, 'Bearer access-old');
});

test('another project session cannot be reused, and storage events update subscribers', async () => {
  const h = harness();
  h.stored.set('studyshare.auth.v1.https://another.supabase.co', JSON.stringify(session()));
  assert.equal(await h.api.getCloudSession(), null);
  let received = 'unchanged';
  const unsubscribe = h.api.subscribeAuth(value => { received = value; });
  for (const fn of h.handlers.get('storage')) fn({ key: storageKey });
  assert.equal(received, null);
  unsubscribe();
  assert.equal(h.handlers.get('storage').size, 0);
});

test('CAS conflicts are identifiable and do not retry a stale write', async () => {
  const h = harness({ initial: session(), fetcher: () => json({ code: 'P0001', message: 'STUDY_CONFLICT' }, 400) });
  await assert.rejects(h.api.saveRecord('room','answer',`${user.id}:answer`,{text:'draft'},3), error => h.api.isStudyConflict(error) && /草稿已保留/.test(error.message));
  assert.equal(h.calls.length, 1);
  assert.equal(JSON.parse(h.calls[0].options.body).p_expected_revision, 3);
  await assert.rejects(h.api.saveRecord('room','project','book',{},undefined), /同步最新记录/);
});

test('curriculum deletion calls the versioned authenticated RPC and reports missing installation', async()=>{
  const row={id:'book',kind:'project',room_id:'room',revision:3,payload:{id:'book'}};
  const h=harness({initial:session(),fetcher:()=>json(row)});
  await h.api.deleteQuestion('room','book','pack','q',2);
  assert.ok(h.calls[0].url.endsWith('/rest/v1/rpc/study_delete_question'));
  assert.deepEqual(JSON.parse(h.calls[0].options.body),{p_room_id:'room',p_project_id:'book',p_pack_id:'pack',p_question_id:'q',p_expected_revision:2});
  const missing=harness({initial:session(),fetcher:()=>json({code:'PGRST202',message:'missing'},404)});
  await assert.rejects(()=>missing.api.deleteQuestion('room','book','pack','q',2),/尚未启用/);
  await assert.rejects(()=>h.api.deleteQuestion('room','book','pack','q',-1));
});
