"use client";

import React, { useState, useMemo } from "react";
import { LinkItem } from "@/types";
import { LinkButton } from "./LinkButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface LinkListProps {
  links: LinkItem[];
  showFilter?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function LinkList({
  links,
  showFilter = true,
  isLoading = false,
  loadingMessage = "링크 목록을 불러오는 중...",
}: LinkListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 등록된 링크들에서 실제로 존재하는 카테고리 목록 추출
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    links.forEach((link) => {
      if (link.category) {
        categories.add(link.category);
      }
    });
    return ["전체", ...Array.from(categories)];
  }, [links]);

  // 검색 및 카테고리 필터링된 링크 목록
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchCategory =
        selectedCategory === "전체" || link.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.description &&
          link.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchQuery;
    });
  }, [links, selectedCategory, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 카테고리 필터 & 검색 영역 (링크가 3개 이상일 때 편리하게 노출) */}
      {showFilter && links.length > 2 && (
        <div className="flex flex-col gap-2 pb-1">
          {/* shadcn/ui Input 재사용: 간편 검색 인풋 */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/60 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="링크 검색하기..."
              className="pl-9 h-9"
            />
          </div>

          {/* 카테고리 버튼 필터 (flex-wrap 기반의 안정된 칩 레이아웃으로 잘림 현상 방지) */}
          {availableCategories.length > 2 && (
            <div className="flex items-center justify-center flex-wrap gap-1.5 p-1">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Button
                    key={cat}
                    size="sm"
                    variant={isSelected ? "secondary" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className={`h-7 px-2.5 py-0.5 text-[11px] sm:text-xs font-black transition-all ${
                      isSelected
                        ? "bg-[#67E8F9] text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                        : "bg-white text-black/80 hover:bg-zinc-100 shadow-[1.5px_1.5px_0px_#000000]"
                    }`}
                  >
                    {cat}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 로딩 / 갱신 인디케이터 배너 */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#BAE6FD] border-[2px] border-black rounded-[10px] shadow-[3px_3px_0px_#000000] text-xs font-black text-black"
        >
          <Loader2 className="w-4 h-4 animate-spin stroke-[2.5] shrink-0" />
          <span>{loadingMessage}</span>
        </div>
      )}

      {/* 링크 목록 */}
      <div
        className={`flex flex-col gap-2.5 transition-opacity duration-200 ${
          isLoading ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        {filteredLinks.length > 0 ? (
          filteredLinks.map((link) => (
            <LinkButton key={link.id} link={link} />
          ))
        ) : (
          <div className="py-8 px-4 text-center bg-white/70 border-[2px] border-dashed border-black/40 rounded-[10px]">
            <p className="text-sm font-black text-black/70">
              검색 조건에 맞는 링크가 없습니다.
            </p>
            {(selectedCategory !== "전체" || searchQuery) && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSelectedCategory("전체");
                  setSearchQuery("");
                }}
                className="mt-1 text-xs font-black underline text-black hover:text-black/70"
              >
                필터 초기화
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
