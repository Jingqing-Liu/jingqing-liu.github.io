import { networkingStudyProject } from "../data/study/networking";

export { networkingStudyProject };

export interface Learner {
  id: string;
  name: string;
  color: string;
}

export interface StudyQuestion {
  id: string;
  prompt: string;
  hint?: string;
}

export interface StudyPack {
  id: string;
  title: string;
  kind: "reading" | "review" | "practice" | "lab";
  reading: string;
  minutes: string;
  output: string;
  bookPractice: string;
  questions: StudyQuestion[];
  base: boolean;
  archived?: boolean;
}

export interface StudyChapter {
  id: string;
  title: string;
  packs: StudyPack[];
}

export interface StudyProject {
  id: string;
  title: string;
  subtitle: string;
  kind: "book" | "project";
  description: string;
  color: string;
  chapters: StudyChapter[];
  memberIds?: string[];
  formerMemberIds?: string[];
  deletedPackIds?: string[];
  deletedQuestionIds?: Record<string, string[]>;
  ownerId?: string;
  revision?: number;
  timeZone?: string;
}

export interface Progress {
  id: string;
  projectId: string;
  packId: string;
  learnerId: string;
  status: "studying" | "submitted" | "revision";
  note: string;
  evidence: string;
  updatedAt: string;
  completedAt?: string;
  completedDate?: string;
}

export interface Answer {
  id: string;
  projectId: string;
  packId: string;
  questionId: string;
  learnerId: string;
  text: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  projectId: string;
  packId: string;
  chapterId: string;
  learnerId: string;
  date: string;
  minutes: number;
  note: string;
  createdAt: string;
  updatedAt?: string;
  voidedAt?: string;
  timerSegments?: { start: string; end: string }[];
  timeZone?: string;
  timerAdjusted?: boolean;
}

export interface PeerReview {
  id: string;
  projectId: string;
  packId: string;
  learnerId: string;
  targetLearnerId: string;
  outcome: "passed" | "changes";
  note: string;
  submissionUpdatedAt: string;
  updatedAt: string;
}

export interface StudyState {
  version: 1;
  learners: Learner[];
  projects: StudyProject[];
  progress: Progress[];
  answers: Answer[];
  sessions: StudySession[];
  reviews: PeerReview[];
}

export type PackStatus = "unrecorded" | Progress["status"] | "passed";

export function createInitialState(): StudyState {
  return {
    version: 1,
    learners: [
      { id: "A", name: "我", color: "#007aff" },
      { id: "B", name: "学习伙伴", color: "#9675ce" },
    ],
    projects: [{ ...structuredClone(networkingStudyProject), memberIds: ["A", "B"], formerMemberIds: [], ownerId: "A", revision: 0, timeZone: "Asia/Shanghai" }],
    progress: [],
    answers: [],
    sessions: [],
    reviews: [],
  };
}

/** The learner prefix also scopes record ownership in the optional shared backend. */
export function progressKey(projectId: string, packId: string, learnerId: string): string {
  return `${learnerId}:${projectId}:${packId}`;
}

export function getProjectLearners(state: StudyState, projectId: string, includeFormer = false): Learner[] {
  const project = state.projects.find(item => item.id === projectId);
  if (!project) return [];
  const ids = new Set(project.memberIds ?? state.learners.map(learner => learner.id));
  if (includeFormer) {
    project.formerMemberIds?.forEach(id => ids.add(id));
    for (const records of [state.progress, state.answers, state.sessions, state.reviews]) {
      for (const item of records) if (item.projectId === projectId) {
        ids.add(item.learnerId);
        if ('targetLearnerId' in item) ids.add(item.targetLearnerId);
      }
    }
  }
  return state.learners.filter(learner => ids.has(learner.id));
}

export function isProjectMember(state: StudyState, projectId: string, learnerId: string): boolean {
  return getProjectLearners(state, projectId).some(learner => learner.id === learnerId);
}

export function getActiveSessions(state: StudyState, projectId?: string, learnerId?: string): StudySession[] {
  return state.sessions.filter(session => !session.voidedAt && (!projectId || session.projectId === projectId) && (!learnerId || session.learnerId === learnerId));
}

