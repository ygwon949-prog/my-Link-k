import React from "react";
import { LinkItem } from "@/types";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkButtonProps {
  link: LinkItem;
  className?: string;
}

export function LinkButton({ link, className }: LinkButtonProps) {
  const isMail = link.url.startsWith("mailto:");

  return (
    <a
      href={link.url}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
      className={cn(
        "group relative flex items-center justify-between w-full px-4 py-3 rounded-[10px] text-black font-black text-sm sm:text-base border-[2.5px] border-black transition-all",
        link.isPinned
          ? "bg-[#FEF9C3] shadow-[3.5px_3.5px_0px_#000000]"
          : "bg-white shadow-[3px_3px_0px_#000000]",
        "hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#000000]",
        "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 text-left">
        {/* 링크 아이콘 / 이모지 */}
        <span className="flex-shrink-0 text-lg sm:text-xl w-7 h-7 rounded-[6px] bg-zinc-100 flex items-center justify-center border-[1.5px] border-black shadow-[1px_1px_0px_#000000]">
          {link.icon || "🔗"}
        </span>

        {/* 링크 제목 및 부가 설명 */}
        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate tracking-tight font-black text-sm sm:text-base">
              {link.title}
            </span>
            {link.isPinned && (
              <span className="flex-shrink-0 text-[10px] font-black px-1.5 py-0.2 bg-[#FDE047] text-black border-[1.5px] border-black rounded-[4px] shadow-[1px_1px_0px_#000000]">
                PIN
              </span>
            )}
          </div>
          {link.description && (
            <span className="truncate text-xs font-semibold text-black/70">
              {link.description}
            </span>
          )}
        </div>
      </div>

      {/* 우측 바로가기 화살표 아이콘 */}
      <div className="flex-shrink-0 ml-2 pl-2 flex items-center justify-center">
        <ArrowUpRight className="w-5 h-5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </a>
  );
}
