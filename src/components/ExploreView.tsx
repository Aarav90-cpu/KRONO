import React, { useState } from 'react';
import { Search, Flame, Users, Sparkles, Heart, CheckCircle } from 'lucide-react';
import { Post, TrendingTopic, SuggestedUser, AuthUserProfile } from '../types';
import { UserAvatar } from './UserAvatar';

interface ExploreViewProps {
  posts?: Post[];
  trending?: TrendingTopic[];
  suggestedUsers?: SuggestedUser[];
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onSelectTag?: (tag: string) => void;
  currentUser?: AuthUserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'profile' | 'credentials' | '2fa') => void;
  onToggleFollow?: (user: SuggestedUser) => void;
  onViewPost?: (postId: string) => void;
  onSelectUserProfile?: (user: SuggestedUser) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts = [],
  trending = [],
  suggestedUsers = [],
  onNotify,
  onSelectTag,
  currentUser,
  onOpenAuthModal,
  onToggleFollow,
  onSelectUserProfile,
}) => {
  const [search, setSearch] = useState('');

  const filteredTopics = trending.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.tag.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  // Real community highlights based on actual posts with media
  const mediaPosts = posts.filter((p) => Boolean(p.mediaUrl));

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
            placeholder="Search trending hashtags, topics, and community content..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-border-glass-dark rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trending Topics & Real Media Highlights */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Trending Topics Grid */}
          <div className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Trending Discussions</span>
            </h2>

            {filteredTopics.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-surface-container-low border border-border-glass-dark flex flex-col items-center gap-2 text-outline">
                <Flame className="w-6 h-6 text-outline/40" />
                <p className="text-xs">
                  {search
                    ? `No trending hashtags matching "${search}".`
                    : 'No trending topics yet. Add #hashtags to your posts to start conversations!'}
                </p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Community Highlights (Real posts with media) */}
          <div className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Community Media Highlights</span>
            </h2>

            {mediaPosts.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-surface-container-low border border-border-glass-dark flex flex-col items-center gap-2 text-outline">
                <Sparkles className="w-6 h-6 text-primary/40" />
                <p className="text-xs">
                  No media posts yet. Share an update with a picture or artwork to see it featured here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onSelectTag && post.tags?.[0] && onSelectTag(post.tags[0])}
                    className="rounded-xl overflow-hidden border border-border-glass-dark bg-surface-container-low flex flex-col group cursor-pointer hover:border-primary/40 transition-all"
                  >
                    <div className="h-36 overflow-hidden bg-surface-container">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                      <p className="text-xs font-medium text-on-surface leading-snug line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-outline pt-2 border-t border-border-glass-dark">
                        <span className="font-semibold text-on-surface-variant">
                          {post.author.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-400" />
                          {post.metrics.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Community Members */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              <span>Community Members</span>
            </h2>

            {suggestedUsers.length === 0 ? (
              <div className="p-6 text-center rounded-lg bg-surface-container-low border border-border-glass-dark flex flex-col items-center gap-2 text-outline">
                <Users className="w-5 h-5 text-outline/40" />
                <p className="text-xs">
                  No other members registered yet. Be the first to build the community!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-start justify-between gap-3 pb-3 border-b border-border-glass-dark last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectUserProfile?.(user)}
                        className="hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                      >
                        <UserAvatar src={user.avatar} name={user.name} size="sm" />
                      </button>
                      <div className="flex flex-col min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelectUserProfile?.(user)}
                          className="text-left hover:text-primary transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-on-surface hover:text-primary transition-colors truncate block">
                            {user.name}
                          </span>
                        </button>
                        <div className="flex items-center gap-1.5 text-[11px] text-outline font-mono">
                          <span className="truncate">{user.handle}</span>
                          {typeof user.followersCount === 'number' && (
                            <>
                              <span>·</span>
                              <span className="font-sans font-medium text-outline">
                                {user.followersCount} {user.followersCount === 1 ? 'follower' : 'followers'}
                              </span>
                            </>
                          )}
                        </div>
                        {user.bio && (
                          <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onOpenAuthModal?.('signin');
                          onNotify('Sign In Required', 'Please sign in to follow members.', 'warning');
                          return;
                        }
                        if (onToggleFollow) {
                          onToggleFollow(user);
                        } else {
                          onNotify('Followed', `You are now following ${user.name}`, 'info');
                        }
                      }}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
