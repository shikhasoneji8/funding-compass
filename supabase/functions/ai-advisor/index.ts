import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project, advisorType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (advisorType) {
      case "smart_guidance":
        systemPrompt = `You are a seasoned startup advisor and fundraising expert. Provide specific, actionable guidance for early-stage founders based on their startup details. Be direct and practical.`;
        userPrompt = `Based on this startup, provide specific fundraising guidance:

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Current Ask: ${project.ask_amount || "Not specified"}
Business Model: ${project.business_model}
Traction: Users: ${project.traction_users || "N/A"}, Revenue: ${project.traction_revenue || "N/A"}

Provide guidance in this JSON format:
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
}

Return ONLY valid JSON.`;
        break;

      case "competitor_analysis":
        systemPrompt = `You are a market research analyst specializing in startup ecosystems. Provide comprehensive competitive analysis based on the startup's space.`;
        userPrompt = `Analyze the competitive landscape for:

Startup: ${project.startup_name}
Category: ${project.category}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Differentiation: ${project.differentiation || "Not specified"}

Provide analysis in this JSON format:
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
}

Return ONLY valid JSON.`;
        break;

      case "investor_matching":
        systemPrompt = `You are an expert in the venture capital ecosystem. Match startups with relevant investors based on their investment thesis, stage preference, and portfolio.`;
        userPrompt = `Find relevant investors for:

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
Ask Amount: ${project.ask_amount}
One-liner: ${project.one_liner}
Business Model: ${project.business_model}
Traction: Users: ${project.traction_users || "Early"}, Revenue: ${project.traction_revenue || "Pre-revenue"}

Provide recommendations in this JSON format:
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
}

Return ONLY valid JSON.`;
        break;

      case "financial_model":
        systemPrompt = `You are a startup financial advisor. Create realistic financial projections and models for early-stage startups.`;
        userPrompt = `Create financial projections for:

Startup: ${project.startup_name}
Category: ${project.category}
Stage: ${project.stage}
Ask Amount: ${project.ask_amount}
Business Model: ${project.business_model}
Current Traction: Users: ${project.traction_users || "0"}, Revenue: ${project.traction_revenue || "$0"}, Growth: ${project.traction_growth || "N/A"}

Provide projections in this JSON format:
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
}

Return ONLY valid JSON.`;
        break;

      case "marketing_strategy":
        systemPrompt = `You are a growth marketing strategist for startups. Create actionable go-to-market strategies.`;
        userPrompt = `Create a marketing strategy for:

Startup: ${project.startup_name}
Category: ${project.category}
Target Users: ${project.target_users}
One-liner: ${project.one_liner}
Solution: ${project.solution_description}
Go-to-Market Notes: ${project.go_to_market || "Not specified"}
Business Model: ${project.business_model}

Provide strategy in this JSON format:
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
}

Return ONLY valid JSON.`;
        break;

      default:
        throw new Error(`Unknown advisor type: ${advisorType}`);
    }

    console.log(`Running ${advisorType} for ${project.startup_name}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Clean up markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse and validate JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON:", content);
      throw new Error("Invalid response format from AI");
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
