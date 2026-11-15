"use client";

import React from "react";
import {
  Palette,
  Zap,
  BarChart3,
  AtSign,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Palette,
    badge: "AESTHETIC",
    title: "독보적인 네오브루탈리즘 감성",
    desc: "흔하고 지루한 흰색 바탕의 링크트리는 이제 그만! 굵은 테두리와 제로 블러 하드 섀도우, 톡톡 튀는 비비드 컬러로 나만의 브랜드를 강렬하게 각인시키세요.",
    bgColor: "bg-[#FEF08A]",
    badgeBg: "bg-white",
    sticker: "🎨 힙하고 트렌디한",
  },
  {
    icon: Zap,
    badge: "INSTANT",
    title: "구글 원클릭 3초 링크 등록",
    desc: "복잡한 회원가입 양식 없이 구글 계정으로 1초 만에 로그인. URL과 제목만 입력하면 누구나 클릭하고 싶어지는 예쁜 버튼 링크가 즉시 완성됩니다.",
    bgColor: "bg-[#A7F3D0]",
    badgeBg: "bg-white",
    sticker: "⚡ 초간편 관리",
  },
  {
    icon: BarChart3,
    badge: "ANALYTICS",
    title: "실시간 클릭 & 방문자 통계",
    desc: "어떤 링크가 가장 사랑받고 있는지, 요일별로 얼마나 많은 방문자가 유입되었는지 직관적인 대시보드와 차트로 실시간 분석할 수 있습니다.",
    bgColor: "bg-[#BAE6FD]",
    badgeBg: "bg-white",
    sticker: "📊 똑똑한 데이터",
  },
  {
    icon: AtSign,
    badge: "PERSONAL URL",
    title: "나만의 퍼스널 주소 (/@아이디)",
    desc: "인스타그램 소개글, 깃허브 README, 이력서, 트위터(X) 어디든 깔끔하게 복사해 붙여넣는 나만의 전용 프로필 웹 주소를 평생 무료로 제공합니다.",
    bgColor: "bg-[#F472B6]",
    badgeBg: "bg-white",
    sticker: "🔗 세상에 단 하나",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* 섹션 헤더 */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>WHY MYLINK?</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
          단순한 링크 모음이 아닌, <br className="hidden sm:inline" />
          <span className="bg-[#A7F3D0] px-2 py-0.5 border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] rounded-[6px] inline-block mt-1">
            나를 보여주는 퍼스널 쇼룸
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base font-bold text-black/75">
          마이링크는 사용하기 편하고, 보기에도 즐거운 프로필 경험을 선사합니다.
        </p>
      </div>

      {/* 4개 핵심 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={`relative rounded-[14px] border-[3px] border-black p-6 sm:p-7 shadow-[5px_5px_0px_#000000] ${feature.bgColor} transition-transform hover:-translate-y-1`}
            >
              {/* 스티커 태그 */}
              <div className="absolute -top-3.5 right-4">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-[6px] bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] rotate-2">
                  {feature.sticker}
                </span>
              </div>

              {/* 아이콘 & 시맨틱 배지 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[10px] bg-white border-[2.5px] border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-black text-white">
                  {feature.badge}
                </span>
              </div>

              {/* 제목 */}
              <h3 className="text-lg sm:text-xl font-black text-black tracking-tight mb-2 flex items-center justify-between">
                <span>{feature.title}</span>
                <span className="text-xs font-black text-black/50">0{idx + 1}</span>
              </h3>

              {/* 상세 설명 */}
              <p className="text-xs sm:text-sm font-bold text-black/85 leading-relaxed bg-white/60 p-3 rounded-[8px] border-[1.5px] border-black">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
