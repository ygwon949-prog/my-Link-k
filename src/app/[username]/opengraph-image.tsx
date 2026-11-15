import {
  createDynamicProfileOgImage,
  ogSize,
  ogContentType,
} from "@/lib/og/dynamicProfileOgImage";
import { normalizeUsernameParam } from "@/lib/links";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "마이링크 (mylink) - 사용자 프로필";

interface DynamicOgProps {
  params: Promise<{ username: string }>;
}

export default async function Image({ params }: DynamicOgProps) {
  const { username } = await params;
  const normalized = normalizeUsernameParam(username) || username;
  return createDynamicProfileOgImage({ username: normalized });
}
