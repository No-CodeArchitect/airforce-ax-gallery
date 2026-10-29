import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjects } from "@/lib/projects-data";
import { getCohortBySlug } from "@/lib/cohorts-store";
import { rankProjects } from "@/lib/ranking";
import { requestOrigin } from "@/lib/inapp";
import { siteConfig } from "@/lib/site-config";
import JoinQr from "@/components/JoinQr";

export const dynamic = "force-dynamic";

export default async function SectionPresentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cohort = await getCohortBySlug(slug);
  if (!cohort) notFound();

  const ranked = (await rankProjects(await getProjects(cohort.id), cohort.minRaters))
    .filter((p) => p.rank !== null)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const joinUrl = `${await requestOrigin()}/g/${slug}/join`;
  const label = cohort.sessionNo ? siteConfig.sortieLabel(cohort.sessionNo) : null;

  return (
    <main className="sky-bg relative min-h-screen overflow-hidden text-white">
      <div className="hud-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold">
            {cohort.name}
          </span>
          <Link
            href={`/g/${slug}`}
            className="text-sm text-white/60 hover:text-white"
          >
            갤러리로 →
          </Link>
        </div>

        <div className="text-center">
          <div className="text-sm font-bold tracking-[0.2em] text-accent">
            {label ? `${label} · RESULTS` : "RESULTS"}
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            결과 발표
          </h1>
        </div>

        {!cohort.rankRevealed ? (
          <div className="mt-14 flex flex-col items-center gap-6 text-center">
            <p className="text-lg text-white/70">
              순위는 발표 시간에 공개됩니다. 아직 입장하지 않았다면 QR로 들어와 채점에 참여해 주세요.
            </p>
            <JoinQr url={joinUrl} size={280} />
            <p className="break-all font-mono text-sm text-white/60">{joinUrl}</p>
          </div>
        ) : ranked.length === 0 ? (
          <p className="mt-16 text-center text-lg text-white/60">
            아직 채점된 작품이 없습니다.
          </p>
        ) : (
          <>
            <div className="mt-14 grid grid-cols-1 items-end gap-5 sm:grid-cols-3">
              {/* 시상대 순서: 2위 · 1위 · 3위 (모바일은 1위가 맨 위) */}
              {[podium[1], podium[0], podium[2]].map((p, i) => {
                if (!p) return <div key={`empty-${i}`} className="hidden sm:block" />;
                const ace = p.rank === 1;
                const medal = ace ? "🥇" : p.rank === 2 ? "🥈" : "🥉";
                return (
                  <div
                    key={p.id}
                    className={`relative animate-fade-up overflow-hidden rounded-2xl p-6 text-center ${
                      ace
                        ? "order-first bg-surface ring-2 ring-signal sm:order-none sm:-translate-y-6 sm:py-10"
                        : "bg-white/5 ring-1 ring-white/10"
                    }`}
                    style={{ animationDelay: ace ? "0.6s" : "0.2s" }}
                  >
                    {ace && (
                      <div className="mb-2 inline-block rounded-full bg-signal px-3 py-1 text-sm font-bold tracking-wider text-on-accent">
                        최우수
                      </div>
                    )}
                    <div className="text-5xl">{medal}</div>
                    <div className={`mt-3 font-black ${ace ? "text-2xl sm:text-3xl" : "text-xl"}`}>{p.title}</div>
                    <div className="mt-1 text-sm text-white/60">{p.authorName}</div>
                    <div className={`mt-4 font-mono text-3xl font-bold ${ace ? "text-signal" : "text-accent"}`}>
                      {p.avgScore?.toFixed(2)}
                    </div>
                    <div className="text-xs text-white/60">{p.raterCount}명 채점</div>
                  </div>
                );
              })}
            </div>

            {rest.length > 0 && (
              <ul className="mt-10 divide-y divide-white/10 rounded-2xl bg-white/5">
                {rest.map((p) => (
                  <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                    <span className="w-8 text-center font-mono text-lg font-bold text-white/60">
                      {p.rank}
                    </span>
                    <div className="flex-1">
                      <div className="font-bold">{p.title}</div>
                      <div className="text-sm text-white/60">{p.authorName}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-accent">
                        {p.avgScore?.toFixed(2)}
                      </div>
                      <div className="text-xs text-white/60">{p.raterCount}명</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {cohort.rankRevealed && (
          <div className="mt-12 flex items-center justify-end gap-3 text-xs text-white/60">
            <span>입장 QR</span>
            <JoinQr url={joinUrl} size={88} />
          </div>
        )}
      </div>
    </main>
  );
}
