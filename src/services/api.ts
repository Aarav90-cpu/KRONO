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
  author?: { name?: string; handle?: string; avatar?: string }
): Promise<{ comment: PostComment; post: Post } | null> {
  try {
    const res = await fetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author }),
    });
    if (!res.ok) throw new Error(`Failed to add comment: ${res.statusText}`);
    const data = await res.json();
    return { comment: data.comment, post: data.post };
  } catch (err) {
    console.error('Error adding comment on backend:', err);
    throw err;
  }
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
