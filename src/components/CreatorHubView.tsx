import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  Copy,
  Check,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ContentSettlementRow, HyperlocalDrop } from '../types';
import { SETTLEMENT_ROWS, HYPERLOCAL_DROPS } from '../data/mockData';

interface CreatorHubViewProps {
  onNotify: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onOpenDecryptModal: (drop: HyperlocalDrop) => void;
}

export const CreatorHubView: React.FC<CreatorHubViewProps> = ({
  onNotify,
  onOpenDecryptModal,
}) => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | 'ALL'>('24H');
  const [rows, setRows] = useState<ContentSettlementRow[]>(SETTLEMENT_ROWS);
  const [pendingAmount, setPendingAmount] = useState(189.62);
  const [isSweeping, setIsSweeping] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Countdown timer for next epoch
  const [countdown, setCountdown] = useState({ minutes: 14, seconds: 28 });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: 15, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSweepAll = () => {
    if (pendingAmount <= 0) {
      onNotify('All Settled', 'No pending earnings to claim at this time.', 'info');
      return;
    }
    setIsSweeping(true);
    setTimeout(() => {
      const sweptTotal = pendingAmount;
      setPendingAmount(0);
      setRows((prev) => prev.map((r) => ({ ...r, isSwept: true })));
      setIsSweeping(false);
      onNotify(
        'Funds Claimed Successfully',
        `$${sweptTotal.toFixed(2)} transferred to your wallet.`,
        'success'
      );
    }, 800);
  };

  const handleSweepRow = (id: string, yieldText: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSwept: true } : r))
    );
    onNotify('Yield Claimed', `${yieldText} settled instantly into your vault.`, 'success');
  };

  const handleCopyVaultAddress = () => {
    navigator.clipboard.writeText('0x71C9f5a049d52bF88F1aC9082b98AB3192084c7E');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
    onNotify('Address Copied', 'Vault address copied to clipboard.', 'info');
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Creator Hub & Settlement
            </h1>
            <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-xs font-medium">
              45% Direct Split
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Per-view micro-settlements and secondary remix royalties deposited directly to your sovereign vault.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col sm:items-end">
            <span className="text-[11px] text-outline">Pending Payout</span>
            <span className="text-lg font-bold text-tertiary">
              ${pendingAmount.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleSweepAll}
            disabled={isSweeping || pendingAmount === 0}
            className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Zap className={`w-3.5 h-3.5 ${isSweeping ? 'animate-spin' : ''}`} />
            <span>{isSweeping ? 'Claiming...' : 'Claim to Vault'}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Total Earnings</span>
            <Coins className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-on-surface">$4,821.40</span>
            <span className="text-xs text-secondary font-medium">+18.4%</span>
          </div>
          <span className="text-[11px] text-outline">Lifetime accumulated payout</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Per-View Settlement</span>
            <Zap className="w-4 h-4 text-secondary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-secondary">$0.0028</span>
            <span className="text-xs text-outline">/ view</span>
          </div>
          <span className="text-[11px] text-outline">Direct micro-settlement</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Next Epoch Settlement</span>
            <Clock className="w-4 h-4 text-tertiary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-tertiary">
              {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-outline">remaining</span>
          </div>
          <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-tertiary rounded-full transition-all duration-1000"
              style={{ width: `${(countdown.minutes / 15) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-outline text-xs">
            <span>Remix Royalties</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">$642.15</span>
            <span className="text-xs text-secondary font-medium">12% cut</span>
          </div>
          <span className="text-[11px] text-outline">From 124 derivative nodes</span>
        </div>
      </div>

      {/* Impression Velocity vs Revenue Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Impression Trend Chart (8 cols) */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-on-surface">Attention Velocity & Ad Yield</h2>
              <p className="text-xs text-outline">Performance across active validator nodes</p>
            </div>

            <div className="flex items-center rounded-lg bg-surface-container p-0.5 text-xs font-mono">
              {(['24H', '7D', '30D', 'ALL'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    timeRange === r
                      ? 'bg-surface text-on-surface font-semibold shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Line / Area Chart */}
          <div className="relative w-full h-52 mt-2">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 700 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Subtle Grid Lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="var(--color-outline-variant)" strokeOpacity="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="110" x2="700" y2="110" stroke="var(--color-outline-variant)" strokeOpacity="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="170" x2="700" y2="170" stroke="var(--color-outline-variant)" strokeOpacity="0.5" strokeDasharray="3 3" />

              {/* Area 2 (Direct Share) */}
              <path
                d="M 0 160 C 90 150, 160 170, 240 120 C 320 70, 400 130, 480 100 C 560 70, 630 90, 700 60 L 700 200 L 0 200 Z"
                fill="url(#chartGrad2)"
              />
              <path
                d="M 0 160 C 90 150, 160 170, 240 120 C 320 70, 400 130, 480 100 C 560 70, 630 90, 700 60"
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
              />

              {/* Area 1 (Impression Density) */}
              <path
                d="M 0 130 C 90 80, 160 100, 240 50 C 320 15, 400 85, 480 40 C 560 18, 630 35, 700 20 L 700 200 L 0 200 Z"
                fill="url(#chartGrad1)"
              />
              <path
                d="M 0 130 C 90 80, 160 100, 240 50 C 320 15, 400 85, 480 40 C 560 18, 630 35, 700 20"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2"
              />

              {/* Anchor points */}
              <circle cx="240" cy="50" r="3.5" fill="#2dd4bf" />
              <circle cx="700" cy="20" r="3.5" fill="#2dd4bf" />
              <circle cx="700" cy="60" r="3.5" fill="#818cf8" />
            </svg>

            <div className="flex justify-between text-[11px] text-outline pt-2 font-mono">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>Now</span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-6 pt-2 border-t border-border-glass-dark text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span className="text-on-surface">Impressions (148.2k)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span className="text-on-surface">Direct Ad Share ($415.21)</span>
            </div>
          </div>
        </div>

        {/* Right: Yield Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Revenue Sources</h2>
            <p className="text-xs text-outline">Distribution across protocol streams</p>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span>Creator Ad Split (45%)</span>
              </div>
              <span className="font-semibold text-secondary">$2,169.63</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                <span>Viewer Tips</span>
              </div>
              <span className="font-semibold text-primary">$2,009.62</span>
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span>Remix Derivatives</span>
              </div>
              <span className="font-semibold text-tertiary">$642.15</span>
            </div>
          </div>

          {/* Total */}
          <div className="p-3 rounded-lg bg-surface-container flex items-center justify-between text-xs">
            <span className="font-medium text-outline">Total Distributed</span>
            <span className="font-bold text-on-surface text-sm">$4,821.40</span>
          </div>
        </div>
      </div>

      {/* Recent Settlements Table */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface border border-border-glass-dark flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Recent Content Settlements</h2>
            <p className="text-xs text-outline">Instantaneous micro-payouts per impression</p>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-glass-dark text-outline text-[11px]">
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Impressions</th>
                <th className="py-2.5 px-3">Dwell Time</th>
                <th className="py-2.5 px-3">Engagement</th>
                <th className="py-2.5 px-3">Remixes</th>
                <th className="py-2.5 px-3">Net Yield</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass-dark">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">{row.title}</span>
                      <span className="text-[10px] text-outline">{row.timeAgo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-on-surface font-mono">{row.trueImpr}</td>
                  <td className="py-3 px-3 text-on-surface-variant font-mono">{row.dwellTime}</td>
                  <td className="py-3 px-3 text-secondary font-medium font-mono">{row.engagementRate}</td>
                  <td className="py-3 px-3 text-outline font-mono">{row.remixesCount} forks</td>
                  <td className="py-3 px-3 font-semibold text-secondary font-mono">{row.netYield}</td>
                  <td className="py-3 px-3 text-right">
                    {row.isSwept ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-outline">
                        <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                        Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSweepRow(row.id, row.netYield)}
                        className="px-3 py-1 rounded-md bg-secondary/10 hover:bg-secondary/20 text-secondary font-medium text-xs transition-colors cursor-pointer"
                      >
                        Claim
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Vault Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface border border-border-glass-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-on-surface">Target Custody Vault</span>
            <span className="font-mono text-xs text-outline">0x71C9f5a049d52bF88F1aC9082b98AB3192084c7E</span>
          </div>
        </div>

        <button
          onClick={handleCopyVaultAddress}
          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-medium text-on-surface transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          {copiedAddress ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedAddress ? 'Copied' : 'Copy Address'}</span>
        </button>
      </div>
    </div>
  );
};
