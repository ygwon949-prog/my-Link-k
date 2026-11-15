"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { getDisplayName, getEmailUsername } from "@/lib/links";
import { Button, Badge } from "@/components/ui";
import { Sparkles, ArrowRight, BarChart3 } from "lucide-react";

export function LandingHeaderNotice() {
  const isMounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  if (!isMounted || isAuthLoading || !user) {
    return null;
  }

  const username = getEmailUsername(user.email, user.username);
  const displayName = getDisplayName(
    user.displayName,
    user.googleDisplayName,
    user.email
  );
  const profileUrl = username ? `/${encodeURIComponent(username)}` : "/";
  const statsUrl = username ? `/${encodeURIComponent(username)}/stats` : "/stats";

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-[12px] border-[2.5px] border-black bg-[#FEF08A] p-3.5 sm:p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-all">
        {/* 좌측: 환영 메시지 */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-left w-full sm:w-auto min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-black">
                반가워요, {displayName}님!
              </span>
              <Badge
                variant="default"
                className="text-[10px] sm:text-[11px] font-black bg-white text-black border-[1.5px] border-black py-0 px-1.5"
              >
                @{username}
              </Badge>
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-black/75 truncate mt-0.5">
              회원님의 마이링크 프로필이 정상 운영 중입니다. 바로 확인하고 수정해보세요!
            </p>
          </div>
        </div>

        {/* 우측: 퀵 액션 버튼들 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={statsUrl} />}
            className="h-8 px-2.5 text-xs font-black bg-white hover:bg-[#BAE6FD] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>통계 보기</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            nativeButton={false}
            render={<Link href={profileUrl} />}
            className="h-8 px-3 text-xs font-black bg-[#A7F3D0] hover:bg-[#86efac] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] gap-1"
          >
            <span>내 프로필 가기</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Button>
        </div>
      </div>
    </div>
  );
}
