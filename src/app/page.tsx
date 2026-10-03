import Image from "next/image";

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

      {/* 프로필 카드 (Neobrutalism 스타일 가이드 엄수) */}
      <section className="relative w-full p-[16px] md:w-[80%] md:max-w-[480px] md:p-[24px] min-[1023px]:w-[400px] min-[1023px]:p-[24px] mx-auto bg-[#FEF08A] border-[3px] border-black rounded-[12px] shadow-[6px_6px_0px_#000000] text-center text-black">
        {/* 상단 모서리 스티커 배지 */}
        <div className="absolute -top-3.5 -right-2 sm:-right-3 rotate-6 bg-[#A7F3D0] text-black text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-full border-[2px] border-black shadow-[2px_2px_0px_#000000] select-none">
          ✦ OPEN TO WORK
        </div>

        {/* 프로필 이미지 (반응형: 모바일 100px -> 태블릿/데스크탑 120px, 원형, 3px 검은 테두리, 4px 4px 하드 그림자) */}
        <div className="relative mx-auto mb-4 sm:mb-5 h-[100px] w-[100px] sm:h-[110px] sm:w-[110px] md:h-[120px] md:w-[120px]">
          <div className="h-full w-full rounded-full border-[3px] border-black shadow-[4px_4px_0px_#000000] overflow-hidden bg-white">
            <Image
              src="/avatar.png"
              alt="권용대 프로필 사진"
              fill
              sizes="(max-width: 640px) 100px, (max-width: 768px) 110px, 120px"
              priority
              className="object-cover"
            />
          </div>
          {/* 활동 상태 표시 점 */}
          <span
            className="absolute bottom-1 right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#4ADE80] border-[2px] sm:border-[2.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
            title="온라인 활동 중"
          />
        </div>

        {/* 이름 */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
          권용대
        </h1>

        {/* 역할 / 뱃지 */}
        <div className="mt-2.5 flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Frontend / Web Developer
          </span>
        </div>

        {/* 소개글 */}
        <p className="mt-4 text-sm sm:text-base font-medium leading-relaxed text-black/90">
          직관적인 사용자 경험과 클린 코드를 지향하는 웹 개발자입니다. 새로운 기술을 탐구하고, 일상의 가치를 높이는 서비스를 만드는 데 열정을 쏟고 있습니다.
        </p>

        {/* 인터랙티브 링크 버튼 목록 (Link-in-bio) */}
        <div className="mt-6 flex flex-col gap-2.5">
          {/* GitHub 프로필 */}
          <a
            href="https://github.com/ygwon949-prog"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full px-4 py-2.5 sm:py-3 rounded-[10px] bg-white text-black font-black text-xs sm:text-sm border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>GitHub 방문하기</span>
            </div>
            <span className="font-mono text-base group-hover:translate-x-0.5 transition-transform">↗</span>
          </a>

          {/* 프로젝트 리포지토리 */}
          <a
            href="https://github.com/ygwon949-prog/my-Link-k"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between w-full px-4 py-2.5 sm:py-3 rounded-[10px] bg-white text-black font-black text-xs sm:text-sm border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span>⭐</span>
              <span>my-Link-k 저장소 보기</span>
            </div>
            <span className="font-mono text-base group-hover:translate-x-0.5 transition-transform">↗</span>
          </a>

          {/* 이메일 문의 */}
          <a
            href="mailto:285761652+ygwon949-prog@users.noreply.github.com"
            className="group flex items-center justify-between w-full px-4 py-2.5 sm:py-3 rounded-[10px] bg-[#BAE6FD] text-black font-black text-xs sm:text-sm border-[2.5px] border-black shadow-[3px_3px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span>📬</span>
              <span>개발 협업 및 문의하기</span>
            </div>
            <span className="font-mono text-base group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>

        {/* 키워드 태그 */}
        <div className="mt-6 pt-5 border-t-[2.5px] border-black flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all cursor-default select-none">
            💻 Web Developer
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all cursor-default select-none">
            ⚛️ React & Next.js
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all cursor-default select-none">
            ✨ UX & Clean Code
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] transition-all cursor-default select-none">
            🌱 지속적인 성장
          </span>
        </div>
      </section>
    </main>
  );
}
