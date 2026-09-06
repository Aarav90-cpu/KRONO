export type ViewMode = 'feed' | 'creator-hub' | 'ad-manager' | 'network-referral' | 'explore';

export type FeedSubMode = 'chrono' | 'viral';

export type FeedFilter = 'all' | 'following' | 'hyperlocal' | 'circles';

export interface CreatorPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    hexId: string;
    node: string;
  };
  timestamp: string;
  earnedAmount: string;
  content: string;
  mediaUrl?: string;
  shaderBadge?: {
    nodeId: string;
    fps: string;
  };
  metrics: {
    likes: number;
    comments: number;
    remixes: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  isSponsored?: boolean;
  sponsorDetails?: {
    brandName: string;
    tagline: string;
    adSplit: {
      creator: string;
      viewerRef: string;
      platform: string;
    };
    ctaText: string;
    ctaHeadline: string;
    impressions: string;
    distributedAmount: string;
  };
  isEphemeralDrop?: boolean;
  ephemeralDetails?: {
    beaconId: string;
    distance: string;
    timeLeft: string;
    peersNearby: number;
    coordinates: string;
    claimed?: boolean;
  };
}

export interface ContentSettlementRow {
  id: string;
  title: string;
  castId: string;
  timeAgo: string;
  icon: string;
  trueImpr: string;
  dwellTime: string;
  dwellPercent: string;
  engagementRate: string;
  remixesCount: number;
  netYield: string;
  isSwept: boolean;
}

export interface ReferralNode {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  tier: 'Tier 1 Direct' | 'Tier 2 Viral';
  impressions24h: string;
  grossGenerated: string;
  protocolCut: string;
  status: 'Streaming' | 'Idle';
}

export interface AdCampaign {
  id: string;
  name: string;
  tag: string;
  txid: string;
  verificationBadge: string;
  objective: string;
  placement: string;
  delivered: number;
  total: number;
  ctr: string;
  clicks: number;
  ecpm: string;
  winRate: string;
  fatigueAvg: string;
  fatigueCap: string;
  spent: string;
  spentPercent: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
}

export interface HyperlocalDrop {
  id: string;
  geoRadius: string;
  timeLeft: string;
  title: string;
  description: string;
  teleViews: string;
  unlockConv: string;
  yield: string;
}
