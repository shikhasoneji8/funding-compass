import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface StartupProfile {
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

interface Persona {
  id: string;
  displayName: string;
  roleTitle: string;
  systemPrompt: string;
  voiceStyle: string;
}

interface PanelSettings {
  agentCount: number;
  mode: 'fast' | 'deep';
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
}

async function callAI(messages: { role: string; content: string }[], maxTokens = 1500): Promise<string> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  console.log(`[AI] Calling Lovable AI with ${messages.length} messages`);

  const response = await fetch(LOVABLE_AI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI] Error: ${response.status} - ${errorText}`);
    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    if (response.status === 402) {
      throw new Error('PAYMENT_REQUIRED');
    }
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content generated');
  }

  return content;
}

function buildStartupBrief(profile: StartupProfile): string {
  return `
STARTUP BRIEF:
- Name: ${profile.startupName}
- One-liner: ${profile.oneLiner}
- Problem: ${profile.problem}
- Solution: ${profile.solution}
- Target Customer: ${profile.targetCustomer}
- Business Model: ${profile.businessModel}
- Traction: ${profile.traction || 'Not provided'}
- Team: ${profile.team || 'Not provided'}
- Moat/Differentiation: ${profile.moat || 'Not provided'}
- Competitors: ${profile.competitors || 'Not provided'}
- Fundraising Goal: ${profile.fundraisingGoal || 'Not provided'}
- Additional Notes: ${profile.extraNotes || 'None'}
`.trim();
}

async function getAgentReview(persona: Persona, brief: string, settings: PanelSettings) {
  const riskContext = {
    conservative: 'Be cautious and focus on proven traction and lower-risk opportunities.',
    balanced: 'Balance potential upside with realistic assessment of risks.',
    aggressive: 'Emphasize big vision and high upside potential over current limitations.'
  };

  const modeContext = settings.mode === 'fast' 
    ? 'Provide a quick, focused assessment.'
    : 'Provide a thorough, detailed analysis.';

  const systemPrompt = `${persona.systemPrompt}

Evaluation context: ${riskContext[settings.riskTolerance]}
${modeContext}

You MUST respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "verdict": "Pass" | "Maybe" | "Invest",
  "strengths": ["strength1", "strength2", "strength3"],
  "risks": ["risk1", "risk2", "risk3"],
  "dueDiligenceQuestions": ["q1", "q2", "q3", "q4", "q5"],
  "suggestedMilestone": "One specific milestone before raising",
  "scoreCard": {
    "team": 0-10,
    "market": 0-10,
    "product": 0-10,
    "moat": 0-10,
    "traction": 0-10,
    "gtm": 0-10,
    "pricing": 0-10,
    "defensibility": 0-10,
    "narrativeClarity": 0-10
  }
}`;

  const content = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Evaluate this startup:\n\n${brief}` }
  ]);

  try {
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    return {
      personaId: persona.id,
      personaName: `${persona.displayName}, ${persona.roleTitle}`,
      ...parsed
    };
  } catch (e) {
    console.error(`[Review] Failed to parse JSON for ${persona.displayName}:`, content);
    // Return a default structure if parsing fails
    return {
      personaId: persona.id,
      personaName: `${persona.displayName}, ${persona.roleTitle}`,
      verdict: 'Maybe',
      strengths: ['Unable to fully evaluate'],
      risks: ['Review parsing failed'],
      dueDiligenceQuestions: ['Please try again'],
      suggestedMilestone: 'N/A',
      scoreCard: { team: 5, market: 5, product: 5, moat: 5, traction: 5, gtm: 5, pricing: 5, defensibility: 5, narrativeClarity: 5 }
    };
  }
}

