import React from 'react';
import { ViewMode, FeedFilter, TrendingTopic } from '../types';
import {
  Home,
  Users,
  Flame,
  Compass,
  Bookmark,
  User,
  Hash,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  feedFilter: FeedFilter;
  onFeedFilterChange: (filter: FeedFilter) => void;
  onSelectTag?: (tag: string) => void;
  trending?: TrendingTopic[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  feedFilter,
  onFeedFilterChange,
  onSelectTag,
  trending = [],
}) => {
  const topicsToDisplay = trending;
  return (
    <aside className="w-60 shrink-0 flex flex-col gap-6 select-none">
      {/* Primary Feeds */}
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-outline">
          Feeds
        </div>

        <button
          onClick={() => {
            onViewChange('feed');
            onFeedFilterChange('all');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'feed' && feedFilter === 'all'
              ? 'bg-surface-container text-on-surface font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Home className="w-4 h-4 text-primary" />
            <span>Home Feed</span>
          </div>
        </button>

        <button
          onClick={() => {
            onViewChange('feed');
            onFeedFilterChange('following');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'feed' && feedFilter === 'following'
              ? 'bg-surface-container text-on-surface font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-secondary" />
            <span>Following</span>
          </div>
        </button>

        <button
          onClick={() => {
            onViewChange('explore');
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'explore'
              ? 'bg-surface-container text-on-surface font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-primary" />
            <span>Explore</span>
          </div>
        </button>
      </div>

      {/* Library & Profile */}
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-outline">
          Library
        </div>

        <button
          onClick={() => onViewChange('bookmarks')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'bookmarks'
              ? 'bg-surface-container text-on-surface font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-secondary" />
            <span>Bookmarks</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange('profile')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'profile'
              ? 'bg-surface-container text-on-surface font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-tertiary" />
            <span>My Profile</span>
          </div>
        </button>
      </div>

      {/* Trending Topics Box */}
      <div className="p-3.5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-border-glass-dark">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Trending Now</span>
          </span>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          {topicsToDisplay.length === 0 ? (
            <span className="text-[11px] text-outline italic py-1">
              No trending hashtags yet
            </span>
          ) : (
            topicsToDisplay.slice(0, 5).map((topic) => (
              <button
                key={topic.tag}
                onClick={() => {
                  if (onSelectTag) {
                    onSelectTag(topic.tag);
                  } else {
                    onViewChange('explore');
                  }
                }}
                className="flex flex-col text-left group cursor-pointer"
              >
                <span className="text-on-surface font-semibold group-hover:text-primary transition-colors">
                  {topic.tag}
                </span>
                <span className="text-[10px] text-outline">{topic.postsCount}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Clean Open Source Note */}
      <div className="px-3 text-[11px] text-outline leading-relaxed">
        <p>An open-source, decentralized social network built for community.</p>
      </div>
    </aside>
  );
};
