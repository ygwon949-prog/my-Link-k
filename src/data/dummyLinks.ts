import { LinkItem, ProfileData } from "@/types";

/**
 * 카테고리 분류 목록
 */
export const LINK_CATEGORIES = [
  "전체",
  "개발",
  "프로젝트",
  "블로그",
  "포트폴리오",
  "소셜",
  "연락처",
] as const;

export type LinkCategory = (typeof LINK_CATEGORIES)[number];

/**
 * 프로필 기본 카드에 노출되는 핵심 링크 목록
 */
export const INITIAL_LINKS: LinkItem[] = [
  {
    id: "link-1",
    title: "GitHub 방문하기",
    url: "https://github.com/ygwon949-prog",
    icon: "🐙",
    description: "개인 오픈소스 프로젝트 및 일일 잔디 커밋 기록",
    category: "개발",
    isPinned: true,
    createdAt: "2026-11-09T18:00:00Z",
  },
  {
    id: "link-2",
    title: "my-Link-k 저장소 보기",
    url: "https://github.com/ygwon949-prog/my-Link-k",
    icon: "⭐",
    description: "Next.js 16 & Neobrutalism 스타일 링크인바이오 프로젝트",
    category: "프로젝트",
    isPinned: true,
    createdAt: "2026-11-09T15:00:00Z",
  },
  {
    id: "link-3",
    title: "기술 블로그 (개발 회고 & 노하우)",
    url: "https://velog.io/@developer",
    icon: "📝",
    description: "프론트엔드 최적화 및 최신 웹 표준 기술 탐구 로그",
    category: "블로그",
    isPinned: false,
    createdAt: "2026-11-09T12:00:00Z",
  },
  {
    id: "link-4",
    title: "개발 협업 및 문의하기",
    url: "mailto:285761652+ygwon949-prog@users.noreply.github.com",
    icon: "📬",
    description: "새로운 프로젝트 협업, 외주 및 커피챗 제안 환영",
    category: "연락처",
    isPinned: false,
    createdAt: "2026-11-09T09:00:00Z",
  },
];

/**
 * 필터링, 정렬, 페이지네이션 및 편집 테스트에 활용할 수 있는 풍부한 더미 데이터 목록 (10개)
 */
export const DUMMY_LINKS: LinkItem[] = [
  {
    id: "link-1",
    title: "GitHub 방문하기",
    url: "https://github.com/ygwon949-prog",
    icon: "🐙",
    description: "개인 오픈소스 프로젝트 및 일일 잔디 커밋 기록",
    category: "개발",
    isPinned: true,
    createdAt: "2026-11-09T18:00:00Z",
  },
  {
    id: "link-2",
    title: "my-Link-k 저장소 보기",
    url: "https://github.com/ygwon949-prog/my-Link-k",
    icon: "⭐",
    description: "Next.js 16 & Neobrutalism 스타일 링크인바이오 프로젝트",
    category: "프로젝트",
    isPinned: true,
    createdAt: "2026-11-09T15:00:00Z",
  },
  {
    id: "link-3",
    title: "기술 블로그 (개발 회고 & 노하우)",
    url: "https://velog.io/@developer",
    icon: "📝",
    description: "프론트엔드 최적화 및 최신 웹 표준 기술 탐구 로그",
    category: "블로그",
    isPinned: false,
    createdAt: "2026-11-09T12:00:00Z",
  },
  {
    id: "link-4",
    title: "개발 협업 및 문의하기",
    url: "mailto:285761652+ygwon949-prog@users.noreply.github.com",
    icon: "📬",
    description: "새로운 프로젝트 협업, 외주 및 커피챗 제안 환영",
    category: "연락처",
    isPinned: false,
    createdAt: "2026-11-09T09:00:00Z",
  },
  {
    id: "link-5",
    title: "인터랙티브 웹 포트폴리오",
    url: "https://portfolio.example.com",
    icon: "💼",
    description: "React 19 & Framer Motion 기반 인터랙티브 포트폴리오 사이트",
    category: "포트폴리오",
    isPinned: true,
    createdAt: "2026-11-08T18:00:00Z",
  },
  {
    id: "link-6",
    title: "LinkedIn 프로필",
    url: "https://linkedin.com/in/developer-profile",
    icon: "👔",
    description: "업무 경력 사항 및 글로벌 개발자 네트워킹",
    category: "소셜",
    isPinned: false,
    createdAt: "2026-11-07T15:00:00Z",
  },
  {
    id: "link-7",
    title: "프론트엔드 아티클 북마크",
    url: "https://weekly-fe.example.com",
    icon: "📚",
    description: "매주 선별하는 모던 웹 기술 트렌드 및 추천 글 모음",
    category: "블로그",
    isPinned: false,
    createdAt: "2026-11-06T15:00:00Z",
  },
  {
    id: "link-8",
    title: "사이드 프로젝트: TaskFlow",
    url: "https://taskflow-demo.vercel.app",
    icon: "🚀",
    description: "칸반 보드 스타일의 로컬 퍼스트 생산성 관리 툴",
    category: "프로젝트",
    isPinned: false,
    createdAt: "2026-11-05T13:10:00Z",
  },
  {
    id: "link-9",
    title: "인스타그램 데브로그",
    url: "https://instagram.com/dev_routine",
    icon: "📸",
    description: "개발자의 데스크 셋업, 공부 기록 및 일상 사진",
    category: "소셜",
    isPinned: false,
    createdAt: "2026-11-04T18:20:00Z",
  },
  {
    id: "link-10",
    title: "Neobrutalism UI 컴포넌트 킷",
    url: "https://neobrutalism-ui.vercel.app",
    icon: "🎨",
    description: "shadcn/ui 기반 네오브루탈리즘 테마 컴포넌트 오픈소스 라이브러리",
    category: "개발",
    isPinned: false,
    createdAt: "2026-11-03T03:30:00Z",
  },
];

/**
 * 기본 프로필 데이터 (Zustand 스토어 초기값 및 샘플 데이터)
 */
export const DEFAULT_PROFILE_DATA: ProfileData = {
  name: "권용대",
  badge: "Frontend / Web Developer",
  bio: "직관적인 사용자 경험과 클린 코드를 지향하는 웹 개발자입니다. 새로운 기술을 탐구하고, 일상의 가치를 높이는 서비스를 만드는 데 열정을 쏟고 있습니다.",
  avatarUrl: "/avatar.png",
  links: INITIAL_LINKS,
  socials: {
    github: "https://github.com/ygwon949-prog",
    instagram: "https://instagram.com/dev_routine",
    email: "285761652+ygwon949-prog@users.noreply.github.com",
    linkedin: "https://linkedin.com/in/developer-profile",
  },
  tags: [
    "💻 Web Developer",
    "⚛️ React & Next.js",
    "✨ UX & Clean Code",
    "🌱 지속적인 성장",
  ],
};
