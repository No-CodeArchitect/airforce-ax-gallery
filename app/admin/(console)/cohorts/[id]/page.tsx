import { getProjects } from "@/lib/projects-data";
import { distinctRaterCountFor } from "@/lib/scores-store";
import {
  setJoinCodeAction,
  toggleRankRevealed,
  toggleScoringOpen,
  updateCohortDetailsAction,
} from "@/lib/admin-actions";
import { loadMembers, requireCohort, toKstLocal } from "@/lib/admin-data";
import { requestOrigin } from "@/lib/inapp";
import JoinQr from "@/components/JoinQr";
import { Panel, Stat, adminInput } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// 회차 > 운영 설정: 현황, 채점·순위 토글, 회차 정보, 입장 코드·QR
export default async function CohortSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const c = await requireCohort((await params).id);
  const [m, projects, origin] = await Promise.all([loadMembers(c.id), getProjects(c.id), requestOrigin()]);
  const raters = await distinctRaterCountFor(new Set(projects.map((p) => p.id)));
  const joinUrl = `${origin}/g/${c.slug}/join`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="교육생" value={`${m.students.length}명`} />
        <Stat label="수락 대기" value={`${m.pending.length}명`} tone={m.pending.length ? "warn" : undefined} />
        <Stat label="공개 작품" value={`${projects.length}개`} />
        <Stat label="채점 참여" value={`${raters}/${m.students.length}`} />
      </div>

      {/* 운영 토글 */}
      <Panel title="채점 · 순위" desc="채점을 마감하면 작품 등록·수정과 채점이 잠깁니다. 순위를 공개하면 갤러리·발표 화면·홈에 순위가 나옵니다.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
            <div className="text-sm">
              <div className="font-bold text-white">채점</div>
              <div className="text-xs text-white/60">{c.scoringOpen ? "진행 중" : "마감됨"}</div>
            </div>
            <form action={toggleScoringOpen}>
              <input type="hidden" name="cohortId" value={c.id} />
              <input type="hidden" name="value" value={(!c.scoringOpen).toString()} />
              <button
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  c.scoringOpen ? "bg-red-500 text-white hover:bg-red-600" : "bg-accent text-on-accent hover:bg-accent-soft"
                }`}
              >
                {c.scoringOpen ? "채점 마감" : "채점 열기"}
              </button>
            </form>
          </div>
          <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
            <div className="text-sm">
              <div className="font-bold text-white">순위</div>
              <div className="text-xs text-white/60">{c.rankRevealed ? "공개됨" : "비공개"}</div>
            </div>
            <form action={toggleRankRevealed}>
              <input type="hidden" name="cohortId" value={c.id} />
              <input type="hidden" name="value" value={(!c.rankRevealed).toString()} />
              <button
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  c.rankRevealed ? "bg-white/15 text-white hover:bg-white/25" : "bg-signal text-on-accent hover:bg-signal/90"
                }`}
              >
                {c.rankRevealed ? "순위 숨기기" : "순위 공개"}
              </button>
            </form>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-6">
          {/* 회차 정보 */}
          <Panel title="회차 정보" desc="마감 시각은 갤러리 상단에 안내로만 표시됩니다. 실제 잠금은 위의 「채점 마감」으로 합니다.">
            <form action={updateCohortDetailsAction}>
              <input type="hidden" name="cohortId" value={c.id} />
              <div className="grid grid-cols-2 gap-3 text-xs text-white/60 sm:grid-cols-3">
                <label className="flex flex-col gap-1">
                  회차 번호
                  <input name="sessionNo" type="number" min={1} max={99} defaultValue={c.sessionNo ?? ""} className={adminInput} />
                </label>
                <label className="flex flex-col gap-1">
                  교육일
                  <input name="heldOn" type="date" defaultValue={c.heldOn ?? ""} className={adminInput} />
                </label>
                <label className="flex flex-col gap-1">
                  지역(도시명만)
                  <input name="location" maxLength={20} defaultValue={c.location ?? ""} className={adminInput} />
                </label>
                <label className="flex flex-col gap-1">
                  작품 등록 마감
                  <input name="submitDueAt" type="datetime-local" defaultValue={toKstLocal(c.submitDueAt)} className={adminInput} />
                </label>
                <label className="flex flex-col gap-1">
                  채점 마감
                  <input name="scoreDueAt" type="datetime-local" defaultValue={toKstLocal(c.scoreDueAt)} className={adminInput} />
                </label>
                <div className="flex items-end">
                  <button className="w-full rounded-lg bg-accent px-3 py-2 text-xs font-bold text-on-accent hover:bg-accent-soft">
                    저장
                  </button>
                </div>
              </div>
            </form>
          </Panel>

          {/* 입장 코드 */}
          <Panel
            title="입장 코드 (자동 수락)"
            badge={
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  c.joinCodeHash ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"
                }`}
              >
                {c.joinCodeHash ? "설정됨" : "미설정 · 수동 수락"}
              </span>
            }
            desc="6자리 숫자를 정해 현장에서 알려 주면, 가입 신청 때 코드를 맞게 넣은 사람은 즉시 수락됩니다. 코드는 해시로만 저장되어 다시 볼 수 없습니다."
          >
            <div className="flex flex-wrap gap-2">
              <form action={setJoinCodeAction} className="flex gap-2">
                <input type="hidden" name="cohortId" value={c.id} />
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="예: 482913"
                  className={`${adminInput} w-32 font-mono`}
                />
                <button className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-on-accent hover:bg-accent-soft">
                  {c.joinCodeHash ? "코드 변경" : "코드 설정"}
                </button>
              </form>
              {c.joinCodeHash && (
                <form action={setJoinCodeAction}>
                  <input type="hidden" name="cohortId" value={c.id} />
                  <input type="hidden" name="clear" value="1" />
                  <button className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/20">
                    해제
                  </button>
                </form>
              )}
            </div>
          </Panel>
        </div>

        {/* 배부 링크 · QR */}
        <Panel title="교육생 입장">
          <div className="flex flex-col items-center gap-3">
            <JoinQr url={joinUrl} size={180} />
            <p className="max-w-[200px] break-all text-center font-mono text-xs text-accent">{joinUrl}</p>
            <p className="max-w-[200px] text-center text-xs text-white/60">
              발표 화면에도 같은 QR이 크게 나옵니다.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
