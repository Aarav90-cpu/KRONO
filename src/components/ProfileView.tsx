import React, { useState, useEffect } from 'react';
import { Post, AuthUserProfile, SuggestedUser } from '../types';
import { UserAvatar } from './UserAvatar';
import { auth } from '../firebase';
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  CheckCircle,
  ArrowLeft,
  Edit3,
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  UserPlus,
  UserCheck,
  Repeat2,
  Camera,
} from 'lucide-react';
import { NetworkModal } from './NetworkModal';
import { ChangePfpModal } from './ChangePfpModal';
import { PostMedia } from './PostMedia';
import { FormattedContent } from './FormattedContent';
import { extractPostImage } from '../utils/mediaUtils';

interface ProfileViewProps {
  userPosts: Post[];
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onBackToFeed: () => void;
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  currentUser: AuthUserProfile | null;
  onOpenAuthModal: (tab?: 'signin' | 'profile' | 'credentials' | '2fa') => void;
  viewingUser?: SuggestedUser | null;
  followedHandles?: string[];
  onToggleFollow?: (user: SuggestedUser) => void;
  onUpdateCurrentUser?: (user: AuthUserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userPosts,
  onToggleLike,
  onToggleBookmark,
  onBackToFeed,
  onNotify,
  currentUser,
  onOpenAuthModal,
  viewingUser,
  followedHandles = [],
  onToggleFollow,
  onUpdateCurrentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [networkModalTab, setNetworkModalTab] = useState<'following' | 'followers'>('following');
  const [isChangePfpOpen, setIsChangePfpOpen] = useState(false);

  // Synchronize state when currentUser updates (e.g. after Firestore fetch or login)
  useEffect(() => {
    if (currentUser) {
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || '');
      setWebsite(currentUser.website || '');
    }
  }, [currentUser]);

  const isViewingSelf =
    !viewingUser ||
    Boolean(
      currentUser &&
        (viewingUser.id === currentUser.uid ||
          viewingUser.handle.toLowerCase() === currentUser.username.toLowerCase())
    );

  const activeUser = isViewingSelf ? currentUser : viewingUser;
  const displayName = activeUser?.name || (isViewingSelf ? 'Guest Explorer' : 'Community Member');
  const displayHandle =
    (activeUser as any)?.username || (activeUser as any)?.handle || '@guest';
  const displayLocation = isViewingSelf
    ? (currentUser?.location !== undefined ? currentUser.location : location)
    : (viewingUser?.location || '');
  const displayAvatar = activeUser?.avatar || '';

  const handleSaveAvatar = async (newAvatarUrl: string) => {
    if (!currentUser || !onUpdateCurrentUser) return;
    const updated: AuthUserProfile = {
      ...currentUser,
      avatar: newAvatarUrl,
    };
    onUpdateCurrentUser(updated);
    onNotify('Profile Picture Updated', 'Your new profile picture has been saved.', 'success');
  };

  const followingCount =
    (activeUser as any)?.followingCount ?? ((activeUser as any)?.following || []).length;
  const followersCount =
    (activeUser as any)?.followersCount ?? ((activeUser as any)?.followers || []).length;

