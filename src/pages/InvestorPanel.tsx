import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Loader2, 
  ArrowLeft, 
  LogOut, 
  Users, 
  Play,
  Settings2
} from 'lucide-react';
import { 
  StartupProfile, 
  PanelSettings, 
  InvestorPersona,
  InvestorPanelResponse,
  AgentReview,
  DiscussionMessage,
  PanelResult
} from '@/types/investorPanel';
import { investorPersonas } from '@/data/investorPersonas';
import { StartupInputForm } from '@/components/investor-panel/StartupInputForm';
import { PersonaCard } from '@/components/investor-panel/PersonaCard';
import { AgentReviewCard } from '@/components/investor-panel/AgentReviewCard';
import { DiscussionTranscript } from '@/components/investor-panel/DiscussionTranscript';
import { FinalReport } from '@/components/investor-panel/FinalReport';
import { FollowUpQuestion } from '@/components/investor-panel/FollowUpQuestion';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jsPDF } from 'jspdf';

const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || '';

const emptyProfile: StartupProfile = {
  startupName: '',
  oneLiner: '',
  problem: '',
  solution: '',
  targetCustomer: '',
  businessModel: '',
  traction: '',
  team: '',
  moat: '',
  competitors: '',
  fundraisingGoal: '',
  extraNotes: ''
};

const defaultSettings: PanelSettings = {
  agentCount: 5,
  mode: 'fast',
  riskTolerance: 'balanced'
};

