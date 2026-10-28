import { ImageResponse } from "next/og";
import { EMBLEM_H, EMBLEM_W, emblemDataUrl } from "@/lib/og-emblem";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.galleryTitle;

// OG 이미지: 엠블럼(흰 바탕 카드) + 워드마크 + 헤드라인. 한글 글꼴이 없을 수 있어
// 큰 문구는 엠블럼 속 한글과 영문 위주로 구성한다.
export default async function OpengraphImage() {
  const src = await emblemDataUrl();
  const w = 640;
  const h = (EMBLEM_H / EMBLEM_W) * w;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          background: "linear-gradient(180deg, #15304F 0%, #0B1A2E 80%)",
          color: "#F4F8FC",
        }}
      >
        <div style={{ display: "flex", background: "#ffffff", borderRadius: 28, padding: "20px 36px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={w} height={h} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 6, color: "#4FB3FF" }}>
          FIRST FLIGHT · AI VIBE-CODING GALLERY
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "rgba(244,248,252,0.7)", letterSpacing: 4 }}>
          09:00 TAKEOFF → 17:00 LANDING
        </div>
      </div>
    ),
    size
  );
}
