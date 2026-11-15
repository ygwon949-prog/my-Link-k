import type { Metadata } from "next";

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
    url: "/links",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "내 링크 관리 | mylink",
    description: "내 프로필 링크를 손쉽게 추가, 수정, 정렬하고 관리해보세요.",
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
