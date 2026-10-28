"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroyMemberSession, getMember } from "./member-session";
import { getCohortById, verifyJoinCode } from "./cohorts-store";
import { getMembership, requestMembership, setMembershipStatus } from "./memberships-store";
import { safeNext } from "./google-oauth";

export interface JoinState {
  ok: boolean;
  error: string | null;
  values?: { realName: string; nickname: string };
}

const NICK_RE = /^[0-9A-Za-z가-힣_.\- ]+$/;

// 입장 코드 시도 횟수 제한: 계정·회차별 10분에 5번까지 틀릴 수 있다.
// (서버 인스턴스 메모리 기준 — 6자리 코드를 무작위로 맞히기 어렵게 하는 용도)
const CODE_MAX_FAILS = 5;
const CODE_WINDOW_MS = 10 * 60_000;
const gCode = globalThis as unknown as { __vgJoinFails?: Map<string, { n: number; since: number }> };
const codeFails = gCode.__vgJoinFails ?? (gCode.__vgJoinFails = new Map());

function codeLocked(key: string): boolean {
  const f = codeFails.get(key);
  if (!f) return false;
  if (Date.now() - f.since > CODE_WINDOW_MS) {
    codeFails.delete(key);
    return false;
  }
  return f.n >= CODE_MAX_FAILS;
}

function recordCodeFail(key: string): void {
  const f = codeFails.get(key);
  if (!f || Date.now() - f.since > CODE_WINDOW_MS) codeFails.set(key, { n: 1, since: Date.now() });
  else f.n += 1;
}

// 섹션 가입 신청 (구글 로그인 후). 관리자가 수락하면 채점·댓글·작품 등록이 가능해진다.
export async function joinSectionAction(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const member = await getMember();
  if (!member) return { ok: false, error: "먼저 구글 계정으로 로그인해 주세요." };

  const cohortId = String(formData.get("cohortId") ?? "");
  const realName = String(formData.get("realName") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim().replace(/\s+/g, " ");
  const values = { realName, nickname };

  const cohort = await getCohortById(cohortId);
  if (!cohort) return { ok: false, error: "회차를 찾을 수 없습니다.", values };
  if (realName.length < 2 || realName.length > 20) {
    return { ok: false, error: "실명을 2~20자로 입력해 주세요.", values };
  }
  if (nickname.length < 2 || nickname.length > 12 || !NICK_RE.test(nickname)) {
    return { ok: false, error: "닉네임은 2~12자, 한글·영문·숫자와 _ . - 만 쓸 수 있습니다.", values };
  }

  // 입장 코드 (회차에 설정된 경우만). 비워 두면 기존처럼 관리자 수동 수락을 기다린다.
  const code = String(formData.get("joinCode") ?? "").replace(/\s+/g, "");
  let codeOk = false;
  if (cohort.joinCodeHash && code) {
    const key = `${member.sub}:${cohort.id}`;
    if (codeLocked(key)) {
      return { ok: false, error: "입장 코드를 여러 번 틀렸어요. 10분 뒤에 다시 시도하거나, 코드를 비우고 신청해 주세요.", values };
    }
    codeOk = verifyJoinCode(cohort, code);
    if (!codeOk) {
      recordCodeFail(key);
      return { ok: false, error: "입장 코드가 맞지 않아요. 강사에게 다시 확인해 주세요.", values };
    }
    codeFails.delete(key);
  }

  let approvedNow = false;
  try {
    // 관리자가 거절한 신청은 코드가 맞아도 자동 수락하지 않는다
    const prevStatus = (await getMembership(cohortId, member.sub))?.status;
    const res = await requestMembership({
      cohortId,
      googleSub: member.sub,
      email: member.email,
      googleName: member.name,
      realName,
      nickname,
    });
    if (!res.ok) return { ok: false, error: res.error, values };
    if (codeOk && prevStatus !== "rejected" && res.membership.status === "pending") {
      await setMembershipStatus(res.membership.id, "approved");
      approvedNow = true;
    }
  } catch (err) {
    console.error("[join]", (err as Error).message);
    return { ok: false, error: "일시적인 오류로 신청하지 못했습니다. 잠시 후 다시 시도해 주세요.", values };
  }

  revalidatePath(`/g/${cohort.slug}/join`);
  revalidatePath("/admin");
  if (approvedNow) {
    redirect(formData.get("next") === "submit" ? `/g/${cohort.slug}/submit` : `/g/${cohort.slug}`);
  }
  return { ok: true, error: null, values };
}

// 로그아웃 (구글 계정 세션 종료). next로 돌아갈 곳을 지정할 수 있다.
export async function logout(formData?: FormData): Promise<void> {
  await destroyMemberSession();
  redirect(safeNext(formData ? String(formData.get("next") ?? "") : "", "/"));
}
