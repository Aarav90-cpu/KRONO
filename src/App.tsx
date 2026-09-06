import React, { useState, useEffect } from 'react';
import { ViewMode, FeedSubMode, FeedFilter, CreatorPost, HyperlocalDrop } from './types';
import { INITIAL_POSTS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { FeedView } from './components/FeedView';
import { CreatorHubView } from './components/CreatorHubView';
import { AdManagerView } from './components/AdManagerView';
import { NetworkReferralView } from './components/NetworkReferralView';
import { ExploreView } from './components/ExploreView';
import { CastModal } from './components/CastModal';
import { DecryptModal } from './components/DecryptModal';
import { RemixModal } from './components/RemixModal';
import { EscrowModal } from './components/EscrowModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('feed');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('krono_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  const [feedSubMode, setFeedSubMode] = useState<FeedSubMode>('chrono');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Balances
  const [yieldBalance, setYieldBalance] = useState('+$42.80');
  const [liquidVaultBalance, setLiquidVaultBalance] = useState(318.4);
  const [escrowBalance, setEscrowBalance] = useState(14820.5);

  // Posts
  const [posts, setPosts] = useState<CreatorPost[]>(INITIAL_POSTS);

  // Modals
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('krono_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('krono_theme', 'light');
    }
  }, [isDark]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      addToast(
        next ? 'Dark Mode Active' : 'Light Mode Active',
        `Switched theme to ${next ? 'Glass Terminal Dark' : 'Crisp Glass Light'} mode.`,
        'info'
      );
      return next;
    });
  };

  const handleAddPost = (postData: Partial<CreatorPost>) => {
    const newPost: CreatorPost = {
      id: `post-${Date.now()}`,
      author: {
        name: 'krono.operator',
        handle: '@operator',
        avatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCEt5GHk5diRXjDuXfuNJqdkFMhzVx27k6PANeFkWxWMxpzoO2gsuHLEP11Ol2HsXOdYRUoPx_xOpwwF8H09PytALYUHAZ3M-WcBA1fmDRiccSg3u2DgoyJt_37S8i26VwXqilbBhom1ksf-LdPw1NHFttiwbb5Mke8ndbzw72GFjL5sbvjXC6w_XHiLROG9LfPMIAjzKvLhbpsWmWwEN9Int_QqJuijAFp4bm7cAGhegHJU5DnG6-srQ',
        verified: true,
        hexId: '#0x71C9',
        node: 'Personal Enclave',
      },
      timestamp: 'Just now (Block #8,941,220)',
      earnedAmount: '+$0.0028/view',
      content: postData.content || '',
      mediaUrl: postData.mediaUrl,
      shaderBadge: postData.shaderBadge,
      metrics: {
        likes: 1,
        comments: 0,
        remixes: 0,
        isLiked: true,
      },
    };

    setPosts((prev) => [newPost, ...prev]);
    addToast('Signal Gossiped', 'New cast broadcasted to validator stream network.', 'success');
  };

  const handleDepositEscrow = (amount: number) => {
    setEscrowBalance((prev) => prev + amount);
    addToast(
      'Escrow Deposit Confirmed',
      `+$${amount.toLocaleString()} USDC credited to autonomous ad auction core.`,
      'success'
    );
  };

  const handleDrainVault = (amount: number) => {
    setLiquidVaultBalance(0);
    setYieldBalance('+$0.00');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans transition-colors duration-300 antialiased selection:bg-secondary/20 selection:text-secondary">
      {/* Persistent Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenCastModal={() => setIsCastModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        yieldBalance={yieldBalance}
      />

      {/* Main App Layout */}
      <div className="pt-24 sm:pt-22 pb-12 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 lg:gap-8 flex-1">
        {/* Left Sticky Sidebar (hidden on small/medium, visible on lg+) */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
              feedFilter={feedFilter}
              onFeedFilterChange={setFeedFilter}
            />
          </div>
        </div>

        {/* Dynamic Center View Container */}
        <main className="flex-1 min-w-0">
          {currentView === 'feed' && (
            <FeedView
              posts={posts}
              feedSubMode={feedSubMode}
              onFeedSubModeChange={setFeedSubMode}
              feedFilter={feedFilter}
              onFeedFilterChange={setFeedFilter}
              onOpenRemixModal={() => setIsRemixModalOpen(true)}
              onOpenDecryptModal={() => setIsDecryptModalOpen(true)}
              onAddPost={handleAddPost}
              onNotify={addToast}
              onSelectTag={(tag) => {
                setSearchQuery(tag);
                addToast('Filter Applied', `Showing signals tagged with ${tag}`, 'info');
              }}
              searchFilterQuery={searchQuery}
            />
          )}

          {currentView === 'creator-hub' && (
            <CreatorHubView
              onNotify={addToast}
              onOpenDecryptModal={() => setIsDecryptModalOpen(true)}
            />
          )}

          {currentView === 'ad-manager' && (
            <AdManagerView
              onNotify={addToast}
              onOpenEscrowModal={() => setIsEscrowModalOpen(true)}
              escrowBalance={escrowBalance}
            />
          )}

          {currentView === 'network-referral' && (
            <NetworkReferralView
              onNotify={addToast}
              onDrainVault={handleDrainVault}
              liquidVaultBalance={liquidVaultBalance}
            />
          )}

          {currentView === 'explore' && (
            <ExploreView
              onOpenRemixModal={() => setIsRemixModalOpen(true)}
              onNotify={addToast}
            />
          )}
        </main>
      </div>

      {/* Persistent Status Telemetry Footer */}
      <Footer />

      {/* Modals */}
      <CastModal
        isOpen={isCastModalOpen}
        onClose={() => setIsCastModalOpen(false)}
        onSubmitCast={handleAddPost}
      />

      <DecryptModal
        isOpen={isDecryptModalOpen}
        onClose={() => setIsDecryptModalOpen(false)}
        onSuccessClaim={(beaconId, reward) => {
          addToast(
            'Drop Decrypted',
            `${reward} added to your cold enclave settlement balance.`,
            'success'
          );
        }}
      />

      <RemixModal
        isOpen={isRemixModalOpen}
        onClose={() => setIsRemixModalOpen(false)}
        onSuccessFork={(name) => {
          addToast(
            'Shader Derivative Forked',
            `Published ${name} with 12% royalty stream locked to parent node.`,
            'success'
          );
        }}
      />

      <EscrowModal
        isOpen={isEscrowModalOpen}
        onClose={() => setIsEscrowModalOpen(false)}
        onDeposit={handleDepositEscrow}
        currentEscrow={escrowBalance}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
