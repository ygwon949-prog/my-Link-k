"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { getEmailUsername, normalizeUsernameParam } from "@/lib/links";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Separator,
} from "@/components/ui";
import {
  UserX,
  Home,
  User,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export interface UserNotFoundCardProps {
  username?: string;
}

export function UserNotFoundCard({ username }: UserNotFoundCardProps) {
  const pathname = usePathname();
  const isMounted = useMounted();
  const authUser = useAuthStore((state) => state.user);

  const requestedUsername = normalizeUsernameParam(
    username || (pathname ? pathname.split("/").filter(Boolean)[0] : "")
  );

  const myUsername =
    isMounted && authUser
      ? getEmailUsername(authUser.email, authUser.username)
      : "";

  return (
    <Card
      variant="default"
      className="relative w-full max-w-[440px] sm:max-w-[460px] md:max-w-[480px] p-5 sm:p-6 md:p-7 mx-auto text-center transition-all duration-200"
    >
      {/* 상단 모서리 404 스티커 배지 */}
      <div className="absolute -top-3.5 -right-2 sm:-right-3 z-10">
        <Badge
          variant="sticker"
          className="text-[11px] sm:text-xs bg-[#F87171] text-black"
        >
          ⚠️ 404 NOT FOUND
        </Badge>
      </div>

      <CardHeader className="p-0 pb-4 flex flex-col items-center">
        {/* 404 아이콘 원형 배지 */}
        <div className="mb-3.5 w-20 h-20 rounded-full bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center">
          <UserX className="w-9 h-9 text-black stroke-[2.5]" />
        </div>

        <Badge
          variant="default"
          className="mb-2 text-xs py-1 px-3 bg-white font-black"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
          <span>USER PROFILE NOT FOUND</span>
        </Badge>

        <CardTitle
          render={<h1 />}
          className="text-xl sm:text-2xl font-black tracking-tight text-black"
        >
          존재하지 않는 사용자입니다
        </CardTitle>

        <CardDescription className="mt-3 text-xs sm:text-sm font-bold leading-relaxed text-black/90 text-left bg-white/85 p-3.5 rounded-[10px] border-[2px] border-black shadow-[2px_2px_0px_#000000] w-full">
          {requestedUsername ? (
            <>
              요청하신{" "}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-[#FEF08A] border-[1.5px] border-black font-black text-black">
                @{requestedUsername}
              </span>{" "}
              아이디(username)를 가진 사용자를 찾을 수 없습니다.
            </>
          ) : (
            <>요청하신 페이지 또는 사용자를 찾을 수 없습니다.</>
          )}
          <br />
          <br />
          입력하신 주소의 철자가 정확한지 다시 한 번 확인해 주세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 pt-2 flex flex-col gap-4">
        <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-white border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] text-left">
          <div className="w-8 h-8 rounded-[6px] bg-[#FEE2E2] border-[1.5px] border-black flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-black text-black">
              확인해 보세요
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-black/75 mt-0.5">
              마이링크 개인 페이지 주소는 가입된 이메일의 <strong>@ 앞부분(username)</strong>으로 생성됩니다.
            </p>
          </div>
        </div>

        <Separator className="bg-black/80 h-[2px]" />

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          <Button
            variant="secondary"
            size="lg"
            nativeButton={false}
            render={<Link href="/" />}
            className="w-full h-11 text-xs sm:text-sm font-black bg-white hover:bg-[#BAE6FD] text-black border-[2.5px] border-black shadow-[3px_3px_0px_#000000] gap-2"
          >
            <Home className="w-4 h-4 stroke-[2.5]" />
            <span>메인 홈으로 이동</span>
          </Button>

          {myUsername && (
            <Button
              variant="accent"
              size="lg"
              nativeButton={false}
              render={<Link href={`/${encodeURIComponent(myUsername)}`} />}
              className="w-full h-11 text-xs sm:text-sm font-black bg-[#A7F3D0] hover:bg-[#6EE7B7] text-black border-[2.5px] border-black shadow-[3px_3px_0px_#000000] gap-2"
            >
              <User className="w-4 h-4 stroke-[2.5]" />
              <span>내 페이지 (@{myUsername})</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
