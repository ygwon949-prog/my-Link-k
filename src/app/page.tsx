export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
      {/* 프로필 카드 (Neobrutalism 스타일) */}
      <section className="w-full p-[16px] md:w-[80%] md:p-[48px] min-[1023px]:w-[400px] min-[1023px]:p-[24px] mx-auto bg-[#FEF08A] border-[3px] border-black rounded-[12px] shadow-[6px_6px_0px_#000000] text-center text-black">
        {/* 프로필 이미지 (120px x 120px, 원형, 3px 검은 테두리, 4px 4px 하드 그림자) */}
        <div className="mx-auto mb-6 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-white text-black text-4xl font-black border-[3px] border-black shadow-[4px_4px_0px_#000000]">
          권
        </div>

        {/* 이름 */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
          권용대
        </h1>

        {/* 역할 / 뱃지 */}
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            Frontend / Web Developer
          </span>
        </div>

        {/* 소개글 */}
        <p className="mt-5 text-sm sm:text-base font-medium leading-relaxed text-black">
          직관적인 사용자 경험과 클린 코드를 지향하는 웹 개발자입니다. 새로운 기술을 탐구하고, 일상의 가치를 높이는 서비스를 만드는 데 열정을 쏟고 있습니다.
        </p>

        {/* 키워드 태그 */}
        <div className="mt-8 pt-6 border-t-[2px] border-black flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            💻 Web Developer
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            ⚛️ React & Next.js
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            ✨ UX & Clean Code
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold bg-white text-black border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            🌱 지속적인 성장
          </span>
        </div>
      </section>
    </main>
  );
}
