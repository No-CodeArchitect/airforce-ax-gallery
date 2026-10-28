import { ImageResponse } from "next/og";
import { EMBLEM_H, EMBLEM_W, emblemDataUrl } from "@/lib/og-emblem";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// 파비콘: 흰 바탕 위에 엠블럼의 "AX" 마크 부분만 보이도록 배치 (엠블럼 비율·색은 그대로).
export default async function Icon() {
  const src = await emblemDataUrl();
  const scale = 58 / 680; // 마크 폭(원본 약 680px)을 58px 로
  const w = EMBLEM_W * scale;
  const h = EMBLEM_H * scale;
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: "#ffffff",
          borderRadius: 14,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={w} height={h} alt="" style={{ position: "absolute", left: 3 - 35 * scale, top: 32 - 250 * scale }} />
      </div>
    ),
    size
  );
}
