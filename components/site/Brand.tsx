import { siteConfig } from "@/lib/site-config";

// 공군 AX 엠블럼. 원본 파일은 밝은 바탕용이라 다크 배경에서는 흰 바탕 위에 올린다
// (엠블럼 자체의 비율·색상은 건드리지 않는다).
export function Emblem({ className = "h-7" }: { className?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-white px-1.5 py-0.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={siteConfig.emblem} alt="공군 AX 거점" className={`${className} w-auto`} />
    </span>
  );
}

// Eyebrow: 대문자 트래킹 + 짧은 사선 마커(항적)
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="eyebrow-mark" aria-hidden />
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
        {children}
      </span>
    </div>
  );
}
