import { legacyNetworkingStudyProject, networkingStudyProject } from '../data/study/networking';
import type { StudyProject } from './study-model';

export interface NetworkingChapterOneUpdate {
  project: StudyProject;
  addedPacks: number;
  addedQuestions: number;
  retainedQuestions: number;
  archivedPacks: number;
}

/** Recognize both the original seed and copies created by “添加学习计划”. */
function isNetworkingTemplate(project: StudyProject): boolean {
  if (project.kind !== 'book' || !(project.id === legacyNetworkingStudyProject.id ||
    /^networking-[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(project.id))) return false;

  // A title or one matching pack is insufficient: custom books can use either.
  // Added custom chapters/packs and renamed template titles remain eligible.
  return legacyNetworkingStudyProject.chapters.every(original => {
    const current = project.chapters.find(chapter => chapter.id === original.id);
    return current && original.packs.every(pack => current.packs.some(item => item.id === pack.id));
  });
}

/**
 * Replace active Chapter 1 exercises, retaining the former packs as history.
 * The caller saves the returned project through the normal revision/conflict flow.
 * No learner records, revisions, memberships, or existing question objects change.
 * Keeping every question in its original pack also satisfies the deployed SQL's
 * identity guard and keeps historical answers available after synchronization.
 */
export function getNetworkingChapterOneUpdate(project: StudyProject): NetworkingChapterOneUpdate | null {
  if (!isNetworkingTemplate(project)) return null;

  const baseline = legacyNetworkingStudyProject.chapters[0];
  const template = networkingStudyProject.chapters[0];
  const current = project.chapters.find(chapter => chapter.id === baseline.id)!;
  const usedPackIds = new Set(project.chapters.flatMap(chapter => chapter.packs.map(pack => pack.id)));
  // This also makes updates idempotent. If a custom pack has claimed a new ID,
  // do not create a partial replacement or move it from its original chapter.
  if (template.packs.some(pack => usedPackIds.has(pack.id))) return null;

  const packs = [
    ...structuredClone(template.packs),
    ...current.packs.map(pack => ({ ...pack, base: false, archived: true })),
  ];

  const title = current.title === baseline.title ? template.title : current.title;
  const description = project.description === legacyNetworkingStudyProject.description
    ? networkingStudyProject.description : project.description;
  return {
    project: {
      ...project,
      description,
      chapters: project.chapters.map(chapter => chapter === current ? { ...chapter, title, packs } : chapter),
    },
    addedPacks: template.packs.length,
    addedQuestions: template.packs.reduce((count, pack) => count + pack.questions.length, 0),
    retainedQuestions: current.packs.reduce((count, pack) => count + pack.questions.length, 0),
    archivedPacks: current.packs.filter(pack => !pack.archived).length,
  };
}
