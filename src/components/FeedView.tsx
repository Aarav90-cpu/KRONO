import React, { useState, useRef } from 'react';
import { FeedSubMode, FeedFilter, Post, AuthUserProfile, TrendingTopic, SuggestedUser } from '../types';
import { UserAvatar } from './UserAvatar';
import { PostMedia } from './PostMedia';
import { FormattedContent } from './FormattedContent';
import { extractPostImage } from '../utils/mediaUtils';
import {
  Clock,
  Flame,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Send,
  Image,
  Upload,
  X,
  CheckCircle,
  KeyRound,
  Eye,
  Repeat2,
  Quote,
  UserPlus,
  UserCheck,
} from 'lucide-react';

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
  onToggleRepost: (postId: string) => void;
  onQuotePost: (post: Post) => void;
  onAddComment: (postId: string, commentText: string) => void;
  currentUser?: AuthUserProfile | null;
  onOpenAuthModal?: (tab?: 'signin' | 'profile' | 'credentials' | '2fa') => void;
  trending?: TrendingTopic[];
  suggestedUsers?: SuggestedUser[];
  followedHandles?: string[];
  onToggleFollow?: (user: SuggestedUser) => void;
  onSelectUserProfile?: (user: SuggestedUser) => void;
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
  onToggleRepost,
  onQuotePost,
  onAddComment,
  currentUser,
  onOpenAuthModal,
  trending = [],
  suggestedUsers = [],
  followedHandles = [],
  onToggleFollow,
  onSelectUserProfile,
}) => {
  const [composerText, setComposerText] = useState('');
  const [composerMediaUrl, setComposerMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeRepostMenu, setActiveRepostMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('Invalid File', 'Please select an image file (PNG, JPG, WebP, GIF).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setComposerMediaUrl(dataUrl);
      setShowMediaInput(true);
      onNotify('Photo Attached', 'Image ready to publish with your post.', 'info');
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            setComposerMediaUrl(reader.result as string);
            setShowMediaInput(true);
            onNotify('Photo Pasted', 'Pasted image attached to post.', 'info');
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() && !composerMediaUrl.trim()) return;

    // Extract hashtags dynamically from text if present
    const extractedTags = composerText.match(/#([a-zA-Z0-9_\u0080-\uFFFF]+)/g) || [];

    // Auto-detect image from text if composerMediaUrl is empty
    let finalMedia = composerMediaUrl.trim() || undefined;
    if (!finalMedia) {
      const detected = extractPostImage(composerText);
      if (detected) finalMedia = detected;
    }

    onAddPost({
      content: composerText.trim(),
      mediaUrl: finalMedia,
      tags: extractedTags,
    });

    setComposerText('');
    setComposerMediaUrl('');
    setShowMediaInput(false);
    onNotify('Post Published', 'Your update has been shared.', 'success');
  };

  const handleShare = (postId: string) => {
    const shareUrl = `https://krono-social.duckdns.org/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
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
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
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
      if (!followedHandles || followedHandles.length === 0) return false;
      return (
        followedHandles.includes(p.author.handle) ||
        (p.author.id ? followedHandles.includes(p.author.id) : false)
      );
    }

    if (feedFilter === 'media') {
      return Boolean(p.mediaUrl || extractPostImage(p.content, p.mediaUrl));
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

        {/* Guest Mode Notice Banner */}
        {!currentUser && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-surface border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Eye className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface text-sm">Browsing as Guest</span>
                  <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded-full border border-border-glass-dark text-outline font-semibold">
                    Read-Only Mode
                  </span>
                </div>
                <p className="text-outline text-xs leading-relaxed">
                  You can explore public feeds, search topics, and read replies freely. To <strong>like, comment, post, and bookmark</strong>, sign in with Google (must be 13 or older).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuthModal?.('signin')}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In (13+)</span>
            </button>
          </div>
        )}

        {/* Post Composer Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3 shadow-xs">
          <div className="flex gap-3 items-start">
            <UserAvatar
              src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=krono_tester'}
              name={currentUser?.name || 'Krono Member'}
              size="sm"
            />
            <div className="flex-1 flex flex-col gap-2.5">
              <textarea
                value={composerText}
                onChange={(e) => {
                  setComposerText(e.target.value);
                  // Auto-detect image URL in text if mediaUrl not set yet
                  if (!composerMediaUrl) {
                    const detected = extractPostImage(e.target.value);
                    if (detected) {
                      setComposerMediaUrl(detected);
                      setShowMediaInput(true);
                    }
                  }
                }}
                onPaste={handlePaste}
                rows={2}
                placeholder={
                  currentUser
                    ? `What's on your mind, ${currentUser.name.split(' ')[0]}?`
                    : "What's happening? (Drop a thought or paste an image link...)"
                }
                className="w-full bg-surface-container-low border border-border-glass-dark rounded-lg p-3 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 resize-none transition-colors"
              />

              {/* Hidden File Input for Image Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Image Attachment Preview */}
              {composerMediaUrl && (
                <div className="relative rounded-xl overflow-hidden border border-border-glass-dark bg-surface-container-low max-h-60 w-full flex items-center justify-center group">
                  <img
                    src={composerMediaUrl}
                    alt="Attachment preview"
                    className="w-full h-auto max-h-60 object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => {
                      onNotify('Preview Issue', 'The image link could not be loaded directly.', 'warning');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setComposerMediaUrl('');
                      setShowMediaInput(false);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white shadow-md cursor-pointer transition-colors"
                    title="Remove attached photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {showMediaInput && !composerMediaUrl && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={composerMediaUrl}
                    onChange={(e) => setComposerMediaUrl(e.target.value)}
                    placeholder="Paste image URL (https://... or .png/.jpg/.gif)"
                    className="flex-1 px-3 py-1.5 bg-surface-container-low border border-border-glass-dark rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-surface-container border border-border-glass-dark rounded-lg text-xs text-on-surface flex items-center gap-1.5 hover:border-primary cursor-pointer transition-colors"
                    title="Upload image from computer"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>Browse</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(false)}
                    className="text-xs text-outline px-2 hover:text-on-surface cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-outline pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${
                      showMediaInput || composerMediaUrl ? 'text-primary font-medium' : 'hover:text-on-surface'
                    }`}
                  >
                    <Image className="w-4 h-4" />
                    <span>{composerMediaUrl ? 'Photo Attached' : 'Add Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-outline" />
                    <span>Upload</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-outline">
                    {280 - composerText.length}
                  </span>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={!composerText.trim() && !composerMediaUrl.trim()}
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
              const isAuthorFollowed = followedHandles.includes(post.author.handle);
              const isOwnPost = currentUser && post.author.handle === currentUser.username;

              return (
                <article
                  key={post.id}
                  className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3 transition-colors relative"
                >
                  {/* Repost Header Banner if this is a repost */}
                  {post.repost && (
                    <div className="flex items-center gap-2 text-xs text-outline font-medium px-0.5 pb-1 border-b border-border-glass-dark/60">
                      <Repeat2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {currentUser && post.repost.reposterId === currentUser.uid
                          ? 'You reposted'
                          : `${post.repost.reposterName} reposted`}
                      </span>
                      <span className="text-[11px] text-outline font-mono">· {post.repost.timestamp}</span>
                    </div>
                  )}

                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectUserProfile) {
                          onSelectUserProfile({
                            id: post.author.id || post.author.handle,
                            name: post.author.name,
                            handle: post.author.handle,
                            avatar: post.author.avatar,
                            bio: post.author.bio || '',
                          });
                        }
                      }}
                      className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity cursor-pointer group flex-1 min-w-0"
                    >
                      <UserAvatar src={post.author.avatar} name={post.author.name} size="md" />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                            {post.author.name}
                          </span>
                          {post.author.verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary/20 shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-outline font-mono truncate">
                          {post.author.handle} · {post.timestamp}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Follow / Unfollow Button for other users */}
                      {currentUser && !isOwnPost && onToggleFollow && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFollow({
                              id: post.author.id || post.author.handle,
                              name: post.author.name,
                              handle: post.author.handle,
                              avatar: post.author.avatar,
                              bio: post.author.bio || '',
                            });
                          }}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                            isAuthorFollowed
                              ? 'bg-surface-container border border-border-glass-dark text-outline hover:text-red-400 hover:border-red-400/30'
                              : 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
                          }`}
                          title={isAuthorFollowed ? `Unfollow ${post.author.name}` : `Follow ${post.author.name}`}
                        >
                          {isAuthorFollowed ? (
                            <>
                              <UserCheck className="w-3 h-3 text-primary" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Bookmark Icon */}
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
                  </div>

                  {/* Post Content with clickable links, hashtags, and mentions */}
                  <FormattedContent
                    content={post.content}
                    onTagClick={onSelectTag}
                    className="text-xs sm:text-sm text-on-surface leading-relaxed"
                  />

                  {/* Embedded Quoted Post Card if present */}
                  {post.quotedPost && (
                    <div className="p-3 rounded-xl border border-border-glass-dark bg-surface-container-low/60 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={post.quotedPost.author.avatar}
                          name={post.quotedPost.author.name}
                          size="xs"
                        />
                        <span className="text-xs font-semibold text-on-surface">
                          {post.quotedPost.author.name}
                        </span>
                        {post.quotedPost.author.verified && (
                          <CheckCircle className="w-3 h-3 text-primary fill-primary/20 shrink-0" />
                        )}
                        <span className="text-[11px] text-outline font-mono">
                          {post.quotedPost.author.handle} · {post.quotedPost.timestamp}
                        </span>
                      </div>
                      <FormattedContent
                        content={post.quotedPost.content}
                        onTagClick={onSelectTag}
                        className="text-xs text-on-surface leading-relaxed"
                      />
                      {(() => {
                        const quotedImg = extractPostImage(post.quotedPost.content, post.quotedPost.mediaUrl);
                        return quotedImg ? (
                          <PostMedia
                            src={quotedImg}
                            alt="Quoted attachment"
                            maxHeightClass="max-h-48"
                          />
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* Media Attachment (supports attached media or in-text image link) */}
                  {(() => {
                    const postImg = extractPostImage(post.content, post.mediaUrl);
                    return postImg ? (
                      <PostMedia
                        src={postImg}
                        alt={`Attachment by ${post.author.name}`}
                      />
                    ) : null;
                  })()}

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
                        {post.commentsList && post.commentsList.length > 0
                          ? post.commentsList.length
                          : (post.metrics.comments || 0)}
                      </span>
                    </button>

                    {/* Repost & Quote Button with Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (!currentUser && onOpenAuthModal) {
                            onOpenAuthModal('signin');
                            return;
                          }
                          setActiveRepostMenu(activeRepostMenu === post.id ? null : post.id);
                        }}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                          post.metrics.isReposted
                            ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                            : 'hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title="Repost or Quote"
                      >
                        <Repeat2 className="w-4 h-4" />
                        <span>{post.metrics.shares}</span>
                      </button>

                      {activeRepostMenu === post.id && (
                        <div className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl bg-surface border border-border-glass-dark p-1.5 shadow-xl z-20 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRepostMenu(null);
                              onToggleRepost(post.id);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer"
                          >
                            <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{post.metrics.isReposted ? 'Undo Repost' : 'Repost'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRepostMenu(null);
                              onQuotePost(post);
                            }}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer"
                          >
                            <Quote className="w-3.5 h-3.5 text-primary" />
                            <span>Quote Post</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 hover:text-secondary transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-secondary/10"
                      title="Copy Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={() => onToggleBookmark(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                        post.metrics.isBookmarked
                          ? 'text-primary bg-primary/10 font-semibold'
                          : 'hover:text-primary hover:bg-primary/10'
                      }`}
                      title={post.metrics.isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          post.metrics.isBookmarked ? 'fill-primary text-primary' : ''
                        }`}
                      />
                      <span>{post.metrics.isBookmarked ? 'Saved' : 'Bookmark'}</span>
                    </button>
                  </div>

                  {/* Inline Comments Section */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-border-glass-dark flex flex-col gap-3 animate-in fade-in duration-150">
                      {/* Existing comments */}
                      {post.commentsList && post.commentsList.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {post.commentsList.map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-lg bg-surface-container-low flex gap-2.5 items-start text-xs"
                            >
                              <UserAvatar src={c.author.avatar} name={c.author.name} size="xs" />
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
                      ) : (
                        <div className="py-2.5 text-center text-xs text-outline italic">
                          No replies yet. Start the conversation below!
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex flex-col gap-1.5">
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
                            placeholder={currentUser ? 'Write a reply...' : 'Write a reply as Krono Member...'}
                            className="flex-1 px-3 py-1.5 bg-surface-container-low border border-border-glass-dark rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendComment(post.id)}
                            disabled={!commentDraft.trim()}
                            className="px-3.5 py-1.5 bg-primary-container text-white text-xs font-semibold rounded-lg hover:opacity-90 disabled:opacity-40 cursor-pointer transition-opacity"
                          >
                            Reply
                          </button>
                        </div>
                        {!currentUser && (
                          <span className="text-[10px] text-outline px-1">
                            Posting as guest. <button type="button" onClick={() => onOpenAuthModal?.('signin')} className="text-primary hover:underline cursor-pointer">Sign In</button> to link your Google profile.
                          </span>
                        )}
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
            {trending.length === 0 ? (
              <p className="text-xs text-outline italic py-2">
                No trending hashtags yet. Include #hashtags in your posts to start a topic.
              </p>
            ) : (
              trending.map((topic) => (
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
              ))
            )}
          </div>
        </div>

        {/* Suggested Members */}
        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Community Members
          </h3>

          <div className="flex flex-col gap-3">
            {suggestedUsers.length === 0 ? (
              <p className="text-xs text-outline italic py-2">
                No other members yet. Invite friends or publish updates to connect with the community.
              </p>
            ) : (
              suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-border-glass-dark last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar src={user.avatar} name={user.name} size="sm" />
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
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuthModal?.('signin');
                        onNotify('Sign In Required', 'Please sign in to follow community members.', 'warning');
                        return;
                      }
                      if (onToggleFollow) {
                        onToggleFollow(user);
                      } else {
                        onNotify('Followed', `You are now following ${user.name}`, 'info');
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                      user.isFollowing
                        ? 'border border-border-glass-dark text-on-surface hover:bg-surface-container'
                        : 'bg-primary-container text-white hover:opacity-90'
                    }`}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
