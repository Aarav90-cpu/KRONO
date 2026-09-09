# Security Specification for Firestore Rules

## 1. Data Invariants
1. `users/{userId}`: Document ID must match `request.auth.uid`. Users can only create or update their own profile document.
2. `posts/{postId}`: Document creation requires `request.auth.uid == incoming().authorId`. Content must be non-empty and <= 2000 chars.
3. Post updates:
   - Author can update content, mediaUrl, tags.
   - Any authenticated user can toggle like, bookmark, or repost metrics within bounded operations (`likedBy`, `bookmarkedBy`, `repostedBy`, `likesCount`, `sharesCount`).
4. `posts/{postId}/comments/{commentId}`: Can only be created by an authenticated user where `authorId == request.auth.uid`.
5. System-wide default deny: All collections not explicitly matched are closed to read and write.

## 2. Dirty Dozen Payloads
1. User profile creation with mismatched UID (`userId != request.auth.uid`) -> REJECT.
2. User profile update by a different user (`auth.uid != userId`) -> REJECT.
3. Post creation by unauthenticated user (`auth == null`) -> REJECT.
4. Post creation with spoofed authorId (`incoming().authorId != auth.uid`) -> REJECT.
5. Post creation with oversized content (> 2000 chars) -> REJECT.
6. Post deletion by non-author (`auth.uid != existing().authorId`) -> REJECT.
7. Post update mutating immutable `authorId` (`incoming().authorId != existing().authorId`) -> REJECT.
8. Comment creation with spoofed authorId (`incoming().authorId != auth.uid`) -> REJECT.
9. Comment update by non-author -> REJECT.
10. Malicious document creation at arbitrary path `/system/config` -> REJECT.
11. Blanket write with corrupted ID containing non-alphanumeric chars -> REJECT.
12. Unauthenticated reads on private subpaths -> REJECT.
