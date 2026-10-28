import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ApplyForm from "@/components/ApplyForm";
import { Eyebrow } from "@/components/site/Brand";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: siteConfig.apply.title,
};

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-base text-white">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <Eyebrow>Apply</Eyebrow>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{siteConfig.apply.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{siteConfig.apply.desc}</p>
        <div className="relative mt-8 rounded-2xl bg-surface p-6 ring-1 ring-white/10 sm:p-8">
          <ApplyForm />
        </div>
        <p className="mt-4 text-xs text-white/60">처리: {siteConfig.operator}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
