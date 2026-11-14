"use client";

import React from "react";
import { useAuthStore } from "@/store";
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
  Lock,
  Sparkles,
  Link2,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export interface LoginRequiredCardProps {
  pageTitle?: string;
}

export function LoginRequiredCard({
  pageTitle = "마이링크 프로필 & 링크 관리",
}: LoginRequiredCardProps) {
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const authError = useAuthStore((state) => state.authError);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  return (
    <Card
      variant="default"
      className="relative w-full max-w-[440px] sm:max-w-[460px] md:max-w-[480px] p-5 sm:p-6 md:p-7 mx-auto text-center transition-all duration-200"
    >
      {/* 상단 모서리 스티커 배지 */}
      <div className="absolute -top-3.5 -right-2 sm:-right-3 z-10">
        <Badge variant="sticker" className="text-[11px] sm:text-xs bg-[#BAE6FD]">
          🔒 LOGIN REQUIRED
        </Badge>
      </div>

      <CardHeader className="p-0 pb-4 flex flex-col items-center">
        {/* 자물쇠 아이콘 배지 */}
        <div className="mb-3.5 w-20 h-20 rounded-full bg-white border-[3px] border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center">
          <Lock className="w-9 h-9 text-black stroke-[2.5]" />
        </div>

        <Badge
          variant="default"
          className="mb-2 text-xs py-1 px-3 bg-white font-black"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
          <span>{pageTitle}</span>
        </Badge>

        {/* 안내 제목 (@base-ui/react useRender 기반 CardTitle) */}
        <CardTitle
          render={<h1 />}
          className="text-xl sm:text-2xl font-black tracking-tight text-black"
        >
          로그인 이후에 사용할 수 있습니다
        </CardTitle>

        {/* 상세 안내 문구 (@base-ui/react useRender 기반 CardDescription) */}
        <CardDescription className="mt-3 text-xs sm:text-sm font-bold leading-relaxed text-black/90 text-left bg-white/80 p-3.5 rounded-[10px] border-[2px] border-black shadow-[2px_2px_0px_#000000] w-full">
          마이링크(MyLink)는{" "}
          <strong className="underline decoration-2">
            Google 소셜 로그인 이후에 사용할 수 있는
          </strong>{" "}
          개인화 프로필 및 링크 관리 서비스입니다.
          <br />
          <br />
          상단 헤더의 <strong>[Google 로그인]</strong> 버튼 또는 아래 버튼을 눌러
          로그인하시면, 나만의 프로필 정보와 소중한 링크들을 안전하게 관리할 수
          있습니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 pt-2 flex flex-col gap-4">
        {/* 개인화 기능 안내 리스트 */}
        <div className="flex flex-col gap-2.5 text-left">
          <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-white border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000]">
            <div className="w-8 h-8 rounded-[6px] bg-[#FEF08A] border-[1.5px] border-black flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-black text-black">
                내 프로필 정보 자동 연동
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-black/75 mt-0.5">
                로그인한 Google 계정의 아이디(이메일 앞부분), 이메일, 프로필
                사진을 화면에 자동으로 표시합니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-[10px] bg-white border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000]">
            <div className="w-8 h-8 rounded-[6px] bg-[#A7F3D0] border-[1.5px] border-black flex items-center justify-center shrink-0 mt-0.5">
              <Link2 className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-black text-black">
                개인화된 링크 관리
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-black/75 mt-0.5">
                계정별로 독립된 공간에 나만의 링크를 추가·수정·삭제하고 언제든
                불러올 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 에러 발생 시 안내 배너 */}
        {authError && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 rounded-[8px] border-[2px] border-black bg-[#FEE2E2] text-red-900 text-xs font-bold shadow-[2px_2px_0px_#000000] text-left"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <Separator className="bg-black/80 h-[2px]" />

        {/* Google 소셜 로그인 실행 버튼 */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={isLoggingIn}
          onClick={() => void loginWithGoogle()}
          className="w-full h-12 text-sm sm:text-base font-black bg-white hover:bg-[#BAE6FD] text-black border-[2.5px] border-black shadow-[4px_4px_0px_#000000] gap-2.5"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
              <span>Google 계정으로 로그인 중...</span>
            </>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Google 계정으로 로그인하기</span>
            </>
          )}
        </Button>

        <p className="text-[11px] sm:text-xs font-bold text-black/70">
          💡 상단 헤더의 <strong>[Google 로그인]</strong> 버튼을 클릭해서도 바로
          시작할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  );
}
