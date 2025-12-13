import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRADIENT_API_URL = "https://api.gradient.ai/v1/chat/completions";
const MODEL = "openai-gpt-oss-120b";

const FUNDINGNEMO_SYSTEM = `You are FundingNEMO, an expert startup fundraising advisor.
You help early-stage founders prepare investor-ready materials.
You are concise, practical, and opinionated.
You avoid hype, buzzwords, and unrealistic claims.
You provide outputs that are immediately usable by founders.
When appropriate, return structured JSON exactly as requested.`;

async function callGradientAI(messages: { role: string; content: string }[]): Promise<string> {
  const MODEL_ACCESS_KEY = Deno.env.get("MODEL_ACCESS_KEY");

  if (!MODEL_ACCESS_KEY) {
    throw new Error("MODEL_ACCESS_KEY is not configured");
  }

  const response = await fetch(GRADIENT_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MODEL_ACCESS_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gradient AI error:", response.status, errorText);

    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    if (response.status === 402 || response.status === 401) {
      throw new Error("AUTH_ERROR");
    }

    throw new Error(`Gradient AI error: ${response.status}`);
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
    const { project, promptType, userPitch } = await req.json();

    const userPrompt = `Score this pitch on clarity, credibility, and conciseness (1–10).

Company context:
- Name: ${project.startup_name}
- One-liner: ${project.one_liner}
- Problem: ${project.problem_statement}
- Solution: ${project.solution_description}
- Target users: ${project.target_users}
- Traction: ${project.traction_users || "Not specified"} users, ${project.traction_revenue || "Not specified"} revenue
- Ask: ${project.ask_amount}

Pitch type: ${promptType}

User's pitch attempt:
"""
${userPitch}
"""

Return ONLY valid JSON in this exact format:
{
  "score": number,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "rewrite_suggestion": "improved version of the pitch"
}

Also include a breakdown array for detailed feedback:
{
  "score": number,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "rewrite_suggestion": "improved version of the pitch",
  "feedback": [
    {"category": "Clarity", "score": "good" | "needs_work" | "missing", "feedback": "1-2 sentences of specific advice"},
    {"category": "Hook", "score": "good" | "needs_work" | "missing", "feedback": "1-2 sentences"},
    {"category": "Specificity", "score": "good" | "needs_work" | "missing", "feedback": "1-2 sentences"},
    {"category": "Traction", "score": "good" | "needs_work" | "missing", "feedback": "1-2 sentences"},
    {"category": "Ask", "score": "good" | "needs_work" | "missing", "feedback": "1-2 sentences"}
  ]
}`;

    console.log(`Getting feedback for ${promptType} pitch`);

    const messages = [
      { role: "system", content: FUNDINGNEMO_SYSTEM },
      { role: "user", content: userPrompt },
    ];

    let content: string;
    try {
      content = await callGradientAI(messages);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "RATE_LIMIT") {
          return new Response(
            JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (error.message === "AUTH_ERROR") {
          return new Response(
            JSON.stringify({ error: "AI service authentication error. Please check your API key." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      throw error;
    }

    // Parse the JSON response
    let feedback;
    try {
      // Clean the response in case it has markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      
      // Extract the feedback array, or create one from the response
      if (parsed.feedback) {
        feedback = parsed.feedback;
      } else {
        // Convert the structured response to the expected feedback format
        feedback = [
          { category: "Overall Score", score: parsed.score >= 7 ? "good" : parsed.score >= 4 ? "needs_work" : "missing", feedback: `Score: ${parsed.score}/10` },
          { category: "Strengths", score: "good", feedback: parsed.strengths?.join(". ") || "See detailed feedback" },
          { category: "Areas to Improve", score: "needs_work", feedback: parsed.weaknesses?.join(". ") || "See detailed feedback" },
          { category: "Suggested Rewrite", score: "good", feedback: parsed.rewrite_suggestion || "No rewrite provided" },
        ];
      }
    } catch (parseError) {
      console.error("Failed to parse feedback JSON:", content);
      // Fallback feedback
      feedback = [
        { category: "Overall", score: "needs_work", feedback: "Unable to parse detailed feedback. Please try again." },
      ];
    }

    console.log("Generated feedback successfully");

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in pitch-feedback:", error);
    const message = error instanceof Error ? error.message : "Failed to generate feedback";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
