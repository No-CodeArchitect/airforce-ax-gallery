import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import MediaEmbed from "@/components/site/MediaEmbed";
import { Eyebrow } from "@/components/site/Brand";
import { FlightPlan, OutcomeCards } from "@/components/site/DayBlocks";
import { getAboutMedia } from "@/lib/media-items";
import { siteConfig, shortDate, sortieState, todayKst } from "@/lib/site-config";

export const metadata: Metadata = { title: "특강 소개" };
export const dynamic = "force-dynamic";

const STATE_LABEL = { upcoming: "예정", today: "오늘 비행 중", done: "완료" } as const;

export default async function AboutPage() {
  const video = await getAboutMedia(); // 관리자가 지정한 대표 영상 (없으면 숨김)
  const today = todayKst();
  const o = siteConfig.overview;

  return (
    <div className="min-h-screen bg-base text-white">
      <SiteHeader />

      {/* 개요 */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="sky-bg absolute inset-0" />
        <div className="hud-grid absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div>
            <Eyebrow>Briefing</Eyebrow>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{siteConfig.name}</h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-white/75">
              코딩을 몰라도 괜찮아요. 오늘 하루, 내 업무를 돕는 첫 AI 도구를 직접 만듭니다. 아침에는
              Claude에게 일을 맡기는 법을 익히고, 오후에는 말로 설명한 아이디어를 바이브코딩으로 웹앱으로
              만들어 띄운 뒤, 저녁에는 동료와 함께 디브리핑합니다.
            </p>
            <dl className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              {[
                ["대상", o.audience],
                ["형식", o.format],
                ["제공", o.provided],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-base/70 px-4 py-3 ring-1 ring-white/10">
                  <dt className="text-xs font-bold text-accent">{k}</dt>
                  <dd className="mt-1 leading-relaxed text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {video && <MediaEmbed item={video} className="rounded-xl ring-1 ring-white/10" />}
        </div>
      </section>

      {/* 기대효과 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Eyebrow>After one day</Eyebrow>
        <h2 className="mt-4 text-2xl font-black sm:text-3xl">{siteConfig.outcomesTitle}</h2>
        <div className="mt-8">
          <OutcomeCards />
        </div>
      </section>

      {/* 하루 비행 계획 */}
      <section className="border-t border-white/10 bg-base-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Eyebrow>Flight plan</Eyebrow>
          <h2 className="mt-4 text-2xl font-black sm:text-3xl">{siteConfig.flightPlanTitle}</h2>
          <p className="mt-3 text-sm text-white/60">
            {siteConfig.day.start} 시작 · 점심 {siteConfig.day.lunch.join("~")} · {siteConfig.day.end} 종료. 세부 시각은
            현장 상황에 따라 조정될 수 있어요.
          </p>
          <div className="mt-10">
            <FlightPlan />
          </div>
        </div>
      </section>

      {/* 일정표 */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Eyebrow>Schedule</Eyebrow>
        <h2 className="mt-4 text-2xl font-black sm:text-3xl">교육 일정</h2>
        <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs text-white/60">
              <tr>
                <th className="px-4 py-3 font-semibold">회차</th>
                <th className="px-4 py-3 font-semibold">날짜</th>
                <th className="px-4 py-3 font-semibold">지역</th>
                <th className="px-4 py-3 text-right font-semibold">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {siteConfig.sorties.map((s) => {
                const st = sortieState(s, today);
                return (
                  <tr key={s.no} className={st === "today" ? "bg-signal/10" : ""}>
                    <td className="px-4 py-3 font-mono font-bold text-accent">{siteConfig.sortieLabel(s.no)}</td>
                    <td className="px-4 py-3 font-mono text-white/85">{shortDate(s.date)}</td>
                    <td className="px-4 py-3 font-semibold text-white">{s.city}</td>
                    <td className={`px-4 py-3 text-right text-xs font-semibold ${st === "today" ? "text-signal" : "text-white/60"}`}>
                      {STATE_LABEL[st]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-sm text-white/60">운영: {siteConfig.operator}</p>
      </section>

      <SiteFooter />
    </div>
  );
}
