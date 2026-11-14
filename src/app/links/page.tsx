"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LinkItem } from "@/types";
import { useProfileStore } from "@/store";
import { DUMMY_LINKS, LINK_CATEGORIES } from "@/data";
import {
  fetchAnonymousLinks,
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
import { Search, ArrowLeft, Filter, Sparkles, Loader2 } from "lucide-react";

export default function LinksPage() {
  const addStoreLink = useProfileStore((state) => state.addLink);
  const updateStoreLink = useProfileStore((state) => state.updateLink);
  const removeStoreLink = useProfileStore((state) => state.removeLink);

  // Firestore(users/anonymous/links) 링크 목록 및 로딩/갱신 상태 관리
  const [firestoreLinks, setFirestoreLinks] = useState<LinkItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<string>(
    "링크 변경 사항을 반영하여 목록을 갱신하는 중입니다..."
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 페이지 로드 시 Firestore(users/anonymous/links)에서 createdAt 최신순으로 링크 조회
  useEffect(() => {
    let isMountedEffect = true;

    fetchAnonymousLinks()
      .then((fetchedLinks) => {
        if (isMountedEffect) {
          setFirestoreLinks(fetchedLinks);
        }
      })
      .catch((error) => {
        console.error("Firestore 링크 목록 초기 조회 실패:", error);
      })
      .finally(() => {
        if (isMountedEffect) {
          setIsLoading(false);
        }
      });

    return () => {
      isMountedEffect = false;
    };
  }, []);

  const links = useMemo(() => {
    const baseLinks = DUMMY_LINKS.filter(
      (item) => !deletedIds.includes(item.id)
    );
    const activeFirestoreLinks = firestoreLinks.filter(
      (item) => !deletedIds.includes(item.id)
    );
    return mergeFirestoreLinks(activeFirestoreLinks, baseLinks);
  }, [firestoreLinks, deletedIds]);

  const refreshLinksFromFirestore = (message: string) => {
    setRefreshMessage(message);
    setIsRefreshing(true);
    Promise.all([
      fetchAnonymousLinks(),
      new Promise((resolve) => setTimeout(resolve, 250)),
    ])
      .then(([fetchedLinks]) => {
        setFirestoreLinks(fetchedLinks);
      })
      .catch((error) => {
        console.error("Firestore 링크 목록 갱신 실패:", error);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  const handleAddLink = (newLink: LinkItem) => {
    setFirestoreLinks((prev) => mergeFirestoreLinks([newLink], prev));
    addStoreLink(newLink);
    refreshLinksFromFirestore("새 링크를 반영하여 목록을 갱신하는 중입니다...");
  };

  const handleUpdateLink = (updatedLink: LinkItem) => {
    setFirestoreLinks((prev) => {
      const exists = prev.some((item) => item.id === updatedLink.id);
      if (exists) {
        return prev.map((item) =>
          item.id === updatedLink.id ? updatedLink : item
        );
      }
      return [updatedLink, ...prev];
    });
    updateStoreLink(updatedLink.id, updatedLink);
    refreshLinksFromFirestore(
      "수정된 링크를 반영하여 목록을 갱신하는 중입니다..."
    );
  };

  const handleDeleteLink = (deletedId: string) => {
    setDeletedIds((prev) =>
      prev.includes(deletedId) ? prev : [...prev, deletedId]
    );
    setFirestoreLinks((prev) => prev.filter((item) => item.id !== deletedId));
    removeStoreLink(deletedId);
    refreshLinksFromFirestore(
      "삭제된 링크를 반영하여 목록을 갱신하는 중입니다..."
    );
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
            <div className="flex items-center gap-2">
              <span>
                검색 결과:{" "}
                <strong className="text-blue-600">{filteredLinks.length}</strong>
                개
              </span>
              {(isLoading || isRefreshing) && (
                <Badge
                  variant="secondary"
                  size="sm"
                  className="font-black bg-[#BAE6FD] gap-1"
                >
                  <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                  <span>{isRefreshing ? "갱신 중..." : "불러오는 중..."}</span>
                </Badge>
              )}
            </div>
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

          {(isLoading || isRefreshing) && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-[#BAE6FD] border-[2px] border-black rounded-[10px] shadow-[3px_3px_0px_#000000] text-xs sm:text-sm font-black text-black"
            >
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5] shrink-0" />
              <span>
                {isRefreshing
                  ? refreshMessage
                  : "Firestore에서 최신 링크 목록을 불러오는 중입니다..."}
              </span>
            </div>
          )}

          {filteredLinks.length > 0 ? (
            <div
              className={`flex flex-col gap-2.5 transition-opacity duration-200 ${
                isLoading || isRefreshing
                  ? "opacity-60 pointer-events-none"
                  : "opacity-100"
              }`}
            >
              {filteredLinks.map((link) => (
                <LinkButton
                  key={link.id}
                  link={link}
                  existingLinks={links}
                  onUpdateLink={handleUpdateLink}
                  onDeleteLink={handleDeleteLink}
                />
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
