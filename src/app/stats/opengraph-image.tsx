import {
  createStaticOgImage,
  ogSize,
  ogContentType,
} from "@/lib/og/staticOgImage";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "마이링크 (mylink) - 실시간 통계";

export default async function Image() {
  return createStaticOgImage({
    title: "실시간 링크 클릭 통계 (Stats)",
    description:
      "방문자의 클릭 수와 유입 트렌드를 한눈에 확인하고 나만의 링크 영향력을 측정하세요.",
    badge: "📊 ANALYTICS",
    badgeColor: "#A7F3D0",
    tags: ["#실시간통계", "#클릭트래킹", "#성과분석", "#데이터시각화"],
    pathname: "mylink.kr/stats",
  });
}
