// 관리자 화면용 회차 데이터 묶음. 페이지마다 필요한 것만 골라 쓴다.
// 관리자 화면에서는 닉네임 옆에 실명을 함께 보여 준다.

import "server-only";
import { notFound } from "next/navigation";
import { getCohortById, type Cohort } from "./cohorts-store";
import { listMemberships, type Membership } from "./memberships-store";

export async function requireCohort(id: string): Promise<Cohort> {
  const c = await getCohortById(decodeURIComponent(id));
  if (!c) notFound();
  return c;
}

export interface CohortMembers {
  all: Membership[];
  students: Membership[];
  pending: Membership[];
  rejected: Membership[];
  // 같은 실명으로 가입한 다른 계정 (부계정 의심) — 동명이인일 수 있어 경고만 한다
  sameName: (m: Membership) => Membership[];
  // "닉네임 (실명)"
  who: (id: string, nick: string) => string;
}

export async function loadMembers(cohortId: string): Promise<CohortMembers> {
  const all = await listMemberships(cohortId);
  const normName = (n: string) => n.replace(/\s+/g, "");
  const realNameOf = new Map(all.map((m) => [m.id, m.realName]));
  return {
    all,
    students: all.filter((m) => m.status === "approved"),
    pending: all.filter((m) => m.status === "pending"),
    rejected: all.filter((m) => m.status === "rejected"),
    sameName: (m) =>
      all.filter((o) => o.id !== m.id && o.status !== "rejected" && normName(o.realName) === normName(m.realName)),
    who: (id, nick) => (realNameOf.has(id) ? `${nick} (${realNameOf.get(id)})` : nick),
  };
}

// ISO → datetime-local 입력값(KST)
export function toKstLocal(iso: string | null): string {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 16);
}
