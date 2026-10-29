// 5개 회차(1~5회차) 시드. 이미 같은 슬러그가 있으면 건너뛴다.
// 사용: npm run seed:sorties   (.env 의 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요)
// 일정은 lib/site-config.ts 의 sorties 와 같게 유지한다.

import { createClient } from "@supabase/supabase-js";

const SORTIES = [
  { no: 1, date: "2026-10-30", city: "평택" },
  { no: 2, date: "2026-11-06", city: "충주" },
  { no: 3, date: "2026-11-13", city: "수원" },
  { no: 4, date: "2026-11-20", city: "서산" },
  { no: 5, date: "2026-11-27", city: "대구" },
];

const pad = (n) => String(n).padStart(2, "0");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없습니다 (.env 확인).");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: existing, error } = await sb.from("cohorts").select("slug");
if (error) {
  console.error("cohorts 조회 실패:", error.message, "\n→ SUPABASE_MIGRATION_*.md SQL 을 먼저 실행하세요.");
  process.exit(1);
}
const have = new Set((existing ?? []).map((r) => r.slug));

for (const s of SORTIES) {
  const slug = `sortie-${pad(s.no)}`;
  if (have.has(slug)) {
    console.log(`= ${slug} 이미 있음 — 건너뜀`);
    continue;
  }
  const row = {
    id: `co_sortie${pad(s.no)}`,
    slug,
    name: `${s.no}회차 · ${s.city}`,
    scoring_open: true,
    rank_revealed: false,
    min_raters: 3,
    created_at: `${s.date}T00:00:00.000Z`,
    session_no: s.no,
    held_on: s.date,
    location: s.city,
  };
  const { error: insErr } = await sb.from("cohorts").insert(row);
  if (insErr) {
    console.error(`✗ ${slug} 실패: ${insErr.message}`);
    if (/column/i.test(insErr.message)) console.error("  → SUPABASE_MIGRATION_AIRFORCE.md SQL 을 먼저 실행하세요.");
    process.exitCode = 1;
  } else {
    console.log(`+ ${slug} (${row.name}) 생성`);
  }
}
