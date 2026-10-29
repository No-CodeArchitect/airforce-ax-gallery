import { siteConfig } from "@/lib/site-config";

// 히어로 오른쪽: 하루의 시작(09:00)과 끝(17:00)을 나란히 보여 주는 비교 카드.
export default function DayCompare() {
  const { before, after } = siteConfig.hero;
  return (
    <div className="w-full max-w-sm rounded-2xl bg-base/70 p-6 ring-1 ring-white/15 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">One-day course</div>

      <ol className="relative mt-5 flex flex-col gap-6">
        {/* 세로 연결선 */}
        <span aria-hidden className="absolute left-[7px] top-3 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-white/25 to-accent" />
        {[
          { ...before, active: false },
          { ...after, active: true },
        ].map((s) => (
          <li key={s.time} className="relative flex gap-4">
            <span
              aria-hidden
              className={`relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full ring-4 ring-base ${
                s.active ? "bg-accent" : "bg-white/40"
              }`}
            />
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`font-mono text-lg font-bold ${s.active ? "text-accent" : "text-white/70"}`}>{s.time}</span>
                <span className="text-xs font-semibold text-white/60">{s.label}</span>
              </div>
              <ul className={`mt-2 flex flex-col gap-1 text-sm ${s.active ? "text-white" : "text-white/65"}`}>
                {s.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
