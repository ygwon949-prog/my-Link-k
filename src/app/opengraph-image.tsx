import {
  createStaticOgImage,
  ogSize,
  ogContentType,
} from "@/lib/og/staticOgImage";
import { SITE_DOMAIN } from "@/lib/constants";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "마이링크 (mylink) - 힙한 네오브루탈리즘 프로필 링크";

export default async function Image() {
  return createStaticOgImage({
    title: "마이링크 (mylink)",
    description:
      "나를 표현하는 가장 힙한 네오브루탈리즘 프로필 링크! 3초 만에 나만의 링크 인 바이오를 완성해보세요.",
    badge: "⚡ OFFICIAL",
    badgeColor: "#FEF08A",
    tags: ["#네오브루탈리즘", "#링크인바이오", "#실시간통계", "#3초완성"],
    pathname: SITE_DOMAIN,
  });
}
