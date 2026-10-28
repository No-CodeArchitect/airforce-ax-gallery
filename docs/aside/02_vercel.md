# 2단계 — Vercel 배포

목표: GitHub 저장소를 새 Vercel 프로젝트로 연결해 `https://airforce-ax-gallery.vercel.app` 으로 배포합니다.
구글 로그인 값은 3단계에서 추가하므로, 이번 단계에서는 비워 둔 채로 배포합니다.

## 2-1. 프로젝트 가져오기
1. https://vercel.com/new 접속 (사용자 계정으로 로그인돼 있어야 함)
2. **Import Git Repository**에서 `No-CodeArchitect/airforce-ax-gallery` 를 고릅니다.
   - 목록에 없으면 **Adjust GitHub App Permissions**로 `No-CodeArchitect` 조직의 이 저장소에 접근 권한을 줍니다. GitHub 권한 승인 화면은 사용자에게 넘기세요.
3. 설정 화면
   - Vercel Team(Scope): 사용자의 개인(Hobby) 계정. 유료 팀만 보이면 멈추고 물어보세요.
   - **Project Name: `airforce-ax-gallery`** (이 이름이 주소가 됩니다)
   - Framework Preset: **Next.js** (자동 감지)
   - Root Directory: `./` (그대로)
   - Build / Output / Install 설정: 기본값 그대로

## 2-2. 환경변수 (Import 화면의 Environment Variables, 또는 배포 후 Settings → Environment Variables)
아래 키를 **Production · Preview · Development 모두**에 넣습니다.

| Key | Value |
|---|---|
| `SUPABASE_URL` | 1단계 Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 1단계 service_role/secret 키 (**Sensitive** 체크) |
| `AUTH_SECRET` | 1단계에서 만든 값과 같게 (**Sensitive**) |
| `ADMIN_PASSWORD` | 1단계에서 만든 값과 같게 (**Sensitive**) |
| `ADMIN_EMAILS` | `jjh@airi.kr` |
| `APP_URL` | `https://airforce-ax-gallery.vercel.app` (**Production에만**. Preview·Development에는 넣지 않음) |
| `ANTHROPIC_API_KEY` | 사용자에게 받은 값이 있을 때만 (**Sensitive**) |
| `ANTHROPIC_MODEL` | 넣지 않음 (기본 모델 사용) |

- 구글 키 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 은 **지금 넣지 않습니다** (3단계).
- 앞뒤 공백이나 따옴표가 들어가지 않게 주의하세요.

## 2-3. Deploy
1. **Deploy** → 빌드가 끝날 때까지 기다립니다 (2~4분).
2. 빌드가 실패하면 Build Logs 마지막 30줄을 보고서에 붙이고 멈춥니다. 비밀값이 섞여 있으면 가리세요.

## 2-4. 주소 확인 — 중요
1. 프로젝트 → **Settings → Domains** 에서 Production 주소가 `airforce-ax-gallery.vercel.app` 인지 확인합니다.
2. **다른 주소**가 붙었다면(예: `airforce-ax-gallery-abc123.vercel.app`, 이름이 이미 쓰이는 경우):
   - Domains에서 **Add** → `airforce-ax-gallery.vercel.app` 을 시도합니다.
   - 그래도 안 되면 실제로 붙은 주소를 쓰기로 하고, 다음을 모두 그 주소로 바꿉니다.
     - Vercel 환경변수 `APP_URL`
     - 3단계의 구글 리디렉션 URI
     - 보고서에 "주소 변경됨: …" 으로 기록
3. (선택, 권장) **Settings → Functions → Function Region** 을 `Seoul, South Korea (icn1)` 로 바꿉니다. Supabase(서울)와 가까워져 빨라집니다. Hobby 플랜에서 바꿀 수 없으면 그대로 둡니다.
4. **Settings → Deployment Protection** 에서 **Vercel Authentication이 Production에 걸려 있지 않은지** 확인합니다. 교육생이 로그인 없이 들어와야 합니다.
   - 기본값("Standard Protection", 미리보기에만 적용)은 그대로 둬도 됩니다.

## 2-5. 확인
1. `https://airforce-ax-gallery.vercel.app` → "코딩 0시간." 히어로가 보이는 홈이 뜨면 성공입니다.
2. `https://airforce-ax-gallery.vercel.app/api/health` 에서 확인할 것:
   - `"db": "ok (Supabase 연결됨)"`
   - `"sorties": 5`
   - `env` 의 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `ADMIN_PASSWORD`, `ADMIN_EMAILS`, `APP_URL` 이 모두 `true`
3. `/sections` 에 SORTIE 01~05 다섯 개 회차가 보이는지 확인합니다.
4. 환경변수를 배포 **후에** 넣거나 고쳤다면 **Deployments → 최신 배포 ⋯ → Redeploy** 를 해야 반영됩니다.

✅ 2단계 완료 → `03_google_oauth.md` 로 넘어갑니다.
