import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

GRADIENT_API_URL = "https://api.gradient.ai/v1/chat/completions"
MODEL = "openai-gpt-oss-120b"

FUNDINGNEMO_SYSTEM = """You are FundingNEMO, an expert startup fundraising advisor.
You help early-stage founders prepare investor-ready materials.
You are concise, practical, and opinionated.
You avoid hype, buzzwords, and unrealistic claims.
You provide outputs that are immediately usable by founders.
When appropriate, return structured JSON exactly as requested."""


def call_gradient_ai(messages, max_tokens=900):
    """Call Gradient AI API with the given messages."""
    api_key = os.environ.get("MODEL_ACCESS_KEY")
    
    if not api_key:
        raise ValueError("MODEL_ACCESS_KEY environment variable is not set")
    
    response = requests.post(
        GRADIENT_API_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL,
            "messages": messages,
            "max_tokens": max_tokens,
        },
        timeout=60
    )
    
    if response.status_code == 429:
        raise Exception("RATE_LIMIT")
    if response.status_code in [401, 402]:
        raise Exception("AUTH_ERROR")
    if not response.ok:
        raise Exception(f"Gradient AI error: {response.status_code}")
    
    data = response.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content")
    
    if not content:
        raise Exception("No content generated")
    
    return content


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


@app.route("/generate-pitch", methods=["POST", "OPTIONS"])
def generate_pitch():
    """Generate pitch assets (tagline, 30sec, 2min, deck_outline, cold_email, linkedin_intro)."""
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        data = request.get_json()
        project = data.get("project", {})
        asset_type = data.get("assetType", "")
        
        prompts = {
            "tagline": f"""Rewrite the following startup description into a crisp, investor-ready one-liner (under 15 words):

Startup: {project.get('startup_name', '')}
One-liner: {project.get('one_liner', '')}
Problem: {project.get('problem_statement', '')}
Solution: {project.get('solution_description', '')}
Category: {project.get('category', '')}

Return ONLY the tagline, nothing else.""",

            "30sec": f"""Generate a 30-second spoken pitch suitable for a first investor meeting (about 80-100 words):

Startup: {project.get('startup_name', '')}
One-liner: {project.get('one_liner', '')}
Problem: {project.get('problem_statement', '')}
Solution: {project.get('solution_description', '')}
Target Users: {project.get('target_users', '')}
Traction: {project.get('traction_users', 'Early stage')} users, {project.get('traction_revenue', 'Pre-revenue')}
Ask: {project.get('ask_amount', '')}

The pitch should hook attention, state the problem, present the solution, mention traction, and end with the ask. Return ONLY the pitch text.""",

            "2min": f"""Generate a structured 2-minute pitch with problem, solution, market, traction, and ask (about 300-350 words):

Startup: {project.get('startup_name', '')}
One-liner: {project.get('one_liner', '')}
Problem: {project.get('problem_statement', '')}
Solution: {project.get('solution_description', '')}
Target Users: {project.get('target_users', '')}
Why Now: {project.get('why_now', 'Market timing is right')}
Differentiation: {project.get('differentiation', 'Unique approach')}
Traction: Users: {project.get('traction_users', 'Early stage')}, Revenue: {project.get('traction_revenue', 'Pre-revenue')}, Growth: {project.get('traction_growth', 'Growing')}
Business Model: {project.get('business_model', '')}
Ask: {project.get('ask_amount', '')}
Use of Funds: {project.get('use_of_funds', '')}

Structure: Opening hook, problem deep-dive, solution explanation, market opportunity, traction proof, business model, team credibility (brief), and clear ask. Return ONLY the pitch text.""",

            "deck_outline": f"""Generate a 6-slide pitch deck outline. Return JSON:
[
  {{ "slide": 1, "title": "string", "bullets": ["string"] }}
]

Startup: {project.get('startup_name', '')}
One-liner: {project.get('one_liner', '')}
Problem: {project.get('problem_statement', '')}
Solution: {project.get('solution_description', '')}
Target Users: {project.get('target_users', '')}
Traction: {project.get('traction_users', 'N/A')} users, {project.get('traction_revenue', 'N/A')} revenue
Business Model: {project.get('business_model', '')}
Ask: {project.get('ask_amount', '')}
Use of Funds: {project.get('use_of_funds', '')}

Cover: Title/Hook, Problem, Solution, Traction/Market, Business Model, Ask. Return ONLY valid JSON.""",

            "cold_email": f"""Write a concise investor cold email (≤120 words). No hype. Professional tone.

Startup: {project.get('startup_name', '')}
One-liner: {project.get('one_liner', '')}
Problem: {project.get('problem_statement', '')}
Solution: {project.get('solution_description', '')}
Traction: {project.get('traction_users', 'Early')} users, {project.get('traction_revenue', 'Pre-revenue')}
Ask: {project.get('ask_amount', '')}
Category: {project.get('category', '')}
Stage: {project.get('stage', '')}

Include subject line. Format as:

Subject: [subject]

[email body]""",

            "linkedin_intro": f"""Write a short, polite LinkedIn intro request. Non-salesy. Keep under 280 characters (LinkedIn limit).

Startup: {project.get('startup_name', '')}
One-liner: {project.get('one_liner', '')}
Category: {project.get('category', '')}
Traction: {project.get('traction_users', 'Early stage')}
Ask: {project.get('ask_amount', '')}

Be personal, mention why you're reaching out, and hint at your traction."""
        }
        
        if asset_type not in prompts:
            return jsonify({"error": f"Unknown asset type: {asset_type}"}), 400
        
        messages = [
            {"role": "system", "content": FUNDINGNEMO_SYSTEM},
            {"role": "user", "content": prompts[asset_type]}
        ]
        
        content = call_gradient_ai(messages)
        return jsonify({"content": content})
        
    except Exception as e:
        error_msg = str(e)
        if error_msg == "RATE_LIMIT":
            return jsonify({"error": "Rate limits exceeded, please try again later."}), 429
        if error_msg == "AUTH_ERROR":
            return jsonify({"error": "AI service authentication error. Please check your API key."}), 401
        return jsonify({"error": error_msg}), 500


