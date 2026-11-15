"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { getEmailUsername } from "@/lib/links";
import {
  Button,
  Card,
  Input,
  Badge,
  Avatar,
  AvatarFallback,
} from "@/components/ui";
import {
  Sparkles,
  Wand2,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Loader2,
} from "lucide-react";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
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

const COLOR_PRESETS = [
  { id: "yellow", name: "옐로우", bg: "bg-[#FEF08A]", hex: "#FEF08A" },
  { id: "mint", name: "민트", bg: "bg-[#A7F3D0]", hex: "#A7F3D0" },
  { id: "sky", name: "스카이", bg: "bg-[#BAE6FD]", hex: "#BAE6FD" },
  { id: "pink", name: "핑크", bg: "bg-[#F472B6]", hex: "#F472B6" },
];

export function InteractiveSimulator() {
  const isMounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  // 시뮬레이터 실시간 입력 상태
  const [name, setName] = useState("홍길동");
  const [handle, setHandle] = useState("gildong.dev");
  const [badgeText, setBadgeText] = useState("✦ 풀스택 개발자");
  const [bio, setBio] = useState("문제를 해결하고 가치를 만드는 소프트웨어를 개발합니다 🚀");
  const [linkTitle, setLinkTitle] = useState("나의 포트폴리오 웹사이트 2026");
  const [linkUrl, setLinkUrl] = useState("https://portfolio.example.com");
  const [selectedBg, setSelectedBg] = useState(COLOR_PRESETS[0]);

  const handleReset = () => {
    setName("홍길동");
    setHandle("gildong.dev");
    setBadgeText("✦ 풀스택 개발자");
    setBio("문제를 해결하고 가치를 만드는 소프트웨어를 개발합니다 🚀");
    setLinkTitle("나의 포트폴리오 웹사이트 2026");
    setLinkUrl("https://portfolio.example.com");
    setSelectedBg(COLOR_PRESETS[0]);
  };

  const username = user ? getEmailUsername(user.email, user.username) : "";
  const profileUrl = username ? `/${encodeURIComponent(username)}` : "/";

  return (
    <section id="simulator-section" className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 scroll-mt-16">
      {/* 섹션 타이틀 */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#F472B6] text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000] -rotate-1 mb-3">
          <Wand2 className="w-3.5 h-3.5 text-black" />
          <span>LIVE SIMULATOR</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
          내 마이링크는 어떤 모습일까? <br className="hidden sm:inline" />
          <span className="bg-[#FEF08A] px-2 py-0.5 border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] rounded-[6px] inline-block mt-1">
            10초 만에 실시간으로 만들어보기
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base font-bold text-black/75">
          왼쪽 폼에 내용을 입력하면 오른쪽 카드에 즉시 반영됩니다. 직접 테스트해보세요!
        </p>
      </div>

      {/* 2단 시뮬레이터 인터페이스 (좌: 입력 폼 / 우: 실시간 프리뷰) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* 좌측: 실시간 입력 폼 (lg:col-span-6) */}
        <div className="lg:col-span-6 rounded-[14px] border-[3px] border-black bg-white p-5 sm:p-7 shadow-[5px_5px_0px_#000000] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-black">
            <span className="text-sm sm:text-base font-black text-black flex items-center gap-2">
              <span>✍️ 정보 입력하기</span>
              <span className="text-[10px] bg-[#A7F3D0] px-2 py-0.5 rounded border border-black font-black">
                실시간 동기화
              </span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-black text-black/70 hover:text-black flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>기본값 초기화</span>
            </button>
          </div>

          {/* 테마 배경색 선택 */}
          <div>
            <label className="text-xs font-black text-black block mb-1.5">
              카드 테마 색상
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedBg(preset)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-[6px] border-[2px] border-black transition-all cursor-pointer ${
                    preset.bg
                  } ${
                    selectedBg.id === preset.id
                      ? "shadow-[2px_2px_0px_#000000] scale-105"
                      : "opacity-75 hover:opacity-100"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 이름 & 아이디 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-black block mb-1">
                이름 / 닉네임
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                maxLength={20}
                className="bg-[#FFFBEB] font-bold text-sm h-10 border-[2px] border-black shadow-[2px_2px_0px_#000000]"
              />
            </div>
            <div>
              <label className="text-xs font-black text-black block mb-1">
                원하는 아이디 (@handle)
              </label>
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="gildong.dev"
                maxLength={20}
                className="bg-[#FFFBEB] font-bold text-sm h-10 border-[2px] border-black shadow-[2px_2px_0px_#000000]"
              />
            </div>
          </div>

          {/* 뱃지 텍스트 */}
          <div>
            <label className="text-xs font-black text-black block mb-1">
              상단 스티커 뱃지 문구
            </label>
            <Input
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="✦ 풀스택 개발자"
              maxLength={25}
              className="bg-[#FFFBEB] font-bold text-sm h-10 border-[2px] border-black shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* 소개글 */}
          <div>
            <label className="text-xs font-black text-black block mb-1">
              한 줄 소개 (Bio)
            </label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 나타내는 멋진 한 줄을 적어보세요."
              maxLength={60}
              className="bg-[#FFFBEB] font-bold text-sm h-10 border-[2px] border-black shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* 첫 번째 링크 */}
          <div className="p-3 rounded-[10px] bg-zinc-50 border-[2px] border-black/80 flex flex-col gap-2">
            <span className="text-xs font-black text-black flex items-center gap-1.5">
              <span>🔗 대표 링크 1개 설정</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="링크 제목"
                className="bg-white font-bold text-xs h-9 border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
              />
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="bg-white font-bold text-xs h-9 border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
              />
            </div>
          </div>

          {/* 액션 CTA */}
          <div className="pt-2">
            {isMounted && user ? (
              <Button
                variant="default"
                size="lg"
                nativeButton={false}
                render={<Link href={profileUrl} />}
                className="w-full h-12 text-sm sm:text-base font-black bg-[#A7F3D0] hover:bg-[#86efac] text-black border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000000] gap-2"
              >
                <span>내 프로필에서 바로 적용하기</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="lg"
                disabled={isLoggingIn}
                onClick={() => void loginWithGoogle()}
                className="w-full h-12 text-sm sm:text-base font-black bg-[#FEF08A] hover:bg-[#fde047] text-black border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000000] gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Google 로그인 진행 중...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>이 디자인으로 3초 만에 내 프로필 만들기 🚀</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* 우측: 실시간 렌더링 카드 (lg:col-span-6) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-[400px]">
            <div className="mb-2 flex items-center justify-between text-xs font-black text-black">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>실시간 라이브 프리뷰 화면</span>
              </span>
              <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-black">
                LIVE
              </span>
            </div>

            <div className="relative">
              {/* 스티커 */}
              <div className="absolute -top-3.5 -right-2 z-10">
                <Badge
                  variant="sticker"
                  className="text-xs font-black bg-[#67E8F9] text-black border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] rotate-3"
                >
                  {badgeText || "✦ STATUS"}
                </Badge>
              </div>

              <Card
                variant="default"
                className={`relative p-6 text-center border-[3px] border-black shadow-[6px_6px_0px_#000000] transition-colors duration-200 ${selectedBg.bg}`}
              >
                {/* 아바타 */}
                <div className="flex flex-col items-center mb-3">
                  <Avatar
                    size="md"
                    isOnline={true}
                    className="border-[3px] border-black shadow-[3.5px_3.5px_0px_#000000] mb-2.5"
                  >
                    <AvatarFallback className="bg-white text-xl font-black">
                      {name ? name.charAt(0).toUpperCase() : "👤"}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                    {name || "이름을 입력하세요"}
                  </h3>
                  <p className="text-xs font-black text-black/70 mt-0.5">
                    @{handle || "your.handle"}
                  </p>

                  <p className="mt-3 text-xs font-bold text-black/85 leading-relaxed bg-white/80 p-2.5 rounded-[8px] border-[1.5px] border-black w-full text-center min-h-[38px] flex items-center justify-center">
                    {bio || "한 줄 소개를 입력해보세요."}
                  </p>
                </div>

                {/* 링크 버튼들 */}
                <div className="flex flex-col gap-2.5 mt-4">
                  {/* 사용자가 입력한 링크 */}
                  <div className="w-full flex items-center justify-between p-3 rounded-[10px] bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] transition-all cursor-pointer text-left">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">🚀</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-black text-black truncate">
                          {linkTitle || "대표 링크 제목"}
                        </span>
                        <span className="text-[10px] font-bold text-black/60 truncate">
                          {linkUrl || "https://..."}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-black shrink-0 ml-2" />
                  </div>

                  {/* 샘플 링크 1 */}
                  <div className="w-full flex items-center justify-between p-3 rounded-[10px] bg-white/90 border-[2px] border-black/80 shadow-[2px_2px_0px_#000000] text-left opacity-80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">💻</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-black truncate">
                          GitHub 프로필 & 프로젝트
                        </span>
                        <span className="text-[10px] font-bold text-black/60 truncate">
                          github.com/{handle || "username"}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-black shrink-0 ml-2" />
                  </div>
                </div>

                {/* 소셜 바 미니 프리뷰 */}
                <div className="mt-5 pt-3 border-t-[2px] border-black/20 flex items-center justify-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white border-[1.5px] border-black flex items-center justify-center text-xs shadow-[1.5px_1.5px_0px_#000000]">
                    🐙
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white border-[1.5px] border-black flex items-center justify-center text-xs shadow-[1.5px_1.5px_0px_#000000]">
                    📸
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white border-[1.5px] border-black flex items-center justify-center text-xs shadow-[1.5px_1.5px_0px_#000000]">
                    ✉️
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
