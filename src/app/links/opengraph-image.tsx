import {
  createStaticOgImage,
  ogSize,
  ogContentType,
} from "@/lib/og/staticOgImage";
import { SITE_DOMAIN } from "@/lib/constants";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "마이링크 (mylink) - 내 링크 관리";

export default async function Image() {
  return createStaticOgImage({
    title: "내 링크 관리하기 (Links)",
    description:
      "나만의 소중한 링크들을 카테고리별로 깔끔하게 정리하고 관리하세요.",
    badge: "🛠️ LINK MANAGER",
    badgeColor: "#BAE6FD",
    tags: ["#링크관리", "#소셜모음", "#포트폴리오", "#커스터마이징"],
    pathname: `${SITE_DOMAIN}/links`,
  });
}
