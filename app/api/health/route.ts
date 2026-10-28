import { NextResponse } from "next/server";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

// 진단용: 환경변수 "유무"(값 아님)와 Supabase 연결 상태만 보고한다.
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
    APP_URL: !!process.env.APP_URL,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
  };

  let db = "disabled (env 없음 → 인메모리)";
  let sorties: string | number = "-";
  const sb = getSupabase();
  if (sb) {
    try {
      const r = await sb.from("scores").select("project_id").limit(1);
      db = r.error ? `error: ${r.error.message}` : "ok (Supabase 연결됨)";
      // 공군 AX 마이그레이션(session_no 칸)과 회차 시드 확인
      const c = await sb.from("cohorts").select("session_no").not("session_no", "is", null);
      sorties = c.error ? `error: ${c.error.message}` : (c.data?.length ?? 0);
    } catch (e) {
      db = `exception: ${(e as Error).message}`;
    }
  }

  return NextResponse.json({ supabaseEnabled, env, db, sorties });
}
