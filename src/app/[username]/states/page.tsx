import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserStatsDashboard } from "@/components/stats/UserStatsDashboard";
import { normalizeUsernameParam } from "@/lib/links";

interface UserStatesPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: UserStatesPageProps): Promise<Metadata> {
  const { username } = await params;
  const normalized = normalizeUsernameParam(username);

  if (!normalized) {
    return {
      title: "사용자를 찾을 수 없습니다",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // states 경로는 stats의 오타/호환 라우트이므로 정식 stats URL로 canonical 지정 및 noindex 처리
  const canonicalUrl = `/${encodeURIComponent(normalized)}/stats`;

  return {
    title: `@${normalized} 링크 클릭 통계 대시보드`,
    description: `@${normalized}님의 실시간 링크 클릭 수 및 방문자 반응 통계 대시보드입니다.`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function UserStatesPage({ params }: UserStatesPageProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsernameParam(username);

  if (!normalizedUsername) {
    notFound();
  }

  return <UserStatsDashboard username={normalizedUsername} />;
}
