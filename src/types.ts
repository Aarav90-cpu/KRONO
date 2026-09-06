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
}
