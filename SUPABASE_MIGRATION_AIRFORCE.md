# Supabase 마이그레이션 — 공군 AX 1일 특강 (회차 정보 · 입장 코드 · 보안 확인)

새 Supabase 프로젝트에서는 **아래 순서**로 SQL을 실행합니다 (SQL Editor → New query → Run).

1. `SUPABASE_SETUP.md` (채점·댓글 기본 테이블)
2. `SUPABASE_MIGRATION_SECTIONS.md` — 단, 맨 아래 "기존 데모 섹션 승계" `insert` 는 **실행하지 마세요** (KAIST 데모 섹션)
3. `SUPABASE_MIGRATION_PROJECTS.md`
4. `SUPABASE_MIGRATION_MEMBERS.md`
5. `SUPABASE_MIGRATION_QC.md`
6. **이 파일**

```sql
-- 회차(섹션) 정보 — 1일 특강 운영용
alter table cohorts add column if not exists session_no int;              -- 회차 1~5 (SORTIE 번호)
alter table cohorts add column if not exists held_on date;                -- 교육일
alter table cohorts add column if not exists location text;               -- 도시명만 (평택·충주·수원·서산·대구)
alter table cohorts add column if not exists join_code_hash text;         -- 입장 코드 해시 (원문 저장 안 함)
alter table cohorts add column if not exists submit_due_at timestamptz;   -- 착륙 신고(작품 등록) 마감 표시용
alter table cohorts add column if not exists score_due_at timestamptz;    -- 채점 마감 표시용

-- 작품 등록 시 보안 확인 체크 (서버에서 필수 검증)
alter table projects add column if not exists security_ack boolean not null default false;
```

## 5개 회차 만들기

SQL 실행 후, 로컬에서 `.env` 에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 를 넣고:

```bash
npm run seed:sorties
```

- `lib/site-config.ts` 의 `sorties`(1.2 일정)로 `sortie-01` ~ `sortie-05` 회차를 만듭니다. 이름은 `SORTIE 01 · 평택` 형식.
- 같은 슬러그가 이미 있으면 **건너뜁니다** (여러 번 실행해도 안전).
- 관리자 화면(`/admin`)의 「새 회차 추가」로 하나씩 만들어도 됩니다.

## 확인
- `/admin` 회차 카드에 「회차 정보」(번호·교육일·지역·마감 시각), 「입장 코드」, 「입장 QR」이 보이면 정상입니다.
- 입장 코드를 설정하면 `/g/<slug>/join` 가입 폼에 「입장 코드」 칸이 생기고, 맞게 넣은 사람은 즉시 수락됩니다.
- 작품 등록 폼의 보안 확인 체크 없이 저장하면 서버가 거부합니다.

## 마이그레이션 전이라면?
- 로컬(인메모리)에서는 그대로 동작합니다.
- 배포본(Vercel)에서는 회차 정보·입장 코드 저장 시 "cohorts 테이블에 회차 칸이 없습니다" 오류가, 작품 저장 시 projects 오류가 납니다 → 위 SQL을 실행하세요.
