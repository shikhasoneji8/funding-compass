import { PanelResult } from '@/types/investorPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Users, 
  Lightbulb,
  Calendar,
  AlertCircle,
  ThumbsUp,
  Download
} from 'lucide-react';

interface FinalReportProps {
  report: PanelResult;
  onExportMarkdown: () => void;
  onExportPDF: () => void;
}

export function FinalReport({ report, onExportMarkdown, onExportPDF }: FinalReportProps) {
  const confidenceColor = report.confidencePercent >= 70 
    ? 'text-green-500' 
    : report.confidencePercent >= 50 
    ? 'text-yellow-500' 
    : 'text-destructive';

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-foreground">Final Panel Report</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportMarkdown}>
            <Download className="w-4 h-4 mr-1" />
            Markdown
          </Button>
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Final Recommendation */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-primary" />
            Final Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground mb-4">{report.finalRecommendation}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <span className={`text-2xl font-bold ${confidenceColor}`}>
              {report.confidencePercent}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Consensus Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Consensus Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{report.consensusSummary}</p>
        </CardContent>
      </Card>

      {/* Key Disagreements */}
      {report.keyDisagreements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Key Disagreements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.keyDisagreements.map((disagreement, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground mb-2">{disagreement.topic}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-background rounded border border-border">
                    <p className="text-sm font-medium text-primary mb-1">{disagreement.personaA}</p>
                    <p className="text-sm text-muted-foreground">{disagreement.personaAPosition}</p>
                  </div>
                  <div className="p-3 bg-background rounded border border-border">
                    <p className="text-sm font-medium text-primary mb-1">{disagreement.personaB}</p>
                    <p className="text-sm text-muted-foreground">{disagreement.personaBPosition}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Funding Fit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Funding Fit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{report.fundingFit}</p>
        </CardContent>
      </Card>

      {/* Ideal Investor Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Ideal Investor Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{report.idealInvestorProfile}</p>
        </CardContent>
      </Card>

      {/* Pitch Fixes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Pitch Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.pitchFixes.map((fix, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-medium">{i + 1}.</span>
                <span className="text-muted-foreground">{fix}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 90-Day Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            90-Day Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.actionPlan.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Badge variant="outline" className="shrink-0">{item.week}</Badge>
                <p className="text-sm text-muted-foreground">{item.milestone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      {report.redFlags.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