@app.route("/ai-advisor", methods=["POST", "OPTIONS"])
def ai_advisor():
    """AI advisor endpoints (smart_guidance, competitor_analysis, investor_matching, financial_model, marketing_strategy)."""
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        data = request.get_json()
        project = data.get("project", {})
        advisor_type = data.get("advisorType", "")
        
        prompts = {
            "smart_guidance": f"""Based on stage and market, suggest fundraising guidance for this startup:

Startup: {project.get('startup_name', '')}
Category: {project.get('category', '')}
Stage: {project.get('stage', '')}
One-liner: {project.get('one_liner', '')}
Problem: {project.get('problem_statement', '')}
Solution: {project.get('solution_description', '')}
Current Ask: {project.get('ask_amount', 'Not specified')}
Business Model: {project.get('business_model', '')}
Traction: Users: {project.get('traction_users', 'N/A')}, Revenue: {project.get('traction_revenue', 'N/A')}

Suggest:
- reasonable funding ask range
- equity dilution range
- valuation logic
- runway estimate

Return ONLY valid JSON in this format:
{{
  "recommended_ask": {{
    "amount": "specific dollar range",
    "reasoning": "why this range makes sense"
  }},
  "equity_guidance": {{
    "range": "percentage range to give up",
    "reasoning": "based on stage and traction"
  }},
  "use_of_funds_breakdown": [
    {{"category": "Engineering", "percentage": 40, "reasoning": "build core product"}},
    {{"category": "Sales & Marketing", "percentage": 30, "reasoning": "customer acquisition"}},
    {{"category": "Operations", "percentage": 20, "reasoning": "infrastructure"}},
    {{"category": "Buffer", "percentage": 10, "reasoning": "contingency"}}
  ],
  "valuation_estimate": {{
    "range": "valuation range",
    "method": "how calculated"
  }},
  "runway_recommendation": {{
    "months": 18,
    "reasoning": "why this timeline"
  }}
}}""",

            "competitor_analysis": f"""List direct and indirect competitors and explain differentiation for this startup:

Startup: {project.get('startup_name', '')}
Category: {project.get('category', '')}
One-liner: {project.get('one_liner', '')}
Problem: {project.get('problem_statement', '')}
Solution: {project.get('solution_description', '')}
Target Users: {project.get('target_users', '')}
Differentiation: {project.get('differentiation', 'Not specified')}

Return a comparison table as valid JSON:
{{
  "direct_competitors": [
    {{
      "name": "Competitor Name",
      "description": "What they do",
      "funding": "Funding stage/amount if known",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "your_advantage": "How you differentiate"
    }}
  ],
  "indirect_competitors": [
    {{
      "name": "Indirect Competitor",
      "description": "How they compete indirectly",
      "threat_level": "low/medium/high"
    }}
  ],
  "market_positioning": {{
    "your_niche": "Where you fit",
    "blue_ocean_opportunities": ["opportunity 1", "opportunity 2"],
    "key_differentiators": ["differentiator 1", "differentiator 2"]
  }},
  "competitive_moat": {{
    "current_moat": "What protects you now",
    "moat_to_build": "What to develop"
  }}
}}""",

            "investor_matching": f"""Suggest relevant investor types, sample firms, and accelerators based on this startup profile:

Startup: {project.get('startup_name', '')}
Category: {project.get('category', '')}
Stage: {project.get('stage', '')}
Ask Amount: {project.get('ask_amount', '')}
One-liner: {project.get('one_liner', '')}
Business Model: {project.get('business_model', '')}
Traction: Users: {project.get('traction_users', 'Early')}, Revenue: {project.get('traction_revenue', 'Pre-revenue')}

Explain why each is a fit. Return ONLY valid JSON:
{{
  "tier1_investors": [
    {{
      "name": "VC/Angel Name",
      "firm": "Firm name if applicable",
      "type": "VC/Angel/Accelerator",
      "check_size": "$X - $Y",
      "thesis_match": "Why they'd be interested",
      "portfolio_examples": ["Similar company 1", "Similar company 2"],
      "approach_tip": "How to reach out"
    }}
  ],
  "tier2_investors": [
    {{
      "name": "Investor Name",
      "firm": "Firm",
      "type": "VC/Angel",
      "check_size": "$X - $Y",
      "thesis_match": "Why relevant"
    }}
  ],
  "accelerators": [
    {{
      "name": "Accelerator Name",
      "investment": "Terms if known",
      "why_apply": "Why good fit",
      "deadline_hint": "Application timing"
    }}
  ],
  "outreach_strategy": {{
    "warm_intro_sources": ["Source 1", "Source 2"],
    "cold_outreach_tips": ["Tip 1", "Tip 2"],
    "timing_advice": "When to reach out"
  }}
}}""",

            "financial_model": f"""Create financial projections for this startup:

Startup: {project.get('startup_name', '')}
Category: {project.get('category', '')}
Stage: {project.get('stage', '')}
Ask Amount: {project.get('ask_amount', '')}
Business Model: {project.get('business_model', '')}
Current Traction: Users: {project.get('traction_users', '0')}, Revenue: {project.get('traction_revenue', '$0')}, Growth: {project.get('traction_growth', 'N/A')}

If information is missing, say so explicitly. Return ONLY valid JSON:
{{
  "funding_summary": {{
    "recommended_raise": "$X",
    "pre_money_valuation": "$X - $Y range",
    "dilution": "X% - Y%",
    "runway_months": 18
  }},
  "monthly_burn_projection": {{
    "current": "$X",
    "month_6": "$X",
    "month_12": "$X",
    "month_18": "$X"
  }},
  "revenue_projections": {{
    "year_1": {{ "revenue": "$X", "users": "X", "assumptions": "key assumption" }},
    "year_2": {{ "revenue": "$X", "users": "X", "assumptions": "key assumption" }},
    "year_3": {{ "revenue": "$X", "users": "X", "assumptions": "key assumption" }}
  }},
  "unit_economics": {{
    "cac_estimate": "$X",
    "ltv_estimate": "$X",
    "ltv_cac_ratio": "X:1",
    "payback_period": "X months"
  }},
  "use_of_funds": [
    {{ "category": "Product/Engineering", "amount": "$X", "percentage": 40 }},
    {{ "category": "Sales/Marketing", "amount": "$X", "percentage": 30 }},
    {{ "category": "Operations", "amount": "$X", "percentage": 20 }},
    {{ "category": "Buffer", "amount": "$X", "percentage": 10 }}
  ],
  "key_milestones": [
    {{ "month": 6, "milestone": "Milestone description", "metric": "Target metric" }},
    {{ "month": 12, "milestone": "Milestone description", "metric": "Target metric" }},
    {{ "month": 18, "milestone": "Milestone description", "metric": "Target metric" }}
  ],
  "risk_factors": ["Risk 1", "Risk 2", "Risk 3"]
}}""",

            "marketing_strategy": f"""Create a marketing strategy for this startup:

Startup: {project.get('startup_name', '')}
Category: {project.get('category', '')}
Target Users: {project.get('target_users', '')}
One-liner: {project.get('one_liner', '')}
Solution: {project.get('solution_description', '')}
Go-to-Market Notes: {project.get('go_to_market', 'Not specified')}
Business Model: {project.get('business_model', '')}

Return ONLY valid JSON:
{{
  "target_segments": [
    {{
      "segment": "Segment name",
      "description": "Who they are",
      "pain_points": ["pain 1", "pain 2"],
      "channels": ["channel 1", "channel 2"],
      "messaging": "Key message for this segment"
    }}
  ],
  "acquisition_channels": [
    {{
      "channel": "Channel name",
      "priority": "high/medium/low",
      "estimated_cac": "$X - $Y",
      "tactics": ["tactic 1", "tactic 2"],
      "timeline": "When to start"
    }}
  ],
  "content_strategy": {{
    "themes": ["theme 1", "theme 2"],
    "formats": ["format 1", "format 2"],
    "distribution": ["platform 1", "platform 2"]
  }},
  "launch_playbook": {{
    "pre_launch": ["action 1", "action 2"],
    "launch_week": ["action 1", "action 2"],
    "post_launch": ["action 1", "action 2"]
  }},
  "metrics_to_track": ["metric 1", "metric 2", "metric 3"],
  "budget_allocation": {{
    "paid": 30,
    "organic": 40,
    "partnerships": 20,
    "events": 10
  }}
}}"""
        }
        
        if advisor_type not in prompts:
            return jsonify({"error": f"Unknown advisor type: {advisor_type}"}), 400
        
        messages = [
            {"role": "system", "content": FUNDINGNEMO_SYSTEM},
            {"role": "user", "content": prompts[advisor_type]}
        ]
        
        content = call_gradient_ai(messages, max_tokens=1500)
        
        # Clean up markdown code blocks if present
        content = content.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()
        
        # Try to extract JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            content = json_match.group(0)
        
        # Parse JSON
        import json
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            # Return fallback
            fallbacks = {
                "smart_guidance": {"recommended_ask": {"amount": "Please try again", "reasoning": "Unable to generate"}},
                "competitor_analysis": {"direct_competitors": [], "indirect_competitors": []},
                "investor_matching": {"tier1_investors": [], "tier2_investors": [], "accelerators": []},
                "financial_model": {"funding_summary": {"recommended_raise": "TBD"}},
                "marketing_strategy": {"target_segments": [], "acquisition_channels": []}
            }
            parsed = fallbacks.get(advisor_type, {"error": "Unable to parse response"})
        
        return jsonify({"data": parsed})
        
    except Exception as e:
        error_msg = str(e)
        if error_msg == "RATE_LIMIT":
            return jsonify({"error": "Rate limits exceeded, please try again later."}), 429
        if error_msg == "AUTH_ERROR":
            return jsonify({"error": "AI service authentication error. Please check your API key."}), 401
        return jsonify({"error": error_msg}), 500


