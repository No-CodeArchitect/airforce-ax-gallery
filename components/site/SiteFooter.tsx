import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Emblem } from "./Brand";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-base">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Emblem className="h-8" />
          <div>
            <div className="text-sm font-black text-white">{siteConfig.name}</div>
            <p className="mt-0.5 text-xs text-white/55">운영: {siteConfig.operator}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-xs text-white/60">
          {siteConfig.nav.slice(1).map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-accent">
              {n.label}
            </Link>
          ))}
          <Link href="/privacy" className="font-semibold text-white/80 hover:text-accent">
            개인정보 처리방침
          </Link>
          <Link href="/admin" className="hover:text-accent">
            관리자
          </Link>
        </nav>
      </div>
    </footer>
  );
}
