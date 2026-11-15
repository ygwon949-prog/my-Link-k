import type { Metadata } from "next";
import {
  LandingHeaderNotice,
  HeroSection,
  FeaturesSection,
  InteractiveSimulator,
  StatsShowcaseSection,
  PersonaSection,
  HowItWorksSection,
  FaqSection,
  CtaSection,
  Footer,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "마이링크 (mylink) - 나를 표현하는 가장 힙한 네오브루탈리즘 프로필 링크",
  description:
    "지루한 링크트리는 그만! 굵은 테두리와 톡톡 튀는 비비드 컬러, 실시간 클릭 분석까지. Google 계정 하나로 3초 만에 완성하는 나만의 링크 인 바이오.",
};

export default function Home() {
  return (
    <main className="relative flex-1 flex flex-col items-center bg-[#FFFBEB] dark:bg-zinc-950 min-h-[calc(100vh-64px)] overflow-x-hidden">
      {/* 배경 도트 패턴 (레트로 Neobrutalism 감성) */}
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      {/* 1. 로그인 유저 맞춤 환영 및 퀵 액션 알림 바 */}
      <LandingHeaderNotice />

      {/* 2. 메인 히어로 섹션 (캐치프레이즈 + 인터랙티브 라이브 프리뷰 목업) */}
      <HeroSection />

      {/* 3. 왜 마이링크인가요? (4가지 핵심 특장점 카드) */}
      <FeaturesSection />

      {/* 4. 10초 실시간 시뮬레이터 (직접 타이핑해보는 재미있는 체험) */}
      <InteractiveSimulator />

      {/* 5. 실시간 클릭 통계 및 대시보드 미리보기 쇼케이스 */}
      <StatsShowcaseSection />

      {/* 6. 페르소나별 활용 레시피 (개발자 / 디자이너 / 크리에이터) */}
      <PersonaSection />

      {/* 7. 초간단 3단계 시작 방법 */}
      <HowItWorksSection />

      {/* 8. 자주 묻는 질문 (FAQ 아코디언) */}
      <FaqSection />

      {/* 9. 하단 메가 CTA 배너 */}
      <CtaSection />

      {/* 10. 네오브루탈리즘 푸터 */}
      <Footer />
    </main>
  );
}
