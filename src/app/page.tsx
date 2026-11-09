import { ProfileCard } from "@/components/profile";

export default function Home() {
  return (
    <main className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)] overflow-hidden">
      {/* 배경 도트 패턴 (레트로 Neobrutalism 무드) */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* 배경 장식 도형들 (화면이 넓을 때 시각적 매력 극대화) */}
      <div className="hidden lg:block absolute top-12 left-16 select-none pointer-events-none -rotate-12 bg-[#67E8F9] text-black font-black text-xs px-3 py-1.5 rounded-[8px] border-[2px] border-black shadow-[3px_3px_0px_#000000]">
        ⚡ BUILD & SHIP
      </div>
      <div className="hidden lg:block absolute bottom-16 right-16 select-none pointer-events-none rotate-12 bg-[#F472B6] text-black font-black text-xs px-3 py-1.5 rounded-[8px] border-[2px] border-black shadow-[3px_3px_0px_#000000]">
        🚀 REACT 19 & NEXT 16
      </div>

      {/* 메인 프로필 & 링크 목록 카드 */}
      <ProfileCard />
    </main>
  );
}
