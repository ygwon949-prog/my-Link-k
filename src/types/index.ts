export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string; // 이모지 또는 아이콘 식별자 (예: '🐙', '⭐', '📝', '📬')
  description?: string;
  category?: string;
  createdAt?: string;
  isPinned?: boolean;
  clickCount?: number; // 링크 클릭 수 (누적 카운트, Firestore: clickCount)
}

export interface SocialLinks {
  github?: string;
  instagram?: string;
  youtube?: string;
  email?: string;
  linkedin?: string;
  blog?: string;
}

export interface ProfileData {
  name: string;
  badge: string;
  bio: string;
  avatarUrl: string;
  links: LinkItem[];
  socials: SocialLinks;
  tags?: string[];
}

export interface UserProfile {
  uid: string;
  username: string; // 이메일 앞부분 ('@' 이전 문자열)
  displayName: string; // 표시 이름 (Google 이름 기본값, 수정 가능)
  googleDisplayName?: string; // Google 계정 원본 이름 (기본값 복원용)
  email: string;
  photoURL: string;
  badge?: string;
  bio?: string;
  lastLoginAt?: string;
  updatedAt?: string;
}


