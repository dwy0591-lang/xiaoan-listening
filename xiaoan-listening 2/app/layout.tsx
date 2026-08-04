import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsBeacon, AudioExperienceProvider, MobileDock } from "./ui";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://xiaoan-listening.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "小岸在听呢｜给柔软小画家的匿名海边树洞",
    template: "%s｜小岸在听呢",
  },
  description: "小岸是一只很会听心事的水豚。这里留给细腻、有审美、偶尔想太多的小画家们。",
  keywords: ["ISFP", "匿名树洞", "情绪疗愈", "情绪日记", "水豚", "心理陪伴", "自我肯定"],
  authors: [{ name: "小岸在听呢" }],
  creator: "小岸在听呢",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "小岸在听呢",
    title: "小岸在听呢｜给柔软小画家的匿名海边树洞",
    description: "累了就来海边坐一会儿。有一只水豚，会把你的话认真听完。",
    images: [{ url: "/hero-capybara-seaside.webp", width: 1200, height: 800, alt: "水豚小岸坐在安静的海边" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "小岸在听呢",
    description: "给柔软小画家的匿名情绪海岸。",
    images: ["/hero-capybara-seaside.webp"],
  },
  robots: { index: true, follow: true },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AudioExperienceProvider>
          <AnalyticsBeacon />
          {children}
          <MobileDock />
        </AudioExperienceProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "小岸在听呢",
              url: siteUrl,
              description: "给柔软小画家的匿名情绪海岸",
              inLanguage: "zh-CN",
            }),
          }}
        />
      </body>
    </html>
  );
}
