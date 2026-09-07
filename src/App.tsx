import React, { useState, useEffect } from 'react';
import { ViewMode, FeedSubMode, FeedFilter, Post, AuthUserProfile, TrendingTopic, SuggestedUser } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  fetchPostsFromBackend,
  createPostOnBackend,
  likePostOnBackend,
  bookmarkPostOnBackend,
  addCommentOnBackend,
  fetchTrendingFromBackend,
  fetchSuggestedUsersFromBackend,
  saveUserProfileToBackend,
} from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { BookmarksView } from './components/BookmarksView';
import { ProfileView } from './components/ProfileView';
import { CastModal } from './components/CastModal';
import { AuthModal } from './components/AuthModal';
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

  // Authentication State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<
    'signin' | 'profile' | 'credentials' | 'security' | '2fa'
  >('signin');
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(() => {
    try {
      const activeUid = localStorage.getItem('krono_active_uid');
      if (activeUid) {
        const stored = localStorage.getItem(`krono_profile_${activeUid}`);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Posts & Community State (Backed by live Express backend)
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [followedHandles, setFollowedHandles] = useState<string[]>([]);

  // New Post Modal
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Fetch real posts, trending, and community users from backend on mount and when user session changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [backendPosts, backendTrending, backendUsers] = await Promise.all([
          fetchPostsFromBackend(currentUser?.uid),
          fetchTrendingFromBackend(),
          fetchSuggestedUsersFromBackend(currentUser?.uid),
        ]);
        if (isMounted) {
          setPosts(backendPosts || []);
          setTrending(backendTrending || []);
          setSuggestedUsers(backendUsers || []);
        }
      } catch (err) {
        console.warn('Initial backend fetch warning:', err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        try {
          const stored = localStorage.getItem(`krono_profile_${firebaseUser.uid}`);
          let profile: AuthUserProfile;
          if (stored) {
            profile = JSON.parse(stored);
          } else {
            const defaultUser = (firebaseUser.email?.split('@')[0] || 'aarav').toLowerCase();
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || 'aarav.kharade1234@gmail.com',
              name: firebaseUser.displayName || 'Aarav Ravindra Kharade',
              username: `@${defaultUser}`,
              avatar:
                firebaseUser.photoURL ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ',
              provider: 'google',
              twoFactorEnabled: false,
              twoFactorMethod: 'totp',
              twoFactorVerified: true,
              ageVerified: true,
              location: '',
              createdAt: new Date().toISOString(),
            };
          }
          setCurrentUser(profile);
          localStorage.setItem('krono_active_uid', firebaseUser.uid);
          localStorage.setItem(`krono_profile_${firebaseUser.uid}`, JSON.stringify(profile));
          saveUserProfileToBackend(profile);
        } catch (err) {
          console.error('Failed to sync auth state', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning', err);
    }
    localStorage.removeItem('krono_active_uid');
    setCurrentUser(null);
    addToast('Signed Out', 'You have been signed out of your account.', 'info');
  };

  const handleAddPost = async (postData: Partial<Post>) => {
    const activeName = currentUser?.name || 'Aarav Ravindra Kharade';
    const activeHandle = currentUser?.username || '@aarav';
    const activeAvatar =
      currentUser?.avatar ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ';

    try {
      const created = await createPostOnBackend(
        {
          content: postData.content || '',
          mediaUrl: postData.mediaUrl,
          tags: postData.tags || ['#Community'],
        },
        {
          name: activeName,
          handle: activeHandle,
          avatar: activeAvatar,
          bio: currentUser?.email,
        },
        currentUser?.uid
      );

      if (created) {
        setPosts((prev) => [created, ...prev]);
        addToast('Post Published', 'Your update is now live on the backend feed.', 'success');
        // Refresh trending topics
        fetchTrendingFromBackend().then((t) => setTrending(t));
      }
    } catch (err) {
      console.error('Failed to publish post to backend:', err);
      // Fallback local post
      const fallbackPost: Post = {
        id: `post-${Date.now()}`,
        author: {
          name: activeName,
          handle: activeHandle,
          avatar: activeAvatar,
          verified: true,
        },
        timestamp: 'Just now',
        content: postData.content || '',
        mediaUrl: postData.mediaUrl,
        tags: postData.tags || [],
        metrics: {
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isBookmarked: false,
        },
        commentsList: [],
      };
      setPosts((prev) => [fallbackPost, ...prev]);
      addToast('Post Published', 'Your update is now live.', 'success');
    }
  };

  const handleToggleFollow = (user: SuggestedUser) => {
    setSuggestedUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u))
    );
    setFollowedHandles((prev) => {
      const isFollowing = prev.includes(user.handle);
      addToast(
        isFollowing ? 'Unfollowed' : 'Followed',
        isFollowing
          ? `You unfollowed ${user.name}`
          : `You are now following ${user.name}`,
        'info'
      );
      return isFollowing
        ? prev.filter((h) => h !== user.handle)
        : [...prev, user.handle];
    });
  };

  const handleToggleLike = async (postId: string) => {
    // Optimistic UI update
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

    // Sync with backend
    await likePostOnBackend(postId, currentUser?.uid);
  };

  const handleToggleBookmark = async (postId: string) => {
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

    // Sync with backend
    await bookmarkPostOnBackend(postId, currentUser?.uid);
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    const activeName = currentUser?.name || 'Aarav Ravindra Kharade';
    const activeHandle = currentUser?.username || '@aarav';
    const activeAvatar =
      currentUser?.avatar ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ';

    try {
      const res = await addCommentOnBackend(postId, commentText, {
        name: activeName,
        handle: activeHandle,
        avatar: activeAvatar,
      });

      if (res?.post) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? res.post : p)));
        addToast('Reply Posted', 'Your reply is now live on the backend thread.', 'success');
      }
    } catch (err) {
      console.error('Failed to add comment to backend:', err);
      // Fallback local update
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const newComment = {
              id: `c-${Date.now()}`,
              author: {
                name: activeName,
                handle: activeHandle,
                avatar: activeAvatar,
              },
              timestamp: 'Just now',
              content: commentText,
            };
            return {
              ...p,
              metrics: {
                ...p.metrics,
                comments: p.metrics.comments + 1,
              },
              commentsList: [...(p.commentsList || []), newComment],
            };
          }
          return p;
        })
      );
      addToast('Reply Posted', 'Your reply has been posted.', 'success');
    }
  };

  const activeUserHandle = currentUser?.username || '@aarav';
  const bookmarkedPosts = posts.filter((p) => p.metrics.isBookmarked);
  const userPosts = posts.filter(
    (p) => p.author.handle === activeUserHandle || p.author.handle === '@aarav'
  );

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
        currentUser={currentUser}
        onOpenAuthModal={(tab) => {
          setAuthModalInitialTab(tab || 'signin');
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
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
              trending={trending}
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
              currentUser={currentUser}
              onOpenAuthModal={(tab) => {
                setAuthModalInitialTab(tab || 'signin');
                setIsAuthModalOpen(true);
              }}
              trending={trending}
              suggestedUsers={suggestedUsers}
              followedHandles={followedHandles}
              onToggleFollow={handleToggleFollow}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              posts={posts}
              trending={trending}
              suggestedUsers={suggestedUsers}
              onNotify={addToast}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
                setCurrentView('feed');
                addToast('Tag Filter', `Filtering feed by ${tag}`, 'info');
              }}
              currentUser={currentUser}
              onOpenAuthModal={(tab) => {
                setAuthModalInitialTab(tab || 'signin');
                setIsAuthModalOpen(true);
              }}
              onToggleFollow={handleToggleFollow}
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
              userPosts={userPosts}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onBackToFeed={() => setCurrentView('feed')}
              onNotify={addToast}
              currentUser={currentUser}
              onOpenAuthModal={(tab) => {
                setAuthModalInitialTab(tab || 'profile');
                setIsAuthModalOpen(true);
              }}
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
        currentUser={currentUser}
      />

      {/* Full Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
        }}
        onNotify={addToast}
        initialTab={authModalInitialTab}
      />

      {/* Notification Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
