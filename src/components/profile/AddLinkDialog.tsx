"use client";

import React, { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkItem } from "@/types";
import { LINK_CATEGORIES } from "@/data";
import {
  createAddLinkSchema,
  createLinkItemFromForm,
  AddLinkFormValues,
  normalizeUrl,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from "@/schemas";
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
  FieldError,
  Button,
  Input,
  Label,
  Badge,
} from "@/components/ui";
import { LinkButton } from "./LinkButton";
import { Plus, Sparkles, Pin, AlertCircle, CheckCircle2 } from "lucide-react";

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

const DEFAULT_VALUES: AddLinkFormValues = {
  icon: "🔗",
  title: "",
  url: "",
  description: "",
  category: "개발",
  isPinned: false,
};

export interface AddLinkDialogProps {
  onAddLink: (newLink: LinkItem) => void;
  existingLinks?: LinkItem[];
  triggerLabel?: string;
  triggerClassName?: string;
}

export function AddLinkDialog({
  onAddLink,
  existingLinks = [],
  triggerLabel = "새 링크 추가",
  triggerClassName,
}: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);

  // 기존 링크 목록을 반영한 동적 Zod 스키마 메모이제이션
  const schema = useMemo(
    () => createAddLinkSchema(existingLinks),
    [existingLinks]
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm<AddLinkFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  // React Hook Form의 useWatch를 활용한 실시간 미리보기 및 글자 수 구독
  const watchedValues = useWatch({
    control,
    defaultValue: DEFAULT_VALUES,
  });

  const currentIcon = watchedValues.icon ?? "🔗";
  const currentTitle = watchedValues.title ?? "";
  const currentUrl = watchedValues.url ?? "";
  const currentDescription = watchedValues.description ?? "";
  const currentCategory = watchedValues.category ?? "개발";
  const currentIsPinned = Boolean(watchedValues.isPinned);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(DEFAULT_VALUES);
    }
  };

  const onValidSubmit = (data: AddLinkFormValues) => {
    const newLink = createLinkItemFromForm(data);
    onAddLink(newLink);
    reset(DEFAULT_VALUES);
    setOpen(false);
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

  const previewLink: LinkItem = {
    id: "preview",
    title: currentTitle.trim() || "새로운 링크 제목 미리보기",
    url: normalizeUrl(currentUrl) || "https://example.com",
    icon: currentIcon.trim() || "🔗",
    description:
      currentDescription.trim() || "입력한 한줄 설명이 여기에 표시됩니다.",
    category: currentCategory,
    isPinned: currentIsPinned,
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="accent"
            size="sm"
            className={triggerClassName}
          />
        }
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>{triggerLabel}</span>
      </DialogTrigger>

      <DialogContent className="bg-[#FFFBEB]">
        <DialogHeader>
          <div className="mb-1">
            <Badge
              variant="primary"
              size="sm"
              className="font-black shadow-[1.5px_1.5px_0px_#000000]"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              <span>NEW LINK</span>
            </Badge>
          </div>
          <DialogTitle>새 링크 추가하기</DialogTitle>
          <DialogDescription>
            프로필 카드에 추가할 새로운 링크 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="flex flex-col gap-4 mt-1"
        >
          {/* 1. 아이콘(이모지) 선택 (@base-ui/react Field + Input) */}
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
                className="w-14 h-10 text-center text-lg px-1 shrink-0 bg-white"
                {...register("icon")}
              />
              <div className="flex items-center gap-1.5 flex-wrap">
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
                      className={`w-8 h-8 rounded-[8px] border-[2px] border-black flex items-center justify-center text-base transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FEF08A] shadow-[2px_2px_0px_#000000] -translate-y-0.5"
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

          {/* 2. 링크 제목 (@base-ui/react Field + Input) */}
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
                className={`pr-9 ${
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

          {/* 3. 이동할 URL (@base-ui/react Field + Input) */}
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
                className={`pr-9 ${
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

          {/* 4. 한줄 설명 (@base-ui/react Field + Input) */}
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

          {/* 실시간 미리보기 */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[11px] font-black text-black/60">
              실시간 버튼 미리보기
            </span>
            <div className="pointer-events-none">
              <LinkButton link={previewLink} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" variant="default">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>링크 추가하기</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
