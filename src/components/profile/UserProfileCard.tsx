"use client";

import React, { useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { LinkItem } from "@/types";
import { useProfileStore, useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import {
  useUserByUsernameQuery,
  useUserLinksQuery,
  useUserProfileQuery,
} from "@/hooks/useLinksQuery";
import { DEFAULT_PROFILE_DATA } from "@/data";
import {
  getDisplayName,
  getEmailUsername,
  normalizeUsernameParam,
  sortLinksByCreatedAtDesc,
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
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  UserCheck,
} from "lucide-react";

export interface UserProfileCardProps {
  username: string;
}

export function UserProfileCard({ username }: UserProfileCardProps) {
  const isMounted = useMounted();
  const normalizedUsername = useMemo(
    () => normalizeUsernameParam(username),
    [username]
  );

  const authUser = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const profileState = useProfileStore((state) => state.profile);
  const addStoreLink = useProfileStore((state) => state.addLink);
  const updateStoreLink = useProfileStore((state) => state.updateLink);
  const removeStoreLink = useProfileStore((state) => state.removeLink);

  const profile = isMounted ? profileState : DEFAULT_PROFILE_DATA;

  // 1. username으로 Firestore users 컬렉션에서 유저 검색
  const {
    data: searchedUser,
    isLoading: isUserSearching,
    isFetched: isUserFetched,
  } = useUserByUsernameQuery(normalizedUsername);

  // 검색된 유저의 UID (userId)
  const targetUserId = searchedUser?.uid || "";
  const isOwner = Boolean(
    authUser && targetUserId && authUser.uid === targetUserId
  );

  // 본인 페이지인 경우 프로필 수정 낙관적 업데이트가 즉시 반영되도록 userProfile 쿼리 구독
  const { data: liveOwnerProfile } = useUserProfileQuery(
    isOwner ? targetUserId : null,
    searchedUser
  );

  const effectiveUser = (isOwner ? liveOwnerProfile : searchedUser) || searchedUser;

  // 2. 검색된 유저의 userId로 users/{userId}/links 컬렉션 조회
  const {
    data: firestoreLinks = [],
    isLoading: isLinksLoading,
    isRefetching: isLinksRefreshing,
  } = useUserLinksQuery(targetUserId);

  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [refreshMessage, setRefreshMessage] = useState<string>(
    "링크 변경 사항을 반영하여 목록을 갱신하는 중입니다..."
  );
  const [isCopied, setIsCopied] = useState(false);

  const links = useMemo(() => {
    if (!targetUserId) return [];
    const activeLinks = firestoreLinks.filter(
      (item) => !deletedIds.includes(item.id)
    );
    return sortLinksByCreatedAtDesc(activeLinks);
  }, [targetUserId, firestoreLinks, deletedIds]);

  const handleAddLink = (newLink: LinkItem) => {
    setRefreshMessage("새 링크를 반영하여 목록을 갱신하는 중입니다...");
    addStoreLink(newLink);
  };

  const handleUpdateLink = (updatedLink: LinkItem) => {
    setRefreshMessage("수정된 링크를 반영하여 목록을 갱신하는 중입니다...");
    updateStoreLink(updatedLink.id, updatedLink);
  };

  const handleDeleteLink = (deletedId: string) => {
    setRefreshMessage("삭제된 링크를 반영하여 목록을 갱신하는 중입니다...");
    setDeletedIds((prev) =>
      prev.includes(deletedId) ? prev : [...prev, deletedId]
    );
    removeStoreLink(deletedId);
  };

  const handleCopyPersonalUrl = async () => {
    if (typeof window === "undefined" || !effectiveUser) return;
    try {
      const targetUsername = getEmailUsername(
        effectiveUser.email,
        effectiveUser.username
      );
      const personalUrl = `${window.location.origin}/${encodeURIComponent(
        targetUsername
      )}`;
      await navigator.clipboard.writeText(personalUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("개인 페이지 URL 복사 실패:", error);
    }
  };

  if (!normalizedUsername) {
    notFound();
  }

  // 마운트 전이거나 유저 검색 진행 중일 때 로딩 화면 표시
  if (!isMounted || isAuthLoading || isUserSearching || !isUserFetched) {
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
            @{normalizedUsername}님의 프로필을 불러오는 중입니다...
          </p>
          <p className="text-xs font-bold text-black/60">
            잠시만 기다려 주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  // username에 해당하는 유저가 없으면 404 페이지로 전환
  if (!effectiveUser) {
    notFound();
  }

  const resolvedUsername = getEmailUsername(
    effectiveUser.email,
    effectiveUser.username
  );
  const displayName = getDisplayName(
    effectiveUser.displayName,
    effectiveUser.googleDisplayName,
    effectiveUser.email
  );
  const displayAvatar =
    effectiveUser.photoURL || DEFAULT_PROFILE_DATA.avatarUrl || "/avatar.png";
  const displayBadge = effectiveUser.badge || DEFAULT_PROFILE_DATA.badge;
  const displayBio = effectiveUser.bio || DEFAULT_PROFILE_DATA.bio;
  const socials = {
    ...profile.socials,
    ...(effectiveUser.email ? { email: effectiveUser.email } : {}),
  };

  return (
    <Card
      variant="default"
      className="relative w-full max-w-[440px] sm:max-w-[460px] md:max-w-[480px] p-4 sm:p-5 md:p-6 mx-auto text-center transition-all duration-200"
    >
      {/* 상단 우측 스티커 배지 */}
      <div className="absolute -top-3.5 -right-2 sm:-right-3 z-10">
        <Badge variant="sticker" className="text-[11px] sm:text-xs">
          ✦ OPEN TO WORK
        </Badge>
      </div>

      {/* 상단 좌측 개인 페이지 주소 복사 버튼 */}
      <div className="absolute -top-3.5 -left-2 sm:-left-3 z-10 -rotate-2">
        <Button
          type="button"
          size="sm"
          variant={isCopied ? "accent" : "secondary"}
          onClick={() => void handleCopyPersonalUrl()}
          title={`/${resolvedUsername} 개인 페이지 URL 복사`}
          className="h-6 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black rounded-[6px] border-[2px] border-black shadow-[2px_2px_0px_#000000] gap-1"
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>URL 복사됨!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 stroke-[2.5]" />
              <span>/{resolvedUsername} 공유</span>
            </>
          )}
        </Button>
      </div>

      <CardHeader className="p-0 pb-3 flex flex-col items-center">
        {/* 아바타 */}
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

        {/* 표시 이름 (Display Name) */}
        <CardTitle
          render={<h1 />}
          className="text-2xl sm:text-3xl font-black tracking-tight text-black"
        >
          {displayName}
        </CardTitle>

        {/* @username + 본인 여부 배지 및 프로필 수정 버튼 */}
        <div className="mt-1.5 flex items-center justify-center gap-2 flex-wrap">
          <p className="text-xs sm:text-sm font-black text-black/75">
            @{resolvedUsername}
          </p>
          {isOwner && (
            <>
              <Badge
                variant="accent"
                size="sm"
                className="text-[10px] px-2 py-0.5 font-black gap-1 shadow-[1.5px_1.5px_0px_#000000]"
              >
                <UserCheck className="w-3 h-3 stroke-[2.5]" />
                <span>내 개인 페이지</span>
              </Badge>
              <EditProfileDialog
                triggerLabel="프로필 수정"
                triggerClassName="h-7 px-2.5 text-[11px] sm:text-xs font-black bg-white hover:bg-[#BAE6FD]"
              />
            </>
          )}
        </div>

        {/* 직무 / 역할 뱃지 */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
          <Badge variant="default" className="text-xs sm:text-sm py-1 px-3">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            {displayBadge}
          </Badge>
        </div>

        {/* 소개글 (Bio) */}
        <CardDescription className="mt-3.5 text-xs sm:text-sm font-semibold leading-relaxed text-black/90 whitespace-pre-line text-left bg-white/50 p-3 rounded-[8px] border-[1.5px] border-black/20 w-full">
          {displayBio}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 pt-2 flex flex-col gap-5">
        {/* 링크 목록 헤더 + 본인인 경우 새 링크 추가 버튼 */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t-[2px] border-black/15">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-black">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{displayName}님의 링크</span>
            <Badge variant="default" size="sm" className="font-black bg-white">
              {links.length}개
            </Badge>
            {(isLinksLoading || isLinksRefreshing) && (
              <Badge
                variant="secondary"
                size="sm"
                className="font-black bg-[#BAE6FD] gap-1"
              >
                <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                <span>
                  {isLinksRefreshing ? "갱신 중..." : "불러오는 중..."}
                </span>
              </Badge>
            )}
          </div>

          {isOwner && (
            <AddLinkDialog
              onAddLink={handleAddLink}
              existingLinks={links}
              userId={effectiveUser.uid}
              triggerLabel="새 링크 추가"
              triggerClassName="h-8 px-2.5 text-xs font-black"
            />
          )}
        </div>

        {/* users/{userId}/links 링크 목록 */}
        <div className="-mt-2">
          <LinkList
            links={links}
            showFilter={links.length > 3}
            showActions={isOwner}
            emptyMessage={
              isOwner
                ? "아직 등록된 링크가 없습니다. 우측 상단 [새 링크 추가] 버튼을 눌러 첫 링크를 등록해 보세요!"
                : `아직 @${resolvedUsername}님이 등록한 링크가 없습니다.`
            }
            isLoading={isLinksLoading || isLinksRefreshing}
            loadingMessage={
              isLinksRefreshing
                ? refreshMessage
                : "링크 목록을 불러오는 중입니다..."
            }
            onUpdateLink={isOwner ? handleUpdateLink : undefined}
            onDeleteLink={isOwner ? handleDeleteLink : undefined}
            userId={effectiveUser.uid}
          />
        </div>

        {/* 소셜 채널 아이콘 바 */}
        {socials && Object.values(socials).some(Boolean) && (
          <div className="flex flex-col gap-4">
            <Separator className="bg-black/80 h-[2px]" />
            <SocialBar socials={socials} />
          </div>
        )}

        {/* 키워드 태그 */}
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
