export type NarrativeStage = 'seed' | 'spreading' | 'consensus' | 'crowded' | 'fading';
export type ActionabilityCeiling = 'ignore' | 'watch' | 'light' | 'standard';

export interface NarrativeEventInput {
  id: string;
  headline: string;
  event_type: string;
  source_tier: 'official' | 'journalist' | 'analyst' | 'kol';
  first_order_event: boolean;
}

export interface ThemeCluster {
  theme: string;
  eventIds: string[];
  eventType: string;
  size: number;
}

export interface NarrativeDiffusionInput {
  tier1Events: number;
  tier2Events: number;
  tier3Events: number;
  firstEventMinutesAgo: number;
  latestEventMinutesAgo: number;
  totalUniqueAccounts: number;
}

export interface NarrativeDiffusionOutput {
  layer1_velocity: number;
  layer2_velocity: number;
  layer3_retail_diffusion: number;
  spread_strength: number;
  total_events: number;
  unique_accounts: number;
}

export interface NarrativeClassifierInput {
  spread_strength: number;
  first_order_presence: boolean;
  hard_catalyst: boolean;
  crowding_probability: number;
  cluster_size: number;
}

export interface NarrativeClassifierOutput {
  narrative_stage: NarrativeStage;
  actionability_ceiling: ActionabilityCeiling;
}

export interface NarrativeInput {
  events: NarrativeEventInput[];
  firstEventMinutesAgo: number;
  latestEventMinutesAgo: number;
  totalUniqueAccounts: number;
  marketLinkageConfirmation?: number;
  positioningConfirmation: number;
}

export interface NarrativeOutput {
  asset: 'BTC';
  theme: string;
  theme_probability: number;
  narrative_stage: NarrativeStage;
  spread_strength: number;
  source_quality_score: number;
  crowding_probability: number;
  first_order_presence: boolean;
  hard_catalyst: boolean;
  layer1_velocity: number;
  layer2_velocity: number;
  layer3_retail_diffusion: number;
  positioning_confirmation: number;
  actionability_ceiling: ActionabilityCeiling;
  notes: string;
}
