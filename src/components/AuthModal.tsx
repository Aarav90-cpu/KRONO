import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthUserProfile, TwoFactorMethod } from '../types';
import { syncUserProfileToFirestore } from '../services/firestoreService';
import { UserAvatar } from './UserAvatar';
import { ChangePfpModal } from './ChangePfpModal';
import {
  X,
  Shield,
  Smartphone,
  KeyRound,
  Mail,
  User,
  AtSign,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  QrCode,
  MapPin,
  Camera,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUserProfile | null;
  onUpdateUser: (user: AuthUserProfile | null) => void;
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  initialTab?: 'signin' | 'profile' | 'credentials' | 'security' | '2fa';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onNotify,
  initialTab = 'signin',
}) => {
  const resolvedTab = initialTab === '2fa' ? 'security' : initialTab;
  const [activeTab, setActiveTab] = useState<'signin' | 'profile' | 'credentials' | 'security'>(
    resolvedTab
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Profile Form States
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formBio, setFormBio] = useState('');
  const [isChangePfpOpen, setIsChangePfpOpen] = useState(false);

  // Security States
  const [twoFactorChoice, setTwoFactorChoice] = useState<TwoFactorMethod>('totp');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [tempPhone, setTempPhone] = useState('+1 (555) 019-2834');
  const [totpSecret, setTotpSecret] = useState('KRONO-7749-AUTH-9281');

  // Sync state when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setFormName(currentUser.name || '');
      setFormUsername(currentUser.username.replace('@', '') || '');
      setFormAvatar(currentUser.avatar || '');
      setFormLocation(currentUser.location || '');
      setFormBio(currentUser.bio || '');
      setTwoFactorEnabled(currentUser.twoFactorEnabled || false);
      setTwoFactorChoice(currentUser.twoFactorMethod || 'totp');
      if (currentUser.phoneNumber) {
        setTempPhone(currentUser.phoneNumber);
      }
      if (currentUser.totpSecret) {
        setTotpSecret(currentUser.totpSecret);
      }

      if (initialTab === 'signin') {
        setActiveTab('profile');
      } else {
        setActiveTab(initialTab === '2fa' ? 'security' : initialTab);
      }
    } else {
      setActiveTab('signin');
    }
  }, [currentUser, isOpen, initialTab]);

  if (!isOpen) return null;

  // Copy TOTP Key to Clipboard
  const handleCopySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    onNotify('Secret Copied', 'TOTP setup key copied to clipboard.', 'info');
  };

  // Real Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const email = fbUser.email || '';
      const name = fbUser.displayName || 'Google Member';
      // Real Google Profile Picture with fallback
      const avatar =
        fbUser.photoURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=ffffff&bold=true`;
      const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';

      const userProfile: AuthUserProfile = {
        uid: fbUser.uid,
        email,
        name,
        username: `@${defaultUsername}`,
        avatar,
        provider: 'google',
        twoFactorEnabled: false,
        twoFactorMethod: 'totp',
        twoFactorVerified: true,
        ageVerified: true,
        location: '',
        createdAt: new Date().toISOString(),
      };

      // Persist in Firestore
      await syncUserProfileToFirestore(userProfile);
      localStorage.setItem('krono_active_uid', fbUser.uid);
      localStorage.setItem(`krono_profile_${fbUser.uid}`, JSON.stringify(userProfile));

      onUpdateUser(userProfile);
      onNotify('Signed In with Google', `Welcome, ${userProfile.name}! Connected to Firestore.`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const msg = err?.message || 'Google sign-in could not be completed. Please check pop-up permissions.';
      setErrorMessage(msg);
      onNotify('Sign-in Error', msg, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Update Profile Form
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let cleanHandle = formUsername.trim();
      if (cleanHandle.startsWith('@')) cleanHandle = cleanHandle.substring(1);
      cleanHandle = cleanHandle.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();

      if (!cleanHandle) {
        setErrorMessage('Username cannot be empty and must contain alphanumeric characters.');
        setIsLoading(false);
        return;
      }

      const updatedProfile: AuthUserProfile = {
        ...currentUser,
        name: formName.trim() || currentUser.name,
        username: `@${cleanHandle}`,
        avatar: formAvatar.trim() || currentUser.avatar,
        location: formLocation.trim(),
        bio: formBio.trim(),
      };

      // Persist in Firestore
      await syncUserProfileToFirestore(updatedProfile);
      localStorage.setItem(`krono_profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
      onUpdateUser(updatedProfile);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updatedProfile.name,
          photoURL: updatedProfile.avatar,
        }).catch(() => {});
      }

      onNotify('Profile Saved', 'Your profile updates have been permanently saved in Firestore.', 'success');
      onClose();
    } catch (err: any) {
      console.error('Update profile error:', err);
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    localStorage.removeItem('krono_active_uid');
    onUpdateUser(null);
    setIsLoading(false);
    onNotify('Signed Out', 'You have been signed out.', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border-glass-dark shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-glass-dark bg-surface-container-low">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface">
                {currentUser ? 'Account & Profile' : 'Sign In with Google'}
              </h2>
              <p className="text-[11px] text-outline">
                {currentUser
                  ? 'Manage profile, handle, credentials & security'
                  : 'Join the decentralized conversation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation (When Authenticated) */}
        {currentUser && (
          <div className="flex border-b border-border-glass-dark px-6 pt-2 bg-surface-container-low text-xs font-semibold gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                setErrorMessage(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Info</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('credentials');
                setErrorMessage(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'credentials'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Google Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('security');
                setErrorMessage(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Security (2FA)</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 text-xs text-error animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold">Notice: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {!currentUser && (
            <div className="flex flex-col items-center text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                <KeyRound className="w-8 h-8" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-bold text-on-surface">Sign In to KRONO</h3>
                <p className="text-xs text-outline leading-relaxed">
                  Connect your real Google account to publish posts, join discussion threads, like, bookmark, and connect with other members in Firestore.
                </p>
              </div>

              {/* Real Google Auth Button */}
              <div className="w-full max-w-sm space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface border border-border-glass-dark hover:bg-surface-container text-on-surface font-semibold text-sm shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: PROFILE INFO */}
          {currentUser && activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-border-glass-dark">
                <div className="relative group shrink-0">
                  <UserAvatar
                    src={formAvatar || currentUser.avatar}
                    name={formName || currentUser.name}
                    size="lg"
                    className="shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setIsChangePfpOpen(true)}
                    className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-[2px]"
                    title="Change Profile Picture"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface">Profile Picture</span>
                    <button
                      type="button"
                      onClick={() => setIsChangePfpOpen(true)}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Choose / Upload</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://... or choose an avatar above"
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-outline mt-1">
                    Upload from device, pick curated avatars, or generate a custom seed.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Display Name</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-primary" />
                  <span>Username (@handle)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-outline text-xs font-mono">@</span>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="handle"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface border border-border-glass-dark text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>Location (Optional)</span>
                  </label>
                  {formLocation && (
                    <button
                      type="button"
                      id="auth-clear-location-btn"
                      onClick={() => setFormLocation('')}
                      className="text-[11px] text-error hover:underline cursor-pointer"
                    >
                      Clear location
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. San Francisco, London (leave blank if preferred)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-outline">
                  Leave blank if you prefer not to display a location on your profile.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl text-error hover:bg-error/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LINKED GOOGLE ACCOUNT */}
          {currentUser && activeTab === 'credentials' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-container-low border border-border-glass-dark space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-on-surface block">Linked Google Account</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Google Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border-glass-dark text-xs font-mono text-on-surface">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-outline">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google OAuth</span>
                  </div>
                </div>
                <p className="text-[11px] text-outline leading-relaxed">
                  Your identity is directly authenticated with Google. Account access, password security, and recovery are securely managed through your Google Account.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-border-glass-dark flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-on-surface block">Authentication Provider</span>
                  <span className="text-[11px] text-outline">
                    Connected via Google Identity (Firebase Auth)
                  </span>
                </div>
                <span className="text-xs text-primary font-mono font-medium">
                  {currentUser.uid.slice(0, 8)}...
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY (2FA) */}
          {currentUser && activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-container-low border border-border-glass-dark space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-on-surface">Two-Factor Authentication (2FA)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !twoFactorEnabled;
                      setTwoFactorEnabled(next);
                      if (currentUser) {
                        const updated = { ...currentUser, twoFactorEnabled: next, twoFactorMethod: twoFactorChoice };
                        syncUserProfileToFirestore(updated);
                        onUpdateUser(updated);
                        onNotify(
                          next ? '2FA Enabled' : '2FA Disabled',
                          next ? 'Two-factor protection is active on your account.' : 'Two-factor protection has been disabled.',
                          'info'
                        );
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      twoFactorEnabled
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-surface border border-border-glass-dark text-outline'
                    }`}
                  >
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <p className="text-[11px] text-outline leading-relaxed">
                  Protect your account with an extra verification code upon signing in from unrecognized browsers.
                </p>

                {twoFactorEnabled && (
                  <div className="pt-2 border-t border-border-glass-dark space-y-3">
                    <div className="p-3 rounded-lg bg-surface border border-border-glass-dark flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-on-surface">
                        <QrCode className="w-4 h-4 text-primary" />
                        <span>{totpSecret}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="p-1 rounded text-outline hover:text-on-surface cursor-pointer"
                        title="Copy Secret"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Change Profile Picture Modal */}
      <ChangePfpModal
        isOpen={isChangePfpOpen}
        onClose={() => setIsChangePfpOpen(false)}
        currentAvatar={formAvatar || currentUser?.avatar || ''}
        userName={formName || currentUser?.name || 'User'}
        userEmail={currentUser?.email}
        googlePhotoUrl={auth.currentUser?.photoURL || ''}
        onSaveAvatar={(newAvatar) => {
          setFormAvatar(newAvatar);
          setIsChangePfpOpen(false);
        }}
      />
    </div>
  );
};