function submissionHasAnswers(state: StudyState, progress: Progress): boolean {
  const pack = state.projects.find(project => project.id === progress.projectId)?.chapters.flatMap(chapter => chapter.packs).find(item => item.id === progress.packId);
  return !!pack && pack.questions.every(question => {
    const answer = state.answers.find(item => item.projectId === progress.projectId && item.packId === progress.packId && item.learnerId === progress.learnerId && item.questionId === question.id);
    return !!answer?.text.trim() && Date.parse(answer.updatedAt) <= Date.parse(progress.updatedAt);
  });
}

/** Backfill only actual legacy submissions; never infer completion from study time. */
export function migrateStudyState(state: StudyState): StudyState;
export function migrateStudyState(state: unknown): StudyState | null;
export function migrateStudyState(state: unknown): StudyState | null {
  if (!validateStudyState(state)) return null;
  const projects = state.projects.map(project => ({ ...project,
    memberIds: project.memberIds ?? state.learners.map(learner => learner.id),
    formerMemberIds: project.formerMemberIds ?? [],
    ownerId: project.ownerId ?? (project.memberIds ?? state.learners.map(learner => learner.id))[0],
    revision: project.revision ?? 0,
    timeZone: project.timeZone ?? 'Asia/Shanghai',
  }));
  const next = { ...state, projects };
  return { ...next, progress: state.progress.map(progress => {
    if (progress.completedAt || progress.status !== 'submitted' || !progress.evidence.trim() || !submissionHasAnswers(next, progress)) return progress;
    const timeZone = projects.find(project => project.id === progress.projectId)?.timeZone;
    return { ...progress, completedAt: progress.updatedAt, completedDate: dateInTimeZone(progress.updatedAt, timeZone) };
  }) };
}

export function isPackCompleted(state: StudyState, projectId: string, packId: string, learnerId: string): boolean {
  const progress = state.progress.find(item => item.projectId === projectId && item.packId === packId && item.learnerId === learnerId);
  return !!progress && (!!progress.completedAt || (progress.status === 'submitted' && !!progress.evidence.trim() && submissionHasAnswers(state, progress)));
}

export type ReviewStatus = 'unsubmitted' | 'pending' | 'changes' | 'passed';

/** Current unresolved changes take precedence over approval by another member. */
export function getReviewStatus(state: StudyState, projectId: string, packId: string, learnerId: string): ReviewStatus {
  const progress = state.progress.find((item) => item.projectId === projectId && item.packId === packId && item.learnerId === learnerId);
  if (!progress || progress.status !== 'submitted') return 'unsubmitted';
  if (!submissionHasAnswers(state, progress)) return 'changes';
  const project = state.projects.find(project => project.id === projectId);
  const eligible = new Set([...(project?.memberIds ?? state.learners.map(learner => learner.id)), ...(project?.formerMemberIds ?? [])]);
  const reviews = state.reviews.filter((review) =>
    review.projectId === projectId && review.packId === packId &&
    review.targetLearnerId === learnerId && review.learnerId !== learnerId &&
    eligible.has(review.learnerId) &&
    review.submissionUpdatedAt === progress.updatedAt,
  );
  const latest = new Map<string, PeerReview>();
  for (const review of reviews) if (!latest.has(review.learnerId) || Date.parse(review.updatedAt) >= Date.parse(latest.get(review.learnerId)!.updatedAt)) latest.set(review.learnerId, review);
  if ([...latest.values()].some(review => review.outcome === 'changes')) return 'changes';
  if ([...latest.values()].some(review => review.outcome === 'passed') && progress.evidence.trim()) return 'passed';
  return 'pending';
}

export function getPackStatus(state: StudyState, projectId: string, packId: string, learnerId: string): PackStatus {
  const progress = state.progress.find(item => item.projectId === projectId && item.packId === packId && item.learnerId === learnerId);
  if (!progress) return 'unrecorded';
  if (progress.status !== 'submitted') return progress.status;
  const status = getReviewStatus(state, projectId, packId, learnerId);
  return status === 'changes' ? 'revision' : status === 'passed' ? 'passed' : 'submitted';
}

