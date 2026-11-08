import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminEmail, isAdmin } from "@/lib/admin-session";
import { adminLogout } from "@/lib/admin-actions";
import { listCohorts } from "@/lib/cohorts-store";
import { listMemberships } from "@/lib/memberships-store";
import { listEduRequests } from "@/lib/edu-requests-store";
import AdminNav, { type NavCohort } from "@/components/admin/AdminNav";
import { Emblem } from "@/components/site/Brand";

export const dynamic = "force-dynamic";

// 관리자 콘솔 공통 틀: 좌측 메뉴 + 본문. (로그인 화면은 이 그룹 밖)
export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  const [me, cohorts, requests] = await Promise.all([getAdminEmail(), listCohorts(), listEduRequests()]);
  const navCohorts: NavCohort[] = await Promise.all(
    [...cohorts]
      .sort((a, b) => (a.sessionNo ?? 99) - (b.sessionNo ?? 99) || a.createdAt.localeCompare(b.createdAt))
      .map(async (c) => ({
        id: c.id,
        name: c.name,
        pending: (await listMemberships(c.id).catch(() => [])).filter((m) => m.status === "pending").length,
        status: c.rankRevealed ? "revealed" : c.scoringOpen ? "scoring" : "closed",
      }))
  );
  const newRequests = requests.filter((r) => r.status === "new").length;

  return (
    <div className="min-h-screen bg-base text-white lg:flex">
      {/* 좌측 메뉴 (데스크톱) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-base-soft lg:flex">
        <Link href="/admin" className="flex items-center gap-2 px-5 py-5">
          <Emblem className="h-5" />
          <span className="text-sm font-black">관리자 콘솔</span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <AdminNav cohorts={navCohorts} newRequests={newRequests} />
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-xs">
          {me && (
            <div data-testid="admin-me" className="truncate text-white/60" title={me}>
              {me}
            </div>
          )}
          <div className="mt-2 flex items-center gap-3">
            <Link href="/" className="font-semibold text-white/70 hover:text-accent">
              사이트로 ↗
            </Link>
            <form action={adminLogout} className="ml-auto">
              <button className="rounded-lg border border-white/20 px-2.5 py-1 font-semibold text-white/70 hover:bg-white/10">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* 상단 메뉴 (모바일·태블릿) */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-base-soft/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 px-4 pt-3">
          <Emblem className="h-5" />
          <span className="text-sm font-black">관리자 콘솔</span>
          <Link href="/" className="ml-auto text-xs font-semibold text-white/70">
            사이트로
          </Link>
          <form action={adminLogout}>
            <button className="rounded-lg border border-white/20 px-2.5 py-1 text-xs font-semibold text-white/70">
              로그아웃
            </button>
          </form>
        </div>
        <AdminNav cohorts={navCohorts} newRequests={newRequests} mobile />
      </header>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
