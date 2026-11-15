import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserStatsDashboard } from "@/components/stats/UserStatsDashboard";
import { normalizeUsernameParam } from "@/lib/links";

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
      title: "사용자를 찾을 수 없습니다 - mylink",
    };
  }

  return {
    title: `@${normalized} 링크 클릭 통계 - mylink`,
    description: `@${normalized}님의 실시간 링크 클릭 수 및 방문자 반응 통계 대시보드입니다.`,
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
