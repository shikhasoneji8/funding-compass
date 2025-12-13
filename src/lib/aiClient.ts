/**
 * AI Client for FundingNEMO
 * Routes all AI calls through Supabase Edge Functions (Gradient AI)
 * Never exposes API keys to the frontend
 */

import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateOptions {
  messages: Message[];
  model?: string;
  max_tokens?: number;
}

interface GenerateResponse {
  text: string | null;
  json: Record<string, unknown> | null;
  error?: string;
}

/**
 * Call the generate-pitch edge function
 */
export async function generatePitchAsset(
  projectId: string,
  assetType: string,
  project: Record<string, unknown>
): Promise<GenerateResponse> {
  const { data, error } = await supabase.functions.invoke('generate-pitch', {
    body: { projectId, assetType, project },
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate pitch asset');
  }

  return data;
}

/**
 * Call the ai-advisor edge function
 */
export async function callAdvisor(
  advisorType: string,
  project: Record<string, unknown>
): Promise<GenerateResponse> {
  const { data, error } = await supabase.functions.invoke('ai-advisor', {
    body: { advisorType, project },
  });

  if (error) {
    throw new Error(error.message || 'Failed to get advisor response');
  }

  return data;
}

/**
 * Call the pitch-feedback edge function
 */
export async function getPitchFeedback(
  project: Record<string, unknown>,
  pitchType: string,
  userPitch: string
): Promise<GenerateResponse> {
  const { data, error } = await supabase.functions.invoke('pitch-feedback', {
    body: { project, pitchType, userPitch },
  });

  if (error) {
    throw new Error(error.message || 'Failed to get pitch feedback');
  }

  return data;
}

/**
 * Generic AI generate function (uses generate-pitch with custom messages)
 */
export async function generateAI(options: GenerateOptions): Promise<GenerateResponse> {
  // Use the generate-pitch function with a generic approach
  const { data, error } = await supabase.functions.invoke('generate-pitch', {
    body: { 
      projectId: 'generic',
      assetType: 'custom',
      messages: options.messages,
      max_tokens: options.max_tokens
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate content');
  }

  return data;
}

// ============================================
// PITCH ASSET PROMPTS (kept for reference/direct use)
// ============================================

export function buildTaglinePrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Rewrite the following startup description into a crisp, investor-ready one-liner (under 15 words):

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Category: ${project.category}

Return ONLY the tagline, nothing else.`,
    },
  ];
}

export function build30SecPitchPrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Generate a 30-second spoken pitch suitable for a first investor meeting (about 80-100 words):

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Traction: ${project.traction_users || 'Early stage'} users, ${project.traction_revenue || 'Pre-revenue'}
Ask: ${project.ask_amount}

The pitch should hook attention, state the problem, present the solution, mention traction, and end with the ask. Return ONLY the pitch text.`,
    },
  ];
}

export function build2MinPitchPrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Generate a structured 2-minute pitch with problem, solution, market, traction, and ask (about 300-350 words):

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Why Now: ${project.why_now || 'Market timing is right'}
Differentiation: ${project.differentiation || 'Unique approach'}
Traction: Users: ${project.traction_users || 'Early stage'}, Revenue: ${project.traction_revenue || 'Pre-revenue'}, Growth: ${project.traction_growth || 'Growing'}
Business Model: ${project.business_model}
Ask: ${project.ask_amount}
Use of Funds: ${project.use_of_funds}

Structure: Opening hook, problem deep-dive, solution explanation, market opportunity, traction proof, business model, team credibility (brief), and clear ask. Return ONLY the pitch text.`,
    },
  ];
}

export function buildDeckOutlinePrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Generate a 6-slide pitch deck outline. Return ONLY valid JSON array:
[
  { "slide": 1, "title": "string", "bullets": ["string"] }
]

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Traction: ${project.traction_users || 'N/A'} users, ${project.traction_revenue || 'N/A'} revenue
Business Model: ${project.business_model}
Ask: ${project.ask_amount}
Use of Funds: ${project.use_of_funds}

Cover: Title/Hook, Problem, Solution, Traction/Market, Business Model, Ask.`,
    },
  ];
}

export function buildColdEmailPrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Write a concise investor cold email (≤120 words). No hype. Professional tone.

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Traction: ${project.traction_users || 'Early'} users, ${project.traction_revenue || 'Pre-revenue'}
Ask: ${project.ask_amount}
Category: ${project.category}
Stage: ${project.stage}

Include subject line. Format as:

Subject: [subject]

[email body]`,
    },
  ];
}

export function buildLinkedInIntroPrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Write a short, polite LinkedIn intro request. Non-salesy. Keep under 280 characters.

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Category: ${project.category}
Traction: ${project.traction_users || 'Early stage'}
Ask: ${project.ask_amount}

Be personal, mention why you're reaching out, and hint at your traction.`,
    },
  ];
}

// ============================================
// ADVISOR PROMPTS
// ============================================

export function buildSmartGuidancePrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Based on stage and market, suggest fundraising guidance for this startup. Return ONLY valid JSON:

{
  "recommended_ask": { "amount": "specific dollar range", "reasoning": "why" },
  "equity_guidance": { "range": "percentage range", "reasoning": "based on stage" },
  "use_of_funds_breakdown": [
    { "category": "Engineering", "percentage": 40, "reasoning": "build product" }
  ],
  "valuation_estimate": { "range": "valuation range", "method": "how calculated" },
  "runway_recommendation": { "months": 18, "reasoning": "why" }
}

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Current Ask: ${project.ask_amount || 'Not specified'}
Business Model: ${project.business_model}
Traction: Users: ${project.traction_users || 'N/A'}, Revenue: ${project.traction_revenue || 'N/A'}`,
    },
  ];
}

export function buildCompetitorAnalysisPrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `List direct and indirect competitors and explain differentiation. Return ONLY valid JSON:

