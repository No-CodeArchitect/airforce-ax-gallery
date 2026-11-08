import Link from "next/link";
import { listRecords, getProjects } from "@/lib/projects-data";
import { listAllComments } from "@/lib/comments-store";
import { loadMembers, requireCohort } from "@/lib/admin-data";
import { shortDate } from "@/lib/site-config";
import { StatusPill } from "@/components/admin/ui";
import CohortTabs from "@/components/admin/CohortTabs";

export const dynamic = "force-dynamic";

// 회차 상세 공통: 제목·상태·바로가기 + 탭
export default async function CohortLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const c = await requireCohort(id);
  const [m, records, projects] = await Promise.all([loadMembers(c.id), listRecords(c.id), getProjects(c.id)]);
  const comments = await listAllComments(new Set(projects.map((p) => p.id)));
  const base = `/admin/cohorts/${encodeURIComponent(c.id)}`;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-black tracking-tight text-white">{c.name}</h1>
        <StatusPill rankRevealed={c.rankRevealed} scoringOpen={c.scoringOpen} />
        {c.heldOn && <span className="font-mono text-sm text-white/60">{shortDate(c.heldOn)}</span>}
        <div className="ml-auto flex gap-2 text-xs font-semibold">
          <Link href={`/g/${c.slug}`} target="_blank" className="rounded-lg bg-white/10 px-3 py-1.5 text-white/80 hover:bg-white/20">
            갤러리 ↗
          </Link>
          <Link href={`/g/${c.slug}/present`} target="_blank" className="rounded-lg bg-white/10 px-3 py-1.5 text-white/80 hover:bg-white/20">
            발표 화면 ↗
          </Link>
        </div>
      </div>
      <CohortTabs
        base={base}
        counts={{
          pending: m.pending.length,
          queue: records.filter((r) => r.needsAnalysis || r.status === "failed").length,
          comments: comments.length,
        }}
      />
      {children}
    </>
  );
}
