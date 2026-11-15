"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useMounted } from "@/hooks/useMounted";
import { useUserLinksQuery } from "@/hooks/useLinksQuery";
import {
  sortLinksByCreatedAtDesc,
  getDisplayName,
  getEmailUsername,
  normalizeUsernameParam,
} from "@/lib/links";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  Award,
  Layers,
  Loader2,
  ExternalLink,
  Flame,
  PieChart as PieIcon,
  User,
} from "lucide-react";

const CATEGORY_COLORS = [
  "#FEF08A", // 노랑
  "#BAE6FD", // 하늘
  "#A7F3D0", // 에메랄드 민트
  "#F472B6", // 핑크
  "#C084FC", // 보라
  "#FDBA74", // 주황
  "#93C5FD", // 블루
];

const chartConfig = {
  clickCount: {
    label: "클릭 수",
    color: "#2563EB",
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  clickCount: {
    label: "카테고리별 클릭 합계",
    color: "#059669",
  },
} satisfies ChartConfig;

export interface UserStatsDashboardProps {
  username: string;
}

export function UserStatsDashboard({ username }: UserStatsDashboardProps) {
  const router = useRouter();
  const isMounted = useMounted();
  const normalizedParamUsername = useMemo(
    () => normalizeUsernameParam(username),
    [username]
  );

  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  const currentUsername = useMemo(() => {
    return user ? getEmailUsername(user.email, user.username) : "";
  }, [user]);

  // 본인 여부 확인
  const isOwner = Boolean(
    user &&
      currentUsername &&
      currentUsername.toLowerCase() === normalizedParamUsername.toLowerCase()
  );

  // 1. 비로그인 시 즉시 홈("/")으로 리다이렉트 처리
  // 2. 로그인 상태지만 타인의 통계 URL로 들어온 경우 본인의 통계 페이지로 리다이렉트
  useEffect(() => {
    if (!isMounted || isAuthLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (!isOwner && currentUsername) {
      router.replace(`/${encodeURIComponent(currentUsername)}/stats`);
    }
  }, [isMounted, isAuthLoading, user, isOwner, currentUsername, router]);

  // Firestore 사용자 링크 목록 단발성 조회
  const { data: firestoreLinks = [], isLoading: isQueryLoading } =
    useUserLinksQuery(user?.uid);

  // Firestore 사용자 링크만 사용 (최신순 정렬)
  const links = useMemo(() => {
    if (!user) return [];
    return sortLinksByCreatedAtDesc(firestoreLinks);
  }, [user, firestoreLinks]);

  // ── 통계 지표 산출 ──
  // 1. 모든 링크의 총 클릭 수 합산
  const totalClicks = useMemo(() => {
    return links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  }, [links]);

  // 2. 링크당 평균 클릭 수
  const averageClicks = useMemo(() => {
    if (links.length === 0) return "0";
    return (totalClicks / links.length).toFixed(1);
  }, [links, totalClicks]);

  // 3. 클릭 수 기준 내림차순 정렬
  const rankedLinks = useMemo(() => {
    return [...links].sort(
      (a, b) => (b.clickCount || 0) - (a.clickCount || 0)
    );
  }, [links]);

  // 4. 최고 인기 링크 (TOP 1)
  const topLink = rankedLinks[0];

  // 5. 차트용 데이터 (링크별 클릭 수)
  const barChartData = useMemo(() => {
    return rankedLinks.map((link) => ({
      name:
        link.title.length > 8 ? `${link.title.slice(0, 8)}...` : link.title,
      fullName: link.title,
      clickCount: link.clickCount || 0,
      icon: link.icon || "🔗",
      category: link.category || "기타",
    }));
  }, [rankedLinks]);

  // 6. 카테고리별 누적 클릭 합계 데이터
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    links.forEach((link) => {
      const cat = link.category || "기타";
      map.set(cat, (map.get(cat) || 0) + (link.clickCount || 0));
    });

    return Array.from(map.entries())
      .map(([name, clickCount], index) => ({
        name,
        clickCount,
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.clickCount - a.clickCount);
  }, [links]);

  // ── 인증 확인 중이거나 마운트 전 로딩 상태 ──
  if (!isMounted || isAuthLoading) {
    return (
      <main className="relative flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)]">
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <Card
          variant="default"
          className="relative w-full max-w-[420px] p-8 mx-auto text-center"
        >
          <CardContent className="p-0 flex flex-col items-center justify-center gap-3 py-6">
            <div className="w-14 h-14 rounded-full bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000000] flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-black stroke-[2.5]" />
            </div>
            <p className="text-base font-black text-black">
              로그인 상태 및 링크 통계를 확인하는 중입니다...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── 비로그인 상태: 리다이렉트 안내 ──
  if (!user || !isOwner) {
    return (
      <main className="relative flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)]">
        <Card
          variant="default"
          className="relative w-full max-w-[420px] p-6 mx-auto text-center"
        >
          <CardContent className="p-0 flex flex-col items-center gap-3 py-4">
            <p className="text-sm font-black text-black">
              본인만 접근 가능한 통계 페이지입니다. 이동 중입니다...
            </p>
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
              className="mt-2 text-xs font-black"
            >
              홈으로 가기
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const displayName = getDisplayName(
    user.displayName,
    user.googleDisplayName,
    user.email
  );

  return (
    <main className="relative flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)]">
      {/* 배경 도트 패턴 (Neobrutalism 스타일) */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-6">
        {/* 상단 네비게이션 & 헤더 */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/${encodeURIComponent(currentUsername)}`} />}
              className="gap-1.5 text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000000]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>내 개인 페이지로 돌아가기</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="px-2.5 py-1 text-xs font-black bg-[#FEF08A] text-black shadow-[2px_2px_0px_#000000]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 mr-1" />
              <span>실시간 Firebase 집계</span>
            </Badge>
          </div>
        </div>

        {/* 페이지 타이틀 배너 카드 */}
        <Card
          variant="secondary"
          className="p-5 sm:p-6 border-[3px] border-black shadow-[5px_5px_0px_#000000] bg-[#BAE6FD]"
        >
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">📊</span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
                  @{currentUsername} 통계 대시보드
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-bold text-black/80 mt-1">
                {displayName}님의 Firebase 실시간 링크 클릭 현황을 분석합니다.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/links" />}
              className="text-xs font-black bg-white hover:bg-zinc-100 shrink-0 shadow-[2px_2px_0px_#000000]"
            >
              <span>링크 관리 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>

        {/* ── 4대 핵심 지표 요약 카드 (KPI Grid) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. 총 클릭 수 (모든 링크 합산) */}
          <Card
            variant="default"
            className="p-4 sm:p-5 bg-[#FEF08A] border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000000] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black/75">
                총 클릭 수 (모든 링크 합산)
              </span>
              <div className="w-8 h-8 rounded-full bg-white border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center">
                <MousePointerClick className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                {totalClicks.toLocaleString()}
              </span>
              <span className="text-xs font-extrabold text-black/70 ml-1">
                회
              </span>
            </div>
            <p className="text-[11px] font-bold text-black/60 mt-1">
              Firebase에 저장된 {links.length}개 링크 합계
            </p>
          </Card>

          {/* 2. 등록된 링크 수 */}
          <Card
            variant="white"
            className="p-4 sm:p-5 border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000000] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black/75">
                운영 중인 링크
              </span>
              <div className="w-8 h-8 rounded-full bg-[#BAE6FD] border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center">
                <Layers className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                {links.length}
              </span>
              <span className="text-xs font-extrabold text-black/70 ml-1">
                개
              </span>
            </div>
            <p className="text-[11px] font-bold text-black/60 mt-1">
              카테고리 {categoryChartData.length}개 분류
            </p>
          </Card>

          {/* 3. 링크당 평균 클릭 수 */}
          <Card
            variant="white"
            className="p-4 sm:p-5 border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000000] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black/75">
                링크당 평균 클릭
              </span>
              <div className="w-8 h-8 rounded-full bg-[#A7F3D0] border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-black stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                {averageClicks}
              </span>
              <span className="text-xs font-extrabold text-black/70 ml-1">
                회
              </span>
            </div>
            <p className="text-[11px] font-bold text-black/60 mt-1">
              링크 1개당 평균 반응률
            </p>
          </Card>

          {/* 4. 최고 인기 링크 (TOP 1) */}
          <Card
            variant="white"
            className="p-4 sm:p-5 border-[2.5px] border-black shadow-[3.5px_3.5px_0px_#000000] flex flex-col justify-between bg-[#FEE2E2]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-black/75">
                최고 인기 링크
              </span>
              <div className="w-8 h-8 rounded-full bg-white border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000] flex items-center justify-center">
                <Flame className="w-4 h-4 text-red-500 stroke-[2.5]" />
              </div>
            </div>
            <div className="mt-2 min-w-0">
              <p className="text-sm font-black text-black truncate">
                {topLink ? `${topLink.icon || "🔗"} ${topLink.title}` : "-"}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <Badge
                  variant="destructive"
                  size="sm"
                  className="font-black text-[10px] px-1.5 py-0"
                >
                  TOP 1
                </Badge>
                <span className="text-xs font-black text-black">
                  {(topLink?.clickCount || 0).toLocaleString()}회 클릭
                </span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-black/60 mt-1">
              전체 클릭의{" "}
              {totalClicks > 0 && topLink
                ? Math.round(((topLink.clickCount || 0) / totalClicks) * 100)
                : 0}
              % 점유
            </p>
          </Card>
        </div>

        {/* ── 차트 영역: shadcn ChartContainer 기반 차트 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 차트 1: 링크별 누적 클릭 수 비교 막대 차트 (2칸 차지) */}
          <Card
            variant="white"
            className="lg:col-span-2 p-5 sm:p-6 border-[2.5px] border-black shadow-[4px_4px_0px_#000000] flex flex-col"
          >
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-black stroke-[2.5]" />
                  <CardTitle className="text-lg sm:text-xl font-black text-black">
                    링크별 클릭 수 비교
                  </CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  size="sm"
                  className="bg-[#BAE6FD] text-black font-black text-[11px]"
                >
                  shadcn BarChart
                </Badge>
              </div>
              <CardDescription className="text-xs font-bold text-black/70 mt-1">
                Firebase에 등록된 링크들의 실제 누적 클릭 수(clickCount)를 비교합니다.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-2 flex-1 flex flex-col justify-center">
              {barChartData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="min-h-[260px] w-full"
                >
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 12, left: -16, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#00000020"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                      tick={{ fill: "#000000", fontSize: 11, fontWeight: 700 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                      tick={{ fill: "#000000", fontSize: 11, fontWeight: 700 }}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelKey="fullName"
                          className="border-[2px] border-black shadow-[2px_2px_0px_#000000] bg-white font-black"
                        />
                      }
                    />
                    <Bar
                      dataKey="clickCount"
                      radius={[4, 4, 0, 0]}
                      stroke="#000000"
                      strokeWidth={1.5}
                    >
                      {barChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="py-12 text-center border-[2px] border-dashed border-black/30 rounded-[8px]">
                  <p className="text-sm font-black text-black/70">
                    Firebase에 등록된 링크가 없습니다. 링크를 먼저 추가해 보세요!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 차트 2: 카테고리별 클릭 점유율 (1칸 차지) */}
          <Card
            variant="white"
            className="p-5 sm:p-6 border-[2.5px] border-black shadow-[4px_4px_0px_#000000] flex flex-col"
          >
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-black stroke-[2.5]" />
                <CardTitle className="text-lg sm:text-xl font-black text-black">
                  카테고리별 점유율
                </CardTitle>
              </div>
              <CardDescription className="text-xs font-bold text-black/70 mt-1">
                분야별 누적 클릭 비중을 시각화합니다.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-2 flex-1 flex flex-col items-center justify-center">
              {categoryChartData.length > 0 ? (
                <div className="w-full flex flex-col items-center">
                  <ChartContainer
                    config={categoryChartConfig}
                    className="h-[180px] w-full"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            nameKey="name"
                            className="border-[2px] border-black shadow-[2px_2px_0px_#000000] bg-white font-black"
                          />
                        }
                      />
                      <Pie
                        data={categoryChartData}
                        dataKey="clickCount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        stroke="#000000"
                        strokeWidth={1.5}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cat-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>

                  {/* 카테고리 범례 칩 목록 */}
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5 w-full">
                    {categoryChartData.map((cat, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border-[1.5px] border-black text-[11px] font-black shadow-[1px_1px_0px_#000000]"
                        style={{ backgroundColor: cat.fill }}
                      >
                        <span className="truncate max-w-[80px]">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-black/80 font-extrabold">
                          ({cat.clickCount}회)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center border-[2px] border-dashed border-black/30 rounded-[8px] w-full">
                  <p className="text-sm font-black text-black/70">
                    등록된 카테고리 데이터가 없습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── 링크별 상세 순위 및 클릭 점유율 테이블 ── */}
        <Card
          variant="white"
          className="p-5 sm:p-6 border-[2.5px] border-black shadow-[4px_4px_0px_#000000]"
        >
          <div className="flex items-center justify-between pb-4 border-b-[2px] border-black/15 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black text-black">
                링크별 상세 순위표
              </h2>
            </div>
            <Badge
              variant="default"
              size="sm"
              className="font-black bg-white text-black"
            >
              총 {rankedLinks.length}개 링크
            </Badge>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {rankedLinks.length > 0 ? (
              rankedLinks.map((link, index) => {
                const rank = index + 1;
                const clickCount = link.clickCount || 0;
                const percentage =
                  totalClicks > 0
                    ? Math.round((clickCount / totalClicks) * 100)
                    : 0;

                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-[10px] border-[2px] border-black bg-white hover:bg-zinc-50 transition-colors shadow-[2px_2px_0px_#000000]"
                  >
                    {/* 좌측: 순위 뱃지 + 아이콘 + 제목 */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-7 h-7 rounded-[6px] border-[1.5px] border-black flex items-center justify-center text-xs font-black shrink-0 ${
                          rank === 1
                            ? "bg-[#FEF08A] text-black shadow-[1px_1px_0px_#000000]"
                            : rank === 2
                            ? "bg-[#E2E8F0] text-black shadow-[1px_1px_0px_#000000]"
                            : rank === 3
                            ? "bg-[#FED7AA] text-black shadow-[1px_1px_0px_#000000]"
                            : "bg-zinc-100 text-black/70"
                        }`}
                      >
                        {rank === 1
                          ? "🥇"
                          : rank === 2
                          ? "🥈"
                          : rank === 3
                          ? "🥉"
                          : rank}
                      </span>

                      <span className="text-lg shrink-0">
                        {link.icon || "🔗"}
                      </span>

                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-black text-black truncate max-w-[150px] sm:max-w-[280px]">
                            {link.title}
                          </span>
                          {link.category && (
                            <Badge
                              variant="secondary"
                              size="sm"
                              className="text-[9px] px-1 py-0 bg-zinc-100 text-black border-[1px] border-black shadow-none"
                            >
                              {link.category}
                            </Badge>
                          )}
                          {link.isPinned && (
                            <Badge
                              variant="default"
                              size="sm"
                              className="text-[9px] px-1 py-0 bg-[#FDE047] text-black border-[1px] border-black shadow-none"
                            >
                              PIN
                            </Badge>
                          )}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-black/60 truncate max-w-[180px] sm:max-w-[320px] hover:underline"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>

                    {/* 우측: 클릭 수 & 점유율 바 */}
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="hidden sm:flex flex-col items-end gap-1 w-24">
                        <div className="w-full bg-zinc-100 border-[1px] border-black h-2 rounded-[3px] overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-[2px]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-black/60">
                          점유율 {percentage}%
                        </span>
                      </div>

                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-base sm:text-lg font-black text-black">
                          {clickCount.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-black/60">
                          클릭
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs font-black text-black/60">
                등록된 링크가 없어 순위표를 표시할 수 없습니다.
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
