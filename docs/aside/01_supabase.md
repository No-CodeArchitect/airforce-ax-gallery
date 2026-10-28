# 1단계 — Supabase 설정

목표: 새 Supabase 프로젝트를 만들고, 테이블 6개와 회차 5개를 넣고, 접속 정보를 로컬 `.env` 에 저장합니다.

## 1-1. 프로젝트 만들기
1. https://supabase.com/dashboard 접속 (사용자 계정으로 로그인돼 있어야 함)
2. **새 Free 조직을 만듭니다** (사용자 결정: 비용 0원).
   - 기존 `No-CodeArchitect's Org`(Pro 플랜)에는 **만들지 않습니다.** Pro 조직에 만들면 컴퓨트 비용이 추가됩니다.
   - 조직 선택 메뉴 → **New organization**
     - Name: `airforce-ax`
     - Type: Personal (또는 Educational)
     - Plan: **Free - $0/month**
   - 결제 수단 등록을 요구하면 멈추고 사용자에게 물어보세요.
3. 방금 만든 `airforce-ax` 조직 안에서 **New project**
   - Name: `airforce-ax-gallery`
   - Database Password: **Generate a password** 버튼을 누릅니다. 이 앱은 DB 비밀번호를 쓰지 않으므로 따로 적어 둘 필요가 없습니다.
   - Region: **Northeast Asia (Seoul)** — `ap-northeast-2`
   - Plan: Free
4. **Create new project** → 준비될 때까지 1~2분 기다립니다.
   - 무료 프로젝트 2개 한도(계정 전체 기준)에 걸리면 멈추고 사용자에게 물어보세요. 기존 프로젝트를 지우지 마세요.

> 참고: Free 프로젝트는 7일 동안 활동이 없으면 자동으로 일시정지됩니다.
> 앱에 Vercel 크론(`/api/keepalive`, 매일 06:00)이 들어 있어서, 2단계 배포가 끝나면 매일 DB를 깨웁니다. 따로 할 일은 없습니다.

## 1-2. 테이블 + 회차 만들기 (SQL 한 번 실행)
1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. 로컬 파일 `C:\AI_WORK\04_DEV\airforce-ax-gallery\supabase\setup-airforce.sql` 을 열어 **전체 내용**을 복사합니다.
3. 붙여넣고 **Run** (경고 창이 나오면 "Run this query" 확인).
4. 결과 확인
   - 오류가 없어야 합니다.
   - 마지막 결과 표에 회차 5행(`sortie-01 … sortie-05`, 평택·충주·수원·서산·대구)이 보이면 성공입니다.
   - 결과 탭이 하나만 보이면 **Table Editor**에서 `cohorts` 테이블에 5행이 있는지 확인하세요.
   - 확인할 테이블 6개: `scores`, `comments`, `cohorts`, `projects`, `edu_requests`, `memberships`
5. ⚠ 레포의 `SUPABASE_MIGRATION_SECTIONS.md` 에 있는 KAIST 데모 `insert` 는 **실행하지 마세요.** 이 SQL 파일에는 이미 빠져 있습니다.

> Storage 버킷(`media`, `site-private`)은 앱이 처음 업로드할 때 자동으로 만들어집니다. 직접 만들지 마세요.

## 1-3. 접속 정보 복사
**Project Settings → API** (또는 **Data API**, **API Keys**) 에서:
- **Project URL**: `https://xxxx.supabase.co` → 이하 `SUPABASE_URL`
- **service_role** 키 (secret, "Reveal" 버튼) → 이하 `SUPABASE_SERVICE_ROLE_KEY`
  - 새 UI라서 `sb_secret_...` 형식의 **Secret key**만 보이면 그것을 쓰면 됩니다.
  - ⚠ `anon` / `publishable` 키가 **아닙니다.**

## 1-4. 로컬 `.env` 파일 만들기
1. `C:\AI_WORK\04_DEV\airforce-ax-gallery\.env.example` 을 복사해 같은 폴더에 `.env` 를 만듭니다. `.env` 가 이미 있으면 덮어쓰지 말고 해당 줄만 고칩니다.
2. 아래 값을 채웁니다.
   ```
   SUPABASE_URL=(1-3의 Project URL)
   SUPABASE_SERVICE_ROLE_KEY=(1-3의 service_role/secret 키)
   AUTH_SECRET=(아래 방법으로 만든 긴 무작위 문자열)
   ADMIN_PASSWORD=(아래 방법으로 만든 긴 무작위 문자열)
   ADMIN_EMAILS=jjh@airi.kr
   APP_URL=
   ```
   - **로컬 `.env` 의 `APP_URL` 은 반드시 비워 둡니다.** 값이 있으면 로컬에서 로그인할 때 배포 주소로 튕겨 나갑니다.
   - `AUTH_SECRET`, `ADMIN_PASSWORD`: 비밀번호 생성기로 **영문·숫자 40자 이상**의 무작위 문자열을 각각 따로 만듭니다.
     - 터미널을 쓸 수 있다면 아래 명령으로 만들어도 됩니다 (실행할 때마다 다른 값이 나옴):
       ```bash
       node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
       ```
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 은 3단계에서 채웁니다. 지금은 비워 둡니다.
   - `ANTHROPIC_API_KEY`: 사용자가 준 값이 있으면 넣고, 없으면 비워 둡니다.
3. **같은 `AUTH_SECRET`, `ADMIN_PASSWORD` 값을 2단계 Vercel에도 그대로 씁니다.**

## 1-5. 확인 (터미널을 쓸 수 있을 때만, 선택)
```bash
cd C:\AI_WORK\04_DEV\airforce-ax-gallery
npm run dev
```
브라우저에서 `http://localhost:3000/api/health` 를 엽니다.
- `"db": "ok (Supabase 연결됨)"` 이고 `"sorties": 5` 이면 성공입니다.
- 확인 후 개발 서버를 끕니다(Ctrl+C).

✅ 1단계 완료 → `02_vercel.md` 로 넘어갑니다.
