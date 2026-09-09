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
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Post, AuthUserProfile, SuggestedUser, PostComment, TrendingTopic } from '../types';

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

/**
 * Realtime subscription to community posts in Firestore
 */
export function subscribeToFirestorePosts(
  currentUserUid: string | undefined,
  onUpdate: (posts: Post[]) => void,
  onError?: (err: unknown) => void
) {
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

      onUpdate(postsList);
    },
    (error) => {
      console.error('Firestore posts subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'posts');
    }
  );
}

/**
 * Publish a new Post to Firestore
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

  try {
    await setDoc(postRef, payload);
    return newPostId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `posts/${newPostId}`);
  }
}

/**
 * Toggle like for a post in Firestore
 */
export async function toggleFirestoreLike(
  postId: string,
  userUid: string
): Promise<{ isLiked: boolean; count: number }> {
  const postRef = doc(db, 'posts', postId);
  try {
    const snap = await getDoc(postRef);
    if (!snap.exists()) {
      throw new Error(`Post ${postId} does not exist.`);
    }
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
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
  }
}

/**
 * Toggle bookmark for a post in Firestore
 */
export async function toggleFirestoreBookmark(
  postId: string,
  userUid: string
): Promise<{ isBookmarked: boolean }> {
  const postRef = doc(db, 'posts', postId);
  try {
    const snap = await getDoc(postRef);
    if (!snap.exists()) {
      throw new Error(`Post ${postId} does not exist.`);
    }
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
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
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
  const originalRef = doc(db, 'posts', originalPostId);
  try {
    const snap = await getDoc(originalRef);
    if (!snap.exists()) {
      throw new Error(`Original post ${originalPostId} does not exist.`);
    }
    const data = snap.data();
    const repostedBy: string[] = Array.isArray(data.repostedBy) ? [...data.repostedBy] : [];
    const index = repostedBy.indexOf(currentUser.uid);

    // If it's a Quote Post (has custom comment)
    if (quoteComment && quoteComment.trim()) {
      const quotePostId = `post_quote_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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
        quotedPost: {
          id: originalPostId,
          author: {
            id: data.authorId || '',
            name: data.authorName || 'Author',
            handle: data.authorHandle || '@author',
            avatar: data.authorAvatar || '',
            verified: Boolean(data.authorVerified),
          },
          content: data.content || '',
          mediaUrl: data.mediaUrl || undefined,
          timestamp: data.timestamp || 'earlier',
        },
        repost: null,
        commentsList: [],
      });

      // Increment shares on original
      await updateDoc(originalRef, {
        sharesCount: (data.sharesCount || 0) + 1,
      });

      return { isReposted: true, sharesCount: (data.sharesCount || 0) + 1 };
    }

    // Direct Repost toggle
    let isReposted = false;
    if (index >= 0) {
      repostedBy.splice(index, 1);
      isReposted = false;
    } else {
      repostedBy.push(currentUser.uid);
      isReposted = true;
    }

    const newSharesCount = Math.max(0, repostedBy.length);
    await updateDoc(originalRef, {
      repostedBy,
      sharesCount: newSharesCount,
    });

    // If direct reposting, also create a feed entry representing the repost
    if (isReposted) {
      const repostDocId = `repost_${currentUser.uid}_${originalPostId}`;
      const repostRef = doc(db, 'posts', repostDocId);
      await setDoc(repostRef, {
        id: repostDocId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorHandle: data.authorHandle,
        authorAvatar: data.authorAvatar,
        authorVerified: Boolean(data.authorVerified),
        content: data.content,
        mediaUrl: data.mediaUrl || '',
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
        timestamp: data.timestamp || 'just now',
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
        sharesCount: newSharesCount,
        likedBy: data.likedBy || [],
        bookmarkedBy: data.bookmarkedBy || [],
        repostedBy,
        repost: {
          originalPostId,
          reposterId: currentUser.uid,
          reposterName: currentUser.name,
          reposterHandle: currentUser.username,
          timestamp: 'just now',
        },
        quotedPost: null,
        commentsList: data.commentsList || [],
      });
    } else {
      // Clean up the direct repost doc
      const repostDocId = `repost_${currentUser.uid}_${originalPostId}`;
      try {
        await deleteDoc(doc(db, 'posts', repostDocId));
      } catch {
        // ignore if not found
      }
    }

    return { isReposted, sharesCount: newSharesCount };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `posts/${originalPostId}`);
  }
}

/**
 * Add a comment to a post in Firestore
 */
export async function addFirestoreComment(
  postId: string,
  commentData: {
    author: { name: string; handle: string; avatar: string };
    content: string;
  }
): Promise<PostComment> {
  const postRef = doc(db, 'posts', postId);
  try {
    const snap = await getDoc(postRef);
    if (!snap.exists()) {
      throw new Error(`Post ${postId} does not exist`);
    }
    const data = snap.data();
    const commentsList: PostComment[] = Array.isArray(data.commentsList)
      ? [...data.commentsList]
      : [];

    const newComment: PostComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      author: commentData.author,
      timestamp: 'just now',
      content: commentData.content.slice(0, 1000),
    };

    commentsList.push(newComment);

    await updateDoc(postRef, {
      commentsList,
      commentsCount: commentsList.length,
    });

    return newComment;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
  }
}

/**
 * Save or sync user profile in Firestore
 */
export async function syncUserProfileToFirestore(
  profile: AuthUserProfile
): Promise<void> {
  const userRef = doc(db, 'users', profile.uid);
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
    handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
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
