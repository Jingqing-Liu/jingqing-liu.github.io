'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState, dateInTimeZone, getProjectLearners, isProjectMember, migrateStudyState, validateStudyState, type StudyState, type StudyProject, type Progress, type Answer, type StudySession, type PeerReview, type Learner } from './study-model';
import * as cloud from './study-cloud';

const LOCAL_KEY = 'studyshare.local.v1';
const READONLY_MESSAGE = '此浏览器已有一个学习页面正在编辑，请回到该页面或关闭后刷新。';
export type StudyEditStatus = 'acquiring' | 'editing' | 'readonly' | 'unsupported';
type Entity = StudyProject | Progress | Answer | StudySession | PeerReview;
export type EntityKind = 'project' | 'progress' | 'answer' | 'session' | 'review';
const collection = { project: 'projects', progress: 'progress', answer: 'answers', session: 'sessions', review: 'reviews' } as const;
const uploadOrder: Record<EntityKind, number> = { project: 0, answer: 1, progress: 2, session: 3, review: 4 };
export type Room = Awaited<ReturnType<typeof cloud.getMyRoom>>;
type Entry = { kind: EntityKind; item: Entity; expectedRevision?: number; conflict?: string };
type Outbox = Record<string, Entry>;
type Context = { user: cloud.CloudUser | null; room: Room };
export type StudyConflict = { key: string; kind: EntityKind; id: string; message: string };

