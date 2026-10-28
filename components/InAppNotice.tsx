"use client";

import { useState } from "react";

// 인앱 브라우저(카카오톡 등)에서 로그인 대신 보여 주는 안내.
// 안드로이드 카카오톡은 외부 브라우저로 여는 스킴을, 그 외 안드로이드는 크롬 intent 를,
// iOS 는 "⋯ → Safari로 열기" 그림 안내를 보여 준다.
export default function InAppNotice({
  url,
  kind,
  os,
}: {
  url: string;
  kind: "kakaotalk" | "other";
  os: "android" | "ios" | "other";
}) {
  const [copied, setCopied] = useState(false);
  const u = new URL(url);
  const externalHref =
    kind === "kakaotalk"
      ? `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`
      : `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(":", "")};package=com.android.chrome;end`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 복사 실패 시 주소를 길게 눌러 복사 */
    }
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="rounded-xl bg-signal/10 px-4 py-3 ring-1 ring-signal/40">
        <p className="font-bold text-signal">
          {kind === "kakaotalk" ? "카카오톡" : "앱 안"} 브라우저에서는 구글 로그인이 막혀 있어요
        </p>
        <p className="mt-1 text-xs leading-relaxed text-white/70">
          크롬·사파리 같은 기본 브라우저로 열면 바로 로그인할 수 있어요.
        </p>
      </div>

      {os === "android" && (
        <a
          href={externalHref}
          className="rounded-lg bg-accent px-4 py-3 text-center font-bold text-on-accent transition hover:bg-accent-soft"
        >
          다른 브라우저로 열기 ↗
        </a>
      )}

      {os !== "android" && (
        <ol className="flex flex-col gap-2 rounded-xl bg-base px-4 py-3 text-xs leading-relaxed text-white/75 ring-1 ring-white/10">
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-sm font-bold text-white">
              1
            </span>
            <span>
              화면 오른쪽 {kind === "kakaotalk" ? "아래" : "위"}의{" "}
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-white/15 px-1.5 font-bold text-white">
                ⋯
              </span>{" "}
              (또는 공유{" "}
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-white/15 px-1.5 text-white">
                ⇪
              </span>
              ) 버튼을 누르세요
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-sm font-bold text-white">
              2
            </span>
            <span>
              <span className="rounded-md bg-accent/20 px-1.5 py-0.5 font-bold text-accent">Safari로 열기</span>{" "}
              (다른 브라우저로 열기)를 고르세요
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-sm font-bold text-white">
              3
            </span>
            <span>열린 화면에서 「Google 계정으로 시작하기」를 누르면 끝!</span>
          </li>
        </ol>
      )}

      <button
        type="button"
        onClick={copy}
        className="rounded-lg border border-white/20 px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10"
      >
        {copied ? "주소를 복사했어요 ✓" : "주소 복사해서 직접 붙여넣기"}
      </button>
      <p className="break-all text-center font-mono text-[11px] text-white/60">{url}</p>
    </div>
  );
}
