import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { Eyebrow } from "@/components/site/Brand";
import { listImages } from "@/lib/media";
import { listCohorts, sortieSlug, type Cohort } from "@/lib/cohorts-store";
import { getProjects } from "@/lib/projects-data";
import { aceOf, sortieOf } from "@/lib/home-data";
import { siteConfig, shortDate, sortieState, todayKst } from "@/lib/site-config";

export const metadata: Metadata = { title: "회차 기록" };
export const dynamic = "force-dynamic";

const STATE_TAG = {
  upcoming: { label: "예정", cls: "bg-white/10 text-white/70" },
  today: { label: "오늘 진행", cls: "bg-signal text-on-accent" },
  done: { label: "종료", cls: "bg-accent/15 text-accent" },
} as const;

// 회차 배열: 회차 DB(섹션)에서 만들고, 아직 DB 에 없는 일정은 site-config 로 채운다.
export default async function ArchivePage() {
  const today = todayKst();
  const cohorts = await listCohorts();
  const all = await getProjects();

  type Entry = { no: number | null; date: string | null; city: string | null; cohort: Cohort | null };
  const entries: Entry[] = cohorts.map((c) => {
    const s = sortieOf(c);
    return { no: c.sessionNo ?? s?.no ?? null, date: c.heldOn ?? s?.date ?? null, city: c.location ?? s?.city ?? null, cohort: c };
  });
  for (const s of siteConfig.sorties) {
    if (!entries.some((e) => e.no === s.no)) entries.push({ no: s.no, date: s.date, city: s.city, cohort: null });
  }
  entries.sort((a, b) => (a.no ?? 99) - (b.no ?? 99) || (a.date ?? "").localeCompare(b.date ?? ""));

  const rows = await Promise.all(
    entries.map(async (e) => {
      const projects = e.cohort ? all.filter((p) => p.cohortId === e.cohort!.id) : [];
      const aces = e.cohort ? await aceOf(e.cohort, projects) : [];
      const folder = `media/archive/${e.no ? sortieSlug(e.no) : e.cohort?.slug ?? ""}`;
      const state = e.date ? sortieState({ no: e.no ?? 0, date: e.date, city: e.city ?? "" }, today) : "upcoming";
      return { ...e, count: projects.length, aces, photos: listImages(folder), folder, state };
    })
  );

  return (
    <div className="min-h-screen bg-base text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-base-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Eyebrow>Archive</Eyebrow>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">회차별 기록</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/70">
            다섯 개 지역에서 진행하는 회차별 기록입니다. 회차마다 하루 동안 완성된 작품 수와 최우수 작품,
            현장 사진을 모았습니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {rows.map((r) => {
          const label = r.no ? siteConfig.sortieLabel(r.no) : r.cohort?.name ?? "";
          const tag = STATE_TAG[r.state];
          return (
            <section key={`${r.no}-${r.cohort?.id ?? "plan"}`} className="mb-14 last:mb-0">
              <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-black text-white">{label}</h2>
                {r.city && <span className="text-xl font-black text-white">{r.city}</span>}
                {r.date && <span className="font-mono text-sm text-white/60">{shortDate(r.date)}</span>}
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${tag.cls}`}>{tag.label}</span>
                <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-white/75 ring-1 ring-white/10">
                    작품 <b className="font-mono text-white">{r.count}</b>개
                  </span>
                  {r.cohort && (
                    <Link
                      href={`/g/${r.cohort.slug}`}
                      className="rounded-full border border-accent/50 px-3 py-1 text-xs font-bold text-accent hover:bg-accent hover:text-on-accent"
                    >
                      갤러리 →
                    </Link>
                  )}
                </div>
              </div>

              {r.aces.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.aces.map((p) => (
                    <Link
                      key={p.id}
                      href={`/project/${p.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-signal/10 px-3 py-1.5 text-sm ring-1 ring-signal/50 hover:bg-signal/20"
                    >
                      <span className="rounded-full bg-signal px-2 py-0.5 text-[11px] font-bold text-on-accent">최우수</span>
                      <span className="font-bold text-white">{p.title}</span>
                      <span className="text-white/65">· {p.authorName}</span>
                    </Link>
                  ))}
                </div>
              )}

              {/* 사진 스트립 (public/media/archive/sortie-0n/ 에 넣으면 자동 표시) */}
              {r.photos.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {r.photos.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt={`${label} 현장`}
                      className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-white/10"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex aspect-[16/5] items-center justify-center rounded-xl bg-white/[0.04] px-4 text-center ring-1 ring-white/10">
                  <span className="text-xs text-white/60">
                    {r.state === "upcoming" ? "교육 후 현장 사진이 올라옵니다" : "현장 사진 준비 중"}
                  </span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <SiteFooter />
    </div>
  );
}
