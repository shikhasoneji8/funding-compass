import { DiscussionMessage } from '@/types/investorPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface DiscussionTranscriptProps {
  messages: DiscussionMessage[];
  defaultOpen?: boolean;
}

export function DiscussionTranscript({ messages, defaultOpen = false }: DiscussionTranscriptProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (messages.length === 0) return null;
  
  // Group messages by turn for better readability
  const groupedMessages = messages.reduce((acc, msg) => {
    const turnKey = `turn-${msg.turn}`;
    if (!acc[turnKey]) acc[turnKey] = [];
    acc[turnKey].push(msg);
    return acc;
  }, {} as Record<string, DiscussionMessage[]>);
  
  return (
    <Card className="border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Panel Discussion
                <span className="text-sm font-normal text-muted-foreground">
                  ({messages.length} exchanges)
                </span>
              </CardTitle>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {Object.entries(groupedMessages).map(([turnKey, turnMessages]) => (
                <div key={turnKey} className="space-y-3">
                  <div className="text-xs text-muted-foreground font-medium">
                    Round {parseInt(turnKey.split('-')[1])}
                  </div>
                  {turnMessages.map((msg, idx) => {
                    const initials = msg.personaName.split(' ')[0].charAt(0);
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {msg.personaName}
                            </span>
                            {msg.targetPersonaName && (
                              <>
                                <span className="text-xs text-muted-foreground">→</span>
                                <span className="text-sm text-primary">
                                  @{msg.targetPersonaName}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
