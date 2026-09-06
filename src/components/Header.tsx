import React, { useState } from 'react';
import { ViewMode } from '../types';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Bookmark,
  User,
  Heart,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCreatePostModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  isDark,
  onToggleTheme,
  onOpenCreatePostModal,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Elena Vance liked your post',
      desc: '"Just launched our open source component kit! ✨"',
      time: '5m ago',
      icon: Heart,
    },
    {
      id: 'notif-2',
      title: 'Alex Rivera commented',
      desc: '"100% agreed with your perspective on feed algorithms."',
      time: '30m ago',
      icon: MessageSquare,
    },
    {
      id: 'notif-3',
      title: 'Devon Miles started following you',
      desc: 'Architectural photographer & digital nomad.',
      time: '2h ago',
      icon: User,
    },
  ];

  const navItems: { id: ViewMode; label: string }[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'explore', label: 'Explore' },
    { id: 'bookmarks', label: 'Bookmarks' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border-glass-dark transition-colors duration-200">
      <div className="h-16 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand & Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => onViewChange('feed')}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
              K
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-on-surface font-sans">
                KRONO
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Open Social
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-surface-container text-on-surface'
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
              placeholder="Search posts, topics, people..."
              className="w-full pl-9 pr-4 py-1.5 bg-surface-container-low border border-border-glass-dark rounded-full text-on-surface text-xs placeholder:text-outline focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* New Post Button */}
          <button
            onClick={onOpenCreatePostModal}
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface border border-border-glass-dark p-3 shadow-xl z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-border-glass-dark">
                  <span className="font-semibold text-xs text-on-surface">
                    Notifications
                  </span>
                  <span className="text-[11px] text-primary font-medium">3 new</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer text-left flex gap-2.5 items-start"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <n.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs font-medium text-on-surface">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[10px] text-outline shrink-0 ml-1">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center rounded-full ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-border-glass-dark p-2 shadow-xl z-50 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5 p-2 pb-2.5 border-b border-border-glass-dark">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ"
                    alt="Aarav"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-on-surface">Aarav</span>
                    <span className="text-[11px] text-outline">@aarav</span>
                  </div>
                </div>

                <div className="py-1 flex flex-col gap-0.5 text-xs">
                  <button
                    onClick={() => {
                      onViewChange('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                  >
                    <User className="w-3.5 h-3.5 text-outline" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onViewChange('bookmarks');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-outline" />
                    <span>Bookmarks</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleTheme();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                  >
                    {isDark ? (
                      <Sun className="w-3.5 h-3.5 text-outline" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-outline" />
                    )}
                    <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-border-glass-dark bg-surface text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === item.id
                ? 'bg-surface-container text-on-surface font-semibold'
                : 'text-on-surface-variant'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
