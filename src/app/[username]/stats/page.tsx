import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserStatsDashboard } from "@/components/stats/UserStatsDashboard";
import { fetchUserByUsername, normalizeUsernameParam } from "@/lib/links";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

interface UserStatsPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: UserStatsPageProps): Promise<Metadata> {
  const { username } = await params;
  const normalized = normalizeUsernameParam(username);

  if (!normalized) {
    return {
      title: "사용자를 찾을 수 없습니다",
      description: "존재하지 않거나 올바르지 않은 사용자 통계 페이지입니다.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  let displayName = normalized;
  let userExists = false;

  try {
    const userProfile = await fetchUserByUsername(normalized);
    if (userProfile) {
      userExists = true;
      displayName = userProfile.displayName || normalized;
    }
  } catch {
    displayName = normalized;
  }

  const pageTitle = `@${normalized} 링크 클릭 통계 대시보드`;
  const pageDescription = `${displayName}님의 실시간 링크 클릭 수 및 방문자 반응 통계 대시보드입니다.`;
  const canonicalUrl = `${SITE_URL}/${encodeURIComponent(normalized)}/stats`;
  const ogImageUrl = `/${encodeURIComponent(normalized)}/stats/opengraph-image`;
  const twitterImageUrl = `/${encodeURIComponent(normalized)}/stats/twitter-image`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageTitle} | ${SITE_NAME}`,
      description: pageDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${pageTitle} | ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | ${SITE_NAME}`,
      description: pageDescription,
      images: [twitterImageUrl],
    },
    robots: userExists
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
          },
        }
      : {
          index: false,
          follow: false,
        },
  };
}

export default async function UserStatsPage({ params }: UserStatsPageProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsernameParam(username);

  if (!normalizedUsername) {
    notFound();
  }

  return <UserStatsDashboard username={normalizedUsername} />;
}
