// 섹션(기수/과정) 저장소. Supabase 활성 + cohorts 테이블이 있으면 그걸 쓰고,
// 테이블이 없거나 오류면 인메모리로 자동 폴백한다(마이그레이션 전에도 안 깨짐).

import "server-only";
import crypto from "node:crypto";
import { getSupabase } from "./supabase";
import { siteConfig } from "./site-config";

export interface Cohort {
  id: string;
  slug: string;
  name: string;
  scoringOpen: boolean;
  rankRevealed: boolean;
  minRaters: number; // 순위에 들기 위한 최소 채점 인원
  createdAt: string;
  // --- 공군 AX 1일 특강 (SUPABASE_MIGRATION_AIRFORCE.md) ---
  sessionNo: number | null; // 회차 번호 1~5
  heldOn: string | null; // 교육일 YYYY-MM-DD
  location: string | null; // 도시명만
  joinCodeHash: string | null; // 입장 코드 해시 (null = 수동 수락)
  submitDueAt: string | null; // 작품 등록 마감 표시용
  scoreDueAt: string | null; // 채점 마감 표시용
}

export type CohortDetails = Pick<Cohort, "sessionNo" | "heldOn" | "location" | "submitDueAt" | "scoreDueAt">;

export const DEFAULT_MIN_RATERS = 3;

export const sortieSlug = (n: number) => `sortie-${String(n).padStart(2, "0")}`;
export const sortieName = (n: number, city: string) => `${siteConfig.sortieLabel(n)} · ${city}`;

// 인메모리 폴백 기본값: 5개 회차 (첫 회차 id 는 예전 더미 데이터와 맞춰 c1)
const DEFAULT_COHORTS: Cohort[] = siteConfig.sorties.map((s) => ({
  id: `c${s.no}`,
  slug: sortieSlug(s.no),
  name: sortieName(s.no, s.city),
  scoringOpen: true,
  rankRevealed: false,
  minRaters: DEFAULT_MIN_RATERS,
  createdAt: `${s.date}T00:00:00.000Z`,
  sessionNo: s.no,
  heldOn: s.date,
  location: s.city,
  joinCodeHash: null,
  submitDueAt: null,
  scoreDueAt: null,
}));

const g = globalThis as unknown as { __vgCohorts?: Cohort[] };
const mem: Cohort[] = g.__vgCohorts ?? (g.__vgCohorts = DEFAULT_COHORTS.map((c) => ({ ...c })));

type Row = {
  id: string;
  slug: string;
  name: string;
  scoring_open: boolean;
  rank_revealed: boolean;
  min_raters?: number | null; // 마이그레이션 전에는 없을 수 있음
  created_at: string;
  session_no?: number | null;
  held_on?: string | null;
  location?: string | null;
  join_code_hash?: string | null;
  submit_due_at?: string | null;
  score_due_at?: string | null;
};
const fromRow = (r: Row): Cohort => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  scoringOpen: r.scoring_open,
  rankRevealed: r.rank_revealed,
  minRaters: r.min_raters ?? DEFAULT_MIN_RATERS,
  createdAt: r.created_at,
  sessionNo: r.session_no ?? null,
  heldOn: r.held_on ?? null,
  location: r.location ?? null,
  joinCodeHash: r.join_code_hash ?? null,
  submitDueAt: r.submit_due_at ?? null,
  scoreDueAt: r.score_due_at ?? null,
});

export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `section-${Date.now().toString(36)}`;
}

export async function listCohorts(): Promise<Cohort[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("cohorts")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error && data) return (data as Row[]).map(fromRow);
    } catch {
      /* 테이블 없음/네트워크 → 폴백 */
    }
  }
  return [...mem].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getCohortBySlug(slug: string): Promise<Cohort | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("cohorts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!error) return data ? fromRow(data as Row) : null;
    } catch {
      /* 폴백 */
    }
  }
  return mem.find((c) => c.slug === slug) ?? null;
}

export async function getCohortById(id: string): Promise<Cohort | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("cohorts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error) return data ? fromRow(data as Row) : null;
    } catch {
      /* 폴백 */
    }
  }
  return mem.find((c) => c.id === id) ?? null;
}

