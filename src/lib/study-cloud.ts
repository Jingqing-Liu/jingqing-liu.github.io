'use client';

// Supabase Auth + PostgREST from the browser; no server or secret key required.
export type CloudUser = { id: string; email?: string };
export type CloudSession = { user: CloudUser };
export type CloudRoom = { id: string; name: string; members: { id: string; name: string; color: string }[] };
export type CloudRecordKind = 'project' | 'progress' | 'answer' | 'session' | 'review';
export type CloudRecord = { id: string; room_id: string; kind: CloudRecordKind; owner_id: string; payload: object; updated_at: string; revision: number };
type StoredSession = CloudSession & { access_token: string; refresh_token: string; expires_at: number };
type AuthResponse = Partial<StoredSession> & { expires_in?: number };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '');
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
export const cloudConfigured = Boolean(url && key);
// Scope credentials to a project so reconfiguration cannot forward old tokens.
const storageKey = `studyshare.auth.v1.${url || 'unconfigured'}`;
const listeners = new Set<(session: CloudSession | null) => void>();
let refreshPending: Promise<StoredSession | null> | null = null;
let authGeneration = 0;

export class CloudError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) { super(message); }
}

export function isStudyConflict(error: unknown): boolean {
  return error instanceof CloudError && error.code === 'STUDY_CONFLICT';
}

function sessionInfo(session: StoredSession | null): CloudSession | null {
  return session ? { user: { id: session.user.id, email: session.user.email } } : null;
}

function readSession(): StoredSession | null {
  if (typeof window === 'undefined' || !cloudConfigured) return null;
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as StoredSession;
    if (value && typeof value.access_token === 'string' && typeof value.refresh_token === 'string' &&
        Number.isFinite(value.expires_at) && typeof value.user?.id === 'string') return value;
  } catch { /* A corrupted session requires a fresh login. */ }
  localStorage.removeItem(storageKey);
  return null;
}

function storeSession(session: StoredSession | null) {
  if (session) localStorage.setItem(storageKey, JSON.stringify(session));
  else localStorage.removeItem(storageKey);
  const snapshot = sessionInfo(session);
  setTimeout(() => listeners.forEach(callback => callback(snapshot)), 0);
}

function parseSession(data: AuthResponse): StoredSession {
  if (!data.access_token || !data.refresh_token || !data.user?.id) throw new Error('登录未完成，请重新登录。');
  const expiresAt = data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600);
  if (!Number.isFinite(expiresAt)) throw new Error('登录有效期不正确，请重新登录。');
  return { user: data.user, access_token: data.access_token, refresh_token: data.refresh_token, expires_at: expiresAt };
}

