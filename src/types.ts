export type ViewMode = 'feed' | 'explore' | 'bookmarks' | 'profile';

export type FeedSubMode = 'latest' | 'trending';

export type FeedFilter = 'all' | 'following' | 'media';

export interface PostComment {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
}

export interface Post {
  id: string;
  author: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    bio?: string;
  };
  timestamp: string;
  content: string;
  mediaUrl?: string;
  tags?: string[];
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    isReposted?: boolean;
  };
  likedBy?: string[];
  bookmarkedBy?: string[];
  repostedBy?: string[];
  repost?: {
    originalPostId: string;
    reposterId: string;
    reposterName: string;
    reposterHandle: string;
    timestamp: string;
  };
  quotedPost?: {
    id: string;
    author: {
      id?: string;
      name: string;
      handle: string;
      avatar: string;
      verified?: boolean;
    };
    content: string;
    mediaUrl?: string;
    timestamp: string;
  };
  commentsList?: PostComment[];
}

export interface TrendingTopic {
  tag: string;
  postsCount: string;
  category: string;
}

export interface SuggestedUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
}

export type TwoFactorMethod = 'totp' | 'phone';

export interface AuthUserProfile {
  uid: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  provider: 'google' | 'custom';
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  twoFactorVerified: boolean;
  phoneNumber?: string;
  totpSecret?: string;
  backupCodes?: string[];
  createdAt: string;
  birthDate?: string;
  age?: number;
  ageVerified: boolean;
  location?: string;
  bio?: string;
  website?: string;
  following?: string[];
  followers?: string[];
  followingCount?: number;
  followersCount?: number;
}

