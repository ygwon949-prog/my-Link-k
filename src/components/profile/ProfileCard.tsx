"use client";

import React, { useState, useMemo } from "react";
import { LinkItem } from "@/types";
import { useProfileStore, useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import {
  useUserLinksQuery,
  useUserProfileQuery,
} from "@/hooks/useLinksQuery";
import { DEFAULT_PROFILE_DATA, DUMMY_LINKS, INITIAL_LINKS } from "@/data";
import {
  getDisplayName,
  getEmailUsername,
  mergeFirestoreLinks,
} from "@/lib/links";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Button,
  Separator,
} from "@/components/ui";
import { LinkList } from "./LinkList";
import { SocialBar } from "./SocialBar";
import { AddLinkDialog } from "./AddLinkDialog";
import { EditProfileDialog } from "./EditProfileDialog";
import { LoginRequiredCard } from "./LoginRequiredCard";
import {
  Sparkles,
  Layers,
  Loader2,
  Mail,
} from "lucide-react";

export function ProfileCard() {
  const isMounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const profileState = useProfileStore((state) => state.profile);
  const setStoreLinks = useProfileStore((state) => state.setLinks);
  const addStoreLink = useProfileStore((state) => state.addLink);
  const updateStoreLink = useProfileStore((state) => state.updateLink);
  const removeStoreLink = useProfileStore((state) => state.removeLink);

  // SSR hydration mismatch 방지: 마운트 전에는 DEFAULT_PROFILE_DATA 사용
  const profile = isMounted ? profileState : DEFAULT_PROFILE_DATA;

  // TanStack Query 기반 프로필 & 링크 목록 단발성 조회 (실시간 구독 없음)
  const currentUid = user?.uid;
  const { data: queriedUserProfile } = useUserProfileQuery(currentUid, user);
  const effectiveUser = queriedUserProfile || user;

  const {
    data: firestoreLinks = [],
    isLoading: isQueryLoading,
    isRefetching: isRefreshing,
  } = useUserLinksQuery(currentUid);

  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [refreshMessage, setRefreshMessage] = useState<string>(
    "링크 변경 사항을 반영하여 목록을 갱신하는 중입니다..."
  );
  const [isSampleMode, setIsSampleMode] = useState(false);

  const isLoading = Boolean(currentUid) && isQueryLoading;

  // Firestore 저장 링크와 기본/샘플 링크를 중복 없이 병합 (createdAt 최신순 정렬)
  const links = useMemo(() => {
    const scopedFirestoreLinks = currentUid ? firestoreLinks : [];
    const baseLinks = (isSampleMode ? DUMMY_LINKS : INITIAL_LINKS).filter(
      (item) => !deletedIds.includes(item.id)
    );
    const activeFirestoreLinks = scopedFirestoreLinks.filter(
      (item) => !deletedIds.includes(item.id)
    );
    return mergeFirestoreLinks(activeFirestoreLinks, baseLinks);
  }, [currentUid, firestoreLinks, isSampleMode, deletedIds]);

  // 다이얼로그에서 TanStack Query Mutation 완료 후 스토어 동기화
  const handleAddLink = (newLink: LinkItem) => {
    setRefreshMessage("새 링크를 반영하여 목록을 갱신하는 중입니다...");
    addStoreLink(newLink);
  };

  // 인라인 편집에서 TanStack Query Mutation 완료 후 스토어 동기화
  const handleUpdateLink = (updatedLink: LinkItem) => {
    setRefreshMessage("수정된 링크를 반영하여 목록을 갱신하는 중입니다...");
    updateStoreLink(updatedLink.id, updatedLink);
  };

  // 삭제 확인 모달에서 TanStack Query Mutation 완료 후 스토어 동기화
  const handleDeleteLink = (deletedId: string) => {
    setRefreshMessage("삭제된 링크를 반영하여 목록을 갱신하는 중입니다...");
    setDeletedIds((prev) =>
      prev.includes(deletedId) ? prev : [...prev, deletedId]
    );
    removeStoreLink(deletedId);
  };

  // 샘플 데이터 전환 (INITIAL 4개 <-> DUMMY 10개 전체 목록)
  const handleToggleSampleData = () => {
    if (isSampleMode) {
      setStoreLinks(mergeFirestoreLinks(firestoreLinks, INITIAL_LINKS));
      setIsSampleMode(false);
    } else {
      setStoreLinks(mergeFirestoreLinks(firestoreLinks, DUMMY_LINKS));
      setIsSampleMode(true);
    }
  };

  // 1. 마운트 전 또는 Firebase 인증 상태 확인 중일 때
  if (!isMounted || isAuthLoading) {
    return (
      <Card
        variant="default"
        className="relative w-full max-w-[440px] sm:max-w-[460px] md:max-w-[480px] p-8 mx-auto text-center"
      >
        <CardContent className="p-0 flex flex-col items-center justify-center gap-3 py-8">
          <div className="w-14 h-14 rounded-full bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-black stroke-[2.5]" />
          </div>
          <p className="text-base font-black text-black">
            로그인 상태 및 유저 정보를 확인하는 중입니다...
          </p>
          <p className="text-xs font-bold text-black/60">
            잠시만 기다려 주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 2. 로그인하지 않은 상태일 때: 로그인 이후 사용할 수 있도록 설명 문구 화면 표시
  if (!user || !effectiveUser) {
    return <LoginRequiredCard pageTitle="마이링크 프로필 카드" />;
  }

  // 3. 로그인 완료 상태일 때: 해당 유저 정보(낙관적 업데이트 즉시 반영) 및 개인화 링크 표시
  // username: 이메일 앞부분('@' 이전 문자열)
  // displayName: Google 이름 기본값 (수정 가능)
  const username = getEmailUsername(
    effectiveUser.email,
    effectiveUser.username
  );
  const displayName = getDisplayName(
    effectiveUser.displayName,
    effectiveUser.googleDisplayName || profile.name,
    effectiveUser.email
  );
  const displayAvatar =
    effectiveUser.photoURL || profile.avatarUrl || "/avatar.png";
  const displayBadge = effectiveUser.badge || profile.badge;
  const displayBio = effectiveUser.bio || profile.bio;
  const socials = {
    ...profile.socials,
    ...(effectiveUser.email ? { email: effectiveUser.email } : {}),
  };

  return (
    <Card
      variant="default"
      className="relative w-full max-w-[440px] sm:max-w-[460px] md:max-w-[480px] p-4 sm:p-5 md:p-6 mx-auto text-center transition-all duration-200"
    >
      {/* 상단 모서리 스티커 배지 (shadcn/ui Badge 재사용) */}
      <div className="absolute -top-3.5 -right-2 sm:-right-3 z-10">
        <Badge variant="sticker" className="text-[11px] sm:text-xs">
          ✦ OPEN TO WORK
        </Badge>
      </div>

      {/* 상단 좌측 샘플 데이터 전환 버튼 (shadcn/ui Button 재사용) */}
      <div className="absolute -top-3.5 -left-2 sm:-left-3 z-10 -rotate-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleToggleSampleData}
          title={
            isSampleMode ? "기본 링크(4개)로 전환" : "전체 더미 링크(10개) 보기"
          }
          className="h-6 px-2 py-0.5 text-[10px] sm:text-[11px] font-black rounded-[6px] border-[2px] shadow-[2px_2px_0px_#000000]"
        >
          <Layers className="w-3 h-3 mr-1" />
          <span>{isSampleMode ? "기본 4개" : "샘플 10개"}</span>
        </Button>
      </div>

      <CardHeader className="p-0 pb-3 flex flex-col items-center">
        {/* 아바타 (로그인한 유저의 Google 프로필 사진 우선 표시) */}
        <div className="mb-3 sm:mb-4">
          <Avatar
            size="md"
            isOnline={true}
            className="border-[3px] border-black shadow-[4px_4px_0px_#000000]"
          >
            <AvatarImage
              src={displayAvatar}
              alt={`${displayName} 프로필 사진`}
            />
            <AvatarFallback>
              {displayName.charAt(0).toUpperCase() || "👨‍💻"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* 로그인한 유저의 displayName (Google 이름 기본값 / 수정 가능) */}
        <CardTitle
          render={<h1 />}
          className="text-2xl sm:text-3xl font-black tracking-tight text-black"
        >
          {displayName}
        </CardTitle>

        {/* 그 아래 @username (이메일 앞부분) + 프로필 수정 버튼 */}
        <div className="mt-1.5 flex items-center justify-center gap-2 flex-wrap">
          <p className="text-xs sm:text-sm font-black text-black/70">
            @{username}
          </p>
          <EditProfileDialog
            triggerLabel="프로필 수정"
            triggerClassName="h-7 px-2.5 text-[11px] sm:text-xs font-black bg-white hover:bg-[#BAE6FD]"
          />
        </div>

        {/* 유저 이메일 및 직무 / 역할 뱃지 */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
          <Badge variant="default" className="text-xs sm:text-sm py-1 px-3">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            {displayBadge}
          </Badge>
          {user.email && (
            <Badge
              variant="secondary"
              className="text-xs py-1 px-2.5 bg-white text-black font-bold gap-1"
            >
              <Mail className="w-3 h-3 shrink-0" />
              <span>{user.email}</span>
            </Badge>
          )}
        </div>

        {/* 소개글 (Bio) (@base-ui/react useRender 기반 CardDescription) */}
        <CardDescription className="mt-3.5 text-xs sm:text-sm font-semibold leading-relaxed text-black/90 whitespace-pre-line text-left bg-white/50 p-3 rounded-[8px] border-[1.5px] border-black/20 w-full">
          {displayBio}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 pt-2 flex flex-col gap-5">
        {/* 링크 목록 헤더 + 새 링크 추가 다이얼로그 버튼 */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t-[2px] border-black/15">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-black">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>내 링크 목록</span>
            <Badge variant="default" size="sm" className="font-black bg-white">
              {links.length}개
            </Badge>
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

          <AddLinkDialog
            onAddLink={handleAddLink}
            existingLinks={links}
            userId={user.uid}
            triggerLabel="새 링크 추가"
            triggerClassName="h-8 px-2.5 text-xs font-black"
          />
        </div>

        {/* 인터랙티브 링크 목록 컴포넌트 */}
        <div className="-mt-2">
          <LinkList
            links={links}
            showFilter={links.length > 3}
            isLoading={isLoading || isRefreshing}
            loadingMessage={
              isRefreshing
                ? refreshMessage
                : "최신 링크 목록을 불러오는 중입니다..."
            }
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            userId={user.uid}
          />
        </div>

        {/* 소셜 채널 아이콘 바 & Separator (shadcn/ui Separator 재사용) */}
        {socials && Object.values(socials).some(Boolean) && (
          <div className="flex flex-col gap-4">
            <Separator className="bg-black/80 h-[2px]" />
            <SocialBar socials={socials} />
          </div>
        )}

        {/* 키워드 태그 (shadcn/ui Badge tag variant 재사용) */}
        {profile.tags && profile.tags.length > 0 && (
          <div className="pt-3 border-t-[1.5px] border-black/20 flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {profile.tags.map((tag, idx) => (
              <Badge key={idx} variant="tag" className="text-xs font-bold">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
