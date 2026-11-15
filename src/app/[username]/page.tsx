import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserProfileCard } from "@/components/profile";
import { fetchUserByUsername, normalizeUsernameParam } from "@/lib/links";
import { SITE_URL, SITE_NAME } from "@/lib/constants";

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
      title: "사용자를 찾을 수 없습니다",
      description: "존재하지 않거나 올바르지 않은 사용자 프로필 페이지입니다.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // Firestore에서 유저 프로필 비동기 조회
  let displayName = normalized;
  let bio = `@${normalized}님의 마이링크(MyLink) 프로필 및 링크 모음 페이지입니다.`;
  let userExists = false;

  try {
    const userProfile = await fetchUserByUsername(normalized);
    if (userProfile) {
      userExists = true;
      displayName = userProfile.displayName || normalized;
      bio =
        userProfile.bio?.trim() ||
        `@${normalized}님의 마이링크(MyLink) 프로필 및 링크 모음 페이지입니다.`;
    }
  } catch {
    // Firestore 조회 실패 시 기본값 사용
    displayName = normalized;
  }

  const pageTitle = `${displayName} (@${normalized})`;
  const canonicalUrl = `${SITE_URL}/${encodeURIComponent(normalized)}`;
  const ogImageUrl = `/${encodeURIComponent(normalized)}/opengraph-image`;
  const twitterImageUrl = `/${encodeURIComponent(normalized)}/twitter-image`;

  return {
    title: pageTitle,
    description: bio,
    keywords: [
      normalized,
      displayName,
      "마이링크",
      "mylink",
      "프로필링크",
      "링크인바이오",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: bio,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "profile",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName}님의 마이링크 프로필`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: bio,
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

export default async function UserProfilePage({ params }: UserPageProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsernameParam(username);

  if (!normalizedUsername) {
    notFound();
  }

  // JSON-LD 구조화 데이터 (ProfilePage)
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `@${normalizedUsername} 프로필`,
    url: `https://mylink.kr/${encodeURIComponent(normalizedUsername)}`,
    mainEntity: {
      "@type": "Person",
      name: normalizedUsername,
      alternateName: `@${normalizedUsername}`,
      url: `https://mylink.kr/${encodeURIComponent(normalizedUsername)}`,
    },
  };

  return (
    <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)] overflow-hidden">
      {/* 구조화 데이터 (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
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
