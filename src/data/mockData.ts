import { Post, TrendingTopic, SuggestedUser } from '../types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    author: {
      name: 'Elena Vance',
      handle: '@elena_dev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Open source enthusiast & UI designer. Building minimal tools for the web.',
    },
    timestamp: '15m ago',
    content: 'Just published the first public release of our open-source component kit! ✨ Completely zero runtime, fully accessible, and styled with Tailwind CSS. Would love your feedback on the docs!',
    mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
    tags: ['#OpenSource', '#WebDev', '#React'],
    metrics: {
      likes: 184,
      comments: 24,
      shares: 38,
      isLiked: false,
      isBookmarked: false,
    },
    commentsList: [
      {
        id: 'c-1',
        author: {
          name: 'Marcus Chen',
          handle: '@marcus_c',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        },
        timestamp: '10m ago',
        content: 'The animation primitives look super clean! Checking out the GitHub repo right now.',
      },
      {
        id: 'c-2',
        author: {
          name: 'Sarah Jenkins',
          handle: '@sarahtech',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
        timestamp: '5m ago',
        content: 'Huge milestone! Love seeing more lightweight open-source alternatives.',
      },
    ],
  },
  {
    id: 'post-2',
    author: {
      name: 'Devon Miles',
      handle: '@devon_visuals',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: false,
      bio: 'Architectural photographer & digital nomad.',
    },
    timestamp: '1h ago',
    content: 'Golden hour hitting the brutalist concrete structures in central Tokyo. Shot on 35mm film. The play of light and shadow here is unreal. 📸🎌',
    mediaUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80',
    tags: ['#Photography', '#Architecture', '#Tokyo'],
    metrics: {
      likes: 429,
      comments: 31,
      shares: 56,
      isLiked: false,
      isBookmarked: true,
    },
    commentsList: [
      {
        id: 'c-3',
        author: {
          name: 'Krono Community',
          handle: '@krono',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        },
        timestamp: '45m ago',
        content: 'Incredible composition Devon! Featured on the Explore page.',
      },
    ],
  },
  {
    id: 'post-3',
    author: {
      name: 'Alex Rivera',
      handle: '@arivera',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Systems engineer & privacy advocate.',
    },
    timestamp: '3h ago',
    content: 'Why chronological feeds matter: when users control what they see instead of opaque recommendation loops, communities naturally stay healthier, conversations stay grounded, and engagement is genuine.',
    tags: ['#SocialMedia', '#Privacy', '#OpenWeb'],
    metrics: {
      likes: 812,
      comments: 95,
      shares: 142,
      isLiked: true,
      isBookmarked: false,
    },
    commentsList: [
      {
        id: 'c-4',
        author: {
          name: 'Liam Foster',
          handle: '@liamf',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        },
        timestamp: '2h ago',
        content: '100% agreed. The chronologically sorted timeline is what made early Twitter and Mastodon so refreshing.',
      },
    ],
  },
  {
    id: 'post-4',
    author: {
      name: 'Maya Lin',
      handle: '@mayadesign',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      verified: true,
      bio: 'Lead product designer. Typography nerd.',
    },
    timestamp: '5h ago',
    content: 'Friendly reminder that whitespace is not empty space—it is breathing room for visual hierarchy. If a layout feels cramped, resist the urge to shrink typography; instead, give your margins space to breathe! 📐',
    tags: ['#Design', '#Typography', '#UIUX'],
    metrics: {
      likes: 560,
      comments: 42,
      shares: 88,
      isLiked: false,
      isBookmarked: false,
    },
  },
];

export const TRENDING_TOPICS: TrendingTopic[] = [
  { tag: '#OpenSource', postsCount: '14.2K posts', category: 'Technology' },
  { tag: '#WebDev', postsCount: '9.8K posts', category: 'Programming' },
  { tag: '#Photography', postsCount: '7.5K posts', category: 'Art & Design' },
  { tag: '#Architecture', postsCount: '4.1K posts', category: 'Culture' },
  { tag: '#Privacy', postsCount: '3.6K posts', category: 'Tech Policy' },
  { tag: '#Minimalism', postsCount: '2.9K posts', category: 'Lifestyle' },
];

export const SUGGESTED_USERS: SuggestedUser[] = [
  {
    id: 'user-1',
    name: 'Elena Vance',
    handle: '@elena_dev',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'UI designer & open source builder.',
    isFollowing: false,
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    handle: '@arivera',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Systems engineer & open web advocate.',
    isFollowing: true,
  },
  {
    id: 'user-3',
    name: 'Maya Lin',
    handle: '@mayadesign',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead product designer & typography lover.',
    isFollowing: false,
  },
];
