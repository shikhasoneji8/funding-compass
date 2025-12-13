import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Loader2, 
  ArrowRight, 
  LogOut,
  Users,
  MessageSquare,
  Calendar,
  CheckCircle2,
  UserCheck
} from "lucide-react";

interface Project {
  id: string;
  startup_name: string;
  one_liner: string;
  category: string;
  stage: string;
  created_at: string;
}

interface Investor {
  id: string;
  status: string;
}

const statusColors: Record<string, string> = {
  not_contacted: "bg-muted text-muted-foreground",
  contacted: "bg-ocean-light text-primary",
  replied: "bg-accent/20 text-accent",
  meeting: "bg-primary/20 text-primary",
  passed: "bg-destructive/20 text-destructive",
  funded: "bg-green-100 text-green-700",
};

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch all investors for pipeline summary
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const { data: investorsData, error: investorsError } = await supabase
          .from("investors")
          .select("id, status")
          .in("project_id", projectIds);

        if (!investorsError) {
          setInvestors(investorsData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getPipelineCounts = () => {
    const counts: Record<string, number> = {
      not_contacted: 0,
      contacted: 0,
      replied: 0,
      meeting: 0,
      passed: 0,
      funded: 0,
    };
    investors.forEach(inv => {
      if (counts[inv.status] !== undefined) {
        counts[inv.status]++;
      }
    });
    return counts;
  };

  const pipelineCounts = getPipelineCounts();

  if (authLoading || loading) {
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
          <Logo size="md" />
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-foreground mb-2">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your fundraising progress
          </p>
        </div>

        {/* Pipeline Summary */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-8">
          <h2 className="font-display text-xl text-foreground mb-4">
            Investor Pipeline
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { key: "not_contacted", label: "Not Contacted" },
              { key: "contacted", label: "Contacted" },
              { key: "replied", label: "Replied" },
              { key: "meeting", label: "Meeting" },
              { key: "passed", label: "Passed" },
              { key: "funded", label: "Funded" },
            ].map((status) => (
              <div
                key={status.key}
                className={`rounded-xl p-4 text-center ${statusColors[status.key]}`}
              >
                <div className="text-2xl font-bold">
                  {pipelineCounts[status.key]}
                </div>
                <div className="text-xs font-medium mt-1">{status.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Your Projects</h2>
          <div className="flex items-center gap-2">
            <Link to="/investor-panel">
              <Button variant="outline" size="sm" className="gap-2">
                <UserCheck className="w-4 h-4" />
                Investor Panel
              </Button>
            </Link>
            <Link to="/onboarding">
              <Button variant="coral" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">
              Create Your First Project
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by telling us about your startup and we'll generate your pitch materials.
            </p>
            <Link to="/onboarding">
              <Button variant="coral" size="lg" className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} to={`/project/${project.id}`}>
                <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-glow hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {project.startup_name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                      {project.category}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2">
                    {project.startup_name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {project.one_liner}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded">{project.stage}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {projects.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl text-foreground mb-4">
              What's Next?
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Add Investors</h4>
                  <p className="text-sm text-muted-foreground">
                    Build your pipeline of potential investors
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Practice Pitch</h4>
                  <p className="text-sm text-muted-foreground">
                    Refine your delivery with practice mode
                  </p>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean-mid/10 text-ocean-mid flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Schedule Follow-ups</h4>
                  <p className="text-sm text-muted-foreground">
                    Never miss an investor follow-up
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
