import {
  dateInTimeZone,
  getProjectLearners,
  getProjectStats,
  isProjectMember,
  type Learner,
  type StudyProject,
  type StudyState,
} from "./study-model";

/** Totals count one base learning pack for each current participant assigned to it. */
export interface RoomMetrics {
  total: number;
  completed: number;
  percent: number | null;
  minutes: number;
  weekMinutes: number;
  todayMinutes: number;
  studyDays: number;
  weekStudyDays: number;
}

export interface RoomProjectCell extends RoomMetrics {
  projectId: string;
  learnerId: string;
  status: "not-started" | "in-progress" | "completed";
}

export interface RoomProjectOverview {
  project: StudyProject;
  members: RoomProjectCell[];
  totals: RoomMetrics;
}

export interface RoomLearnerOverview {
  learner: Learner;
  /** Only visible projects have keys. A null cell means this learner is not enrolled. */
  cells: Record<string, RoomProjectCell | null>;
  totals: RoomMetrics;
  projectCount: number;
  completedProjects: number;
  inProgressProjects: number;
  notStartedProjects: number;
}

export interface RoomTotals extends RoomMetrics {
  projectCount: number;
  memberCount: number;
  participatingMemberCount: number;
}

export interface RoomOverview {
  projects: RoomProjectOverview[];
  learners: RoomLearnerOverview[];
  totals: RoomTotals;
}

interface CellWithDates {
  cell: RoomProjectCell;
  dates: Set<string>;
  weekDates: Set<string>;
}

function mondayOf(date: string): string {
  // This is calendar arithmetic on a persisted civil date, not a timezone conversion.
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - (value.getUTCDay() + 6) % 7);
  return value.toISOString().slice(0, 10);
}

function aggregate(cells: CellWithDates[]): RoomMetrics {
  const dates = new Set<string>();
  const weekDates = new Set<string>();
  let total = 0;
  let completed = 0;
  let minutes = 0;
  let weekMinutes = 0;
  let todayMinutes = 0;
  for (const item of cells) {
    total += item.cell.total;
    completed += item.cell.completed;
    minutes += item.cell.minutes;
    weekMinutes += item.cell.weekMinutes;
    todayMinutes += item.cell.todayMinutes;
    item.dates.forEach(date => dates.add(date));
    item.weekDates.forEach(date => weekDates.add(date));
  }
  return {
    total,
    completed,
    percent: total ? Math.round(completed / total * 100) : null,
    minutes,
    weekMinutes,
    todayMinutes,
    studyDays: dates.size,
    weekStudyDays: weekDates.size,
  };
}

/**
 * A room overview is always limited to projects the viewer currently belongs to.
 * Other room members remain listed, but their unrelated projects and records do not.
 * Dates are kept in each project's calendar; cross-project days deduplicate their
 * stored date labels. Future and voided sessions do not count as time already spent.
 */
export function getRoomOverview(state: StudyState, actorId: string, now = new Date()): RoomOverview {
  const visibleProjects = state.projects.filter(project => isProjectMember(state, project.id, actorId));
  const datesByProject = new Map(visibleProjects.map(project => {
    const today = dateInTimeZone(now, project.timeZone);
    return [project.id, { today, monday: mondayOf(today) }];
  }));
  const memberIdsByProject = new Map(visibleProjects.map(project => [
    project.id, new Set(getProjectLearners(state, project.id).map(learner => learner.id)),
  ]));
  const isCurrentMember = (record: { projectId: string; learnerId: string }) =>
    memberIdsByProject.get(record.projectId)?.has(record.learnerId) ?? false;
  const scopedState: StudyState = {
    ...state,
    projects: visibleProjects,
    progress: state.progress.filter(isCurrentMember),
    answers: state.answers.filter(isCurrentMember),
    sessions: state.sessions.filter(session => isCurrentMember(session)
      && !session.voidedAt && session.date <= datesByProject.get(session.projectId)!.today),
    reviews: state.reviews.filter(review => isCurrentMember(review)
      && memberIdsByProject.get(review.projectId)!.has(review.targetLearnerId)),
  };
  const allCells: CellWithDates[] = [];
  const cellsByLearner = new Map(state.learners.map(learner => [learner.id, [] as CellWithDates[]]));
  const projects = visibleProjects.map(project => {
    const { today, monday } = datesByProject.get(project.id)!;
    const projectCells = getProjectLearners(scopedState, project.id).map(learner => {
      const stats = getProjectStats(scopedState, project.id, learner.id);
      const sessions = scopedState.sessions.filter(session => session.projectId === project.id && session.learnerId === learner.id);
      const weekSessions = sessions.filter(session => session.date >= monday);
      const dates = new Set(sessions.filter(session => session.minutes > 0).map(session => session.date));
      const weekDates = new Set(weekSessions.filter(session => session.minutes > 0).map(session => session.date));
      const hasWork = stats.completed > 0 || stats.minutes > 0
        || scopedState.progress.some(item => item.projectId === project.id && item.learnerId === learner.id)
        || scopedState.answers.some(item => item.projectId === project.id && item.learnerId === learner.id && !!item.text.trim());
      const cell: RoomProjectCell = {
        projectId: project.id,
        learnerId: learner.id,
        total: stats.total,
        completed: stats.completed,
        percent: stats.total ? stats.percent : null,
        minutes: stats.minutes,
        weekMinutes: weekSessions.reduce((sum, session) => sum + session.minutes, 0),
        todayMinutes: sessions.filter(session => session.date === today).reduce((sum, session) => sum + session.minutes, 0),
        studyDays: dates.size,
        weekStudyDays: weekDates.size,
        status: stats.total > 0 && stats.completed === stats.total ? "completed" : hasWork ? "in-progress" : "not-started",
      };
      const item = { cell, dates, weekDates };
      allCells.push(item);
      cellsByLearner.get(learner.id)!.push(item);
      return item;
    });
    return { project, members: projectCells.map(item => item.cell), totals: aggregate(projectCells) };
  });
  const learners = state.learners.map(learner => {
    const enrolledCells = cellsByLearner.get(learner.id)!;
    const cells: Record<string, RoomProjectCell | null> = Object.fromEntries(visibleProjects.map(project => [project.id, null]));
    enrolledCells.forEach(item => { cells[item.cell.projectId] = item.cell; });
    return {
      learner,
      cells,
      totals: aggregate(enrolledCells),
      projectCount: enrolledCells.length,
      completedProjects: enrolledCells.filter(item => item.cell.status === "completed").length,
      inProgressProjects: enrolledCells.filter(item => item.cell.status === "in-progress").length,
      notStartedProjects: enrolledCells.filter(item => item.cell.status === "not-started").length,
    };
  });
  return {
    projects,
    learners,
    totals: {
      ...aggregate(allCells),
      projectCount: projects.length,
      memberCount: learners.length,
      participatingMemberCount: learners.filter(learner => learner.projectCount > 0).length,
    },
  };
}
