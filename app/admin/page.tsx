import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminEmail, isAdmin } from "@/lib/admin-session";
import { listManagedAdmins, ownerEmails } from "@/lib/admin-allowlist";
import { ssoEnabled } from "@/lib/google-oauth";
import {
  addAdminAction,
  removeAdminAction,
  adminLogout,
  createCohortAction,
  toggleScoringOpen,
  toggleRankRevealed,
  setMemberStatusAction,
  approveAllAction,
  deleteMemberAction,
  setMinRatersAction,
  moderateComment,
  updateCohortDetailsAction,
  setJoinCodeAction,
} from "@/lib/admin-actions";
import JoinQr from "@/components/JoinQr";
import { siteConfig } from "@/lib/site-config";

// ISO → datetime-local 입력값(KST)
function toKstLocal(iso: string | null): string {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 16);
}
import { listCohorts } from "@/lib/cohorts-store";
import { listMemberships } from "@/lib/memberships-store";
import { getProjects, listRecords } from "@/lib/projects-data";
import { hasApiKey } from "@/lib/pipeline/ai";
import SubmissionsPanel, { type SubmissionRow } from "@/components/SubmissionsPanel";
import { listEduRequests, type EduRequestStatus } from "@/lib/edu-requests-store";
import { setEduRequestStatusAction, deleteEduRequestAction } from "@/lib/edu-request-actions";
import { rankProjects } from "@/lib/ranking";
import { distinctRaterCountFor } from "@/lib/scores-store";
import { listAllComments } from "@/lib/comments-store";
import { listMedia } from "@/lib/media-items";
import MediaManager from "@/components/MediaManager";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdmin())) redirect("/admin/login");

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const origin = host ? `${proto}://${host}` : "";

  const aboutItems = await listMedia("about");
  const sketchItems = await listMedia("sketch");

  const me = await getAdminEmail();
  const owners = ownerEmails();
  const managedAdmins = await listManagedAdmins();
  const sso = ssoEnabled();

  const eduRequests = await listEduRequests();
  const newRequests = eduRequests.filter((r) => r.status === "new").length;
  const apiReady = hasApiKey();

  const cohorts = await listCohorts();
  const sections = await Promise.all(
    cohorts.map(async (c) => {
      const memberships = await listMemberships(c.id);
      const students = memberships.filter((m) => m.status === "approved");
      const pendingMembers = memberships.filter((m) => m.status === "pending");
      const rejectedMembers = memberships.filter((m) => m.status === "rejected");
      // 같은 실명으로 가입한 다른 계정 (부계정 의심) — 동명이인일 수 있어 경고만 한다
      const normName = (n: string) => n.replace(/\s+/g, "");
      const sameName = (m: (typeof memberships)[number]) =>
        memberships.filter(
          (o) => o.id !== m.id && o.status !== "rejected" && normName(o.realName) === normName(m.realName)
        );
      // 관리자 화면에서는 닉네임 옆에 실명을 함께 보여 준다
      const realNameOf = new Map(memberships.map((m) => [m.id, m.realName]));
      const who = (id: string, nick: string) =>
        realNameOf.has(id) ? `${nick} (${realNameOf.get(id)})` : nick;
      const projects = await getProjects(c.id);
      const records = await listRecords(c.id);
      const submitted = new Set(records.map((r) => r.authorId));
      const missing = students.filter((s) => !submitted.has(s.id)).map((s) => who(s.id, s.nickname));
      const rows: SubmissionRow[] = records.map((r) => ({
        id: r.id,
        title: r.submission.title,
        authorName: who(r.authorId, r.authorName),
        liveUrl: r.submission.liveUrl,
        status: r.status,
        needsAnalysis: r.needsAnalysis,
        published: !!r.ai,
        mock: !!r.ai?.mock,
        thumbUrl: r.thumbUrl,
        error: r.error,
        updatedAt: r.updatedAt,
      }));
      const pids = new Set(projects.map((p) => p.id));
      const ranked = (await rankProjects(projects, c.minRaters))
        .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
        .map((p) => ({ ...p, authorName: who(p.authorId, p.authorName) }));
      const raters = await distinctRaterCountFor(pids);
      const comments = await listAllComments(pids);
      return { c, students, pendingMembers, rejectedMembers, sameName, projects, ranked, raters, comments, rows, missing };
    })
  );

  return (
    <main className="min-h-screen bg-base text-white">
      <header className="border-b border-white/10 bg-base-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
          <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
            관리자 콘솔
          </span>
          <div className="flex items-center gap-3">
            {me && (
              <span data-testid="admin-me" className="hidden text-xs text-white/60 sm:inline">
                {me}
              </span>
            )}
            <Link href="/" className="text-sm font-semibold text-white/60 hover:text-accent">
              홈
            </Link>
            <form action={adminLogout}>
              <button className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
        {/* 관리자 계정 (구글 이메일 허용 목록) */}
        <section className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-white">관리자 계정</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                sso ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {sso ? "구글 로그인 사용 중" : "구글 로그인 미설정 (임시 비밀번호 로그인)"}
            </span>
          </div>
          <p className="mb-4 mt-1 text-xs text-white/60">
            여기에 등록한 구글 계정만 관리자로 로그인할 수 있습니다. 도메인은 제한하지
            않으며, 어떤 구글 계정이든 이메일을 등록하면 됩니다.
          </p>

          <ul className="divide-y divide-white/10 rounded-lg ring-1 ring-white/10">
            {owners.map((e) => (
              <li key={e} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="flex-1 text-white">{e}</span>
                <span className="rounded bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                  소유자 (환경변수)
                </span>
              </li>
            ))}
            {managedAdmins.map((a) => (
              <li key={a.email} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="flex-1 text-white">{a.email}</span>
                {a.email === me ? (
                  <span className="text-xs text-white/60">현재 로그인</span>
                ) : (
                  <form action={removeAdminAction}>
                    <input type="hidden" name="email" value={a.email} />
                    <button className="rounded px-2 py-0.5 text-xs text-white/60 hover:text-red-400">
                      삭제
                    </button>
                  </form>
                )}
              </li>
            ))}
            {owners.length === 0 && managedAdmins.length === 0 && (
              <li className="px-3 py-3 text-xs text-white/60">
                등록된 관리자가 없습니다. 환경변수 ADMIN_EMAILS에 첫 관리자 이메일을
                설정하세요.
              </li>
            )}
          </ul>

          <form action={addAdminAction} className="mt-3 flex gap-2">
            <input
              name="email"
              type="email"
              required
              placeholder="추가할 관리자 구글 이메일 (예: name@gmail.com)"
              className="flex-1 rounded-lg border border-white/15 bg-surface-soft px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-on-accent transition hover:bg-accent-soft">
              관리자 추가
            </button>
          </form>
        </section>

        {/* 부대 AI 교육 신청 */}
        <section className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-white">부대 AI 입문 특강 신청</h2>
            {newRequests > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-black text-on-accent">
                신규 {newRequests}
              </span>
            )}
            <Link href="/apply" className="ml-auto text-xs font-semibold text-accent hover:underline">
              신청 페이지 →
            </Link>
          </div>
          <p className="mb-3 mt-1 text-xs text-white/60">
            홈·갤러리 배너의 「교육 신청하기」로 들어온 신청입니다. 연락처 등 개인정보가 있으니
            상담이 끝나면 삭제하세요.
          </p>
          {eduRequests.length === 0 ? (
            <p className="rounded-lg px-3 py-3 text-xs text-white/60 ring-1 ring-white/10">
              아직 접수된 신청이 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {eduRequests.map((r) => (
                <li
                  key={r.id}
                  className={`rounded-lg border px-3 py-3 text-sm ${
                    r.status === "new" ? "border-accent/40 bg-accent/5" : "border-white/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white">{r.unit}</span>
                    <span className="text-white/60">{r.contactName}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${EDU_STATUS[r.status].tone}`}>
                      {EDU_STATUS[r.status].label}
                    </span>
                    <span className="ml-auto text-xs text-white/60">
                      {new Date(r.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                    <span>☎ {r.phone}</span>
                    {r.email && <span>✉ {r.email}</span>}
                    {r.headcount && <span>인원 {r.headcount}</span>}
                    {r.period && <span>시기 {r.period}</span>}
                  </div>
                  {r.message && (
                    <p className="mt-2 whitespace-pre-line rounded bg-base px-3 py-2 text-xs leading-relaxed text-white/70">
                      {r.message}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(Object.keys(EDU_STATUS) as EduRequestStatus[])
                      .filter((st) => st !== r.status)
                      .map((st) => (
                        <form key={st} action={setEduRequestStatusAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={st} />
                          <button className="rounded bg-white/10 px-2 py-0.5 text-xs text-white/70 hover:bg-white/20">
                            → {EDU_STATUS[st].label}
                          </button>
                        </form>
                      ))}
                    <form action={deleteEduRequestAction} className="ml-auto">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded px-2 py-0.5 text-xs text-white/60 hover:text-red-400">
                        삭제
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 사이트 미디어 (홈 영상) — 드래그&드롭 */}
        <MediaManager
          slot="about"
          title="특강 소개 · 대표 영상"
          description="특강 소개(/about) 페이지 상단에 표시되는 영상입니다. 새로 올리면 기존 영상을 대체합니다. 지정하지 않으면 영상 칸 없이 표시됩니다."
          items={aboutItems}
        />
        <MediaManager
          slot="sketch"
          title="홈 · 미디어 · 교육 현장 스케치"
          description={`홈의 '현장 스케치'(최신 2개)와 미디어 페이지(전체)에 표시됩니다. 최신순으로 정렬됩니다. ⚠ ${siteConfig.sketchNotice}`}
          items={sketchItems}
        />

        {/* 새 섹션 추가 */}
        <section className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
          <h2 className="mb-1 text-sm font-bold text-white">새 회차(섹션) 추가</h2>
          <p className="mb-4 text-xs text-white/60">
            회차별로 완전히 분리됩니다. 각 회차는 고유 링크로 입장합니다. 5개 회차는
            <span className="font-mono"> npm run seed:sorties </span>로 한 번에 만들 수 있습니다.
          </p>
          <form action={createCohortAction} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            <input
              name="name"
              required
              placeholder="회차 이름 (예: 2회차 · 충주)"
              className={`${adminInput} col-span-2 sm:col-span-3`}
            />
            <input name="slug" placeholder="링크 주소 (선택, 예: sortie-02)" className={`${adminInput} col-span-2 sm:col-span-3`} />
            <input name="sessionNo" type="number" min={1} max={99} placeholder="회차 번호" className={adminInput} />
            <input name="heldOn" type="date" aria-label="교육일" className={adminInput} />
            <input name="location" maxLength={20} placeholder="도시명 (예: 충주)" className={`${adminInput} col-span-2`} />
            <button className="col-span-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-soft">
              회차 추가
            </button>
          </form>
        </section>

        {/* 섹션별 관리 */}
        {sections.map(({ c, students, pendingMembers, rejectedMembers, sameName, projects, ranked, raters, comments, rows, missing }) => (
          <section key={c.id} className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
            {/* 헤더 + 링크 */}
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-white">{c.name}</h2>
              {c.rankRevealed ? (
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                  순위 공개
                </span>
              ) : (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">
                  {c.scoringOpen ? "채점 중" : "채점 마감"}
                </span>
              )}
              <Link
                href={`/g/${c.slug}`}
                className="ml-auto text-xs font-semibold text-accent hover:underline"
              >
                갤러리 열기 →
              </Link>
            </div>
            <div className="mt-2 rounded-lg bg-base px-3 py-2 text-xs text-white/60 ring-1 ring-white/10">
              교육생 배부 링크:{" "}
              <span className="font-mono text-accent">{origin}/g/{c.slug}</span>
            </div>

            {/* 회차 정보 · 입장 코드 · QR */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-4">
                <form action={updateCohortDetailsAction} className="rounded-xl border border-white/10 p-4">
                  <input type="hidden" name="cohortId" value={c.id} />
                  <div className="mb-3 text-sm font-bold text-white">회차 정보</div>
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
                      작품 등록 마감 (표시용)
                      <input name="submitDueAt" type="datetime-local" defaultValue={toKstLocal(c.submitDueAt)} className={adminInput} />
                    </label>
                    <label className="flex flex-col gap-1">
                      채점 마감 (표시용)
                      <input name="scoreDueAt" type="datetime-local" defaultValue={toKstLocal(c.scoreDueAt)} className={adminInput} />
                    </label>
                    <div className="flex items-end">
                      <button className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/20">
                        저장
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    마감 시각은 갤러리 상단에 안내로만 표시됩니다. 실제 잠금은 아래 「채점 마감」 토글로 합니다.
                  </p>
                </form>

                <div className="rounded-xl border border-white/10 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">입장 코드 (자동 수락)</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.joinCodeHash ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {c.joinCodeHash ? "설정됨" : "미설정 · 수동 수락"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">
                    6자리 숫자를 정해 현장에서 알려 주면, 가입 신청 때 코드를 맞게 넣은 사람은 즉시
                    수락됩니다. 코드는 해시로만 저장되어 다시 볼 수 없습니다.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 p-4">
                <span className="text-xs font-bold text-white/70">입장 QR</span>
                <JoinQr url={`${origin}/g/${c.slug}/join`} size={150} />
                <Link href={`/g/${c.slug}/present`} className="text-xs font-semibold text-accent hover:underline">
                  발표 화면 열기 →
                </Link>
              </div>
            </div>

            {/* 운영 토글 */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                <div className="text-sm">
                  <div className="font-bold text-white">채점</div>
                  <div className="text-xs text-white/60">
                    {c.scoringOpen ? "진행 중" : "마감됨"}
                  </div>
                </div>
                <form action={toggleScoringOpen}>
                  <input type="hidden" name="cohortId" value={c.id} />
                  <input type="hidden" name="value" value={(!c.scoringOpen).toString()} />
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      c.scoringOpen
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-accent text-on-accent hover:bg-accent-soft"
                    }`}
                  >
                    {c.scoringOpen ? "채점 마감" : "채점 열기"}
                  </button>
                </form>
              </div>
              <div className="flex flex-1 items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                <div className="text-sm">
                  <div className="font-bold text-white">순위</div>
                  <div className="text-xs text-white/60">
                    {c.rankRevealed ? "공개됨" : "비공개"}
                  </div>
                </div>
                <form action={toggleRankRevealed}>
                  <input type="hidden" name="cohortId" value={c.id} />
                  <input type="hidden" name="value" value={(!c.rankRevealed).toString()} />
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      c.rankRevealed
                        ? "bg-white/15 text-white hover:bg-white/25"
                        : "bg-signal text-on-accent hover:bg-signal/90"
                    }`}
                  >
                    {c.rankRevealed ? "순위 숨기기" : "🏆 순위 공개"}
                  </button>
                </form>
              </div>
            </div>

            {/* 현황 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="교육생" value={`${students.length}명`} />
              <Stat label="채점 참여" value={`${raters}/${students.length}`} />
              <Stat label="프로젝트" value={`${projects.length}개`} />
            </div>

            {/* 가입 신청 · 교육생 */}
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-white">가입 신청 · 교육생</h3>
                {pendingMembers.length > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-black text-on-accent">
                    대기 {pendingMembers.length}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-white/60">
                교육생은 배부 링크에서 구글 계정으로 로그인해 실명·닉네임으로 가입을 신청합니다.
                실명을 명단과 대조해 수락하세요. 사이트에는 닉네임만 표시됩니다.
              </p>

              {pendingMembers.length > 0 && (
                <div className="mt-3 rounded-xl border border-accent/40 bg-accent/5 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-accent">수락 대기</span>
                    <form action={approveAllAction}>
                      <input type="hidden" name="cohortId" value={c.id} />
                      <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-on-accent hover:bg-accent-soft">
                        대기 {pendingMembers.length}명 전체 수락
                      </button>
                    </form>
                  </div>
                  <ul className="divide-y divide-white/10">
                    {pendingMembers.map((m) => (
                      <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                        <span className="font-bold text-white">{m.realName}</span>
                        <span className="text-white/60">닉네임 {m.nickname}</span>
                        <span className="text-xs text-white/60">{m.email}</span>
                        <SameNameWarning others={sameName(m)} />
                        <span className="ml-auto flex gap-1">
                          <MemberButton id={m.id} status="approved" label="수락" primary />
                          <MemberButton id={m.id} status="rejected" label="거절" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {students.length > 0 ? (
                <ul className="mt-3 divide-y divide-white/10 rounded-lg ring-1 ring-white/10">
                  {students.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                      <span className="font-semibold text-white">{m.nickname}</span>
                      <span className="text-white/60">{m.realName}</span>
                      <span className="text-xs text-white/60">{m.email}</span>
                      <SameNameWarning others={sameName(m)} />
                      <span className="ml-auto">
                        <MemberButton id={m.id} status="rejected" label="수락 취소" />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                pendingMembers.length === 0 && (
                  <p className="mt-3 rounded-lg px-3 py-3 text-xs text-white/60 ring-1 ring-white/10">
                    아직 가입한 교육생이 없습니다. 위의 배부 링크를 교육생에게 나눠 주세요.
                  </p>
                )
              )}

              {rejectedMembers.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-white/60 hover:text-accent">
                    거절·취소된 신청 {rejectedMembers.length}건
                  </summary>
                  <ul className="mt-2 divide-y divide-white/10 rounded-lg ring-1 ring-white/10">
                    {rejectedMembers.map((m) => (
                      <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
                        <span className="text-white/70">{m.realName}</span>
                        <span className="text-white/60">닉네임 {m.nickname}</span>
                        <span className="text-xs text-white/60">{m.email}</span>
                        <span className="ml-auto flex gap-1">
                          <MemberButton id={m.id} status="approved" label="수락" />
                          <form action={deleteMemberAction}>
                            <input type="hidden" name="id" value={m.id} />
                            <button className="rounded px-2 py-0.5 text-xs text-white/60 hover:text-red-400">
                              기록 삭제
                            </button>
                          </form>
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            {/* 작품 등록 · AI 분석 */}
            <div className="mt-5">
              <SubmissionsPanel
                rows={rows}
                missing={missing}
                rosterCount={students.length}
                apiReady={apiReady}
              />
            </div>

            {/* 순위 미리보기 */}
            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-white">순위 미리보기 (관리자 전용)</h3>
                <form action={setMinRatersAction} className="ml-auto flex items-center gap-2 text-xs text-white/60">
                  <input type="hidden" name="cohortId" value={c.id} />
                  최소 채점 인원
                  <input
                    name="minRaters"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={c.minRaters}
                    className="w-14 rounded border border-white/15 bg-surface-soft px-2 py-1 text-white outline-none focus:border-accent"
                  />
                  명
                  <button className="rounded bg-white/10 px-2 py-1 font-semibold text-white/80 hover:bg-white/20">
                    저장
                  </button>
                </form>
              </div>
              <p className="mb-2 text-xs text-white/60">
                채점한 사람이 {c.minRaters}명 미만인 작품은 순위에서 빠지고 「채점 부족」으로 표시됩니다.
              </p>
            {ranked.length > 0 && (
              <div>
                <ul className="divide-y divide-white/10">
                  {ranked.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                      <span className="w-6 text-center font-black text-accent">
                        {p.rank ?? "-"}
                      </span>
                      <span className="flex-1 text-white">
                        {p.title}
                        <span className="ml-2 text-xs text-white/60">
                          {p.authorName}
                        </span>
                      </span>
                      <span className="text-white/60">
                        {p.avgScore !== null ? p.avgScore.toFixed(2) : "-"}
                      </span>
                      <span
                        className={`w-20 text-right text-xs ${
                          p.raterCount < c.minRaters ? "text-amber-300/80" : "text-white/60"
                        }`}
                      >
                        {p.raterCount}명{p.raterCount < c.minRaters ? " · 부족" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>

            {/* 댓글 모더레이션 */}
            {comments.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-bold text-white">
                  댓글 모더레이션 ({comments.length})
                </h3>
                <ul className="flex flex-col gap-2">
                  {comments.map((cm) => (
                    <li
                      key={cm.id}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        cm.isHidden ? "border-red-500/30 bg-red-500/10" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white/60">
                          <span className="font-semibold text-white/70">
                            {cm.aiNickname}
                          </span>{" "}
                          · 실명 {cm.authorName}
                          {cm.isAuthorReply && " · 제작자"}
                          {cm.isHidden && " · (숨김)"}
                        </span>
                        <form action={moderateComment}>
                          <input type="hidden" name="id" value={cm.id} />
                          <input
                            type="hidden"
                            name="hidden"
                            value={(!cm.isHidden).toString()}
                          />
                          <button
                            className={`rounded px-2 py-0.5 text-xs font-semibold ${
                              cm.isHidden
                                ? "bg-accent text-on-accent hover:bg-accent-soft"
                                : "bg-white/10 text-white/70 hover:bg-white/20"
                            }`}
                          >
                            {cm.isHidden ? "복구" : "숨기기"}
                          </button>
                        </form>
                      </div>
                      <p className="mt-1 text-white/80">{cm.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

const EDU_STATUS: Record<EduRequestStatus, { label: string; tone: string }> = {
  new: { label: "신규", tone: "bg-accent/20 text-accent" },
  contacted: { label: "연락함", tone: "bg-sky-500/20 text-sky-300" },
  done: { label: "완료", tone: "bg-white/10 text-white/60" },
};

function SameNameWarning({ others }: { others: { email: string; nickname: string }[] }) {
  if (others.length === 0) return null;
  return (
    <span
      className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300"
      title="같은 사람이 계정 두 개로 가입하면 서로 채점할 수 있습니다. 동명이인인지 확인하세요."
    >
      ⚠ 같은 실명: {others.map((o) => `${o.nickname}(${o.email})`).join(", ")}
    </span>
  );
}

function MemberButton({
  id,
  status,
  label,
  primary,
}: {
  id: string;
  status: "approved" | "rejected";
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setMemberStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        className={`rounded px-2 py-0.5 text-xs font-semibold ${
          primary
            ? "bg-accent text-on-accent hover:bg-accent-soft"
            : "bg-white/10 text-white/70 hover:bg-white/20"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

const adminInput =
  "rounded-lg border border-white/15 bg-surface-soft px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent focus:ring-2 focus:ring-accent/20";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-soft px-3 py-2 ring-1 ring-white/10">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );
}
