import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Mic, Play, CheckCircle, AlertCircle, Info } from "lucide-react";
import { getPitchFeedback } from "@/lib/aiClient";

interface Project {
  id: string;
  startup_name: string;
  one_liner: string;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  ask_amount: string;
  traction_users: string | null;
  traction_revenue: string | null;
}

interface FeedbackItem {
  category: string;
  score: "good" | "needs_work" | "missing";
  feedback: string;
}

const prompts = [
  {
    id: "30sec",
    title: "30-Second Elevator Pitch",
    description: "Imagine you have 30 seconds in an elevator with an investor. What do you say?",
    tips: [
      "Start with a hook that grabs attention",
      "Clearly state the problem you solve",
      "Briefly describe your solution",
      "End with your ask or next step",
    ],
  },
  {
    id: "problem",
    title: "Problem Statement",
    description: "Explain the problem you're solving. Why does it matter?",
    tips: [
      "Be specific about who has this problem",
      "Quantify the pain if possible",
      "Explain why existing solutions fall short",
    ],
  },
  {
    id: "traction",
    title: "Traction & Progress",
    description: "What have you built and achieved so far?",
    tips: [
      "Lead with your strongest metric",
      "Show growth over time",
      "Include qualitative wins (partnerships, press, etc.)",
    ],
  },
  {
    id: "ask",
    title: "The Ask",
    description: "What are you raising and how will you use it?",
    tips: [
      "Be specific about the amount",
      "Break down use of funds clearly",
      "Connect spending to milestones",
    ],
  },
];

export function PitchPractice({ project }: { project: Project }) {
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]);
  const [userPitch, setUserPitch] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const getFeedback = async () => {
    if (!userPitch.trim()) {
      toast.error("Please enter your pitch first");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await getPitchFeedback(
        project as unknown as Record<string, unknown>,
        selectedPrompt.id,
        userPitch
      );
      
      let parsedFeedback: FeedbackItem[];
      
      if (response.json) {
        const data = response.json as { feedback?: FeedbackItem[]; score?: number; strengths?: string[]; weaknesses?: string[]; rewrite_suggestion?: string };
        if (data.feedback) {
          parsedFeedback = data.feedback;
        } else {
          // Convert structured response to feedback format
          parsedFeedback = [
            { category: "Overall Score", score: (data.score ?? 0) >= 7 ? "good" : (data.score ?? 0) >= 4 ? "needs_work" : "missing", feedback: `Score: ${data.score}/10` },
            { category: "Strengths", score: "good", feedback: data.strengths?.join(". ") || "See detailed feedback" },
            { category: "Areas to Improve", score: "needs_work", feedback: data.weaknesses?.join(". ") || "See detailed feedback" },
            { category: "Suggested Rewrite", score: "good", feedback: data.rewrite_suggestion || "No rewrite provided" },
          ];
        }
      } else if (response.text) {
        const parsed = JSON.parse(response.text);
        parsedFeedback = parsed.feedback || [
          { category: "Overall Score", score: parsed.score >= 7 ? "good" : parsed.score >= 4 ? "needs_work" : "missing", feedback: `Score: ${parsed.score}/10` },
          { category: "Strengths", score: "good", feedback: parsed.strengths?.join(". ") || "See detailed feedback" },
          { category: "Areas to Improve", score: "needs_work", feedback: parsed.weaknesses?.join(". ") || "See detailed feedback" },
          { category: "Suggested Rewrite", score: "good", feedback: parsed.rewrite_suggestion || "No rewrite provided" },
        ];
      } else {
        throw new Error("No feedback generated");
      }
      
      setFeedback(parsedFeedback);
    } catch (error: unknown) {
      console.error("Error getting feedback:", error);
      const message = error instanceof Error ? error.message : "Failed to get feedback";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case "good":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "needs_work":
        return <AlertCircle className="w-5 h-5 text-accent" />;
      case "missing":
        return <Info className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Pitch Practice</h2>
        <p className="text-muted-foreground">
          Practice your pitch and get AI feedback on clarity and persuasiveness
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prompt Selection */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Choose a Prompt</h3>
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => {
                setSelectedPrompt(prompt);
                setFeedback(null);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedPrompt.id === prompt.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <h4 className="font-medium text-foreground">{prompt.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {prompt.description}
              </p>
            </button>
          ))}
        </div>

        {/* Practice Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg text-foreground">
                {selectedPrompt.title}
              </h3>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedPrompt.description}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedPrompt.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <Textarea
              value={userPitch}
              onChange={(e) => setUserPitch(e.target.value)}
              placeholder="Type your pitch here..."
              className="min-h-[200px] mb-4"
            />

            <Button
              onClick={getFeedback}
              disabled={loading || !userPitch.trim()}
              variant="coral"
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Get Feedback
                </>
              )}
            </Button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in-up">
              <h3 className="font-display text-lg text-foreground mb-4">
                Feedback
              </h3>
              <div className="space-y-4">
                {feedback.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
                  >
                    {getScoreIcon(item.score)}
                    <div>
                      <h4 className="font-medium text-foreground">
                        {item.category}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.feedback}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
