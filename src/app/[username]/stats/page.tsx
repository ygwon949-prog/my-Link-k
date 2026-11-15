import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserStatsDashboard } from "@/components/stats/UserStatsDashboard";
import { fetchUserByUsername, normalizeUsernameParam } from "@/lib/links";

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
  const canonicalUrl = `/${encodeURIComponent(normalized)}/stats`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pageTitle} | mylink`,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "mylink",
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | mylink`,
      description: pageDescription,
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
