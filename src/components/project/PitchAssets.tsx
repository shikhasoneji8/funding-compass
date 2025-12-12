import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Download, Loader2, RefreshCw, Check, Sparkles } from "lucide-react";

interface Project {
  id: string;
  startup_name: string;
  one_liner: string;
  category: string;
  stage: string;
  traction_users: string | null;
  traction_revenue: string | null;
  traction_growth: string | null;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  why_now: string | null;
  differentiation: string | null;
  ask_amount: string;
  use_of_funds: string;
  business_model: string;
  pitch_tone: string | null;
}

interface PitchAsset {
  id: string;
  asset_type: string;
  content: string;
}

const assetTypes = [
  { type: "tagline", label: "One-Line Tagline", icon: "✨" },
  { type: "30sec", label: "30-Second Pitch", icon: "⏱️" },
  { type: "2min", label: "2-Minute Pitch", icon: "🎯" },
  { type: "deck_outline", label: "6-Slide Deck Outline", icon: "📊" },
  { type: "cold_email", label: "Cold Email Draft", icon: "📧" },
  { type: "linkedin_intro", label: "LinkedIn Intro Request", icon: "🔗" },
];

export function PitchAssets({ project }: { project: Project }) {
  const [assets, setAssets] = useState<PitchAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, [project.id]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from("pitch_assets")
        .select("*")
        .eq("project_id", project.id);

      if (error) throw error;
      setAssets(data || []);
      
      // Auto-generate if no assets exist
      if (!data || data.length === 0) {
        generateAllAssets();
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAsset = async (assetType: string) => {
    setGenerating(assetType);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-pitch", {
        body: {
          project,
          assetType,
        },
      });

      if (error) throw error;

      const existingAsset = assets.find(a => a.asset_type === assetType);
      
      if (existingAsset) {
        // Update existing
        const { error: updateError } = await supabase
          .from("pitch_assets")
          .update({ content: data.content })
          .eq("id", existingAsset.id);

        if (updateError) throw updateError;
        
        setAssets(prev =>
          prev.map(a =>
            a.id === existingAsset.id ? { ...a, content: data.content } : a
          )
        );
      } else {
        // Insert new
        const { data: newAsset, error: insertError } = await supabase
          .from("pitch_assets")
          .insert({
            project_id: project.id,
            asset_type: assetType,
            content: data.content,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setAssets(prev => [...prev, newAsset]);
      }

      toast.success("Generated successfully!");
    } catch (error: any) {
      console.error("Error generating:", error);
      toast.error(error.message || "Failed to generate. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  const generateAllAssets = async () => {
    for (const { type } of assetTypes) {
      await generateAsset(type);
    }
  };

  const copyToClipboard = async (content: string, assetType: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedAsset(assetType);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedAsset(null), 2000);
  };

  const saveEdit = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from("pitch_assets")
        .update({ content: editContent })
        .eq("id", assetId);

      if (error) throw error;

      setAssets(prev =>
        prev.map(a => (a.id === assetId ? { ...a, content: editContent } : a))
      );
      setEditingAsset(null);
      toast.success("Saved!");
    } catch (error: any) {
      toast.error("Failed to save");
    }
  };

  const downloadAsText = () => {
    const content = assetTypes
      .map(({ type, label }) => {
        const asset = assets.find(a => a.asset_type === type);
        return `## ${label}\n\n${asset?.content || "Not generated yet"}\n\n---\n`;
      })
      .join("\n");

    const blob = new Blob([`# ${project.startup_name} - Pitch Materials\n\n${content}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.startup_name.toLowerCase().replace(/\s+/g, "-")}-pitch.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-foreground">Pitch Assets</h2>
          <p className="text-muted-foreground">
            AI-generated materials based on your startup details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadAsText}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button
            variant="coral"
            size="sm"
            onClick={generateAllAssets}
            disabled={!!generating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate All
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {assetTypes.map(({ type, label, icon }) => {
          const asset = assets.find(a => a.asset_type === type);
          const isGenerating = generating === type;
          const isEditing = editingAsset === asset?.id;

          return (
            <div
              key={type}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-display text-lg text-foreground">
                    {label}
                  </h3>
                </div>
                <div className="flex gap-2">
                  {asset && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(asset.content, type)}
                      >
                        {copiedAsset === type ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateAsset(type)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isGenerating ? (
                <div className="flex items-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating with AI...
                </div>
              ) : asset ? (
                isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[150px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(asset.id)}>
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAsset(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap cursor-pointer hover:bg-muted/50 rounded-lg p-3 -m-3 transition-colors"
                    onClick={() => {
                      setEditingAsset(asset.id);
                      setEditContent(asset.content);
                    }}
                  >
                    {asset.content}
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Not generated yet
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => generateAsset(type)}
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
