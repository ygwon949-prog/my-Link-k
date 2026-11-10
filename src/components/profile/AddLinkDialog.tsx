"use client";

import React, { useState } from "react";
import { LinkItem } from "@/types";
import { LINK_CATEGORIES } from "@/data";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Badge,
} from "@/components/ui";
import { LinkButton } from "./LinkButton";
import { Plus, Sparkles, Pin, AlertCircle } from "lucide-react";

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

export interface AddLinkDialogProps {
  onAddLink: (newLink: LinkItem) => void;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function AddLinkDialog({
  onAddLink,
  triggerLabel = "새 링크 추가",
  triggerClassName,
}: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);

  // 폼 로컬 상태 (React useState)
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("🔗");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("개발");
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setIcon("🔗");
    setDescription("");
    setCategory("개발");
    setIsPinned(false);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const normalizeUrl = (rawUrl: string): string => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const normalizedUrl = normalizeUrl(url);

    if (!trimmedTitle) {
      setError("링크 제목을 입력해주세요.");
      return;
    }

    if (!normalizedUrl) {
      setError("이동할 URL 주소를 입력해주세요.");
      return;
    }

    const newLink: LinkItem = {
      id: `link-${Date.now()}`,
      title: trimmedTitle,
      url: normalizedUrl,
      icon: icon.trim() || "🔗",
      description: description.trim() || undefined,
      category,
      isPinned,
      createdAt: new Date().toISOString(),
    };

    onAddLink(newLink);
    resetForm();
    setOpen(false);
  };

  const previewLink: LinkItem = {
    id: "preview",
    title: title.trim() || "새로운 링크 제목 미리보기",
    url: normalizeUrl(url) || "https://example.com",
    icon: icon.trim() || "🔗",
    description: description.trim() || "입력한 한줄 설명이 여기에 표시됩니다.",
    category,
    isPinned,
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-[8px] border-[2px] border-black bg-[#F87171]/30 text-black text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000000]">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. 아이콘(이모지) 선택 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-icon">아이콘 (이모지)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="link-icon"
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-14 h-10 text-center text-lg px-1 shrink-0 bg-white"
                aria-label="커스텀 이모지 입력"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_ICONS.map((emoji) => {
                  const isSelected = icon === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
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
          </div>

          {/* 2. 링크 제목 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-title">
              링크 제목 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="link-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="예: 개인 포트폴리오 웹사이트"
              required
            />
          </div>

          {/* 3. 이동할 URL */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-url">
              URL 주소 <span className="text-red-600">*</span>
            </Label>
            <Input
              id="link-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://github.com/..."
              required
            />
          </div>

          {/* 4. 한줄 설명 (선택) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-description">
              한줄 설명 <span className="text-black/50 font-bold">(선택)</span>
            </Label>
            <Input
              id="link-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="링크에 대한 간단한 설명을 적어주세요"
            />
          </div>

          {/* 5. 카테고리 & 상단 고정 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>카테고리</Label>
              <button
                type="button"
                onClick={() => setIsPinned((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] border-[2px] border-black text-xs font-black transition-all cursor-pointer ${
                  isPinned
                    ? "bg-[#FEF08A] text-black shadow-[2px_2px_0px_#000000]"
                    : "bg-white text-black/70 shadow-[1.5px_1.5px_0px_#000000] hover:bg-zinc-100"
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                <span>{isPinned ? "상단 PIN 고정됨" : "상단 PIN 고정"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {SELECTABLE_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Button
                    key={cat}
                    type="button"
                    size="sm"
                    variant={isSelected ? "secondary" : "outline"}
                    onClick={() => setCategory(cat)}
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
