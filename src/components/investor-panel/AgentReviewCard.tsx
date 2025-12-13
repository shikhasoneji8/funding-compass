import { AgentReview, ScoreCard } from '@/types/investorPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface AgentReviewCardProps {
  review: AgentReview;
  defaultOpen?: boolean;
}

const VerdictIcon = ({ verdict }: { verdict: AgentReview['verdict'] }) => {
  switch (verdict) {
    case 'Invest':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'Pass':
      return <XCircle className="w-5 h-5 text-destructive" />;
    case 'Maybe':
      return <HelpCircle className="w-5 h-5 text-yellow-500" />;
  }
};

const ScoreBar = ({ label, score }: { label: string; score: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground w-24 truncate">{label}</span>
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all ${
          score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-destructive'
        }`}
        style={{ width: `${score * 10}%` }}
      />
    </div>
    <span className="text-xs font-medium w-6 text-right">{score}</span>
  </div>
);

export function AgentReviewCard({ review, defaultOpen = false }: AgentReviewCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const initials = review.personaName.split(' ')[0].charAt(0);
  
  const verdictColor = {
    'Invest': 'bg-green-500/10 text-green-600 border-green-500/30',
    'Pass': 'bg-destructive/10 text-destructive border-destructive/30',
    'Maybe': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
  };
  
  return (
    <Card className="border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {initials}
                </div>
                <div className="text-left">
                  <CardTitle className="text-base">{review.personaName}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${verdictColor[review.verdict]} border`}>
                  <VerdictIcon verdict={review.verdict} />
                  <span className="ml-1">{review.verdict}</span>
                </Badge>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Top Strengths
              </h4>
              <ul className="space-y-1">
                {review.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-green-500">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Risks */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4 text-destructive" />
                Top Risks
              </h4>
              <ul className="space-y-1">
                {review.risks.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-destructive">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Due Diligence Questions */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Due Diligence Questions</h4>
              <ol className="space-y-1 list-decimal list-inside">
                {review.dueDiligenceQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {q}
                  </li>
                ))}
              </ol>
            </div>
            
            {/* Suggested Milestone */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-foreground mb-1">Suggested Next Milestone</h4>
              <p className="text-sm text-muted-foreground">{review.suggestedMilestone}</p>
            </div>
            
            {/* Scorecard */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Scorecard</h4>
              <div className="grid gap-2">
                <ScoreBar label="Team" score={review.scoreCard.team} />
                <ScoreBar label="Market" score={review.scoreCard.market} />
                <ScoreBar label="Product" score={review.scoreCard.product} />
                <ScoreBar label="Moat" score={review.scoreCard.moat} />
                <ScoreBar label="Traction" score={review.scoreCard.traction} />
                <ScoreBar label="GTM" score={review.scoreCard.gtm} />
                <ScoreBar label="Pricing" score={review.scoreCard.pricing} />
                <ScoreBar label="Defensibility" score={review.scoreCard.defensibility} />
                <ScoreBar label="Narrative" score={review.scoreCard.narrativeClarity} />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
