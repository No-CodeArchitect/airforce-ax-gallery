# 어사이드 작업 지시서 — 공군 AX 갤러리 배포 설정

당신(어사이드)은 이미 로그인된 브라우저로 아래 3가지를 **이 순서대로** 설정합니다.
코드 수정은 하지 않습니다. 각 단계 문서를 끝까지 읽고 시작하세요.

| 순서 | 문서 | 결과물 |
|---|---|---|
| 1 | `01_supabase.md` | Supabase 프로젝트 + 테이블 + 5개 회차 |
| 2 | `02_vercel.md` | Vercel 배포 (`https://airforce-ax-gallery.vercel.app`) |
| 3 | `03_google_oauth.md` | 구글 로그인 연결 + 최종 확인 |

## 기본 정보
- GitHub 저장소: https://github.com/No-CodeArchitect/airforce-ax-gallery (브랜치 `main`)
- 로컬 개발 폴더: `C:\AI_WORK\04_DEV\airforce-ax-gallery`
- 관리자(소유자) 이메일: `jjh@airi.kr`
- 운영 기관: 인공지능연구원(AIRI)
- 목표 주소: `https://airforce-ax-gallery.vercel.app`

## 반드시 지킬 규칙
1. **비밀값은 정해진 곳에만 넣습니다.** 비밀값은 Supabase `service_role` 키, Google `Client Secret`, `AUTH_SECRET`, `ADMIN_PASSWORD`, Anthropic 키입니다.
   - 넣는 곳: ① Vercel 환경변수 ② 로컬 `C:\AI_WORK\04_DEV\airforce-ax-gallery\.env` 파일.
   - **절대 하지 말 것:** 채팅·보고서·이 폴더의 `.md` 파일에 적기, GitHub에 올리기, 스크린샷에 노출하기.
   - `.env` 는 `.gitignore` 에 들어 있어 GitHub에 올라가지 않습니다. 다른 파일에는 적지 마세요.
2. **돈이 드는 선택은 하지 않습니다.** Supabase·Vercel은 무료(Free/Hobby) 플랜만 씁니다. 결제 수단 등록이나 유료 업그레이드 요청이 나오면 멈추고 사용자에게 물어보세요.
3. **Anthropic API 키는 만들지 않습니다.** 사용자에게 받을 값입니다. 없으면 비워 두고 진행하세요. 비어 있으면 AI 요약이 임시(규칙 기반) 결과로 나옵니다.
4. **원본 저장소 `No-CodeArchitect/kaist-vibecoding-gallery` 와 그 Vercel·Supabase 프로젝트는 건드리지 않습니다.** 모두 새로 만듭니다.
5. 계정 비밀번호 입력, 2단계 인증, 조직 권한 승인 화면이 나오면 사용자에게 넘기고 기다립니다.
6. 모르는 화면이 나오거나 문서와 다르면 추측하지 말고 멈춘 뒤 사용자에게 물어보세요.

## 끝나면 보고서 쓰기
`docs/aside/REPORT.md` 를 새로 만들어 아래 내용을 적어 주세요. **비밀값은 적지 않습니다.**

```markdown
# 어사이드 설정 보고서
- 작업 일시:
- Supabase 프로젝트 이름 / 리전 / Project URL(https://xxxx.supabase.co — 공개값이라 적어도 됨):
- Vercel 프로젝트 이름 / 실제 Production 주소:
- Google Cloud 프로젝트 이름 / OAuth 동의 화면 게시 상태(프로덕션?):
- /api/health 결과(JSON 그대로 붙여넣기 — 값이 아니라 true/false만 나옴):
- 최종 확인 체크리스트 결과(03 문서 끝):
- 문제·보류 사항:
```
