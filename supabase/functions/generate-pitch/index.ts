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
    const { project, assetType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert startup pitch coach and copywriter. Generate compelling, concise, and professional pitch content for early-stage startups. Use a ${project.pitch_tone || "professional"} tone. Be specific and avoid generic platitudes.`;

    let userPrompt = "";

    switch (assetType) {
      case "tagline":
        userPrompt = `Create a powerful one-line tagline (under 15 words) for this startup:
        
Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Category: ${project.category}

Return ONLY the tagline, nothing else.`;
        break;

      case "30sec":
        userPrompt = `Write a compelling 30-second elevator pitch (about 80-100 words) for:

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
        userPrompt = `Write a comprehensive 2-minute pitch (about 300-350 words) for:

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
        userPrompt = `Create a 6-slide pitch deck outline for:

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Target Users: ${project.target_users}
Traction: ${project.traction_users || "N/A"} users, ${project.traction_revenue || "N/A"} revenue
Business Model: ${project.business_model}
Ask: ${project.ask_amount}
Use of Funds: ${project.use_of_funds}

Format each slide as:
## Slide X: [Title]
- Bullet point 1
- Bullet point 2
- Bullet point 3

Cover: Title/Hook, Problem, Solution, Traction/Market, Business Model, Ask.`;
        break;

      case "cold_email":
        userPrompt = `Write a cold outreach email to an investor for:

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Problem: ${project.problem_statement}
Solution: ${project.solution_description}
Traction: ${project.traction_users || "Early"} users, ${project.traction_revenue || "Pre-revenue"}
Ask: ${project.ask_amount}
Category: ${project.category}
Stage: ${project.stage}

Keep it under 150 words. Be direct, show specific traction, and have a clear ask for a meeting. Include subject line. Format as:

Subject: [subject]

[email body]`;
        break;

      case "linkedin_intro":
        userPrompt = `Write a LinkedIn connection request message for reaching out to an investor:

Startup: ${project.startup_name}
One-liner: ${project.one_liner}
Category: ${project.category}
Traction: ${project.traction_users || "Early stage"}
Ask: ${project.ask_amount}

Keep it under 280 characters (LinkedIn limit). Be personal, mention why you're reaching out, and hint at your traction.`;
        break;

      default:
        throw new Error(`Unknown asset type: ${assetType}`);
    }

    console.log(`Generating ${assetType} for ${project.startup_name}`);

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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
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
