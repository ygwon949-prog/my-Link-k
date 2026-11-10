"use client";

import React, { useState } from "react";
import { useProfileStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { DEFAULT_PROFILE_DATA, DUMMY_LINKS, INITIAL_LINKS } from "@/data";
import {
  Card,
  CardHeader,
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
import { Sparkles, Layers } from "lucide-react";

export function ProfileCard() {
  const isMounted = useMounted();
  const profileState = useProfileStore((state) => state.profile);
  const setLinks = useProfileStore((state) => state.setLinks);

  // SSR hydration mismatch 방지: 마운트 전에는 DEFAULT_PROFILE_DATA 사용
  const profile = isMounted ? profileState : DEFAULT_PROFILE_DATA;

  const [isSampleMode, setIsSampleMode] = useState(false);

  // 샘플 데이터 전환 (INITIAL 4개 <-> DUMMY 10개 전체 목록)
  const handleToggleSampleData = () => {
    if (isSampleMode) {
      setLinks(INITIAL_LINKS);
      setIsSampleMode(false);
    } else {
      setLinks(DUMMY_LINKS);
      setIsSampleMode(true);
    }
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
        {/* 아바타 (shadcn/ui Avatar, AvatarImage, AvatarFallback 재사용) */}
        <div className="mb-3 sm:mb-4">
          <Avatar
            size="md"
            isOnline={true}
            className="border-[3px] border-black shadow-[4px_4px_0px_#000000]"
          >
            <AvatarImage
              src={profile.avatarUrl || "/avatar.png"}
              alt={`${profile.name} 프로필 사진`}
            />
            <AvatarFallback>👨‍💻</AvatarFallback>
          </Avatar>
        </div>

        {/* 이름 */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
          {profile.name}
        </h1>

        {/* 직무 / 역할 뱃지 (shadcn/ui Badge 재사용) */}
        <div className="mt-2 flex justify-center">
          <Badge variant="default" className="text-xs sm:text-sm py-1 px-3">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            {profile.badge}
          </Badge>
        </div>

        {/* 소개글 (Bio) */}
        <p className="mt-3.5 text-xs sm:text-sm font-semibold leading-relaxed text-black/90 whitespace-pre-line text-left bg-white/50 p-3 rounded-[8px] border-[1.5px] border-black/20 w-full">
          {profile.bio}
        </p>
      </CardHeader>

      <CardContent className="p-0 pt-2 flex flex-col gap-5">
        {/* 링크 목록 헤더 */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t-[2px] border-black/15">
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-black">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>링크 목록</span>
          </div>
          <Badge variant="default" size="sm" className="font-black bg-white">
            {profile.links.length}개
          </Badge>
        </div>

        {/* 인터랙티브 링크 목록 컴포넌트 */}
        <div className="-mt-2">
          <LinkList
            links={profile.links}
            showFilter={profile.links.length > 3}
          />
        </div>

        {/* 소셜 채널 아이콘 바 & Separator (shadcn/ui Separator 재사용) */}
        {profile.socials && Object.values(profile.socials).some(Boolean) && (
          <div className="flex flex-col gap-4">
            <Separator className="bg-black/80 h-[2px]" />
            <SocialBar socials={profile.socials} />
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
