import assert from 'node:assert/strict';
import test from 'node:test';
import { legacyNetworkingStudyProject, networkingStudyProject } from '../src/data/study/networking';
import { applyChapterOneReplacement, getNetworkingChapterOneUpdate, getQuestionDeletion } from '../src/lib/study-template-update';
import { validateStudyState, type StudyProject, type StudyState } from '../src/lib/study-model';
const old = (): StudyProject => ({ ...structuredClone(legacyNetworkingStudyProject), ownerId: 'A', memberIds: ['A','B'] });
const stateWith = (project: StudyProject): StudyState => ({ version: 1, projects: [project], learners: ['A','B'].map(id => ({id,name:id,color:'#007aff'})), answers: [], progress: [], sessions: [], reviews: [] });
const stamp = '2026-09-21T10:00:00Z';
test('replacement deletes old packs and all learners’ associated records without changing other chapters', () => {
  const project = old(); const state = stateWith(project); const pack = project.chapters[0].packs[0];
  for (const learnerId of ['A','B']) {
    state.answers.push({id:`${learnerId}:${project.id}:${pack.id}:${pack.questions[0].id}`,projectId:project.id,packId:pack.id,questionId:pack.questions[0].id,learnerId,text:'old',updatedAt:stamp});
    state.progress.push({id:`${learnerId}:${project.id}:${pack.id}`,projectId:project.id,packId:pack.id,learnerId,status:'studying',note:'',evidence:'',updatedAt:stamp});
    state.sessions.push({id:`${learnerId}:time`,projectId:project.id,packId:pack.id,chapterId:'1',learnerId,date:'2026-09-21',minutes:20,note:'',createdAt:stamp});
  }
  assert.ok(validateStudyState(state));
  const update = getNetworkingChapterOneUpdate(project)!;
  const next = applyChapterOneReplacement(state,update.project);
  assert.ok(validateStudyState(next));
  assert.deepEqual(next.projects[0].chapters[0].packs,networkingStudyProject.chapters[0].packs);
  assert.deepEqual(next.projects[0].chapters.slice(1),project.chapters.slice(1));
  assert.equal(next.answers.length+next.progress.length+next.sessions.length,0);
  assert.equal(state.answers.length,2);
  assert.equal(getNetworkingChapterOneUpdate(update.project),null);
});
test('cleanup preserves updated questions and custom active packs', () => {
  const project = {...old(),chapters:structuredClone(networkingStudyProject.chapters)};
  project.chapters[0].packs[0].questions[0].prompt = 'edited';
  const active = structuredClone(project.chapters[0].packs);
  project.chapters[0].packs.push(...old().chapters[0].packs.map(p=>({...p,base:false,archived:true})));
  const update = getNetworkingChapterOneUpdate(project)!;
  assert.deepEqual(update.project.chapters[0].packs,active);
  assert.equal(update.addedPacks,0);
  assert.equal(update.removedPackIds.length,7);
});
test('unrelated books and colliding IDs cannot be replaced', () => {
  const unrelated=old(); unrelated.id='custom'; assert.equal(getNetworkingChapterOneUpdate(unrelated),null);
  const collision=old(); collision.chapters[1].packs.push(structuredClone(networkingStudyProject.chapters[0].packs[0]));
  assert.equal(getNetworkingChapterOneUpdate(collision),null);
});
test('question deletion removes all corresponding answers but keeps other answers and study time', () => {
  const project={...old(),chapters:structuredClone(networkingStudyProject.chapters)}; const state=stateWith(project);
  const pack=project.chapters[0].packs[0]; const question=pack.questions[0];
  for(const learnerId of ['A','B']) for(const q of pack.questions.slice(0,2)) state.answers.push({id:`${learnerId}:${project.id}:${pack.id}:${q.id}`,projectId:project.id,packId:pack.id,questionId:q.id,learnerId,text:'answer',updatedAt:stamp});
  state.sessions.push({id:'A:time',projectId:project.id,packId:pack.id,chapterId:'1',learnerId:'A',date:'2026-09-21',minutes:20,note:'',createdAt:stamp});
  const edited=getQuestionDeletion(project,pack.id,question.id)!; const next=applyChapterOneReplacement(state,edited);
  assert.equal(next.answers.length,2); assert.deepEqual(next.sessions,state.sessions); assert.ok(validateStudyState(next));
  assert.equal(getQuestionDeletion(edited,pack.id,question.id),null);
  edited.chapters[0].packs[0].questions.push(question); assert.equal(validateStudyState(stateWith(edited)),false);
});
test('deleted packs cannot be resurrected by stale data',()=>{
  const project=old();const updated=getNetworkingChapterOneUpdate(project)!.project;
  updated.chapters[0].packs.push(project.chapters[0].packs[0]);assert.equal(validateStudyState(stateWith(updated)),false);
});
