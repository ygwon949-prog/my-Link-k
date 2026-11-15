import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "내 링크 관리",
  description: "내 프로필 링크를 손쉽게 추가, 수정, 정렬하고 관리해보세요.",
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
    title: "내 링크 관리 | mylink",
    description: "내 프로필 링크를 손쉽게 추가, 수정, 정렬하고 관리해보세요.",
    url: `${SITE_URL}/links`,
    type: "website",
    images: [
      {
        url: "/links/opengraph-image",
        width: 1200,
        height: 630,
        alt: "내 링크 관리 | mylink",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "내 링크 관리 | mylink",
    description: "내 프로필 링크를 손쉽게 추가, 수정, 정렬하고 관리해보세요.",
    images: ["/links/twitter-image"],
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
