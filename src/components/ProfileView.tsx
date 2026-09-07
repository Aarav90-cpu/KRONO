import React, { useState } from 'react';
import { Post, AuthUserProfile, SuggestedUser } from '../types';
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
} from 'lucide-react';
import { NetworkModal } from './NetworkModal';

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
  onToggleFollow?: (user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio?: string;
    isFollowing?: boolean;
  }) => void;
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
  const displayLocation = (activeUser as any)?.location || location;
  const displayAvatar = activeUser?.avatar || '';

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
      ? userPosts.filter((p) => Boolean(p.mediaUrl))
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
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-surface object-cover shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-surface bg-surface-container flex items-center justify-center text-xl sm:text-2xl font-bold text-outline shadow-md">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex items-center gap-2">
              {isViewingSelf ? (
                currentUser ? (
                  <>
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
                  <label className="text-xs text-outline block mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    value={location}
                    placeholder="e.g. San Francisco, Tokyo (Optional)"
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-outline block mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
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
                {displayLocation && (
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
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

              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {post.mediaUrl && (
                <div className="rounded-lg overflow-hidden border border-border-glass-dark max-h-96">
                  <img
                    src={post.mediaUrl}
                    alt="Attachment"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

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

                <div className="flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>{post.metrics.shares}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