export default function InvestorPanel() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<StartupProfile>(emptyProfile);
  const [settings, setSettings] = useState<PanelSettings>(defaultSettings);
  const [personas, setPersonas] = useState<InvestorPersona[]>(investorPersonas);
  
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'review' | 'discussion' | 'final' | 'complete'>('idle');
  
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [discussion, setDiscussion] = useState<DiscussionMessage[]>([]);
  const [finalReport, setFinalReport] = useState<PanelResult | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const togglePersona = (id: string, enabled: boolean) => {
    setPersonas(prev => prev.map(p => 
      p.id === id ? { ...p, enabled } : p
    ));
  };

  const enabledPersonas = personas.filter(p => p.enabled).slice(0, settings.agentCount);

  const validateProfile = (): boolean => {
    if (!profile.startupName.trim()) {
      toast.error('Please enter a startup name');
      return false;
    }
    if (!profile.oneLiner.trim()) {
      toast.error('Please enter a one-liner');
      return false;
    }
    if (!profile.problem.trim()) {
      toast.error('Please describe the problem');
      return false;
    }
    if (!profile.solution.trim()) {
      toast.error('Please describe the solution');
      return false;
    }
    if (!profile.targetCustomer.trim()) {
      toast.error('Please describe your target customer');
      return false;
    }
    if (!profile.businessModel.trim()) {
      toast.error('Please describe your business model');
      return false;
    }
    return true;
  };

  const runPanel = async () => {
    if (!validateProfile()) return;
    if (enabledPersonas.length < 3) {
      toast.error('Please enable at least 3 investor personas');
      return;
    }

    setLoading(true);
    setPhase('review');
    setReviews([]);
    setDiscussion([]);
    setFinalReport(null);

    try {
      const response = await fetch(`${FLASK_API_URL}/investor-panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          settings,
          personas: enabledPersonas.map(p => ({
            id: p.id,
            displayName: p.displayName,
            roleTitle: p.roleTitle,
            systemPrompt: p.systemPrompt,
            voiceStyle: p.voiceStyle
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run investor panel');
      }

      const data: InvestorPanelResponse = await response.json();
      
      // Simulate phased reveal for better UX
      setReviews(data.reviews);
      setPhase('discussion');
      
      await new Promise(r => setTimeout(r, 500));
      setDiscussion(data.discussion);
      setPhase('final');
      
      await new Promise(r => setTimeout(r, 500));
      setFinalReport(data.finalReport);
      setPhase('complete');
      
      toast.success('Panel complete! View your results below.');
    } catch (error) {
      console.error('Panel error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to run investor panel');
      setPhase('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async (question: string): Promise<string> => {
    const response = await fetch(`${FLASK_API_URL}/investor-panel-followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        profile,
        personas: enabledPersonas.map(p => ({
          id: p.id,
          displayName: p.displayName,
          systemPrompt: p.systemPrompt
        }))
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get follow-up response');
    }

    const data = await response.json();
    return data.response;
  };

  const exportMarkdown = () => {
    if (!finalReport) return;
    
    let md = `# Investor Panel Report: ${profile.startupName}\n\n`;
    md += `## Final Recommendation\n${finalReport.finalRecommendation}\n\n`;
    md += `**Confidence:** ${finalReport.confidencePercent}%\n\n`;
    md += `## Consensus Summary\n${finalReport.consensusSummary}\n\n`;
    
    if (finalReport.keyDisagreements.length > 0) {
      md += `## Key Disagreements\n`;
      finalReport.keyDisagreements.forEach(d => {
        md += `### ${d.topic}\n`;
        md += `- **${d.personaA}:** ${d.personaAPosition}\n`;
        md += `- **${d.personaB}:** ${d.personaBPosition}\n\n`;
      });
    }
    
    md += `## Funding Fit\n${finalReport.fundingFit}\n\n`;
    md += `## Ideal Investor Profile\n${finalReport.idealInvestorProfile}\n\n`;
    md += `## Pitch Fixes\n`;
    finalReport.pitchFixes.forEach((fix, i) => {
      md += `${i + 1}. ${fix}\n`;
    });
    md += `\n## 90-Day Action Plan\n`;
    finalReport.actionPlan.forEach(item => {
      md += `- **${item.week}:** ${item.milestone}\n`;
    });
    
    if (finalReport.redFlags.length > 0) {
      md += `\n## Red Flags\n`;
      finalReport.redFlags.forEach(flag => {
        md += `- ⚠️ ${flag}\n`;
      });
    }
    
    // Individual reviews
    md += `\n---\n\n## Individual Reviews\n`;
    reviews.forEach(review => {
      md += `\n### ${review.personaName} - ${review.verdict}\n`;
      md += `**Strengths:** ${review.strengths.join(', ')}\n`;
      md += `**Risks:** ${review.risks.join(', ')}\n`;
      md += `**Suggested Milestone:** ${review.suggestedMilestone}\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investor-panel-${profile.startupName.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!finalReport) return;
    
    const pdf = new jsPDF();
    let y = 20;
    const lineHeight = 7;
    const margin = 20;
    const maxWidth = 170;
    
    const addText = (text: string, fontSize = 12, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      });
    };
    
    const addSection = (title: string, content: string) => {
      y += 5;
      addText(title, 14, true);
      y += 2;
      addText(content, 11);
    };
    
    addText(`Investor Panel Report: ${profile.startupName}`, 18, true);
    y += 10;
    
    addSection('Final Recommendation', finalReport.finalRecommendation);
    addText(`Confidence: ${finalReport.confidencePercent}%`, 12, true);
    y += 5;
    
    addSection('Consensus Summary', finalReport.consensusSummary);
    addSection('Funding Fit', finalReport.fundingFit);
    addSection('Ideal Investor Profile', finalReport.idealInvestorProfile);
    
    y += 5;
    addText('Pitch Fixes', 14, true);
    finalReport.pitchFixes.forEach((fix, i) => {
      addText(`${i + 1}. ${fix}`, 11);
    });
    
    y += 5;
    addText('90-Day Action Plan', 14, true);
    finalReport.actionPlan.forEach(item => {
      addText(`${item.week}: ${item.milestone}`, 11);
    });
    
    if (finalReport.redFlags.length > 0) {
      y += 5;
      addText('Red Flags', 14, true);
      finalReport.redFlags.forEach(flag => {
        addText(`• ${flag}`, 11);
      });
    }
    
    pdf.save(`investor-panel-${profile.startupName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Investor Panel</h1>
            <p className="text-muted-foreground">
              Get feedback from a simulated panel of investor personas
            </p>
          </div>
        </div>

        <Tabs defaultValue="input" className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl">
            <TabsTrigger
              value="input"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              Startup Input
            </TabsTrigger>
            <TabsTrigger
              value="personas"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              Panel ({enabledPersonas.length})
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              disabled={phase === 'idle'}
            >
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <StartupInputForm
              profile={profile}
              settings={settings}
              onProfileChange={setProfile}
              onSettingsChange={setSettings}
            />
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {enabledPersonas.length} investors will review your startup
              </p>
              <Button 
                size="lg" 
                onClick={runPanel} 
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {phase === 'review' && 'Reviewing...'}
                    {phase === 'discussion' && 'Discussing...'}
                    {phase === 'final' && 'Finalizing...'}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Investor Panel
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="personas" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Toggle investors on/off. First {settings.agentCount} enabled will participate.
              </p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="w-4 h-4" />
                    Advanced
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Customize Personas</SheetTitle>
                    <SheetDescription>
                      Edit persona details to customize their evaluation style
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {personas.map((persona) => (
                      <PersonaCard 
                        key={persona.id}
                        persona={persona}
                        onToggle={togglePersona}
                        showDetails
                      />
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <PersonaCard 
                  key={persona.id}
                  persona={persona}
                  onToggle={togglePersona}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {phase === 'idle' ? (
              <div className="text-center py-12 text-muted-foreground">
                Run the panel to see results
              </div>
            ) : (
              <>
                {/* Individual Reviews */}
                {reviews.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-display text-foreground">Individual Reviews</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {reviews.map((review) => (
                        <AgentReviewCard key={review.personaId} review={review} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Discussion */}
                {discussion.length > 0 && (
                  <DiscussionTranscript messages={discussion} />
                )}
                
                {/* Final Report */}
                {finalReport && (
                  <FinalReport 
                    report={finalReport}
                    onExportMarkdown={exportMarkdown}
                    onExportPDF={exportPDF}
                  />
                )}
                
                {/* Follow-up Question */}
                {phase === 'complete' && (
                  <FollowUpQuestion onAskQuestion={handleFollowUp} />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
