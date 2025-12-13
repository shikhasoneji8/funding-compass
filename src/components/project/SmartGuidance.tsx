import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Sparkles, DollarSign, PieChart, Target, TrendingUp } from "lucide-react";
import { AdvisorSkeleton } from "./AdvisorSkeleton";
import { generateAI, buildSmartGuidancePrompt } from "@/lib/aiClient";

interface Project {
  id: string;
  startup_name: string;
  one_liner: string;
  category: string;
  stage: string;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  ask_amount: string;
  business_model: string;
  traction_users: string | null;
  traction_revenue: string | null;
}

interface GuidanceData {
  recommended_ask: {
    amount: string;
    reasoning: string;
  };
  equity_guidance: {
    range: string;
    reasoning: string;
  };
  use_of_funds_breakdown: Array<{
    category: string;
    percentage: number;
    reasoning: string;
  }>;
  valuation_estimate: {
    range: string;
    method: string;
  };
  runway_recommendation: {
    months: number;
    reasoning: string;
  };
}

export function SmartGuidance({ project }: { project: Project }) {
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);

  const generateGuidance = async () => {
    setLoading(true);
    try {
      const messages = buildSmartGuidancePrompt(project as unknown as Record<string, unknown>);
      const response = await generateAI({ messages });
      
      if (response.json) {
        setGuidance(response.json as unknown as GuidanceData);
      } else if (response.text) {
        // Try to parse text as JSON
        const parsed = JSON.parse(response.text);
        setGuidance(parsed);
      } else {
        throw new Error("No guidance generated");
      }
      
      toast.success("Guidance generated!");
    } catch (error: unknown) {
      console.error("Error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate guidance";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !guidance) {
    return <AdvisorSkeleton type="smart_guidance" />;
  }

  if (!guidance) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">Smart Form Guidance</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get AI-powered recommendations for your ask amount, equity split, use of funds, and valuation based on your stage and industry.
        </p>
        <Button onClick={generateGuidance} disabled={loading} variant="coral">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate Guidance
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">Funding Guidance</h3>
        <Button variant="outline" size="sm" onClick={generateGuidance} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recommended Ask */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-coral" />
            <h4 className="font-medium text-foreground">Recommended Ask</h4>
          </div>
          <p className="text-2xl font-display text-foreground mb-2">{guidance.recommended_ask.amount}</p>
          <p className="text-sm text-muted-foreground">{guidance.recommended_ask.reasoning}</p>
        </div>

        {/* Equity Guidance */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Equity to Give</h4>
          </div>
          <p className="text-2xl font-display text-foreground mb-2">{guidance.equity_guidance.range}</p>
          <p className="text-sm text-muted-foreground">{guidance.equity_guidance.reasoning}</p>
        </div>

        {/* Valuation */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="font-medium text-foreground">Valuation Estimate</h4>
          </div>
          <p className="text-2xl font-display text-foreground mb-2">{guidance.valuation_estimate.range}</p>
          <p className="text-sm text-muted-foreground">{guidance.valuation_estimate.method}</p>
        </div>

        {/* Runway */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-amber-500" />
            <h4 className="font-medium text-foreground">Target Runway</h4>
          </div>
          <p className="text-2xl font-display text-foreground mb-2">{guidance.runway_recommendation.months} months</p>
          <p className="text-sm text-muted-foreground">{guidance.runway_recommendation.reasoning}</p>
        </div>
      </div>

      {/* Use of Funds */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Recommended Use of Funds</h4>
        <div className="space-y-3">
          {guidance.use_of_funds_breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-foreground">{item.category}</div>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-coral rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm font-medium text-foreground">{item.percentage}%</div>
              <div className="w-48 text-sm text-muted-foreground hidden lg:block">{item.reasoning}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
