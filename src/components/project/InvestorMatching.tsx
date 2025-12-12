import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users, Star, Building2, Rocket, Plus } from "lucide-react";
import { AdvisorSkeleton } from "./AdvisorSkeleton";

interface Project {
  id: string;
  startup_name: string;
  one_liner: string;
  category: string;
  stage: string;
  ask_amount: string;
  business_model: string;
  traction_users: string | null;
  traction_revenue: string | null;
}

interface InvestorData {
  tier1_investors: Array<{
    name: string;
    firm: string;
    type: string;
    check_size: string;
    thesis_match: string;
    portfolio_examples: string[];
    approach_tip: string;
  }>;
  tier2_investors: Array<{
    name: string;
    firm: string;
    type: string;
    check_size: string;
    thesis_match: string;
  }>;
  accelerators: Array<{
    name: string;
    investment: string;
    why_apply: string;
    deadline_hint: string;
  }>;
  outreach_strategy: {
    warm_intro_sources: string[];
    cold_outreach_tips: string[];
    timing_advice: string;
  };
}

interface InvestorMatchingProps {
  project: Project;
  onAddInvestor?: (investor: { name: string; firm: string; check_size: string; thesis: string }) => void;
}

export function InvestorMatching({ project, onAddInvestor }: InvestorMatchingProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InvestorData | null>(null);

  const generateMatches = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("ai-advisor", {
        body: { project, advisorType: "investor_matching" },
      });

      if (error) throw error;
      setData(result.data);
      toast.success("Investor matches found!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to find investors");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCRM = (investor: { name: string; firm: string; check_size: string; thesis_match: string }) => {
    if (onAddInvestor) {
      onAddInvestor({
        name: investor.name,
        firm: investor.firm,
        check_size: investor.check_size,
        thesis: investor.thesis_match,
      });
      toast.success(`Added ${investor.name} to your CRM!`);
    }
  };

  if (loading && !data) {
    return <AdvisorSkeleton type="investor_matching" />;
  }

  if (!data) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">Investor Matching</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get AI-curated investor recommendations based on your category, stage, and ask amount.
        </p>
        <Button onClick={generateMatches} disabled={loading} variant="coral">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
          Find Investors
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">Recommended Investors</h3>
        <Button variant="outline" size="sm" onClick={generateMatches} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {/* Tier 1 Investors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <h4 className="font-medium text-foreground">Top Matches</h4>
        </div>
        <div className="grid gap-4">
          {data.tier1_investors.map((inv, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-foreground">{inv.name}</h5>
                  <p className="text-sm text-muted-foreground">{inv.firm}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{inv.type}</span>
                  <span className="text-xs bg-coral/10 text-coral px-2 py-1 rounded-full">{inv.check_size}</span>
                </div>
              </div>
              <p className="text-sm text-foreground mb-3">{inv.thesis_match}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {inv.portfolio_examples.map((p, i) => (
                  <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    Portfolio: {p}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground italic">💡 {inv.approach_tip}</p>
                {onAddInvestor && (
                  <Button variant="outline" size="sm" onClick={() => handleAddToCRM(inv)}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add to CRM
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier 2 Investors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Other Relevant Investors</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {data.tier2_investors.map((inv, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-medium text-foreground">{inv.name}</h5>
                  <p className="text-xs text-muted-foreground">{inv.firm}</p>
                </div>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">{inv.check_size}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{inv.thesis_match}</p>
              {onAddInvestor && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => handleAddToCRM({ ...inv, thesis_match: inv.thesis_match })}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add to CRM
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accelerators */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-coral" />
          <h4 className="font-medium text-foreground">Recommended Accelerators</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {data.accelerators.map((acc, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border p-4">
              <h5 className="font-medium text-foreground mb-1">{acc.name}</h5>
              <p className="text-xs text-coral mb-2">{acc.investment}</p>
              <p className="text-sm text-muted-foreground mb-2">{acc.why_apply}</p>
              <p className="text-xs text-muted-foreground">📅 {acc.deadline_hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach Strategy */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Outreach Strategy</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-primary mb-2">Warm Intro Sources</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {data.outreach_strategy.warm_intro_sources.map((s, i) => <li key={i}>• {s}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-coral mb-2">Cold Outreach Tips</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {data.outreach_strategy.cold_outreach_tips.map((t, i) => <li key={i}>• {t}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-foreground">⏰ <span className="text-muted-foreground">{data.outreach_strategy.timing_advice}</span></p>
        </div>
      </div>
    </div>
  );
}
