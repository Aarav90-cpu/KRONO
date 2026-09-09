var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var PORT = 3e3;
var DB_FILE = import_path.default.join(process.cwd(), "data", "db.json");
var INITIAL_USERS = {
  user_elena: {
    uid: "user_elena",
    name: "Elena Rostova",
    username: "@elena_dev",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Principal Web Architect & Open Source maintainer. Building responsive, accessible cloud apps.",
    followers: ["@marcus_v", "@drsarah", "@kenji_tech"],
    following: ["@marcus_v", "@priya_design"],
    createdAt: new Date(Date.now() - 30 * 864e5).toISOString()
  },
  user_marcus: {
    uid: "user_marcus",
    name: "Marcus Vance",
    username: "@marcus_v",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Urban architecture photographer & digital creative director. Chasing golden hour geometry.",
    followers: ["@elena_dev", "@priya_design"],
    following: ["@elena_dev", "@drsarah", "@kenji_tech"],
    createdAt: new Date(Date.now() - 25 * 864e5).toISOString()
  },
  user_sarah: {
    uid: "user_sarah",
    name: "Dr. Sarah Lin",
    username: "@drsarah",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    bio: "AI researcher & cognitive systems fellow. Exploring autonomous agent loops & grounded verification.",
    followers: ["@elena_dev", "@marcus_v", "@kenji_tech", "@priya_design"],
    following: ["@kenji_tech"],
    createdAt: new Date(Date.now() - 20 * 864e5).toISOString()
  },
  user_kenji: {
    uid: "user_kenji",
    name: "Kenji Sato",
    username: "@kenji_tech",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bio: "Robotics engineer & IoT tinkerer. Low-latency micro-controllers & real-time telemetry systems.",
    followers: ["@drsarah", "@marcus_v"],
    following: ["@drsarah", "@elena_dev"],
    createdAt: new Date(Date.now() - 15 * 864e5).toISOString()
  },
  user_priya: {
    uid: "user_priya",
    name: "Priya Sharma",
    username: "@priya_design",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    bio: "Design Systems Lead & Motion Specialist. Obsessed with typography, spacing math & micro-delight.",
    followers: ["@elena_dev", "@marcus_v"],
    following: ["@elena_dev", "@drsarah"],
    createdAt: new Date(Date.now() - 10 * 864e5).toISOString()
  }
};
var INITIAL_SEED_POSTS = [
  {
    id: "post-seed-1",
    author: {
      id: "user_elena",
      name: "Elena Rostova",
      handle: "@elena_dev",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Principal Web Architect & Open Source maintainer. Building responsive, accessible cloud apps."
    },
    timestamp: "2h ago",
    content: "Just finished migrating our design system tokens to Tailwind v4. The build performance improvements are astronomical \u2014 CSS generation dropped from 1.4s to under 180ms! \u{1F680} Anyone else tested the new CSS-first syntax?",
    mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    tags: ["#webdev", "#frontend", "#tailwind"],
    metrics: {
      likes: 42,
      comments: 2,
      shares: 12,
      isLiked: false,
      isBookmarked: false,
      isReposted: false
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    commentsList: [
      {
        id: "c-seed-1-1",
        author: {
          name: "Kenji Sato",
          handle: "@kenji_tech",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
        },
        timestamp: "1h ago",
        content: "That sub-200ms compilation is a game changer for large monorepos! Did you run into any postcss plugin conflicts?"
      },
      {
        id: "c-seed-1-2",
        author: {
          name: "Priya Sharma",
          handle: "@priya_design",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
        },
        timestamp: "45m ago",
        content: "The font token cascade is so much cleaner now. Loving the new container query syntax too!"
      }
    ]
  },
  {
    id: "post-seed-2",
    author: {
      id: "user_marcus",
      name: "Marcus Vance",
      handle: "@marcus_v",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Urban architecture photographer & digital creative director. Chasing golden hour geometry."
    },
    timestamp: "4h ago",
    content: "Golden hour reflections through the glass atrium in downtown Kyoto. Minimalist structural geometry never fails to inspire my UI layout work. \u{1F4F7}\u2728",
    mediaUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    tags: ["#architecture", "#photography", "#design"],
    metrics: {
      likes: 68,
      comments: 1,
      shares: 15,
      isLiked: false,
      isBookmarked: false,
      isReposted: false
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    commentsList: [
      {
        id: "c-seed-2-1",
        author: {
          name: "Elena Rostova",
          handle: "@elena_dev",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        },
        timestamp: "3h ago",
        content: "The lighting on the second tier fa\xE7ade is stunning Marcus! What lens did you shoot this with?"
      }
    ]
  },
  {
    id: "post-seed-3",
    author: {
      id: "user_sarah",
      name: "Dr. Sarah Lin",
      handle: "@drsarah",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "AI researcher & cognitive systems fellow. Exploring autonomous agent loops & grounded verification."
    },
    timestamp: "6h ago",
    content: "Published our new preprint on autonomous reasoning loops and agent verification! Instead of single-shot generation, multi-stage self-checking reduces hallucination rates by 34%. Link in thread! \u{1F9E0}\u{1F50D}",
    tags: ["#ai", "#research", "#agents"],
    metrics: {
      likes: 95,
      comments: 2,
      shares: 31,
      isLiked: false,
      isBookmarked: false,
      isReposted: false
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    commentsList: [
      {
        id: "c-seed-3-1",
        author: {
          name: "Kenji Sato",
          handle: "@kenji_tech",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
        },
        timestamp: "5h ago",
        content: "Incredible findings Sarah. The self-correction graphs in section 3.2 are particularly promising for robotic pathing."
      },
      {
        id: "c-seed-3-2",
        author: {
          name: "Elena Rostova",
          handle: "@elena_dev",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        },
        timestamp: "4h ago",
        content: "Bookmarking this to read with the team tomorrow morning!"
      }
    ]
  },
  {
    id: "post-seed-4",
    author: {
      id: "user_kenji",
      name: "Kenji Sato",
      handle: "@kenji_tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Robotics engineer & IoT tinkerer. Low-latency micro-controllers & real-time telemetry systems."
    },
    timestamp: "9h ago",
    content: "Calibrating the 6-axis mechanical arm\u2019s haptic feedback controllers today. Sub-millimeter precision achieved with low-latency WebSockets telemetry. \u{1F916} Ready for live testing!",
    mediaUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
    tags: ["#robotics", "#engineering", "#hardware"],
    metrics: {
      likes: 53,
      comments: 1,
      shares: 9,
      isLiked: false,
      isBookmarked: false,
      isReposted: false
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    commentsList: [
      {
        id: "c-seed-4-1",
        author: {
          name: "Marcus Vance",
          handle: "@marcus_v",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        },
        timestamp: "7h ago",
        content: "That hardware chassis looks sleek! Love the matte black finish."
      }
    ]
  },
  {
    id: "post-seed-5",
    author: {
      id: "user_priya",
      name: "Priya Sharma",
      handle: "@priya_design",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Design Systems Lead & Motion Specialist. Obsessed with typography, spacing math & micro-delight."
    },
    timestamp: "12h ago",
    content: "Micro-interactions are the silent heroes of user delight. Notice how a 200ms spring physics curve feels so much more organic than a linear transition. What is your favorite easing curve? \u2728",
    tags: ["#design", "#uiux", "#motion"],
    metrics: {
      likes: 37,
      comments: 1,
      shares: 7,
      isLiked: false,
      isBookmarked: false,
      isReposted: false
    },
    likedBy: [],
    bookmarkedBy: [],
    repostedBy: [],
    commentsList: [
      {
        id: "c-seed-5-1",
        author: {
          name: "Elena Rostova",
          handle: "@elena_dev",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        },
        timestamp: "10h ago",
        content: "Spring easing with damping ratio of 0.7 is my absolute sweet spot for popovers and dialogs!"
      }
    ]
  }
];
function readDb() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      const initialDb = {
        posts: INITIAL_SEED_POSTS,
        users: INITIAL_USERS
      };
      import_fs.default.mkdirSync(import_path.default.dirname(DB_FILE), { recursive: true });
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
    const db = JSON.parse(data);
    let dirty = false;
    if (!Array.isArray(db.posts) || db.posts.length === 0) {
      db.posts = INITIAL_SEED_POSTS;
      dirty = true;
    }
    if (!db.users || Object.keys(db.users).length === 0) {
      db.users = { ...INITIAL_USERS };
      dirty = true;
    } else {
      for (const [k, v] of Object.entries(INITIAL_USERS)) {
        if (!db.users[k]) {
          db.users[k] = v;
          dirty = true;
        }
      }
    }
    if (dirty) {
      writeDb(db);
    }
    return db;
  } catch (err) {
    console.error("Error reading database file:", err);
    return { posts: INITIAL_SEED_POSTS, users: INITIAL_USERS };
  }
}
function writeDb(db) {
  try {
    import_fs.default.mkdirSync(import_path.default.dirname(DB_FILE), { recursive: true });
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  readDb();
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/posts", (req, res) => {
    const db = readDb();
    const userId = req.query.userId;
    const posts = db.posts.map((p) => {
      const isLiked = userId && p.likedBy ? p.likedBy.includes(userId) : false;
      const isBookmarked = userId && p.bookmarkedBy ? p.bookmarkedBy.includes(userId) : false;
      const isReposted = userId && p.repostedBy ? p.repostedBy.includes(userId) : false;
      return {
        ...p,
        metrics: {
          ...p.metrics,
          isLiked: isLiked || p.metrics.isLiked || false,
          isBookmarked: isBookmarked || p.metrics.isBookmarked || false,
          isReposted: isReposted || p.metrics.isReposted || false
        }
      };
    });
    res.json({ success: true, posts });
  });
  app.post("/api/posts", (req, res) => {
    const { content, mediaUrl, tags, author, userId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }
    const db = readDb();
    const newPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: {
        id: userId || author?.id,
        name: author?.name || "Krono Member",
        handle: author?.handle || author?.username || "@member",
        avatar: author?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ",
        verified: true,
        bio: author?.bio
      },
      timestamp: "Just now",
      content: content.trim(),
      mediaUrl: mediaUrl?.trim() || void 0,
      tags: (() => {
        const extracted = [];
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
        isReposted: false
      },
      likedBy: [],
      bookmarkedBy: [],
      repostedBy: [],
      commentsList: []
    };
    db.posts.unshift(newPost);
    writeDb(db);
    res.status(201).json({ success: true, post: newPost });
  });
  app.post("/api/posts/:id/like", (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;
    const db = readDb();
    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = db.posts[postIndex];
    if (!post.likedBy) post.likedBy = [];
    const effectiveUserId = userId || "anonymous_user";
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
  app.post("/api/posts/:id/bookmark", (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;
    const db = readDb();
    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = db.posts[postIndex];
    if (!post.bookmarkedBy) post.bookmarkedBy = [];
    const effectiveUserId = userId || "anonymous_user";
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
  app.post("/api/posts/:id/repost", (req, res) => {
    const postId = req.params.id;
    const { userId, userName, userHandle, userAvatar, quoteContent } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "User must be authenticated to repost" });
    }
    const db = readDb();
    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Post not found" });
    }
    const originalPost = db.posts[postIndex];
    if (!originalPost.repostedBy) originalPost.repostedBy = [];
    if (quoteContent && typeof quoteContent === "string" && quoteContent.trim()) {
      const extractedTags = [];
      const matches = quoteContent.match(/#([a-zA-Z0-9_\u0080-\uFFFF]+)/g);
      if (matches) extractedTags.push(...matches);
      const quotePost = {
        id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        author: {
          id: userId,
          name: userName || "Member",
          handle: userHandle || "@member",
          avatar: userAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ",
          verified: true
        },
        timestamp: "Just now",
        content: quoteContent.trim(),
        tags: Array.from(new Set(extractedTags)),
        metrics: {
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isBookmarked: false,
          isReposted: false
        },
        quotedPost: {
          id: originalPost.id,
          author: {
            id: originalPost.author.id,
            name: originalPost.author.name,
            handle: originalPost.author.handle,
            avatar: originalPost.author.avatar,
            verified: originalPost.author.verified
          },
          content: originalPost.content,
          mediaUrl: originalPost.mediaUrl,
          timestamp: originalPost.timestamp
        },
        likedBy: [],
        bookmarkedBy: [],
        repostedBy: [],
        commentsList: []
      };
      originalPost.metrics.shares += 1;
      db.posts.unshift(quotePost);
      writeDb(db);
      return res.status(201).json({
        success: true,
        isQuote: true,
        post: quotePost,
        metrics: originalPost.metrics
      });
    }
    const hasReposted = originalPost.repostedBy.includes(userId);
    if (hasReposted) {
      originalPost.repostedBy = originalPost.repostedBy.filter((uid) => uid !== userId);
      originalPost.metrics.shares = Math.max(0, originalPost.metrics.shares - 1);
      originalPost.metrics.isReposted = false;
      db.posts = db.posts.filter(
        (p) => !(p.repost && p.repost.originalPostId === postId && p.repost.reposterId === userId)
      );
      writeDb(db);
      return res.json({
        success: true,
        isReposted: false,
        metrics: originalPost.metrics
      });
    } else {
      originalPost.repostedBy.push(userId);
      originalPost.metrics.shares += 1;
      originalPost.metrics.isReposted = true;
      const repostItem = {
        id: `repost-${userId}-${postId}-${Date.now()}`,
        author: originalPost.author,
        timestamp: originalPost.timestamp,
        content: originalPost.content,
        mediaUrl: originalPost.mediaUrl,
        tags: originalPost.tags,
        metrics: {
          ...originalPost.metrics,
          isReposted: true
        },
        likedBy: originalPost.likedBy,
        bookmarkedBy: originalPost.bookmarkedBy,
        repostedBy: originalPost.repostedBy,
        commentsList: originalPost.commentsList,
        repost: {
          originalPostId: originalPost.id,
          reposterId: userId,
          reposterName: userName || "Member",
          reposterHandle: userHandle || "@member",
          timestamp: "Just now"
        }
      };
      db.posts.unshift(repostItem);
      writeDb(db);
      return res.json({
        success: true,
        isReposted: true,
        metrics: originalPost.metrics,
        repostItem
      });
    }
  });
  app.post("/api/posts/:id/comments", (req, res) => {
    const postId = req.params.id;
    const { content, author } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }
    const db = readDb();
    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Post not found" });
    }
    const post = db.posts[postIndex];
    if (!post.commentsList) post.commentsList = [];
    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: {
        name: author?.name || "Aarav Ravindra Kharade",
        handle: author?.handle || author?.username || "@aarav",
        avatar: author?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ"
      },
      timestamp: "Just now",
      content: content.trim()
    };
    post.commentsList.push(newComment);
    post.metrics.comments = post.commentsList.length;
    writeDb(db);
    res.status(201).json({ success: true, comment: newComment, post });
  });
  app.get("/api/trending", (_req, res) => {
    const db = readDb();
    const tagCounts = {};
    db.posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    const trending = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({
      tag,
      postsCount: `${count} ${count === 1 ? "post" : "posts"}`,
      category: "Trending"
    }));
    res.json({ success: true, trending });
  });
  app.get("/api/users", (req, res) => {
    const db = readDb();
    const currentUid = req.query.currentUid;
    const currentUser = currentUid ? db.users[currentUid] : null;
    const currentFollowing = Array.isArray(currentUser?.following) ? currentUser.following : [];
    const authorsMap = /* @__PURE__ */ new Map();
    for (const post of db.posts || []) {
      if (post.author?.handle) {
        const handle = post.author.handle;
        if (!authorsMap.has(handle.toLowerCase())) {
          authorsMap.set(handle.toLowerCase(), {
            id: post.author.id || handle,
            name: post.author.name || handle.replace("@", ""),
            handle,
            avatar: post.author.avatar || "",
            bio: post.author.bio || "",
            followers: [],
            following: []
          });
        }
      }
    }
    const allUsersMap = /* @__PURE__ */ new Map();
    for (const [handleKey, authUser] of authorsMap.entries()) {
      allUsersMap.set(handleKey, authUser);
    }
    for (const user of Object.values(db.users || {})) {
      if (user && user.uid) {
        const u = user;
        const key = (u.username || u.handle || u.uid).toLowerCase();
        allUsersMap.set(key, {
          id: u.uid,
          name: u.name || "Member",
          handle: u.username || u.handle || `@user_${u.uid.slice(0, 5)}`,
          avatar: u.avatar || "",
          bio: u.bio || "",
          followers: Array.isArray(u.followers) ? u.followers : [],
          following: Array.isArray(u.following) ? u.following : []
        });
      }
    }
    const usersList = Array.from(allUsersMap.values()).filter((u) => {
      if (!currentUid) return true;
      if (u.id === currentUid) return false;
      if (currentUser && (currentUser.username?.toLowerCase() === u.handle.toLowerCase() || currentUser.handle?.toLowerCase() === u.handle.toLowerCase())) {
        return false;
      }
      return true;
    }).map((u) => {
      const isFollowing = currentFollowing.includes(u.id) || currentFollowing.includes(u.handle);
      return {
        id: u.id,
        name: u.name,
        handle: u.handle,
        avatar: u.avatar,
        bio: u.bio,
        followersCount: u.followers.length,
        followingCount: u.following.length,
        isFollowing
      };
    });
    res.json({ success: true, users: usersList });
  });
  app.post("/api/users/follow", (req, res) => {
    const { currentUid, targetIdOrHandle, currentHandle, currentName, targetName, targetAvatar } = req.body;
    if (!currentUid || !targetIdOrHandle) {
      return res.status(400).json({ error: "currentUid and targetIdOrHandle are required" });
    }
    const db = readDb();
    if (!db.users[currentUid]) {
      db.users[currentUid] = {
        uid: currentUid,
        name: currentName || "User",
        username: currentHandle || `@user_${currentUid.slice(0, 5)}`,
        followers: [],
        following: [],
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    if (!Array.isArray(db.users[currentUid].following)) {
      db.users[currentUid].following = [];
    }
    if (!Array.isArray(db.users[currentUid].followers)) {
      db.users[currentUid].followers = [];
    }
    let targetUid = targetIdOrHandle;
    let targetUser = db.users[targetIdOrHandle];
    if (!targetUser) {
      const found = Object.values(db.users).find(
        (u) => u.username?.toLowerCase() === targetIdOrHandle.toLowerCase() || u.handle?.toLowerCase() === targetIdOrHandle.toLowerCase()
      );
      if (found) {
        targetUser = found;
        targetUid = found.uid;
      } else {
        db.users[targetIdOrHandle] = {
          uid: targetIdOrHandle,
          name: targetName || targetIdOrHandle.replace("@", ""),
          username: targetIdOrHandle.startsWith("@") ? targetIdOrHandle : `@${targetIdOrHandle}`,
          avatar: targetAvatar || "",
          followers: [],
          following: [],
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        targetUser = db.users[targetIdOrHandle];
        targetUid = targetIdOrHandle;
      }
    }
    if (!Array.isArray(targetUser.followers)) {
      targetUser.followers = [];
    }
    if (!Array.isArray(targetUser.following)) {
      targetUser.following = [];
    }
    const targetHandle = targetUser.username || targetUser.handle || targetIdOrHandle;
    const currentIdentity = db.users[currentUid].username || currentHandle || currentUid;
    const isCurrentlyFollowing = db.users[currentUid].following.includes(targetUid) || db.users[currentUid].following.includes(targetHandle);
    let isFollowing = false;
    if (isCurrentlyFollowing) {
      db.users[currentUid].following = db.users[currentUid].following.filter(
        (id) => id !== targetUid && id !== targetHandle
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id !== currentUid && id !== currentIdentity && id !== currentHandle
      );
      isFollowing = false;
    } else {
      db.users[currentUid].following.push(targetUid);
      if (targetHandle !== targetUid && !db.users[currentUid].following.includes(targetHandle)) {
        db.users[currentUid].following.push(targetHandle);
      }
      if (!targetUser.followers.includes(currentIdentity)) {
        targetUser.followers.push(currentIdentity);
      }
      if (!targetUser.followers.includes(currentUid)) {
        targetUser.followers.push(currentUid);
      }
      isFollowing = true;
    }
    writeDb(db);
    res.json({
      success: true,
      isFollowing,
      targetFollowersCount: targetUser.followers.length,
      currentFollowingCount: db.users[currentUid].following.length,
      followingList: db.users[currentUid].following
    });
  });
  app.get("/api/users/:uid/network", (req, res) => {
    const uid = req.params.uid;
    const db = readDb();
    let user = db.users[uid];
    if (!user) {
      user = Object.values(db.users).find(
        (u) => u.username?.toLowerCase() === uid.toLowerCase() || u.handle?.toLowerCase() === uid.toLowerCase()
      );
    }
    if (!user) {
      return res.json({ success: true, followers: [], following: [] });
    }
    const followingKeys = Array.isArray(user.following) ? user.following : [];
    const followerKeys = Array.isArray(user.followers) ? user.followers : [];
    const resolveMember = (key) => {
      const found = db.users[key] || Object.values(db.users).find(
        (u) => u.username?.toLowerCase() === key.toLowerCase() || u.handle?.toLowerCase() === key.toLowerCase()
      );
      if (found) {
        return {
          id: found.uid,
          name: found.name || "Member",
          handle: found.username || found.handle || `@${key}`,
          avatar: found.avatar || "",
          bio: found.bio || ""
        };
      }
      return {
        id: key,
        name: key.replace("@", ""),
        handle: key.startsWith("@") ? key : `@${key}`,
        avatar: "",
        bio: ""
      };
    };
    const uniqueFollowing = Array.from(
      new Map(followingKeys.map(resolveMember).map((u) => [u.handle.toLowerCase(), u])).values()
    );
    const uniqueFollowers = Array.from(
      new Map(followerKeys.map(resolveMember).map((u) => [u.handle.toLowerCase(), u])).values()
    );
    res.json({
      success: true,
      following: uniqueFollowing,
      followers: uniqueFollowers
    });
  });
  app.get("/api/users/:uid", (req, res) => {
    const uid = req.params.uid;
    const db = readDb();
    let user = db.users[uid];
    if (!user) {
      user = Object.values(db.users).find(
        (u) => u.username?.toLowerCase() === uid.toLowerCase() || u.handle?.toLowerCase() === uid.toLowerCase()
      );
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const following = Array.isArray(user.following) ? user.following : [];
    const followers = Array.isArray(user.followers) ? user.followers : [];
    res.json({
      success: true,
      user: {
        ...user,
        following,
        followers,
        followingCount: following.length,
        followersCount: followers.length
      }
    });
  });
  app.post("/api/users/:uid", (req, res) => {
    const uid = req.params.uid;
    const profileData = req.body;
    const db = readDb();
    const existing = db.users[uid] || {};
    db.users[uid] = {
      ...existing,
      ...profileData,
      uid,
      following: Array.isArray(profileData.following) ? profileData.following : Array.isArray(existing.following) ? existing.following : [],
      followers: Array.isArray(profileData.followers) ? profileData.followers : Array.isArray(existing.followers) ? existing.followers : [],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    writeDb(db);
    res.json({ success: true, user: db.users[uid] });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Krono backend server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
