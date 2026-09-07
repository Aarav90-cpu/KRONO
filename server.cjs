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
function readDb() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      const initialDb = {
        posts: [],
        users: {}
      };
      import_fs.default.mkdirSync(import_path.default.dirname(DB_FILE), { recursive: true });
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return { posts: [], users: {} };
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
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/posts", (req, res) => {
    const db = readDb();
    const userId = req.query.userId;
    const posts = db.posts.map((p) => {
      const isLiked = userId && p.likedBy ? p.likedBy.includes(userId) : false;
      const isBookmarked = userId && p.bookmarkedBy ? p.bookmarkedBy.includes(userId) : false;
      return {
        ...p,
        metrics: {
          ...p.metrics,
          isLiked: isLiked || p.metrics.isLiked || false,
          isBookmarked: isBookmarked || p.metrics.isBookmarked || false
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
        isBookmarked: false
      },
      likedBy: [],
      bookmarkedBy: [],
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
