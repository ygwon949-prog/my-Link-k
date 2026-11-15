"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";

export function Footer() {
  return (
    <footer className="w-full border-t-[3px] border-black bg-white dark:bg-zinc-950 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* 좌측: 로고 및 소개 */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-[#FEF08A] text-black font-black text-base border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            <span>⚡ mylink</span>
          </div>
          <p className="text-xs font-bold text-black/70 max-w-sm">
            나를 표현하는 가장 감각적인 네오브루탈리즘 링크 인 바이오 서비스.
          </p>
        </div>

        {/* 중앙: 기술 스택 뱃지들 */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <Badge
            variant="tag"
            className="text-[10px] font-black bg-[#FFFBEB] text-black border-[1.5px] border-black"
          >
            Next.js 16
          </Badge>
          <Badge
            variant="tag"
            className="text-[10px] font-black bg-[#A7F3D0] text-black border-[1.5px] border-black"
          >
            React 19
          </Badge>
          <Badge
            variant="tag"
            className="text-[10px] font-black bg-[#BAE6FD] text-black border-[1.5px] border-black"
          >
            Tailwind CSS v4
          </Badge>
          <Badge
            variant="tag"
            className="text-[10px] font-black bg-[#F472B6] text-black border-[1.5px] border-black"
          >
            Firebase
          </Badge>
        </div>

        {/* 우측: 저작권 & 링크 */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-black text-black hover:underline"
            >
              홈
            </Link>
            <span className="text-black/30">·</span>
            <Link
              href="/links"
              className="text-xs font-black text-black hover:underline"
            >
              전체 링크
            </Link>
            <span className="text-black/30">·</span>
            <Link
              href="/stats"
              className="text-xs font-black text-black hover:underline"
            >
              통계
            </Link>
          </div>
          <p className="text-[11px] font-bold text-black/60">
            © 2026 mylink. All rights reserved. Built with Neobrutalism.
          </p>
        </div>
      </div>
    </footer>
  );
}
