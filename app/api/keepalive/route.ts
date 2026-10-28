import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Supabase Free 프로젝트는 7일간 활동이 없으면 일시정지된다.
// Vercel 크론(vercel.json, 매일 KST 06:00)이 이 주소를 불러 DB에 가벼운 조회를 한 번 남긴다.
// CRON_SECRET 환경변수가 있으면 Vercel 크론 요청(Authorization: Bearer …)만 받는다.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: true, db: "disabled" });
  const { error } = await sb.from("cohorts").select("id").limit(1);
  return NextResponse.json({ ok: !error, at: new Date().toISOString() }, { status: error ? 500 : 200 });
}
