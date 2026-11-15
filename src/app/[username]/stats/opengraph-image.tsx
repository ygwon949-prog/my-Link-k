import {
  createDynamicStatsOgImage,
  ogSize,
  ogContentType,
} from "@/lib/og/dynamicStatsOgImage";
import { normalizeUsernameParam } from "@/lib/links";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "마이링크 (mylink) - 사용자 링크 통계 분석";

interface DynamicStatsOgRouteProps {
  params: Promise<{ username: string }>;
}

export default async function Image({ params }: DynamicStatsOgRouteProps) {
  const { username } = await params;
  const normalized = normalizeUsernameParam(username) || username;
  return createDynamicStatsOgImage({ username: normalized });
}
