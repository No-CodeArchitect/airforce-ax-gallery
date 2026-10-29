// 회차 이름을 "SORTIE 01 · 평택" → "1회차 · 평택" 으로 바꾼다 (한 번만 실행, 여러 번 실행해도 안전).
// 사용: node --env-file=.env scripts/rename-sorties.mjs
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await sb.from("cohorts").select("id, name");
if (error) throw new Error(error.message);

for (const c of data) {
  const m = c.name.match(/^SORTIE (\d+) · (.+)$/);
  if (!m) continue;
  const name = `${Number(m[1])}회차 · ${m[2]}`;
  const { error: e } = await sb.from("cohorts").update({ name }).eq("id", c.id);
  console.log(e ? `✗ ${c.name}: ${e.message}` : `✓ ${c.name} → ${name}`);
}
