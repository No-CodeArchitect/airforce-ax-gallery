import Link from "next/link";
import { listCohorts } from "@/lib/cohorts-store";
import { createCohortAction } from "@/lib/admin-actions";
import { shortDate } from "@/lib/site-config";
import { PageHeader, Panel, StatusPill, adminInput } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  const cohorts = [...(await listCohorts())].sort(
    (a, b) => (a.sessionNo ?? 99) - (b.sessionNo ?? 99) || a.createdAt.localeCompare(b.createdAt)
  );

  return (
    <>
      <PageHeader title="회차" desc="회차별로 교육생·작품·채점·순위가 완전히 분리됩니다. 각 회차는 고유 링크로 입장합니다." />

      <div className="flex flex-col gap-6">
        <Panel title="회차 목록">
          {cohorts.length === 0 ? (
            <p className="text-sm text-white/60">아직 회차가 없습니다. 아래에서 추가하세요.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {cohorts.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/cohorts/${encodeURIComponent(c.id)}`}
                    className="flex flex-wrap items-center gap-3 py-3 hover:text-accent"
                  >
                    <span className="font-bold text-white">{c.name}</span>
                    <StatusPill rankRevealed={c.rankRevealed} scoringOpen={c.scoringOpen} />
                    {c.joinCodeHash && <span className="text-xs text-emerald-300">입장 코드 설정됨</span>}
                    <span className="ml-auto font-mono text-xs text-white/60">
                      {c.heldOn ? shortDate(c.heldOn) : ""} · /g/{c.slug}
                    </span>
                    <span className="text-xs font-semibold text-accent">관리 →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="새 회차 추가"
          desc={
            <>
              5개 회차는 이미 만들어 두었습니다. 추가 회차가 필요할 때만 쓰세요. 링크 주소를 비우면 이름에서 자동으로
              만듭니다.
            </>
          }
        >
          <form action={createCohortAction} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <input name="name" required placeholder="회차 이름 (예: 6회차 · 청주)" className={`${adminInput} col-span-2 sm:col-span-3`} />
            <input name="slug" placeholder="링크 주소 (선택, 예: sortie-06)" className={`${adminInput} col-span-2 sm:col-span-3`} />
            <input name="sessionNo" type="number" min={1} max={99} placeholder="회차 번호" className={adminInput} />
            <input name="heldOn" type="date" aria-label="교육일" className={adminInput} />
            <input name="location" maxLength={20} placeholder="도시명" className={`${adminInput} col-span-2`} />
            <button className="col-span-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-soft">
              회차 추가
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}
