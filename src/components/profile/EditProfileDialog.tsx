"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserProfile } from "@/types";
import { DEFAULT_PROFILE_DATA } from "@/data";
import {
  editProfileSchema,
  EditProfileFormValues,
  DISPLAY_NAME_MIN_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  BADGE_MAX_LENGTH,
  BIO_MAX_LENGTH,
  normalizeUrl,
} from "@/schemas";
import { getDisplayName, getEmailUsername } from "@/lib/links";
import {
  useCheckDisplayNameDuplicateMutation,
  useUpdateProfileMutation,
} from "@/hooks/useLinksQuery";
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
  CheckCircle2,
  Loader2,
  RotateCcw,
  SearchCheck,
  AtSign,
  Check,
} from "lucide-react";

const PRESET_BADGES = [
  "Frontend / Web Developer",
  "Fullstack Developer",
  "Software Engineer",
  "UI/UX Designer",
  "Product Maker",
] as const;

type DuplicateCheckStatus =
  | "unchanged"
  | "unchecked"
  | "checking"
  | "available"
  | "duplicate"
  | "error";

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

  const checkDuplicateMutation = useCheckDisplayNameDuplicateMutation(
    user?.uid
  );
  const updateProfileMutation = useUpdateProfileMutation(user?.uid);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateStatus, setDuplicateStatus] =
    useState<DuplicateCheckStatus>("unchanged");
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [checkedDisplayName, setCheckedDisplayName] = useState<string>("");

  // username은 항상 이메일 앞부분('@' 이전 문자열)
  const username = useMemo(
    () => getEmailUsername(user?.email, user?.username),
    [user?.email, user?.username]
  );

  // Google 계정의 원본 이름 (기본값)
  const googleDefaultName = useMemo(
    () =>
      user?.googleDisplayName?.trim() ||
      user?.displayName?.trim() ||
      username ||
      DEFAULT_PROFILE_DATA.name,
    [user?.googleDisplayName, user?.displayName, username]
  );

  // 현재 적용되어 있는 displayName (기본값은 구글 이름)
  const initialDisplayName = useMemo(
    () =>
      getDisplayName(user?.displayName, googleDefaultName, user?.email),
    [user?.displayName, googleDefaultName, user?.email]
  );

  const defaultValues = useMemo<EditProfileFormValues>(
    () => ({
      displayName: initialDisplayName,
      badge: user?.badge || profileState.badge || DEFAULT_PROFILE_DATA.badge,
      bio: user?.bio || profileState.bio || DEFAULT_PROFILE_DATA.bio,
      photoURL:
        user?.photoURL ||
        profileState.avatarUrl ||
        DEFAULT_PROFILE_DATA.avatarUrl,
    }),
    [
      initialDisplayName,
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
    trigger,
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

  const currentDisplayName = watchedValues.displayName ?? "";
  const currentBadge = watchedValues.badge ?? "";
  const currentBio = watchedValues.bio ?? "";
  const currentPhotoURL = watchedValues.photoURL ?? "";

  const trimmedCurrentName = currentDisplayName.trim();
  const trimmedInitialName = initialDisplayName.trim();
  const isSameAsInitial =
    trimmedCurrentName.toLowerCase() === trimmedInitialName.toLowerCase();

  // 입력한 displayName이 변경될 때 중복 확인 상태 동기화
  const effectiveDuplicateStatus: DuplicateCheckStatus = useMemo(() => {
    if (!trimmedCurrentName) return "unchecked";
    if (duplicateStatus === "checking") return "checking";
    if (
      (duplicateStatus === "available" ||
        duplicateStatus === "duplicate" ||
        duplicateStatus === "error") &&
      checkedDisplayName.toLowerCase() === trimmedCurrentName.toLowerCase()
    ) {
      return duplicateStatus;
    }
    if (isSameAsInitial) {
      return "unchanged";
    }
    return "unchecked";
  }, [
    trimmedCurrentName,
    duplicateStatus,
    checkedDisplayName,
    isSameAsInitial,
  ]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    controlledOnOpenChange?.(nextOpen);
    setSubmitError(null);
    setDuplicateMessage(null);
    setDuplicateStatus("unchanged");
    setCheckedDisplayName(defaultValues.displayName.trim());
    reset(defaultValues);
  };

  // displayName 중복 확인 버튼 핸들러
  const handleCheckDuplicate = async () => {
    setSubmitError(null);
    const isValidField = await trigger("displayName");
    if (!isValidField) {
      return;
    }

    const targetName = trimmedCurrentName;
    if (!targetName || targetName.length < DISPLAY_NAME_MIN_LENGTH) {
      return;
    }

    // 현재 본인의 기존 이름과 동일한 경우에도 Firestore 확인 후 안내
    setDuplicateStatus("checking");
    setDuplicateMessage(null);

    try {
      const isDuplicate = await checkDuplicateMutation.mutateAsync(targetName);
      setCheckedDisplayName(targetName);

      if (isDuplicate) {
        setDuplicateStatus("duplicate");
        setDuplicateMessage(
          "이미 다른 사용자가 사용 중인 표시 이름입니다. 다른 이름을 입력해주세요."
        );
      } else {
        setDuplicateStatus("available");
        setDuplicateMessage(
          isSameAsInitial
            ? "현재 회원님이 사용 중인 표시 이름입니다. (사용 가능)"
            : "사용 가능한 표시 이름(Display Name)입니다!"
        );
      }
    } catch (error) {
      console.error("표시 이름 중복 확인 오류:", error);
      setCheckedDisplayName(targetName);
      setDuplicateStatus("error");
      setDuplicateMessage(
        "중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // Google 기본값으로 복원 핸들러
  const handleResetToGoogleDefault = () => {
    setValue("displayName", googleDefaultName, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    setDuplicateStatus("unchecked");
    setDuplicateMessage(null);
    setSubmitError(null);
  };

  // 전체 프로필 초기 기본값으로 되돌리기
  const handleResetAllFields = () => {
    setValue("displayName", googleDefaultName, {
      shouldValidate: true,
      shouldDirty: true,
    });
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
    setDuplicateStatus("unchecked");
    setDuplicateMessage(null);
    setSubmitError(null);
  };

  const onValidSubmit = async (data: EditProfileFormValues) => {
    setSubmitError(null);
    const nextName = data.displayName.trim();

    // 기존 이름과 다르게 변경했는데 아직 중복 확인을 완료하지 않은 경우
    if (
      nextName.toLowerCase() !== trimmedInitialName.toLowerCase() &&
      effectiveDuplicateStatus !== "available"
    ) {
      if (effectiveDuplicateStatus === "duplicate") {
        setSubmitError(
          "이미 사용 중인 표시 이름입니다. 다른 이름으로 변경 후 중복 확인을 진행해주세요."
        );
        return;
      }
      setSubmitError(
        "표시 이름(Display Name)을 변경하셨습니다. 우측 [중복 확인] 버튼을 눌러 사용 가능 여부를 먼저 확인해주세요."
      );
      return;
    }

    try {
      const normalizedPhoto = data.photoURL.trim()
        ? data.photoURL.trim().startsWith("/")
          ? data.photoURL.trim()
          : normalizeUrl(data.photoURL.trim())
        : user?.photoURL || DEFAULT_PROFILE_DATA.avatarUrl;

      // useUpdateProfileMutation의 onMutate에서 낙관적 업데이트(쿼리 캐시 및 스토어 즉시 반영)가 수행되며,
      // 에러 발생 시 onError에서 이전 상태로 자동 롤백됩니다.
      const updatedUserProfile = await updateProfileMutation.mutateAsync({
        displayName: nextName,
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
            마이페이지에 표시될 이름(Display Name), 직무 뱃지, 소개글을 수정할 수
            있습니다.
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
              alt={`${trimmedCurrentName || initialDisplayName} 프로필 미리보기`}
            />
            <AvatarFallback>
              {(trimmedCurrentName || initialDisplayName)
                .charAt(0)
                .toUpperCase() || "👤"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-black truncate">
                {trimmedCurrentName || "표시 이름 미리보기"}
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

          {/* 2. Display Name (구글 이름 기본값 + 수정 가능 + 중복 확인) */}
          <Field
            name="displayName"
            invalid={
              Boolean(errors.displayName) ||
              effectiveDuplicateStatus === "duplicate"
            }
            touched={Boolean(touchedFields.displayName)}
            dirty={Boolean(dirtyFields.displayName)}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <FieldLabel>
                표시 이름 (Display Name) <span className="text-red-600">*</span>
              </FieldLabel>
              <div className="flex items-center gap-2">
                {trimmedCurrentName !== googleDefaultName && (
                  <button
                    type="button"
                    onClick={handleResetToGoogleDefault}
                    className="text-[11px] font-black text-blue-700 underline hover:text-blue-900 cursor-pointer"
                  >
                    Google 기본 이름({googleDefaultName})으로 복원
                  </button>
                )}
                <span
                  className={`text-[11px] font-black ${
                    trimmedCurrentName.length > DISPLAY_NAME_MAX_LENGTH
                      ? "text-red-600"
                      : "text-black/50"
                  }`}
                >
                  {trimmedCurrentName.length}/{DISPLAY_NAME_MAX_LENGTH}자
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={`예: ${googleDefaultName} (2~20자)`}
                  className={`bg-white pr-9 ${
                    effectiveDuplicateStatus === "available"
                      ? "border-black bg-emerald-50/50"
                      : effectiveDuplicateStatus === "duplicate"
                      ? "border-red-600 bg-red-50/50"
                      : ""
                  }`}
                  {...register("displayName")}
                />
                {effectiveDuplicateStatus === "available" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>

              <Button
                type="button"
                variant={
                  effectiveDuplicateStatus === "available"
                    ? "accent"
                    : "secondary"
                }
                size="default"
                disabled={
                  effectiveDuplicateStatus === "checking" ||
                  trimmedCurrentName.length < DISPLAY_NAME_MIN_LENGTH ||
                  trimmedCurrentName.length > DISPLAY_NAME_MAX_LENGTH
                }
                onClick={() => void handleCheckDuplicate()}
                className="h-10 px-3 text-xs font-black shrink-0"
              >
                {effectiveDuplicateStatus === "checking" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                    <span>확인 중...</span>
                  </>
                ) : effectiveDuplicateStatus === "available" ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>확인 완료</span>
                  </>
                ) : (
                  <>
                    <SearchCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>중복 확인</span>
                  </>
                )}
              </Button>
            </div>

            {/* 필드 유효성 에러 */}
            {errors.displayName && (
              <FieldError>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.displayName.message}</span>
              </FieldError>
            )}

            {/* 중복 확인 결과 피드백 메시지 */}
            {!errors.displayName &&
              effectiveDuplicateStatus === "available" &&
              duplicateMessage && (
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-[#A7F3D0]/60 px-2.5 py-1.5 rounded-[6px] border-[1.5px] border-black">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.5]" />
                  <span>{duplicateMessage}</span>
                </div>
              )}

            {!errors.displayName &&
              (effectiveDuplicateStatus === "duplicate" ||
                effectiveDuplicateStatus === "error") &&
              duplicateMessage && (
                <div className="flex items-center gap-1.5 text-xs font-black text-red-700 bg-[#FEE2E2] px-2.5 py-1.5 rounded-[6px] border-[1.5px] border-black">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 stroke-[2.5]" />
                  <span>{duplicateMessage}</span>
                </div>
              )}

            {!errors.displayName && effectiveDuplicateStatus === "unchecked" && (
              <FieldDescription className="text-amber-800 font-extrabold">
                💡 표시 이름을 변경하셨습니다. 우측 <strong>[중복 확인]</strong>{" "}
                버튼을 눌러 중복 여부를 확인해주세요.
              </FieldDescription>
            )}

            {!errors.displayName && effectiveDuplicateStatus === "unchanged" && (
              <FieldDescription>
                기본값으로 Google 계정 이름({googleDefaultName})이 사용되며, 원하는
                이름으로 수정 후 중복 확인이 가능합니다.
              </FieldDescription>
            )}
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
