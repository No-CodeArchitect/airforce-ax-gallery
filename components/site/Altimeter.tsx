import { siteConfig } from "@/lib/site-config";

// 고도계 스타일 Before → After 계기판. 바늘이 09:00 → 17:00 으로 한 번 올라간다
// (prefers-reduced-motion 이면 globals.css 에서 애니메이션을 끄고 17:00 에 멈춘다).
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const SPAN = 240; // 바늘이 도는 각도 (-120° ~ +120°)
const angleOf = (h: number) => -SPAN / 2 + ((h - 9) / 8) * SPAN;

function polar(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: 100 + r * Math.sin(rad), y: 100 - r * Math.cos(rad) };
}

function arc(fromDeg: number, toDeg: number, r: number) {
  const a = polar(fromDeg, r);
  const b = polar(toDeg, r);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

export default function Altimeter({ feedbackPerProject }: { feedbackPerProject: number | null }) {
  const { before, after } = siteConfig.hero;
  const [lunchStart, lunchEnd] = siteConfig.day.lunch.map((t) => Number(t.slice(0, 2)));
  const afterLines = after.lines.map((l) =>
    l.includes(" n개") ? (feedbackPerProject ? l.replace(" n개", ` 평균 ${feedbackPerProject}개`) : l.replace(" n개", "")) : l
  );

  return (
    <div className="w-full max-w-sm rounded-3xl bg-base/70 p-5 ring-1 ring-white/15 backdrop-blur sm:p-6">
      <div className="flex items-center justify-between font-mono text-[11px] font-bold tracking-[0.2em] text-white/60">
        <span>ALTIMETER</span>
        <span className="text-accent">ONE-DAY CLIMB</span>
      </div>

      <svg viewBox="0 0 200 170" className="mx-auto mt-2 w-full max-w-[260px]" role="img" aria-label="09:00에서 17:00으로 올라가는 계기판">
        <defs>
          <linearGradient id="alt-arc" x1="0" x2="1">
            <stop offset="0%" stopColor="#4FB3FF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8FD0FF" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="92" fill="#102440" stroke="rgba(255,255,255,0.12)" />
        <path d={arc(angleOf(9), angleOf(17), 78)} stroke="url(#alt-arc)" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* 점심 = 급유 구간 */}
        <path d={arc(angleOf(lunchStart), angleOf(lunchEnd), 78)} stroke="#F2C14E" strokeWidth="6" fill="none" />
        {HOURS.map((h) => {
          const a = angleOf(h);
          const p1 = polar(a, 66);
          const p2 = polar(a, 72);
          const t = polar(a, 54);
          const major = h === 9 || h === 17;
          return (
            <g key={h}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(244,248,252,0.6)" strokeWidth={major ? 2.5 : 1.2} />
              <text
                x={t.x}
                y={t.y + 3.5}
                textAnchor="middle"
                className="font-mono"
                fontSize={major ? 11 : 9}
                fontWeight={major ? 700 : 500}
                fill={major ? "#F4F8FC" : "rgba(244,248,252,0.55)"}
              >
                {h}
              </text>
            </g>
          );
        })}
        <text x="100" y="138" textAnchor="middle" className="font-mono" fontSize="8" fill="#F2C14E" opacity="0.9">
          LUNCH {siteConfig.day.lunch.join("–")}
        </text>
        {/* 바늘 */}
        <g className="animate-climb" style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}>
          <line x1="100" y1="108" x2="100" y2="50" stroke="#F4F8FC" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 42 L105 54 L95 54 Z" fill="#4FB3FF" />
        </g>
        <circle cx="100" cy="100" r="6" fill="#4FB3FF" stroke="#0B1A2E" strokeWidth="2" />
      </svg>

      <ol className="mt-2 flex flex-col gap-2">
        <li className="flex gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/10">
          <span className="font-mono text-sm font-bold text-white/60">{before.time}</span>
          <span className="text-sm text-white/65">{before.lines.join(" · ")}</span>
        </li>
        <li className="flex gap-3 rounded-xl bg-accent/10 px-3 py-2.5 ring-1 ring-accent/40">
          <span className="font-mono text-sm font-bold text-accent">{after.time}</span>
          <span className="text-sm font-semibold text-white">{afterLines.join(" · ")}</span>
        </li>
      </ol>
    </div>
  );
}
