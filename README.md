# 공군 AX · AI 입문 특강 갤러리

공군 장병이 **1일 AI 입문 특강**(Claude 코워크 + 바이브코딩)에서 하루 동안 만든 작품을 모으고,
AI 분석 → 상호 채점·댓글 → 순위(ACE) 공개 → 발표까지 하는 사이트입니다.
운영: 인공지능연구원(AIRI) · 배포 주소(예정): https://airforce-ax-gallery.vercel.app

원본 `No-CodeArchitect/kaist-vibecoding-gallery`(커밋 `d035d2a`)의 기능을 그대로 쓰고
브랜딩·홈·문구·AI 페르소나와 1일 과정 운영 보완 기능만 바꿨습니다. 원본 저장소는 `upstream` 리모트로만 연결돼 있습니다.

## 다음 과정에 재사용할 때
- 문구·일정·링크: `lib/site-config.ts` 한 파일
- 색·글꼴: `tailwind.config.ts` (토큰 `base` / `surface` / `accent` / `signal`) + `app/globals.css`
- 엠블럼: `public/media/brand/emblem.png`

## 처음 설정
1. `.env.example` → `.env` 복사 후 값 채우기
2. Supabase: `SUPABASE_MIGRATION_AIRFORCE.md` 의 순서대로 SQL 실행 → `npm run seed:sorties`
3. 구글 로그인: `SSO_SETUP.md` (새 OAuth 클라이언트, 리디렉션 URI `https://airforce-ax-gallery.vercel.app/api/admin/google/callback`)
4. 사진·영상: `MEDIA_GUIDE.md`

```bash
npm install
npm run dev
```

## 1일 과정 운영 보완 (원본 대비 추가)
- **입장 코드 자동 수락**: 관리자 회차 카드에서 6자리 코드 설정 → 가입 때 맞게 넣으면 즉시 수락 (해시 저장, 10분 5회 제한)
- **카카오톡 인앱 브라우저 대응**: 가입·로그인 화면에서 감지 시 「다른 브라우저로 열기」 안내
- **입장 QR**: 발표 화면과 관리자 회차 카드 (브라우저에서 생성, 외부 API 없음)
- **타임박스 표시**: 회차 갤러리 상단에 작품 등록·채점 마감 시각 (표시용, 잠금은 기존 토글)
- **보안 확인 체크**: 작품 등록 시 필수, 서버에서도 검증