function put(state: StudyState, kind: EntityKind, item: Entity): StudyState {
  const key = collection[kind];
  return { ...state, [key]: [...state[key].filter(record => record.id !== item.id), item] };
}
function entryKey(kind: string, id: string) { return `${kind}:${id}`; }
function projectIdOf(entry: Entry) { return entry.kind === 'project' ? entry.item.id : (entry.item as Progress).projectId; }
function storageKey(roomId: string, userId: string) { return `studyshare.outbox.${roomId}.${userId}`; }
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}
function sameEntity(a: Entity, b: object): boolean {
  const left = { ...a } as Record<string, unknown>;
  const right = { ...b } as Record<string, unknown>;
  delete left.revision; delete right.revision;
  return stable(left) === stable(right);
}
function isEntry(value: unknown): value is Entry {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.kind === 'string' && Object.hasOwn(collection, entry.kind) && !!entry.item && typeof entry.item === 'object' && !Array.isArray(entry.item) && typeof (entry.item as Record<string, unknown>).id === 'string' && (entry.expectedRevision === undefined || (Number.isSafeInteger(entry.expectedRevision) && (entry.expectedRevision as number) >= 0)) && (entry.conflict === undefined || typeof entry.conflict === 'string');
}
function readOutbox(raw: string | null, userId: string): Outbox {
  if (!raw) return {};
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).length > 100_000) throw new Error('待同步记录格式异常，原始内容已保留。');
  for (const [key, entry] of Object.entries(parsed)) {
    if (!isEntry(entry) || key !== entryKey(entry.kind, entry.item.id) || (entry.kind !== 'project' && (!('learnerId' in entry.item) || entry.item.learnerId !== userId || !entry.item.id.startsWith(`${userId}:`)))) throw new Error('待同步记录格式异常，原始内容已保留。');
  }
  return parsed as Outbox;
}
function remoteState(room: NonNullable<Room>, records: cloud.CloudRecord[], userId: string): StudyState {
  let next: StudyState = { version: 1, learners: room.members.map(member => ({ id: member.id, name: member.name, color: member.color })), projects: [], progress: [], answers: [], sessions: [], reviews: [] };
  for (const record of records) {
    if (record.kind !== 'project') continue;
    const entry = { kind: record.kind, item: record.payload };
    if (record.room_id !== room.id || !isEntry(entry) || entry.item.id !== record.id) throw new Error('云端项目格式异常，未覆盖本机数据。');
    const project = { ...entry.item, revision: record.revision } as StudyProject;
    if ((project.memberIds ?? next.learners.map(learner => learner.id)).includes(userId)) next = put(next, 'project', project);
  }
  const visible = new Set(next.projects.map(project => project.id));
  for (const record of records) {
    if (record.kind === 'project') continue;
    const entry = { kind: record.kind, item: record.payload };
    if (record.room_id !== room.id || !isEntry(entry) || entry.item.id !== record.id) throw new Error('云端记录格式异常，未覆盖本机数据。');
    if (visible.has((entry.item as Progress).projectId)) next = put(next, entry.kind, entry.item);
  }
  const learnerIds = new Set(next.learners.map(learner => learner.id));
  const referencesMissingMember = next.projects.some(project =>
    [project.ownerId, ...(Array.isArray(project.memberIds) ? project.memberIds : []), ...(Array.isArray(project.formerMemberIds) ? project.formerMemberIds : [])]
      .some(id => typeof id === 'string' && !learnerIds.has(id)))
    || [...next.progress, ...next.answers, ...next.sessions, ...next.reviews]
      .some(item => !learnerIds.has(item.learnerId) || ('targetLearnerId' in item && !learnerIds.has(item.targetLearnerId)));
  if (referencesMissingMember) throw new Error('书籍仍关联已从空间目录删除的成员账号。重新创建同邮箱账号会产生新的身份，请由空间负责人修复成员关联后重试；现有记录和待同步内容已保留。');
  const migrated = migrateStudyState(next as unknown);
  if (!migrated) throw new Error('共享空间的数据不完整，原始记录与待同步内容均已保留。');
  return migrated;
}
function canApply(entry: Entry, remote: StudyState, pending: Outbox, actor: string): boolean {
  const projectId = projectIdOf(entry);
  if (isProjectMember(remote, projectId, actor)) return true;
  const creation = pending[entryKey('project', projectId)];
  return !remote.projects.some(project => project.id === projectId) && !!creation && creation.expectedRevision === 0 && (creation.item as StudyProject).ownerId === actor && ((creation.item as StudyProject).memberIds ?? []).includes(actor);
}
function overlayPending(remote: StudyState, pending: Outbox, actor: string): StudyState {
  let next = remote;
  const entries = Object.values(pending).sort((a, b) => Number(b.kind === 'project') - Number(a.kind === 'project'));
  for (const entry of entries) if (canApply(entry, remote, pending, actor)) next = put(next, entry.kind, entry.item);
  const migrated = migrateStudyState(next as unknown);
  if (!migrated) throw new Error('待同步记录不完整，草稿已保留，请检查或恢复备份。');
  return migrated;
}
function completeAnswers(state: StudyState, progress: Progress) {
  const pack = state.projects.find(project => project.id === progress.projectId)?.chapters.flatMap(chapter => chapter.packs).find(pack => pack.id === progress.packId);
  return !!pack && pack.questions.every(question => state.answers.some(answer => answer.projectId === progress.projectId && answer.packId === progress.packId && answer.learnerId === progress.learnerId && answer.questionId === question.id && answer.text.trim() && Date.parse(answer.updatedAt) <= Date.parse(progress.updatedAt)));
}

