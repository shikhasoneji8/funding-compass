import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageCircle } from 'lucide-react';

interface FollowUpQuestionProps {
  onAskQuestion: (question: string) => Promise<string>;
  disabled?: boolean;
}

export function FollowUpQuestion({ onAskQuestion, disabled }: FollowUpQuestionProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    
    setLoading(true);
    try {
      const answer = await onAskQuestion(question);
      setResponse(answer);
    } catch (error) {
      console.error('Failed to get follow-up response:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Ask a Follow-Up Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the panel a follow-up question..."
          rows={3}
          disabled={disabled || loading}
        />
        <Button 
          onClick={handleAsk} 
          disabled={!question.trim() || disabled || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Asking Panel...
            </>
          ) : (
            'Ask Panel'
          )}
        </Button>
        
        {response && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Panel Response:</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
