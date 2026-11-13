"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LinkItem } from "@/types";
import { useProfileStore } from "@/store";
import { DUMMY_LINKS, LINK_CATEGORIES } from "@/data";
import {
  subscribeToAnonymousLinks,
  mergeFirestoreLinks,
} from "@/lib/links";
import { LinkButton } from "@/components/profile/LinkButton";
import { AddLinkDialog } from "@/components/profile/AddLinkDialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  Badge,
} from "@/components/ui";
import { Search, ArrowLeft, Filter, Sparkles } from "lucide-react";

export default function LinksPage() {
  const addStoreLink = useProfileStore((state) => state.addLink);

  // Firestore(users/anonymous/links) 링크 목록 상태 관리
  const [firestoreLinks, setFirestoreLinks] = useState<LinkItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Firestore(users/anonymous/links) 실시간 구독 연동
  useEffect(() => {
    const unsubscribe = subscribeToAnonymousLinks((fetchedLinks) => {
      setFirestoreLinks(fetchedLinks);
    });
    return () => unsubscribe();
  }, []);

  const links = useMemo(
    () => mergeFirestoreLinks(firestoreLinks, DUMMY_LINKS),
    [firestoreLinks]
  );

  const handleAddLink = (newLink: LinkItem) => {
    setFirestoreLinks((prev) => mergeFirestoreLinks([newLink], prev));
    addStoreLink(newLink);
  };

  // 필터링 적용
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchCat =
        selectedCategory === "전체" || link.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.description &&
          link.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [links, selectedCategory, searchQuery]);

  return (
    <main className="relative flex-1 p-4 sm:p-6 md:p-8 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)]">
      {/* 배경 도트 패턴 (Tailwind CSS) */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto flex flex-col gap-5 sm:gap-6">
        {/* 상단 내비게이션 바 (shadcn/ui Button 및 AddLinkDialog 재사용) */}
        <div className="flex items-center justify-between gap-2">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs sm:text-sm font-black"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>프로필 카드로 돌아가기</span>
            </Button>
          </Link>

          <AddLinkDialog
            onAddLink={handleAddLink}
            existingLinks={links}
            triggerLabel="새 링크 추가"
            triggerClassName="text-xs font-black shrink-0"
          />
        </div>

        {/* 페이지 헤더 카드 (shadcn/ui Card, CardHeader, CardTitle, CardDescription 재사용) */}
        <Card variant="secondary" className="p-0">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Badge
                  variant="default"
                  size="sm"
                  className="mb-2 font-black shadow-[1.5px_1.5px_0px_#000000]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  <span>ALL LINKS DIRECTORY</span>
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl">
                  링크 모아보기
                </CardTitle>
                <CardDescription className="mt-1 text-black/80 font-bold">
                  개발 프로젝트, 기술 블로그, 포트폴리오 등 엄선된 링크 모음입니다.
                </CardDescription>
              </div>

              <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-white rounded-[10px] border-[2px] border-black shadow-[3px_3px_0px_#000000]">
                <span className="text-xs font-black text-black/60">전체</span>
                <span className="text-2xl font-black text-black">
                  {links.length}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 검색 및 카테고리 필터 섹션 (shadcn/ui Card, Input, Button 재사용) */}
        <Card variant="white" className="p-4 sm:p-5 shadow-[4px_4px_0px_#000000]">
          <div className="flex flex-col gap-3">
            {/* 검색창 */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="링크 제목이나 키워드로 검색해보세요..."
                className="pl-10 h-10 bg-zinc-50"
              />
            </div>

            {/* 카테고리 버튼 필터 (안정적인 flex-wrap 및 패딩 적용) */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <div className="flex items-center gap-1 text-xs font-black text-black/70 mr-1 select-none">
                <Filter className="w-3.5 h-3.5" />
                <span>카테고리:</span>
              </div>
              {LINK_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Button
                    key={cat}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    className={`h-7 px-2.5 py-0.5 text-xs font-black transition-all ${
                      isSelected
                        ? "shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                        : "shadow-[1.5px_1.5px_0px_#000000]"
                    }`}
                  >
                    {cat}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 링크 목록 결과 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 text-xs font-black text-black">
            <span>
              검색 결과:{" "}
              <strong className="text-blue-600">{filteredLinks.length}</strong>
              개
            </span>
            {(selectedCategory !== "전체" || searchQuery) && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSelectedCategory("전체");
                  setSearchQuery("");
                }}
                className="h-auto p-0 underline text-xs font-black hover:text-black/60"
              >
                필터 초기화
              </Button>
            )}
          </div>

          {filteredLinks.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {filteredLinks.map((link) => (
                <LinkButton key={link.id} link={link} />
              ))}
            </div>
          ) : (
            <Card
              variant="white"
              className="py-12 px-4 text-center border-dashed border-black/30 shadow-[3px_3px_0px_#000000]"
            >
              <CardContent className="p-0">
                <span className="text-3xl">🔍</span>
                <p className="mt-2 text-sm font-black text-black">
                  일치하는 링크를 찾을 수 없습니다.
                </p>
                <p className="mt-1 text-xs font-bold text-black/60">
                  다른 검색어를 입력하거나 카테고리 필터를 변경해 보세요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
