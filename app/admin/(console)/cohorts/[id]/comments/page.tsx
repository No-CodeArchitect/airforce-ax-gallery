import { getProjects } from "@/lib/projects-data";
import { listAllComments } from "@/lib/comments-store";
import { moderateComment } from "@/lib/admin-actions";
import { requireCohort } from "@/lib/admin-data";
import { Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// 회차 > 댓글: 모더레이션 (숨기기·복구)
export default async function CohortCommentsPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireCohort((await params).id);
  const projects = await getProjects(c.id);
  const titleOf = new Map(projects.map((p) => [p.id, p.title]));
  const comments = await listAllComments(new Set(titleOf.keys()));
  const hidden = comments.filter((cm) => cm.isHidden).length;

  return (
    <Panel
      title={`댓글 ${comments.length}개`}
      badge={hidden ? <span className="text-xs text-red-300">숨김 {hidden}</span> : undefined}
      desc="공개 화면에는 AI 닉네임만 보입니다. 부적절한 댓글은 숨기면 바로 사라지고, 복구할 수 있습니다."
    >
      {comments.length === 0 ? (
        <p className="text-sm text-white/60">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.map((cm) => (
            <li
              key={cm.id}
              className={`rounded-lg border px-3 py-2 text-sm ${
                cm.isHidden ? "border-red-500/30 bg-red-500/10" : "border-white/10"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-white/60">
                  <span className="font-semibold text-white/80">{cm.aiNickname}</span> · 실명 {cm.authorName}
                  {cm.isAuthorReply && " · 제작자"}
                  {cm.isHidden && " · (숨김)"}
                </span>
                <span className="text-xs text-accent/80">→ {titleOf.get(cm.projectId) ?? cm.projectId}</span>
                <span className="ml-auto text-xs text-white/50">
                  {new Date(cm.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                </span>
                <form action={moderateComment}>
                  <input type="hidden" name="id" value={cm.id} />
                  <input type="hidden" name="hidden" value={(!cm.isHidden).toString()} />
                  <button
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      cm.isHidden ? "bg-accent text-on-accent hover:bg-accent-soft" : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {cm.isHidden ? "복구" : "숨기기"}
                  </button>
                </form>
              </div>
              <p className="mt-1 text-white/85">{cm.body}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