export async function createCohort(
  name: string,
  slugInput?: string,
  details: Partial<CohortDetails> = {}
): Promise<Cohort> {
  const cohort: Cohort = {
    sessionNo: null,
    heldOn: null,
    location: null,
    joinCodeHash: null,
    submitDueAt: null,
    scoreDueAt: null,
    ...details,
    id: `co_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    slug: slugify(slugInput || name),
    name: name.trim(),
    scoringOpen: true,
    rankRevealed: false,
    minRaters: DEFAULT_MIN_RATERS,
    createdAt: new Date().toISOString(),
  };
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("cohorts").insert({
        id: cohort.id,
        slug: cohort.slug,
        name: cohort.name,
        scoring_open: true,
        rank_revealed: false,
        created_at: cohort.createdAt,
        // 마이그레이션 전 DB 와도 호환되도록 값이 있을 때만 보낸다
        ...detailsToRow(details),
      });
      if (!error) return cohort;
    } catch {
      /* 폴백 */
    }
  }
  mem.push(cohort);
  return cohort;
}

export async function setCohortScoringOpen(
  id: string,
  v: boolean
): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb
        .from("cohorts")
        .update({ scoring_open: v })
        .eq("id", id);
      if (!error) return;
    } catch {
      /* 폴백 */
    }
  }
  const c = mem.find((x) => x.id === id);
  if (c) c.scoringOpen = v;
}

export async function setCohortRankRevealed(
  id: string,
  v: boolean
): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb
        .from("cohorts")
        .update({ rank_revealed: v })
        .eq("id", id);
      if (!error) return;
    } catch {
      /* 폴백 */
    }
  }
  const c = mem.find((x) => x.id === id);
  if (c) c.rankRevealed = v;
}

export async function setCohortMinRaters(id: string, n: number): Promise<void> {
  const v = Math.max(1, Math.min(50, Math.round(n)));
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("cohorts").update({ min_raters: v }).eq("id", id);
    if (!error) return;
    if (process.env.VERCEL) {
      throw new Error("cohorts.min_raters 칸이 없습니다 (SUPABASE_MIGRATION_QC.md 의 SQL 실행 필요)");
    }
  }
  const c = mem.find((x) => x.id === id);
  if (c) c.minRaters = v;
}

// ---- 공군 AX: 회차 정보 · 입장 코드 ----

function detailsToRow(d: Partial<CohortDetails>): Partial<Row> {
  const row: Partial<Row> = {};
  if (d.sessionNo !== undefined) row.session_no = d.sessionNo;
  if (d.heldOn !== undefined) row.held_on = d.heldOn;
  if (d.location !== undefined) row.location = d.location;
  if (d.submitDueAt !== undefined) row.submit_due_at = d.submitDueAt;
  if (d.scoreDueAt !== undefined) row.score_due_at = d.scoreDueAt;
  return row;
}

const MIGRATION_HINT = "cohorts 테이블에 회차 칸이 없습니다 (SUPABASE_MIGRATION_AIRFORCE.md 의 SQL 실행 필요)";

async function patchCohort(id: string, row: Partial<Row>, memPatch: Partial<Cohort>): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("cohorts").update(row).eq("id", id);
    if (!error) return;
    if (process.env.VERCEL) throw new Error(MIGRATION_HINT);
  }
  const c = mem.find((x) => x.id === id);
  if (c) Object.assign(c, memPatch);
}

export async function updateCohortDetails(id: string, d: Partial<CohortDetails>): Promise<void> {
  await patchCohort(id, detailsToRow(d), d);
}

// 입장 코드: 6자리 숫자. 원문은 저장하지 않고 회차 id 를 소금으로 한 scrypt 해시만 저장한다.
export const JOIN_CODE_RE = /^\d{6}$/;

function hashJoinCode(cohortId: string, code: string): string {
  return "scrypt$" + crypto.scryptSync(code, `vg-join:${cohortId}`, 32).toString("hex");
}

export async function setCohortJoinCode(id: string, code: string | null): Promise<void> {
  const hash = code ? hashJoinCode(id, code) : null;
  await patchCohort(id, { join_code_hash: hash }, { joinCodeHash: hash });
}

export function verifyJoinCode(cohort: Cohort, code: string): boolean {
  if (!cohort.joinCodeHash || !JOIN_CODE_RE.test(code)) return false;
  const a = Buffer.from(hashJoinCode(cohort.id, code));
  const b = Buffer.from(cohort.joinCodeHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
