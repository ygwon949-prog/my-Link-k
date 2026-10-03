export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-sm text-center">
        {/* 프로필 이미지 / 아바타 */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white text-3xl font-bold shadow-md shadow-indigo-500/20 ring-4 ring-white dark:ring-zinc-900">
          권
        </div>

        {/* 이름 */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          권용대
        </h1>

        {/* 역할 / 뱃지 */}
        <div className="mt-2 flex justify-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            Frontend / Web Developer
          </span>
        </div>

        {/* 소개글 */}
        <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          직관적인 사용자 경험과 클린 코드를 지향하는 웹 개발자입니다. 새로운 기술을 탐구하고, 일상의 가치를 높이는 서비스를 만드는 데 열정을 쏟고 있습니다.
        </p>

        {/* 키워드 태그 */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            💻 Web Developer
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            ⚛️ React & Next.js
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            ✨ UX & Clean Code
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            🌱 지속적인 성장
          </span>
        </div>
      </div>
    </main>
  );
}
