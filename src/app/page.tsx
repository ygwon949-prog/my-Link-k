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
            대학생 · 개발자
          </span>
        </div>

        {/* 소개글 */}
        <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
        </p>

        {/* 키워드 태그 */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            ✨ 바이브 코딩
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            💻 웹 개발
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            🌱 성장 중
          </span>
        </div>
      </div>
    </main>
  );
}