export function useStudyStore() {
  const [state, setState] = useState<StudyState>(createInitialState);
  const stateRef = useRef(state);
  const [ready, setReady] = useState(false);
  const [actor, setActor] = useState('A');
  const actorRef = useRef(actor);
  const [user, setUser] = useState<cloud.CloudUser | null>(null);
  const [room, setRoom] = useState<Room>(null);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(0);
  const [conflicts, setConflicts] = useState<StudyConflict[]>([]);
  const [editStatus, setEditStatus] = useState<StudyEditStatus>('acquiring');
  const editorLock = useRef<{ key: string } | null>(null);
  const outbox = useRef<Outbox>({});
  const revisions = useRef<Record<string, number>>({});
  const active = useRef<Context>({ user: null, room: null });
  const running = useRef<number | null>(null);
  const generation = useRef(0);
  const connectionReady = useRef(false);
  const localWritable = useRef(false);
  const canEdit = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.locks) return true;
    const context = active.current;
    const key = context.room && context.user ? `studyshare.editor.${context.room.id}.${context.user.id}` : `studyshare.editor.${LOCAL_KEY}`;
    return editorLock.current?.key === key;
  }, []);
  const apply = useCallback((next: StudyState) => { stateRef.current = next; setState(next); }, []);
  const changeActor = useCallback((id: string) => { actorRef.current = id; setActor(id); }, []);
  const showQueue = useCallback(() => {
    setPending(Object.keys(outbox.current).length);
    setConflicts(Object.entries(outbox.current).filter(([, entry]) => entry.conflict).map(([key, entry]) => ({ key, kind: entry.kind, id: entry.item.id, message: entry.conflict! })));
  }, []);
  const persistQueue = useCallback((next: Outbox, key: string) => {
    localStorage.setItem(key, JSON.stringify(next)); outbox.current = next; showQueue();
  }, [showQueue]);
  const loadLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      const saved = migrateStudyState(raw ? JSON.parse(raw) as unknown : createInitialState());
      if (!saved) throw new Error('本机数据格式异常。请恢复有效备份后再记录。');
      apply(saved);
      const savedActor = localStorage.getItem('studyshare.actor');
      const nextActor = saved.learners.some(learner => learner.id === savedActor) ? savedActor! : saved.learners[0].id;
      changeActor(nextActor); localWritable.current = true; setError('');
      if (savedActor !== nextActor && canEdit()) try { localStorage.setItem('studyshare.actor', nextActor); } catch { setError('记录已读取，但当前身份未能保存。'); }
    } catch (e) {
      apply(createInitialState()); changeActor('A'); localWritable.current = false;
      setError(`无法读取本机记录，原始内容已保留。请恢复有效备份后再记录。${e instanceof Error ? e.message : ''}`);
    }
  }, [apply, changeActor, canEdit]);
  const connect = useCallback(async () => {
    if (!cloud.cloudConfigured) return;
    const currentGeneration = ++generation.current;
    connectionReady.current = false; setSyncing(false);
    try {
      const session = await cloud.getCloudSession();
      if (currentGeneration !== generation.current) return;
      const currentUser = session?.user ?? null;
      const currentRoom = currentUser ? await cloud.getMyRoom() : null;
      if (currentGeneration !== generation.current) return;
      if (!currentUser || !currentRoom) {
        active.current = { user: currentUser, room: null }; revisions.current = {}; outbox.current = {};
        setUser(currentUser); setRoom(null); showQueue(); loadLocal(); connectionReady.current = true; return;
      }
      const records = await cloud.listRecords(currentRoom.id);
      if (currentGeneration !== generation.current) return;
      if (!currentRoom.members.some(member => member.id === currentUser.id)) throw new Error('当前账号不在这个学习空间中。');
      const nextOutbox = readOutbox(localStorage.getItem(storageKey(currentRoom.id, currentUser.id)), currentUser.id);
      const remote = remoteState(currentRoom, records, currentUser.id);
      const next = overlayPending(remote, nextOutbox, currentUser.id);
      active.current = { user: currentUser, room: currentRoom }; outbox.current = nextOutbox;
      revisions.current = Object.fromEntries(records.map(record => [entryKey(record.kind, record.id), record.revision]));
      setUser(currentUser); setRoom(currentRoom); changeActor(currentUser.id); showQueue();
      apply(next); setError(''); connectionReady.current = true;
    } catch (e) { if (currentGeneration === generation.current) throw e; }
  }, [apply, changeActor, loadLocal, showQueue]);

  useEffect(() => {
    let mounted = true;
    const reconnect = () => { void connect().catch(e => { if (mounted) setError(`连接未完成，请重试。${e instanceof Error ? e.message : String(e)}`); }); };
    loadLocal(); connectionReady.current = true; setReady(true); reconnect();
    const unsubscribe = cloud.subscribeAuth(reconnect);
    return () => { mounted = false; unsubscribe(); generation.current += 1; connectionReady.current = false; };
  }, [connect, loadLocal]);

  const editorKey = room && user ? `studyshare.editor.${room.id}.${user.id}` : `studyshare.editor.${LOCAL_KEY}`;
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.locks) {
      setEditStatus('unsupported'); return;
    }
    let mounted = true;
    let release: (() => void) | undefined;
    const token = { key: editorKey };
    setEditStatus('acquiring');
    // Holding the lock for the whole editor session preserves the synchronous save API.
    // A second tab never reads-and-overwrites the first tab's durable queue snapshot.
    void navigator.locks.request(editorKey, { ifAvailable: true }, async lock => {
      if (!mounted) return;
      if (!lock) { setEditStatus('readonly'); return; }
      editorLock.current = token;
      // Refresh the durable snapshot after acquiring, not before another editor releases it.
      if (!active.current.room) loadLocal();
      else void connect().catch(e => { if (mounted) setError(`连接未完成，请重试。${e instanceof Error ? e.message : ''}`); });
      setEditStatus('editing');
      await new Promise<void>(resolve => { release = resolve; });
    }).catch(() => {
      if (mounted) { editorLock.current = null; setEditStatus('readonly'); setError('无法取得本机编辑权限，请关闭其他学习页面后刷新。'); }
    });
    return () => {
      mounted = false;
      if (editorLock.current === token) editorLock.current = null;
      release?.();
    };
  }, [editorKey, connect, loadLocal]);

  const sync = useCallback(async () => {
    if (!canEdit()) { setError(READONLY_MESSAGE); return; }
    if (!connectionReady.current) { try { await connect(); } catch (e) { setError(`连接未完成，请重试。${e instanceof Error ? e.message : ''}`); } return; }
    const context = active.current;
    if (!context.room || !context.user || running.current === generation.current) return;
    const currentGeneration = generation.current;
    const roomId = context.room.id; const userId = context.user.id;
    const queueKey = storageKey(roomId, userId);
    running.current = currentGeneration; setSyncing(true);
    try {
      const currentRoom = await cloud.getMyRoom();
      if (generation.current !== currentGeneration) return;
      if (!currentRoom || currentRoom.id !== roomId || !currentRoom.members.some(member => member.id === userId)) { await connect(); return; }
      const fetched = await cloud.listRecords(roomId);
      if (generation.current !== currentGeneration) return;
      const records = new Map(fetched.map(record => [entryKey(record.kind, record.id), record]));
      let remote = remoteState(currentRoom, [...records.values()], userId);
      revisions.current = Object.fromEntries([...records].map(([key, record]) => [key, record.revision]));
      // Rebuild from the server, so revoked books cannot linger in an old state snapshot.
      apply(overlayPending(remote, outbox.current, userId));
      const entries = Object.entries(outbox.current).sort(([, a], [, b]) => uploadOrder[a.kind] - uploadOrder[b.kind]);
      for (const [key, entry] of entries) {
        if (generation.current !== currentGeneration) return;
        if (outbox.current[key] !== entry) continue;
        // A rejected or newly edited curriculum must sync before its dependent answers.
        if (entry.kind !== 'project' && outbox.current[entryKey('project', projectIdOf(entry))]) continue;
        if (entry.kind === 'progress' && Object.values(outbox.current).some(other => other.kind === 'answer' && (other.item as Answer).projectId === (entry.item as Progress).projectId && (other.item as Answer).packId === (entry.item as Progress).packId && (other.item as Answer).learnerId === (entry.item as Progress).learnerId)) continue;
        if (!canApply(entry, remote, outbox.current, userId)) {
          persistQueue({ ...outbox.current, [key]: { ...entry, conflict: '你已不在这本书的成员中。草稿已保留；可导出备份或放弃本机改动。' } }, queueKey); continue;
        }
        if (entry.conflict) continue;
        const currentRecord = records.get(key);
        if (entry.expectedRevision === undefined && currentRecord && !sameEntity(entry.item, currentRecord.payload)) {
          persistQueue({ ...outbox.current, [key]: { ...entry, conflict: '旧草稿缺少云端版本，请比较后选择保留哪一版。' } }, queueKey); continue;
        }
        let acknowledgement: cloud.CloudRecord;
        try {
          // A lost acknowledgement can safely retry the identical operation without another write.
          acknowledgement = currentRecord && sameEntity(entry.item, currentRecord.payload) ? currentRecord : await cloud.saveRecord(roomId, entry.kind, entry.item.id, entry.item, entry.expectedRevision ?? 0);
        } catch (e) {
          if (generation.current !== currentGeneration) return;
          if (typeof e === 'object' && e !== null && 'code' in e && e.code === 'STUDY_CONFLICT') {
            persistQueue({ ...outbox.current, [key]: { ...outbox.current[key], conflict: '云端已有更新，本机草稿未覆盖云端。请选择保留哪一版。' } }, queueKey); continue;
          }
          if (typeof e === 'object' && e !== null && 'code' in e && ['42501', '22023', '23503', '23514'].includes(String(e.code))) {
            persistQueue({ ...outbox.current, [key]: { ...outbox.current[key], conflict: `云端未接收这条记录，请核对内容与权限。${e instanceof Error ? e.message : ''}` } }, queueKey); continue;
          }
          throw e;
        }
        if (generation.current !== currentGeneration) return;
        records.set(key, acknowledgement); revisions.current[key] = acknowledgement.revision;
        const nextOutbox = { ...outbox.current };
        if (nextOutbox[key] === entry) delete nextOutbox[key];
        else if (nextOutbox[key]) {
          const newer = nextOutbox[key];
          nextOutbox[key] = { ...newer, expectedRevision: acknowledgement.revision, item: newer.kind === 'project' ? { ...newer.item, revision: acknowledgement.revision } : newer.item };
        }
        persistQueue(nextOutbox, queueKey);
        remote = remoteState(currentRoom, [...records.values()], userId);
      }
      if (generation.current !== currentGeneration) return;
      active.current = { ...context, room: currentRoom }; setRoom(currentRoom);
      apply(overlayPending(remote, outbox.current, userId));
      setError(Object.values(outbox.current).some(entry => entry.conflict) ? '部分改动需要确认，云端记录未被覆盖。' : '');
    } catch (e) { if (generation.current === currentGeneration) setError(`同步未完成，本机待同步记录已保留。${e instanceof Error ? e.message : ''}`); }
    finally { if (running.current === currentGeneration) running.current = null; if (generation.current === currentGeneration) setSyncing(false); }
  }, [apply, connect, persistQueue, canEdit]);
  const syncRef = useRef(sync); syncRef.current = sync;
  const roomId = room?.id;
  useEffect(() => {
    if (!roomId) return;
    const run = () => { void syncRef.current(); };
    const delayed = window.setTimeout(run, 900); const interval = window.setInterval(run, 15000);
    window.addEventListener('online', run);
    return () => { clearTimeout(delayed); clearInterval(interval); window.removeEventListener('online', run); };
  }, [roomId, pending]);

  const save = useCallback((kind: EntityKind, input: Entity) => {
    try {
      if (!canEdit()) throw new Error(READONLY_MESSAGE);
      if (!connectionReady.current) throw new Error('空间连接尚未完成，请先重试连接。');
      const context = active.current;
      if (!context.room && !localWritable.current) throw new Error('请先恢复有效备份，避免覆盖无法读取的原记录。');
      const acting = context.user && context.room ? context.user.id : actorRef.current;
      let item = { ...input } as Entity;
      const previous = stateRef.current[collection[kind]].find(record => record.id === item.id);
      if (kind === 'project') {
        const project = item as StudyProject; const old = previous as StudyProject | undefined;
        if (old && !isProjectMember(stateRef.current, old.id, acting)) throw new Error('你不是这本书的成员。');
        const memberIds = project.memberIds ?? old?.memberIds ?? [acting];
        const ownerId = old?.ownerId ?? acting;
        if (project.ownerId && project.ownerId !== ownerId) throw new Error('不能更改项目创建者。');
        const beforeMembers = old ? getProjectLearners(stateRef.current, old.id).map(member => member.id) : [acting];
        if (old && stable([...beforeMembers].sort()) !== stable([...memberIds].sort()) && ownerId !== acting) throw new Error('只有创建者可以管理本书成员。');
        if (!memberIds.includes(ownerId)) throw new Error('项目创建者必须保留为成员。');
        if (old && project.revision !== undefined && project.revision !== old.revision) throw new Error('项目已更新，请刷新内容后再修改。');
        item = { ...project, ownerId, memberIds, formerMemberIds: [...new Set([...(old?.formerMemberIds ?? []), ...(project.formerMemberIds ?? []), ...beforeMembers.filter(id => !memberIds.includes(id))])].filter(id => !memberIds.includes(id)), timeZone: project.timeZone ?? old?.timeZone ?? 'Asia/Shanghai', revision: context.room ? old?.revision ?? 0 : (old?.revision ?? 0) + (old ? 1 : 0) };
      } else {
        const record = item as Progress | Answer | StudySession | PeerReview;
        if (record.learnerId !== acting || !record.id.startsWith(`${acting}:`)) throw new Error('只能修改自己的学习记录。');
        if (!isProjectMember(stateRef.current, record.projectId, acting)) throw new Error('你不是这本书的成员，不能填写学习记录。');
        if (kind === 'progress') {
          const progress = record as Progress; const old = previous as Progress | undefined;
          if (old?.completedAt) { progress.completedAt = old.completedAt; progress.completedDate = old.completedDate; }
          if (progress.status === 'submitted') {
            if (!progress.evidence.trim() || !completeAnswers(stateRef.current, progress)) throw new Error('请先完成当前练习并留下产物，再完成学习。');
            if (!progress.completedAt) {
              progress.completedAt = progress.updatedAt;
              progress.completedDate = dateInTimeZone(progress.updatedAt, stateRef.current.projects.find(project => project.id === progress.projectId)?.timeZone);
            }
          }
        }
        if (kind === 'review') {
          const review = record as PeerReview;
          const target = stateRef.current.progress.find(progress => progress.projectId === review.projectId && progress.packId === review.packId && progress.learnerId === review.targetLearnerId);
          if (review.targetLearnerId === acting || !isProjectMember(stateRef.current, review.projectId, review.targetLearnerId)) throw new Error('只能互检本书另一位在册成员的作答。');
          if (!target || target.status !== 'submitted' || review.submissionUpdatedAt !== target.updatedAt) throw new Error('伙伴的提交已变化，请重新查看后互检。');
          if (!completeAnswers(stateRef.current, target)) throw new Error('伙伴还有未完成的练习，请补齐并重新提交后再互检。');
          if (review.outcome === 'passed' && !target.evidence.trim()) throw new Error('伙伴尚未留下学习产物，暂不能通过互检。');
        }
        if (kind === 'session' && previous) {
          const session = record as StudySession; const old = previous as StudySession;
          session.createdAt = old.createdAt;
          if (old.voidedAt && !session.voidedAt) throw new Error('已撤销的时长不能被旧编辑恢复，请新增正确记录。');
          if (!sameEntity(session, old)) session.updatedAt = session.updatedAt ?? new Date().toISOString();
        }
      }
      const next = put(stateRef.current, kind, item);
      if (!validateStudyState(next)) throw new Error('记录内容不完整，现有数据未更改。');
      if (context.room && context.user) {
        const key = entryKey(kind, item.id);
        const existing = outbox.current[key];
        const entry: Entry = { kind, item, expectedRevision: existing?.expectedRevision ?? revisions.current[key] ?? 0, ...(existing?.conflict ? { conflict: existing.conflict } : {}) };
        persistQueue({ ...outbox.current, [key]: entry }, storageKey(context.room.id, context.user.id));
      } else localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      apply(next); return true;
    } catch (e) { setError(`未能保存。${e instanceof Error ? e.message : ''}`); return false; }
  }, [apply, persistQueue, canEdit]);

  const resolveConflict = useCallback(async (key: string, choice: 'remote' | 'local'): Promise<boolean> => {
    if (!canEdit()) { setError(READONLY_MESSAGE); return false; }
    const context = active.current; const entry = outbox.current[key];
    if (!context.room || !context.user || !entry || running.current === generation.current) return false;
    const currentGeneration = generation.current;
    try {
      const records = await cloud.listRecords(context.room.id);
      if (generation.current !== currentGeneration) return false;
      const remote = remoteState(context.room, records, context.user.id);
      const currentRecord = records.find(record => entryKey(record.kind, record.id) === key);
      const next = { ...outbox.current };
      if (choice === 'remote') delete next[key];
      else {
        if (!canApply(entry, remote, outbox.current, context.user.id)) throw new Error('你已不在本书成员中，不能覆盖云端记录。');
        const revision = currentRecord?.revision ?? 0;
        next[key] = { kind: entry.kind, expectedRevision: revision, item: entry.kind === 'project' ? { ...entry.item, revision } : entry.item };
      }
      // Check dependent drafts before replacing a pending project with its cloud version.
      const nextState = overlayPending(remote, next, context.user.id);
      persistQueue(next, storageKey(context.room.id, context.user.id));
      revisions.current = Object.fromEntries(records.map(record => [entryKey(record.kind, record.id), record.revision]));
      apply(nextState); setError('');
      if (choice === 'local') await syncRef.current();
      return true;
    } catch (e) { setError(`未能处理冲突，草稿已保留。${e instanceof Error ? e.message : ''}`); return false; }
  }, [apply, persistQueue, canEdit]);
  const replaceLocal = useCallback((input: StudyState) => {
    if (!canEdit()) throw new Error(READONLY_MESSAGE);
    if (!connectionReady.current) throw new Error('请先完成账号与空间连接，再恢复本机备份。');
    if (active.current.room) throw new Error('请退出共享空间后导入本机备份。');
    const next = migrateStudyState(input as unknown);
    if (!next) throw new Error('备份内容不完整或格式不正确。');
    if (!localWritable.current) {
      const original = localStorage.getItem(LOCAL_KEY);
      if (original) localStorage.setItem(`${LOCAL_KEY}.recovery.${Date.now()}`, original);
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next)); localWritable.current = true; apply(next); setError('');
    const nextActor = next.learners.some(learner => learner.id === actorRef.current) ? actorRef.current : next.learners[0].id;
    changeActor(nextActor);
    try { localStorage.setItem('studyshare.actor', nextActor); } catch { /* The actual backup is already saved. */ }
  }, [apply, changeActor, canEdit]);
  const addLearner = useCallback((name: string): Learner | null => {
    if (active.current.room) { setError('云端账号请由空间管理员添加。'); return null; }
    const trimmed = name.trim(); if (!trimmed) return null;
    const palette = ['#007aff', '#9675ce', '#3d9278', '#c68442', '#c36684'];
    const learner = { id: `local-${crypto.randomUUID()}`, name: trimmed, color: palette[stateRef.current.learners.length % palette.length] };
    try { replaceLocal({ ...stateRef.current, learners: [...stateRef.current.learners, learner] }); return learner; }
    catch (e) { setError(e instanceof Error ? e.message : '无法添加学习者。'); return null; }
  }, [replaceLocal]);
  const selectActor = (id: string) => {
    if (!canEdit()) { setError(READONLY_MESSAGE); return; }
    if (!active.current.room && connectionReady.current && stateRef.current.learners.some(learner => learner.id === id)) {
      try { localStorage.setItem('studyshare.actor', id); changeActor(id); } catch { setError('无法保存当前身份。'); }
    }
  };
  const exportPending = () => JSON.stringify({ kind: 'studyshare-pending-drafts', version: 1, roomId: active.current.room?.id ?? null, learnerId: active.current.user?.id ?? actorRef.current, exportedAt: new Date().toISOString(), entries: outbox.current }, null, 2);
  const editMessage = editStatus === 'readonly' ? READONLY_MESSAGE : editStatus === 'acquiring' ? '正在取得本机编辑权限…' : editStatus === 'unsupported' ? '当前浏览器不支持多标签编辑保护，请仅在一个学习页面中修改记录。' : '';
  return { state, ready, actor, selectActor, save, error, setError, room, user, syncing, pending, conflicts, resolveConflict, connect, sync, replaceLocal, addLearner, exportPending, editable: canEdit(), editStatus, editMessage };
}
