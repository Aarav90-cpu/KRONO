import React, { useState } from 'react';
import { ViewMode } from '../types';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Check,
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCastModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  yieldBalance: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  isDark,
  onToggleTheme,
  onOpenCastModal,
  searchQuery,
  onSearchChange,
  yieldBalance,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Creator Reward Settled',
      desc: '+0.0048 SOL routed to your vault from @syn_01',
      time: '2m ago',
    },
    {
      id: 'notif-2',
      title: 'New Node Referral',
      desc: '3 new creators joined via your link (10% perpetual split)',
      time: '18m ago',
    },
    {
      id: 'notif-3',
      title: 'Campaign Delivery Milestone',
      desc: '10,000 verified impressions delivered for AI Inference campaign',
      time: '45m ago',
    },
  ];

  const navItems: { id: ViewMode; label: string }[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'explore', label: 'Explore' },
    { id: 'creator-hub', label: 'Creator Hub' },
    { id: 'ad-manager', label: 'Ad Manager' },
    { id: 'network-referral', label: 'Referrals' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border-glass-dark transition-colors duration-200">
      <div className="h-16 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => onViewChange('feed')}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
              K
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-on-surface font-sans">
                Krono
              </span>
              <span className="text-[11px] font-medium text-outline">
                Protocol
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-container text-on-surface font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Search input */}
        <div className="flex items-center flex-1 max-w-xs md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search creators, posts, tags..."
              className="w-full pl-9 pr-4 py-1.5 bg-surface-container-low border border-border-glass-dark rounded-lg text-on-surface text-xs placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subtle Yield Balance */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-surface-container border border-border-glass-dark select-none">
            <span className="text-outline">Yield:</span>
            <span className="text-secondary font-semibold">{yieldBalance}</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-tertiary" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* New Post Button */}
          <button
            onClick={onOpenCastModal}
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-secondary"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface border border-border-glass-dark p-3 shadow-lg z-50">
                <div className="flex items-center justify-between pb-2 border-b border-border-glass-dark">
                  <span className="font-semibold text-xs text-on-surface">
                    Notifications
                  </span>
                  <span className="text-[11px] text-secondary font-medium">3 new</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-on-surface">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-outline">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-normal">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center rounded-full ring-1 ring-border-glass-dark hover:ring-primary transition-all cursor-pointer"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-border-glass-dark p-3 shadow-lg z-50">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-border-glass-dark">
                  <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xs">
                    KO
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">krono.operator</span>
                    <span className="font-mono text-[10px] text-outline truncate">
                      0x71C9...88F1aC9
                    </span>
                  </div>
                </div>

                <div className="py-2 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between py-1 px-2 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">
                    <span>Node Status</span>
                    <span className="text-secondary font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between py-1 px-2 rounded bg-surface-container text-on-surface-variant font-mono text-[11px]">
                    <span>Protocol Split</span>
                    <span className="text-on-surface font-semibold">45 / 45 / 10</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around px-3 py-2 border-t border-border-glass-dark bg-surface overflow-x-auto text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              currentView === item.id
                ? 'bg-primary-container text-white font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
