"use client";

import { useMemo } from "react";
import qrcode from "qrcode-generator";

// 회차 입장 URL QR 코드. 브라우저에서 바로 그린다 (외부 API 호출 없음).
export default function JoinQr({
  url,
  size = 160,
  className = "",
}: {
  url: string;
  size?: number;
  className?: string;
}) {
  const svg = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(url);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  }, [url]);

  return (
    <div
      role="img"
      aria-label={`입장 QR 코드: ${url}`}
      className={`overflow-hidden rounded-lg bg-white p-1 [&>svg]:h-full [&>svg]:w-full ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
