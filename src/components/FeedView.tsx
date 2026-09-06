import React, { useState } from 'react';
import { FeedSubMode, FeedFilter, Post, PostComment } from '../types';
import {
  Clock,
  Flame,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Send,
  Image,
  Sparkles,
  Check,
  CheckCircle,
} from 'lucide-react';
import { TRENDING_TOPICS, SUGGESTED_USERS } from '../data/mockData';

interface FeedViewProps {
  posts: Post[];
  feedSubMode: FeedSubMode;
  onFeedSubModeChange: (mode: FeedSubMode) => void;
  feedFilter: FeedFilter;
  onFeedFilterChange: (filter: FeedFilter) => void;
  onAddPost: (post: Partial<Post>) => void;
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onSelectTag: (tag: string) => void;
  searchFilterQuery: string;
  onToggleBookmark: (postId: string) => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  feedSubMode,
  onFeedSubModeChange,
  feedFilter,
  onFeedFilterChange,
  onAddPost,
  onNotify,
  onSelectTag,
  searchFilterQuery,
  onToggleBookmark,
  onToggleLike,
  onAddComment,
}) => {
  const [composerText, setComposerText] = useState('');
  const [composerMediaUrl, setComposerMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    onAddPost({
      content: composerText.trim(),
      mediaUrl: composerMediaUrl.trim() || undefined,
      tags: ['#Community'],
    });

    setComposerText('');
    setComposerMediaUrl('');
    setShowMediaInput(false);
    onNotify('Post Published', 'Your update has been shared with your followers.', 'success');
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`https://krono.social/post/${postId}`);
    onNotify('Link Copied', 'Post URL copied to clipboard.', 'success');
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    onNotify('Comment Added', 'Your reply has been posted.', 'success');
  };

  // Filter posts based on search and feed filter
  const filteredPosts = posts.filter((p) => {
    if (searchFilterQuery) {
      const q = searchFilterQuery.toLowerCase();
      const matchText = p.content.toLowerCase().includes(q);
      const matchAuthor =
        p.author.name.toLowerCase().includes(q) || p.author.handle.toLowerCase().includes(q);
      const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchText && !matchAuthor && !matchTag) return false;
    }

    if (feedFilter === 'following') {
      return p.author.handle === '@elena_dev' || p.author.handle === '@arivera';
    }

    if (feedFilter === 'media') {
      return Boolean(p.mediaUrl);
    }

    return true;
  });

  // Sort by latest vs trending
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (feedSubMode === 'trending') {
      return b.metrics.likes + b.metrics.comments - (a.metrics.likes + a.metrics.comments);
    }
    return 0; // retain chronological order
  });

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
      {/* Center Feed Column */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        {/* Feed Controls Header */}
        <div className="p-3 sm:p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* SubMode Switcher */}
          <div className="flex items-center rounded-lg bg-surface-container p-0.5 text-xs">
            <button
              onClick={() => onFeedSubModeChange('latest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                feedSubMode === 'latest'
                  ? 'bg-surface text-on-surface font-semibold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => onFeedSubModeChange('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                feedSubMode === 'trending'
                  ? 'bg-surface text-on-surface font-semibold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Trending</span>
            </button>
          </div>

          {/* Feed Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'All Posts' },
              { id: 'following', label: 'Following' },
              { id: 'media', label: 'Media Only' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => onFeedFilterChange(f.id as FeedFilter)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  feedFilter === f.id
                    ? 'bg-surface-container text-on-surface font-semibold'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Post Composer Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3">
          <div className="flex gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ"
              alt="You"
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2.5">
              <textarea
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                rows={2}
                placeholder="What's happening in your corner of the web?"
                className="w-full bg-surface-container-low border border-border-glass-dark rounded-lg p-3 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 resize-none transition-colors"
              />

              {showMediaInput && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={composerMediaUrl}
                    onChange={(e) => setComposerMediaUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3 py-1.5 bg-surface-container-low border border-border-glass-dark rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(false)}
                    className="text-xs text-outline px-2 hover:text-on-surface"
                  >
                    Clear
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-outline pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      showMediaInput ? 'text-primary' : 'hover:text-on-surface'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    <span>Photo</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-outline">
                    {280 - composerText.length}
                  </span>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={!composerText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post List */}
        <div className="flex flex-col gap-3.5">
          {sortedPosts.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-surface border border-border-glass-dark flex flex-col items-center gap-3">
              <p className="text-sm text-outline">No posts match this filter.</p>
            </div>
          ) : (
            sortedPosts.map((post) => {
              const isCommentsOpen = Boolean(expandedComments[post.id]);
              const commentDraft = commentInputs[post.id] || '';

              return (
                <article
                  key={post.id}
                  className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3 transition-colors"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-on-surface">
                            {post.author.name}
                          </span>
                          {post.author.verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary/20" />
                          )}
                        </div>
                        <span className="text-xs text-outline">
                          {post.author.handle} · {post.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleBookmark(post.id)}
                      className="p-1.5 rounded-lg text-outline hover:text-primary transition-colors cursor-pointer"
                      title={post.metrics.isBookmarked ? 'Remove Bookmark' : 'Save to Bookmarks'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          post.metrics.isBookmarked ? 'fill-primary text-primary' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Media Attachment */}
                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-border-glass-dark max-h-[420px] bg-surface-container-low">
                      <img
                        src={post.mediaUrl}
                        alt="Post attachment"
                        className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => onSelectTag(tag)}
                          className="text-xs text-primary hover:underline cursor-pointer font-medium"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Social Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-glass-dark text-xs text-outline">
                    {/* Like Button */}
                    <button
                      onClick={() => onToggleLike(post.id)}
                      className={`flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-red-500/10 ${
                        post.metrics.isLiked ? 'text-red-500 font-medium' : ''
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          post.metrics.isLiked ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                      <span>{post.metrics.likes}</span>
                    </button>

                    {/* Comments Toggle */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-primary/10 ${
                        isCommentsOpen ? 'text-primary font-medium' : ''
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {(post.commentsList?.length || 0) + post.metrics.comments}
                      </span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 hover:text-secondary transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-secondary/10"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{post.metrics.shares}</span>
                    </button>
                  </div>

                  {/* Inline Comments Section */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-border-glass-dark flex flex-col gap-3 animate-in fade-in duration-150">
                      {/* Existing comments */}
                      {post.commentsList && post.commentsList.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                          {post.commentsList.map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-lg bg-surface-container-low flex gap-2.5 items-start text-xs"
                            >
                              <img
                                src={c.author.avatar}
                                alt={c.author.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                              />
                              <div className="flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-on-surface">
                                    {c.author.name}
                                  </span>
                                  <span className="text-[10px] text-outline">
                                    {c.timestamp}
                                  </span>
                                </div>
                                <p className="text-on-surface-variant mt-0.5 leading-normal">
                                  {c.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentDraft}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendComment(post.id);
                          }}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-1.5 bg-surface-container-low border border-border-glass-dark rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendComment(post.id)}
                          disabled={!commentDraft.trim()}
                          className="px-3 py-1.5 bg-primary-container text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Trending & Follow Suggestions */}
      <div className="hidden xl:flex xl:col-span-4 flex-col gap-5">
        {/* Trending Box */}
        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Trending Hashtags</span>
          </h3>

          <div className="flex flex-col gap-2">
            {TRENDING_TOPICS.map((topic) => (
              <button
                key={topic.tag}
                onClick={() => onSelectTag(topic.tag)}
                className="p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-left flex justify-between items-center group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface group-hover:text-primary transition-colors">
                    {topic.tag}
                  </span>
                  <span className="text-[10px] text-outline">{topic.category}</span>
                </div>
                <span className="text-[11px] font-mono text-outline">
                  {topic.postsCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Creators */}
        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Suggested People
          </h3>

          <div className="flex flex-col gap-3">
            {SUGGESTED_USERS.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-border-glass-dark last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-on-surface truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-outline truncate">
                      {user.handle}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onNotify('Followed', `You are now following ${user.name}`, 'info')
                  }
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-container hover:bg-primary-container hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
