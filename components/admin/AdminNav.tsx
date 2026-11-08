"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavCohort {
  id: string;
  name: string;
  pending: number; // 가입 수락 대기
  status: "scoring" | "closed" | "revealed";
}

const DOT: Record<NavCohort["status"], string> = {
  scoring: "bg-emerald-400",
  closed: "bg-white/40",
  revealed: "bg-signal",
};

// 관리자 좌측 메뉴. 데스크톱은 세로 사이드바, 모바일은 상단 가로 스크롤 메뉴.
export default function AdminNav({
  cohorts,
  newRequests,
  mobile = false,
}: {
  cohorts: NavCohort[];
  newRequests: number;
  mobile?: boolean;
}) {
  const path = usePathname();
  const isActive = (href: string, exact = false) =>
    exact ? path === href : path === href || path.startsWith(`${href}/`);

  const item = (href: string, label: string, opts: { exact?: boolean; badge?: number } = {}) => {
    const active = isActive(href, opts.exact);
    return (
      <Link
        key={href}
        href={href}
        className={
          mobile
            ? `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                active ? "bg-accent text-on-accent" : "bg-white/5 text-white/70"
              }`
            : `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-accent/15 font-bold text-accent" : "text-white/75 hover:bg-white/5 hover:text-white"
              }`
        }
      >
        <span className="flex-1 truncate">{label}</span>
        {!!opts.badge && (
          <span className="rounded-full bg-signal px-1.5 text-[11px] font-bold leading-5 text-on-accent">{opts.badge}</span>
        )}
      </Link>
    );
  };

  if (mobile) {
    return (
      <nav className="flex gap-2 overflow-x-auto px-4 py-2">
        {item("/admin", "대시보드", { exact: true })}
        {item("/admin/cohorts", "회차")}
        {item("/admin/requests", "교육 신청", { badge: newRequests })}
        {item("/admin/media", "미디어")}
        {item("/admin/accounts", "관리자 계정")}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {item("/admin", "대시보드", { exact: true })}

      <div className="mt-5 px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">회차 운영</div>
      {item("/admin/cohorts", "회차 목록 · 추가", { exact: true })}
      {cohorts.map((c) => {
        const href = `/admin/cohorts/${encodeURIComponent(c.id)}`;
        const active = isActive(href);
        return (
          <Link
            key={c.id}
            href={href}
            className={`flex items-center gap-2 rounded-lg py-2 pl-5 pr-3 text-sm transition ${
              active ? "bg-accent/15 font-bold text-accent" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[c.status]}`} aria-hidden />
            <span className="flex-1 truncate">{c.name}</span>
            {c.pending > 0 && (
              <span
                className="rounded-full bg-signal px-1.5 text-[11px] font-bold leading-5 text-on-accent"
                title="가입 수락 대기"
              >
                {c.pending}
              </span>
            )}
          </Link>
        );
      })}

      <div className="mt-5 px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">사이트</div>
      {item("/admin/requests", "교육 신청", { badge: newRequests })}
      {item("/admin/media", "미디어")}
      {item("/admin/accounts", "관리자 계정")}
    </nav>
  );
}
