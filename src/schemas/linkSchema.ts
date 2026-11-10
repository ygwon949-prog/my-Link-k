import { z } from "zod";
import { LinkItem } from "@/types";

export const TITLE_MIN_LENGTH = 2;
export const TITLE_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 80;

/**
 * 프로토콜이 생략된 URL에 https://를 자동 보정합니다.
 */
export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * 웹 URL(http/https) 또는 이메일(mailto:) 형식이 유효한지 검증합니다.
 */
export function isValidUrlOrMailto(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;

  const normalized = normalizeUrl(trimmed);

  if (normalized.startsWith("mailto:")) {
    const emailPart = normalized.slice("mailto:".length);
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailPart);
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const hasValidDomain =
      /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(host) &&
      (host.split(".").pop()?.length ?? 0) >= 2;

    return isLocalhost || hasValidDomain;
  } catch {
    return false;
  }
}

/**
 * 기존 링크 목록(중복 URL 검사용)을 주입받아 새 링크 추가용 Zod 스키마를 생성합니다.
 */
export function createAddLinkSchema(existingLinks: LinkItem[] = []) {
  return z.object({
    icon: z
      .string()
      .trim()
      .min(1, { message: "아이콘(이모지)을 선택하거나 입력해주세요." })
      .max(4, { message: "이모지는 최대 4자까지 입력 가능합니다." }),
    title: z
      .string()
      .trim()
      .min(1, { message: "링크 제목을 입력해주세요." })
      .min(TITLE_MIN_LENGTH, {
        message: `링크 제목은 최소 ${TITLE_MIN_LENGTH}자 이상 입력해주세요.`,
      })
      .max(TITLE_MAX_LENGTH, {
        message: `링크 제목은 최대 ${TITLE_MAX_LENGTH}자 이내로 입력해주세요.`,
      }),
    url: z
      .string()
      .trim()
      .min(1, { message: "이동할 URL 주소를 입력해주세요." })
      .refine((val) => !/\s/.test(val), {
        message: "URL 주소에는 공백을 포함할 수 없습니다.",
      })
      .refine((val) => isValidUrlOrMailto(val), {
        message:
          "유효한 도메인 주소 또는 이메일(mailto:) 형식을 입력해주세요. (예: https://github.com)",
      })
      .refine(
        (val) => {
          if (!isValidUrlOrMailto(val)) return true;
          const normalized = normalizeUrl(val).toLowerCase();
          return !existingLinks.some(
            (item) => item.url.trim().toLowerCase() === normalized
          );
        },
        {
          message: "이미 목록에 등록된 URL 주소입니다.",
        }
      ),
    description: z
      .string()
      .trim()
      .max(DESCRIPTION_MAX_LENGTH, {
        message: `한줄 설명은 최대 ${DESCRIPTION_MAX_LENGTH}자 이내로 입력해주세요.`,
      }),
    category: z.string().min(1, { message: "카테고리를 선택해주세요." }),
    isPinned: z.boolean(),
  });
}

export const addLinkSchema = createAddLinkSchema();
export type AddLinkFormValues = z.infer<typeof addLinkSchema>;

/**
 * 검증 완료된 폼 데이터를 LinkItem 객체로 변환합니다.
 */
export function createLinkItemFromForm(data: AddLinkFormValues): LinkItem {
  return {
    id: `link-${Date.now()}`,
    title: data.title.trim(),
    url: normalizeUrl(data.url),
    icon: data.icon.trim() || "🔗",
    description: data.description.trim() || undefined,
    category: data.category,
    isPinned: data.isPinned,
    createdAt: new Date().toISOString(),
  };
}
