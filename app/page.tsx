import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import MediaEmbed from "@/components/site/MediaEmbed";
import DayCompare from "@/components/site/DayCompare";
import { Eyebrow } from "@/components/site/Brand";
import { DaySchedule, OutcomeCards, SortieStrip } from "@/components/site/DayBlocks";
import { firstImage } from "@/lib/media";
import { listMedia } from "@/lib/media-items";
import { getProjects } from "@/lib/projects-data";
import { listCohorts } from "@/lib/cohorts-store";
import { cohortForSortie, featuredCohort, getAceBoard, getDayStats } from "@/lib/home-data";
import { siteConfig, todayKst } from "@/lib/site-config";
import ProjectCard from "@/components/ProjectCard";
import EduBanner from "@/components/site/EduBanner";

// 관리자가 올린 미디어·작품이 바로 반영되도록 요청 시 렌더.
export const dynamic = "force-dynamic";

// 플레이스홀더 이미지 자리
function ImgPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-white/10">
      <span className="text-xs font-medium text-white/60">{label}</span>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString("ko-KR");

export default async function HomePage() {
  const { hero, stats: statsCopy } = siteConfig;
  const today = todayKst();
  // public/media/hero/hero-1.(jpg|png|…) 를 넣으면 자동으로 히어로 배경이 된다.
  const heroImg = firstImage(["media/hero/hero-1", "media/hero/hero"]);
  const sketch = await listMedia("sketch"); // 교육 현장 스케치 (관리자 드래그&드롭)
  const cohorts = await listCohorts();
  const all = await getProjects();
  const stats = await getDayStats(all, cohorts);
  const aceBoard = siteConfig.features.aceBoard ? await getAceBoard(cohorts, all) : [];
  const featured = featuredCohort(cohorts, today);

  // 최근 공개된 작품 3개 (전체 회차). 순위·채점 정보는 홈에서 노출하지 않는다.
  const recent = [...all]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3)
    .map((p) => ({ ...p, isNew: false, rank: null, avgScore: null }));
  // 채점 진행 중인 회차 작품은 AI 점수를 숨긴다
  const scoringIds = new Set(
    cohorts.filter((c) => c.scoringOpen && !c.rankRevealed).map((c) => c.id)
  );
  const hasData = stats.projects > 0;
  const cohortName = new Map(cohorts.map((c) => [c.id, c.name]));

  return (
    <div className="min-h-screen bg-base text-white">
      <SiteHeader />

      {/* 5.1 히어로 — 하루의 변화 */}
      <section className="relative overflow-hidden">
        {heroImg ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-base via-base/85 to-base/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-base to-transparent" />
          </>
        ) : (
          <>
            <div className="sky-bg absolute inset-0" />
            <div className="hud-grid absolute inset-0" />
          </>
        )}
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {hero.headline[0]}
              <br />
              <span className="text-accent">{hero.headline[1]}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{hero.sub}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={featured ? `/g/${featured.slug}` : "/sections"}
                className="rounded-full bg-accent px-6 py-3 text-sm font-bold text-on-accent transition hover:bg-accent-soft"
              >
                {hero.ctaPrimary}
              </Link>
              {siteConfig.features.eduApply && (
                <Link
                  href="/apply"
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:border-accent hover:text-accent"
                >
                  {hero.ctaSecondary}
                </Link>
              )}
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <DayCompare />
          </div>
        </div>
      </section>

      {/* 5.2 기대효과 4카드 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Eyebrow>Outcomes</Eyebrow>
        <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{siteConfig.outcomesTitle}</h2>
        <div className="mt-8">
          <OutcomeCards />
        </div>
      </section>

      {/* 5.3 실증 숫자 밴드 (실데이터) */}
      <section className="border-y border-white/10 bg-base-soft">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-accent">{statsCopy.title}</h2>
            <p className="text-xs text-white/60">
              {hasData ? statsCopy.note : statsCopy.empty(siteConfig.sorties[0])}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/10">
            {[
              { n: stats.projects, u: "개", l: statsCopy.labels.projects },
              { n: stats.pilots, u: "명", l: statsCopy.labels.pilots },
              { n: stats.feedback, u: "개", l: statsCopy.labels.feedback },
            ].map((s) => (
              <div key={s.l} className="px-2 text-center">
                <div className="font-mono text-3xl font-bold text-white sm:text-5xl">
                  {fmt(s.n)}
                  <span className="ml-1 font-sans text-base font-bold text-accent sm:text-xl">{s.u}</span>
                </div>
                <div className="mt-1 text-xs text-white/65 sm:text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.4 하루 일정 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Eyebrow>Schedule</Eyebrow>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{siteConfig.scheduleTitle}</h2>
          <span className="font-mono text-sm text-white/60">
            {siteConfig.day.start} – {siteConfig.day.end}
          </span>
        </div>
        <div className="mt-10">
          <DaySchedule />
        </div>
      </section>

      {/* 5.5 최근 등록된 작품 */}
      <section className="border-t border-white/10 bg-base-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex items-end justify-between">
            <div>
              <Eyebrow>Gallery</Eyebrow>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">최근 등록된 작품</h2>
            </div>
            <Link href="/sections" className="hidden text-sm font-bold text-accent hover:text-accent-soft sm:inline">
              전체 보기 →
            </Link>
          </div>
          {recent.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {recent.map((p) => (
                <ProjectCard key={p.id} project={p} hideAiScores={scoringIds.has(p.cohortId)} />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl bg-surface px-6 py-12 text-center text-sm text-white/65 ring-1 ring-white/10">
              아직 등록된 작품이 없습니다. 1회차 교육 당일부터 작품이 올라옵니다.
            </p>
          )}
          <Link
            href="/sections"
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-on-accent transition hover:bg-accent-soft sm:hidden"
          >
            전체 보기 →
          </Link>
        </div>
      </section>

      {/* 5.6 회차별 최우수 작품 — 순위 공개된 회차만 */}
      {aceBoard.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Best works</Eyebrow>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">회차별 최우수 작품</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aceBoard.flatMap(({ cohort, sortie, aces }) =>
              aces.map((p) => (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-surface p-5 ring-1 ring-signal/40 transition hover:-translate-y-0.5 hover:ring-signal"
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-white/65">
                      {cohort.sessionNo ? siteConfig.sortieLabel(cohort.sessionNo) : cohortName.get(cohort.id)}
                    </span>
                    {(cohort.location ?? sortie?.city) && (
                      <span className="text-white/65">· {cohort.location ?? sortie?.city}</span>
                    )}
                    <span className="ml-auto rounded-full bg-signal px-2 py-0.5 text-on-accent">
                      최우수{aces.length > 1 ? " (공동)" : ""}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-black text-white group-hover:text-signal">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/65">{p.tagline}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-white/80">{p.authorName}</span>
                    <span className="font-mono font-bold text-signal">{p.avgScore?.toFixed(2)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {/* 5.8 부대 교육 신청 배너 */}
      {siteConfig.features.eduApply && (
        <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
          <EduBanner />
        </section>
      )}

      {/* 5.9 현장 스케치 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow>Media</Eyebrow>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">현장 스케치</h2>
          </div>
          <Link href="/media" className="hidden text-sm font-bold text-accent hover:text-accent-soft sm:inline">
            전체 보기 →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {sketch.length > 0
            ? sketch.slice(0, 2).map((m) => (
                <div key={m.id} className="overflow-hidden rounded-xl ring-1 ring-white/10">
                  <MediaEmbed item={m} />
                </div>
              ))
            : ["교육 현장 사진 자리", "발표 현장 영상 자리"].map((l, i) => (
                <ImgPlaceholder key={i} label={l} />
              ))}
        </div>
      </section>

      {/* 5.7 교육 일정 — 하단 한 줄 띠 */}
      <section className="border-t border-white/10 bg-base-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 lg:flex-row lg:items-center">
          <span className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-white/60">교육 일정</span>
          <SortieStrip
            today={today}
            hrefOf={(s) => {
              const c = cohortForSortie(cohorts, s);
              return c ? `/g/${c.slug}` : null;
            }}
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
