import React from 'react';
import { Post } from '../types';
import { UserAvatar } from './UserAvatar';
import { Bookmark, MessageSquare, Heart, Share2, ArrowLeft } from 'lucide-react';

interface BookmarksViewProps {
  bookmarkedPosts: Post[];
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onBackToFeed: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarkedPosts,
  onToggleLike,
  onToggleBookmark,
  onBackToFeed,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-glass-dark">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToFeed}
            className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Back to feed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              <span>Bookmarks</span>
            </h1>
            <p className="text-xs text-outline">
              {bookmarkedPosts.length} saved {bookmarkedPosts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        </div>
      </div>

      {/* Bookmarked list */}
      {bookmarkedPosts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-surface border border-border-glass-dark flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
            <Bookmark className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-semibold text-on-surface">No bookmarks yet</h2>
          <p className="text-xs text-outline max-w-sm">
            Save interesting posts by clicking the bookmark icon on any post in your feed to read them later.
          </p>
          <button
            onClick={onBackToFeed}
            className="mt-2 px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Explore Feed
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookmarkedPosts.map((post) => (
            <article
              key={post.id}
              className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3.5 transition-colors"
            >
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={post.author.avatar}
                    name={post.author.name}
                    size="md"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-on-surface">
                        {post.author.name}
                      </span>
                      {post.author.verified && (
                        <span className="text-[11px] text-primary font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-xs text-outline">
                      {post.author.handle} · {post.timestamp}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleBookmark(post.id)}
                  className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
                  title="Remove bookmark"
                >
                  <Bookmark className="w-4 h-4 fill-primary" />
                </button>
              </div>

              {/* Content */}
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Media */}
              {post.mediaUrl && (
                <div className="rounded-lg overflow-hidden border border-border-glass-dark max-h-96">
                  <img
                    src={post.mediaUrl}
                    alt="Post attachment"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border-glass-dark text-xs text-outline">
                <button
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer ${
                    post.metrics.isLiked ? 'text-red-500 font-medium' : ''
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.metrics.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>{post.metrics.likes}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.metrics.comments}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>{post.metrics.shares}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
