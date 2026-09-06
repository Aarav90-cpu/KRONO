import React, { useState } from 'react';
import {
  FeedSubMode,
  FeedFilter,
  CreatorPost,
  HyperlocalDrop,
} from '../types';
import {
  Clock,
  Sparkles,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Code,
  Radio,
  Copy,
  Check,
  Send,
  ExternalLink,
  TrendingUp,
  Flame,
  Users,
} from 'lucide-react';

interface FeedViewProps {
  posts: CreatorPost[];
  feedSubMode: FeedSubMode;
  onFeedSubModeChange: (mode: FeedSubMode) => void;
  feedFilter: FeedFilter;
  onFeedFilterChange: (filter: FeedFilter) => void;
  onOpenRemixModal: () => void;
  onOpenDecryptModal: (drop?: HyperlocalDrop) => void;
  onAddPost: (post: Partial<CreatorPost>) => void;
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onSelectTag: (tag: string) => void;
  searchFilterQuery: string;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  feedSubMode,
  onFeedSubModeChange,
  feedFilter,
  onFeedFilterChange,
  onOpenRemixModal,
  onOpenDecryptModal,
  onAddPost,
  onNotify,
  onSelectTag,
  searchFilterQuery,
}) => {
  const [composerText, setComposerText] = useState('');
  const [allowRemix, setAllowRemix] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<string, { count: number; liked: boolean }>>({
    'post-1': { count: 1429, liked: false },
    'post-2': { count: 642, liked: false },
    'post-3': { count: 894, liked: false },
  });

  const handleToggleLike = (postId: string) => {
    setPostLikes((prev) => {
      const current = prev[postId] || { count: 100, liked: false };
      const nextLiked = !current.liked;
      return {
        ...prev,
        [postId]: {
          count: nextLiked ? current.count + 1 : current.count - 1,
          liked: nextLiked,
        },
      };
    });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;

    onAddPost({
      content: composerText.trim(),
    });
    setComposerText('');
    onNotify('Post Published', 'Your signal has been shared to the network.', 'success');
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText('https://krono.xyz/ref/0x4F92');
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
    onNotify('Referral Link Copied', 'Share to earn 10% perpetual protocol split.', 'success');
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (searchFilterQuery) {
      const q = searchFilterQuery.toLowerCase();
      const matchText = p.content.toLowerCase().includes(q);
      const matchAuthor = p.author.name.toLowerCase().includes(q) || p.author.handle.toLowerCase().includes(q);
      if (!matchText && !matchAuthor) return false;
    }
    if (feedFilter === 'following') return !p.isSponsored;
    if (feedFilter === 'hyperlocal') return p.isEphemeralDrop;
    if (feedFilter === 'circles') return p.author.verified;
    return true;
  });

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
      {/* Center Feed Column */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        {/* Feed Sub-Header */}
        <div className="p-3 sm:p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Chronological vs Viral switcher */}
          <div className="flex items-center rounded-lg bg-surface-container p-0.5 text-xs">
            <button
              onClick={() => onFeedSubModeChange('chrono')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                feedSubMode === 'chrono'
                  ? 'bg-surface text-on-surface font-semibold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chronological</span>
            </button>
            <button
              onClick={() => onFeedSubModeChange('viral')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                feedSubMode === 'viral'
                  ? 'bg-surface text-on-surface font-semibold shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span>Featured</span>
            </button>
          </div>

          {/* Sub Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'following', label: 'Following' },
              { id: 'hyperlocal', label: 'Local Drops' },
              { id: 'circles', label: 'Verified' },
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
                placeholder="Share your thoughts, code, or media with the network..."
                className="w-full bg-surface-container-low border border-border-glass-dark rounded-lg p-3 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50 resize-none transition-colors"
              />

              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-outline pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenRemixModal()}
                    className="flex items-center gap-1 hover:text-on-surface transition-colors cursor-pointer"
                    title="Attach Shader Node"
                  >
                    <Code className="w-4 h-4 text-primary" />
                    <span>Attach Node</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTag('#HyperLocalBeacon')}
                    className="flex items-center gap-1 hover:text-on-surface transition-colors cursor-pointer"
                    title="Add Location Beacon"
                  >
                    <Radio className="w-4 h-4 text-secondary" />
                    <span>Beacon</span>
                  </button>
                  <label className="hidden sm:flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={allowRemix}
                      onChange={(e) => setAllowRemix(e.target.checked)}
                      className="rounded text-primary focus:ring-0"
                    />
                    <span>Allow remix</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-secondary font-medium">
                    Earns ~45% split
                  </span>
                  <button
                    type="button"
                    onClick={handleBroadcast}
                    disabled={!composerText.trim()}
                    className="px-4 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post List */}
        <div className="flex flex-col gap-3">
          {filteredPosts.map((post) => {
            const likeState = postLikes[post.id] || { count: post.metrics.likes, liked: false };

            // Sponsored Post Card
            if (post.isSponsored && post.sponsorDetails) {
              return (
                <div
                  key={post.id}
                  className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-on-surface">
                            {post.author.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">
                            Sponsored
                          </span>
                        </div>
                        <span className="text-[11px] text-outline">
                          {post.sponsorDetails.tagline}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-outline">
                      45/45/10 ad split
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-border-glass-dark">
                      <img
                        src={post.mediaUrl}
                        alt="Media"
                        className="w-full h-48 sm:h-56 object-cover"
                      />
                      <div className="p-3 bg-surface-container flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-on-surface">
                            {post.sponsorDetails.ctaHeadline}
                          </span>
                          <span className="text-[10px] text-outline">
                            {post.sponsorDetails.impressions} impressions
                          </span>
                        </div>
                        <button
                          onClick={() => onNotify('Campaign Action', 'Connected to advertiser link.', 'success')}
                          className="px-3 py-1 rounded-md bg-secondary text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          {post.sponsorDetails.ctaText}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-glass-dark text-outline text-xs">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        likeState.liked ? 'text-secondary font-medium' : 'hover:text-on-surface'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likeState.liked ? 'fill-secondary' : ''}`} />
                      <span>{likeState.count}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.metrics.comments}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Ephemeral / Radar Drop Card
            if (post.isEphemeralDrop && post.ephemeralDetails) {
              return (
                <div
                  key={post.id}
                  className="p-4 sm:p-5 rounded-xl bg-surface border border-secondary/30 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-on-surface">
                            {post.author.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-semibold">
                            Local Drop
                          </span>
                        </div>
                        <span className="text-[11px] text-outline">
                          Within {post.ephemeralDetails.distance}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-tertiary font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.ephemeralDetails.timeLeft} left
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container text-xs">
                    <span className="text-on-surface-variant">
                      {post.ephemeralDetails.peersNearby} nearby creators verified
                    </span>
                    <button
                      onClick={() => onOpenDecryptModal()}
                      className="px-3.5 py-1.5 rounded-md bg-secondary text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Unlock Drop
                    </button>
                  </div>
                </div>
              );
            }

            // Standard Post
            return (
              <div
                key={post.id}
                className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3 hover:border-outline/40 transition-colors"
              >
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-on-surface">
                          {post.author.name}
                        </span>
                        <span className="text-[11px] text-outline">
                          {post.author.handle}
                        </span>
                      </div>
                      <span className="text-[10px] text-outline">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-medium text-secondary">
                    {post.earnedAmount}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {post.content}
                </p>

                {/* Media */}
                {post.mediaUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-border-glass-dark group">
                    <img
                      src={post.mediaUrl}
                      alt="Post visual"
                      className="w-full h-52 sm:h-60 object-cover"
                    />
                    {post.shaderBadge && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px] flex items-center gap-1">
                        <Code className="w-3 h-3 text-secondary" />
                        <span>{post.shaderBadge.nodeId}</span>
                      </div>
                    )}
                    <div className="absolute bottom-2.5 right-2.5">
                      <button
                        onClick={onOpenRemixModal}
                        className="px-3 py-1 rounded-md bg-surface/90 hover:bg-surface text-on-surface text-xs font-medium backdrop-blur-sm shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        <span>Remix</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border-glass-dark text-outline text-xs">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      likeState.liked ? 'text-secondary font-medium' : 'hover:text-on-surface'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likeState.liked ? 'fill-secondary' : ''}`} />
                    <span>{likeState.count}</span>
                  </button>

                  <button
                    onClick={() => onNotify('Comments', 'Viewing comments for this post.', 'info')}
                    className="flex items-center gap-1.5 hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.metrics.comments}</span>
                  </button>

                  <button
                    onClick={onOpenRemixModal}
                    className="flex items-center gap-1.5 text-secondary hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{post.metrics.remixes} remixes</span>
                  </button>

                  <button
                    onClick={() => onNotify('Saved', 'Post saved to your bookmarks.', 'info')}
                    className="hover:text-on-surface transition-colors cursor-pointer"
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Referrals & Trending */}
      <div className="xl:col-span-4 flex flex-col gap-4 select-none">
        {/* Referral Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-secondary" />
              10% Perpetual Referral Royalty
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Invite creators and nodes to earn 10% on every ad impression and protocol transaction they generate.
          </p>

          <div className="p-2 rounded-lg bg-surface-container border border-border-glass-dark flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-on-surface truncate">
              krono.xyz/ref/0x4F92
            </span>
            <button
              onClick={handleCopyRef}
              className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer shrink-0"
              title="Copy referral link"
            >
              {copiedRef ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-lg bg-surface-container-low flex flex-col">
              <span className="text-[11px] text-outline">Active Referrals</span>
              <span className="font-semibold text-on-surface">48 Nodes</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low flex flex-col">
              <span className="text-[11px] text-outline">Total Earned</span>
              <span className="font-semibold text-secondary">+$318.40</span>
            </div>
          </div>
        </div>

        {/* Top Earners */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Top Creators (24h)
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {[
              {
                rank: '1',
                name: 'sora.ambient',
                views: '412k views',
                payout: '$4.8k',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDt8Vk98MvDiqn3rVYrdZXwA1lMA0zCQKUFAhJun508ZcyeUNCpXt2ckurZhmQpsyadAnYOpGc0NTQU3jUFPjRkmHUaGLUqbWKtNLQd-RfKVeYRjHj8z2FEKn4VGFA0zUfCD2CQTTginW5_4ZaAIIqHcuuA6taWAcx8jEcVe0chICpionWNrA-XncOyp4E_nmcZ_fL1TmEl8r1-J4mOU8iev25zFx2jQHinAyr6rnBTYMkvHI5WyaS77g',
              },
              {
                rank: '2',
                name: 'zer0_gravity',
                views: '298k views',
                payout: '$3.9k',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6NXtA5Y-K4R_PtlX1b5hR9wD5wNtA_lJpPStZ3zbNV-NjjDbhwnJJiHu6-j5QcUSy-M5n6smkSBUVFAnwQQT8e6EMdAHl0_h9ZK_Isr2yJJ_Ewbrq6lcrh1knmWxSymSaebMlTfaNSARDH1sOb-z1sXsO1Rn0Bsm8UooYBc9Z_zk0zsEnS4B46le78PyQXRIG29IMC3mSy2mD5_Fwd9mMRnyLgXxibwTS2Hn__fnRVQhsGsdrHMgrHQ',
              },
              {
                rank: '3',
                name: 'kroma_void',
                views: '219k views',
                payout: '$3.1k',
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6Jus_DM3mlSYZgJCgsmgad-8Zy9o1ZSPMUAIR_KrtsDSVngeKp22lWUjDDQTI9bp_bky0hjqhMUtUWG8hUKMklToSK0gg7oN6dXUUNnc04arjyVKMF9sJ-cTS7N9Eq3SvD93jDfs06QYeNbJm0Q2ZEgFuwp8ACATBB7SEA7lfMTbBmL86VuBxiSXvwn7Wl0lC6pNqKEZI6xocKUeeMxGumkfrrfnW3UYc70G_OKuAiLdF6_nLGGugBg',
              },
            ].map((earner) => (
              <div
                key={earner.rank}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-outline font-medium w-3">{earner.rank}</span>
                  <img
                    src={earner.avatar}
                    alt={earner.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-on-surface">{earner.name}</span>
                    <span className="text-[10px] text-outline">{earner.views}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-secondary">{earner.payout}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-tertiary" />
            Trending Topics
          </span>

          <div className="flex flex-col gap-1.5 text-xs">
            {[
              { tag: '#DecentralizedAI', count: '14.2k' },
              { tag: '#HyperLocalBeacon', count: '9.8k' },
              { tag: '#WebGLPipelines', count: '7.1k' },
              { tag: '#ZeroKnowledge', count: '5.4k' },
            ].map((item) => (
              <button
                key={item.tag}
                onClick={() => onSelectTag(item.tag)}
                className="flex items-center justify-between p-1.5 rounded-md hover:bg-surface-container transition-colors text-left cursor-pointer"
              >
                <span className="text-primary font-medium">{item.tag}</span>
                <span className="text-[11px] text-outline">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
