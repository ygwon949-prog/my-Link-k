import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserProfileCard } from "@/components/profile";
import { normalizeUsernameParam } from "@/lib/links";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const normalized = normalizeUsernameParam(username);

  if (!normalized) {
    return {
      title: "사용자를 찾을 수 없습니다 - mylink",
    };
  }

  return {
    title: `@${normalized} - mylink 프로필`,
    description: `@${normalized}님의 마이링크(MyLink) 프로필 및 링크 모음 페이지입니다.`,
  };
}

export default async function UserProfilePage({ params }: UserPageProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsernameParam(username);

  if (!normalizedUsername) {
    notFound();
  }

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)] overflow-hidden">
      {/* 배경 도트 패턴 (레트로 Neobrutalism 무드) */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* 배경 장식 스티커 */}
      <div className="hidden lg:block absolute top-12 left-16 select-none pointer-events-none -rotate-12 bg-[#67E8F9] text-black font-black text-xs px-3 py-1.5 rounded-[8px] border-[2px] border-black shadow-[3px_3px_0px_#000000]">
        ⚡ @{normalizedUsername}
      </div>
      <div className="hidden lg:block absolute bottom-16 right-16 select-none pointer-events-none rotate-12 bg-[#F472B6] text-black font-black text-xs px-3 py-1.5 rounded-[8px] border-[2px] border-black shadow-[3px_3px_0px_#000000]">
        🚀 MYLINK PROFILE
      </div>

      {/* username 기반 유저 검색 및 users/{userId}/links 렌더링 카드 */}
      <UserProfileCard username={normalizedUsername} />
    </main>
  );
}
