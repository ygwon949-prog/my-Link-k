"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { getEmailUsername } from "@/lib/links";
import {
  Button,
  Badge,
  Card,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  MousePointerClick,
  Check,
  Flame,
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

// 목업용 테마 프리셋
const THEME_OPTIONS = [
  { id: "yellow", name: "시그니처 옐로우", bg: "bg-[#FEF08A]", border: "border-black", text: "text-black", hex: "#FEF08A" },
  { id: "mint", name: "에메랄드 민트", bg: "bg-[#A7F3D0]", border: "border-black", text: "text-black", hex: "#A7F3D0" },
  { id: "sky", name: "스카이 블루", bg: "bg-[#BAE6FD]", border: "border-black", text: "text-black", hex: "#BAE6FD" },
  { id: "pink", name: "레트로 핑크", bg: "bg-[#F472B6]", border: "border-black", text: "text-black", hex: "#F472B6" },
  { id: "purple", name: "네온 퍼플", bg: "bg-[#E9D5FF]", border: "border-black", text: "text-black", hex: "#E9D5FF" },
];

const STICKER_OPTIONS = [
  "✦ OPEN TO WORK",
  "🚀 BUILD & SHIP",
  "☕ COFFEE FIRST",
  "💡 CREATOR",
];

export function HeroSection() {
  const isMounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  // 인터랙티브 목업 상태
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0]);
  const [selectedSticker, setSelectedSticker] = useState(STICKER_OPTIONS[0]);
  const [clickCounts, setClickCounts] = useState<{ [key: string]: number }>({
    portfolio: 342,
    github: 589,
    blog: 217,
  });
  const [activeClickFeedback, setActiveClickFeedback] = useState<string | null>(null);

  const handleMockClick = (key: string, title: string) => {
    setClickCounts((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
    setActiveClickFeedback(`'${title}' 클릭 수 +1! 실시간 집계 완료 📊`);
    setTimeout(() => {
      setActiveClickFeedback(null);
    }, 2400);
  };

  const username = user ? getEmailUsername(user.email, user.username) : "";
  const profileUrl = username ? `/${encodeURIComponent(username)}` : "/";

  const totalClicks =
    (clickCounts.portfolio || 0) +
    (clickCounts.github || 0) +
    (clickCounts.blog || 0);

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 sm:pb-20">
      {/* 배경 장식 스티커들 (화면 가장자리) */}
      <div className="hidden xl:block absolute -top-2 -left-6 select-none pointer-events-none -rotate-12 bg-[#67E8F9] text-black font-black text-xs px-3 py-1.5 rounded-[8px] border-[2px] border-black shadow-[3px_3px_0px_#000000]">
        ⚡ NEXT.JS 16 & REACT 19
      </div>
      <div className="hidden xl:block absolute top-1/2 -right-4 select-none pointer-events-none rotate-12 bg-[#F472B6] text-black font-black text-xs px-3 py-1.5 rounded-[8px] border-[2px] border-black shadow-[3px_3px_0px_#000000]">
        🔥 NEOBRUTALISM 100%
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* 좌측 텍스트 & CTA 섹션 (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* 상단 핫 스티커 배지 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#67E8F9] text-black font-black text-xs sm:text-sm border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] -rotate-1 mb-4 sm:mb-5 hover:rotate-0 transition-transform cursor-default">
            <Flame className="w-4 h-4 text-black fill-current animate-pulse" />
            <span>나만의 링크 인 바이오 (Link-in-bio) 완성</span>
          </div>

          {/* 메인 헤드라인 타이포그래피 */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.15] sm:leading-[1.12]">
            나를 표현하는 <br className="hidden sm:inline" />
            가장 힙한 방법,{" "}
            <span className="inline-block relative">
              <span className="relative z-10 px-2 py-0.5 bg-[#FEF08A] border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000000] rounded-[8px] -rotate-1 inline-block">
                마이링크
              </span>
            </span>
          </h1>

          {/* 서브 카피 */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg font-bold text-black/80 max-w-xl leading-relaxed">
            지루하고 뻔한 프로필 링크는 이제 그만! 굵은 테두리와 톡톡 튀는 비비드 컬러,
            실시간 클릭 분석까지. <strong>Google 계정 하나로 3초 만에</strong> 나만의
            네오브루탈리즘 프로필을 완성하세요.
          </p>

          {/* 핵심 포인트 태그들 */}
          <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <Badge variant="tag" className="bg-white text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000]">
              ⚡ 3초 원클릭 시작
            </Badge>
            <Badge variant="tag" className="bg-[#A7F3D0] text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000]">
              🎨 네오브루탈리즘 감성
            </Badge>
            <Badge variant="tag" className="bg-[#BAE6FD] text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000]">
              📊 실시간 클릭 분석
            </Badge>
            <Badge variant="tag" className="bg-[#F472B6] text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000]">
              💯 완전 무료
            </Badge>
          </div>

          {/* 메인 CTA 버튼 영역 */}
          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {isMounted && user ? (
              <Button
                variant="default"
                size="lg"
                nativeButton={false}
                render={<Link href={profileUrl} />}
                className="w-full sm:w-auto h-13 px-7 text-base sm:text-lg font-black bg-[#A7F3D0] hover:bg-[#86efac] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] gap-2"
              >
                <span>내 프로필 관리하기</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="lg"
                disabled={isLoggingIn}
                onClick={() => void loginWithGoogle()}
                className="w-full sm:w-auto h-13 px-6 text-base sm:text-lg font-black bg-[#FEF08A] hover:bg-[#fde047] text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] gap-2.5"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
                    <span>Google 로그인 중...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    <span>Google로 3초 만에 시작하기</span>
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              nativeButton={true}
              onClick={() => {
                const target = document.getElementById("simulator-section");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full sm:w-auto h-13 px-6 text-sm sm:text-base font-black bg-white hover:bg-zinc-50 text-black border-[3px] border-black shadow-[4px_4px_0px_#000000] gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>미리 체험해보기</span>
            </Button>
          </div>

          <p className="mt-3 text-xs font-bold text-black/60">
            🔒 별도의 비밀번호 없이 Google 계정으로 안전하게 로그인됩니다.
          </p>
        </div>

        {/* 우측 인터랙티브 프리뷰 목업 카드 (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* 상단 컨트롤러: 테마 & 스티커 변경 바 */}
          <div className="w-full max-w-[390px] mb-3 p-2.5 rounded-[10px] bg-white border-[2px] border-black shadow-[3px_3px_0px_#000000] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-black text-black">
              <span className="flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5 text-black" />
                <span>직접 눌러보세요! (실시간 인터랙션)</span>
              </span>
              <span className="text-[10px] bg-[#FEF08A] px-1.5 py-0.5 rounded border border-black">
                클릭 {totalClicks}회
              </span>
            </div>

            {/* 테마 컬러 팔레트 피커 */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-black/10">
              <span className="text-[10px] font-bold text-black/70 shrink-0">테마:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    title={theme.name}
                    onClick={() => setSelectedTheme(theme)}
                    className={`w-6 h-6 rounded-full border-[2px] border-black transition-all ${
                      theme.bg
                    } ${
                      selectedTheme.id === theme.id
                        ? "scale-110 shadow-[2px_2px_0px_#000000] ring-2 ring-black"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 스티커 토글 */}
            <div className="flex items-center gap-1 pt-1 border-t border-black/10 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold text-black/70 shrink-0">뱃지:</span>
              <div className="flex items-center gap-1">
                {STICKER_OPTIONS.map((sticker) => (
                  <button
                    key={sticker}
                    type="button"
                    onClick={() => setSelectedSticker(sticker)}
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-[4px] border border-black transition-all whitespace-nowrap ${
                      selectedSticker === sticker
                        ? "bg-[#67E8F9] text-black shadow-[1.5px_1.5px_0px_#000000]"
                        : "bg-white text-black/70 hover:bg-zinc-100"
                    }`}
                  >
                    {sticker}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 실제 라이브 네오브루탈리즘 프로필 카드 목업 */}
          <div className="relative w-full max-w-[390px] select-none">
            {/* 카드 상단 우측 스티커 */}
            <div className="absolute -top-3.5 -right-2 z-20">
              <Badge
                variant="sticker"
                className="text-[11px] font-black bg-[#67E8F9] text-black border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] rotate-3"
              >
                {selectedSticker}
              </Badge>
            </div>

            <Card
              variant="default"
              className={`relative p-5 text-center transition-colors duration-200 border-[3px] border-black shadow-[6px_6px_0px_#000000] ${selectedTheme.bg}`}
            >
              {/* 아바타 & 상태 */}
              <div className="flex flex-col items-center mb-3">
                <Avatar
                  size="md"
                  isOnline={true}
                  className="border-[3px] border-black shadow-[3.5px_3.5px_0px_#000000] mb-2.5"
                >
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                    alt="샘플 유저 프로필"
                  />
                  <AvatarFallback className="bg-white font-black">
                    👩‍💻
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  이서연 (Seoyeon)
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-black text-black/75">
                    @seoyeon.design
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white border border-black shadow-[1px_1px_0px_#000000]">
                    UI/UX 디자이너
                  </span>
                </div>

                <p className="mt-2 text-xs font-bold text-black/80 leading-relaxed bg-white/70 p-2 rounded-[8px] border-[1.5px] border-black w-full text-center">
                  ✨ 사용자를 설레게 하는 감각적인 인터페이스를 만듭니다.
                </p>
              </div>

              {/* 링크 버튼 3개 (직접 클릭 가능 & 카운터 상승) */}
              <div className="flex flex-col gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleMockClick("portfolio", "포트폴리오 & 작업물 2026")
                  }
                  className="w-full group relative flex items-center justify-between p-3 rounded-[10px] bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">📁</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-black text-black truncate">
                        포트폴리오 & 작업물 2026
                      </span>
                      <span className="text-[10px] font-bold text-black/60 truncate">
                        seoyeon-works.framer.website
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FEF08A] border border-black">
                      {clickCounts.portfolio}회
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-black" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleMockClick("github", "GitHub & 오픈소스 디자인")
                  }
                  className="w-full group relative flex items-center justify-between p-3 rounded-[10px] bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">💻</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-black text-black truncate">
                        GitHub & 오픈소스 디자인
                      </span>
                      <span className="text-[10px] font-bold text-black/60 truncate">
                        github.com/seoyeon-ui
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#A7F3D0] border border-black">
                      {clickCounts.github}회
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-black" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleMockClick("blog", "디자인 시스템 아티클 블로그")
                  }
                  className="w-full group relative flex items-center justify-between p-3 rounded-[10px] bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">✍️</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-black text-black truncate">
                        디자인 시스템 아티클 블로그
                      </span>
                      <span className="text-[10px] font-bold text-black/60 truncate">
                        velog.io/@seoyeon
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#BAE6FD] border border-black">
                      {clickCounts.blog}회
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-black" />
                  </div>
                </button>
              </div>

              {/* 실시간 피드백 토스트 알림 (버튼 클릭 시 등장) */}
              {activeClickFeedback && (
                <div className="mt-3.5 p-2 rounded-[6px] bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000] text-[11px] font-black text-black flex items-center justify-center gap-1.5 animate-bounce">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>{activeClickFeedback}</span>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
