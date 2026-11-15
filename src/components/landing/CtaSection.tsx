"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { getEmailUsername } from "@/lib/links";
import { Button } from "@/components/ui";
import { ArrowRight, Flame, Loader2 } from "lucide-react";

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

export function CtaSection() {
  const isMounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  const username = user ? getEmailUsername(user.email, user.username) : "";
  const profileUrl = username ? `/${encodeURIComponent(username)}` : "/";

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="relative rounded-[20px] border-[3.5px] border-black bg-[#FEF08A] p-7 sm:p-12 text-center shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* 장식 스티커들 */}
        <div className="hidden sm:block absolute -top-3 left-8 -rotate-6 bg-[#67E8F9] text-black font-black text-xs px-3 py-1 rounded-[6px] border-[2px] border-black shadow-[2px_2px_0px_#000000]">
          ✦ 100% FREE FOREVER
        </div>
        <div className="hidden sm:block absolute -bottom-3 right-8 rotate-6 bg-[#F472B6] text-black font-black text-xs px-3 py-1 rounded-[6px] border-[2px] border-black shadow-[2px_2px_0px_#000000]">
          🚀 3초 만에 세팅 완료
        </div>

        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000] mb-4">
            <Flame className="w-4 h-4 text-black fill-current animate-bounce" />
            <span>GET STARTED TODAY</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
            지금 바로 나만의 <br />
            <span className="bg-[#A7F3D0] px-2.5 py-0.5 border-[2.5px] border-black shadow-[3px_3px_0px_#000000] rounded-[8px] inline-block mt-1">
              마이링크를 완성하세요!
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base font-bold text-black/85 leading-relaxed max-w-lg">
            나를 보여주는 가장 확실하고 개성 있는 방법. <br className="hidden sm:inline" />
            인스타그램, 깃허브, 이력서에 들어갈 단 하나의 완벽한 링크 페이지.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            {isMounted && user ? (
              <Button
                variant="default"
                size="lg"
                nativeButton={false}
                render={<Link href={profileUrl} />}
                className="w-full sm:w-auto h-13 px-8 text-base sm:text-lg font-black bg-[#A7F3D0] hover:bg-[#86efac] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] gap-2"
              >
                <span>내 마이링크 관리하러 가기</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="lg"
                disabled={isLoggingIn}
                onClick={() => void loginWithGoogle()}
                className="w-full sm:w-auto h-13 px-8 text-base sm:text-lg font-black bg-white hover:bg-zinc-50 text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] gap-2.5"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
                    <span>Google 로그인 진행 중...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    <span>Google로 3초 만에 무료 시작</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="mt-3 text-xs font-bold text-black/60">
            신용카드 등록 없음 · 광고 없음 · 언제든 자유롭게 수정 가능
          </p>
        </div>
      </div>
    </section>
  );
}
