import { Post, PostComment, TrendingTopic, AuthUserProfile } from '../types';

/**
 * Real backend API client for KRONO Social
 */

export async function fetchPostsFromBackend(userId?: string): Promise<Post[]> {
  try {
    const url = userId ? `/api/posts?userId=${encodeURIComponent(userId)}` : '/api/posts';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.warn('Backend fetch failed, checking local backup:', err);
    try {
      const backup = localStorage.getItem('krono_posts_cache');
      if (backup) return JSON.parse(backup);
    } catch {
      // ignore
    }
    return [];
  }
}

export async function createPostOnBackend(
  postData: { content: string; mediaUrl?: string; tags?: string[] },
  author?: { name?: string; handle?: string; avatar?: string; bio?: string },
  userId?: string
): Promise<Post | null> {
  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...postData,
        author,
        userId,
      }),
    });
    if (!res.ok) throw new Error(`Failed to create post: ${res.statusText}`);
    const data = await res.json();
    return data.post;
  } catch (err) {
    console.error('Error creating post on backend:', err);
    throw err;
  }
}

export async function likePostOnBackend(
  postId: string,
  userId?: string
): Promise<{ likes: number; isLiked: boolean } | null> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`Failed to like post: ${res.statusText}`);
    const data = await res.json();
    return { likes: data.metrics.likes, isLiked: data.isLiked };
  } catch (err) {
    console.error('Error liking post on backend:', err);
    return null;
  }
}

export async function bookmarkPostOnBackend(
  postId: string,
  userId?: string
): Promise<{ isBookmarked: boolean } | null> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`Failed to bookmark post: ${res.statusText}`);
    const data = await res.json();
    return { isBookmarked: data.isBookmarked };
  } catch (err) {
    console.error('Error bookmarking post on backend:', err);
    return null;
  }
}

export async function addCommentOnBackend(
  postId: string,
  content: string,
  author?: { name?: string; handle?: string; avatar?: string },
  userId?: string
): Promise<{ comment: PostComment; post: Post; commentsList?: PostComment[] } | null> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author, userId }),
    });
    if (!res.ok) throw new Error(`Failed to add comment: ${res.statusText}`);
    const data = await res.json();
    return {
      comment: data.comment,
      post: data.post,
      commentsList: data.commentsList || data.post?.commentsList || [],
    };
  } catch (err) {
    console.error('Error adding comment on backend:', err);
    throw err;
  }
}

export async function fetchPostCommentsFromBackend(postId: string): Promise<PostComment[]> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.comments || [];
  } catch (err) {
    console.warn('Failed to fetch comments for post from backend:', err);
    return [];
  }
}

export async function searchUsersOnBackend(
  query: string,
  currentUid?: string
): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (currentUid) params.set('currentUid', currentUid);

    const res = await fetch(`/api/users/search?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.warn('Failed to search users on backend:', err);
    return [];
  }
}

/**
 * Image upload client with strict <100MB validation
 */
export const MAX_ALLOWED_IMAGE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export async function uploadImageToBackend(
  fileOrDataUrl: File | string,
  filename?: string
): Promise<{ url: string; size: number }> {
  let dataUrl = '';
  let size = 0;
  let name = filename || 'upload.png';

  if (typeof fileOrDataUrl !== 'string') {
    const file = fileOrDataUrl;
    size = file.size;
    name = file.name || name;

    // Strict client-side validation for <100MB
    if (size >= MAX_ALLOWED_IMAGE_SIZE_BYTES) {
      const sizeMb = (size / (1024 * 1024)).toFixed(1);
      throw new Error(`Image size (${sizeMb}MB) exceeds the 100MB limit. Please choose a file smaller than 100MB.`);
    }

    // Convert file to Data URL
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  } else {
    dataUrl = fileOrDataUrl;
    const base64Index = dataUrl.indexOf('base64,');
    if (base64Index !== -1) {
      const base64Str = dataUrl.slice(base64Index + 7);
      size = Math.ceil((base64Str.length * 3) / 4);
    } else {
      size = dataUrl.length;
    }

    if (size >= MAX_ALLOWED_IMAGE_SIZE_BYTES) {
      const sizeMb = (size / (1024 * 1024)).toFixed(1);
      throw new Error(`Image size (${sizeMb}MB) exceeds the 100MB limit. Please choose an image smaller than 100MB.`);
    }
  }

  // Send to backend endpoint for server validation and storage
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, filename: name, size }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${res.status}`);
  }

  const result = await res.json();
  return { url: result.url, size: result.size || size };
}

export async function fetchTrendingFromBackend(): Promise<TrendingTopic[]> {
  try {
    const res = await fetch('/api/trending');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.trending || [];
  } catch (err) {
    console.warn('Failed to fetch trending from backend:', err);
    return [];
  }
}

export async function fetchSuggestedUsersFromBackend(currentUid?: string): Promise<any[]> {
  try {
    const url = currentUid ? `/api/users?currentUid=${encodeURIComponent(currentUid)}` : '/api/users';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.users || [];
  } catch (err) {
    console.warn('Failed to fetch users from backend:', err);
    return [];
  }
}

export async function saveUserProfileToBackend(profile: AuthUserProfile): Promise<void> {
  try {
    await fetch(`/api/users/${encodeURIComponent(profile.uid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  } catch (err) {
    console.warn('Failed to save profile to backend:', err);
  }
}

export async function fetchUserProfileFromBackend(uid: string): Promise<AuthUserProfile | null> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(uid)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn('Failed to fetch user profile from backend:', err);
    return null;
  }
}

export async function toggleFollowOnBackend(
  currentUid: string,
  targetIdOrHandle: string,
  currentHandle?: string,
  currentName?: string,
  targetName?: string,
  targetAvatar?: string
): Promise<{
  success: boolean;
  isFollowing: boolean;
  targetFollowersCount: number;
  currentFollowingCount: number;
  followingList: string[];
} | null> {
  try {
    const res = await fetch('/api/users/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentUid,
        targetIdOrHandle,
        currentHandle,
        currentName,
        targetName,
        targetAvatar,
      }),
    });
    if (!res.ok) throw new Error(`Follow request failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Error in toggleFollowOnBackend:', err);
    return null;
  }
}

export async function fetchUserNetworkFromBackend(uid: string): Promise<{
  following: Array<{ id: string; name: string; handle: string; avatar: string; bio?: string }>;
  followers: Array<{ id: string; name: string; handle: string; avatar: string; bio?: string }>;
}> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(uid)}/network`);
    if (!res.ok) return { following: [], followers: [] };
    const data = await res.json();
    return {
      following: data.following || [],
      followers: data.followers || [],
    };
  } catch (err) {
    console.warn('Failed to fetch user network:', err);
    return { following: [], followers: [] };
  }
}

export async function repostPostOnBackend(
  postId: string,
  user: { uid: string; name: string; username: string; avatar?: string },
  quoteContent?: string
): Promise<{
  success: boolean;
  isReposted?: boolean;
  isQuote?: boolean;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    isReposted?: boolean;
  };
  post?: Post;
  repostItem?: Post;
} | null> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/repost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        userName: user.name,
        userHandle: user.username,
        userAvatar: user.avatar,
        quoteContent,
      }),
    });
    if (!res.ok) throw new Error(`Repost request failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Error in repostPostOnBackend:', err);
    return null;
  }
}

