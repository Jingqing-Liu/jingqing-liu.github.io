import { h3cneLowerStudyProject } from '../data/study/h3cne-rs-plus-lower';
import type { StudyProject } from './study-model';

/** Fill the previously missing page without replacing existing packs or records. */
export function getH3cLowerCatalogUpdate(project: StudyProject): StudyProject | null {
  if (project.id !== h3cneLowerStudyProject.id || !project.description.includes('目录第 VI 页待补充')) return null;
  const existingPacks = new Set(project.chapters.flatMap(chapter => chapter.packs.map(pack => pack.id)));
  const deletedPacks = new Set(project.deletedPackIds || []);
  const chapters = h3cneLowerStudyProject.chapters.map(template => {
    const current = project.chapters.find(chapter => chapter.id === template.id);
    if (!current) return structuredClone(template);
    const packs = template.packs.flatMap(pack => {
      const existing = current.packs.find(item => item.id === pack.id);
      if (existing) return [{ ...existing, ...(existing.title.includes('待补充') ? { title: pack.title, reading: pack.reading } : {}) }];
      return deletedPacks.has(pack.id) || existingPacks.has(pack.id) ? [] : [structuredClone(pack)];
    });
    return { ...current, title: current.title.includes('待补充') ? template.title : current.title,
      packs: [...packs, ...current.packs.filter(pack => !template.packs.some(item => item.id === pack.id))] };
  });
  return { ...project, description: h3cneLowerStudyProject.description,
    chapters: [...chapters, ...project.chapters.filter(chapter => !chapters.some(item => item.id === chapter.id))] };
}
