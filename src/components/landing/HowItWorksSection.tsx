"use client";

import React from "react";
import { LogIn, PlusCircle, Share2, ArrowRight, Sparkles } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: LogIn,
    title: "Google 원클릭 로그인",
    desc: "아이디나 비밀번호를 새로 만들 필요 없이, 사용 중인 Google 계정으로 1초 만에 안전하게 시작합니다.",
    tag: "소요 시간: 1초",
    color: "bg-[#FEF08A]",
  },
  {
    step: "02",
    icon: PlusCircle,
    title: "프로필 & 링크 등록",
    desc: "내 닉네임과 한 줄 소개를 적고, 보여주고 싶은 웹사이트/SNS 링크들을 자유롭게 추가하고 순서를 정리합니다.",
    tag: "소요 시간: 1분",
    color: "bg-[#A7F3D0]",
  },
  {
    step: "03",
    icon: Share2,
    title: "나만의 URL 공유 & 분석",
    desc: "인스타그램, 깃허브, 이력서 바이오에 나만의 주소(/@내아이디)를 붙여넣고 실시간 유입 클릭을 확인하세요.",
    tag: "영구 무료 제공",
    color: "bg-[#BAE6FD]",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-18">
      {/* 섹션 타이틀 */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#FEF08A] text-black font-black text-xs border-[2px] border-black shadow-[2px_2px_0px_#000000] mb-3">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>EASY & FAST</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
          시작하는 데 걸리는 시간, <br className="hidden sm:inline" />
          <span className="bg-[#A7F3D0] px-2 py-0.5 border-[2px] border-black shadow-[2.5px_2.5px_0px_#000000] rounded-[6px] inline-block mt-1">
            딱 3단계면 충분합니다
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base font-bold text-black/75">
          복잡한 세팅 없이 오늘 바로 나만의 프로필 페이지를 공개할 수 있습니다.
        </p>
      </div>

      {/* 3단계 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {STEPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className={`relative rounded-[14px] border-[3px] border-black p-6 sm:p-7 shadow-[5px_5px_0px_#000000] ${item.color} flex flex-col justify-between`}
            >
              <div>
                {/* 상단 번호 뱃지 & 아이콘 */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl sm:text-4xl font-black text-black tracking-tighter">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-[10px] bg-white border-[2px] border-black shadow-[2px_2px_0px_#000000] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-black stroke-[2.5]" />
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-black tracking-tight mb-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm font-bold text-black/85 leading-relaxed bg-white/70 p-3.5 rounded-[8px] border-[1.5px] border-black">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-black/20 flex items-center justify-between">
                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-black text-white">
                  {item.tag}
                </span>
                {idx < 2 && (
                  <ArrowRight className="hidden md:block w-4 h-4 text-black stroke-[2.5]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
