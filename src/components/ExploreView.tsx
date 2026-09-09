import React, { useState, useEffect } from 'react';
import {
  Search,
  Flame,
  Users,
  Sparkles,
  Heart,
  UserPlus,
  UserCheck,
  MapPin,
  Loader2,
  X,
  Compass,
} from 'lucide-react';
import { Post, TrendingTopic, SuggestedUser, AuthUserProfile } from '../types';
import { UserAvatar } from './UserAvatar';
import { searchCommunityUsers } from '../services/firestoreService';

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
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'topics' | 'media'>('all');
  const [searchedUsers, setSearchedUsers] = useState<SuggestedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Live user search effect
  useEffect(() => {
    let isMounted = true;
    const query = search.trim();

    const fetchUsers = async () => {
      setIsSearching(true);
      try {
        const results = await searchCommunityUsers(query, currentUser?.uid);
        if (isMounted) {
          // Merge with current suggestedUsers to retain follow status if known
          const merged = results.map((r) => {
            const existing = suggestedUsers.find((s) => s.id === r.id || s.handle.toLowerCase() === r.handle.toLowerCase());
            return existing ? { ...r, isFollowing: existing.isFollowing } : r;
          });
          setSearchedUsers(merged);
        }
      } catch (err) {
        console.warn('Explore user search error:', err);
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    // Debounce fast typing
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, currentUser?.uid, suggestedUsers]);

  // Filter topics
  const filteredTopics = trending.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.tag.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  // Media posts
  const mediaPosts = posts.filter((p) => {
    if (!p.mediaUrl) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.content.toLowerCase().includes(q) ||
      p.author.name.toLowerCase().includes(q) ||
      p.author.handle.toLowerCase().includes(q)
    );
  });

  // People to display
  const peopleToDisplay = search.trim() ? searchedUsers : (searchedUsers.length > 0 ? searchedUsers : suggestedUsers);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Search Header & Category Navigation */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border-glass-dark flex flex-col gap-4 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search signed-in people, @handles, topics, or posts..."
            className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low border border-border-glass-dark rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          ) : null}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low border border-border-glass-dark text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>All Explore</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('people')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'people'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low border border-border-glass-dark text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People</span>
            {peopleToDisplay.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'people' ? 'bg-white/20 text-white' : 'bg-surface text-outline'
              }`}>
                {peopleToDisplay.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'topics'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low border border-border-glass-dark text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Topics & Hashtags</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-low border border-border-glass-dark text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Media</span>
          </button>
        </div>
      </div>

      {/* DEDICATED PEOPLE TAB VIEW */}
      {activeTab === 'people' ? (
        <div className="p-5 rounded-2xl bg-surface border border-border-glass-dark flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Signed-in Community Members</span>
              <span className="text-xs text-outline font-normal">
                ({peopleToDisplay.length} {peopleToDisplay.length === 1 ? 'person' : 'people'})
              </span>
            </h2>
            {isSearching && (
              <div className="flex items-center gap-1.5 text-xs text-outline">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Searching...</span>
              </div>
            )}
          </div>

          {peopleToDisplay.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-surface-container-low border border-border-glass-dark flex flex-col items-center gap-2 text-outline">
              <Users className="w-8 h-8 text-outline/40" />
              <p className="text-sm font-semibold text-on-surface">No community members found</p>
              <p className="text-xs text-outline">
                {search
                  ? `No people matched "${search}". Try searching by display name or @username.`
                  : 'No community members registered yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {peopleToDisplay.map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-xl bg-surface-container-low border border-border-glass-dark hover:border-primary/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectUserProfile?.(user)}
                      className="hover:opacity-85 transition-opacity cursor-pointer shrink-0"
                    >
                      <UserAvatar src={user.avatar} name={user.name} size="md" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onSelectUserProfile?.(user)}
                        className="text-left font-bold text-xs sm:text-sm text-on-surface hover:text-primary transition-colors truncate block"
                      >
                        {user.name}
                      </button>
                      <span className="text-xs text-outline font-mono truncate block">
                        {user.handle}
                      </span>
                      {user.location && (
                        <div className="flex items-center gap-1 text-[11px] text-outline mt-0.5">
                          <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                          <span className="truncate">{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {user.bio && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {user.bio}
                    </p>
                  )}

                  <div className="pt-2 border-t border-border-glass-dark flex items-center justify-between gap-2">
                    <span className="text-[11px] text-outline font-mono">
                      {typeof user.followersCount === 'number' ? user.followersCount : 0} followers
                    </span>

                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onOpenAuthModal?.('signin');
                          onNotify('Sign In Required', 'Please sign in to follow members.', 'warning');
                          return;
                        }
                        if (onToggleFollow) {
                          onToggleFollow(user);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        user.isFollowing
                          ? 'border border-border-glass-dark text-on-surface hover:bg-surface-container'
                          : 'bg-primary text-white hover:opacity-90 shadow-sm'
                      }`}
                    >
                      {user.isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD ALL / TOPICS / MEDIA GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* If user typed a search query in All view, show matching people upfront! */}
            {search.trim() && peopleToDisplay.length > 0 && (
              <div className="p-5 rounded-2xl bg-surface border border-border-glass-dark flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>People Matching &ldquo;{search}&rdquo;</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('people')}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer"
                  >
                    View all ({peopleToDisplay.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {peopleToDisplay.slice(0, 4).map((user) => (
                    <div
                      key={user.id}
                      className="p-3 rounded-xl bg-surface-container-low border border-border-glass-dark flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelectUserProfile?.(user)}
                          className="hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                        >
                          <UserAvatar src={user.avatar} name={user.name} size="sm" />
                        </button>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onSelectUserProfile?.(user)}
                            className="text-left font-bold text-xs text-on-surface hover:text-primary transition-colors truncate block"
                          >
                            {user.name}
                          </button>
                          <span className="text-[11px] text-outline font-mono truncate block">
                            {user.handle}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onOpenAuthModal?.('signin');
                            onNotify('Sign In Required', 'Please sign in to follow members.', 'warning');
                            return;
                          }
                          if (onToggleFollow) onToggleFollow(user);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 cursor-pointer ${
                          user.isFollowing
                            ? 'border border-border-glass-dark text-on-surface'
                            : 'bg-primary text-white hover:opacity-90'
                        }`}
                      >
                        {user.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics Grid */}
            {activeTab !== 'media' && (
              <div className="p-5 rounded-2xl bg-surface border border-border-glass-dark flex flex-col gap-4">
                <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Trending Discussions</span>
                </h2>

                {filteredTopics.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-container-low border border-border-glass-dark flex flex-col items-center gap-2 text-outline">
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
                        className="p-3.5 rounded-xl bg-surface-container-low border border-border-glass-dark hover:border-primary/40 transition-all cursor-pointer flex justify-between items-center group"
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
            )}

            {/* Community Media Highlights */}
            {activeTab !== 'topics' && (
              <div className="p-5 rounded-2xl bg-surface border border-border-glass-dark flex flex-col gap-4">
                <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Community Media Highlights</span>
                </h2>

                {mediaPosts.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-container-low border border-border-glass-dark flex flex-col items-center gap-2 text-outline">
                    <Sparkles className="w-6 h-6 text-primary/40" />
                    <p className="text-xs">
                      {search
                        ? `No media posts matching "${search}".`
                        : 'No media posts yet. Share an update with a picture or artwork to see it featured here!'}
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
                            <span className="font-semibold text-on-surface-variant truncate">
                              {post.author.name}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
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
            )}
          </div>

          {/* Right Column: Community Members */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-surface border border-border-glass-dark flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary" />
                  <span>Community Members</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('people')}
                  className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              {peopleToDisplay.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-surface-container-low border border-border-glass-dark flex flex-col items-center gap-2 text-outline">
                  <Users className="w-5 h-5 text-outline/40" />
                  <p className="text-xs">
                    {search
                      ? `No members matching "${search}".`
                      : 'No other members registered yet. Be the first to build the community!'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {peopleToDisplay.slice(0, 8).map((user) => (
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
      )}
    </div>
  );
};
