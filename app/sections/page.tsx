import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { Eyebrow } from "@/components/site/Brand";
import { listCohorts } from "@/lib/cohorts-store";
import { sortieOf } from "@/lib/home-data";
import { shortDate, sortieState, todayKst } from "@/lib/site-config";

export const metadata: Metadata = { title: "작품 갤러리" };
export const dynamic = "force-dynamic";

export default async function SectionsPage() {
  const today = todayKst();
  const cohorts = (await listCohorts()).sort(
    (a, b) => (a.sessionNo ?? 99) - (b.sessionNo ?? 99) || a.createdAt.localeCompare(b.createdAt)
  );

  return (
    <div className="min-h-screen bg-base text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-base-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Eyebrow>Gallery</Eyebrow>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">작품 갤러리</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/70">
            회차별 작품 갤러리입니다. 들어갈 회차를 선택하세요.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {cohorts.length === 0 ? (
          <p className="text-sm text-white/60">아직 회차가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cohorts.map((c) => {
              const date = c.heldOn ?? sortieOf(c)?.date ?? null;
              const isToday = date ? sortieState({ no: 0, date, city: "" }, today) === "today" : false;
              return (
                <Link
                  key={c.id}
                  href={`/g/${c.slug}`}
                  className={`group flex flex-col justify-between rounded-2xl bg-surface p-6 ring-1 transition hover:-translate-y-0.5 ${
                    isToday ? "ring-signal/60" : "ring-white/10 hover:ring-accent/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${isToday ? "bg-signal" : "bg-accent"}`} />
                      {c.rankRevealed ? (
                        <span className="text-xs font-bold text-signal">순위 공개</span>
                      ) : (
                        <span className="text-xs font-medium text-white/55">
                          {isToday ? "오늘 진행" : c.scoringOpen ? "채점 진행 중" : "채점 마감"}
                        </span>
                      )}
                      {date && <span className="ml-auto font-mono text-xs text-white/60">{shortDate(date)}</span>}
                    </div>
                    <h2 className="mt-3 text-xl font-black text-white group-hover:text-accent">{c.name}</h2>
                  </div>
                  <span className="mt-6 text-sm font-bold text-accent">입장 →</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