async function getPanelDiscussion(personas: Persona[], reviews: any[], brief: string, settings: PanelSettings) {
  const maxTurns = settings.mode === 'fast' ? 6 : 12;
  
  const reviewSummary = reviews.map(r => 
    `${r.personaName}: ${r.verdict} - Strengths: ${r.strengths.join(', ')}. Risks: ${r.risks.join(', ')}`
  ).join('\n');

  const systemPrompt = `You are moderating a panel discussion between investors evaluating a startup.
The investors have already given their individual reviews. Now they will discuss, challenge assumptions, and debate.

INVESTORS:
${personas.map(p => `- ${p.displayName} (${p.roleTitle}): ${p.voiceStyle}`).join('\n')}

THEIR REVIEWS:
${reviewSummary}

Generate a realistic panel discussion with ${maxTurns} exchanges total.
Each investor should respond to at least one other investor.
They should point out blind spots, challenge assumptions, and propose counterfactuals.
Keep responses concise and opinionated.

Respond with ONLY valid JSON array (no markdown):
[
  {
    "personaId": "investor-id",
    "personaName": "Name, Title",
    "targetPersonaId": "other-investor-id or null",
    "targetPersonaName": "Other Name or null",
    "message": "The discussion message",
    "turn": 1-${maxTurns}
  }
]`;

  const content = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Startup being discussed:\n\n${brief}` }
  ], 2000);

  try {
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error('[Discussion] Failed to parse:', content);
    return [];
  }
}

async function getFinalReport(personas: Persona[], reviews: any[], discussion: any[], brief: string) {
  const reviewSummary = reviews.map(r => 
    `${r.personaName}: ${r.verdict} (Team: ${r.scoreCard.team}, Market: ${r.scoreCard.market}, Product: ${r.scoreCard.product})`
  ).join('\n');

  const systemPrompt = `You are synthesizing a final investor panel report based on individual reviews and discussion.

REVIEWS:
${reviewSummary}

DISCUSSION SUMMARY:
${discussion.slice(0, 6).map(d => `${d.personaName}: ${d.message}`).join('\n')}

Create a comprehensive final report. Respond with ONLY valid JSON (no markdown):
{
  "consensusSummary": "What most investors agree on (2-3 sentences)",
  "keyDisagreements": [
    {
      "topic": "Topic of disagreement",
      "personaA": "Investor A name",
      "personaAPosition": "Their position",
      "personaB": "Investor B name",
      "personaBPosition": "Their position"
    }
  ],
  "fundingFit": "Best funding route recommendation (angel/VC/grant/accelerator/bootstrapping) with reasoning",
  "idealInvestorProfile": "Description of ideal investor to target, check sizes, thesis alignment",
  "pitchFixes": ["Specific fix 1", "Specific fix 2", "Specific fix 3"],
  "actionPlan": [
    {"week": "Week 1-2", "milestone": "Action item"},
    {"week": "Week 3-4", "milestone": "Action item"},
    {"week": "Week 5-8", "milestone": "Action item"},
    {"week": "Week 9-12", "milestone": "Action item"}
  ],
  "redFlags": ["Red flag if any"],
  "finalRecommendation": "Clear recommendation with reasoning (2-3 sentences)",
  "confidencePercent": 0-100
}`;

  const content = await callAI([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Startup:\n\n${brief}` }
  ], 2000);

  try {
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error('[FinalReport] Failed to parse:', content);
    return {
      consensusSummary: 'Unable to generate consensus summary.',
      keyDisagreements: [],
      fundingFit: 'Unable to determine funding fit.',
      idealInvestorProfile: 'Unable to determine ideal investor profile.',
      pitchFixes: ['Please try again'],
      actionPlan: [{ week: 'Week 1-4', milestone: 'Retry panel analysis' }],
      redFlags: [],
      finalRecommendation: 'Panel analysis encountered an error. Please try again.',
      confidencePercent: 0
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, settings, personas } = await req.json() as {
      profile: StartupProfile;
      settings: PanelSettings;
      personas: Persona[];
    };

    console.log(`[Panel] Starting evaluation for ${profile.startupName} with ${personas.length} investors`);

    const brief = buildStartupBrief(profile);

    // Step 1: Get individual reviews (parallel)
    console.log('[Panel] Step 1: Getting individual reviews...');
    const reviewPromises = personas.map(p => getAgentReview(p, brief, settings));
    const reviews = await Promise.all(reviewPromises);
    console.log(`[Panel] Got ${reviews.length} reviews`);

    // Step 2: Panel discussion
    console.log('[Panel] Step 2: Generating panel discussion...');
    const discussion = await getPanelDiscussion(personas, reviews, brief, settings);
    console.log(`[Panel] Got ${discussion.length} discussion messages`);

    // Step 3: Final report
    console.log('[Panel] Step 3: Generating final report...');
    const finalReport = await getFinalReport(personas, reviews, discussion, brief);
    console.log('[Panel] Final report generated');

    return new Response(JSON.stringify({
      reviews,
      discussion,
      finalReport
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Panel] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let status = 500;
    
    if (errorMessage === 'RATE_LIMIT') {
      status = 429;
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (errorMessage === 'PAYMENT_REQUIRED') {
      status = 402;
      return new Response(JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
