export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string; // 이모지 또는 아이콘 식별자 (예: '🐙', '⭐', '📝', '📬')
  description?: string;
  category?: string;
  createdAt?: string;
  isPinned?: boolean;
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

