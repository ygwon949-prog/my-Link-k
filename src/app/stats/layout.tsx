import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통계 대시보드",
  description: "개인 링크 통계 대시보드로 이동합니다.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  openGraph: {
    title: "통계 대시보드 | mylink",
    description: "개인 링크 통계 대시보드로 이동합니다.",
    url: "/stats",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "통계 대시보드 | mylink",
    description: "개인 링크 통계 대시보드로 이동합니다.",
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
