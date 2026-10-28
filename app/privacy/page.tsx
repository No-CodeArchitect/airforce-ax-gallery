import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "개인정보 처리방침" };

const p = siteConfig.privacy;

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 수집하는 개인정보",
    body: (
      <ul className="list-disc pl-5">
        <li>
          교육생 로그인·가입: 구글 계정 정보(이메일, 이름, 계정 식별자), 가입 시 입력한 실명·닉네임
        </li>
        <li>작품 등록: 작품 설명, 배포 주소, 썸네일 이미지 등 교육생이 입력·업로드한 내용, 보안 확인 여부</li>
        <li>채점·댓글: 채점 점수, 댓글 내용 (작성자 계정과 연결)</li>
        <li>부대 AI 입문 특강 신청: 부대(기관)명, 담당자 계급·성명, 연락처, 이메일(선택), 신청 내용</li>
        <li>관리자: 구글 계정 이메일</li>
      </ul>
    ),
  },
  {
    title: "2. 이용 목적",
    body: (
      <ul className="list-disc pl-5">
        <li>교육생 본인 확인, 회차 가입 승인, 채점·댓글·작품 등록 기능 제공</li>
        <li>교육 결과물 갤러리 운영 및 AI 요약·심사평 생성</li>
        <li>부대 AI 입문 특강 신청 확인 및 일정 협의 연락</li>
      </ul>
    ),
  },
  {
    title: "3. 공개 범위",
    body: (
      <p>
        갤러리에는 교육생이 정한 <b>닉네임</b>과 등록한 작품 정보만 공개됩니다. 실명·이메일·채점
        내역·교육 신청 정보는 관리자만 볼 수 있습니다. 댓글은 AI가 붙인 별칭으로 표시됩니다.
      </p>
    ),
  },
  {
    title: "4. 처리를 맡기는 서비스",
    body: (
      <ul className="list-disc pl-5">
        <li>Google — 로그인(계정 인증)</li>
        <li>Supabase — 데이터·이미지 저장</li>
        <li>Vercel — 웹사이트 호스팅</li>
        <li>Anthropic(Claude) — 등록된 작품 설명·썸네일을 분석해 요약·심사평 생성</li>
      </ul>
    ),
  },
  {
    title: "5. 보유 기간",
    body: (
      <ul className="list-disc pl-5">
        <li>
          교육생 계정(가입 정보)·작품·채점·댓글: <b>{p.retention}</b> 보관 후 파기
        </li>
        <li>
          부대 AI 입문 특강 신청 정보: <b>{p.applyRetention}</b> 보관 후 파기
        </li>
        <li>본인이 삭제를 요청하면 보유 기간과 관계없이 지체 없이 삭제합니다.</li>
      </ul>
    ),
  },
  {
    title: "6. 파기 절차와 방법",
    body: (
      <p>
        보유 기간이 끝난 정보는 관리자가 확인 후 데이터베이스 기록과 저장된 이미지 파일을 복구할 수
        없는 방법으로 삭제합니다. 종이 문서로 출력한 정보는 분쇄하여 파기합니다.
      </p>
    ),
  },
  {
    title: "7. 정보주체의 권리와 행사 방법",
    body: (
      <ul className="list-disc pl-5">
        <li>
          자신의 개인정보 <b>열람·정정·삭제·처리정지</b>를 요청할 수 있습니다. 아래 개인정보 보호책임자
          이메일로 요청하시면 본인 확인 후 지체 없이 조치합니다.
        </li>
        <li>닉네임·작품 내용은 마감 전까지 사이트에서 직접 수정할 수 있습니다.</li>
        <li>
          구글 로그인 연결은 구글 계정 설정의 「서드 파티 앱 및 서비스」에서 언제든 해제할 수 있습니다.
        </li>
      </ul>
    ),
  },
  {
    title: "8. 개인정보 보호책임자",
    body: (
      <ul className="list-none">
        <li>운영 기관: {siteConfig.operator}</li>
        <li>담당: {p.department}</li>
        <li>
          연락처:{" "}
          <a href={`mailto:${p.contact}`} className="font-semibold text-accent hover:underline">
            {p.contact}
          </a>
        </li>
      </ul>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base text-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight">개인정보 처리방침</h1>
        <p className="mt-3 text-sm text-white/65">
          {siteConfig.operator}이 운영하는 {siteConfig.galleryTitle}(이하 「사이트」)가 이용자의
          개인정보를 어떻게 다루는지 안내합니다.
        </p>
        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-white/75">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="mb-2 text-base font-bold text-white">{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs text-white/60">시행일: {p.effective}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
