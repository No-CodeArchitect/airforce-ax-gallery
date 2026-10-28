import Link from "next/link";
import { getMember } from "@/lib/member-session";
import { siteConfig } from "@/lib/site-config";
import { Emblem } from "./Brand";

export default async function SiteHeader() {
  const member = await getMember();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-base/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Emblem className="h-6" />
          <span className="truncate text-sm font-black tracking-wide text-white">
            <span className="sm:hidden">{siteConfig.shortName}</span>
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {siteConfig.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-white/70 transition hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/me"
          className="max-w-[9rem] shrink-0 truncate rounded-full border border-accent/60 px-4 py-1.5 text-xs font-bold text-accent transition hover:bg-accent hover:text-on-accent"
        >
          {member ? "내 계정" : "로그인"}
        </Link>
      </div>
      {/* 모바일·태블릿: 가로 스크롤 메뉴 */}
      <nav className="flex gap-5 overflow-x-auto border-t border-white/5 px-4 py-2 text-xs lg:hidden">
        {siteConfig.nav.map((n) => (
          <Link key={n.href} href={n.href} className="shrink-0 font-medium text-white/65 hover:text-accent">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
