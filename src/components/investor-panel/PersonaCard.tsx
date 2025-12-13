import { InvestorPersona } from '@/types/investorPanel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface PersonaCardProps {
  persona: InvestorPersona;
  onToggle: (id: string, enabled: boolean) => void;
  showDetails?: boolean;
}

export function PersonaCard({ persona, onToggle, showDetails = false }: PersonaCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const initials = persona.displayName.charAt(0);
  
  return (
    <Card className={`transition-all ${persona.enabled ? 'border-primary/50 bg-card' : 'border-border/50 bg-muted/30 opacity-70'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              persona.enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{persona.displayName}</h3>
              <p className="text-sm text-muted-foreground">{persona.roleTitle}</p>
            </div>
          </div>
          <Switch
            checked={persona.enabled}
            onCheckedChange={(checked) => onToggle(persona.id, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">{persona.bio}</p>
        
        {showDetails && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              {isOpen ? 'Hide details' : 'Show details'}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Investment Thesis</p>
                <div className="flex flex-wrap gap-1">
                  {persona.investmentThesis.slice(0, 2).map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {item.length > 40 ? item.slice(0, 40) + '...' : item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Red Flags</p>
                <div className="flex flex-wrap gap-1">
                  {persona.redFlags.slice(0, 2).map((item, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {item.length > 40 ? item.slice(0, 40) + '...' : item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground italic">
                  "{persona.voiceStyle}"
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
