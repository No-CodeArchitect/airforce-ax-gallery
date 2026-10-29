import type { Project } from "./types";

// 로컬 데모용 더미 데이터 (Supabase projects 테이블이 없을 때만 보인다).
// ⚠ 군 보안: 실제 부대명·인원·장비 정보 없이 일반 업무 예시만 쓴다. 제작자는 닉네임.

function dummy(
  id: string,
  title: string,
  tagline: string,
  authorName: string,
  aiSummary: string,
  features: string[],
  scores: [number, number],
  rationale: string,
  publishedAt: string
): Project {
  return {
    id,
    cohortId: "c1",
    title,
    tagline,
    authorId: `s_${id}`,
    authorName,
    liveUrl: "https://example.com",
    signatureImageUrl: null,
    aiSummary,
    features,
    status: "generated",
    publishedAt,
    aiReview: { scoreCompleteness: scores[0], scoreCreativity: scores[1], rationale },
    isNew: true,
    hasScored: false,
    isMine: false,
    rank: null,
    avgScore: null,
    raterCount: 0,
  };
}

export const dummyProjects: Project[] = [
  dummy(
    "p1",
    "점검표 자동 정리기",
    "엑셀 붙여넣기 한 번으로 주간 점검 결과 요약",
    "엑셀탈출",
    "주간 점검표를 붙여넣으면 항목별 완료·미완료를 자동으로 집계하고 요약 문장을 만들어 준다. 매주 반복되던 정리 시간을 줄이는 데 초점을 맞췄다.",
    ["엑셀 붙여넣기", "항목별 집계", "요약 문장 생성", "결과 복사"],
    [4, 4],
    "입문자가 하루 만에 실제로 돌아가는 도구를 완성했다. 다음에는 지난주와 비교하는 화면을 하나 더해 보자.",
    "2026-10-30T15:40:00+09:00"
  ),
  dummy(
    "p2",
    "교육 일정 알리미",
    "이번 주 교육 일정을 한 화면에",
    "자동화입문",
    "일정표를 입력하면 날짜별 카드로 보여 주고, 오늘 해당하는 일정을 맨 위에 강조한다. 공유용 문구도 한 번에 복사할 수 있다.",
    ["일정 카드 보기", "오늘 일정 강조", "공유 문구 복사"],
    [4, 3],
    "범위를 하루에 맞게 잘 잡았다. 다음에는 지난 일정을 접어 두는 기능을 넣어 보자.",
    "2026-10-30T15:35:00+09:00"
  ),
  dummy(
    "p3",
    "회의록 세 줄 요약기",
    "긴 회의 메모를 결정사항·할 일·질문으로",
    "정리의달인",
    "회의 메모를 붙여넣으면 결정사항, 할 일, 남은 질문 세 칸으로 정리해 준다. Claude 코워크에서 익힌 요약 감각을 앱으로 옮겼다.",
    ["메모 붙여넣기", "세 칸 정리", "할 일 체크"],
    [3, 4],
    "업무의 불편을 정확히 짚은 아이디어다. 다음에는 정리 결과를 내려받는 버튼을 붙여 보자.",
    "2026-10-30T15:30:00+09:00"
  ),
  dummy(
    "p4",
    "비품 대여 기록장",
    "누가 언제 빌렸는지 종이 없이",
    "오늘도개선",
    "비품 대여·반납을 버튼 두 번으로 기록하고, 반납이 늦은 항목을 따로 모아 보여 준다.",
    ["대여·반납 기록", "지연 항목 모아보기", "간단 검색"],
    [4, 3],
    "흐름이 단순해서 바로 써 볼 수 있다. 다음에는 반납 예정일 알림을 추가해 보자.",
    "2026-10-30T15:20:00+09:00"
  ),
];
