import { getProjects } from "@/lib/projects-data";
import { rankProjects } from "@/lib/ranking";
import { setMinRatersAction } from "@/lib/admin-actions";
import { loadMembers, requireCohort } from "@/lib/admin-data";
import { Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// 회차 > 순위: 관리자 전용 미리보기 + 최소 채점 인원
export default async function CohortRankingPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireCohort((await params).id);
  const [m, projects] = await Promise.all([loadMembers(c.id), getProjects(c.id)]);
  const ranked = (await rankProjects(projects, c.minRaters))
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
    .map((p) => ({ ...p, authorName: m.who(p.authorId, p.authorName) }));

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="최소 채점 인원"
        desc={`채점한 사람이 ${c.minRaters}명 미만인 작품은 순위에서 빠지고 「채점 부족」으로 표시됩니다. 본인 작품은 채점할 수 없으니 (교육생 수 − 1)보다 크게 잡지 마세요.`}
      >
        <form action={setMinRatersAction} className="flex items-center gap-2 text-sm text-white/70">
          <input type="hidden" name="cohortId" value={c.id} />
          <input
            name="minRaters"
            type="number"
            min={1}
            max={50}
            defaultValue={c.minRaters}
            className="w-20 rounded-lg border border-white/15 bg-surface-soft px-3 py-2 text-white outline-none focus:border-accent"
          />
          명
          <button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/20">저장</button>
        </form>
      </Panel>

      <Panel
        title="순위 미리보기 (관리자 전용)"
        desc={c.rankRevealed ? "현재 교육생에게도 공개된 상태입니다." : "교육생에게는 아직 보이지 않습니다. 「운영 설정」 탭에서 공개할 수 있습니다."}
      >
        {ranked.length === 0 ? (
          <p className="text-sm text-white/60">아직 공개된 작품이 없습니다.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-white/60">
                <tr className="border-b border-white/10">
                  <th className="w-12 py-2 pr-3 font-semibold">순위</th>
                  <th className="py-2 pr-3 font-semibold">작품</th>
                  <th className="py-2 pr-3 text-right font-semibold">교육생 평균</th>
                  <th className="py-2 pr-3 text-right font-semibold">채점 인원</th>
                  <th className="py-2 text-right font-semibold">AI (완성도/창의성)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {ranked.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-3 font-mono font-bold text-accent">{p.rank ?? "-"}</td>
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-white">{p.title}</div>
                      <div className="text-xs text-white/60">{p.authorName}</div>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono">{p.avgScore !== null ? p.avgScore.toFixed(2) : "-"}</td>
                    <td className={`py-2 pr-3 text-right font-mono ${p.raterCount < c.minRaters ? "text-amber-300" : ""}`}>
                      {p.raterCount}
                      {p.raterCount < c.minRaters && <span className="ml-1 font-sans text-xs">부족</span>}
                    </td>
                    <td className="py-2 text-right font-mono text-white/70">
                      {p.aiReview.scoreCompleteness}/{p.aiReview.scoreCreativity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
