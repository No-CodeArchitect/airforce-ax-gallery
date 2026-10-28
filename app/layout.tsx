import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.galleryTitle, template: `%s · ${siteConfig.shortName}` },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.galleryTitle,
    description: siteConfig.description,
    siteName: siteConfig.galleryTitle,
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={mono.variable}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
