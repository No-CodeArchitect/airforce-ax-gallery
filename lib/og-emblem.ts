// 파비콘·OG 이미지 생성용: 엠블럼 PNG 를 data URL 로 읽는다 (원본 1600×533).
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const EMBLEM_W = 1600;
export const EMBLEM_H = 533;

export async function emblemDataUrl(): Promise<string> {
  const buf = await readFile(path.join(process.cwd(), "public/media/brand/emblem.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}
