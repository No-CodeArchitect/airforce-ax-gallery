import { getAdminEmail } from "@/lib/admin-session";
import { listManagedAdmins, ownerEmails } from "@/lib/admin-allowlist";
import { ssoEnabled } from "@/lib/google-oauth";
import { addAdminAction, removeAdminAction } from "@/lib/admin-actions";
import { PageHeader, Panel, adminInput } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

// 관리자 계정 (구글 이메일 허용 목록)
export default async function AccountsPage() {
  const [me, managedAdmins] = await Promise.all([getAdminEmail(), listManagedAdmins()]);
  const owners = ownerEmails();
  const sso = ssoEnabled();

  return (
    <>
      <PageHeader
        title="관리자 계정"
        desc="여기에 등록한 구글 계정만 관리자로 로그인할 수 있습니다. 도메인 제한은 없고, 삭제하면 이미 로그인한 상태여도 즉시 접근이 끊깁니다."
      />
      <Panel
        title="허용된 관리자"
        badge={
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              sso ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {sso ? "구글 로그인 사용 중" : "구글 로그인 미설정 (임시 비밀번호 로그인)"}
          </span>
        }
      >
        <ul className="divide-y divide-white/10 rounded-lg ring-1 ring-white/10">
          {owners.map((e) => (
            <li key={e} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="flex-1 text-white">{e}</span>
              <span className="rounded bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">소유자 (환경변수)</span>
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
                  <button className="rounded px-2 py-0.5 text-xs text-white/60 hover:text-red-400">삭제</button>
                </form>
              )}
            </li>
          ))}
          {owners.length === 0 && managedAdmins.length === 0 && (
            <li className="px-3 py-3 text-xs text-white/60">
              등록된 관리자가 없습니다. 환경변수 ADMIN_EMAILS에 첫 관리자 이메일을 설정하세요.
            </li>
          )}
        </ul>

        <form action={addAdminAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            name="email"
            type="email"
            required
            placeholder="추가할 관리자 구글 이메일 (예: name@gmail.com)"
            className={`${adminInput} flex-1`}
          />
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-on-accent transition hover:bg-accent-soft">
            관리자 추가
          </button>
        </form>
      </Panel>
    </>
  );
}
