import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // text-base 는 Tailwind 글자 크기(1rem) 유틸이라, base 색이 글자색으로 끼어들지 않게 뺀다.
    // (바탕 위 글자색은 text-on-accent 를 쓴다)
    textColor: ({ theme }) => {
      const { base: _base, ...rest } = theme("colors") as Record<string, unknown>;
      return rest as Record<string, string>;
    },
    extend: {
      colors: {
        // 공군 AX · "첫 비행" — 딥 에어포스 네이비 + 스카이블루, 활주로 등화 앰버는 소량 포인트
        // (의미 기반 이름: base 바탕 / surface 카드 / accent 강조 / signal 뱃지)
        base: {
          DEFAULT: "#0B1A2E", // 페이지 바탕
          soft: "#102440", // 섹션 밴드
        },
        surface: {
          DEFAULT: "#15304F", // 카드·패널
          soft: "#1C3A5E", // 입력창·호버
        },
        accent: {
          DEFAULT: "#4FB3FF", // 주요 버튼·강조 텍스트
          soft: "#8FD0FF", // 호버·하이라이트
        },
        signal: {
          DEFAULT: "#F2C14E", // NEW·ACE·순위 뱃지
        },
        // accent/signal 바탕 위의 글자색 (text-base 는 Tailwind 글자 크기와 겹쳐 따로 둔다)
        "on-accent": "#0B1A2E",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(4,12,24,0.2), 0 8px 24px -12px rgba(4,12,24,0.5)",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        // 숫자·라벨 전용 (SORTIE 01, 시각, 카운터). 제목에는 쓰지 않는다.
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        climb: {
          "0%": { transform: "rotate(-120deg)" },
          "100%": { transform: "rotate(120deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        takeoff: {
          "0%": { transform: "translate(-10%, 30%) rotate(-12deg)", opacity: "0" },
          "30%": { opacity: "1" },
          "100%": { transform: "translate(110%, -60%) rotate(-12deg)", opacity: "0" },
        },
      },
      animation: {
        climb: "climb 1.8s cubic-bezier(.3,.7,.3,1) 0.3s both",
        "fade-up": "fade-up 0.6s ease-out both",
        takeoff: "takeoff 2.4s ease-in 0.4s both",
      },
    },
  },
  plugins: [],
};

export default config;
