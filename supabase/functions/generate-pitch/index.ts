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
      max_tokens: 1024,
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
    const { project, assetType } = await req.json();

    let userPrompt = "";

    switch (assetType) {
      case "tagline":
        userPrompt = `Rewrite the following startup description into a crisp, investor-ready one-liner (under 15 words):

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Category: ${project.category}

Return ONLY the tagline, nothing else.`;
        break;

      case "30sec":
        userPrompt = `Generate a 30-second spoken pitch suitable for a first investor meeting (about 80-100 words):

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Traction: ${project.traction_users || "Early stage"} users, ${project.traction_revenue || "Pre-revenue"}
Ask: ${project.ask_amount}

The pitch should hook attention, state the problem, present the solution, mention traction, and end with the ask. Return ONLY the pitch text.`;
        break;

      case "2min":
        userPrompt = `Generate a structured 2-minute pitch with problem, solution, market, traction, and ask (about 300-350 words):

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Why Now: ${project.why_now || "Market timing is right"}
Differentiation: ${project.differentiation || "Unique approach"}
Traction: Users: ${project.traction_users || "Early stage"}, Revenue: ${project.traction_revenue || "Pre-revenue"}, Growth: ${project.traction_growth || "Growing"}
Business Model: ${project.business_model}
Ask: ${project.ask_amount}
Use of Funds: ${project.use_of_funds}

Structure: Opening hook, problem deep-dive, solution explanation, market opportunity, traction proof, business model, team credibility (brief), and clear ask. Return ONLY the pitch text.`;
        break;

      case "deck_outline":
        userPrompt = `Generate a 6-slide pitch deck outline. Return JSON:
[
  { "slide": 1, "title": "string", "bullets": ["string"] }
]

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Traction: ${project.traction_users || "N/A"} users, ${project.traction_revenue || "N/A"} revenue
Business Model: ${project.business_model}
Ask: ${project.ask_amount}
Use of Funds: ${project.use_of_funds}

Cover: Title/Hook, Problem, Solution, Traction/Market, Business Model, Ask. Return ONLY valid JSON.`;
        break;

      case "cold_email":
        userPrompt = `Write a concise investor cold email (≤120 words). No hype. Professional tone.

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Traction: ${project.traction_users || "Early"} users, ${project.traction_revenue || "Pre-revenue"}
Ask: ${project.ask_amount}
Category: ${project.category}
Stage: ${project.stage}

Include subject line. Format as:

Subject: [subject]

[email body]`;
        break;

      case "linkedin_intro":
        userPrompt = `Write a short, polite LinkedIn intro request. Non-salesy. Keep under 280 characters (LinkedIn limit).

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Category: ${project.category}
Traction: ${project.traction_users || "Early stage"}
Ask: ${project.ask_amount}

Be personal, mention why you're reaching out, and hint at your traction.`;
        break;

      default:
        throw new Error(`Unknown asset type: ${assetType}`);
    }

    console.log(`Generating ${assetType} for ${project.startup_name}`);

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

    console.log(`Generated ${assetType} successfully`);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-pitch:", error);
    const message = error instanceof Error ? error.message : "Failed to generate pitch content";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
