import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Post, AuthUserProfile, SuggestedUser, PostComment, TrendingTopic } from '../types';
import {
  saveUserProfileToBackend,
  addCommentOnBackend,
  searchUsersOnBackend,
  createPostOnBackend,
} from './api';

/**
 * Format relative timestamp from an ISO date or Date object
 */
export function formatTimeAgo(isoOrDate: string | Date | number): string {
  try {
    const d = new Date(isoOrDate);
    const diffSeconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'just now';
  }
}

const CACHED_POSTS_KEY = 'krono_cached_posts';

export function getLocalCachedPosts(): Post[] {
  try {
    const raw = localStorage.getItem(CACHED_POSTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return [];
}

export function setLocalCachedPosts(posts: Post[]) {
  try {
    localStorage.setItem(CACHED_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn('LocalStorage post save error:', e);
  }
}

/**
 * Realtime subscription to community posts in Firestore
 */
export function subscribeToFirestorePosts(
  currentUserUid: string | undefined,
  onUpdate: (posts: Post[]) => void,
  onError?: (err: unknown) => void
) {
  // 1. Immediately provide locally cached posts so reload is NEVER empty
  const localPosts = getLocalCachedPosts();
  if (localPosts.length > 0) {
    onUpdate(localPosts);
  }

  const postsColl = collection(db, 'posts');
  const q = query(postsColl, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const postsList: Post[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const likedBy = Array.isArray(d.likedBy) ? d.likedBy : [];
        const bookmarkedBy = Array.isArray(d.bookmarkedBy) ? d.bookmarkedBy : [];
        const repostedBy = Array.isArray(d.repostedBy) ? d.repostedBy : [];

        const isLiked = currentUserUid ? likedBy.includes(currentUserUid) : false;
        const isBookmarked = currentUserUid ? bookmarkedBy.includes(currentUserUid) : false;
        const isReposted = currentUserUid ? repostedBy.includes(currentUserUid) : false;

        return {
          id: docSnap.id,
          author: {
            id: d.authorId || '',
            name: d.authorName || 'Anonymous',
            handle: d.authorHandle || '@user',
            avatar: d.authorAvatar || '',
            verified: Boolean(d.authorVerified),
            bio: d.authorBio || '',
          },
          timestamp: d.createdAt ? formatTimeAgo(d.createdAt) : d.timestamp || 'just now',
          content: d.content || '',
          mediaUrl: d.mediaUrl || undefined,
          tags: Array.isArray(d.tags) ? d.tags : [],
          metrics: {
            likes: typeof d.likesCount === 'number' ? d.likesCount : likedBy.length,
            comments: typeof d.commentsCount === 'number' ? d.commentsCount : 0,
            shares: typeof d.sharesCount === 'number' ? d.sharesCount : repostedBy.length,
            isLiked,
            isBookmarked,
            isReposted,
          },
          likedBy,
          bookmarkedBy,
          repostedBy,
          repost: d.repost || undefined,
          quotedPost: d.quotedPost || undefined,
          commentsList: Array.isArray(d.commentsList) ? d.commentsList : [],
        };
      });

      if (postsList.length > 0) {
        // Merge with local cached posts so any newly authored local posts or pending likes/comments are NOT lost
        const localCached = getLocalCachedPosts();
        const localMap = new Map(localCached.map((p) => [p.id, p]));
        const remoteIds = new Set(postsList.map((p) => p.id));

        const mergedRemote = postsList.map((remotePost) => {
          const localMatch = localMap.get(remotePost.id);
          if (!localMatch) return remotePost;

          // Merge likes: if local user liked it, make sure likedBy and isLiked are preserved
          const likedBySet = new Set([
            ...(Array.isArray(remotePost.likedBy) ? remotePost.likedBy : []),
            ...(Array.isArray(localMatch.likedBy) ? localMatch.likedBy : []),
          ]);
          const likedBy = Array.from(likedBySet);

          // Merge bookmarks
          const bookmarkedBySet = new Set([
            ...(Array.isArray(remotePost.bookmarkedBy) ? remotePost.bookmarkedBy : []),
            ...(Array.isArray(localMatch.bookmarkedBy) ? localMatch.bookmarkedBy : []),
          ]);
          const bookmarkedBy = Array.from(bookmarkedBySet);

          // Merge comments: union local and remote comments by ID
          const existingComments = Array.isArray(remotePost.commentsList) ? remotePost.commentsList : [];
          const localComments = Array.isArray(localMatch.commentsList) ? localMatch.commentsList : [];
          const commentIds = new Set(existingComments.map((c) => c.id));
          const combinedComments = [...existingComments];
          for (const lc of localComments) {
            if (!commentIds.has(lc.id)) {
              combinedComments.push(lc);
              commentIds.add(lc.id);
            }
          }

          const isLiked = currentUserUid ? likedBy.includes(currentUserUid) : remotePost.metrics.isLiked;
          const isBookmarked = currentUserUid ? bookmarkedBy.includes(currentUserUid) : remotePost.metrics.isBookmarked;

          return {
            ...remotePost,
            likedBy,
            bookmarkedBy,
            commentsList: combinedComments,
            metrics: {
              ...remotePost.metrics,
              likes: Math.max(likedBy.length, remotePost.metrics.likes),
              comments: Math.max(combinedComments.length, remotePost.metrics.comments),
              isLiked,
              isBookmarked,
            },
          };
        });

        // Keep local posts that have not yet been synced to remote
        const nonSyncedLocal = localCached.filter((p) => !remoteIds.has(p.id));
        const finalMerged = [...nonSyncedLocal, ...mergedRemote];
        setLocalCachedPosts(finalMerged);
        onUpdate(finalMerged);
      } else {
        const cached = getLocalCachedPosts();
        if (cached.length > 0) {
          onUpdate(cached);
        }
      }
    },
    (error) => {
      console.warn('Firestore posts subscription notice (using local persistence):', error);
      const cached = getLocalCachedPosts();
      if (cached.length > 0) {
        onUpdate(cached);
      }
      if (onError) onError(error);
    }
  );
}

/**
 * Publish a new Post to Firestore (with immediate local persistence)
 */
export async function createFirestorePost(postData: {
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorVerified?: boolean;
  content: string;
  mediaUrl?: string;
  tags?: string[];
  quotedPost?: Post['quotedPost'];
  repost?: Post['repost'];
}): Promise<string> {
  const newPostId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const postRef = doc(db, 'posts', newPostId);

  const payload = {
    id: newPostId,
    authorId: postData.authorId,
    authorName: postData.authorName.slice(0, 80),
    authorHandle: postData.authorHandle.slice(0, 50),
    authorAvatar: postData.authorAvatar || '',
    authorVerified: Boolean(postData.authorVerified),
    content: postData.content.slice(0, 2000),
    mediaUrl: postData.mediaUrl || '',
    tags: postData.tags || [],
    createdAt: new Date().toISOString(),
    timestamp: 'just now',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    quotedPost: postData.quotedPost || null,
    repost: postData.repost || null,
    commentsList: [],
  };

  // Immediate local cache so reloading the page NEVER loses the post
  const localPost: Post = {
    id: newPostId,
    author: {
      id: postData.authorId,
      name: postData.authorName.slice(0, 80),
      handle: postData.authorHandle.slice(0, 50),
      avatar: postData.authorAvatar || '',
      verified: Boolean(postData.authorVerified),
      bio: '',
    },
    timestamp: 'just now',
    content: postData.content.slice(0, 2000),
    mediaUrl: postData.mediaUrl || undefined,
    tags: postData.tags || [],
    metrics: {
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      isReposted: false,
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    quotedPost: postData.quotedPost || undefined,
    repost: postData.repost || undefined,
    commentsList: [],
  };

  const currentLocal = getLocalCachedPosts();
  setLocalCachedPosts([localPost, ...currentLocal.filter((p) => p.id !== newPostId)]);

  // Also sync to backend API if available (dev / Cloud Run)
  createPostOnBackend(
    { content: postData.content, mediaUrl: postData.mediaUrl, tags: postData.tags },
    { name: postData.authorName, handle: postData.authorHandle, avatar: postData.authorAvatar },
    postData.authorId
  ).catch(() => {});

  try {
    // Write to Firestore with a safe timeout so offline / placeholder credentials never block UI
    await Promise.race([
      setDoc(postRef, payload),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    return newPostId;
  } catch (err) {
    console.warn('Firestore setDoc notice (saved locally in persistent storage):', err);
    return newPostId;
  }
}

/**
 * Toggle like for a post in Firestore & local persistence
 */
export async function toggleFirestoreLike(
  postId: string,
  userUid: string
): Promise<{ isLiked: boolean; count: number }> {
  // Update local cache immediately
  const currentCached = getLocalCachedPosts();
  let localIsLiked = false;
  let localLikesCount = 0;
  const updated = currentCached.map((p) => {
    if (p.id === postId) {
      const likedBy = Array.isArray(p.likedBy) ? [...p.likedBy] : [];
      const idx = likedBy.indexOf(userUid);
      if (idx >= 0) {
        likedBy.splice(idx, 1);
        localIsLiked = false;
      } else {
        likedBy.push(userUid);
        localIsLiked = true;
      }
      localLikesCount = likedBy.length;
      return {
        ...p,
        likedBy,
        metrics: {
          ...p.metrics,
          likes: likedBy.length,
          isLiked: localIsLiked,
        },
      };
    }
    return p;
  });
  setLocalCachedPosts(updated);

  const postRef = doc(db, 'posts', postId);
  try {
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const data = snap.data();
      const likedBy: string[] = Array.isArray(data.likedBy) ? [...data.likedBy] : [];
      const index = likedBy.indexOf(userUid);
      let isLiked = false;

      if (index >= 0) {
        likedBy.splice(index, 1);
        isLiked = false;
      } else {
        likedBy.push(userUid);
        isLiked = true;
      }

      await updateDoc(postRef, {
        likedBy,
        likesCount: likedBy.length,
      });

      return { isLiked, count: likedBy.length };
    }
    return { isLiked: localIsLiked, count: localLikesCount };
  } catch (err) {
    console.warn('Firestore like notice (kept locally):', err);
    return { isLiked: localIsLiked, count: localLikesCount };
  }
}

/**
 * Toggle bookmark for a post in Firestore
 */
export async function toggleFirestoreBookmark(
  postId: string,
  userUid: string
): Promise<{ isBookmarked: boolean }> {
  // Update local cache
  const currentCached = getLocalCachedPosts();
  let localIsBookmarked = false;
  const updated = currentCached.map((p) => {
    if (p.id === postId) {
      const bookmarkedBy = Array.isArray(p.bookmarkedBy) ? [...p.bookmarkedBy] : [];
      const idx = bookmarkedBy.indexOf(userUid);
      if (idx >= 0) {
        bookmarkedBy.splice(idx, 1);
        localIsBookmarked = false;
      } else {
        bookmarkedBy.push(userUid);
        localIsBookmarked = true;
      }
      return {
        ...p,
        bookmarkedBy,
        metrics: {
          ...p.metrics,
          isBookmarked: localIsBookmarked,
        },
      };
    }
    return p;
  });
  setLocalCachedPosts(updated);

  const postRef = doc(db, 'posts', postId);
  try {
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const data = snap.data();
      const bookmarkedBy: string[] = Array.isArray(data.bookmarkedBy) ? [...data.bookmarkedBy] : [];
      const index = bookmarkedBy.indexOf(userUid);
      let isBookmarked = false;

      if (index >= 0) {
        bookmarkedBy.splice(index, 1);
        isBookmarked = false;
      } else {
        bookmarkedBy.push(userUid);
        isBookmarked = true;
      }

      await updateDoc(postRef, {
        bookmarkedBy,
      });

      return { isBookmarked };
    }
    return { isBookmarked: localIsBookmarked };
  } catch (err) {
    console.warn('Firestore bookmark notice (kept locally):', err);
    return { isBookmarked: localIsBookmarked };
  }
}

/**
 * Repost or Quote a post in Firestore
 */
export async function toggleFirestoreRepost(
  originalPostId: string,
  currentUser: { uid: string; name: string; username: string; avatar: string },
  quoteComment?: string
): Promise<{ isReposted: boolean; sharesCount: number }> {
  // Update local cache immediately
  const currentCached = getLocalCachedPosts();
  let localSharesCount = 0;
  let isReposted = false;

  const originalPost = currentCached.find((p) => p.id === originalPostId);
  const repostedBy: string[] = Array.isArray(originalPost?.repostedBy)
    ? [...originalPost.repostedBy]
    : [];
  const index = repostedBy.indexOf(currentUser.uid);

  if (quoteComment && quoteComment.trim()) {
    const quotePostId = `post_quote_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newQuotePost: Post = {
      id: quotePostId,
      author: {
        id: currentUser.uid,
        name: currentUser.name.slice(0, 80),
        handle: currentUser.username.slice(0, 50),
        avatar: currentUser.avatar || '',
        verified: false,
        bio: '',
      },
      content: quoteComment.slice(0, 2000),
      timestamp: 'just now',
      tags: [],
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
        isReposted: false,
      },
      likedBy: [],
      bookmarkedBy: [],
      repostedBy: [],
      quotedPost: originalPost
        ? {
            id: originalPost.id,
            author: originalPost.author,
            content: originalPost.content,
            mediaUrl: originalPost.mediaUrl,
            timestamp: originalPost.timestamp,
          }
        : undefined,
      commentsList: [],
    };

    const updated = currentCached.map((p) => {
      if (p.id === originalPostId) {
        return {
          ...p,
          metrics: {
            ...p.metrics,
            shares: p.metrics.shares + 1,
          },
        };
      }
      return p;
    });

    setLocalCachedPosts([newQuotePost, ...updated]);

    // Push to Firestore safely
    try {
      const quoteRef = doc(db, 'posts', quotePostId);
      await setDoc(quoteRef, {
        id: quotePostId,
        authorId: currentUser.uid,
        authorName: currentUser.name.slice(0, 80),
        authorHandle: currentUser.username.slice(0, 50),
        authorAvatar: currentUser.avatar || '',
        authorVerified: false,
        content: quoteComment.slice(0, 2000),
        mediaUrl: '',
        tags: [],
        createdAt: new Date().toISOString(),
        timestamp: 'just now',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        likedBy: [],
        bookmarkedBy: [],
        repostedBy: [],
        quotedPost: originalPost
          ? {
              id: originalPost.id,
              author: originalPost.author,
              content: originalPost.content,
              mediaUrl: originalPost.mediaUrl || '',
              timestamp: originalPost.timestamp,
            }
          : null,
        repost: null,
        commentsList: [],
      });

      const origRef = doc(db, 'posts', originalPostId);
      await updateDoc(origRef, {
        sharesCount: (originalPost?.metrics.shares || 0) + 1,
      });
    } catch (err) {
      console.warn('Firestore quote post sync warning:', err);
    }

    return { isReposted: true, sharesCount: (originalPost?.metrics.shares || 0) + 1 };
  }

  // Direct Repost toggle
  if (index >= 0) {
    repostedBy.splice(index, 1);
    isReposted = false;
  } else {
    repostedBy.push(currentUser.uid);
    isReposted = true;
  }
  localSharesCount = repostedBy.length;

  const repostDocId = `repost_${currentUser.uid}_${originalPostId}`;

  let updatedList = currentCached.map((p) => {
    if (p.id === originalPostId) {
      return {
        ...p,
        repostedBy,
        metrics: {
          ...p.metrics,
          shares: localSharesCount,
          isReposted,
        },
      };
    }
    return p;
  });

  if (isReposted && originalPost) {
    const repostEntry: Post = {
      id: repostDocId,
      author: originalPost.author,
      content: originalPost.content,
      mediaUrl: originalPost.mediaUrl,
      timestamp: originalPost.timestamp,
      tags: originalPost.tags,
      metrics: {
        ...originalPost.metrics,
        shares: localSharesCount,
        isReposted: true,
      },
      likedBy: originalPost.likedBy,
      bookmarkedBy: originalPost.bookmarkedBy,
      repostedBy,
      repost: {
        originalPostId: originalPost.id,
        reposterId: currentUser.uid,
        reposterName: currentUser.name,
        reposterHandle: currentUser.username,
        timestamp: 'just now',
      },
      commentsList: originalPost.commentsList,
    };
    updatedList = [repostEntry, ...updatedList];
  } else if (!isReposted) {
    updatedList = updatedList.filter((p) => p.id !== repostDocId);
  }

  setLocalCachedPosts(updatedList);

  // Synchronize with Firestore
  const originalRef = doc(db, 'posts', originalPostId);
  try {
    await updateDoc(originalRef, {
      repostedBy,
      sharesCount: localSharesCount,
    });

    if (isReposted && originalPost) {
      const repostRef = doc(db, 'posts', repostDocId);
      await setDoc(repostRef, {
        id: repostDocId,
        authorId: currentUser.uid,
        authorName: originalPost.author.name,
        authorHandle: originalPost.author.handle,
        authorAvatar: originalPost.author.avatar || '',
        authorVerified: Boolean(originalPost.author.verified),
        content: originalPost.content,
        mediaUrl: originalPost.mediaUrl || '',
        tags: originalPost.tags || [],
        createdAt: new Date().toISOString(),
        timestamp: 'just now',
        likesCount: originalPost.metrics.likes || 0,
        commentsCount: originalPost.metrics.comments || 0,
        sharesCount: localSharesCount,
        likedBy: originalPost.likedBy || [],
        bookmarkedBy: originalPost.bookmarkedBy || [],
        repostedBy,
        repost: {
          originalPostId: originalPost.id,
          reposterId: currentUser.uid,
          reposterName: currentUser.name,
          reposterHandle: currentUser.username,
          timestamp: 'just now',
        },
        quotedPost: null,
        commentsList: originalPost.commentsList || [],
      });
    } else {
      await deleteDoc(doc(db, 'posts', repostDocId)).catch(() => {});
    }
  } catch (err) {
    console.warn('Firestore repost update notice (kept locally):', err);
  }

  return { isReposted, sharesCount: localSharesCount };
}

/**
 * Add a comment to a post in Firestore and synchronize with local cache & backend
 */
export async function addFirestoreComment(
  postId: string,
  commentData: {
    author: { name: string; handle: string; avatar: string };
    content: string;
  },
  userId?: string
): Promise<PostComment> {
  const newComment: PostComment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    author: commentData.author,
    timestamp: 'just now',
    content: commentData.content.slice(0, 1000),
  };

  // Update local cache immediately so reloading NEVER drops the comment
  const currentCached = getLocalCachedPosts();
  const updatedPosts = currentCached.map((p) => {
    if (p.id === postId) {
      const list = Array.isArray(p.commentsList) ? [...p.commentsList, newComment] : [newComment];
      return {
        ...p,
        commentsList: list,
        metrics: {
          ...p.metrics,
          comments: list.length,
        },
      };
    }
    return p;
  });
  setLocalCachedPosts(updatedPosts);

  // Firestore update with safe fallback
  const postRef = doc(db, 'posts', postId);
  try {
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const data = snap.data();
      const firestoreComments = Array.isArray(data.commentsList) ? [...data.commentsList] : [];
      firestoreComments.push(newComment);
      await updateDoc(postRef, {
        commentsList: firestoreComments,
        commentsCount: firestoreComments.length,
      });
    }
  } catch (err) {
    console.warn('Firestore comment update notice (persisted in local cache):', err);
  }

  // Always synchronize to the Express backend database for dual persistence
  try {
    await addCommentOnBackend(
      postId,
      commentData.content,
      commentData.author,
      userId
    );
  } catch (backendErr) {
    console.warn('Backend comment sync notice:', backendErr);
  }

  return newComment;
}

/**
 * Save or sync user profile in Firestore and Express backend
 */
export async function syncUserProfileToFirestore(
  profile: AuthUserProfile
): Promise<void> {
  const userRef = doc(db, 'users', profile.uid);

  // Sync to Express backend so users are immediately searchable
  saveUserProfileToBackend(profile).catch((err) => {
    console.warn('Backend user profile sync warning:', err);
  });

  try {
    const snap = await getDoc(userRef);
    const existingData = snap.exists() ? snap.data() : {};

    const payload = {
      uid: profile.uid,
      name: profile.name.slice(0, 80),
      username: profile.username.slice(0, 50),
      email: profile.email || '',
      avatar: typeof profile.avatar === 'string' ? profile.avatar : (existingData.avatar || ''),
      bio: typeof profile.bio === 'string' ? profile.bio.slice(0, 280) : (existingData.bio || ''),
      location: typeof profile.location === 'string' ? profile.location.trim().slice(0, 100) : (existingData.location || ''),
      followers: Array.isArray(profile.followers)
        ? profile.followers
        : existingData.followers || [],
      following: Array.isArray(profile.following)
        ? profile.following
        : existingData.following || [],
      createdAt: profile.createdAt || existingData.createdAt || new Date().toISOString(),
    };

    await setDoc(userRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore profile sync error (backend has updated):', err);
  }
}

/**
 * Search across community users who have signed in
 */
export async function searchCommunityUsers(
  query: string,
  currentUid?: string
): Promise<SuggestedUser[]> {
  try {
    const backendResults = await searchUsersOnBackend(query, currentUid);
    if (Array.isArray(backendResults) && backendResults.length > 0) {
      return backendResults;
    }
  } catch (err) {
    console.warn('Search backend fallback:', err);
  }

  // Client-side / Firestore fallback
  try {
    const qClean = query.trim().toLowerCase().replace(/^@/, '');
    const usersSnap = await getDocs(collection(db, 'users'));
    const matched: SuggestedUser[] = [];

    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data) return;
      if (currentUid && data.uid === currentUid) return;

      const name = (data.name || '').toLowerCase();
      const username = (data.username || '').toLowerCase();
      const bio = (data.bio || '').toLowerCase();
      const email = (data.email || '').toLowerCase();

      if (!qClean || name.includes(qClean) || username.includes(qClean) || bio.includes(qClean) || email.includes(qClean)) {
        matched.push({
          id: data.uid,
          name: data.name || 'Member',
          handle: data.username || `@user_${data.uid.slice(0, 5)}`,
          avatar: data.avatar || '',
          bio: data.bio || '',
          followersCount: Array.isArray(data.followers) ? data.followers.length : 0,
          followingCount: Array.isArray(data.following) ? data.following.length : 0,
          isFollowing: false,
        });
      }
    });

    return matched;
  } catch (err) {
    console.warn('Firestore user search error:', err);
    return [];
  }
}

/**
 * Update user profile picture in Firestore directly
 */
export async function updateUserAvatarInFirestore(
  uid: string,
  avatarUrl: string
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      avatar: avatarUrl,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

/**
 * Fetch a single user profile from Firestore
 */
export async function fetchUserProfileFromFirestore(
  uid: string
): Promise<AuthUserProfile | null> {
  const userRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      uid: d.uid,
      name: d.name,
      username: d.username,
      email: d.email || '',
      avatar: d.avatar || '',
      bio: d.bio || '',
      location: d.location || '',
      provider: 'google',
      twoFactorEnabled: false,
      twoFactorMethod: 'totp',
      twoFactorVerified: true,
      ageVerified: true,
      createdAt: d.createdAt || new Date().toISOString(),
      followers: Array.isArray(d.followers) ? d.followers : [],
      following: Array.isArray(d.following) ? d.following : [],
      followersCount: Array.isArray(d.followers) ? d.followers.length : 0,
      followingCount: Array.isArray(d.following) ? d.following.length : 0,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
}

/**
 * Realtime subscription to real registered users in Firestore (for suggested users / network)
 */
export function subscribeToFirestoreUsers(
  currentUserUid: string | undefined,
  onUpdate: (users: SuggestedUser[]) => void
) {
  const usersColl = collection(db, 'users');
  return onSnapshot(
    usersColl,
    (snapshot) => {
      const users: SuggestedUser[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        // Don't suggest self
        if (d.uid && d.uid !== currentUserUid) {
          const followers = Array.isArray(d.followers) ? d.followers : [];
          const following = Array.isArray(d.following) ? d.following : [];
          users.push({
            id: d.uid,
            name: d.name || 'Community Member',
            handle: d.username || '@user',
            avatar: d.avatar || '',
            bio: d.bio || 'Krono Community Member',
            followersCount: followers.length,
            followingCount: following.length,
            isFollowing: currentUserUid ? followers.includes(currentUserUid) : false,
          });
        }
      });
      onUpdate(users);
    },
    (err) => {
      console.warn('Firestore users subscription warning:', err);
    }
  );
}

/**
 * Toggle follow a user in Firestore
 */
export async function toggleFollowInFirestore(
  currentUserId: string,
  targetUserIdOrHandle: string
): Promise<{ isFollowing: boolean; followedHandles: string[] }> {
  const currentUserRef = doc(db, 'users', currentUserId);
  try {
    const currentSnap = await getDoc(currentUserRef);
    if (!currentSnap.exists()) {
      return { isFollowing: false, followedHandles: [] };
    }
    const currentData = currentSnap.data();
    const following: string[] = Array.isArray(currentData.following)
      ? [...currentData.following]
      : [];

    const idx = following.indexOf(targetUserIdOrHandle);
    let isFollowing = false;
    if (idx >= 0) {
      following.splice(idx, 1);
      isFollowing = false;
    } else {
      following.push(targetUserIdOrHandle);
      isFollowing = true;
    }

    await updateDoc(currentUserRef, { following });

    // Also update target user's followers list if target is a valid UID
    try {
      const targetUserRef = doc(db, 'users', targetUserIdOrHandle);
      const targetSnap = await getDoc(targetUserRef);
      if (targetSnap.exists()) {
        const targetData = targetSnap.data();
        const followers: string[] = Array.isArray(targetData.followers)
          ? [...targetData.followers]
          : [];
        const fIdx = followers.indexOf(currentUserId);
        if (isFollowing && fIdx < 0) {
          followers.push(currentUserId);
        } else if (!isFollowing && fIdx >= 0) {
          followers.splice(fIdx, 1);
        }
        await updateDoc(targetUserRef, { followers });
      }
    } catch {
      // target might only be a handle, safe to proceed
    }

    return { isFollowing, followedHandles: following };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserId}`);
  }
}

/**
 * Fetch network (followers and following) from Firestore
 */
export async function fetchUserNetworkFromFirestore(
  targetUidOrHandle: string
): Promise<{
  following: Array<{ id: string; name: string; handle: string; avatar: string; bio?: string }>;
  followers: Array<{ id: string; name: string; handle: string; avatar: string; bio?: string }>;
}> {
  try {
    let targetDoc: any = null;
    const userRef = doc(db, 'users', targetUidOrHandle);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      targetDoc = snap.data();
    } else {
      // Query by username
      const q = query(collection(db, 'users'), where('username', '==', targetUidOrHandle));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        targetDoc = qSnap.docs[0].data();
      }
    }

    if (!targetDoc) {
      return { following: [], followers: [] };
    }

    const followingUids: string[] = Array.isArray(targetDoc.following) ? targetDoc.following : [];
    const followerUids: string[] = Array.isArray(targetDoc.followers) ? targetDoc.followers : [];

    const fetchProfiles = async (uids: string[]) => {
      const results: Array<{ id: string; name: string; handle: string; avatar: string; bio?: string }> = [];
      for (const uid of uids) {
        try {
          const uSnap = await getDoc(doc(db, 'users', uid));
          if (uSnap.exists()) {
            const data = uSnap.data();
            results.push({
              id: data.uid,
              name: data.name,
              handle: data.username,
              avatar: data.avatar,
              bio: data.bio,
            });
          }
        } catch {
          // ignore lookup failure for individual member
        }
      }
      return results;
    };

    const [following, followers] = await Promise.all([
      fetchProfiles(followingUids),
      fetchProfiles(followerUids),
    ]);

    return { following, followers };
  } catch (err) {
    console.warn('fetchUserNetworkFromFirestore warning:', err);
    return { following: [], followers: [] };
  }
}

/**
 * Compute trending hashtags dynamically from posts
 */
export function computeTrendingFromPosts(posts: Post[]): TrendingTopic[] {
  const tagCounts = new Map<string, number>();
  posts.forEach((post) => {
    if (Array.isArray(post.tags)) {
      post.tags.forEach((tag) => {
        if (!tag || !tag.trim()) return;
        const cleaned = tag.startsWith('#') ? tag : `#${tag}`;
        tagCounts.set(cleaned, (tagCounts.get(cleaned) || 0) + 1);
      });
    }
  });

  const sorted = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (sorted.length === 0) {
    return [];
  }

  return sorted.map(([tag, count]) => ({
    tag,
    postsCount: `${count} ${count === 1 ? 'post' : 'posts'}`,
    category: 'Trending',
  }));
}
