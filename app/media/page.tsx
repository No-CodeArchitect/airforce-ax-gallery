import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import MediaEmbed from "@/components/site/MediaEmbed";
import { listMedia } from "@/lib/media-items";
import { Eyebrow } from "@/components/site/Brand";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const items = await listMedia("sketch");

  return (
    <div className="min-h-screen bg-base text-white">
      <SiteHeader />

      <section className="border-b border-white/10 bg-base-soft">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Eyebrow>Media</Eyebrow>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            영상 · 미디어
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/60">
            회차별 교육 현장과 발표 순간을 모았습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-xl bg-surface ring-1 ring-white/10"
              >
                <MediaEmbed item={m} />
                <div className="p-4 text-sm font-semibold text-white">
                  {m.title}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {["오리엔테이션", "실습", "작품 등록", "발표", "시상", "현장 스케치"].map(
              (l, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl bg-surface ring-1 ring-white/10"
                >
                  <div className="relative flex aspect-video items-center justify-center bg-white/[0.05]">
                    <span className="text-xs text-white/60">{l} 영상 자리</span>
                    <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent/90 text-on-accent">
                      ▶
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
