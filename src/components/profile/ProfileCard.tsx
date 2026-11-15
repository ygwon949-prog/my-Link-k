"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LinkItem } from "@/types";
import { useProfileStore, useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { DEFAULT_PROFILE_DATA, DUMMY_LINKS, INITIAL_LINKS } from "@/data";
import {
  fetchUserLinks,
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

  // Firestore(users/{user.uid}/links)에서 불러온 링크 상태, 로딩/갱신 상태 및 샘플 모드 관리
  const [firestoreLinks, setFirestoreLinks] = useState<LinkItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<string>(
    "링크 변경 사항을 반영하여 목록을 갱신하는 중입니다..."
  );
  const [isSampleMode, setIsSampleMode] = useState(false);

  const currentUid = user?.uid;
  const isLoading = Boolean(currentUid) && loadedUid !== currentUid;

  // 로그인한 사용자(user.uid) 변경 시 Firestore(users/{user.uid}/links)에서 최신순 링크 조회
  useEffect(() => {
    if (!currentUid) {
      return;
    }

    let isMountedEffect = true;

    fetchUserLinks(currentUid)
      .then((fetchedLinks) => {
        if (isMountedEffect) {
          setFirestoreLinks(fetchedLinks);
          setDeletedIds([]);
        }
      })
      .catch((error) => {
        console.error("개인화 링크 목록 조회 실패:", error);
      })
      .finally(() => {
        if (isMountedEffect) {
          setLoadedUid(currentUid);
        }
      });

    return () => {
      isMountedEffect = false;
    };
  }, [currentUid]);

  // Firestore 저장 링크와 기본/샘플 링크를 중복 없이 병합 (createdAt 최신순 정렬)
  const links = useMemo(() => {
    const scopedFirestoreLinks =
      currentUid && loadedUid === currentUid ? firestoreLinks : [];
    const baseLinks = (isSampleMode ? DUMMY_LINKS : INITIAL_LINKS).filter(
      (item) => !deletedIds.includes(item.id)
    );
    const activeFirestoreLinks = scopedFirestoreLinks.filter(
      (item) => !deletedIds.includes(item.id)
    );
    return mergeFirestoreLinks(activeFirestoreLinks, baseLinks);
  }, [currentUid, loadedUid, firestoreLinks, isSampleMode, deletedIds]);

  // Firestore(users/{user.uid}/links)에서 최신 링크 목록을 다시 불러오는 갱신형 헬퍼
  const refreshLinksFromFirestore = (message: string) => {
    if (!currentUid) return;
    setRefreshMessage(message);
    setIsRefreshing(true);
    Promise.all([
      fetchUserLinks(currentUid),
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

  // 다이얼로그에서 Firestore 저장 후 새 링크 전달 시 상태 업데이트 및 목록 갱신
  const handleAddLink = (newLink: LinkItem) => {
    setFirestoreLinks((prev) => mergeFirestoreLinks([newLink], prev));
    addStoreLink(newLink);
    refreshLinksFromFirestore("새 링크를 반영하여 목록을 갱신하는 중입니다...");
  };

  // 인라인 편집에서 Firestore 수정 완료 시 상태 업데이트 및 목록 갱신
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

  // 삭제 확인 모달에서 Firestore 삭제 완료 시 상태 업데이트 및 목록 갱신
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
  if (!user) {
    return <LoginRequiredCard pageTitle="마이링크 프로필 카드" />;
  }

  // 3. 로그인 완료 상태일 때: 해당 유저 정보 및 개인화 링크 표시
  // username: 이메일 앞부분('@' 이전 문자열)
  // displayName: Google 이름 기본값 (수정 가능)
  const username = getEmailUsername(user.email, user.username);
  const displayName = getDisplayName(
    user.displayName,
    user.googleDisplayName || profile.name,
    user.email
  );
  const displayAvatar = user.photoURL || profile.avatarUrl || "/avatar.png";
  const displayBadge = user.badge || profile.badge;
  const displayBio = user.bio || profile.bio;
  const socials = {
    ...profile.socials,
    ...(user.email ? { email: user.email } : {}),
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
