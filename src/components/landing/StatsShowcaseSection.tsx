"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  ArrowUpRight,
  Award,
} from "lucide-react";

const STATS_CARDS = [
  {
    icon: MousePointerClick,
    title: "총 링크 클릭 수",
    value: "3,842회",
    change: "+28.4% 지난 주 대비",
    bgColor: "bg-[#FEF08A]",
    isPositive: true,
  },
  {
    icon: Users,
    title: "방문자 수 (Unique)",
    value: "1,290명",
    change: "+15.2% 상승",
    bgColor: "bg-[#A7F3D0]",
    isPositive: true,
  },
  {
    icon: TrendingUp,
    title: "평균 클릭 전환율",
    value: "64.8%",
    change: "+4.1% 개선",
    bgColor: "bg-[#BAE6FD]",
    isPositive: true,
  },
];

const TOP_LINKS = [
  { rank: 1, title: "📁 2026 포트폴리오 웹사이트", clicks: 1420, percent: 74, color: "bg-[#FEF08A]" },
  { rank: 2, title: "💻 GitHub 메인 저장소", clicks: 980, percent: 52, color: "bg-[#A7F3D0]" },
  { rank: 3, title: "✍️ 테크 블로그 최신 아티클", clicks: 750, percent: 38, color: "bg-[#F472B6]" },
];

const WEEKLY_DATA = [
  { day: "월", height: "45%", clicks: 320 },
  { day: "화", height: "60%", clicks: 430 },
  { day: "수", height: "85%", clicks: 610 },
  { day: "목", height: "70%", clicks: 510 },
  { day: "금", height: "95%", clicks: 690 },
  { day: "토", height: "80%", clicks: 580 },
  { day: "일", height: "90%", clicks: 702 },
];

export function StatsShowcaseSection() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-18">
      {/* 섹션 타이틀 */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#BAE6FD] text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000] rotate-1 mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          <span>DATA & INSIGHTS</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
          내 링크의 영향력, <br className="hidden sm:inline" />
          <span className="bg-[#67E8F9] px-2 py-0.5 border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] rounded-[6px] inline-block mt-1">
            숫자와 차트로 한눈에
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base font-bold text-black/75">
          어떤 콘텐츠가 가장 뜨거운 관심을 받고 있는지 실시간 분석 대시보드로 확인하세요.
        </p>
      </div>

      {/* 대시보드 쇼케이스 프리뷰 컨테이너 */}
      <div className="rounded-[16px] border-[3px] border-black bg-white p-5 sm:p-8 shadow-[6px_6px_0px_#000000]">
        {/* 상단 3개 요약 지표 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {STATS_CARDS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`p-4 rounded-[12px] border-[2.5px] border-black shadow-[3px_3px_0px_#000000] ${stat.bgColor} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-black/80">
                    {stat.title}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white border-[1.5px] border-black flex items-center justify-center">
                    <Icon className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 text-[11px] font-black text-emerald-800 bg-white/70 py-0.5 px-2 rounded-[4px] border border-black/40 self-start inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 stroke-[3]" />
                  <span>{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 중단: 차트 & 인기 링크 2열 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 좌측: 요일별 클릭 추이 미니 바 차트 (lg:col-span-7) */}
          <div className="lg:col-span-7 p-5 rounded-[12px] border-[2.5px] border-black bg-[#FFFBEB] shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-black text-black flex items-center gap-2">
                <span>📈 주간 클릭 추이</span>
                <span className="text-[10px] bg-white border border-black px-1.5 py-0.5 rounded font-black">
                  최근 7일
                </span>
              </span>
              <span className="text-xs font-black text-black">
                총 3,842회
              </span>
            </div>

            {/* 네오브루탈리즘 바 차트 */}
            <div className="h-44 sm:h-52 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b-[2px] border-black">
              {WEEKLY_DATA.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <div className="text-[10px] font-black text-black opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 rounded border border-black">
                    {item.clicks}
                  </div>
                  <div
                    style={{ height: item.height }}
                    className="w-full max-w-[36px] rounded-t-[6px] border-[2px] border-black bg-[#FEF08A] group-hover:bg-[#F472B6] transition-all shadow-[2px_0px_0px_#000000]"
                  />
                  <span className="text-xs font-black text-black mt-1">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px] font-bold text-black/70 text-right">
              💡 주말과 금요일에 방문자 클릭이 2배 이상 집중되는 패턴을 분석할 수 있습니다.
            </p>
          </div>

          {/* 우측: 인기 링크 랭킹 TOP 3 (lg:col-span-5) */}
          <div className="lg:col-span-5 p-5 rounded-[12px] border-[2.5px] border-black bg-white shadow-[3px_3px_0px_#000000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black text-black flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>인기 링크 TOP 3</span>
                </span>
                <span className="text-[10px] font-black bg-[#A7F3D0] px-2 py-0.5 rounded border border-black">
                  실시간 순위
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {TOP_LINKS.map((link) => (
                  <div
                    key={link.rank}
                    className="p-3 rounded-[8px] border-[2px] border-black bg-[#FFFBEB] flex flex-col gap-1.5 shadow-[2px_2px_0px_#000000]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-black text-white font-black text-[11px] flex items-center justify-center shrink-0">
                          {link.rank}
                        </span>
                        <span className="text-xs font-black text-black truncate">
                          {link.title}
                        </span>
                      </div>
                      <span className="text-xs font-black text-black shrink-0 ml-1">
                        {link.clicks}회
                      </span>
                    </div>

                    {/* 진행 바 */}
                    <div className="w-full h-2.5 rounded-full border-[1.5px] border-black bg-white overflow-hidden">
                      <div
                        style={{ width: `${link.percent}%` }}
                        className={`h-full ${link.color} border-r-[1.5px] border-black`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
              <span className="text-xs font-bold text-black/70">
                로그인 후 내 링크 통계 바로 확인
              </span>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/stats" />}
                className="h-8 px-2.5 text-xs font-black bg-[#FEF08A] hover:bg-[#fde047] text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] gap-1"
              >
                <span>통계 보기</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
