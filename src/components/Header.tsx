import React, { useState } from 'react';
import { ViewMode, AuthUserProfile } from '../types';
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
  Shield,
  KeyRound,
  LogOut,
  Lock,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCreatePostModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: AuthUserProfile | null;
  onOpenAuthModal: (tab?: 'signin' | 'profile' | 'credentials' | '2fa') => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  isDark,
  onToggleTheme,
  onOpenCreatePostModal,
  searchQuery,
  onSearchChange,
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      icon: any;
    }>
  >([]);

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
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface border border-border-glass-dark p-3 shadow-xl z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-border-glass-dark">
                  <span className="font-semibold text-xs text-on-surface">
                    Notifications
                  </span>
                  <span className="text-[11px] text-outline">
                    {notifications.length === 0 ? 'All caught up' : `${notifications.length} new`}
                  </span>
                </div>
                {notifications.length === 0 ? (
                  <div className="py-6 px-4 text-center flex flex-col items-center gap-2 text-outline">
                    <CheckCircle className="w-6 h-6 text-primary/70" />
                    <p className="text-xs">No notifications yet. You're all caught up!</p>
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </div>

          {/* User Profile / Auth Area */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 rounded-full p-0.5 ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-border-glass-dark"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-surface border border-border-glass-dark p-2 shadow-xl z-50 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 p-2 pb-2.5 border-b border-border-glass-dark">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-full object-cover border border-primary/30"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-on-surface truncate">{currentUser.name}</span>
                      <span className="text-[11px] text-outline font-mono truncate">{currentUser.username}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                        <span className="text-[10px] text-primary font-medium">2FA Active</span>
                      </div>
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
                        onOpenAuthModal('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                    >
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>Edit Name & Handle</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAuthModal('credentials');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-secondary" />
                      <span>Change Email & Password</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAuthModal('2fa');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                    >
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>Compulsory 2FA Settings</span>
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

                    <div className="my-1 border-t border-border-glass-dark"></div>

                    <button
                      onClick={() => {
                        onSignOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-error hover:bg-error/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-outline text-[11px] font-medium border border-border-glass-dark">
                <Eye className="w-3 h-3 text-outline" />
                <span>Guest Mode</span>
              </span>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In (13+)</span>
              </button>
            </div>
          )}
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
