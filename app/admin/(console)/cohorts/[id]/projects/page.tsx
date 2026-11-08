import { listRecords } from "@/lib/projects-data";
import { hasApiKey } from "@/lib/pipeline/ai";
import { loadMembers, requireCohort } from "@/lib/admin-data";
import SubmissionsPanel, { type SubmissionRow } from "@/components/SubmissionsPanel";

export const dynamic = "force-dynamic";

// 회차 > 작품 · AI 분석: 등록 현황, 미제출자, 분석 실행, 썸네일 교체·삭제
export default async function CohortProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireCohort((await params).id);
  const [m, records] = await Promise.all([loadMembers(c.id), listRecords(c.id)]);
  const submitted = new Set(records.map((r) => r.authorId));
  const missing = m.students.filter((s) => !submitted.has(s.id)).map((s) => m.who(s.id, s.nickname));
  const rows: SubmissionRow[] = records.map((r) => ({
    id: r.id,
    title: r.submission.title,
    authorName: m.who(r.authorId, r.authorName),
    liveUrl: r.submission.liveUrl,
    status: r.status,
    needsAnalysis: r.needsAnalysis,
    published: !!r.ai,
    mock: !!r.ai?.mock,
    thumbUrl: r.thumbUrl,
    error: r.error,
    updatedAt: r.updatedAt,
  }));

  return (
    <section className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
      <SubmissionsPanel rows={rows} missing={missing} rosterCount={m.students.length} apiReady={hasApiKey()} />
    </section>
  );
}
