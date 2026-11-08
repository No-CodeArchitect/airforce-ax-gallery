import Link from "next/link";
import { listCohorts } from "@/lib/cohorts-store";
import { listRecords } from "@/lib/projects-data";
import { distinctRaterCountFor } from "@/lib/scores-store";
import { listEduRequests } from "@/lib/edu-requests-store";
import { hasApiKey } from "@/lib/pipeline/ai";
import { ssoEnabled } from "@/lib/google-oauth";
import { loadMembers } from "@/lib/admin-data";
import { shortDate, todayKst } from "@/lib/site-config";
import { PageHeader, Panel, Stat, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// 대시보드: 회차별 현황 한눈에 + 지금 처리할 일
export default async function AdminDashboard() {
  const today = todayKst();
  const cohorts = [...(await listCohorts())].sort(
    (a, b) => (a.sessionNo ?? 99) - (b.sessionNo ?? 99) || a.createdAt.localeCompare(b.createdAt)
  );
  const rows = await Promise.all(
    cohorts.map(async (c) => {
      const [m, records] = await Promise.all([loadMembers(c.id), listRecords(c.id)]);
      const published = records.filter((r) => r.ai);
      const raters = await distinctRaterCountFor(new Set(published.map((r) => r.id)));
      return {
        c,
        students: m.students.length,
        pending: m.pending.length,
        submitted: records.length,
        published: published.length,
        queue: records.filter((r) => r.needsAnalysis || r.status === "failed").length,
        raters,
      };
    })
  );
  const requests = await listEduRequests();
  const newRequests = requests.filter((r) => r.status === "new").length;

  const todos: { href: string; text: string }[] = [
    ...rows
      .filter((r) => r.pending > 0)
      .map((r) => ({ href: `/admin/cohorts/${encodeURIComponent(r.c.id)}/members`, text: `${r.c.name} — 가입 수락 대기 ${r.pending}명` })),
    ...rows
      .filter((r) => r.queue > 0)
      .map((r) => ({ href: `/admin/cohorts/${encodeURIComponent(r.c.id)}/projects`, text: `${r.c.name} — AI 분석 대기·실패 ${r.queue}건` })),
    ...(newRequests > 0 ? [{ href: "/admin/requests", text: `새 교육 신청 ${newRequests}건` }] : []),
  ];

  const sum = (k: "students" | "published" | "pending") => rows.reduce((n, r) => n + r[k], 0);

  return (
    <>
      <PageHeader title="대시보드" desc="회차별 현황과 지금 처리할 일을 모았습니다. 회차 이름을 누르면 해당 회차 운영 화면으로 갑니다." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="회차" value={`${cohorts.length}개`} />
        <Stat label="수락된 교육생" value={`${sum("students")}명`} />
        <Stat label="공개된 작품" value={`${sum("published")}개`} />
        <Stat label="수락 대기" value={`${sum("pending")}명`} tone={sum("pending") > 0 ? "warn" : undefined} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <Panel title="처리할 일">
          {todos.length === 0 ? (
            <p className="text-sm text-white/60">지금 처리할 일이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todos.map((t) => (
                <li key={t.href + t.text}>
                  <Link
                    href={t.href}
                    className="flex items-center justify-between rounded-lg bg-signal/10 px-3 py-2 text-sm ring-1 ring-signal/30 hover:bg-signal/15"
                  >
                    <span className="text-white">{t.text}</span>
                    <span className="text-xs font-semibold text-signal">처리하기 →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {(!hasApiKey() || !ssoEnabled()) && (
            <ul className="mt-3 flex flex-col gap-1 text-xs text-amber-300">
              {!hasApiKey() && <li>⚠ ANTHROPIC_API_KEY 미설정 — AI 요약·심사평이 임시(규칙 기반) 결과로 나옵니다.</li>}
              {!ssoEnabled() && <li>⚠ 구글 로그인 미설정 — 임시 비밀번호 로그인 중입니다.</li>}
            </ul>
          )}
        </Panel>

        <Panel
          title="회차별 현황"
          actions={
            <Link href="/admin/cohorts" className="text-xs font-semibold text-accent hover:underline">
              회차 추가 →
            </Link>
          }
        >
          {rows.length === 0 ? (
            <p className="text-sm text-white/60">아직 회차가 없습니다.</p>
          ) : (
            <div className="-mx-5 overflow-x-auto px-5">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-3 font-semibold">회차</th>
                    <th className="py-2 pr-3 font-semibold">교육일</th>
                    <th className="py-2 pr-3 font-semibold">상태</th>
                    <th className="py-2 pr-3 text-right font-semibold">교육생</th>
                    <th className="py-2 pr-3 text-right font-semibold">대기</th>
                    <th className="py-2 pr-3 text-right font-semibold">작품(공개/등록)</th>
                    <th className="py-2 text-right font-semibold">채점 참여</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.map((r) => (
                    <tr key={r.c.id} className={r.c.heldOn === today ? "bg-signal/5" : ""}>
                      <td className="py-2.5 pr-3">
                        <Link
                          href={`/admin/cohorts/${encodeURIComponent(r.c.id)}`}
                          className="font-bold text-white hover:text-accent"
                        >
                          {r.c.name}
                        </Link>
                        {r.c.heldOn === today && <span className="ml-2 text-xs font-bold text-signal">오늘</span>}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-white/70">{r.c.heldOn ? shortDate(r.c.heldOn) : "-"}</td>
                      <td className="py-2.5 pr-3">
                        <StatusPill rankRevealed={r.c.rankRevealed} scoringOpen={r.c.scoringOpen} />
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono">{r.students}</td>
                      <td className={`py-2.5 pr-3 text-right font-mono ${r.pending ? "font-bold text-signal" : "text-white/60"}`}>
                        {r.pending}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono">
                        {r.published}/{r.submitted}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {r.raters}/{r.students}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