export function getProjectStats(state: StudyState, projectId: string, learnerId: string) {
  const project = state.projects.find((item) => item.id === projectId);
  const packs = project?.chapters.flatMap((chapter) => chapter.packs).filter((pack) => pack.base) ?? [];
  const statuses = packs.map((pack) => getPackStatus(state, projectId, pack.id, learnerId));
  const completed = packs.filter(pack => isPackCompleted(state, projectId, pack.id, learnerId)).length;
  return {
    completed,
    verified: statuses.filter(status => status === 'passed').length,
    submitted: statuses.filter((status) => status === "submitted").length,
    total: packs.length,
    minutes: getActiveSessions(state, projectId, learnerId).reduce((total, session) => total + session.minutes, 0),
    percent: packs.length ? Math.round(completed / packs.length * 100) : 0,
  };
}

export function getSharedCompleted(state: StudyState, projectId: string): number {
  const project = state.projects.find((item) => item.id === projectId);
  const learners = getProjectLearners(state, projectId);
  if (!project || learners.length < 2) return 0;
  return project.chapters.flatMap((chapter) => chapter.packs).filter((pack) => pack.base && learners.every((learner) => isPackCompleted(state, projectId, pack.id, learner.id))).length;
}

/** Persist civil dates using a stable project timezone, not the viewing device's zone. */
export function dateKey(date: Date, timeZone = 'Asia/Shanghai'): string {
  return dateInTimeZone(date, timeZone);
}

export function dateInTimeZone(date: Date | string, timeZone = 'Asia/Shanghai'): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(date));
  return `${parts.find(part => part.type === 'year')!.value}-${parts.find(part => part.type === 'month')!.value}-${parts.find(part => part.type === 'day')!.value}`;
}

/** Split at actual local midnight, including 23/25-hour DST days, without rounding. */
export function splitStudyInterval(start: Date | string, end: Date | string, timeZone = 'Asia/Shanghai'): { date: string; minutes: number }[] {
  let cursor = new Date(start).getTime();
  const stop = new Date(end).getTime();
  if (!Number.isFinite(cursor) || !Number.isFinite(stop) || stop < cursor) throw new Error('学习时间范围不正确。');
  if (stop - cursor > 366 * 24 * 60 * 60_000) throw new Error('单次计时范围过长，请按实际学习日补录。');
  const result: { date: string; minutes: number }[] = [];
  while (cursor < stop) {
    const date = dateInTimeZone(new Date(cursor), timeZone);
    let low = cursor;
    let high = Math.min(stop, cursor + 27 * 60 * 60_000);
    if (dateInTimeZone(new Date(high - 1), timeZone) !== date) {
      while (high - low > 1) {
        const middle = Math.floor((high + low) / 2);
        if (dateInTimeZone(new Date(middle), timeZone) === date) low = middle;
        else high = middle;
      }
    }
    result.push({ date, minutes: (high - cursor) / 60_000 });
    cursor = high;
  }
  return result;
}

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 100_000): value is string => typeof value === "string" && value.length <= max;
const nonempty = (value: unknown, max = 200): value is string => text(value, max) && value.trim().length > 0;
const id = (value: unknown): value is string => nonempty(value) && !/[\u0000-\u001f\u007f]/.test(value);
const color = (value: unknown): value is string => typeof value === "string" && /^#[\da-f]{6}$/i.test(value);
const array = (value: unknown, max: number): value is unknown[] => Array.isArray(value) && value.length <= max;
const timestamp = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && validDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
function validTimeZone(value: unknown): value is string {
  if (!nonempty(value, 100)) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; }
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

