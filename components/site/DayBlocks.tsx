import Link from "next/link";
import { siteConfig, shortDate, sortieState, type Sortie } from "@/lib/site-config";

// 기대효과 4카드 (홈 · 특강 소개 공용)
export function OutcomeCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {siteConfig.outcomes.map((o, i) => (
        <div key={o.title} className="relative flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-accent/80">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-2xl" aria-hidden>
              {o.icon}
            </span>
          </div>
          <h3 className="mt-4 text-lg font-black text-white">{o.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{o.desc}</p>
          <span className="mt-4 self-start rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/60 ring-1 ring-white/10">
            {o.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

// 하루 비행 계획 타임라인 — 데스크톱은 수평 비행경로, 모바일은 세로
export function FlightPlan() {
  const steps = siteConfig.flightPlan;
  return (
    <ol className="relative grid grid-cols-1 gap-0 lg:grid-cols-6 lg:gap-3">
      {/* 수평 경로선 (lg) */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[8%] right-[8%] top-[22px] hidden border-t-2 border-dashed border-accent/40 lg:block"
      />
      {steps.map((s, i) => {
        const lunch = s.time === siteConfig.day.lunch[0];
        return (
          <li key={s.time} className="relative flex gap-4 pb-6 last:pb-0 lg:flex-col lg:items-center lg:gap-3 lg:pb-0 lg:text-center">
            {/* 세로 경로선 (모바일) */}
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute left-[21px] top-11 h-[calc(100%-2.75rem)] border-l-2 border-dashed border-accent/40 lg:hidden" />
            )}
            <span
              className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ring-2 ${
                lunch ? "bg-signal/15 ring-signal/70" : "bg-surface ring-accent/60"
              }`}
              aria-hidden
            >
              {s.icon}
            </span>
            <div className="pt-1 lg:pt-0">
              <div className={`font-mono text-sm font-bold ${lunch ? "text-signal" : "text-accent"}`}>{s.time}</div>
              <div className="mt-0.5 font-black text-white">{s.label}</div>
              <p className="mt-1 text-sm leading-relaxed text-white/65">{s.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const STATE_DOT = {
  upcoming: { cls: "bg-white/30", label: "예정" },
  today: { cls: "bg-signal animate-pulse", label: "오늘 비행 중" },
  done: { cls: "bg-accent", label: "완료" },
} as const;

// 교육 일정 한 줄 띠. hrefOf 가 없으면 링크 없이 표시.
export function SortieStrip({
  today,
  hrefOf,
}: {
  today: string;
  hrefOf: (s: Sortie) => string | null;
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
      {siteConfig.sorties.map((s, i) => {
        const st = sortieState(s, today);
        const href = hrefOf(s);
        const body = (
          <>
            <span className={`h-2 w-2 shrink-0 rounded-full ${STATE_DOT[st].cls}`} aria-hidden />
            <span className="font-mono text-xs font-bold text-white/60">{siteConfig.sortieLabel(s.no)}</span>
            <span className="font-semibold text-white">{s.city}</span>
            <span className="font-mono text-xs text-white/55">{shortDate(s.date).replace(/\(.\)/, "")}</span>
            {st === "today" && (
              <span className="rounded-full bg-signal px-2 py-0.5 text-[11px] font-black text-on-accent">오늘 비행 중</span>
            )}
            <span className="sr-only">({STATE_DOT[st].label})</span>
          </>
        );
        const cls = `inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${
          st === "today" ? "bg-signal/10 ring-1 ring-signal/50" : "hover:bg-white/5"
        }`;
        return (
          <li key={s.no} className="flex items-center gap-1">
            {href ? (
              <Link href={href} className={cls}>
                {body}
              </Link>
            ) : (
              <span className={cls}>{body}</span>
            )}
            {i < siteConfig.sorties.length - 1 && <span className="text-white/20" aria-hidden>·</span>}
          </li>
        );
      })}
    </ul>
  );
}
