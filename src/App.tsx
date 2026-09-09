import { useState, useEffect } from 'react';
import { ViewMode, FeedSubMode, FeedFilter, Post, AuthUserProfile, TrendingTopic, SuggestedUser } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import {
  subscribeToFirestorePosts,
  subscribeToFirestoreUsers,
  createFirestorePost,
  toggleFirestoreLike,
  toggleFirestoreBookmark,
  toggleFirestoreRepost,
  addFirestoreComment,
  computeTrendingFromPosts,
  syncUserProfileToFirestore,
  fetchUserProfileFromFirestore,
  toggleFollowInFirestore,
} from './services/firestoreService';
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
  const [viewingProfileUser, setViewingProfileUser] = useState<SuggestedUser | null>(null);

  // New Post Modal
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [quotingPost, setQuotingPost] = useState<Post | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Real-time subscription to Firestore Posts
  useEffect(() => {
    const unsubscribe = subscribeToFirestorePosts(
      currentUser?.uid,
      (fetchedPosts) => {
        setPosts(fetchedPosts);
        setTrending(computeTrendingFromPosts(fetchedPosts));
      },
      (err) => {
        console.warn('Firestore subscription warning:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Real-time subscription to registered community users
  useEffect(() => {
    const unsubscribe = subscribeToFirestoreUsers(
      currentUser?.uid,
      (users) => {
        setSuggestedUsers(users);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const stored = localStorage.getItem(`krono_profile_${firebaseUser.uid}`);
          let profile: AuthUserProfile;
          if (stored) {
            profile = JSON.parse(stored);
            if (firebaseUser.photoURL) {
              profile.avatar = firebaseUser.photoURL;
            }
          } else {
            const defaultUser = (firebaseUser.email?.split('@')[0] || 'user').toLowerCase();
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Community Member',
              username: `@${defaultUser}`,
              avatar: firebaseUser.photoURL || '',
              provider: 'google',
              twoFactorEnabled: false,
              twoFactorMethod: 'totp',
              twoFactorVerified: true,
              ageVerified: true,
              location: '',
              createdAt: new Date().toISOString(),
              followers: [],
              following: [],
              followersCount: 0,
              followingCount: 0,
            };
          }

          // Fetch latest profile from Firestore to keep followers and data updated
          const firestoreProfile = await fetchUserProfileFromFirestore(firebaseUser.uid);
          if (firestoreProfile) {
            profile = {
              ...profile,
              ...firestoreProfile,
              avatar: firebaseUser.photoURL || firestoreProfile.avatar || profile.avatar,
            };
          }

          setCurrentUser(profile);
          if (Array.isArray(profile.following)) {
            setFollowedHandles(profile.following);
          }
          localStorage.setItem('krono_active_uid', firebaseUser.uid);
          localStorage.setItem(`krono_profile_${firebaseUser.uid}`, JSON.stringify(profile));
          await syncUserProfileToFirestore(profile);
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

  const handleAddPost = async (postData: Partial<Post>, quoteOriginalPostId?: string) => {
    if (!currentUser) {
      setAuthModalInitialTab('signin');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to publish a post.', 'warning');
      return;
    }

    // If quoting a post, handle via quote/repost in Firestore
    if (quoteOriginalPostId) {
      try {
        await toggleFirestoreRepost(
          quoteOriginalPostId,
          {
            uid: currentUser.uid,
            name: currentUser.name,
            username: currentUser.username,
            avatar: currentUser.avatar || '',
          },
          postData.content
        );
        addToast('Quote Post Published', 'Your commentary is now live in Firestore.', 'success');
        setQuotingPost(null);
        return;
      } catch (err) {
        console.error('Failed to publish quote post:', err);
        addToast('Error', 'Failed to publish quote post.', 'warning');
        return;
      }
    }

    try {
      await createFirestorePost({
        authorId: currentUser.uid,
        authorName: currentUser.name,
        authorHandle: currentUser.username,
        authorAvatar: currentUser.avatar || '',
        authorVerified: true,
        content: postData.content || '',
        mediaUrl: postData.mediaUrl,
        tags: postData.tags || ['#Community'],
      });
      addToast('Post Published', 'Your post is now live in Firestore.', 'success');
    } catch (err) {
      console.error('Failed to publish post to Firestore:', err);
      addToast('Error', 'Failed to publish post to Firestore.', 'warning');
    }
  };

  const handleToggleRepost = async (postId: string) => {
    if (!currentUser) {
      setAuthModalInitialTab('signin');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to repost.', 'warning');
      return;
    }

    try {
      const res = await toggleFirestoreRepost(postId, {
        uid: currentUser.uid,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar || '',
      });
      if (res?.isReposted) {
        addToast('Reposted', 'Post shared to your profile and community feed.', 'success');
      } else {
        addToast('Repost Removed', 'Post removed from your reposts.', 'info');
      }
    } catch (err) {
      console.error('Failed to toggle repost:', err);
    }
  };

  const handleQuotePost = (post: Post) => {
    if (!currentUser) {
      setAuthModalInitialTab('signin');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to quote posts.', 'warning');
      return;
    }
    setQuotingPost(post);
    setIsCastModalOpen(true);
  };

  const handleToggleFollow = async (user: SuggestedUser) => {
    if (!currentUser) {
      setAuthModalInitialTab('signin');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to follow community members.', 'warning');
      return;
    }

    const wasFollowing =
      followedHandles.includes(user.handle) || followedHandles.includes(user.id);
    const nextFollowing = !wasFollowing;

    // Optimistic UI updates
    setFollowedHandles((prev) =>
      nextFollowing
        ? [...prev, user.handle, user.id]
        : prev.filter((h) => h !== user.handle && h !== user.id)
    );

    addToast(
      nextFollowing ? 'Followed' : 'Unfollowed',
      nextFollowing ? `You are now following ${user.name}` : `You unfollowed ${user.name}`,
      'info'
    );

    try {
      const res = await toggleFollowInFirestore(
        currentUser.uid,
        user.id || user.handle
      );

      if (res) {
        setFollowedHandles(res.followedHandles);
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            following: res.followedHandles,
            followingCount: res.followedHandles.length,
          };
          localStorage.setItem(`krono_profile_${prev.uid}`, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentUser) {
      setAuthModalInitialTab('signin');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to like posts.', 'warning');
      return;
    }

    try {
      await toggleFirestoreLike(postId, currentUser.uid);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleToggleBookmark = async (postId: string) => {
    if (!currentUser) {
      setAuthModalInitialTab('signin');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to bookmark posts.', 'warning');
      return;
    }

    try {
      const res = await toggleFirestoreBookmark(postId, currentUser.uid);
      addToast(
        res.isBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
        res.isBookmarked ? 'You can view this post in your Bookmarks tab.' : 'Post un-saved.',
        'info'
      );
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!currentUser) {
      setAuthModalInitialTab('signin');
      setIsAuthModalOpen(true);
      addToast('Sign In Required', 'Please sign in to reply.', 'warning');
      return;
    }

    try {
      await addFirestoreComment(postId, {
        author: {
          name: currentUser.name,
          handle: currentUser.username,
          avatar: currentUser.avatar || '',
        },
        content: commentText,
      });
      addToast('Reply Posted', 'Your reply is now live.', 'success');
    } catch (err) {
      console.error('Failed to add comment to Firestore:', err);
      addToast('Error', 'Failed to submit comment.', 'warning');
    }
  };

  const activeUserHandle = currentUser?.username || '';
  const bookmarkedPosts = posts.filter((p) => p.metrics.isBookmarked);
  const userPosts = posts.filter(
    (p) => (currentUser && p.author.id === currentUser.uid) || (activeUserHandle && p.author.handle.toLowerCase() === activeUserHandle.toLowerCase())
  );

  const handleViewChange = (view: ViewMode) => {
    if (view === 'profile') {
      setViewingProfileUser(null);
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-primary/20 selection:text-primary">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
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
              onViewChange={handleViewChange}
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
              onToggleRepost={handleToggleRepost}
              onQuotePost={handleQuotePost}
              onSelectUserProfile={(user) => {
                setViewingProfileUser(user);
                setCurrentView('profile');
              }}
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
              onSelectUserProfile={(user) => {
                setViewingProfileUser(user);
                setCurrentView('profile');
              }}
            />
          )}

          {currentView === 'bookmarks' && (
            <BookmarksView
              bookmarkedPosts={bookmarkedPosts}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onBackToFeed={() => setCurrentView('feed')}
              onNotify={addToast}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              userPosts={
                viewingProfileUser
                  ? posts.filter(
                      (p) =>
                        p.author.handle.toLowerCase() === viewingProfileUser.handle.toLowerCase() ||
                        (viewingProfileUser.id && p.author.id === viewingProfileUser.id)
                    )
                  : userPosts
              }
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
              onBackToFeed={() => {
                setViewingProfileUser(null);
                setCurrentView('feed');
              }}
              onNotify={addToast}
              currentUser={currentUser}
              viewingUser={viewingProfileUser}
              followedHandles={followedHandles}
              onToggleFollow={handleToggleFollow}
              onUpdateCurrentUser={(updated) => {
                setCurrentUser(updated);
                syncUserProfileToFirestore(updated);
                localStorage.setItem(`krono_profile_${updated.uid}`, JSON.stringify(updated));
                if (auth.currentUser && updated.avatar) {
                  updateProfile(auth.currentUser, {
                    displayName: updated.name,
                    photoURL: updated.avatar,
                  }).catch(() => {});
                }
              }}
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
        onClose={() => {
          setIsCastModalOpen(false);
          setQuotingPost(null);
        }}
        onSubmitPost={handleAddPost}
        currentUser={currentUser}
        quotingPost={quotingPost}
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
