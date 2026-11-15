"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserProfile } from "@/types";
import { DEFAULT_PROFILE_DATA } from "@/data";
import {
  editProfileSchema,
  EditProfileFormValues,
  BADGE_MAX_LENGTH,
  BIO_MAX_LENGTH,
  normalizeUrl,
} from "@/schemas";
import { getDisplayName, getEmailUsername } from "@/lib/links";
import { useUpdateProfileMutation } from "@/hooks/useLinksQuery";
import { useAuthStore, useProfileStore } from "@/store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Button,
  Input,
  Label,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import {
  UserPen,
  Sparkles,
  AlertCircle,
  Loader2,
  RotateCcw,
  AtSign,
  Check,
  Lock,
} from "lucide-react";

const PRESET_BADGES = [
  "Frontend / Web Developer",
  "Fullstack Developer",
  "Software Engineer",
  "UI/UX Designer",
  "Product Maker",
] as const;

export interface EditProfileDialogProps {
  onProfileUpdated?: (updatedProfile: UserProfile) => void;
  triggerLabel?: string;
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditProfileDialog({
  onProfileUpdated,
  triggerLabel = "프로필 수정",
  triggerClassName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditProfileDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const user = useAuthStore((state) => state.user);
  const profileState = useProfileStore((state) => state.profile);

  const updateProfileMutation = useUpdateProfileMutation(user?.uid);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // username은 항상 이메일 앞부분('@' 이전 문자열) - 수정 불가
  const username = useMemo(
    () => getEmailUsername(user?.email, user?.username),
    [user?.email, user?.username]
  );

  // 표시 이름(displayName)은 최초 생성 시 중복 검사를 거쳐 확정되며 이후 수정 불가
  const lockedDisplayName = useMemo(
    () =>
      getDisplayName(user?.displayName, user?.googleDisplayName, user?.email),
    [user?.displayName, user?.googleDisplayName, user?.email]
  );

  const defaultValues = useMemo<EditProfileFormValues>(
    () => ({
      badge: user?.badge || profileState.badge || DEFAULT_PROFILE_DATA.badge,
      bio: user?.bio || profileState.bio || DEFAULT_PROFILE_DATA.bio,
      photoURL:
        user?.photoURL ||
        profileState.avatarUrl ||
        DEFAULT_PROFILE_DATA.avatarUrl,
    }),
    [
      user?.badge,
      user?.bio,
      user?.photoURL,
      profileState.badge,
      profileState.bio,
      profileState.avatarUrl,
    ]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, touchedFields, dirtyFields, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
    mode: "onTouched",
  });

  // 모달이 열려 있지 않을 때 최신 유저 정보로 폼 기본값 동기화
  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const watchedValues = useWatch({
    control,
    defaultValue: defaultValues,
  });

  const currentBadge = watchedValues.badge ?? "";
  const currentBio = watchedValues.bio ?? "";
  const currentPhotoURL = watchedValues.photoURL ?? "";

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    controlledOnOpenChange?.(nextOpen);
    setSubmitError(null);
    reset(defaultValues);
  };