  const isFollowingThisUser = viewingUser
    ? followedHandles.includes(viewingUser.handle) || followedHandles.includes(viewingUser.id)
    : false;

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    if (currentUser && onUpdateCurrentUser) {
      const updated: AuthUserProfile = {
        ...currentUser,
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
      };
      onUpdateCurrentUser(updated);
    }
    onNotify('Profile Updated', 'Your profile changes have been saved.', 'success');
  };

  const displayedPosts =
    activeTab === 'posts'
      ? userPosts
      : activeTab === 'media'
      ? userPosts.filter((p) => Boolean(p.mediaUrl || extractPostImage(p.content, p.mediaUrl)))
      : userPosts.filter((p) => p.metrics.isLiked);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border-glass-dark">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToFeed}
            className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Back to feed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-on-surface flex items-center gap-1.5">
              <span>{displayName}</span>
              <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
            </h1>
            <p className="text-xs text-outline">{userPosts.length} posts</p>
          </div>
        </div>

        {isViewingSelf ? (
          <button
            onClick={() => onOpenAuthModal('profile')}
            className="px-3 py-1.5 rounded-lg bg-surface-container border border-border-glass-dark hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Account & Security</span>
            <span className="sm:hidden">Security</span>
          </button>
        ) : (
          <button
            onClick={onBackToFeed}
            className="px-3 py-1.5 rounded-lg bg-surface-container border border-border-glass-dark hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors cursor-pointer"
          >
            Back to Feed
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-surface border border-border-glass-dark overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-36 sm:h-48 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/40 relative"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col gap-4">
          <div className="flex justify-between items-end -mt-12 sm:-mt-14 mb-2">
            <div className="relative group">
              <UserAvatar
                src={displayAvatar}
                name={displayName}
                size="xl"
                className="border-4 border-surface shadow-md"
              />
              {isViewingSelf && currentUser && (
                <button
                  type="button"
                  id="profile-avatar-overlay-btn"
                  onClick={() => setIsChangePfpOpen(true)}
                  className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-[2px]"
                  title="Change Profile Picture"
                  aria-label="Change Profile Picture"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-bold tracking-tight">Edit Photo</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isViewingSelf ? (
                currentUser ? (
                  <>
                    <button
                      id="profile-change-pfp-btn"
                      onClick={() => setIsChangePfpOpen(true)}
                      className="px-3 py-2 rounded-lg border border-border-glass-dark hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Update your avatar or upload a custom photo"
                    >
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      <span className="hidden sm:inline">Change Photo</span>
                      <span className="sm:hidden">Photo</span>
                    </button>

                    <button
                      onClick={() => onOpenAuthModal('profile')}
                      className="px-3.5 py-2 rounded-lg border border-border-glass-dark hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Change Name, Username, or Credentials"
                    >
                      <Lock className="w-3.5 h-3.5 text-secondary" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 rounded-lg border border-border-glass-dark hover:bg-surface-container text-xs font-semibold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Cancel' : 'Edit Bio'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onOpenAuthModal('signin')}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )
              ) : (
                viewingUser && (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuthModal('signin');
                        onNotify('Sign In Required', 'Please sign in to follow members.', 'warning');
                        return;
                      }
                      if (onToggleFollow) {
                        onToggleFollow({
                          id: viewingUser.id,
                          name: viewingUser.name,
                          handle: viewingUser.handle,
                          avatar: viewingUser.avatar,
                          bio: viewingUser.bio,
                          isFollowing: isFollowingThisUser,
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isFollowingThisUser
                        ? 'border border-border-glass-dark text-outline hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/10'
                        : 'bg-primary text-white hover:opacity-90 shadow-sm'
                    }`}
                  >
                    {isFollowingThisUser ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          {!currentUser && isViewingSelf && (
            <div className="p-3.5 rounded-xl bg-surface-container border border-border-glass-dark flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-outline">
                <Eye className="w-4 h-4 text-primary shrink-0" />
                <span>You are browsing as a guest. Sign in to post, like, comment, and follow members.</span>
              </div>
              <button
                onClick={() => onOpenAuthModal('signin')}
                className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 cursor-pointer shrink-0"
              >
                Sign In
              </button>
            </div>
          )}

          {isEditing && isViewingSelf ? (
            <form onSubmit={handleSaveBio} className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container-low border border-border-glass-dark">
              <div>
                <label className="text-xs text-outline block mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-outline block">Location (Optional)</label>
                    {location && (
                      <button
                        type="button"
                        id="clear-location-btn"
                        onClick={() => setLocation('')}
                        className="text-[11px] text-error hover:underline cursor-pointer"
                      >
                        Clear location
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={location}
                    placeholder="e.g. San Francisco, London (leave blank if preferred)"
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-outline mt-1">Leave empty if you do not want to set your location.</p>
                </div>
                <div>
                  <label className="text-xs text-outline block mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
                    placeholder="e.g. yourwebsite.com"
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary-container text-white text-xs font-semibold rounded-lg hover:opacity-90 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-on-surface">{displayName}</h2>
                  {currentUser || !isViewingSelf ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Member</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-outline text-[11px] font-medium border border-border-glass-dark">
                      Guest View
                    </span>
                  )}
                </div>
                <span className="text-xs text-outline font-mono">{displayHandle}</span>
              </div>

              {((isViewingSelf ? currentUser?.bio || bio : viewingUser?.bio)) ? (
                <p className="text-xs sm:text-sm text-on-surface leading-relaxed mt-1">
                  {isViewingSelf ? currentUser?.bio || bio : viewingUser?.bio}
                </p>
              ) : (
                <p className="text-xs text-outline italic mt-1">
                  No bio added yet.
                </p>
              )}

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-outline pt-1">
                {displayLocation && displayLocation.trim() !== '' && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{displayLocation}</span>
                  </div>
                )}
                {website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined September 2026</span>
                </div>
              </div>

              {/* Real Follower Stats */}
              <div className="flex items-center gap-4 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNetworkModalTab('following');
                    setIsNetworkModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                    {followingCount}
                  </span>
                  <span className="text-outline">Following</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNetworkModalTab('followers');
                    setIsNetworkModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                    {followersCount}
                  </span>
                  <span className="text-outline">Followers</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Tabs */}
        <div className="flex border-t border-border-glass-dark text-xs font-medium">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'posts'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Posts ({displayedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'media'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Media
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'likes'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Liked
          </button>
        </div>
      </div>

      {/* Network Modal (Following & Followers) */}
      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        initialTab={networkModalTab}
        targetUid={(activeUser as any)?.uid || (activeUser as any)?.id || displayHandle}
        targetName={displayName}
        currentUser={currentUser}
        followedHandles={followedHandles}
        onToggleFollow={onToggleFollow || (() => {})}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Change Profile Picture Modal */}
      <ChangePfpModal
        isOpen={isChangePfpOpen}
        onClose={() => setIsChangePfpOpen(false)}
        currentAvatar={currentUser?.avatar || ''}
        userName={currentUser?.name || displayName}
        userEmail={currentUser?.email}
        googlePhotoUrl={auth.currentUser?.photoURL || ''}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* Posts list */}
      <div className="flex flex-col gap-4">
        {displayedPosts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-surface border border-border-glass-dark text-outline text-xs">
            No posts found in this section.
          </div>
        ) : (
          displayedPosts.map((post) => (
            <article
              key={post.id}
              className="p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-3.5"
            >
              {post.repost && (
                <div className="flex items-center gap-1.5 text-xs text-outline font-medium pb-1 border-b border-border-glass-dark/60">
                  <Repeat2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {currentUser && post.repost.reposterId === currentUser.uid
                      ? 'You reposted'
                      : `${post.repost.reposterName} reposted`}
                  </span>
                  <span className="text-[11px] text-outline font-mono">· {post.repost.timestamp}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={post.author.avatar}
                    name={post.author.name}
                    size="md"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-on-surface">
                      {post.author.name}
                    </span>
                    <span className="text-xs text-outline">
                      {post.author.handle} · {post.timestamp}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleBookmark(post.id)}
                  className="p-1.5 rounded-lg text-outline hover:text-primary transition-colors cursor-pointer"
                >
                  <Bookmark
                    className={`w-4 h-4 ${post.metrics.isBookmarked ? 'fill-primary text-primary' : ''}`}
                  />
                </button>
              </div>

              <FormattedContent
                content={post.content}
                className="text-sm text-on-surface leading-relaxed"
              />

              {post.quotedPost && (
                <div className="p-3 rounded-xl border border-border-glass-dark bg-surface-container-low/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={post.quotedPost.author.avatar}
                      name={post.quotedPost.author.name}
                      size="xs"
                    />
                    <span className="text-xs font-semibold text-on-surface">
                      {post.quotedPost.author.name}
                    </span>
                    <span className="text-[11px] text-outline font-mono">
                      {post.quotedPost.author.handle} · {post.quotedPost.timestamp}
                    </span>
                  </div>
                  <FormattedContent
                    content={post.quotedPost.content}
                    className="text-xs text-on-surface leading-relaxed"
                  />
                  {(() => {
                    const quotedImg = extractPostImage(post.quotedPost.content, post.quotedPost.mediaUrl);
                    return quotedImg ? (
                      <PostMedia
                        src={quotedImg}
                        alt="Quoted attachment"
                        maxHeightClass="max-h-48"
                      />
                    ) : null;
                  })()}
                </div>
              )}

              {(() => {
                const postImg = extractPostImage(post.content, post.mediaUrl);
                return postImg ? (
                  <PostMedia
                    src={postImg}
                    alt={`Attachment by ${post.author.name}`}
                  />
                ) : null;
              })()}

              <div className="flex items-center justify-between pt-2 border-t border-border-glass-dark text-xs text-outline">
                <button
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer ${
                    post.metrics.isLiked ? 'text-red-500 font-medium' : ''
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.metrics.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>{post.metrics.likes}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.metrics.comments}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `https://krono-social.duckdns.org/post/${post.id}`;
                    navigator.clipboard.writeText(shareUrl);
                    onNotify('Link Copied', 'Post URL copied to clipboard.', 'success');
                  }}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                  title="Share post"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{post.metrics.shares}</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
