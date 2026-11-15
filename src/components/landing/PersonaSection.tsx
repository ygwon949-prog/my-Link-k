"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui";
import {
  Code2,
  Brush,
  Video,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const PERSONAS = [
  {
    id: "dev",
    name: "개발자 (Developer)",
    icon: Code2,
    badge: "💻 TECH & OPENSOURCE",
    headline: "깃허브 리포지토리와 기술 블로그, 포트폴리오를 한 곳에",
    desc: "커밋 기록, 배포한 웹 사이트, 벨로그/미디엄 기술 아티클 링크를 하나의 네오브루탈리즘 URL로 정리하세요. 개발자 채용 담당자의 시선을 단번에 사로잡습니다.",
    bgColor: "bg-[#FEF08A]",
    sampleUser: {
      name: "김민재 (Minjae Kim)",
      handle: "@minjae.dev",
      badge: "✦ FULLSTACK DEV",
      avatar: "👨‍💻",
      links: [
        { emoji: "🚀", title: "2026 풀스택 웹 포트폴리오", url: "minjae-portfolio.vercel.app" },
        { emoji: "🐙", title: "GitHub 프로필 & 오픈소스 프로젝트", url: "github.com/minjae-kim" },
        { emoji: "📝", title: "개발 트러블슈팅 기술 블로그", url: "velog.io/@minjae" },
        { emoji: "📄", title: "노션 이력서 & 경력기술서", url: "notion.site/minjae-resume" },
      ],
    },
  },
  {
    id: "designer",
    name: "디자이너 (Designer)",
    icon: Brush,
    badge: "🎨 UI/UX & CREATIVE",
    headline: "비핸스, 드리블, 피그마 커뮤니티 링크를 감각적으로",
    desc: "디자인 포트폴리오 사이트와 인스타그램 아카이빙 계정, 외주 문의 링크를 힙하고 볼드한 네오브루탈리즘 스타일로 완성하여 디자이너로서의 감각을 뽐내보세요.",
    bgColor: "bg-[#F472B6]",
    sampleUser: {
      name: "이지원 (Jiwon Lee)",
      handle: "@jiwon.design",
      badge: "✦ PRODUCT DESIGNER",
      avatar: "👩‍🎨",
      links: [
        { emoji: "✨", title: "UI/UX 포트폴리오 웹사이트", url: "jiwon-design.framer.website" },
        { emoji: "🎨", title: "Behance 프로젝트 쇼케이스", url: "behance.net/jiwon-lee" },
        { emoji: "📸", title: "디자인 일상 & 그래픽 아카이브 (IG)", url: "instagram.com/jiwon.visuals" },
        { emoji: "💌", title: "프로젝트 외주 및 협업 문의 폼", url: "tally.so/r/jiwon-collab" },
      ],
    },
  },
  {
    id: "creator",
    name: "크리에이터 (Creator)",
    icon: Video,
    badge: "🎬 CONTENT & INFLUENCER",
    headline: "유튜브, 틱톡, 뉴스레터, 굿즈샵을 단 하나의 바이오로",
    desc: "인스타그램이나 숏폼 바이오에 링크 하나만 들어갈 수 있어 아쉬우셨나요? 영상 최신작, 공동구매 링크, 오픈채팅방까지 손쉽게 전달하세요.",
    bgColor: "bg-[#A7F3D0]",
    sampleUser: {
      name: "루카 (Luca Studio)",
      handle: "@luca.channel",
      badge: "✦ TECH CREATOR",
      avatar: "🎙️",
      links: [
        { emoji: "📺", title: "유튜브 최신 테크 리뷰 영상", url: "youtube.com/@luca_studio" },
        { emoji: "✉️", title: "매주 발행하는 주간 IT 뉴스레터", url: "maily.so/lucanews" },
        { emoji: "🛍️", title: "데스크테리어 추천 굿즈 모음", url: "smartstore.naver.com/luca" },
        { emoji: "💬", title: "크리에이터 소통 오픈채팅방", url: "open.kakao.com/o/lucachat" },
      ],
    },
  },
];

export function PersonaSection() {
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-18">
      {/* 섹션 타이틀 */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>FOR EVERYONE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
          누구에게나 꼭 맞는 <br className="hidden sm:inline" />
          <span className="bg-[#FEF08A] px-2 py-0.5 border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] rounded-[6px] inline-block mt-1">
            마이링크 활용 레시피
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base font-bold text-black/75">
          개발자부터 디자이너, 크리에이터까지 자신만의 방식으로 마이링크를 완성해보세요.
        </p>
      </div>

      {/* 페르소나 선택 탭 버튼들 */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-8">
        {PERSONAS.map((persona) => {
          const Icon = persona.icon;
          const isSelected = selectedPersona.id === persona.id;
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => setSelectedPersona(persona)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs sm:text-sm font-black border-[2.5px] border-black transition-all cursor-pointer ${
                isSelected
                  ? "bg-black text-white shadow-[3px_3px_0px_#000000] -translate-y-1"
                  : "bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000000]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{persona.name}</span>
            </button>
          );
        })}
      </div>

      {/* 선택된 페르소나 쇼케이스 카드 (2열 레이아웃) */}
      <div
        className={`rounded-[16px] border-[3px] border-black p-6 sm:p-9 shadow-[6px_6px_0px_#000000] ${selectedPersona.bgColor} transition-colors duration-200`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* 좌측: 설명 및 추천 포인트 (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <span className="text-xs font-black px-2.5 py-1 rounded-[6px] bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000] mb-3">
              {selectedPersona.badge}
            </span>

            <h3 className="text-xl sm:text-3xl font-black text-black tracking-tight leading-snug">
              {selectedPersona.headline}
            </h3>

            <p className="mt-4 text-xs sm:text-sm font-bold text-black/85 leading-relaxed bg-white/70 p-4 rounded-[10px] border-[2px] border-black">
              {selectedPersona.desc}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <span className="text-xs font-black text-black">추천 링크 구성:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedPersona.sampleUser.links.map((link) => (
                  <span
                    key={link.title}
                    className="text-[11px] font-black px-2 py-1 rounded bg-white border-[1.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
                  >
                    {link.emoji} {link.title.split(" ")[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 우측: 실제 프로필 카드 프리뷰 (lg:col-span-6) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[370px] rounded-[14px] border-[3px] border-black bg-white p-5 shadow-[5px_5px_0px_#000000] text-center">
              <div className="inline-block text-3xl p-2.5 rounded-full bg-[#FFFBEB] border-[2px] border-black mb-2 shadow-[2px_2px_0px_#000000]">
                {selectedPersona.sampleUser.avatar}
              </div>
              <h4 className="text-lg font-black text-black">
                {selectedPersona.sampleUser.name}
              </h4>
              <p className="text-xs font-black text-black/60">
                {selectedPersona.sampleUser.handle}
              </p>

              <div className="mt-2 inline-block">
                <Badge
                  variant="default"
                  className="bg-[#A7F3D0] text-black font-black text-[10px] border-[1.5px] border-black"
                >
                  {selectedPersona.sampleUser.badge}
                </Badge>
              </div>

              {/* 링크 리스트 */}
              <div className="flex flex-col gap-2 mt-4">
                {selectedPersona.sampleUser.links.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-2.5 rounded-[8px] border-[2px] border-black bg-[#FFFBEB] hover:bg-[#FEF08A] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{item.emoji}</span>
                      <span className="text-xs font-black text-black truncate">
                        {item.title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-black shrink-0 ml-1.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
