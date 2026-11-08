"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 회차 상세 화면의 탭 (운영 설정 / 교육생 / 작품·AI 분석 / 순위 / 댓글)
export default function CohortTabs({
  base,
  counts,
}: {
  base: string; // /admin/cohorts/<id>
  counts: { pending: number; queue: number; comments: number };
}) {
  const path = usePathname();
  const tabs = [
    { href: base, label: "운영 설정", exact: true },
    { href: `${base}/members`, label: "교육생", badge: counts.pending },
    { href: `${base}/projects`, label: "작품 · AI 분석", badge: counts.queue },
    { href: `${base}/ranking`, label: "순위" },
    { href: `${base}/comments`, label: `댓글${counts.comments ? ` ${counts.comments}` : ""}` },
  ];
  return (
    <nav className="-mx-1 mb-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-white/10 px-1">
      {tabs.map((t) => {
        const active = t.exact ? path === t.href : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition ${
              active
                ? "border-accent font-bold text-accent"
                : "border-transparent text-white/65 hover:text-white"
            }`}
          >
            {t.label}
            {!!t.badge && (
              <span className="rounded-full bg-signal px-1.5 text-[11px] font-bold leading-5 text-on-accent">{t.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
