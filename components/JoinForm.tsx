"use client";

import { useActionState } from "react";
import { joinSectionAction, type JoinState } from "@/lib/auth-actions";
import { siteConfig } from "@/lib/site-config";

const initialState: JoinState = { ok: false, error: null };

const inputCls =
  "w-full rounded-lg border border-white/15 bg-surface-soft px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function JoinForm({
  cohortId,
  initial,
  hasJoinCode = false,
  next,
}: {
  cohortId: string;
  initial?: { realName: string; nickname: string };
  hasJoinCode?: boolean; // 회차에 입장 코드가 설정돼 있으면 입력칸 표시
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(joinSectionAction, initialState);
  const v = state.values ?? initial;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="cohortId" value={cohortId} />
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="realName" className="text-sm font-semibold text-white">
          실명<span className="ml-1 text-accent">*</span>
        </label>
        <input
          id="realName"
          name="realName"
          required
          maxLength={20}
          defaultValue={v?.realName ?? ""}
          placeholder="예: 홍길동"
          className={inputCls}
        />
        <p className="text-xs text-white/60">관리자만 봅니다. 교육생 명단과 맞춰 가입을 수락하는 데 씁니다.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nickname" className="text-sm font-semibold text-white">
          닉네임<span className="ml-1 text-accent">*</span>
        </label>
        <input
          id="nickname"
          name="nickname"
          required
          maxLength={12}
          defaultValue={v?.nickname ?? ""}
          placeholder="예: 이륙성공, 바이브파일럿"
          className={inputCls}
        />
        <p className="text-xs text-white/60">
          {siteConfig.security.nicknameHint} 2~12자, 회차 안에서 중복 불가.
        </p>
      </div>
      {hasJoinCode && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="joinCode" className="text-sm font-semibold text-white">
            입장 코드
          </label>
          <input
            id="joinCode"
            name="joinCode"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            placeholder="강사가 알려 준 6자리"
            className={`${inputCls} font-mono tracking-[0.3em]`}
          />
          <p className="text-xs text-white/60">
            코드를 맞게 넣으면 바로 입장돼요. 모르면 비워 두세요 — 강사가 확인 후 수락합니다.
          </p>
        </div>
      )}

      {state.error && !pending && (
        <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-on-accent transition hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? "신청 중…" : "가입 신청"}
      </button>
    </form>
  );
}
