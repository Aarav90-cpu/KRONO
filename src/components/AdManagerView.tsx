import React, { useState } from 'react';
import {
  Activity,
  Plus,
  DollarSign,
  TrendingUp,
  Eye,
  Sliders,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { AdCampaign } from '../types';
import { AD_CAMPAIGNS } from '../data/mockData';

interface AdManagerViewProps {
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenEscrowModal: () => void;
  escrowBalance: number;
}

export const AdManagerView: React.FC<AdManagerViewProps> = ({
  onNotify,
  onOpenEscrowModal,
  escrowBalance,
}) => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(AD_CAMPAIGNS);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<'creators' | 'nodes' | 'shaders'>('creators');
  const [budgetSlider, setBudgetSlider] = useState(500);
  const [cpmSlider, setCpmSlider] = useState(4.2);

  // 45/45/10 transparent calculations
  const creatorPool = (budgetSlider * 0.45).toFixed(2);
  const relayPool = (budgetSlider * 0.45).toFixed(2);
  const refPool = (budgetSlider * 0.1).toFixed(2);
  const estImpressions = Math.floor((budgetSlider / cpmSlider) * 1000);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim()) {
      onNotify('Title Required', 'Please provide a campaign name.', 'warning');
      return;
    }

    if (budgetSlider > escrowBalance) {
      onNotify('Escrow Depleted', 'Please deposit more USDC into your escrow first.', 'warning');
      onOpenEscrowModal();
      return;
    }

    const newCampaign: AdCampaign = {
      id: `camp-${Date.now()}`,
      name: campaignTitle.trim(),
      tag: selectedGoal.toUpperCase(),
      txid: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
      verificationBadge: 'Verified Peer Consensus',
      objective: selectedGoal,
      placement: 'Feed & Relay Banner',
      delivered: 0,
      total: estImpressions,
      ctr: '0.0%',
      clicks: 0,
      ecpm: `$${cpmSlider.toFixed(2)}`,
      winRate: '98.2%',
      fatigueAvg: '1.0x',
      fatigueCap: '3.0x',
      spent: '$0.00',
      spentPercent: 0,
      status: 'ACTIVE',
    };

    setCampaigns([newCampaign, ...campaigns]);
    setCampaignTitle('');
    onNotify('Campaign Deployed', `Active campaign "${newCampaign.name}" distributed to network.`, 'success');
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          onNotify(
            'Status Updated',
            `Campaign is now ${newStatus}`,
            'info'
          );
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Ad Campaign Manager
            </h1>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
              Zero Platform Rake
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Run verified impression campaigns with automatic 45/45/10 micro-distribution directly to creators and relay peers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col sm:items-end">
            <span className="text-[11px] text-outline">Escrow Balance</span>
            <span className="text-lg font-bold text-secondary">
              ${escrowBalance.toFixed(2)}
            </span>
          </div>

          <button
            onClick={onOpenEscrowModal}
            className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Deposit Funds</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Escrow Balance</span>
            <DollarSign className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">${escrowBalance.toFixed(2)}</span>
            <span className="text-xs text-secondary font-medium">USDC</span>
          </div>
          <span className="text-[11px] text-outline">Available for allocation</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>24h Total Spend</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">$142.80</span>
            <span className="text-xs text-outline">across active nodes</span>
          </div>
          <span className="text-[11px] text-outline">Directly routed to creators</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Verified Impressions</span>
            <Eye className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">248,500</span>
            <span className="text-xs text-secondary font-medium">+14.2%</span>
          </div>
          <span className="text-[11px] text-outline">Zero-bot dwell verification</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Average CPM</span>
            <Activity className="w-4 h-4 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-tertiary">$4.20</span>
            <span className="text-xs text-outline">per 1k views</span>
          </div>
          <span className="text-[11px] text-outline">Dynamic clearing rate</span>
        </div>
      </div>

      {/* Campaign Creation Form */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-bold text-on-surface">Create New Campaign</h2>
          <p className="text-xs text-outline">Configure audience targeting and budget allocation</p>
        </div>

        <form onSubmit={handleCreateCampaign} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campaign Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Campaign Name</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. GPU Infrastructure Launch"
                className="p-2.5 rounded-lg bg-surface-container-low border border-border-glass-dark text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Target Audience Goal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Target Placement</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'creators', label: 'Creators' },
                  { id: 'nodes', label: 'Relay Nodes' },
                  { id: 'shaders', label: 'WebGL Shaders' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGoal(g.id as any)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-center ${
                      selectedGoal === g.id
                        ? 'bg-primary-container text-white font-semibold'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sliders: Budget & CPM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-surface-container-low border border-border-glass-dark">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-on-surface">Campaign Budget</span>
                <span className="font-bold text-secondary">${budgetSlider} USDC</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={budgetSlider}
                onChange={(e) => setBudgetSlider(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
              <span className="text-[11px] text-outline">
                Est. ~{estImpressions} verified views
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-on-surface">Target CPM Bid</span>
                <span className="font-bold text-primary">${cpmSlider.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="10.0"
                step="0.1"
                value={cpmSlider}
                onChange={(e) => setCpmSlider(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <span className="text-[11px] text-outline">
                Cost per 1,000 verified impressions
              </span>
            </div>
          </div>

          {/* Protocol Split Preview */}
          <div className="p-3 rounded-lg bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-outline shrink-0" />
              <span className="text-on-surface-variant">
                100% of this budget is distributed directly to ecosystem participants:
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-secondary font-semibold">
                Creators (45%): ${creatorPool}
              </span>
              <span className="text-primary font-semibold">
                Relays (45%): ${relayPool}
              </span>
              <span className="text-tertiary font-semibold">
                Referrals (10%): ${refPool}
              </span>
            </div>
          </div>

          {/* Deploy Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Campaign</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Campaigns Table */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-bold text-on-surface">Active Campaigns</h2>
          <p className="text-xs text-outline">Real-time performance and impression delivery</p>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-glass-dark text-outline text-[11px]">
                <th className="py-2.5 px-3">Campaign</th>
                <th className="py-2.5 px-3">Budget</th>
                <th className="py-2.5 px-3">Spent</th>
                <th className="py-2.5 px-3">Delivered</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass-dark">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">{camp.name}</span>
                      <span className="text-[10px] text-outline font-mono">{camp.ecpm} CPM • {camp.tag}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-on-surface">{camp.ecpm}</td>
                  <td className="py-3 px-3 font-mono text-secondary font-semibold">{camp.spent}</td>
                  <td className="py-3 px-3 font-mono text-on-surface">{camp.delivered.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-outline">{camp.total.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        camp.status === 'ACTIVE'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(camp.id)}
                      className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
                      title={camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                    >
                      {camp.status === 'ACTIVE' ? (
                        <PauseCircle className="w-4 h-4 text-tertiary" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-secondary" />
                      )}
                    </button>
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
