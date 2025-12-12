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
    const { project, promptType, userPitch } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert pitch coach who has helped hundreds of startups raise funding. 
Analyze the user's pitch attempt and provide constructive feedback.

IMPORTANT: Return your response as a valid JSON array of feedback items. Each item should have:
- category: string (e.g., "Clarity", "Hook", "Specificity", "Traction", "Ask")
- score: "good" | "needs_work" | "missing"
- feedback: string (1-2 sentences of specific, actionable advice)

Example format:
[
  {"category": "Hook", "score": "good", "feedback": "Strong opening that immediately captures attention."},
  {"category": "Specificity", "score": "needs_work", "feedback": "Add specific numbers to make your claims more credible."}
]`;

    const userPrompt = `Evaluate this ${promptType} pitch for a startup called "${project.startup_name}":

Company context:
- One-liner: ${project.one_liner}
- Problem: ${project.problem_statement}
- Solution: ${project.solution_description}
- Target users: ${project.target_users}
- Traction: ${project.traction_users || "Not specified"} users, ${project.traction_revenue || "Not specified"} revenue
- Ask: ${project.ask_amount}

User's pitch attempt:
"""
${userPitch}
"""

Provide 4-5 feedback items covering: Clarity, Hook/Opening, Specificity/Numbers, Traction Evidence, and The Ask.
Return ONLY the JSON array, no other text.`;

    console.log(`Getting feedback for ${promptType} pitch`);

    // Call Google Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid API key or quota exceeded." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No feedback generated");
    }

    // Parse the JSON response
    let feedback;
    try {
      // Clean the response in case it has markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      feedback = JSON.parse(cleanContent);
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
