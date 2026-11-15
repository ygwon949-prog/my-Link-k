import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

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
    url: `${SITE_URL}/stats`,
    type: "website",
    images: [
      {
        url: "/stats/opengraph-image",
        width: 1200,
        height: 630,
        alt: "통계 대시보드 | mylink",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "통계 대시보드 | mylink",
    description: "개인 링크 통계 대시보드로 이동합니다.",
    images: ["/stats/twitter-image"],
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
