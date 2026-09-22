import { legacyNetworkingStudyProject, networkingStudyProject } from '../data/study/networking';
import type { StudyProject, StudyState } from './study-model';

export interface NetworkingChapterOneUpdate {
  project: StudyProject;
  removedPackIds: string[];
  addedPacks: number;
}

/** Prepare either a first replacement or cleanup of the previously archived version. */
export function getNetworkingChapterOneUpdate(project: StudyProject): NetworkingChapterOneUpdate | null {
  if (project.kind !== 'book' || !(project.id === legacyNetworkingStudyProject.id ||
    /^networking-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(project.id))) return null;
  if (!legacyNetworkingStudyProject.chapters.slice(1).every(original => {
    const current = project.chapters.find(chapter => chapter.id === original.id);
    return current && original.packs.every(pack => current.packs.some(item => item.id === pack.id));
  })) return null;
  const current = project.chapters.find(chapter => chapter.id === '1');
  if (!current) return null;
  const template = networkingStudyProject.chapters[0];
  const templateIds = new Set(template.packs.map(pack => pack.id));
  const oldIds = new Set(legacyNetworkingStudyProject.chapters[0].packs.map(pack => pack.id));
  const alreadyUpdated = template.packs.every(pack => current.packs.some(item => item.id === pack.id && !item.archived));
  if (!alreadyUpdated && (!legacyNetworkingStudyProject.chapters[0].packs.every(pack => current.packs.some(item => item.id === pack.id)) ||
    project.chapters.some(chapter => chapter.packs.some(pack => templateIds.has(pack.id))))) return null;
  const removedPackIds = current.packs.filter(pack => alreadyUpdated ? pack.archived || oldIds.has(pack.id) : true).map(pack => pack.id);
  if (!removedPackIds.length) return null;
  const removed = new Set(removedPackIds);
  const packs = alreadyUpdated ? current.packs.filter(pack => !removed.has(pack.id)) : structuredClone(template.packs);
  return {
    project: {
      ...project,
      description: project.description === legacyNetworkingStudyProject.description ? networkingStudyProject.description : project.description,
      // IDs only: prevent stale devices from re-uploading deleted content. No old content is retained.
      deletedPackIds: [...new Set([...(project.deletedPackIds ?? []), ...removedPackIds])].sort(),
      chapters: project.chapters.map(chapter => chapter === current ? { ...chapter, packs } : chapter),
    },
    removedPackIds,
    addedPacks: alreadyUpdated ? 0 : template.packs.length,
  };
}

/** Delete related records for every member, and keep all unrelated/new-version data intact. */
export function applyChapterOneReplacement(state: StudyState, project: StudyProject): StudyState {
  const removed = new Set(project.deletedPackIds ?? []);
  const keep = (item: { projectId: string; packId: string }) => item.projectId !== project.id || !removed.has(item.packId);
  return {
    ...state,
    projects: state.projects.map(item => item.id === project.id ? project : item),
    answers: state.answers.filter(item => keep(item) && (item.projectId !== project.id || !project.deletedQuestionIds?.[item.packId]?.includes(item.questionId))), progress: state.progress.filter(keep),
    sessions: state.sessions.filter(keep), reviews: state.reviews.filter(keep),
  };
}

export function getQuestionDeletion(project: StudyProject, packId: string, questionId: string): StudyProject | null {
  const pack = project.chapters.flatMap(chapter => chapter.packs).find(item => item.id === packId);
  if (!pack || !pack.questions.some(question => question.id === questionId)) return null;
  return {
    ...project,
    deletedQuestionIds: { ...project.deletedQuestionIds, [packId]: [...new Set([...(project.deletedQuestionIds?.[packId] ?? []), questionId])].sort() },
    chapters: project.chapters.map(chapter => ({ ...chapter, packs: chapter.packs.map(item => item.id === packId ? { ...item, questions: item.questions.filter(question => question.id !== questionId) } : item) })),
  };
}
