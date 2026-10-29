import Link from "next/link";
import { siteConfig, shortDate, sortieState, type Sortie } from "@/lib/site-config";

// 기대효과 4카드 (홈 · 특강 소개 공용)
export function OutcomeCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {siteConfig.outcomes.map((o, i) => (
        <div key={o.title} className="flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-white/10">
          <span className="font-mono text-sm font-bold text-accent">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-4 text-lg font-black text-white">{o.title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{o.desc}</p>
          <span className="mt-5 self-start text-xs font-semibold text-white/60">{o.tag}</span>
        </div>
      ))}
    </div>
  );
}

// 하루 일정 타임라인 — 데스크톱은 가로, 모바일은 세로
export function DaySchedule() {
  const steps = siteConfig.schedule;
  return (
    <ol className="relative grid grid-cols-1 gap-0 lg:grid-cols-6 lg:gap-4">
      {/* 가로 연결선 (lg) */}
      <span aria-hidden className="pointer-events-none absolute left-[6px] right-[8%] top-[6px] hidden h-px bg-white/15 lg:block" />
      {steps.map((s, i) => (
        <li key={s.time} className="relative flex gap-4 pb-7 last:pb-0 lg:flex-col lg:gap-4 lg:pb-0">
          {/* 세로 연결선 (모바일) */}
          {i < steps.length - 1 && (
            <span aria-hidden className="absolute left-[6px] top-4 h-[calc(100%-0.5rem)] w-px bg-white/15 lg:hidden" />
          )}
          <span
            aria-hidden
            className={`relative z-10 mt-1 h-[13px] w-[13px] shrink-0 rounded-full ring-4 ring-base lg:mt-0 ${
              s.muted ? "bg-white/30" : "bg-accent"
            }`}
          />
          <div>
            <div className={`font-mono text-sm font-bold ${s.muted ? "text-white/60" : "text-accent"}`}>{s.time}</div>
            <div className={`mt-1 font-bold ${s.muted ? "text-white/70" : "text-white"}`}>{s.label}</div>
            <p className="mt-1 text-sm leading-relaxed text-white/65">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const STATE_DOT = {
  upcoming: { cls: "bg-white/30", label: "예정" },
  today: { cls: "bg-signal", label: "오늘 진행" },
  done: { cls: "bg-accent", label: "종료" },
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
            <span className="text-xs font-semibold text-white/60">{siteConfig.sortieLabel(s.no)}</span>
            <span className="font-semibold text-white">{s.city}</span>
            <span className="font-mono text-xs text-white/60">{shortDate(s.date).replace(/\(.\)/, "")}</span>
            {st === "today" && (
              <span className="rounded-full bg-signal px-2 py-0.5 text-[11px] font-bold text-on-accent">오늘 진행</span>
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
            {i < siteConfig.sorties.length - 1 && (
              <span className="text-white/20" aria-hidden>
                ·
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
