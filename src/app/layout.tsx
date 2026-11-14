import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "mylink - 나만의 링크 관리",
  description: "소중한 링크를 깔끔하게 모으고 관리하는 mylink 서비스입니다.",
  openGraph: {
    title: "mylink - 나만의 링크 관리",
    description: "소중한 링크를 깔끔하게 모으고 관리하는 mylink 서비스입니다.",
    locale: "ko_KR",
    type: "website",
  },
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
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
