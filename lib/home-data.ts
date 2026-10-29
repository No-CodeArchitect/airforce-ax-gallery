// 홈·회차 기록 화면용 집계: 실데이터 숫자 밴드, 회차별 최우수 작품, 일정 띠의 회차 매핑.
// 기존 저장소·순위 로직(lib/ranking.ts)은 읽기만 하고 수정하지 않는다.

import "server-only";
import type { Project } from "./types";
import { listCohorts, sortieSlug, type Cohort } from "./cohorts-store";
import { getProjects } from "./projects-data";
import { listMemberships } from "./memberships-store";
import { allScoreRows } from "./scores-store";
import { listAllComments } from "./comments-store";
import { rankProjects } from "./ranking";
import { siteConfig, type Sortie } from "./site-config";

export interface DayStats {
  projects: number; // 공개된 작품
  pilots: number; // 회차 가입이 수락된 장병
  feedback: number; // 댓글 + 채점 수
}

export async function getDayStats(projects: Project[], cohorts: Cohort[]): Promise<DayStats> {
  const ids = new Set(projects.map((p) => p.id));
  const [scores, comments, members] = await Promise.all([
    allScoreRows().catch(() => []),
    listAllComments(ids).catch(() => []),
    Promise.all(cohorts.map((c) => listMemberships(c.id).catch(() => []))),
  ]);
  const pilots = members.flat().filter((m) => m.status === "approved").length;
  return {
    projects: projects.length,
    pilots: Math.max(pilots, new Set(projects.map((p) => p.authorId)).size),
    feedback: scores.filter((s) => ids.has(s.projectId)).length + comments.filter((c) => !c.isHidden).length,
  };
}

// 회차 ↔ 일정 매핑: 회차 번호(session_no) 우선, 없으면 sortie-0n 슬러그.
export function cohortForSortie(cohorts: Cohort[], s: Sortie): Cohort | undefined {
  return cohorts.find((c) => c.sessionNo === s.no) ?? cohorts.find((c) => c.slug === sortieSlug(s.no));
}

export function sortieOf(c: Cohort): Sortie | undefined {
  return siteConfig.sorties.find((s) => s.no === c.sessionNo || sortieSlug(s.no) === c.slug);
}

// 순위가 공개된 회차의 1위 작품 (평균이 같으면 공동 최우수)
export async function aceOf(c: Cohort, projects?: Project[]): Promise<Project[]> {
  if (!c.rankRevealed) return [];
  const ranked = await rankProjects(projects ?? (await getProjects(c.id)), c.minRaters);
  const top = ranked.find((p) => p.rank === 1);
  if (!top || top.avgScore === null) return [];
  return ranked.filter((p) => p.rank !== null && p.avgScore === top.avgScore);
}

export interface AceEntry {
  cohort: Cohort;
  sortie: Sortie | undefined;
  aces: Project[];
}

export async function getAceBoard(cohorts: Cohort[], all: Project[]): Promise<AceEntry[]> {
  const out: AceEntry[] = [];
  for (const c of cohorts.filter((x) => x.rankRevealed)) {
    const aces = await aceOf(c, all.filter((p) => p.cohortId === c.id));
    if (aces.length) out.push({ cohort: c, sortie: sortieOf(c), aces });
  }
  return out.sort((a, b) => (a.cohort.sessionNo ?? 99) - (b.cohort.sessionNo ?? 99));
}

// "작품 보러 가기" 대상: 오늘 회차 → 가장 최근 지난 회차 → 다음 회차 → 회차 목록
export function featuredCohort(cohorts: Cohort[], today: string): Cohort | undefined {
  const dated = cohorts
    .map((c) => ({ c, date: c.heldOn ?? sortieOf(c)?.date ?? null }))
    .filter((x): x is { c: Cohort; date: string } => !!x.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    [...dated].reverse().find((x) => x.date <= today)?.c ?? dated[0]?.c ?? cohorts[0]
  );
}
