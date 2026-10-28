# 3단계 — 구글 로그인(OAuth) 연결

목표: 이 사이트 전용 **새** Google OAuth 클라이언트를 만들어 Vercel과 로컬 `.env` 에 넣습니다.
이 클라이언트 하나로 관리자 로그인과 교육생 로그인을 모두 처리합니다.

> 원본(KAIST) 사이트용 OAuth 클라이언트는 **수정하지 마세요.** 새 Google Cloud 프로젝트에 새로 만듭니다.

## 3-1. Google Cloud 프로젝트
1. https://console.cloud.google.com 접속 (사용자 구글 계정)
2. 상단 프로젝트 선택 → **새 프로젝트**
   - 이름: `airforce-ax-gallery`
   - 조직/위치: 기본값. 선택을 요구하면 사용자에게 물어보세요.
3. 만든 프로젝트가 상단에 선택돼 있는지 확인합니다.
4. 결제 계정 연결을 요구하면 연결하지 말고 멈춥니다. OAuth만 쓰므로 필요 없습니다.

## 3-2. OAuth 동의 화면 (Google Auth Platform → Branding / Audience)
1. 왼쪽 **API 및 서비스 → OAuth 동의 화면** (새 UI에서는 **Google Auth Platform → 시작하기**)
2. 앱 정보
   - 앱 이름: `공군 AX AI 입문 특강 갤러리`
   - 사용자 지원 이메일: `jjh@airi.kr` (선택지에 없으면 로그인된 사용자 계정 이메일)
3. 대상(Audience): **외부(External)** — 교육생 개인 구글 계정도 로그인해야 하기 때문입니다.
4. 연락처 정보: `jjh@airi.kr`
5. 앱 홈페이지·개인정보처리방침·서비스약관 링크는 **비워 둡니다.** 넣으면 도메인 확인을 요구할 수 있습니다.
6. 범위(Scopes)는 **추가하지 않습니다.** 기본 `openid`, `email`, `profile` 만 씁니다.
7. **게시 상태를 "프로덕션 단계(In production)"로 변경 (필수)**
   - 대상(Audience) 화면 → **앱 게시(Publish app)** → 확인
   - "테스트" 상태로 두면 테스트 사용자로 등록한 계정만 로그인됩니다. 교육생 30명이 로그인하지 못합니다.
   - 기본 범위만 쓰므로 인증(심사) 없이 바로 게시됩니다. 심사 요구가 나오면 멈추고 보고하세요.

## 3-3. OAuth 클라이언트 ID 만들기
1. **사용자 인증 정보(Credentials) → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID** (새 UI: **Clients → Create client**)
2. 애플리케이션 유형: **웹 애플리케이션**
3. 이름: `airforce-ax-gallery-web`
4. **승인된 자바스크립트 원본**: 비워 둡니다.
5. **승인된 리디렉션 URI** — 아래 2개를 **정확히** 입력합니다 (끝에 `/` 없음):
   ```
   https://airforce-ax-gallery.vercel.app/api/admin/google/callback
   http://localhost:3000/api/admin/google/callback
   ```
   - 2단계에서 주소가 바뀌었다면 첫 줄을 실제 주소로 바꿉니다.
   - 교육생 로그인도 같은 `/api/admin/google/callback` 주소를 씁니다. 별도 주소를 추가하지 않습니다.
6. **만들기** → 나온 **클라이언트 ID**와 **클라이언트 보안 비밀번호(Client Secret)** 를 바로 다음 단계에 넣습니다.
   - Secret은 나중에 다시 볼 수 없을 수 있으니, 창을 닫기 전에 Vercel과 `.env` 에 모두 넣으세요.

## 3-4. 값 넣기
**Vercel** → 프로젝트 → Settings → Environment Variables (Production · Preview · Development 모두):

| Key | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | 클라이언트 ID (`…apps.googleusercontent.com`) |
| `GOOGLE_CLIENT_SECRET` | 클라이언트 보안 비밀번호 (**Sensitive**) |

→ **Deployments → 최신 배포 ⋯ → Redeploy** (환경변수는 새 배포부터 적용됩니다)

**로컬 `.env`** (`C:\AI_WORK\04_DEV\airforce-ax-gallery\.env`) 에도 같은 두 줄을 채웁니다.

## 3-5. 최종 확인 체크리스트
재배포가 끝나면 차례로 확인하고, 결과를 `REPORT.md` 에 ✅/❌ 로 적습니다.

1. [ ] `/api/health` → `env` 의 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 이 `true`
2. [ ] `/admin/login` → 비밀번호 칸 없이 **"Google 계정으로 로그인"** 버튼만 보임
3. [ ] 그 버튼 → 구글 계정 선택 화면이 뜸 (`redirect_uri_mismatch` 오류가 없어야 함)
   - 계정 선택·로그인은 **사용자가 직접** `jjh@airi.kr` 로 하도록 넘깁니다.
   - 로그인 후 `/admin` 관리자 콘솔이 열리고, SORTIE 01~05 회차 카드가 보이면 성공입니다.
4. [ ] `/g/sortie-01/join` → "Google 계정으로 시작하기" 버튼이 보임
5. [ ] 구글 동의 화면이 **프로덕션** 상태 (3-2의 7번)

## 문제 해결
| 증상 | 해결 |
|---|---|
| `redirect_uri_mismatch` | 3-3의 리디렉션 URI와 실제 주소가 한 글자라도 다름. `https`, 도메인 철자, 끝의 `/` 확인. Vercel의 `APP_URL` 도 같은 주소인지 확인 |
| `invalid_client` | `GOOGLE_CLIENT_ID` 오타, 또는 다른 프로젝트의 ID |
| 로그인 후 "구글 로그인에 실패했습니다" | `GOOGLE_CLIENT_SECRET` 오타, 또는 Redeploy를 하지 않음 |
| "관리자로 등록되지 않은 계정입니다" | 로그인한 계정이 `jjh@airi.kr` 가 아님. Vercel의 `ADMIN_EMAILS` 확인 |
| "액세스 차단됨 / 테스트 사용자만" | 동의 화면이 아직 테스트 상태. 3-2의 7번 다시 하기 |
| 카카오톡에서 열면 로그인 버튼 대신 안내가 뜸 | 정상입니다 (구글이 인앱 브라우저 로그인을 막아서 안내를 띄움) |

✅ 3단계 완료 → `REPORT.md` 를 작성하고 사용자에게 끝났다고 알립니다.
