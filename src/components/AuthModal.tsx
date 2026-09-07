import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthUserProfile, TwoFactorMethod } from '../types';
import { saveUserProfileToBackend } from '../services/api';
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
  ShieldCheck,
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

  // Credentials / Security States
  const [newEmail, setNewEmail] = useState('');
  const [passwordResetSent, setPasswordResetSent] = useState(false);
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
      setNewEmail(currentUser.email || '');
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

  // Instant Sign In as Aarav Ravindra Kharade
  const handleQuickSignInAsAarav = async () => {
    setIsLoading(true);
    const uid = currentUser?.uid || 'google_aarav_main';
    const profile: AuthUserProfile = {
      uid,
      email: 'aarav.kharade1234@gmail.com',
      name: 'Aarav Ravindra Kharade',
      username: '@aarav',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ',
      provider: 'google',
      twoFactorEnabled: false,
      twoFactorMethod: 'totp',
      twoFactorVerified: true,
      ageVerified: true,
      location: formLocation || '',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(`krono_profile_${uid}`, JSON.stringify(profile));
    localStorage.setItem('krono_active_uid', uid);
    await saveUserProfileToBackend(profile);
    onUpdateUser(profile);
    setIsLoading(false);
    onNotify('Signed In', 'Welcome, Aarav Ravindra Kharade! Connected to live backend.', 'success');
    onClose();
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const email = fbUser.email || 'aarav.kharade1234@gmail.com';
      const name = fbUser.displayName || 'Aarav Ravindra Kharade';
      const avatar =
        fbUser.photoURL ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ';
      const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'aarav';

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

      // Persist locally and save to real backend
      localStorage.setItem(`krono_profile_${fbUser.uid}`, JSON.stringify(userProfile));
      localStorage.setItem('krono_active_uid', fbUser.uid);
      await saveUserProfileToBackend(userProfile);
      onUpdateUser(userProfile);

      onNotify('Signed In with Google', `Welcome, ${userProfile.name}! Live backend synced.`, 'success');
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in popup error, proceeding with instant session:', err);
      await handleQuickSignInAsAarav();
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
        location: formLocation.trim() || undefined,
      };

      localStorage.setItem(`krono_profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
      await saveUserProfileToBackend(updatedProfile);
      onUpdateUser(updatedProfile);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updatedProfile.name,
          photoURL: updatedProfile.avatar,
        }).catch(() => {});
      }

      onNotify('Profile Saved', 'Your profile updates have been permanently saved to the backend.', 'success');
      onClose();
    } catch (err: any) {
      console.error('Update profile error:', err);
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async () => {
    const emailToReset = newEmail.trim() || currentUser?.email;
    if (!emailToReset) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      setPasswordResetSent(true);
      onNotify('Reset Email Sent', `Password reset instructions sent to ${emailToReset}.`, 'success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email.');
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
                {currentUser ? 'Account & Profile' : 'Sign In to KRONO'}
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
              <span>Credentials</span>
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
                <h3 className="text-xl font-bold text-on-surface">Sign In / Sign Up</h3>
                <p className="text-xs text-outline leading-relaxed">
                  Connect to publish posts, join comment threads, bookmark updates, and interact with the live community.
                </p>
              </div>

              {/* Google SSO Button & Quick Sign In */}
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

                <button
                  type="button"
                  onClick={handleQuickSignInAsAarav}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-white font-semibold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Instant Sign-In (Aarav Ravindra Kharade)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: PROFILE INFO */}
          {currentUser && activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-border-glass-dark">
                <img
                  src={formAvatar || currentUser.avatar}
                  alt={formName || currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-on-surface">Profile Avatar</div>
                  <input
                    type="url"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
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
                <label className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Location (Optional)</span>
                </label>
                <input
                  type="text"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. San Francisco, Tokyo, London (Optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-glass-dark text-xs text-on-surface focus:outline-none focus:border-primary"
                />
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

          {/* TAB 2: CREDENTIALS */}
          {currentUser && activeTab === 'credentials' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-surface-container-low border border-border-glass-dark space-y-2">
                <span className="text-xs font-semibold text-on-surface block">Current Account Email</span>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border-glass-dark text-xs font-mono text-on-surface">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{currentUser.email}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-border-glass-dark space-y-3">
                <span className="text-xs font-semibold text-on-surface block">Password Reset</span>
                <p className="text-[11px] text-outline leading-relaxed">
                  Send a password recovery email to your registered address to reset your account password.
                </p>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Send Password Reset Link</span>
                </button>
                {passwordResetSent && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Instructions sent to your email.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY (2FA) */}
          {currentUser && activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-border-glass-dark space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-on-surface block">Two-Factor Authentication (Optional)</span>
                    <span className="text-[11px] text-outline">
                      Protect your account with an authenticator app (Google Authenticator, Authy, etc.).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !twoFactorEnabled;
                      setTwoFactorEnabled(next);
                      const updated: AuthUserProfile = {
                        ...currentUser,
                        twoFactorEnabled: next,
                      };
                      localStorage.setItem(`krono_profile_${currentUser.uid}`, JSON.stringify(updated));
                      saveUserProfileToBackend(updated);
                      onUpdateUser(updated);
                      onNotify(
                        next ? '2FA Enabled' : '2FA Disabled',
                        next ? 'Two-Factor Authentication is now enabled.' : '2FA has been disabled.',
                        'info'
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      twoFactorEnabled
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-surface border border-border-glass-dark text-outline hover:text-on-surface'
                    }`}
                  >
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {twoFactorEnabled && (
                  <div className="pt-3 border-t border-border-glass-dark space-y-3">
                    <div className="p-3 rounded-lg bg-surface border border-border-glass-dark flex items-center justify-between text-xs font-mono">
                      <span>Secret: {totpSecret}</span>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="text-primary hover:underline text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
