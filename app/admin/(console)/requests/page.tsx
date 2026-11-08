import Link from "next/link";
import { listEduRequests, type EduRequestStatus } from "@/lib/edu-requests-store";
import { deleteEduRequestAction, setEduRequestStatusAction } from "@/lib/edu-request-actions";
import { PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const EDU_STATUS: Record<EduRequestStatus, { label: string; tone: string }> = {
  new: { label: "신규", tone: "bg-signal/20 text-signal" },
  contacted: { label: "연락함", tone: "bg-sky-500/20 text-sky-300" },
  done: { label: "완료", tone: "bg-white/10 text-white/60" },
};

// 부대 AI 입문 특강 신청 목록
export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const filter = (await searchParams).status as EduRequestStatus | undefined;
  const all = await listEduRequests();
  const list = filter && filter in EDU_STATUS ? all.filter((r) => r.status === filter) : all;
  const count = (s: EduRequestStatus) => all.filter((r) => r.status === s).length;

  const tab = (href: string, label: string, active: boolean) => (
    <Link
      key={href}
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-accent text-on-accent" : "bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader
        title="교육 신청"
        desc="홈·갤러리 배너의 「교육 신청하기」로 들어온 부대 AI 입문 특강 신청입니다. 연락처 등 개인정보가 있으니 상담이 끝나면 삭제하세요(보유 기간: 상담 종료 후 1년)."
        actions={
          <Link href="/apply" target="_blank" className="text-xs font-semibold text-accent hover:underline">
            신청 페이지 ↗
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {tab("/admin/requests", `전체 ${all.length}`, !filter)}
        {(Object.keys(EDU_STATUS) as EduRequestStatus[]).map((s) =>
          tab(`/admin/requests?status=${s}`, `${EDU_STATUS[s].label} ${count(s)}`, filter === s)
        )}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-surface px-5 py-8 text-center text-sm text-white/60 ring-1 ring-white/10">
          해당하는 신청이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl bg-surface p-4 text-sm ring-1 ${r.status === "new" ? "ring-signal/40" : "ring-white/10"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white">{r.unit}</span>
                <span className="text-white/70">{r.contactName}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${EDU_STATUS[r.status].tone}`}>
                  {EDU_STATUS[r.status].label}
                </span>
                <span className="ml-auto text-xs text-white/60">
                  {new Date(r.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
                <span>☎ {r.phone}</span>
                {r.email && <span>✉ {r.email}</span>}
                {r.headcount && <span>인원 {r.headcount}</span>}
                {r.period && <span>시기 {r.period}</span>}
              </div>
              {r.message && (
                <p className="mt-2 whitespace-pre-line rounded-lg bg-base px-3 py-2 text-xs leading-relaxed text-white/75">
                  {r.message}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1">
                {(Object.keys(EDU_STATUS) as EduRequestStatus[])
                  .filter((st) => st !== r.status)
                  .map((st) => (
                    <form key={st} action={setEduRequestStatusAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={st} />
                      <button className="rounded bg-white/10 px-2 py-1 text-xs text-white/75 hover:bg-white/20">
                        → {EDU_STATUS[st].label}
                      </button>
                    </form>
                  ))}
                <form action={deleteEduRequestAction} className="ml-auto">
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded px-2 py-1 text-xs text-white/60 hover:text-red-400">삭제</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
