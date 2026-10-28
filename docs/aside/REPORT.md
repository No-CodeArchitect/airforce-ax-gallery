# 어사이드 설정 보고서
- 작업 일시: 2026-10-28 (수) 19:00~20:35 KST
- Supabase 프로젝트 이름 / 리전 / Project URL: `airforce-ax-gallery` (새 Free 조직 `airforce-ax`, 계정 jjh@airi.kr) / Northeast Asia (Seoul) `ap-northeast-2`, Nano / `https://qfbfvqznwuubzuoaaowg.supabase.co`
- Vercel 프로젝트 이름 / 실제 Production 주소: `airforce-ax-gallery` (no-codearchitect's projects, Hobby) / `https://airforce-ax-gallery.vercel.app` (주소 변경 없음, Domains: Valid Configuration)
- Google Cloud 프로젝트 이름 / OAuth 동의 화면 게시 상태: `airforce-ax-gallery` (조직 airi.kr, 결제 미연결) / 외부(External), **프로덕션 단계**
- /api/health 결과:
```json
{"supabaseEnabled":true,"env":{"SUPABASE_URL":true,"SUPABASE_SERVICE_ROLE_KEY":true,"AUTH_SECRET":true,"ADMIN_PASSWORD":true,"GOOGLE_CLIENT_ID":true,"GOOGLE_CLIENT_SECRET":true,"ADMIN_EMAILS":true,"APP_URL":true,"ANTHROPIC_API_KEY":false},"db":"ok (Supabase 연결됨)","sorties":5}
```
- 최종 확인 체크리스트 결과(03 문서 끝):
  1. ✅ `/api/health` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 모두 true
  2. ✅ `/admin/login` → 비밀번호 칸 없이 "Google 계정으로 로그인" 버튼만 보임
  3. ✅(일부) 버튼 → 구글 계정 선택 화면 정상 표시, `redirect_uri_mismatch` 없음. 실제 로그인·`/admin` 회차 카드 확인은 **사용자가 직접** 진행 필요
  4. ✅ `/g/sortie-01/join` → "Google 계정으로 시작하기" 버튼 보임
  5. ✅ 동의 화면 게시 상태: 프로덕션 단계
- 그 밖에 확인한 것:
  - SQL 실행 결과: 테이블 6개(cohorts, comments, edu_requests, memberships, projects, scores) 확인, 회차 5행(sortie-01 평택 ~ sortie-05 대구) 확인
  - 홈(`/`) "코딩 0시간." 표시, `/sections` 에 SORTIE 01~05 표시
  - Vercel 환경변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET, ADMIN_PASSWORD, ADMIN_EMAILS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET → Production·Preview·Development 모두. APP_URL → Production만. 비밀값은 Secret(Sensitive) 유형. ANTHROPIC_API_KEY·ANTHROPIC_MODEL 미입력
  - Function Region: `icn1`(Seoul)로 변경 후 Redeploy 완료
  - Deployment Protection: Vercel Authentication = Standard Protection(미리보기만), Production 공개
  - OAuth 클라이언트 `airforce-ax-gallery-web`, 리디렉션 URI 2개(배포 주소, localhost:3000)
- 문제·보류 사항:
  - Supabase: 기존 계정의 유일한 조직이 Pro라 중단 → 사용자 결정으로 jjh@airi.kr 계정에 새 Free 조직 `airforce-ax` 생성 후 진행 (기존 Pro 조직 변경 없음)
  - Vercel: 첫 Deploy 때 이메일 코드 재인증(Reauthenticate) 요구 → 사용자가 직접 처리
  - Google: 프로덕션 게시에 홈페이지·개인정보처리방침 URL이 필수였음(문서는 비워 두라고 했음) → 사용자 승인 후 홈페이지 `https://airforce-ax-gallery.vercel.app`, 개인정보처리방침 `https://airforce-ax-gallery.vercel.app/privacy` 입력. 승인된 도메인 `airforce-ax-gallery.vercel.app` 자동 추가. 심사 요구 없이 게시됨
  - 로컬 `.env`: `.env.example` 기반으로 새로 만듦. SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET, ADMIN_PASSWORD(Vercel과 같은 값), ADMIN_EMAILS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET 입력, APP_URL은 비움. `.gitignore`에 `.env` 포함 확인. (처음엔 폴더 쓰기 권한이 없어 지연, 사용자가 권한 부여 후 작성)
  - 1-5 로컬 `npm run dev` 확인은 터미널 권한이 없어 하지 않음(선택 항목)
  - Anthropic API 키는 받지 않아 비워 둠 → AI 요약은 규칙 기반 임시 결과로 동작
  - 남은 일(사용자): `/admin/login` 에서 jjh@airi.kr 로 직접 로그인 → `/admin` 에 SORTIE 01~05 회차 카드가 보이는지 확인
