"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { getDisplayName, getEmailUsername } from "@/lib/links";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Badge,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
} from "@/components/ui";
import {
  LogOut,
  Loader2,
  UserCheck,
  ChevronDown,
  Copy,
  Check,
  User,
  LayoutGrid,
  UserPen,
  ExternalLink,
  BarChart3,
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

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isMounted = useMounted();
  const [isCopied, setIsCopied] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const initAuthListener = useAuthStore((state) => state.initAuthListener);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => {
      unsubscribe();
    };
  }, [initAuthListener]);

  const isProfilePage = pathname === "/";
  const isLinksPage = pathname?.startsWith("/links");
  const isStatsPage =
    pathname === "/stats" ||
    Boolean(pathname?.endsWith("/stats")) ||
    Boolean(pathname?.endsWith("/states"));
  const username = user ? getEmailUsername(user.email, user.username) : "";
  const personalPagePath = username ? `/${encodeURIComponent(username)}` : "";
  const statsPagePath = username
    ? `/${encodeURIComponent(username)}/stats`
    : "/stats";
  const isPersonalPage = useMemo(() => {
    if (!pathname || !username) return false;
    let decodedPath = pathname;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      decodedPath = pathname;
    }
    const cleanSegment = decodedPath
      .replace(/^\/+/, "")
      .replace(/^@+/, "")
      .toLowerCase();
    return cleanSegment === username.toLowerCase();
  }, [pathname, username]);

  const displayName = user
    ? getDisplayName(user.displayName, user.googleDisplayName, user.email)
    : "";

  const handleCopyProfileUrl = async () => {
    if (typeof window === "undefined") return;
    try {
      const targetUrl = personalPagePath
        ? `${window.location.origin}${personalPagePath}`
        : window.location.origin;
      await navigator.clipboard.writeText(targetUrl);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("페이지 URL 복사 실패:", error);
    }
  };

  return (
    <header className="w-full border-b-[3px] border-black bg-white dark:bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* 좌측 로고 & 네비게이션 (@base-ui/react Button render 패턴 활용) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Button
            variant="default"
            size="sm"
            nativeButton={false}
            render={<Link href="/" />}
            className="h-9 px-2.5 sm:px-3 text-base sm:text-lg font-black tracking-tight rounded-[8px] shadow-[2px_2px_0px_#000000]"
          >
            ⚡ mylink
          </Button>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant={isProfilePage ? "default" : "ghost"}
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
              className={`h-8 px-2.5 text-xs sm:text-sm font-black rounded-[6px] ${
                isProfilePage
                  ? "border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
                  : "text-black"
              }`}
            >
              프로필
            </Button>

            <Button
              variant={isLinksPage ? "secondary" : "outline"}
              size="sm"
              nativeButton={false}
              render={<Link href="/links" />}
              className="h-8 px-2.5 text-xs sm:text-sm font-black rounded-[6px] border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
            >
              전체 링크
            </Button>

            {isMounted && !isAuthLoading && user && personalPagePath && (
              <Button
                variant={isPersonalPage ? "accent" : "outline"}
                size="sm"
                nativeButton={false}
                render={<Link href={personalPagePath} />}
                className={`h-8 px-2.5 text-xs sm:text-sm font-black rounded-[6px] border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000] gap-1 ${
                  isPersonalPage
                    ? "bg-[#A7F3D0] text-black"
                    : "bg-white hover:bg-[#A7F3D0]/60 text-black"
                }`}
              >
                <span>개인 페이지</span>
                <span className="hidden md:inline text-[11px] font-extrabold text-black/70">
                  (@{username})
                </span>
              </Button>
            )}
          </nav>
        </div>

        {/* 우측: Google 소셜 로그인 / 로그인 유저 정보(@base-ui/react Menu & Avatar & Button) + GitHub */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {!isMounted || isAuthLoading ? (
            <Badge
              variant="secondary"
              size="sm"
              className="h-8 px-2.5 bg-zinc-100 text-black font-black gap-1.5 border-[2px] border-black shadow-[2px_2px_0px_#000000]"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
              <span className="text-xs">확인 중...</span>
            </Badge>
          ) : user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {/* @base-ui/react Menu + Avatar를 활용한 로그인 유저 정보 팝업 및 빠른 액션 메뉴 */}
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      title={
                        user.email
                          ? `${displayName} (@${username} · ${user.email})`
                          : `${displayName} (@${username})`
                      }
                      className="h-9 px-2 sm:px-2.5 bg-[#FFFBEB] hover:bg-[#FEF08A] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] gap-2 min-w-0"
                    />
                  }
                >
                  <Avatar
                    size="xs"
                    className="h-6 w-6 border-[1.5px] border-black shadow-none shrink-0"
                  >
                    <AvatarImage
                      src={user.photoURL}
                      alt={`${displayName} 프로필`}
                    />
                    <AvatarFallback className="text-xs">
                      {displayName.charAt(0).toUpperCase() || "👤"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 text-left leading-tight">
                    <span className="text-xs font-black text-black truncate max-w-[85px] sm:max-w-[130px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] font-bold text-black/65 truncate max-w-[95px] sm:max-w-[140px]">
                      @{username}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-black/70 shrink-0" />
                </MenuTrigger>

                <MenuContent align="end" className="w-[260px]">
                  {/* 1. 로그인 계정 프로필 요약 */}
                  <MenuGroup>
                    <MenuGroupLabel className="flex items-center justify-between text-black">
                      <span className="inline-flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>내 계정 정보</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        온라인
                      </span>
                    </MenuGroupLabel>
                    <div className="p-2.5 rounded-[8px] bg-white border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center gap-2.5 text-left">
                      <Avatar
                        size="xs"
                        className="h-9 w-9 border-[1.5px] border-black shadow-none shrink-0"
                      >
                        <AvatarImage
                          src={user.photoURL}
                          alt={`${displayName} 프로필`}
                        />
                        <AvatarFallback className="text-xs">
                          {displayName.charAt(0).toUpperCase() || "👤"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <p className="text-xs sm:text-sm font-black text-black truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] font-extrabold text-black/75 truncate">
                          @{username}
                        </p>
                        {user.email && (
                          <p className="text-[10px] font-semibold text-black/60 truncate mt-0.5">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </MenuGroup>

                  <MenuSeparator />

                  {/* 2. 빠른 액션 메뉴 (프로필 수정 · 내 페이지 URL 복사 · 프로필/전체 링크 이동) */}
                  <MenuGroup>
                    <MenuGroupLabel className="text-black/70">
                      빠른 액션 메뉴
                    </MenuGroupLabel>

                    <MenuItem
                      onClick={() => {
                        setIsEditProfileOpen(true);
                      }}
                      className="justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        <UserPen className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>프로필 수정하기</span>
                      </span>
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000]"
                      >
                        EDIT
                      </Badge>
                    </MenuItem>

                    <MenuItem
                      closeOnClick={false}
                      onClick={() => {
                        void handleCopyProfileUrl();
                      }}
                      className="justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        <span>
                          {isCopied
                            ? "페이지 주소 복사 완료!"
                            : "내 페이지 URL 복사"}
                        </span>
                      </span>
                      <Badge
                        variant={isCopied ? "accent" : "default"}
                        size="sm"
                        className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000]"
                      >
                        {isCopied ? "COPIED" : "공유"}
                      </Badge>
                    </MenuItem>

                    {personalPagePath && (
                      <MenuItem
                        onClick={() => {
                          router.push(personalPagePath);
                        }}
                        className="justify-between"
                      >
                        <span className="inline-flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>개인 페이지로 이동</span>
                        </span>
                        {isPersonalPage ? (
                          <Badge
                            variant="accent"
                            size="sm"
                            className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000]"
                          >
                            현재
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            size="sm"
                            className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000]"
                          >
                            /{username}
                          </Badge>
                        )}
                      </MenuItem>
                    )}

                    <MenuItem
                      onClick={() => {
                        router.push("/");
                      }}
                      className="justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        <User className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>프로필 카드 보기</span>
                      </span>
                      {isProfilePage && (
                        <Badge
                          variant="primary"
                          size="sm"
                          className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000]"
                        >
                          현재
                        </Badge>
                      )}
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        router.push("/links");
                      }}
                      className="justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LayoutGrid className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>전체 링크 관리로 이동</span>
                      </span>
                      {isLinksPage && (
                        <Badge
                          variant="secondary"
                          size="sm"
                          className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000]"
                        >
                          현재
                        </Badge>
                      )}
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        router.push(statsPagePath);
                      }}
                      className="justify-between"
                    >
                      <span className="inline-flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>링크 통계 보기</span>
                      </span>
                      {isStatsPage ? (
                        <Badge
                          variant="secondary"
                          size="sm"
                          className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000]"
                        >
                          현재
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          size="sm"
                          className="px-1.5 py-0 text-[9px] shadow-[1px_1px_0px_#000000] bg-[#FEF08A] text-black"
                        >
                          STATS
                        </Badge>
                      )}
                    </MenuItem>
                  </MenuGroup>

                  <MenuSeparator />

                  {/* 3. 로그아웃 */}
                  <MenuItem
                    onClick={() => {
                      void logout();
                    }}
                    disabled={isLoggingOut}
                    className="text-red-700 data-[highlighted]:bg-[#FEE2E2]"
                  >
                    <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>로그아웃</span>
                  </MenuItem>
                </MenuContent>
              </Menu>

              {/* 헤더 메뉴에서 열리는 프로필 수정 다이얼로그 */}
              <EditProfileDialog
                open={isEditProfileOpen}
                onOpenChange={setIsEditProfileOpen}
              />

              {/* 빠른 로그아웃 버튼 (@base-ui/react Button) */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoggingOut}
                onClick={() => void logout()}
                aria-label="로그아웃"
                className="h-9 px-2.5 sm:px-3 text-xs font-black bg-[#FEE2E2] hover:bg-[#FCA5A5] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] shrink-0"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                    <span className="hidden sm:inline">로그아웃 중...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isLoggingIn}
              onClick={() => void loginWithGoogle()}
              className="h-9 px-2.5 sm:px-3.5 text-xs sm:text-sm font-black bg-[#FEF08A] hover:bg-[#FDE047] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] gap-1.5 shrink-0"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
                  <span>로그인 중...</span>
                </>
              ) : (
                <>
                  <span className="w-5 h-5 rounded-full bg-white border-[1.5px] border-black flex items-center justify-center shrink-0">
                    <GoogleIcon className="w-3.5 h-3.5" />
                  </span>
                  <span>Google 로그인</span>
                </>
              )}
            </Button>
          )}

          {/* GitHub 외부 링크 (@base-ui/react Button render 패턴) */}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a
                href="https://github.com/ygwon949-prog"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub 방문하기"
              />
            }
            className="hidden sm:inline-flex h-9 px-2.5 text-xs sm:text-sm font-black rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_#000000] shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden lg:inline">GitHub</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