  // 표시 이름을 제외한 프로필 필드를 기본값으로 되돌리기
  const handleResetAllFields = () => {
    setValue("badge", DEFAULT_PROFILE_DATA.badge, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("bio", DEFAULT_PROFILE_DATA.bio, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("photoURL", user?.photoURL || DEFAULT_PROFILE_DATA.avatarUrl, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setSubmitError(null);
  };

  const onValidSubmit = async (data: EditProfileFormValues) => {
    setSubmitError(null);

    try {
      const normalizedPhoto = data.photoURL.trim()
        ? data.photoURL.trim().startsWith("/")
          ? data.photoURL.trim()
          : normalizeUrl(data.photoURL.trim())
        : user?.photoURL || DEFAULT_PROFILE_DATA.avatarUrl;

      // useUpdateProfileMutation의 onMutate에서 낙관적 업데이트(쿼리 캐시 및 스토어 즉시 반영)가 수행되며,
      // 에러 발생 시 onError에서 이전 상태로 자동 롤백됩니다.
      const updatedUserProfile = await updateProfileMutation.mutateAsync({
        badge: data.badge.trim(),
        bio: data.bio.trim(),
        photoURL: normalizedPhoto,
      });

      onProfileUpdated?.(updatedUserProfile);
      handleOpenChange(false);
    } catch (error) {
      console.error("프로필 저장 실패:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "프로필 정보를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(onValidSubmit)(e);
  };

  const previewAvatar =
    currentPhotoURL.trim() ||
    user?.photoURL ||
    DEFAULT_PROFILE_DATA.avatarUrl ||
    "/avatar.png";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={triggerClassName}
            />
          }
        >
          <UserPen className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{triggerLabel}</span>
        </DialogTrigger>
      )}

      <DialogContent className="bg-[#FFFBEB] max-w-lg">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="secondary"
              size="sm"
              className="font-black bg-[#BAE6FD] shadow-[1.5px_1.5px_0px_#000000]"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              <span>EDIT PROFILE</span>
            </Badge>
            <Badge
              variant="default"
              size="sm"
              className="font-black bg-white shadow-[1.5px_1.5px_0px_#000000]"
            >
              @{username}
            </Badge>
          </div>
          <DialogTitle>프로필 수정하기</DialogTitle>
          <DialogDescription>
            마이페이지에 표시될 직무 뱃지, 소개글, 프로필 이미지를 수정할 수
            있습니다. 표시 이름과 아이디는 변경할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 상단 실시간 프로필 미리보기 */}
        <div className="p-3 rounded-[10px] border-[2px] border-black bg-white shadow-[3px_3px_0px_#000000] flex items-center gap-3 text-left">
          <Avatar
            size="sm"
            isOnline={true}
            className="border-[2px] border-black shadow-[2px_2px_0px_#000000] shrink-0"
          >
            <AvatarImage
              src={previewAvatar}
              alt={`${lockedDisplayName} 프로필 미리보기`}
            />
            <AvatarFallback>
              {lockedDisplayName.charAt(0).toUpperCase() || "👤"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-black truncate">
                {lockedDisplayName}
              </span>
              <span className="text-xs font-extrabold text-black/60 truncate">
                @{username}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="default"
                size="sm"
                className="text-[10px] py-0.5 px-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="truncate max-w-[200px]">
                  {currentBadge.trim() || "직무 / 역할 뱃지"}
                </span>
              </Badge>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="flex flex-col gap-4 mt-1"
        >
          {/* 1. Username (이메일 앞부분 고정 / 읽기 전용) */}
          <Field name="username">
            <div className="flex items-center justify-between">
              <FieldLabel className="flex items-center gap-1">
                <AtSign className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>아이디 (Username)</span>
              </FieldLabel>
              <Badge
                variant="default"
                size="sm"
                className="px-1.5 py-0 text-[10px] bg-zinc-100 shadow-[1px_1px_0px_#000000]"
              >
                이메일 앞부분 자동 적용
              </Badge>
            </div>
            <Input
              type="text"
              value={`@${username}`}
              readOnly
              disabled
              aria-label="아이디 (이메일 앞부분)"
              className="bg-zinc-100 text-black/80 font-black cursor-not-allowed opacity-80"
            />
            <FieldDescription>
              username은 로그인한 이메일({user?.email || "이메일"})의 &apos;@&apos;
              앞부분으로 고정됩니다.
            </FieldDescription>
          </Field>

          {/* 2. Display Name (수정 불가 / 읽기 전용) */}
          <Field name="displayName">
            <div className="flex items-center justify-between">
              <FieldLabel className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>표시 이름 (Display Name)</span>
              </FieldLabel>
              <Badge
                variant="default"
                size="sm"
                className="px-1.5 py-0 text-[10px] bg-zinc-100 shadow-[1px_1px_0px_#000000]"
              >
                수정 불가
              </Badge>
            </div>
            <Input
              type="text"
              value={lockedDisplayName}
              readOnly
              disabled
              aria-label="표시 이름 (수정 불가)"
              className="bg-zinc-100 text-black/80 font-black cursor-not-allowed opacity-80"
            />
            <FieldDescription>
              표시 이름은 가입 시 Google 이름을 기준으로 중복 검사를 거쳐
              확정되며, 이후에는 변경할 수 없습니다.
            </FieldDescription>
          </Field>

          {/* 3. 직무 / 역할 뱃지 */}
          <Field
            name="badge"
            invalid={Boolean(errors.badge)}
            touched={Boolean(touchedFields.badge)}
            dirty={Boolean(dirtyFields.badge)}
          >
            <div className="flex items-center justify-between">
              <FieldLabel>
                직무 / 역할 뱃지 <span className="text-red-600">*</span>
              </FieldLabel>
              <span
                className={`text-[11px] font-black ${
                  currentBadge.trim().length > BADGE_MAX_LENGTH
                    ? "text-red-600"
                    : "text-black/50"
                }`}
              >
                {currentBadge.trim().length}/{BADGE_MAX_LENGTH}자
              </span>
            </div>
            <Input
              type="text"
              placeholder="예: Frontend / Web Developer"
              className="bg-white"
              {...register("badge")}
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {PRESET_BADGES.map((preset) => {
                const isSelected = currentBadge.trim() === preset;
                return (
                  <Button
                    key={preset}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() =>
                      setValue("badge", preset, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                    className={`h-6 px-2 py-0 text-[10px] font-black rounded-[6px] ${
                      isSelected
                        ? "bg-[#FEF08A] shadow-[1.5px_1.5px_0px_#000000]"
                        : "bg-white shadow-[1px_1px_0px_#000000]"
                    }`}
                  >
                    {preset}
                  </Button>
                );
              })}
            </div>
            {errors.badge && (
              <FieldError>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.badge.message}</span>
              </FieldError>
            )}
          </Field>

          {/* 4. 자기소개 (Bio) */}
          <Field
            name="bio"
            invalid={Boolean(errors.bio)}
            touched={Boolean(touchedFields.bio)}
            dirty={Boolean(dirtyFields.bio)}
          >
            <div className="flex items-center justify-between">
              <FieldLabel>
                자기소개 (Bio) <span className="text-red-600">*</span>
              </FieldLabel>
              <span
                className={`text-[11px] font-black ${
                  currentBio.trim().length > BIO_MAX_LENGTH
                    ? "text-red-600"
                    : "text-black/50"
                }`}
              >
                {currentBio.trim().length}/{BIO_MAX_LENGTH}자
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="자신을 표현하는 한줄 또는 멀티라인 소개글을 입력해주세요 (최대 160자)"
              className="flex w-full rounded-[8px] border-[2px] border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0px_#000000] transition-all placeholder:text-black/40 placeholder:font-medium focus-visible:outline-none focus-visible:shadow-[3px_3px_0px_#000000] resize-none"
              {...register("bio")}
            />
            {errors.bio && (
              <FieldError>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.bio.message}</span>
              </FieldError>
            )}
          </Field>

          {/* 5. 프로필 사진 URL (선택) */}
          <Field
            name="photoURL"
            invalid={Boolean(errors.photoURL)}
            touched={Boolean(touchedFields.photoURL)}
            dirty={Boolean(dirtyFields.photoURL)}
          >
            <div className="flex items-center justify-between">
              <Label>
                프로필 이미지 URL{" "}
                <span className="text-black/50 font-bold">(선택)</span>
              </Label>
              {user?.photoURL && currentPhotoURL.trim() !== user.photoURL && (
                <button
                  type="button"
                  onClick={() =>
                    setValue("photoURL", user.photoURL, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className="text-[11px] font-black text-blue-700 underline hover:text-blue-900 cursor-pointer"
                >
                  Google 프로필 사진으로 복원
                </button>
              )}
            </div>
            <Input
              type="url"
              placeholder="https://... (비워두면 기본 프로필 이미지 사용)"
              className="bg-white"
              {...register("photoURL")}
            />
            {errors.photoURL && (
              <FieldError>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.photoURL.message}</span>
              </FieldError>
            )}
          </Field>

          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-[8px] border-[2px] border-black bg-[#FEE2E2] text-red-900 text-xs font-bold shadow-[2px_2px_0px_#000000]"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          <DialogFooter className="pt-2 flex sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleResetAllFields}
              className="w-full sm:w-auto text-xs font-black"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>기본값 복원</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>프로필 저장</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
