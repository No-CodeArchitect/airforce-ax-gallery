// 사이트 문구·일정·링크 일원화. 다음 과정에 재사용할 때는 이 파일과
// tailwind.config.ts 의 디자인 토큰만 바꾸면 된다.
// ⚠ 군 보안: 실제 부대명·인원·장비 제원·성능 수치를 쓰지 않는다. 지역은 도시명까지만.

export interface Sortie {
  no: number;
  date: string; // YYYY-MM-DD (KST 교육일)
  city: string;
}

export interface ScheduleStep {
  time: string;
  label: string;
  desc: string;
  muted?: boolean; // 점심 등 보조 일정
}

export interface Outcome {
  title: string;
  desc: string;
  tag: string; // 보조 표기 (Claude 코워크 / 바이브코딩 …)
}

const sorties: Sortie[] = [
  { no: 1, date: "2026-10-30", city: "평택" },
  { no: 2, date: "2026-11-06", city: "충주" },
  { no: 3, date: "2026-11-13", city: "수원" },
  { no: 4, date: "2026-11-20", city: "서산" },
  { no: 5, date: "2026-11-27", city: "대구" },
];

export const sortieLabel = (n: number) => `${n}회차`;

// "10/30(금)" 형식
export function shortDate(iso: string): string {
  const wd = ["일", "월", "화", "수", "목", "금", "토"][new Date(`${iso}T12:00:00Z`).getUTCDay()];
  const [, m, day] = iso.split("-").map(Number);
  return `${m}/${day}(${wd})`;
}