async function request<T>(path: string, options: { body?: object; token?: string; method?: string } = {}): Promise<T> {
  if (!url || !key) throw new Error('学习空间暂时无法连接，请稍后重试。');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${url}${path}`, {
      method: options.method || (options.body ? 'POST' : 'GET'),
      headers: { apikey: key, ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      signal: controller.signal,
      cache: 'no-store',
    });
    const raw = await response.text();
    let data: unknown = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { /* Proxy errors need not be JSON. */ }
    if (!response.ok) {
      const detail = (data || {}) as { error_code?: string; code?: string; msg?: string; message?: string; error_description?: string };
      const code = detail.error_code || detail.code;
      if (code === 'P0001' && detail.message === 'STUDY_CONFLICT') {
        throw new CloudError('这条记录已在另一处更新。本机草稿已保留，请比较并合并后再保存。', response.status, 'STUDY_CONFLICT');
      }
      const messages: Record<string, string> = {
        invalid_credentials: '邮箱或密码不正确。',
        email_not_confirmed: '账号尚未确认，请联系空间负责人。',
        user_banned: '账号暂不可用，请联系空间负责人。',
        '42501': '没有访问这条记录的权限，请检查登录状态和共享空间。',
        '42P01': '学习空间暂时不可用，请联系空间负责人。',
        PGRST202: '学习空间暂时不可用，请联系空间负责人。',
      };
      const serverMessage = detail.msg || detail.message || detail.error_description;
      const safeMessage = serverMessage && /[\u4e00-\u9fff]/.test(serverMessage) ? serverMessage : undefined;
      throw new CloudError((code && messages[code]) || safeMessage || '暂时无法完成操作，请稍后重试。', response.status, code);
    }
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('云端请求超时，请检查网络后重试。');
    throw error;
  } finally { clearTimeout(timeout); }
}

async function refreshSession(force = false, rejectedToken?: string): Promise<StoredSession | null> {
  if (refreshPending) {
    const pending = await refreshPending;
    // A concurrent ordinary session read may finish without rotating anything.
    // A caller whose JWT was rejected must still request an actual refresh.
    if (force && pending?.access_token === rejectedToken) return refreshSession(true, rejectedToken);
    return pending;
  }
  const refresh = async () => {
    // Reload after the cross-tab lock: a different tab may have rotated tokens.
    const current = readSession();
    if (!current) return null;
    if (rejectedToken && current.access_token !== rejectedToken) return current;
    if (!force && current.expires_at > Date.now() / 1000 + 60) return current;
    const generation = authGeneration;
    try {
      const data = await request<AuthResponse>('/auth/v1/token?grant_type=refresh_token', { body: { refresh_token: current.refresh_token } });
      if (generation !== authGeneration || readSession()?.refresh_token !== current.refresh_token) return readSession();
      const next = parseSession(data);
      storeSession(next);
      return next;
    } catch (error) {
      // Preserve credentials on network failure, clear only invalid/revoked ones.
      if (error instanceof CloudError && [400, 401, 403].includes(error.status) &&
          generation === authGeneration && readSession()?.refresh_token === current.refresh_token) {
        authGeneration += 1;
        storeSession(null);
      }
      throw error;
    }
  };
  refreshPending = (async () => {
    if (typeof navigator !== 'undefined' && navigator.locks) return await navigator.locks.request(`${storageKey}.refresh`, refresh);
    return refresh();
  })().finally(() => { refreshPending = null; });
  return refreshPending;
}

async function authorized<T>(path: string, body?: object): Promise<T> {
  const session = await refreshSession();
  if (!session) throw new Error('请先用自己的邮箱登录。');
  try { return await request<T>(path, { body, token: session.access_token }); }
  catch (error) {
    if (!(error instanceof CloudError) || error.status !== 401) throw error;
    const refreshed = await refreshSession(true, session.access_token);
    if (!refreshed) throw new Error('登录已失效，请重新登录。');
    return request<T>(path, { body, token: refreshed.access_token });
  }
}

export async function getCloudSession(): Promise<CloudSession | null> {
  return cloudConfigured ? sessionInfo(await refreshSession()) : null;
}

export function subscribeAuth(callback: (session: CloudSession | null) => void): () => void {
  if (!cloudConfigured || typeof window === 'undefined') return () => {};
  listeners.add(callback);
  const changed = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) { authGeneration += 1; callback(sessionInfo(readSession())); }
  };
  const maintain = () => { if (document.visibilityState === 'visible') void refreshSession().catch(() => {}); };
  const interval = window.setInterval(maintain, 30000);
  window.addEventListener('storage', changed);
  window.addEventListener('online', maintain);
  document.addEventListener('visibilitychange', maintain);
  return () => {
    listeners.delete(callback);
    window.clearInterval(interval);
    window.removeEventListener('storage', changed);
    window.removeEventListener('online', maintain);
    document.removeEventListener('visibilitychange', maintain);
  };
}

export async function signInWithPassword(email: string, password: string): Promise<CloudSession> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('请输入有效的邮箱地址。');
  if (!password) throw new Error('请输入密码。');
  const data = await request<AuthResponse>('/auth/v1/token?grant_type=password', { body: { email: normalized, password } });
  const session = parseSession(data);
  authGeneration += 1;
  storeSession(session);
  return { user: session.user };
}

export async function signOut(): Promise<void> {
  if (!cloudConfigured) return;
  const current = readSession();
  authGeneration += 1;
  storeSession(null);
  if (current) {
    try { await request('/auth/v1/logout?scope=local', { token: current.access_token, method: 'POST' }); }
    catch (error) {
      if (!(error instanceof CloudError && [401, 403, 404].includes(error.status))) throw new Error('已退出本机登录；远端会话注销未确认，请联网后重试登录。');
    }
  }
}

export async function getMyRoom(): Promise<CloudRoom | null> {
  return authorized<CloudRoom | null>('/rest/v1/rpc/study_my_room', {});
}

export async function listRecords(roomId: string): Promise<CloudRecord[]> {
  const result: CloudRecord[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const query = new URLSearchParams({ select: 'id,room_id,kind,owner_id,payload,updated_at,revision', room_id: `eq.${roomId}`, order: 'kind.asc,id.asc', limit: String(pageSize), offset: String(offset) });
    const records = await authorized<CloudRecord[]>(`/rest/v1/study_records?${query}`);
    if (!Array.isArray(records)) throw new Error('云端返回的学习记录格式不正确。');
    result.push(...records);
    if (records.length < pageSize) return result;
  }
}

export async function saveRecord(roomId: string, kind: CloudRecordKind, id: string, payload: object, expectedRevision: number): Promise<CloudRecord> {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new Error('请先同步最新记录后再保存。');
  const data = await authorized<CloudRecord | CloudRecord[]>('/rest/v1/rpc/study_save_record', { p_room_id: roomId, p_kind: kind, p_id: id, p_payload: payload, p_expected_revision: expectedRevision });
  const record = Array.isArray(data) ? data[0] : data;
  if (!record) throw new Error('云端没有确认保存，请重试。');
  return record;
}

export async function replaceChapterOne(roomId: string, projectId: string, chapter: object, expectedRevision: number): Promise<CloudRecord> {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new Error('请先同步最新记录后再更新。');
  try {
    const data = await authorized<CloudRecord | CloudRecord[]>('/rest/v1/rpc/study_replace_chapter_one', {
      p_room_id: roomId, p_project_id: projectId, p_chapter: chapter, p_expected_revision: expectedRevision,
    });
    const record = Array.isArray(data) ? data[0] : data;
    if (!record || record.kind !== 'project' || record.id !== projectId || record.room_id !== roomId) throw new Error('云端没有确认更新，请刷新后检查。');
    return record;
  } catch (error) {
    if (error instanceof CloudError && ['PGRST202', '42883'].includes(error.code || '')) throw new Error('旧学习包删除功能尚未启用，请联系空间负责人完成更新。');
    throw error;
  }
}

export async function deleteQuestion(roomId: string, projectId: string, packId: string, questionId: string, expectedRevision: number): Promise<CloudRecord> {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new Error('请先同步最新记录后再删除题目。');
  try {
    const data = await authorized<CloudRecord | CloudRecord[]>('/rest/v1/rpc/study_delete_question', {
      p_room_id: roomId, p_project_id: projectId, p_pack_id: packId, p_question_id: questionId, p_expected_revision: expectedRevision,
    });
    const record = Array.isArray(data) ? data[0] : data;
    if (!record || record.kind !== 'project' || record.id !== projectId || record.room_id !== roomId) throw new Error('云端没有确认删除，请刷新后检查。');
    return record;
  } catch (error) {
    if (error instanceof CloudError && ['PGRST202', '42883'].includes(error.code || '')) throw new Error('题目删除功能尚未启用，请联系空间负责人完成更新。');
    throw error;
  }
}
