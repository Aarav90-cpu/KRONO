import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Zap,
  Server,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { ReferralNode } from '../types';
import { REFERRAL_NODES } from '../data/mockData';

interface NetworkReferralViewProps {
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onDrainVault: (amount: number) => void;
  liquidVaultBalance: number;
}

export const NetworkReferralView: React.FC<NetworkReferralViewProps> = ({
  onNotify,
  onDrainVault,
  liquidVaultBalance,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [nodes, setNodes] = useState<ReferralNode[]>(REFERRAL_NODES);
  const [isDraining, setIsDraining] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://krono.xyz/ref/0x4F92');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onNotify('Referral Link Copied', 'Share to earn 10% perpetual protocol split.', 'success');
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onNotify(
      'Invite Sent',
      `Invitation sent to ${inviteEmail.trim()} with 10% perpetual royalty binding.`,
      'success'
    );
    setInviteEmail('');
  };

  const handleDrain = () => {
    if (liquidVaultBalance <= 0) {
      onNotify('Vault Empty', 'No liquid royalties available to withdraw.', 'info');
      return;
    }
    setIsDraining(true);
    setTimeout(() => {
      const amount = liquidVaultBalance;
      onDrainVault(amount);
      setIsDraining(false);
      onNotify(
        'Vault Withdrawn',
        `$${amount.toFixed(2)} transferred to your sovereign wallet.`,
        'success'
      );
    }, 800);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Referral Program & Node Network
            </h1>
            <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-xs font-medium">
              10% Perpetual Royalty
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Invite creators and relay operators to the protocol. Receive an automated 10% cut of every ad dollar their traffic touches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col sm:items-end">
            <span className="text-[11px] text-outline">Available Royalties</span>
            <span className="text-lg font-bold text-secondary">
              ${liquidVaultBalance.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleDrain}
            disabled={isDraining || liquidVaultBalance === 0}
            className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Zap className={`w-3.5 h-3.5 ${isDraining ? 'animate-spin' : ''}`} />
            <span>{isDraining ? 'Withdrawing...' : 'Withdraw Royalties'}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Total Referrals</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">48</span>
            <span className="text-xs text-secondary font-medium">active</span>
          </div>
          <span className="text-[11px] text-outline">32 creators, 16 relay nodes</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Lifetime Royalty</span>
            <TrendingUp className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-secondary">$842.50</span>
            <span className="text-xs text-outline">earned</span>
          </div>
          <span className="text-[11px] text-outline">10% protocol cut</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>24h Referral Yield</span>
            <Sparkles className="w-4 h-4 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-tertiary">+$34.20</span>
            <span className="text-xs text-secondary font-medium">+8.5%</span>
          </div>
          <span className="text-[11px] text-outline">From 89k peer impressions</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Commission Tier</span>
            <Server className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">Tier 1</span>
            <span className="text-xs text-outline">(10% Flat)</span>
          </div>
          <span className="text-[11px] text-outline">Permanent on-chain binding</span>
        </div>
      </div>

      {/* Referral Link & Direct Invite Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Link Card */}
        <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Your Referral Link</h2>
            <p className="text-xs text-outline mt-0.5">
              Anyone who creates or relays content through this link is bound to your 10% royalty split.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-border-glass-dark">
            <span className="font-mono text-xs text-on-surface flex-1 truncate">
              https://krono.xyz/ref/0x4F92
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-md bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-[11px] text-outline">
            No limits. Payouts stream directly with every epoch block.
          </div>
        </div>

        {/* Direct Email Invite */}
        <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Direct Peer Invite</h2>
            <p className="text-xs text-outline mt-0.5">
              Send an instant invitation with pre-configured protocol keys.
            </p>
          </div>

          <form onSubmit={handleSendInvite} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="creator@network.xyz"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low border border-border-glass-dark text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={!inviteEmail.trim()}
              className="px-4 py-2 rounded-lg bg-secondary text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
            >
              Send
            </button>
          </form>

          <div className="text-[11px] text-outline">
            Recipients receive a one-click onboarding link with zero setup barrier.
          </div>
        </div>
      </div>

      {/* Referrals Registry Table */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-bold text-on-surface">Active Referral Registry</h2>
          <p className="text-xs text-outline">Nodes and creators generating your perpetual 10% royalty stream</p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-glass-dark text-outline text-[11px]">
                <th className="py-2.5 px-3">Peer / Handle</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Joined</th>
                <th className="py-2.5 px-3">Impressions (24h)</th>
                <th className="py-2.5 px-3 text-right">Your 10% Cut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass-dark">
              {nodes.map((node) => (
                <tr key={node.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={node.avatar}
                        alt={node.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface">{node.name}</span>
                        <span className="text-[10px] text-outline font-mono">{node.handle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px]">
                      {node.tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-outline font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'Streaming' ? 'bg-secondary' : 'bg-outline'}`}></span>
                      {node.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-on-surface font-mono">{node.impressions24h}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-secondary">
                    {node.protocolCut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
