import { z } from "zod";
import { isValidUrlOrMailto } from "./linkSchema";

// 표시 이름(displayName)은 최초 생성 후 수정할 수 없으므로 편집 스키마에 포함하지 않습니다.
export const BADGE_MIN_LENGTH = 2;
export const BADGE_MAX_LENGTH = 40;
export const BIO_MIN_LENGTH = 2;
export const BIO_MAX_LENGTH = 160;

/**
 * 프로필 이미지 URL 유효성 검증 (빈 값, 내부 경로 '/...', 또는 http/https URL 허용)
 */
export function isValidAvatarUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("mailto:")) return false;
  return isValidUrlOrMailto(trimmed);
}

export const editProfileSchema = z.object({
  badge: z
    .string()
    .trim()
    .min(1, { message: "직무 또는 역할 뱃지 문구를 입력해주세요." })
    .min(BADGE_MIN_LENGTH, {
      message: `뱃지 문구는 최소 ${BADGE_MIN_LENGTH}자 이상 입력해주세요.`,
    })
    .max(BADGE_MAX_LENGTH, {
      message: `뱃지 문구는 최대 ${BADGE_MAX_LENGTH}자 이내로 입력해주세요.`,
    }),
  bio: z
    .string()
    .trim()
    .min(1, { message: "자기소개(Bio)를 입력해주세요." })
    .min(BIO_MIN_LENGTH, {
      message: `자기소개는 최소 ${BIO_MIN_LENGTH}자 이상 입력해주세요.`,
    })
    .max(BIO_MAX_LENGTH, {
      message: `자기소개는 최대 ${BIO_MAX_LENGTH}자 이내로 입력해주세요.`,
    }),
  photoURL: z
    .string()
    .trim()
    .refine((val) => isValidAvatarUrl(val), {
      message:
        "유효한 이미지 URL(https://...)을 입력하거나 비워두세요 (비워두면 기본 프로필 사진이 사용됩니다).",
    }),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
