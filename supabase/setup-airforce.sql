-- 공군 AX · AI 입문 특강 갤러리 — 새 Supabase 프로젝트 초기 설정 (한 번에 실행)
-- SUPABASE_SETUP.md + SUPABASE_MIGRATION_{SECTIONS,PROJECTS,MEMBERS,QC,AIRFORCE}.md 를 합친 것.
-- KAIST 데모 섹션·명단 insert 와 더 이상 쓰지 않는 students / settings 테이블은 뺐다.
-- 여러 번 실행해도 안전하다 (if not exists / on conflict do nothing).

-- 채점
create table if not exists scores (
  project_id text not null,
  student_id text not null,
  completeness int not null check (completeness between 1 and 5),
  creativity int not null check (creativity between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (project_id, student_id)
);

-- 댓글
create table if not exists comments (
  id text primary key,
  project_id text not null,
  author_id text,
  author_name text,
  ai_nickname text,
  body text not null,
  is_author_reply boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_project_idx on comments (project_id, created_at);

-- 회차(섹션)
create table if not exists cohorts (
  id text primary key,
  slug text unique not null,
  name text not null,
  scoring_open boolean not null default true,
  rank_revealed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table cohorts add column if not exists min_raters integer not null default 3;
alter table cohorts add column if not exists session_no int;
alter table cohorts add column if not exists held_on date;
alter table cohorts add column if not exists location text;
alter table cohorts add column if not exists join_code_hash text;
alter table cohorts add column if not exists submit_due_at timestamptz;
alter table cohorts add column if not exists score_due_at timestamptz;

-- 작품 (1인 1작품)
create table if not exists projects (
  id text primary key,
  cohort_id text not null,
  author_id text not null unique,
  author_name text not null,
  submission jsonb not null,
  status text not null default 'pending',
  needs_analysis boolean not null default true,
  ai jsonb,
  thumb_url text,
  thumb_path text,
  error text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  analyzed_at timestamptz,
  published_at timestamptz
);
create index if not exists projects_cohort_idx on projects (cohort_id);
alter table projects add column if not exists security_ack boolean not null default false;

-- 부대 AI 입문 특강 신청
create table if not exists edu_requests (
  id text primary key,
  unit text not null,
  contact_name text not null,
  phone text not null,
  email text not null default '',
  headcount text not null default '',
  period text not null default '',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- 회차 가입 (구글 계정 1개 : 회차별 가입 1건)
create table if not exists memberships (
  id text primary key,
  cohort_id text not null,
  google_sub text not null,
  email text not null,
  google_name text not null default '',
  real_name text not null,
  nickname text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (cohort_id, google_sub)
);
create index if not exists memberships_sub_idx on memberships (google_sub);

-- 서버(service_role)만 접근한다. 공개(anon) 키로는 읽기·쓰기 불가.
alter table scores enable row level security;
alter table comments enable row level security;
alter table cohorts enable row level security;
alter table projects enable row level security;
alter table edu_requests enable row level security;
alter table memberships enable row level security;

-- 5개 회차 시드 (npm run seed:sorties 와 같은 값)
insert into cohorts (id, slug, name, scoring_open, rank_revealed, min_raters, created_at, session_no, held_on, location) values
  ('co_sortie01', 'sortie-01', '1회차 · 평택', true, false, 3, '2026-10-30T00:00:00Z', 1, '2026-10-30', '평택'),
  ('co_sortie02', 'sortie-02', '2회차 · 충주', true, false, 3, '2026-11-06T00:00:00Z', 2, '2026-11-06', '충주'),
  ('co_sortie03', 'sortie-03', '3회차 · 수원', true, false, 3, '2026-11-13T00:00:00Z', 3, '2026-11-13', '수원'),
  ('co_sortie04', 'sortie-04', '4회차 · 서산', true, false, 3, '2026-11-20T00:00:00Z', 4, '2026-11-20', '서산'),
  ('co_sortie05', 'sortie-05', '5회차 · 대구', true, false, 3, '2026-11-27T00:00:00Z', 5, '2026-11-27', '대구')
on conflict (slug) do nothing;

-- 확인용: 아래 결과에 6개 테이블과 회차 5행이 보이면 성공
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('scores','comments','cohorts','projects','edu_requests','memberships')
order by table_name;
select slug, name, held_on, location from cohorts order by session_no;
