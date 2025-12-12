import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  ArrowLeft, 
  LogOut,
  FileText,
  Users,
  Target,
  BookOpen
} from "lucide-react";
import { PitchAssets } from "@/components/project/PitchAssets";
import { InvestorCRM } from "@/components/project/InvestorCRM";
import { PitchPractice } from "@/components/project/PitchPractice";
import { Resources } from "@/components/project/Resources";

interface Project {
  id: string;
  user_id: string;
  startup_name: string;
  one_liner: string;
  category: string;
  stage: string;
  website: string | null;
  traction_users: string | null;
  traction_revenue: string | null;
  traction_growth: string | null;
  team_size: string | null;
  problem_statement: string;
  solution_description: string;
  target_users: string;
  why_now: string | null;
  differentiation: string | null;
  competition: string | null;
  ask_amount: string;
  use_of_funds: string;
  business_model: string;
  go_to_market: string | null;
  pitch_tone: string | null;
  created_at: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchProject();
    }
  }, [user, id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate("/dashboard");
        return;
      }
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
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
        {/* Project Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold">
              {project.startup_name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl text-foreground">
                {project.startup_name}
              </h1>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                {project.category}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                {project.stage}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{project.one_liner}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pitch" className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl">
            <TabsTrigger
              value="pitch"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Pitch Assets</span>
            </TabsTrigger>
            <TabsTrigger
              value="investors"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Investor CRM</span>
            </TabsTrigger>
            <TabsTrigger
              value="practice"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pitch">
            <PitchAssets project={project} />
          </TabsContent>

          <TabsContent value="investors">
            <InvestorCRM projectId={project.id} />
          </TabsContent>

          <TabsContent value="practice">
            <PitchPractice project={project} />
          </TabsContent>

          <TabsContent value="resources">
            <Resources project={project} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
