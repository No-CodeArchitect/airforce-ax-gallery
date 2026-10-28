// 인앱 브라우저 감지. 구글 로그인은 카카오톡·인스타그램·네이버 앱 등 인앱 브라우저(WebView)에서
// 차단된다(disallowed_useragent) → 로그인 버튼 대신 "다른 브라우저로 열기" 안내를 띄운다.

import "server-only";
import { headers } from "next/headers";

export type InAppKind = "kakaotalk" | "other" | null;

export interface InAppInfo {
  kind: InAppKind;
  os: "android" | "ios" | "other";
}

const OTHER_INAPP = /Instagram|NAVER\(inapp|FBAN|FBAV|FB_IAB|Line\/|DaumApps|everytimeApp|BAND\/|Whale\/.*inapp|; wv\)/i;

export function detectInApp(ua: string): InAppInfo {
  const os = /Android/i.test(ua) ? "android" : /iPhone|iPad|iPod/i.test(ua) ? "ios" : "other";
  if (/KAKAOTALK/i.test(ua)) return { kind: "kakaotalk", os };
  if (OTHER_INAPP.test(ua)) return { kind: "other", os };
  return { kind: null, os };
}

export async function getInApp(): Promise<InAppInfo> {
  return detectInApp((await headers()).get("user-agent") ?? "");
}

// 현재 요청의 origin (예: https://airforce-ax-gallery.vercel.app)
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return host ? `${proto}://${host}` : process.env.APP_URL ?? "";
}
