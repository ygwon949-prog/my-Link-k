import type { MetadataRoute } from "next";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { USERS_COLLECTION } from "@/lib/links";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date();

  // 기본 정적 사이트맵 (메인 랜딩 페이지)
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Firestore에서 등록된 공개 사용자 목록을 최대 100개까지 조회하여 사이트맵에 동적 추가
  try {
    const usersCol = collection(db, USERS_COLLECTION);
    const usersQuery = query(usersCol, limit(100));
    const usersSnap = await getDocs(usersQuery);

    const userUrls = new Set<string>();

    for (const docSnap of usersSnap.docs) {
      const data = docSnap.data();
      const username =
        typeof data.username === "string" && data.username.trim()
          ? data.username.trim()
          : typeof data.email === "string" && data.email.includes("@")
          ? data.email.split("@")[0].trim()
          : null;

      if (username && !userUrls.has(username.toLowerCase())) {
        userUrls.add(username.toLowerCase());

        // 사용자 프로필 페이지
        routes.push({
          url: `${baseUrl}/${encodeURIComponent(username)}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });

        // 사용자 통계 대시보드 페이지
        routes.push({
          url: `${baseUrl}/${encodeURIComponent(username)}/stats`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  } catch (error) {
    // Firestore 조회 실패 시 기본 루트 사이트맵만 안전하게 반환
    console.warn("사이트맵 사용자 목록 생성 중 에외 발생 (기본 경로만 포함):", error);
  }

  return routes;
}
