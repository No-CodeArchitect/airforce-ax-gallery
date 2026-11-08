// 관리자 화면 공용 조각 (서버 컴포넌트).
import { setMemberStatusAction } from "@/lib/admin-actions";

export const adminInput =
  "rounded-lg border border-white/15 bg-surface-soft px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent focus:ring-2 focus:ring-accent/20";

export function PageHeader({
  title,
  desc,
  actions,
}: {
  title: string;
  desc?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-sm text-white/60">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  desc,
  badge,
  actions,
  children,
}: {
  title?: string;
  desc?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {title && <h2 className="text-sm font-bold text-white">{title}</h2>}
          {badge}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {desc && <p className="-mt-1 mb-3 text-xs leading-relaxed text-white/60">{desc}</p>}
      {children}
    </section>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" | "accent" }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ring-1 ${
        tone === "warn"
          ? "bg-signal/10 ring-signal/40"
          : tone === "accent"
            ? "bg-accent/10 ring-accent/30"
            : "bg-surface ring-white/10"
      }`}
    >
      <div className="text-xs text-white/60">{label}</div>
      <div className={`mt-0.5 font-mono text-xl font-bold ${tone === "warn" ? "text-signal" : "text-white"}`}>{value}</div>
    </div>
  );
}

export function CountBadge({ n, tone = "accent" }: { n: number; tone?: "accent" | "signal" }) {
  if (n <= 0) return null;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold text-on-accent ${tone === "signal" ? "bg-signal" : "bg-accent"}`}
    >
      {n}
    </span>
  );
}

export function SameNameWarning({ others }: { others: { email: string; nickname: string }[] }) {
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

export function MemberButton({
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
          primary ? "bg-accent text-on-accent hover:bg-accent-soft" : "bg-white/10 text-white/70 hover:bg-white/20"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

export function StatusPill({ rankRevealed, scoringOpen }: { rankRevealed: boolean; scoringOpen: boolean }) {
  return rankRevealed ? (
    <span className="rounded-full bg-signal/20 px-2 py-0.5 text-xs font-bold text-signal">순위 공개</span>
  ) : scoringOpen ? (
    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">채점 중</span>
  ) : (
    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">채점 마감</span>
  );
}