@app.route("/pitch-feedback", methods=["POST", "OPTIONS"])
def pitch_feedback():
    """Get AI feedback on user's pitch."""
    if request.method == "OPTIONS":
        return "", 204
    
    try:
        data = request.get_json()
        project = data.get("project", {})
        prompt_type = data.get("promptType", "")
        user_pitch = data.get("userPitch", "")
        
        user_prompt = f"""Score this pitch on clarity, credibility, and conciseness (1–10).

Company context:
- Name: {project.get('startup_name', '')}
- One-liner: {project.get('one_liner', '')}
- Problem: {project.get('problem_statement', '')}
- Solution: {project.get('solution_description', '')}
- Target users: {project.get('target_users', '')}
- Traction: {project.get('traction_users', 'Not specified')} users, {project.get('traction_revenue', 'Not specified')} revenue
- Ask: {project.get('ask_amount', '')}

Pitch type: {prompt_type}

User's pitch attempt:
\"\"\"
{user_pitch}
\"\"\"

Return ONLY valid JSON in this exact format:
{{
  "score": number,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "rewrite_suggestion": "improved version of the pitch",
  "feedback": [
    {{"category": "Clarity", "score": "good", "feedback": "1-2 sentences of specific advice"}},
    {{"category": "Hook", "score": "needs_work", "feedback": "1-2 sentences"}},
    {{"category": "Specificity", "score": "good", "feedback": "1-2 sentences"}},
    {{"category": "Traction", "score": "needs_work", "feedback": "1-2 sentences"}},
    {{"category": "Ask", "score": "missing", "feedback": "1-2 sentences"}}
  ]
}}"""

        messages = [
            {"role": "system", "content": FUNDINGNEMO_SYSTEM},
            {"role": "user", "content": user_prompt}
        ]
        
        content = call_gradient_ai(messages, max_tokens=1000)
        
        # Parse JSON
        import json
        try:
            clean_content = content.replace("```json\n", "").replace("```\n", "").replace("```", "").strip()
            parsed = json.loads(clean_content)
            
            if "feedback" in parsed:
                feedback = parsed["feedback"]
            else:
                feedback = [
                    {"category": "Overall Score", "score": "good" if parsed.get("score", 0) >= 7 else "needs_work", "feedback": f"Score: {parsed.get('score', 'N/A')}/10"},
                    {"category": "Strengths", "score": "good", "feedback": ". ".join(parsed.get("strengths", []))},
                    {"category": "Areas to Improve", "score": "needs_work", "feedback": ". ".join(parsed.get("weaknesses", []))},
                    {"category": "Suggested Rewrite", "score": "good", "feedback": parsed.get("rewrite_suggestion", "No rewrite provided")}
                ]
        except json.JSONDecodeError:
            feedback = [{"category": "Overall", "score": "needs_work", "feedback": "Unable to parse feedback. Please try again."}]
        
        return jsonify({"feedback": feedback})
        
    except Exception as e:
        error_msg = str(e)
        if error_msg == "RATE_LIMIT":
            return jsonify({"error": "Rate limits exceeded, please try again later."}), 429
        if error_msg == "AUTH_ERROR":
            return jsonify({"error": "AI service authentication error. Please check your API key."}), 401
        return jsonify({"error": error_msg}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