// 오늘(KST) 날짜 "YYYY-MM-DD"
export function todayKst(now = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

export type SortieState = "upcoming" | "today" | "done";
export function sortieState(s: Sortie, today = todayKst()): SortieState {
  if (s.date === today) return "today";
  return s.date > today ? "upcoming" : "done";
}

export const siteConfig = {
  name: "공군 AX · AI 입문 특강",
  shortName: "공군 AX",
  galleryTitle: "공군 AX · AI 입문 특강 갤러리",
  description:
    "공군 장병이 단 하루 동안 Claude와 바이브코딩으로 직접 만든 업무 도구 갤러리 · 상호 채점 · AI 심사평",
  operator: "인공지능연구원(AIRI)",
  operatorShort: "인공지능연구원",
  url: process.env.APP_URL || "https://airforce-ax-gallery.vercel.app",
  emblem: "/media/brand/emblem.png",

  hero: {
    eyebrow: "공군 AX · AI 입문 특강",
    headline: ["코딩 경험 없이,", "하루 만에 만드는 나의 AI 업무 도구"],
    sub: "말로 설명하면 앱이 됩니다. 공군 장병들이 단 하루 동안 Claude와 바이브코딩으로 직접 만든 업무 도구를 만나 보세요.",
    ctaPrimary: "작품 갤러리 보기 →",
    ctaSecondary: "우리 부대도 신청하기",
    before: { time: "09:00", label: "시작", lines: ["코딩 경험 없음", "AI는 질문·대화 위주로 사용"] },
    after: { time: "17:00", label: "종료", lines: ["직접 만들어 배포한 웹앱 1개", "동료 평가와 피드백", "AI 심사평"] },
  },

  outcomesTitle: "이 하루가 끝나면, 이렇게 달라집니다",
  outcomes: [
    {
      title: "AI에게 일 시키는 법",
      desc: "질문만 하던 AI에게 문서 정리·요약·초안 작성을 맡기는 감각을 익힙니다",
      tag: "Claude 코워크",
    },
    {
      title: "아이디어 → 작동하는 앱",
      desc: "코드를 몰라도, 말로 설명한 아이디어가 실제로 돌아가는 웹앱이 됩니다",
      tag: "바이브코딩",
    },
    {
      title: "부대로 가져가는 내 도구",
      desc: "내 업무의 불편 하나를 골라, 돌아가서 바로 써 볼 수 있는 도구를 완성합니다",
      tag: "실무 적용",
    },
    {
      title: "동료 30명의 피드백",
      desc: "같은 날 함께한 동료들의 채점·댓글과 AI 심사평으로 다음 개선점을 얻습니다",
      tag: "상호 평가",
    },
  ] satisfies Outcome[],

  stats: {
    title: "하루 만에 나온 결과",
    labels: {
      projects: "하루 만에 완성된 작품",
      pilots: "참여 장병",
      feedback: "동료 평가·피드백",
    },
    note: "모든 작품은 교육 당일 하루 동안 만들어졌습니다.",
    // 아직 데이터가 없을 때 (첫 회차 전)
    empty: (first: Sortie) =>
      `${shortDate(first.date).replace(/\(.\)/, "")} ${first.city}에서 1회차가 시작됩니다`,
  },

  day: { start: "09:00", lunch: ["12:00", "13:00"], end: "17:00" },
  scheduleTitle: "하루 일정",
  schedule: [
    { time: "09:00", label: "오리엔테이션", desc: "Claude 코워크로 AI에게 업무 맡기기" },
    { time: "10:30", label: "아이디어 기획", desc: "내 업무의 불편 하나를 골라 만들 도구 정하기" },
    { time: "12:00", label: "점심", desc: "12:00~13:00", muted: true },
    { time: "13:00", label: "바이브코딩 실습", desc: "말로 설명해 웹앱을 만들고 배포하기" },
    { time: "15:30", label: "작품 등록·상호 평가", desc: "갤러리 등록, 동료 채점과 댓글" },
    { time: "16:30", label: "발표·시상", desc: "우수 작품 발표 후 17:00 종료" },
  ] satisfies ScheduleStep[],

  sorties,

  overview: {
    audience: "공군 장병 AI 입문자 · 회당 약 30명",
    format: "1일 대면 특강 · 09:00~17:00 (점심 12:00~13:00)",
    provided: "교육일 Claude Team 계정 제공",
  },

  eduBanner: {
    badge: "교육 신청",
    title: "우리 부대도 AI 입문 특강이 필요하다면",
    desc: "부대·기관 단위로 AI 입문 특강을 신청할 수 있습니다. 희망 인원과 시기를 남겨 주시면 인공지능연구원 담당자가 연락드립니다.",
    cta: "교육 신청하기 →",
  },

  apply: {
    title: "부대 AI 입문 특강 신청",
    desc: "코딩 경험이 없어도 하루면 충분합니다. 부대·기관 단위로 AI 입문 특강(1일, 09:00~17:00)을 희망하시면 아래 내용을 남겨 주세요. 인공지능연구원 담당자가 확인 후 연락드립니다.",
  },

  sketchNotice: "부대 마크·명찰·화면 속 업무자료가 보이지 않는 사진만 올려 주세요.",

  privacy: {
    contact: "jjh@airi.kr",
    department: "인공지능연구원 교육사업 담당",
    courseEnd: "2026-11-27",
    retention: "과정 종료(2026-11-27) 후 1년",
    applyRetention: "상담 종료 후 1년",
    effective: "2026년 10월 28일",
  },

  nav: [
    { href: "/", label: "홈" },
    { href: "/about", label: "특강 소개" },
    { href: "/sections", label: "작품 갤러리" },
    { href: "/archive", label: "회차 기록" },
    { href: "/media", label: "미디어" },
    { href: "/apply", label: "교육 신청" },
  ],

  security: {
    ack: "작품과 설명에 부대명·인원·장비 등 보안 정보가 없음을 확인했습니다.",
    nicknameHint: "갤러리에 이 이름으로 표시돼요. 실명·계급·부대명은 넣지 마세요.",
  },

  features: { eduApply: true, aceBoard: true },
  creatorDisplay: "nickname" as const,
  sortieLabel,
};
