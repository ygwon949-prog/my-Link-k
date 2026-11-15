"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
  badge: string;
}

const FAQS: FaqItem[] = [
  {
    q: "정말 완전 무료로 이용할 수 있나요?",
    a: "네! 마이링크의 모든 핵심 기능(프로필 생성, 링크 무제한 등록, 실시간 클릭 통계 대시보드, 퍼스널 URL 제공)은 100% 무료로 평생 제공됩니다.",
    badge: "비용 안내",
  },
  {
    q: "등록할 수 있는 링크 개수에 제한이 있나요?",
    a: "링크 개수 제한은 없습니다. 포트폴리오, 깃허브, 블로그, 유튜브, 오픈카톡 등 보여주고 싶은 링크를 얼마든지 추가하고 자유롭게 순서를 변경할 수 있습니다.",
    badge: "링크 관리",
  },
  {
    q: "나만의 프로필 웹 주소는 어떻게 정해지나요?",
    a: "Google 로그인 시 사용된 이메일 계정의 앞자리 아이디를 기반으로 `/@내아이디` 형태의 고유 URL이 자동 부여됩니다. 원할 경우 프로필 수정 화면에서 언제든 닉네임을 변경할 수 있습니다.",
    badge: "퍼스널 URL",
  },
  {
    q: "링크 클릭 수와 방문자 통계는 실시간으로 반영되나요?",
    a: "네! 방문자가 내 마이링크 페이지에서 링크 버튼을 클릭하는 즉시 집계되며, 통계 대시보드에서 일별/링크별 클릭 순위를 실시간으로 투명하게 확인하실 수 있습니다.",
    badge: "통계 & 분석",
  },
  {
    q: "모바일 스마트폰 화면에서도 예쁘게 잘 보이나요?",
    a: "물론입니다. 마이링크는 인스타그램, 틱톡, 깃허브 모바일 앱 내 인앱 브라우저 및 모든 스마트폰 기기 화면에 완벽하게 최적화된 모바일 퍼스트 네오브루탈리즘 레이아웃을 제공합니다.",
    badge: "반응형 지원",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-18">
      {/* 섹션 타이틀 */}
      <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-white text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000] mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-black" />
          <span>FAQ</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
          자주 묻는 질문
        </h2>
        <p className="mt-2 text-sm sm:text-base font-bold text-black/75">
          마이링크에 대해 궁금한 점을 시원하게 해결해 드립니다.
        </p>
      </div>

      {/* 아코디언 목록 */}
      <div className="flex flex-col gap-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.q}
              className={`rounded-[12px] border-[2.5px] border-black transition-all ${
                isOpen
                  ? "bg-white shadow-[4px_4px_0px_#000000]"
                  : "bg-[#FFFBEB] hover:bg-white shadow-[2px_2px_0px_#000000]"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer gap-3"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded bg-[#FEF08A] border border-black shrink-0">
                    {faq.badge}
                  </span>
                  <span className="text-sm sm:text-base font-black text-black truncate">
                    {faq.q}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full bg-white border-[1.5px] border-black flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 bg-[#FEF08A]" : ""
                  }`}
                >
                  <ChevronDown className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm font-bold text-black/85 leading-relaxed border-t-[1.5px] border-black/15">
                  <p className="bg-[#FFFBEB] p-3.5 rounded-[8px] border-[1.5px] border-black/30">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
