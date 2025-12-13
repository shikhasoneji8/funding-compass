// Types for the Investor Panel multi-agent framework

export interface StartupProfile {
  startupName: string;
  oneLiner: string;
  problem: string;
  solution: string;
  targetCustomer: string;
  businessModel: string;
  traction: string;
  team: string;
  moat: string;
  competitors: string;
  fundraisingGoal: string;
  extraNotes: string;
}

export interface InvestorPersona {
  id: string;
  displayName: string;
  roleTitle: string;
  bio: string;
  investmentThesis: string[];
  redFlags: string[];
  favoriteSignals: string[];
  voiceStyle: string;
  systemPrompt: string;
  enabled: boolean;
}

export interface ScoreCard {
  team: number;
  market: number;
  product: number;
  moat: number;
  traction: number;
  gtm: number;
  pricing: number;
  defensibility: number;
  narrativeClarity: number;
}

export interface AgentReview {
  personaId: string;
  personaName: string;
  verdict: 'Pass' | 'Maybe' | 'Invest';
  strengths: string[];
  risks: string[];
  dueDiligenceQuestions: string[];
  suggestedMilestone: string;
  scoreCard: ScoreCard;
}

export interface DiscussionMessage {
  personaId: string;
  personaName: string;
  targetPersonaId?: string;
  targetPersonaName?: string;
  message: string;
  turn: number;
}

export interface PanelResult {
  consensusSummary: string;
  keyDisagreements: {
    topic: string;
    personaA: string;
    personaAPosition: string;
    personaB: string;
    personaBPosition: string;
  }[];
  fundingFit: string;
  idealInvestorProfile: string;
  pitchFixes: string[];
  actionPlan: {
    week: string;
    milestone: string;
  }[];
  redFlags: string[];
  finalRecommendation: string;
  confidencePercent: number;
}

export interface InvestorPanelResponse {
  reviews: AgentReview[];
  discussion: DiscussionMessage[];
  finalReport: PanelResult;
}

export type PanelMode = 'fast' | 'deep';
export type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';

export interface PanelSettings {
  agentCount: number;
  mode: PanelMode;
  riskTolerance: RiskTolerance;
}
