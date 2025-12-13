import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const FUNDINGNEMO_SYSTEM = `You are FundingNEMO, an expert startup fundraising advisor.
You help early-stage founders prepare investor-ready materials.
You are concise, practical, and opinionated.
You avoid hype, buzzwords, and unrealistic claims.
You provide outputs that are immediately usable by founders.
When appropriate, return structured JSON exactly as requested.`;

async function callLovableAI(messages: { role: string; content: string }[]): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  console.log("Calling Lovable AI gateway...");

  const response = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);

    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    if (response.status === 402) {
      throw new Error("PAYMENT_REQUIRED");
    }
    if (response.status === 401) {
      throw new Error("AUTH_ERROR");
    }

    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content generated");
  }

  return content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project, advisorType } = await req.json();

    let userPrompt = "";

    switch (advisorType) {
      case "smart_guidance":
        userPrompt = `Based on stage and market, suggest fundraising guidance for this startup:

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Current Ask: ${project.ask_amount || "Not specified"}
Business Model: ${project.business_model}
Traction: Users: ${project.traction_users || "N/A"}, Revenue: ${project.traction_revenue || "N/A"}

Suggest:
- reasonable funding ask range
- equity dilution range
- valuation logic
- runway estimate

Return ONLY valid JSON in this format:
{
  "recommended_ask": {
    "amount": "specific dollar range",
    "reasoning": "why this range makes sense"
  },
  "equity_guidance": {
    "range": "percentage range to give up",
    "reasoning": "based on stage and traction"
  },
  "use_of_funds_breakdown": [
    {"category": "Engineering", "percentage": 40, "reasoning": "build core product"},
    {"category": "Sales & Marketing", "percentage": 30, "reasoning": "customer acquisition"},
    {"category": "Operations", "percentage": 20, "reasoning": "infrastructure"},
    {"category": "Buffer", "percentage": 10, "reasoning": "contingency"}
  ],
  "valuation_estimate": {
    "range": "valuation range",
    "method": "how calculated"
  },
  "runway_recommendation": {
    "months": 18,
    "reasoning": "why this timeline"
  }
}`;
        break;

      case "competitor_analysis":
        userPrompt = `List direct and indirect competitors and explain differentiation for this startup:

Startup: ${project.startup_name}
Category: ${project.category}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Differentiation: ${project.differentiation || "Not specified"}

Return a comparison table as valid JSON:
{
  "direct_competitors": [
    {
      "name": "Competitor Name",
      "description": "What they do",
      "funding": "Funding stage/amount if known",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "your_advantage": "How you differentiate"
    }
  ],
  "indirect_competitors": [
    {
      "name": "Indirect Competitor",
      "description": "How they compete indirectly",
      "threat_level": "low/medium/high"
    }
  ],
  "market_positioning": {
    "your_niche": "Where you fit",
    "blue_ocean_opportunities": ["opportunity 1", "opportunity 2"],
    "key_differentiators": ["differentiator 1", "differentiator 2"]
  },
  "competitive_moat": {
    "current_moat": "What protects you now",
    "moat_to_build": "What to develop"
  }
}`;
        break;

      case "investor_matching":
        userPrompt = `Suggest relevant investor types, sample firms, and accelerators based on this startup profile:

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
Ask Amount: ${project.ask_amount}
One-liner: ${project.one_liner}
Business Model: ${project.business_model}
Traction: Users: ${project.traction_users || "Early"}, Revenue: ${project.traction_revenue || "Pre-revenue"}

Explain why each is a fit. Return ONLY valid JSON:
{
  "tier1_investors": [
    {
      "name": "VC/Angel Name",
      "firm": "Firm name if applicable",
      "type": "VC/Angel/Accelerator",
      "check_size": "$X - $Y",
      "thesis_match": "Why they'd be interested",
      "portfolio_examples": ["Similar company 1", "Similar company 2"],
      "approach_tip": "How to reach out"
    }
  ],
  "tier2_investors": [
    {
      "name": "Investor Name",
      "firm": "Firm",
      "type": "VC/Angel",
      "check_size": "$X - $Y",
      "thesis_match": "Why relevant"
    }
  ],
  "accelerators": [
    {
      "name": "Accelerator Name",
      "investment": "Terms if known",
      "why_apply": "Why good fit",
      "deadline_hint": "Application timing"
    }
  ],
  "outreach_strategy": {
    "warm_intro_sources": ["Source 1", "Source 2"],
    "cold_outreach_tips": ["Tip 1", "Tip 2"],
    "timing_advice": "When to reach out"
  }
}`;
        break;

      case "financial_model":
        userPrompt = `Create financial projections for this startup:

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
Ask Amount: ${project.ask_amount}
Business Model: ${project.business_model}
Current Traction: Users: ${project.traction_users || "0"}, Revenue: ${project.traction_revenue || "$0"}, Growth: ${project.traction_growth || "N/A"}

If information is missing, say so explicitly. Return ONLY valid JSON:
{
  "funding_summary": {
    "recommended_raise": "$X",
    "pre_money_valuation": "$X - $Y range",
    "dilution": "X% - Y%",
    "runway_months": 18
  },
  "monthly_burn_projection": {
    "current": "$X",
    "month_6": "$X",
    "month_12": "$X",
    "month_18": "$X"
  },
  "revenue_projections": {
    "year_1": { "revenue": "$X", "users": "X", "assumptions": "key assumption" },
    "year_2": { "revenue": "$X", "users": "X", "assumptions": "key assumption" },
    "year_3": { "revenue": "$X", "users": "X", "assumptions": "key assumption" }
  },
  "unit_economics": {
    "cac_estimate": "$X",
    "ltv_estimate": "$X",
    "ltv_cac_ratio": "X:1",
    "payback_period": "X months"
  },
  "use_of_funds": [
    { "category": "Product/Engineering", "amount": "$X", "percentage": 40 },
    { "category": "Sales/Marketing", "amount": "$X", "percentage": 30 },
    { "category": "Operations", "amount": "$X", "percentage": 20 },
    { "category": "Buffer", "amount": "$X", "percentage": 10 }
  ],
  "key_milestones": [
    { "month": 6, "milestone": "Milestone description", "metric": "Target metric" },
    { "month": 12, "milestone": "Milestone description", "metric": "Target metric" },
    { "month": 18, "milestone": "Milestone description", "metric": "Target metric" }
  ],
  "risk_factors": ["Risk 1", "Risk 2", "Risk 3"]
}`;
        break;

      case "marketing_strategy":
        userPrompt = `Create a marketing strategy for this startup:

Startup: ${project.startup_name}
Category: ${project.category}
Target Users: ${project.target_users}
One-liner: ${project.one_liner}
Solution: ${project.solution_description}
Go-to-Market Notes: ${project.go_to_market || "Not specified"}
Business Model: ${project.business_model}

Return ONLY valid JSON:
{
  "target_segments": [
    {
      "segment": "Segment name",
      "description": "Who they are",
      "pain_points": ["pain 1", "pain 2"],
      "channels": ["channel 1", "channel 2"],
      "messaging": "Key message for this segment"
    }
  ],
  "acquisition_channels": [
    {
      "channel": "Channel name",
      "priority": "high/medium/low",
      "estimated_cac": "$X - $Y",
      "tactics": ["tactic 1", "tactic 2"],
      "timeline": "When to start"
    }
  ],
  "content_strategy": {
    "themes": ["theme 1", "theme 2"],
    "formats": ["format 1", "format 2"],
    "distribution": ["platform 1", "platform 2"]
  },
  "launch_playbook": {
    "pre_launch": ["action 1", "action 2"],
    "launch_week": ["action 1", "action 2"],
    "post_launch": ["action 1", "action 2"]
  },
  "metrics_to_track": ["metric 1", "metric 2", "metric 3"],
  "budget_allocation": {
    "paid": 30,
    "organic": 40,
    "partnerships": 20,
    "events": 10
  }
}`;
        break;

      default:
        throw new Error(`Unknown advisor type: ${advisorType}`);
    }

    console.log(`Running ${advisorType} for ${project.startup_name}`);

    const messages = [
      { role: "system", content: FUNDINGNEMO_SYSTEM },
      { role: "user", content: userPrompt },
    ];

    let content: string;
    try {
      content = await callLovableAI(messages);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "RATE_LIMIT") {
          return new Response(
            JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (error.message === "PAYMENT_REQUIRED") {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (error.message === "AUTH_ERROR") {
          return new Response(
            JSON.stringify({ error: "AI service authentication error." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      throw error;
    }

    // Clean up markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Try to extract JSON from the content if it contains extra text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    // Parse and validate JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON:", content.substring(0, 500));

      // Return a fallback response instead of failing
      const fallbackResponses: Record<string, object> = {
        smart_guidance: {
          recommended_ask: { amount: "Please try again", reasoning: "Unable to generate advice at this time" },
          equity_guidance: { range: "10-20%", reasoning: "Standard early-stage range" },
          use_of_funds_breakdown: [],
          valuation_estimate: { range: "TBD", method: "Unable to calculate" },
          runway_recommendation: { months: 12, reasoning: "Standard recommendation" },
        },
        competitor_analysis: {
          direct_competitors: [],
          indirect_competitors: [],
          market_positioning: { your_niche: "Unable to analyze at this time", blue_ocean_opportunities: [], key_differentiators: [] },
          competitive_moat: { current_moat: "TBD", moat_to_build: "TBD" },
        },
        investor_matching: {
          tier1_investors: [],
          tier2_investors: [],
          accelerators: [],
          outreach_strategy: { warm_intro_sources: [], cold_outreach_tips: ["Try again later"], timing_advice: "Unable to generate at this time" },
        },
        financial_model: {
          funding_summary: { recommended_raise: "TBD", pre_money_valuation: "TBD", dilution: "TBD", runway_months: 12 },
          monthly_burn_projection: { current: "TBD", month_6: "TBD", month_12: "TBD", month_18: "TBD" },
          revenue_projections: { year_1: { revenue: "TBD", users: "TBD", assumptions: "Unable to generate" } },
          unit_economics: { cac_estimate: "TBD", ltv_estimate: "TBD", ltv_cac_ratio: "TBD", payback_period: "TBD" },
          use_of_funds: [],
          key_milestones: [],
          risk_factors: ["Unable to generate at this time - please try again"],
        },
        marketing_strategy: {
          target_segments: [],
          acquisition_channels: [],
          content_strategy: { themes: [], formats: [], distribution: [] },
          launch_playbook: { pre_launch: [], launch_week: [], post_launch: [] },
          metrics_to_track: [],
          budget_allocation: { paid: 25, organic: 50, partnerships: 15, events: 10 },
        },
      };

      parsed = fallbackResponses[advisorType] || { error: "Unable to generate advice. Please try again." };
    }

    console.log(`Generated ${advisorType} successfully`);

    return new Response(
      JSON.stringify({ data: parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in ai-advisor:", error);
    const message = error instanceof Error ? error.message : "Failed to generate advice";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
