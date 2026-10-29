import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

// 부대 AI 입문 특강 신청 배너 (홈 · 회차 갤러리 하단).
export default function EduBanner({ compact = false }: { compact?: boolean }) {
  const b = siteConfig.eduBanner;
  return (
    <aside
      className={`relative overflow-hidden rounded-2xl ring-1 ring-accent/40 ${
        compact ? "px-5 py-6 sm:px-8" : "px-6 py-10 sm:px-12 sm:py-12"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(79,179,255,0.24) 0%, rgba(79,179,255,0.08) 45%, rgba(21,48,79,0.92) 100%)",
      }}
    >
      <div className="hud-grid pointer-events-none absolute inset-0" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-black tracking-wider text-on-accent">
            {b.badge}
          </span>
          <h2
            className={`mt-3 font-black tracking-tight text-white ${
              compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {b.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{b.desc}</p>
        </div>
        <Link
          href="/apply"
          className="shrink-0 self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-on-accent transition hover:bg-accent-soft sm:self-center"
        >
          {b.cta}
        </Link>
      </div>
    </aside>
  );
}
