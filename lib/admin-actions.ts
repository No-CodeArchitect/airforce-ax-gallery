"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkAdminPassword,
  createAdminSession,
  destroyAdminSession,
  getAdminEmail,
  isAdmin,
} from "./admin-session";
import { addAdminEmail, removeAdminEmail, normalizeEmail } from "./admin-allowlist";
import {
  createCohort,
  setCohortScoringOpen,
  setCohortRankRevealed,
  setCohortMinRaters,
  setCohortJoinCode,
  updateCohortDetails,
  JOIN_CODE_RE,
  type CohortDetails,
} from "./cohorts-store";
import {
  approveAllPending,
  deleteMembership,
  setMembershipStatus,
  type MembershipStatus,
} from "./memberships-store";
import { setCommentHidden } from "./comments-store";

export interface AdminLoginState {
  error: string | null;
}

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    return { error: "관리자 비밀번호가 올바르지 않습니다." };
  }
  await createAdminSession("password"); // SSO 설정 전의 임시 로그인
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("관리자 권한이 필요합니다.");
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

// --- 섹션(회차) ---

// "2026-10-30T15:30"(KST 입력) → ISO. 빈 값은 null.
function kstLocalToIso(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return null;
  const d = new Date(`${s}:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function readDetails(formData: FormData): Partial<CohortDetails> {
  const out: Partial<CohortDetails> = {};
  const no = Number(formData.get("sessionNo"));
  if (formData.has("sessionNo")) out.sessionNo = Number.isInteger(no) && no > 0 && no < 100 ? no : null;
  if (formData.has("heldOn")) {
    const d = String(formData.get("heldOn") ?? "").trim();
    out.heldOn = /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  }
  if (formData.has("location")) out.location = String(formData.get("location") ?? "").trim().slice(0, 20) || null;
  if (formData.has("submitDueAt")) out.submitDueAt = kstLocalToIso(formData.get("submitDueAt"));
  if (formData.has("scoreDueAt")) out.scoreDueAt = kstLocalToIso(formData.get("scoreDueAt"));
  return out;
}

export async function createCohortAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!name) return;
  await createCohort(name, slug || undefined, readDetails(formData));
  refresh();
}

// 회차 정보(번호·교육일·지역·마감 표시 시각) 저장
export async function updateCohortDetailsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  if (!cohortId) return;
  await updateCohortDetails(cohortId, readDetails(formData));
  refresh();
}

// 입장 코드 설정(6자리 숫자) / 해제(빈 값 또는 clear=1)
export async function setJoinCodeAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  if (!cohortId) return;
  const code = String(formData.get("code") ?? "").trim();
  if (formData.get("clear") === "1" || !code) {
    await setCohortJoinCode(cohortId, null);
  } else if (JOIN_CODE_RE.test(code)) {
    await setCohortJoinCode(cohortId, code);
  } else {
    return; // 잘못된 형식은 무시 (입력칸 pattern 으로 1차 차단)
  }
  refresh();
}

export async function toggleScoringOpen(formData: FormData): Promise<void> {
  await requireAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  await setCohortScoringOpen(cohortId, String(formData.get("value")) === "true");
  refresh();
}

export async function toggleRankRevealed(formData: FormData): Promise<void> {
  await requireAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  await setCohortRankRevealed(cohortId, String(formData.get("value")) === "true");
  refresh();
}

// --- 섹션 가입(교육생) 수락 ---
export async function setMemberStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as MembershipStatus;
  if (!id || !["pending", "approved", "rejected"].includes(status)) return;
  await setMembershipStatus(id, status);
  refresh();
}

export async function approveAllAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  if (cohortId) await approveAllPending(cohortId);
  refresh();
}

// 거절된 신청 기록 삭제 (그 사람이 다시 신청할 수 있게 됨)
export async function deleteMemberAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await deleteMembership(id);
  refresh();
}

// --- 관리자 계정 (구글 이메일 허용 목록) ---
export async function addAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "");
  const by = (await getAdminEmail()) ?? "password";
  await addAdminEmail(email, by);
  refresh();
}

export async function removeAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  // 본인 계정은 삭제 불가 (스스로 잠기는 사고 방지)
  const me = await getAdminEmail();
  if (!email || email === me) return;
  await removeAdminEmail(email);
  refresh();
}

// --- 댓글 모더레이션 ---
export async function moderateComment(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden")) === "true";
  await setCommentHidden(id, hidden);
  refresh();
}

// --- 순위 최소 채점 인원 ---
export async function setMinRatersAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  const n = Number(formData.get("minRaters"));
  if (!cohortId || !Number.isFinite(n)) return;
  await setCohortMinRaters(cohortId, n);
  refresh();
}
