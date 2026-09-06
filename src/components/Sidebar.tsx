import React from 'react';
import { ViewMode, FeedFilter } from '../types';
import {
  Clock,
  Zap,
  Lock,
  Grid,
  Coins,
  Server,
  Activity,
  ShieldCheck,
  Compass,
  Users,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  feedFilter: FeedFilter;
  onFeedFilterChange: (filter: FeedFilter) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  feedFilter,
  onFeedFilterChange,
}) => {
  return (
    <aside className="w-60 shrink-0 flex flex-col gap-6 select-none">
      {/* Navigation */}
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-outline">
          Streams
        </div>

        <button
          onClick={() => {
            onViewChange('feed');
            onFeedFilterChange('all');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'feed' && feedFilter === 'all'
              ? 'bg-surface-container text-on-surface font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-primary" />
            <span>All Posts</span>
          </div>
        </button>

        <button
          onClick={() => {
            onViewChange('feed');
            onFeedFilterChange('following');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'feed' && feedFilter === 'following'
              ? 'bg-surface-container text-on-surface font-semibold'
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
            onViewChange('feed');
            onFeedFilterChange('hyperlocal');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'feed' && feedFilter === 'hyperlocal'
              ? 'bg-surface-container text-on-surface font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-tertiary" />
            <span>Local Drops</span>
          </div>
        </button>

        <button
          onClick={() => {
            onViewChange('explore');
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'explore'
              ? 'bg-surface-container text-on-surface font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-primary" />
            <span>Media Matrix</span>
          </div>
        </button>
      </div>

      {/* Protocol Sections */}
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-outline">
          Management
        </div>

        <button
          onClick={() => onViewChange('creator-hub')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'creator-hub'
              ? 'bg-surface-container text-on-surface font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-secondary" />
            <span>Creator Hub</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange('ad-manager')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'ad-manager'
              ? 'bg-surface-container text-on-surface font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-primary" />
            <span>Ad Manager</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange('network-referral')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            currentView === 'network-referral'
              ? 'bg-surface-container text-on-surface font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-tertiary" />
            <span>Referrals & Nodes</span>
          </div>
        </button>
      </div>

      {/* 45/45/10 Protocol Split Card */}
      <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-glass-dark flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
            Revenue Split
          </span>
          <span className="text-[11px] font-mono font-medium text-secondary">45/45/10</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between text-on-surface">
            <span>Creators</span>
            <span className="font-semibold text-secondary">45%</span>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full" style={{ width: '45%' }}></div>
          </div>

          <div className="flex justify-between text-on-surface mt-1">
            <span>Relay Nodes</span>
            <span className="font-semibold text-primary">45%</span>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '45%' }}></div>
          </div>

          <div className="flex justify-between text-on-surface mt-1">
            <span>Referrers</span>
            <span className="font-semibold text-tertiary">10%</span>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-tertiary rounded-full" style={{ width: '10%' }}></div>
          </div>
        </div>

        <div className="pt-2 border-t border-border-glass-dark text-[11px] text-outline text-center">
          100% direct revenue distribution
        </div>
      </div>
    </aside>
  );
};
