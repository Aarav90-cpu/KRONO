import React, { useState } from 'react';
import { Search, Flame, Users, Sparkles, MessageSquare, Heart, CheckCircle, ExternalLink, Lock } from 'lucide-react';
import { TRENDING_TOPICS, SUGGESTED_USERS } from '../data/mockData';
import { SuggestedUser, AuthUserProfile } from '../types';

interface ExploreViewProps {
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onSelectTag?: (tag: string) => void;
  currentUser?: AuthUserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'profile' | 'credentials' | '2fa' | 'setup-guide') => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onNotify,
  onSelectTag,
  currentUser,
  onOpenAuthModal,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'Tech' | 'Programming' | 'Art & Design' | 'Culture'>('all');
  const [users, setUsers] = useState<SuggestedUser[]>(SUGGESTED_USERS);

  const categories = ['all', 'Tech', 'Programming', 'Art & Design', 'Culture'];

  const handleToggleFollow = (id: string, name: string) => {
    if (!currentUser) {
      onOpenAuthModal?.('signin');
      onNotify('Sign In Required', 'Following creators is reserved for verified members (13+). Please sign in.', 'warning');
      return;
    }
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = !u.isFollowing;
          onNotify(
            next ? `Following ${name}` : `Unfollowed ${name}`,
            next ? `You'll now see posts from ${name} in your Following feed.` : `Removed from your following feed.`,
            'info'
          );
          return { ...u, isFollowing: next };
        }
        return u;
      })
    );
  };

  const filteredTopics = TRENDING_TOPICS.filter((t) => {
    if (activeCategory !== 'all' && t.category !== activeCategory && !t.category.includes(activeCategory)) return false;
    if (search && !t.tag.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const featuredPosts = [
    {
      id: 'feat-1',
      title: 'Decentralized Social Networks: An Open Architectural Blueprint',
      author: '@elena_dev',
      category: 'Tech',
      likes: '1.2K',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'feat-2',
      title: 'Brutalist Architecture & Urban Photography in Tokyo',
      author: '@devon_visuals',
      category: 'Art & Design',
      likes: '890',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'feat-3',
      title: 'Minimalist Typography: Why Line-Height & Tracking Shape Readability',
      author: '@mayadesign',
      category: 'Culture',
      likes: '640',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Search Header */}
      <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Explore trending hashtags, articles, and community creators..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-border-glass-dark rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer capitalize whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary-container text-white font-semibold'
                  : 'bg-surface-container text-outline hover:text-on-surface'
              }`}
            >
              {cat === 'all' ? 'All Topics' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trending Topics & Stories */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Trending Topics Grid */}
          <div className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Trending Discussions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.tag}
                  onClick={() => onSelectTag && onSelectTag(topic.tag)}
                  className="p-3.5 rounded-lg bg-surface-container-low border border-border-glass-dark hover:border-primary/40 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] text-outline uppercase tracking-wider">
                      {topic.category}
                    </span>
                    <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {topic.tag}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-outline">
                    {topic.postsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Highlights Grid */}
          <div className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Community Highlights</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featuredPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl overflow-hidden border border-border-glass-dark bg-surface-container-low flex flex-col group cursor-pointer hover:border-primary/40 transition-all"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-primary uppercase">
                        {post.category}
                      </span>
                      <h3 className="text-xs font-bold text-on-surface leading-snug line-clamp-2 mt-0.5">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-border-glass-dark">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Suggested Creators */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span>Who to Follow</span>
            </h2>

            <div className="flex flex-col gap-3.5">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-start justify-between gap-3 pb-3 border-b border-border-glass-dark last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface">
                        {user.name}
                      </span>
                      <span className="text-[11px] text-outline">{user.handle}</span>
                      <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                        {user.bio}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFollow(user.id, user.name)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                      user.isFollowing
                        ? 'border border-border-glass-dark text-on-surface hover:bg-surface-container'
                        : 'bg-primary-container text-white hover:opacity-90'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
