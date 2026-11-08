import { approveAllAction, deleteMemberAction } from "@/lib/admin-actions";
import { loadMembers, requireCohort } from "@/lib/admin-data";
import { MemberButton, Panel, SameNameWarning } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// 회차 > 교육생: 가입 수락 대기 · 수락된 교육생 · 거절된 신청
export default async function CohortMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireCohort((await params).id);
  const m = await loadMembers(c.id);

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="수락 대기"
        badge={
          m.pending.length > 0 ? (
            <span className="rounded-full bg-signal px-2 py-0.5 text-xs font-bold text-on-accent">{m.pending.length}</span>
          ) : undefined
        }
        desc={
          c.joinCodeHash
            ? "입장 코드를 맞게 넣은 사람은 자동으로 수락되어 여기에 나오지 않습니다. 코드 없이 신청한 사람만 대기로 남습니다."
            : "실명을 명단과 대조해 수락하세요. 사이트에는 닉네임만 표시됩니다."
        }
        actions={
          m.pending.length > 1 ? (
            <form action={approveAllAction}>
              <input type="hidden" name="cohortId" value={c.id} />
              <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-on-accent hover:bg-accent-soft">
                {m.pending.length}명 전체 수락
              </button>
            </form>
          ) : undefined
        }
      >
        {m.pending.length === 0 ? (
          <p className="text-sm text-white/60">대기 중인 신청이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {m.pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="font-bold text-white">{p.realName}</span>
                <span className="text-white/60">닉네임 {p.nickname}</span>
                <span className="text-xs text-white/60">{p.email}</span>
                <SameNameWarning others={m.sameName(p)} />
                <span className="ml-auto flex gap-1">
                  <MemberButton id={p.id} status="approved" label="수락" primary />
                  <MemberButton id={p.id} status="rejected" label="거절" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`교육생 ${m.students.length}명`}>
        {m.students.length === 0 ? (
          <p className="text-sm text-white/60">
            아직 가입한 교육생이 없습니다. 「운영 설정」 탭의 입장 링크·QR을 나눠 주세요.
          </p>
        ) : (
          <div className="-mx-5 overflow-x-auto px-5">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs text-white/60">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-3 font-semibold">닉네임</th>
                  <th className="py-2 pr-3 font-semibold">실명</th>
                  <th className="py-2 pr-3 font-semibold">구글 계정</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {m.students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 pr-3 font-semibold text-white">{s.nickname}</td>
                    <td className="py-2 pr-3 text-white/80">
                      {s.realName} <SameNameWarning others={m.sameName(s)} />
                    </td>
                    <td className="py-2 pr-3 text-xs text-white/60">{s.email}</td>
                    <td className="py-2 text-right">
                      <MemberButton id={s.id} status="rejected" label="수락 취소" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {m.rejected.length > 0 && (
        <Panel title={`거절·취소된 신청 ${m.rejected.length}건`} desc="기록을 삭제하면 그 사람이 다시 가입 신청할 수 있습니다.">
          <ul className="divide-y divide-white/10">
            {m.rejected.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="text-white/80">{r.realName}</span>
                <span className="text-white/60">닉네임 {r.nickname}</span>
                <span className="text-xs text-white/60">{r.email}</span>
                <span className="ml-auto flex gap-1">
                  <MemberButton id={r.id} status="approved" label="수락" />
                  <form action={deleteMemberAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded px-2 py-0.5 text-xs text-white/60 hover:text-red-400">기록 삭제</button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
