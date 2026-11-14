"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkItem } from "@/types";
import { LINK_CATEGORIES } from "@/data";
import {
  createAddLinkSchema,
  updateLinkItemFromForm,
  AddLinkFormValues,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from "@/schemas";
import { updateLinkInFirestore } from "@/lib/links";
import {
  Field,
  FieldLabel,
  FieldError,
  Button,
  Input,
  Label,
  Badge,
} from "@/components/ui";
import { DeleteLinkDialog } from "./DeleteLinkDialog";
import {
  ArrowUpRight,
  Pencil,
  Trash2,
  Pin,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_ICONS = [
  "🔗",
  "🐙",
  "⭐",
  "📝",
  "💼",
  "🚀",
  "📬",
  "📸",
  "🎨",
  "💻",
] as const;

const SELECTABLE_CATEGORIES = LINK_CATEGORIES.filter((cat) => cat !== "전체");

export interface LinkButtonProps {
  link: LinkItem;
  className?: string;
  existingLinks?: LinkItem[];
  onUpdateLink?: (updatedLink: LinkItem) => void;
  onDeleteLink?: (deletedId: string) => void;
  showActions?: boolean;
}

export function LinkButton({
  link,
  className,
  existingLinks = [],
  onUpdateLink,
  onDeleteLink,
  showActions,
}: LinkButtonProps) {
  const isPreview = link.id === "preview";
  const shouldShowActions = showActions ?? !isPreview;
  const isMail = link.url.startsWith("mailto:");

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<AddLinkFormValues>(
    () => ({
      icon: link.icon || "🔗",
      title: link.title,
      url: link.url,
      description: link.description || "",
      category: link.category || "개발",
      isPinned: Boolean(link.isPinned),
    }),
    [link]
  );

  // 추가할 때와 동일한 입력 검증 스키마 (현재 수정 중인 링크 ID는 URL 중복 검사에서 제외)
  const schema = useMemo(
    () => createAddLinkSchema(existingLinks, link.id),
    [existingLinks, link.id]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, touchedFields, dirtyFields, isSubmitting },
  } = useForm<AddLinkFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  // link prop이 갱신되면 폼 기본값 동기화
  useEffect(() => {
    if (!isEditing) {
      reset(defaultValues);
    }
  }, [defaultValues, isEditing, reset]);

  const watchedValues = useWatch({
    control,
    defaultValue: defaultValues,
  });

  const currentIcon = watchedValues.icon ?? "🔗";
  const currentTitle = watchedValues.title ?? "";
  const currentUrl = watchedValues.url ?? "";
  const currentDescription = watchedValues.description ?? "";
  const currentCategory = watchedValues.category ?? "개발";
  const currentIsPinned = Boolean(watchedValues.isPinned);

  const handleStartEdit = () => {
    setSubmitError(null);
    reset(defaultValues);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isSubmitting) return;
    setSubmitError(null);
    reset(defaultValues);
    setIsEditing(false);
  };

  const onValidSubmit = async (data: AddLinkFormValues) => {
    setSubmitError(null);
    try {
      const updatedDraft = updateLinkItemFromForm(link, data);
      const [savedLink] = await Promise.all([
        updateLinkInFirestore(link.id, updatedDraft),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);
      onUpdateLink?.(savedLink);
      setIsEditing(false);
    } catch (error) {
      console.error("Firestore 링크 수정 실패 (users/anonymous/links):", error);
      setSubmitError(
        error instanceof Error
          ? `링크 수정 중 오류가 발생했습니다: ${error.message}`
          : "Firestore에 링크 수정 사항을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(onValidSubmit)(e);
  };

  const isTitleValid =
    (touchedFields.title || dirtyFields.title) &&
    !errors.title &&
    currentTitle.trim().length >= TITLE_MIN_LENGTH;

  const isUrlValid =
    (touchedFields.url || dirtyFields.url) &&
    !errors.url &&
    currentUrl.trim().length > 0;

  // 인라인 편집 UI 모드
  if (isEditing) {
    return (
      <div
        className={cn(
          "w-full p-4 rounded-[12px] border-[2.5px] border-black bg-[#FFFBEB] text-black shadow-[4px_4px_0px_#000000] text-left transition-all",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b-[2px] border-black/15">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              size="sm"
              className="font-black bg-[#BAE6FD] shadow-[1.5px_1.5px_0px_#000000]"
            >
              <Pencil className="w-3 h-3 mr-1" />
              <span>EDIT LINK</span>
            </Badge>
            <span className="text-sm font-black text-black">링크 수정</span>
            {isSubmitting && (
              <Badge
                variant="default"
                size="sm"
                className="font-black bg-[#FEF08A] text-black gap-1 shadow-[1.5px_1.5px_0px_#000000]"
              >
                <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                <span>저장 중...</span>
              </Badge>
            )}
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCancelEdit}
            aria-label="수정 취소"
            className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] border-[2px] border-black bg-white text-black shadow-[1.5px_1.5px_0px_#000000] hover:bg-zinc-100 cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="flex flex-col gap-3.5"
        >
          <fieldset
            disabled={isSubmitting}
            className={cn(
              "flex flex-col gap-3.5 border-none p-0 m-0 min-w-0 transition-opacity",
              isSubmitting && "opacity-60 pointer-events-none"
            )}
          >
            {/* 1. 아이콘(이모지) 선택 */}
            <Field
              name="icon"
              invalid={Boolean(errors.icon)}
              touched={Boolean(touchedFields.icon)}
              dirty={Boolean(dirtyFields.icon)}
            >
              <FieldLabel>
                아이콘 (이모지) <span className="text-red-600">*</span>
              </FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  maxLength={4}
                  aria-label="커스텀 이모지 입력"
                  className="w-14 h-9 text-center text-base px-1 shrink-0 bg-white"
                  {...register("icon")}
                />
                <div className="flex items-center gap-1 flex-wrap">
                  {PRESET_ICONS.map((emoji) => {
                    const isSelected = currentIcon === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          setValue("icon", emoji, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true,
                          })
                        }
                        className={`w-7 h-7 rounded-[6px] border-[1.5px] border-black flex items-center justify-center text-sm transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FEF08A] shadow-[1.5px_1.5px_0px_#000000] -translate-y-0.5"
                            : "bg-white hover:bg-zinc-100 shadow-[1px_1px_0px_#000000]"
                        }`}
                        title={`${emoji} 선택`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
              {errors.icon && (
                <FieldError>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.icon.message}</span>
                </FieldError>
              )}
            </Field>

            {/* 2. 링크 제목 */}
            <Field
              name="title"
              invalid={Boolean(errors.title)}
              touched={Boolean(touchedFields.title)}
              dirty={Boolean(dirtyFields.title)}
            >
              <div className="flex items-center justify-between">
                <FieldLabel>
                  링크 제목 <span className="text-red-600">*</span>
                </FieldLabel>
                <span
                  className={`text-[11px] font-black ${
                    currentTitle.trim().length > TITLE_MAX_LENGTH
                      ? "text-red-600"
                      : "text-black/50"
                  }`}
                >
                  {currentTitle.trim().length}/{TITLE_MAX_LENGTH}자
                </span>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="예: 개인 포트폴리오 웹사이트 (2~50자)"
                  className={`bg-white pr-9 ${
                    isTitleValid ? "border-black bg-emerald-50/40" : ""
                  }`}
                  {...register("title")}
                />
                {isTitleValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
              {errors.title && (
                <FieldError>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.title.message}</span>
                </FieldError>
              )}
            </Field>

            {/* 3. 이동할 URL */}
            <Field
              name="url"
              invalid={Boolean(errors.url)}
              touched={Boolean(touchedFields.url)}
              dirty={Boolean(dirtyFields.url)}
            >
              <div className="flex items-center justify-between">
                <FieldLabel>
                  URL 주소 <span className="text-red-600">*</span>
                </FieldLabel>
                <span className="text-[11px] font-bold text-black/50">
                  프로토콜 미입력 시 https:// 자동 적용
                </span>
              </div>
              <div className="relative">
                <Input
                  type="url"
                  placeholder="https://github.com/..."
                  className={`bg-white pr-9 ${
                    isUrlValid ? "border-black bg-emerald-50/40" : ""
                  }`}
                  {...register("url")}
                />
                {isUrlValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </div>
              {errors.url && (
                <FieldError>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.url.message}</span>
                </FieldError>
              )}
            </Field>

            {/* 4. 한줄 설명 */}
            <Field
              name="description"
              invalid={Boolean(errors.description)}
              touched={Boolean(touchedFields.description)}
              dirty={Boolean(dirtyFields.description)}
            >
              <div className="flex items-center justify-between">
                <FieldLabel>
                  한줄 설명{" "}
                  <span className="text-black/50 font-bold">(선택)</span>
                </FieldLabel>
                <span
                  className={`text-[11px] font-black ${
                    currentDescription.trim().length > DESCRIPTION_MAX_LENGTH
                      ? "text-red-600"
                      : "text-black/50"
                  }`}
                >
                  {currentDescription.trim().length}/{DESCRIPTION_MAX_LENGTH}자
                </span>
              </div>
              <Input
                type="text"
                placeholder="링크에 대한 간단한 설명을 적어주세요 (최대 80자)"
                className="bg-white"
                {...register("description")}
              />
              {errors.description && (
                <FieldError>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.description.message}</span>
                </FieldError>
              )}
            </Field>

            {/* 5. 카테고리 & 상단 고정 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>카테고리</Label>
                <button
                  type="button"
                  onClick={() =>
                    setValue("isPinned", !currentIsPinned, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] border-[2px] border-black text-xs font-black transition-all cursor-pointer ${
                    currentIsPinned
                      ? "bg-[#FEF08A] text-black shadow-[2px_2px_0px_#000000]"
                      : "bg-white text-black/70 shadow-[1.5px_1.5px_0px_#000000] hover:bg-zinc-100"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>
                    {currentIsPinned ? "상단 PIN 고정됨" : "상단 PIN 고정"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {SELECTABLE_CATEGORIES.map((cat) => {
                  const isSelected = currentCategory === cat;
                  return (
                    <Button
                      key={cat}
                      type="button"
                      size="sm"
                      variant={isSelected ? "secondary" : "outline"}
                      onClick={() =>
                        setValue("category", cat, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className={`h-7 px-2.5 py-0.5 text-xs font-black ${
                        isSelected
                          ? "bg-[#BAE6FD] shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                          : "bg-white shadow-[1.5px_1.5px_0px_#000000]"
                      }`}
                    >
                      {cat}
                    </Button>
                  );
                })}
              </div>
            </div>
          </fieldset>

          {/* 수정 저장 진행 중 로딩 표시 배너 */}
          {isSubmitting && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] border-[2px] border-black bg-[#BAE6FD] text-black text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000000]"
            >
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5] shrink-0" />
              <span>파이어베이스에 수정 사항을 저장하는 중입니다...</span>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-[8px] border-[2px] border-black bg-[#FEE2E2] text-red-900 text-xs font-bold shadow-[2px_2px_0px_#000000]"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* 하단 액션 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t-[1.5px] border-black/10">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              onClick={handleCancelEdit}
            >
              취소
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>저장</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center justify-between gap-2 w-full px-3.5 sm:px-4 py-3 rounded-[10px] text-black font-black text-sm sm:text-base border-[2.5px] border-black transition-all",
          link.isPinned
            ? "bg-[#FEF9C3] shadow-[3.5px_3.5px_0px_#000000]"
            : "bg-white shadow-[3px_3px_0px_#000000]",
          "hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#000000]",
          isDeletingCard && "opacity-60 pointer-events-none",
          className
        )}
      >
        {/* 좌측/중앙 링크 이동 영역 */}
        <a
          href={link.url}
          target={isMail ? undefined : "_blank"}
          rel={isMail ? undefined : "noopener noreferrer"}
          className="flex items-center justify-between gap-2.5 min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-[6px]"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* 링크 아이콘 / 이모지 */}
            <span className="flex-shrink-0 text-lg sm:text-xl w-7 h-7 rounded-[6px] bg-zinc-100 flex items-center justify-center border-[1.5px] border-black shadow-[1px_1px_0px_#000000]">
              {link.icon || "🔗"}
            </span>

            {/* 링크 제목 및 부가 설명 */}
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="truncate tracking-tight font-black text-sm sm:text-base">
                  {link.title}
                </span>
                {link.isPinned && (
                  <span className="flex-shrink-0 text-[10px] font-black px-1.5 py-0.2 bg-[#FDE047] text-black border-[1.5px] border-black rounded-[4px] shadow-[1px_1px_0px_#000000]">
                    PIN
                  </span>
                )}
              </div>
              {link.description && (
                <span className="truncate text-xs font-semibold text-black/70">
                  {link.description}
                </span>
              )}
            </div>
          </div>

          {/* 바로가기 화살표 아이콘 */}
          <div className="flex-shrink-0 flex items-center justify-center text-black/80 group-hover:text-black">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </a>

        {/* 우측 상시 노출 수정/삭제 버튼 영역 */}
        {shouldShowActions && (
          <div className="flex items-center gap-1.5 shrink-0 pl-1.5 border-l-[1.5px] border-black/15">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isDeletingCard}
              onClick={handleStartEdit}
              aria-label={`${link.title} 수정`}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs font-black bg-[#BAE6FD] hover:bg-[#7DD3FC] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]"
            >
              <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              <span>수정</span>
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeletingCard}
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label={`${link.title} 삭제`}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs font-black bg-[#F87171] hover:bg-[#EF4444] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]"
            >
              {isDeletingCard ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin stroke-[2.5]" />
                  <span>삭제 중...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                  <span>삭제</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {shouldShowActions && (
        <DeleteLinkDialog
          link={link}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDeleteLink={onDeleteLink}
          onDeletingChange={setIsDeletingCard}
        />
      )}
    </>
  );
}
