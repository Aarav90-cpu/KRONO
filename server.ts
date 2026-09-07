import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Types
export interface PostComment {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
}

export interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    bio?: string;
  };
  timestamp: string;
  content: string;
  mediaUrl?: string;
  tags?: string[];
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  likedBy?: string[];
  bookmarkedBy?: string[];
  commentsList?: PostComment[];
}

export interface DatabaseSchema {
  posts: Post[];
  users: Record<string, any>;
}

// Initial seed data if database file does not exist (starts completely empty)
const INITIAL_SEED_POSTS: Post[] = [];

// Helper to read database
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        posts: [],
        users: {},
      };
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { posts: [], users: {} };
  }
}

// Helper to write database
function writeDb(db: DatabaseSchema) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GET /api/posts - Get all posts
  app.get('/api/posts', (req: Request, res: Response) => {
    const db = readDb();
    const userId = req.query.userId as string | undefined;

    // Map user specific metrics if userId provided
    const posts = db.posts.map((p) => {
      const isLiked = userId && p.likedBy ? p.likedBy.includes(userId) : false;
      const isBookmarked = userId && p.bookmarkedBy ? p.bookmarkedBy.includes(userId) : false;
      return {
        ...p,
        metrics: {
          ...p.metrics,
          isLiked: isLiked || p.metrics.isLiked || false,
          isBookmarked: isBookmarked || p.metrics.isBookmarked || false,
        },
      };
    });

    res.json({ success: true, posts });
  });

  // POST /api/posts - Create a new post
  app.post('/api/posts', (req: Request, res: Response) => {
    const { content, mediaUrl, tags, author, userId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const db = readDb();

    const newPost: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: {
        name: author?.name || 'Krono Member',
        handle: author?.handle || author?.username || '@member',
        avatar:
          author?.avatar ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ',
        verified: true,
        bio: author?.bio,
      },
      timestamp: 'Just now',
      content: content.trim(),
      mediaUrl: mediaUrl?.trim() || undefined,
      tags: (() => {
        const extracted: string[] = [];
        const matches = content.match(/#([a-zA-Z0-9_\u0080-\uFFFF]+)/g);
        if (matches) {
          extracted.push(...matches);
        }
        if (Array.isArray(tags)) {
          extracted.push(...tags);
        }
        return Array.from(new Set(extracted.filter(Boolean)));
      })(),
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false,
      },
      likedBy: [],
      bookmarkedBy: [],
      commentsList: [],
    };

    db.posts.unshift(newPost);
    writeDb(db);

    res.status(201).json({ success: true, post: newPost });
  });

  // POST /api/posts/:id/like - Toggle like on post
  app.post('/api/posts/:id/like', (req: Request, res: Response) => {
    const postId = req.params.id;
    const { userId } = req.body;
    const db = readDb();

    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = db.posts[postIndex];
    if (!post.likedBy) post.likedBy = [];

    const effectiveUserId = userId || 'anonymous_user';
    const hasLiked = post.likedBy.includes(effectiveUserId);

    if (hasLiked) {
      post.likedBy = post.likedBy.filter((uid) => uid !== effectiveUserId);
      post.metrics.likes = Math.max(0, post.metrics.likes - 1);
      post.metrics.isLiked = false;
    } else {
      post.likedBy.push(effectiveUserId);
      post.metrics.likes += 1;
      post.metrics.isLiked = true;
    }

    writeDb(db);
    res.json({ success: true, metrics: post.metrics, isLiked: !hasLiked });
  });

  // POST /api/posts/:id/bookmark - Toggle bookmark on post
  app.post('/api/posts/:id/bookmark', (req: Request, res: Response) => {
    const postId = req.params.id;
    const { userId } = req.body;
    const db = readDb();

    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = db.posts[postIndex];
    if (!post.bookmarkedBy) post.bookmarkedBy = [];

    const effectiveUserId = userId || 'anonymous_user';
    const hasBookmarked = post.bookmarkedBy.includes(effectiveUserId);

    if (hasBookmarked) {
      post.bookmarkedBy = post.bookmarkedBy.filter((uid) => uid !== effectiveUserId);
      post.metrics.isBookmarked = false;
    } else {
      post.bookmarkedBy.push(effectiveUserId);
      post.metrics.isBookmarked = true;
    }

    writeDb(db);
    res.json({ success: true, metrics: post.metrics, isBookmarked: !hasBookmarked });
  });

  // POST /api/posts/:id/comments - Add comment to post
  app.post('/api/posts/:id/comments', (req: Request, res: Response) => {
    const postId = req.params.id;
    const { content, author } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const db = readDb();
    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = db.posts[postIndex];
    if (!post.commentsList) post.commentsList = [];

    const newComment: PostComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: {
        name: author?.name || 'Aarav Ravindra Kharade',
        handle: author?.handle || author?.username || '@aarav',
        avatar:
          author?.avatar ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ',
      },
      timestamp: 'Just now',
      content: content.trim(),
    };

    post.commentsList.push(newComment);
    post.metrics.comments = post.commentsList.length;

    writeDb(db);
    res.status(201).json({ success: true, comment: newComment, post });
  });

  // GET /api/trending - Get trending topics calculated from actual posts
  app.get('/api/trending', (_req: Request, res: Response) => {
    const db = readDb();
    const tagCounts: Record<string, number> = {};

    db.posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const trending = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({
        tag,
        postsCount: `${count} ${count === 1 ? 'post' : 'posts'}`,
        category: 'Trending',
      }));

    res.json({ success: true, trending });
  });

  // GET /api/users - Get registered real community members
  app.get('/api/users', (req: Request, res: Response) => {
    const db = readDb();
    const currentUid = req.query.currentUid as string | undefined;
    const usersList = Object.values(db.users || {})
      .filter((u: any) => u && (!currentUid || u.uid !== currentUid))
      .map((u: any) => ({
        id: u.uid,
        name: u.name || 'Community Member',
        handle: u.username || '@member',
        avatar: u.avatar || '',
        bio: u.bio || '',
        isFollowing: false,
      }));
    res.json({ success: true, users: usersList });
  });

  // GET /api/users/:uid - Get user profile
  app.get('/api/users/:uid', (req: Request, res: Response) => {
    const uid = req.params.uid;
    const db = readDb();
    const user = db.users[uid];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user });
  });

  // POST /api/users/:uid - Save/update user profile
  app.post('/api/users/:uid', (req: Request, res: Response) => {
    const uid = req.params.uid;
    const profileData = req.body;
    const db = readDb();

    db.users[uid] = {
      ...(db.users[uid] || {}),
      ...profileData,
      uid,
      updatedAt: new Date().toISOString(),
    };

    writeDb(db);
    res.json({ success: true, user: db.users[uid] });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Krono backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