{
  "direct_competitors": [
    { "name": "Competitor", "description": "What they do", "funding": "Funding info", "strengths": ["s1"], "weaknesses": ["w1"], "your_advantage": "How you differentiate" }
  ],
  "indirect_competitors": [
    { "name": "Indirect", "description": "How they compete", "threat_level": "low/medium/high" }
  ],
  "market_positioning": {
    "your_niche": "Where you fit",
    "blue_ocean_opportunities": ["opportunity"],
    "key_differentiators": ["differentiator"]
  },
  "competitive_moat": { "current_moat": "Current protection", "moat_to_build": "Future moat" }
}

Startup: ${project.startup_name}
Category: ${project.category}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Differentiation: ${project.differentiation || 'Not specified'}`,
    },
  ];
}

export function buildInvestorMatchingPrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Suggest relevant investor types, sample firms, and accelerators. Explain why each is a fit. Return ONLY valid JSON:

{
  "tier1_investors": [
    { "name": "Investor Name", "firm": "Firm", "type": "VC/Angel", "check_size": "$X-$Y", "thesis_match": "Why interested", "portfolio_examples": ["Similar co"], "approach_tip": "How to reach out" }
  ],
  "tier2_investors": [
    { "name": "Name", "firm": "Firm", "type": "VC/Angel", "check_size": "$X-$Y", "thesis_match": "Why relevant" }
  ],
  "accelerators": [
    { "name": "Accelerator", "investment": "Terms", "why_apply": "Why good fit", "deadline_hint": "Timing" }
  ],
  "outreach_strategy": {
    "warm_intro_sources": ["Source"],
    "cold_outreach_tips": ["Tip"],
    "timing_advice": "When to reach out"
  }
}

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
Ask Amount: ${project.ask_amount}
One-liner: ${project.one_liner}
Business Model: ${project.business_model}
Traction: Users: ${project.traction_users || 'Early'}, Revenue: ${project.traction_revenue || 'Pre-revenue'}`,
    },
  ];
}

export function buildFinancialModelPrompt(project: Record<string, unknown>): Message[] {
  return [
    {
      role: 'user',
      content: `Create financial projections. If info is missing, state assumptions. Return ONLY valid JSON:

{
  "funding_summary": { "recommended_raise": "$X", "pre_money_valuation": "$X-$Y", "dilution": "X%-Y%", "runway_months": 18 },
  "monthly_burn_projection": { "current": "$X", "month_6": "$X", "month_12": "$X", "month_18": "$X" },
  "revenue_projections": {
    "year_1": { "revenue": "$X", "users": "X", "assumptions": "key assumption" },
    "year_2": { "revenue": "$X", "users": "X", "assumptions": "key assumption" },
    "year_3": { "revenue": "$X", "users": "X", "assumptions": "key assumption" }
  },
  "unit_economics": { "cac_estimate": "$X", "ltv_estimate": "$X", "ltv_cac_ratio": "X:1", "payback_period": "X months" },
  "use_of_funds": [{ "category": "Product", "amount": "$X", "percentage": 40 }],
  "key_milestones": [{ "month": 6, "milestone": "Description", "metric": "Target" }],
  "risk_factors": ["Risk 1"]
}

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
Ask Amount: ${project.ask_amount}
Business Model: ${project.business_model}
Traction: Users: ${project.traction_users || '0'}, Revenue: ${project.traction_revenue || '$0'}, Growth: ${project.traction_growth || 'N/A'}`,
    },
  ];
}

export function buildPitchFeedbackPrompt(
  project: Record<string, unknown>,
  promptType: string,
  userPitch: string
): Message[] {
  return [
    {
      role: 'user',
      content: `Score this pitch on clarity, credibility, and conciseness (1–10). Return ONLY valid JSON:

{
  "score": 7,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "rewrite_suggestion": "improved version",
  "feedback": [
    { "category": "Clarity", "score": "good", "feedback": "specific advice" },
    { "category": "Hook", "score": "needs_work", "feedback": "specific advice" },
    { "category": "Specificity", "score": "good", "feedback": "specific advice" },
    { "category": "Traction", "score": "needs_work", "feedback": "specific advice" },
    { "category": "Ask", "score": "missing", "feedback": "specific advice" }
  ]
}

Company context:
- Name: ${project.startup_name}
- One-liner: ${project.one_liner}
- Problem: ${project.problem_statement}
- Solution: ${project.solution_description}
- Target users: ${project.target_users}
- Traction: ${project.traction_users || 'Not specified'} users, ${project.traction_revenue || 'Not specified'} revenue
- Ask: ${project.ask_amount}

Pitch type: ${promptType}

User's pitch:
"""
${userPitch}
"""`,
    },
  ];
}

// ============================================
// HELPER TO GET PROMPT BY ASSET TYPE
// ============================================

export function getPromptForAssetType(
  assetType: string,
  project: Record<string, unknown>
): Message[] {
  switch (assetType) {
    case 'tagline':
      return buildTaglinePrompt(project);
    case '30sec':
      return build30SecPitchPrompt(project);
    case '2min':
      return build2MinPitchPrompt(project);
    case 'deck_outline':
      return buildDeckOutlinePrompt(project);
    case 'cold_email':
      return buildColdEmailPrompt(project);
    case 'linkedin_intro':
      return buildLinkedInIntroPrompt(project);
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
}
