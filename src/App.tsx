import React, { useState, useEffect } from 'react';
import { ViewMode, FeedSubMode, FeedFilter, Post } from './types';
import { INITIAL_POSTS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { BookmarksView } from './components/BookmarksView';
import { ProfileView } from './components/ProfileView';
import { CastModal } from './components/CastModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('feed');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('krono_theme');
      return saved !== null ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  const [feedSubMode, setFeedSubMode] = useState<FeedSubMode>('latest');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Posts State
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  // New Post Modal
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('krono_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('krono_theme', 'light');
      }
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      addToast(
        next ? 'Dark Mode' : 'Light Mode',
        `Switched theme to ${next ? 'Dark' : 'Light'} mode.`,
        'info'
      );
      return next;
    });
  };

  const handleAddPost = (postData: Partial<Post>) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: {
        name: 'Aarav',
        handle: '@aarav',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ',
        verified: true,
      },
      timestamp: 'Just now',
      content: postData.content || '',
      mediaUrl: postData.mediaUrl,
      tags: postData.tags || ['#Community'],
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
      },
      commentsList: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    addToast('Post Published', 'Your update is now live on the feed.', 'success');
  };

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.metrics.isLiked;
          return {
            ...p,
            metrics: {
              ...p.metrics,
              likes: nextLiked ? p.metrics.likes + 1 : Math.max(0, p.metrics.likes - 1),
              isLiked: nextLiked,
            },
          };
        }
        return p;
      })
    );
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextBookmarked = !p.metrics.isBookmarked;
          addToast(
            nextBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
            nextBookmarked ? 'You can view this post in your Bookmarks tab.' : 'Post un-saved.',
            'info'
          );
          return {
            ...p,
            metrics: {
              ...p.metrics,
              isBookmarked: nextBookmarked,
            },
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: {
              name: 'Aarav',
              handle: '@aarav',
              avatar:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ',
            },
            timestamp: 'Just now',
            content: commentText,
          };
          return {
            ...p,
            commentsList: [...(p.commentsList || []), newComment],
          };
        }
        return p;
      })
    );
  };

  const bookmarkedPosts = posts.filter((p) => p.metrics.isBookmarked);
  const userPosts = posts.filter((p) => p.author.handle === '@aarav');

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenCreatePostModal={() => setIsCastModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Layout Container */}
      <div className="pt-24 sm:pt-22 pb-12 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 lg:gap-8 flex-1">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
              feedFilter={feedFilter}
              onFeedFilterChange={setFeedFilter}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
                setCurrentView('feed');
                addToast('Tag Selected', `Showing posts with ${tag}`, 'info');
              }}
            />
          </div>
        </div>

        {/* Dynamic Center Main View */}
        <main className="flex-1 min-w-0">
          {currentView === 'feed' && (
            <FeedView
              posts={posts}
              feedSubMode={feedSubMode}
              onFeedSubModeChange={setFeedSubMode}
              feedFilter={feedFilter}
              onFeedFilterChange={setFeedFilter}
              onAddPost={handleAddPost}
              onNotify={addToast}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
                addToast('Filter Applied', `Showing posts tagged with ${tag}`, 'info');
              }}
              searchFilterQuery={searchQuery}
              onToggleBookmark={handleToggleBookmark}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              onNotify={addToast}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
                setCurrentView('feed');
                addToast('Tag Filter', `Filtering feed by ${tag}`, 'info');
              }}
            />
          )}

          {currentView === 'bookmarks' && (
            <BookmarksView
              bookmarkedPosts={bookmarkedPosts}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onBackToFeed={() => setCurrentView('feed')}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              userPosts={userPosts.length > 0 ? userPosts : posts.slice(0, 2)}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onBackToFeed={() => setCurrentView('feed')}
              onNotify={addToast}
            />
          )}
        </main>
      </div>

      {/* Clean Platform Footer */}
      <Footer />

      {/* New Post Modal */}
      <CastModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        onSubmitPost={handleAddPost}
      />

      {/* Notification Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
