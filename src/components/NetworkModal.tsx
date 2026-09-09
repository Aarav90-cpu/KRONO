import React, { useEffect, useState } from 'react';
import { X, Users, UserCheck, UserPlus, ShieldCheck } from 'lucide-react';
import { fetchUserNetworkFromFirestore } from '../services/firestoreService';
import { AuthUserProfile } from '../types';
import { UserAvatar } from './UserAvatar';

interface NetworkUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
}

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'following' | 'followers';
  targetUid: string;
  targetName: string;
  currentUser: AuthUserProfile | null;
  followedHandles: string[];
  onToggleFollow: (user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio?: string;
    isFollowing?: boolean;
  }) => void;
  onOpenAuthModal?: (tab?: 'signin') => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'following',
  targetUid,
  targetName,
  currentUser,
  followedHandles,
  onToggleFollow,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [followingList, setFollowingList] = useState<NetworkUser[]>([]);
  const [followersList, setFollowersList] = useState<NetworkUser[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen || !targetUid) return;

    let isMounted = true;
    setIsLoading(true);

    fetchUserNetworkFromFirestore(targetUid)
      .then((data) => {
        if (isMounted) {
          setFollowingList(data.following || []);
          setFollowersList(data.followers || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load network:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUid]);

  if (!isOpen) return null;

  const currentList = activeTab === 'following' ? followingList : followersList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border-glass-dark shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-glass-dark">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-on-surface">{targetName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border-glass-dark">
          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'following'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Following ({followingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'followers'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Followers ({followersList.length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 divide-y divide-border-glass-dark/50">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-outline text-xs">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Loading network...</span>
            </div>
          ) : currentList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline mb-2">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-on-surface">
                {activeTab === 'following' ? 'No following members yet' : 'No followers yet'}
              </p>
              <p className="text-[11px] text-outline mt-1 max-w-xs leading-relaxed">
                {activeTab === 'following'
                  ? 'Connect with creators and community members across Krono to see their updates.'
                  : 'Share posts and interact with others to build your follower base.'}
              </p>
            </div>
          ) : (
            currentList.map((user) => {
              const isSelf =
                currentUser &&
                (currentUser.uid === user.id ||
                  currentUser.username.toLowerCase() === user.handle.toLowerCase());
              const isFollowing =
                followedHandles.includes(user.handle) || followedHandles.includes(user.id);

              return (
                <div key={user.handle} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar src={user.avatar} name={user.name} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-on-surface truncate flex items-center gap-1">
                        {user.name}
                        <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                      </span>
                      <span className="text-[11px] text-outline font-mono truncate">{user.handle}</span>
                      {user.bio && (
                        <p className="text-[11px] text-outline line-clamp-1 mt-0.5">{user.bio}</p>
                      )}
                    </div>
                  </div>

                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          onClose();
                          onOpenAuthModal?.('signin');
                          return;
                        }
                        onToggleFollow({
                          id: user.id,
                          name: user.name,
                          handle: user.handle,
                          avatar: user.avatar,
                          bio: user.bio,
                          isFollowing,
                        });
                        // Optimistically update tab counts
                        if (activeTab === 'following') {
                          if (isFollowing) {
                            setFollowingList((prev) => prev.filter((u) => u.handle !== user.handle));
                          }
                        }
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                        isFollowing
                          ? 'border border-border-glass-dark text-outline hover:text-red-400 hover:border-red-400/40 hover:bg-red-500/10'
                          : 'bg-primary text-white hover:opacity-90'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
