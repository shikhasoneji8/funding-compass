import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, TrendingUp, DollarSign, Target, BarChart3, AlertTriangle } from "lucide-react";
import { AdvisorSkeleton } from "./AdvisorSkeleton";
import { generateAI, buildFinancialModelPrompt } from "@/lib/aiClient";

interface Project {
  id: string;
  startup_name: string;
  category: string;
  stage: string;
  ask_amount: string;
  business_model: string;
  traction_users: string | null;
  traction_revenue: string | null;
  traction_growth: string | null;
}

interface FinancialData {
  funding_summary: {
    recommended_raise: string;
    pre_money_valuation: string;
    dilution: string;
    runway_months: number;
  };
  monthly_burn_projection: {
    current: string;
    month_6: string;
    month_12: string;
    month_18: string;
  };
  revenue_projections: {
    year_1: { revenue: string; users: string; assumptions: string };
    year_2: { revenue: string; users: string; assumptions: string };
    year_3: { revenue: string; users: string; assumptions: string };
  };
  unit_economics: {
    cac_estimate: string;
    ltv_estimate: string;
    ltv_cac_ratio: string;
    payback_period: string;
  };
  use_of_funds: Array<{
    category: string;
    amount: string;
    percentage: number;
  }>;
  key_milestones: Array<{
    month: number;
    milestone: string;
    metric: string;
  }>;
  risk_factors: string[];
}

export function FinancialModel({ project }: { project: Project }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FinancialData | null>(null);

  const generateModel = async () => {
    setLoading(true);
    try {
      const messages = buildFinancialModelPrompt(project as unknown as Record<string, unknown>);
      const response = await generateAI({ messages });
      
      if (response.json) {
        setData(response.json as unknown as FinancialData);
      } else if (response.text) {
        const parsed = JSON.parse(response.text);
        setData(parsed);
      } else {
        throw new Error("No financial model generated");
      }
      
      toast.success("Financial model generated!");
    } catch (error: unknown) {
      console.error("Error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate financial model";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return <AdvisorSkeleton type="financial_model" />;
  }

  if (!data) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">Financial Modeling</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get AI-generated financial projections, burn rate estimates, and key milestones for your raise.
        </p>
        <Button onClick={generateModel} disabled={loading} variant="coral">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
          Generate Model
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">Financial Projections</h3>
        <Button variant="outline" size="sm" onClick={generateModel} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {/* Funding Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <DollarSign className="w-6 h-6 text-coral mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Recommended Raise</p>
          <p className="text-xl font-display text-foreground">{data.funding_summary.recommended_raise}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Pre-Money Valuation</p>
          <p className="text-xl font-display text-foreground">{data.funding_summary.pre_money_valuation}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Target className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Dilution</p>
          <p className="text-xl font-display text-foreground">{data.funding_summary.dilution}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <BarChart3 className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Runway</p>
          <p className="text-xl font-display text-foreground">{data.funding_summary.runway_months} months</p>
        </div>
      </div>

      {/* Burn Projection */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Monthly Burn Projection</h4>
        <div className="flex items-end justify-between gap-4">
          {Object.entries(data.monthly_burn_projection).map(([key, value], idx) => (
            <div key={key} className="flex-1 text-center">
              <div 
                className="bg-gradient-to-t from-primary to-coral rounded-lg mx-auto mb-2"
                style={{ 
                  height: `${60 + idx * 20}px`,
                  width: '100%',
                  maxWidth: '60px'
                }}
              />
              <p className="text-lg font-display text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Revenue Projections</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(data.revenue_projections).map(([year, proj]) => (
            <div key={year} className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium text-primary mb-2 capitalize">{year.replace('_', ' ')}</p>
              <p className="text-2xl font-display text-foreground mb-1">{proj.revenue}</p>
              <p className="text-sm text-muted-foreground">{proj.users} users</p>
              <p className="text-xs text-muted-foreground mt-2 italic">{proj.assumptions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Economics */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Unit Economics</h4>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">CAC</p>
            <p className="text-xl font-display text-foreground">{data.unit_economics.cac_estimate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">LTV</p>
            <p className="text-xl font-display text-foreground">{data.unit_economics.ltv_estimate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">LTV:CAC</p>
            <p className="text-xl font-display text-foreground">{data.unit_economics.ltv_cac_ratio}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payback</p>
            <p className="text-xl font-display text-foreground">{data.unit_economics.payback_period}</p>
          </div>
        </div>
      </div>

      {/* Use of Funds */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Use of Funds</h4>
        <div className="space-y-3">
          {data.use_of_funds.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-foreground">{item.category}</div>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-coral rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm text-muted-foreground">{item.percentage}%</div>
              <div className="w-20 text-right text-sm font-medium text-foreground">{item.amount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Milestones */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="font-medium text-foreground mb-4">Key Milestones</h4>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-coral" />
          <div className="space-y-4">
            {data.key_milestones.map((m, idx) => (
              <div key={idx} className="flex items-start gap-4 pl-10 relative">
                <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Month {m.month}</span>
                    <span className="text-sm font-medium text-foreground">{m.milestone}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h4 className="font-medium text-foreground">Risk Factors</h4>
        </div>
        <ul className="space-y-2">
          {data.risk_factors.map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-amber-500">•</span>
              {risk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