/** Validate backup imports before replacing any local data. Unknown extra fields are harmless. */
export function validateStudyState(input: unknown): input is StudyState {
  if (!record(input) || input.version !== 1 ||
    !array(input.learners, 1000) || input.learners.length < 1 ||
    !array(input.projects, 200) || !array(input.progress, 100_000) ||
    !array(input.answers, 100_000) || !array(input.sessions, 100_000) || !array(input.reviews, 100_000)) return false;

  const learnerIds = new Set<string>();
  for (const learner of input.learners) {
    if (!record(learner) || !id(learner.id) || !nonempty(learner.name) || !color(learner.color) || learnerIds.has(learner.id)) return false;
    learnerIds.add(learner.id);
  }
  const projects = new Map<string, Map<string, { chapterId: string; questionIds: Set<string> }>>();
  const memberships = new Map<string, Set<string>>();
  let chapterCount = 0;
  let packCount = 0;
  let questionCount = 0;
  for (const project of input.projects) {
    if (!record(project) || !id(project.id) || projects.has(project.id) || !nonempty(project.title, 500) ||
      !text(project.subtitle, 1000) || !["book", "project"].includes(String(project.kind)) ||
      !text(project.description) || !color(project.color) || !array(project.chapters, 500) || project.chapters.length < 1) return false;
    for (const field of ['memberIds', 'formerMemberIds']) {
      if (project[field] !== undefined && (!array(project[field], 1000) || !(project[field] as unknown[]).every(member => typeof member === 'string' && learnerIds.has(member)) || !unique(project[field] as string[]))) return false;
    }
    if (project.memberIds && ((project.memberIds as string[]).length < 1 || (project.formerMemberIds as string[] | undefined)?.some(member => (project.memberIds as string[]).includes(member)))) return false;
    if (project.ownerId !== undefined && (!id(project.ownerId) || !learnerIds.has(project.ownerId) || (project.memberIds && !(project.memberIds as string[]).includes(project.ownerId)))) return false;
    if (project.revision !== undefined && (typeof project.revision !== 'number' || !Number.isSafeInteger(project.revision) || project.revision < 0)) return false;
    if (project.timeZone !== undefined && !validTimeZone(project.timeZone)) return false;
    if (project.deletedPackIds !== undefined && (!array(project.deletedPackIds, 20000) || !project.deletedPackIds.every(id) || !unique(project.deletedPackIds as string[]))) return false;
    if (project.deletedQuestionIds !== undefined && (!record(project.deletedQuestionIds) || Object.keys(project.deletedQuestionIds).length > 20000 || !Object.entries(project.deletedQuestionIds).every(([packId, ids]) => id(packId) && array(ids, 1000) && ids.every(id) && unique(ids as string[])))) return false;
    memberships.set(project.id, new Set([...(project.memberIds as string[] | undefined ?? learnerIds), ...(project.formerMemberIds as string[] | undefined ?? [])]));
    const packs = new Map<string, { chapterId: string; questionIds: Set<string> }>();
    const chapterIds = new Set<string>();
    for (const chapter of project.chapters) {
      if (++chapterCount > 10_000) return false;
      if (!record(chapter) || !id(chapter.id) || chapterIds.has(chapter.id) || !nonempty(chapter.title, 500) || !array(chapter.packs, 2000) || chapter.packs.length < 1) return false;
      chapterIds.add(chapter.id);
      for (const pack of chapter.packs) {
        if (++packCount > 20_000) return false;
        if (!record(pack) || !id(pack.id) || (project.deletedPackIds as string[] | undefined)?.includes(pack.id) || packs.has(pack.id) || !nonempty(pack.title, 500) ||
          !["reading", "review", "practice", "lab"].includes(String(pack.kind)) || !text(pack.reading) ||
          !text(pack.minutes, 200) || !text(pack.output) || !text(pack.bookPractice) ||
          (pack.archived !== undefined && typeof pack.archived !== "boolean") || typeof pack.base !== "boolean" || !array(pack.questions, 1000)) return false;
        const questionIds = new Set<string>();
        for (const question of pack.questions) {
          if (++questionCount > 100_000) return false;
          if (!record(question) || !id(question.id) || (project.deletedQuestionIds as Record<string, string[]> | undefined)?.[pack.id]?.includes(question.id) || questionIds.has(question.id) || !nonempty(question.prompt, 100_000) ||
            (question.hint !== undefined && !text(question.hint))) return false;
          questionIds.add(question.id);
        }
        packs.set(pack.id, { chapterId: chapter.id, questionIds });
      }
    }
    projects.set(project.id, packs);
  }

  const reference = (item: RecordValue) => id(item.id) && typeof item.projectId === "string" &&
    typeof item.packId === "string" && typeof item.learnerId === "string" &&
    learnerIds.has(item.learnerId) && !!memberships.get(item.projectId)?.has(item.learnerId) && !!projects.get(item.projectId)?.has(item.packId);
  const tuple = (item: RecordValue, extra = "") => JSON.stringify([item.projectId, item.packId, item.learnerId, extra]);
  const progressKeys: string[] = [];
  for (const progress of input.progress) {
    if (!record(progress) || !reference(progress) || !["studying", "submitted", "revision"].includes(String(progress.status)) ||
      progress.id !== progressKey(progress.projectId as string, progress.packId as string, progress.learnerId as string) ||
      !text(progress.note) || !text(progress.evidence) || !timestamp(progress.updatedAt)) return false;
    if ((progress.completedAt !== undefined || progress.completedDate !== undefined) && (!timestamp(progress.completedAt) || !validDate(progress.completedDate))) return false;
    progressKeys.push(tuple(progress));
  }
  const answerKeys: string[] = [];
  for (const answer of input.answers) {
    if (!record(answer) || !reference(answer) || !id(answer.questionId) ||
      answer.id !== `${answer.learnerId}:${answer.projectId}:${answer.packId}:${answer.questionId}` ||
      !projects.get(answer.projectId as string)?.get(answer.packId as string)?.questionIds.has(answer.questionId) ||
      !text(answer.text) || !timestamp(answer.updatedAt)) return false;
    answerKeys.push(tuple(answer, answer.questionId));
  }
  for (const session of input.sessions) {
    if (!record(session) || !reference(session) || !id(session.chapterId) ||
      !(session.id as string).startsWith(`${session.learnerId}:`) ||
      projects.get(session.projectId as string)?.get(session.packId as string)?.chapterId !== session.chapterId ||
      !validDate(session.date) || typeof session.minutes !== "number" || !Number.isFinite(session.minutes) ||
      session.minutes <= 0 || session.minutes > 1500 || !text(session.note) || !timestamp(session.createdAt) ||
      (session.updatedAt !== undefined && !timestamp(session.updatedAt)) || (session.voidedAt !== undefined && !timestamp(session.voidedAt))) return false;
    if ((session.timeZone !== undefined && !validTimeZone(session.timeZone)) || (session.timerAdjusted !== undefined && typeof session.timerAdjusted !== 'boolean')) return false;
    if (session.timerSegments !== undefined) {
      if (!array(session.timerSegments, 1000) || session.timerSegments.length < 1) return false;
      let previousEnd = -Infinity;
      for (const segment of session.timerSegments) {
        if (!record(segment) || !timestamp(segment.start) || !timestamp(segment.end) || Date.parse(segment.end) <= Date.parse(segment.start) || Date.parse(segment.start) < previousEnd) return false;
        previousEnd = Date.parse(segment.end);
      }
    }
  }
  for (const review of input.reviews) {
    if (!record(review) || !reference(review) || !id(review.targetLearnerId) ||
      review.id !== `${review.learnerId}:${review.projectId}:${review.packId}:${review.targetLearnerId}` ||
      !learnerIds.has(review.targetLearnerId) || review.targetLearnerId === review.learnerId ||
      !memberships.get(review.projectId as string)?.has(review.targetLearnerId) ||
      !["passed", "changes"].includes(String(review.outcome)) || !text(review.note) ||
      !timestamp(review.submissionUpdatedAt) || !timestamp(review.updatedAt)) return false;
  }
  return unique(progressKeys) && unique(answerKeys) &&
    [input.progress, input.answers, input.sessions, input.reviews].every((items) => unique(items.map((item) => (item as RecordValue).id as string)));
}
