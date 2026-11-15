import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { QueryProvider } from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mylink.kr"
  ),
  title: {
    default: "마이링크 (mylink) - 나만의 힙한 네오브루탈리즘 프로필 링크",
    template: "%s | mylink",
  },
  description:
    "소중한 링크를 깔끔하게 모으고 관리하는 네오브루탈리즘 프로필 링크 서비스입니다. 3초 만에 나만의 감각적인 링크 인 바이오를 완성해보세요.",
  keywords: [
    "마이링크",
    "mylink",
    "프로필링크",
    "링크트리",
    "링크 인 바이오",
    "네오브루탈리즘",
    "링크모음",
    "포트폴리오 링크",
    "인스타 링크",
    "소셜 링크",
    "실시간 클릭 분석",
  ],
  authors: [{ name: "mylink", url: "https://mylink.kr" }],
  creator: "mylink",
  publisher: "mylink",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "mylink",
    title: "마이링크 (mylink) - 나만의 힙한 네오브루탈리즘 프로필 링크",
    description:
      "지루한 링크트리는 그만! 굵은 테두리와 톡톡 튀는 비비드 컬러, 실시간 클릭 분석까지 지원하는 나만의 링크 인 바이오.",
  },
  twitter: {
    card: "summary_large_image",
    title: "마이링크 (mylink) - 나만의 힙한 네오브루탈리즘 프로필 링크",
    description:
      "지루한 링크트리는 그만! 굵은 테두리와 톡톡 튀는 비비드 컬러, 실시간 클릭 분석까지 지원하는 나만의 링크 인 바이오.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  category: "technology",
  other: {
    google: "notranslate",
    "content-language": "ko-KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} notranslate h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <QueryProvider>
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
