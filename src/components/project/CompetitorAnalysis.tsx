import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Search, Shield, Swords, Target } from "lucide-react";
import { AdvisorSkeleton } from "./AdvisorSkeleton";
import { generateAI, buildCompetitorAnalysisPrompt } from "@/lib/aiClient";

interface Project {
  id: string;
  startup_name: string;
  one_liner: string;
  category: string;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  differentiation: string | null;
}

interface CompetitorData {
  direct_competitors: Array<{
    name: string;
    description: string;
    funding: string;
    strengths: string[];
    weaknesses: string[];
    your_advantage: string;
  }>;
  indirect_competitors: Array<{
    name: string;
    description: string;
    threat_level: string;
  }>;
  market_positioning: {
    your_niche: string;
    blue_ocean_opportunities: string[];
    key_differentiators: string[];
  };
  competitive_moat: {
    current_moat: string;
    moat_to_build: string;
  };
}

export function CompetitorAnalysis({ project }: { project: Project }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorData | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const messages = buildCompetitorAnalysisPrompt(project as unknown as Record<string, unknown>);
      const response = await generateAI({ messages });
      
      if (response.json) {
        setAnalysis(response.json as unknown as CompetitorData);
      } else if (response.text) {
        const parsed = JSON.parse(response.text);
        setAnalysis(parsed);
      } else {
        throw new Error("No analysis generated");
      }
      
      toast.success("Competitor analysis complete!");
    } catch (error: unknown) {
      console.error("Error:", error);
      const message = error instanceof Error ? error.message : "Failed to analyze competitors";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analysis) {
    return <AdvisorSkeleton type="competitor_analysis" />;
  }

  if (!analysis) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">Competitor Analysis</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get AI-powered analysis of your competitive landscape, including direct/indirect competitors and your positioning.
        </p>
        <Button onClick={generateAnalysis} disabled={loading} variant="coral">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
          Analyze Competitors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">Competitive Landscape</h3>
        <Button variant="outline" size="sm" onClick={generateAnalysis} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {/* Direct Competitors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-500" />
          <h4 className="font-medium text-foreground">Direct Competitors</h4>
        </div>
        <div className="grid gap-4">
          {analysis.direct_competitors.map((comp, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-foreground">{comp.name}</h5>
                  <p className="text-sm text-muted-foreground">{comp.description}</p>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                  {comp.funding}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-red-500 font-medium mb-1">Strengths</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {comp.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-green-500 font-medium mb-1">Weaknesses</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {comp.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-primary font-medium mb-1">Your Edge</p>
                  <p className="text-muted-foreground">{comp.your_advantage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indirect Competitors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" />
          <h4 className="font-medium text-foreground">Indirect Competitors</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {analysis.indirect_competitors.map((comp, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-foreground">{comp.name}</h5>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  comp.threat_level === "high" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  comp.threat_level === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  {comp.threat_level} threat
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Positioning */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Your Market Position</h4>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-primary mb-1">Your Niche</p>
            <p className="text-foreground">{analysis.market_positioning.your_niche}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-primary mb-2">Key Differentiators</p>
            <div className="flex flex-wrap gap-2">
              {analysis.market_positioning.key_differentiators.map((d, i) => (
                <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">{d}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-coral mb-2">Blue Ocean Opportunities</p>
            <ul className="space-y-1 text-muted-foreground">
              {analysis.market_positioning.blue_ocean_opportunities.map((o, i) => (
                <li key={i}>• {o}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Competitive Moat */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-green-500" />
            <h4 className="font-medium text-foreground">Current Moat</h4>
          </div>
          <p className="text-muted-foreground">{analysis.competitive_moat.current_moat}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Moat to Build</h4>
          </div>
          <p className="text-muted-foreground">{analysis.competitive_moat.moat_to_build}</p>
        </div>
      </div>
    </div>
  );
}
