import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Wave decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-wave-pattern animate-wave" />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <Logo className="text-primary-foreground" size="lg" />
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
              Log in
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline-light" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32 lg:pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Trusted by 500+ founders raising their first round
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-primary-foreground leading-tight mb-6 animate-fade-in-up animation-delay-100">
            Your idea-to-funding
            <br />
            <span className="text-accent">copilot</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            Go from startup idea to pitch-ready in minutes. FundingNEMO generates your pitch, 
            organizes investor outreach, and guides you to your first check.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Link to="/signup">
              <Button variant="coral" size="xl" className="gap-2 w-full sm:w-auto">
                Start Building Your Pitch
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline-light" size="xl" className="gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          <p className="text-primary-foreground/60 mt-6 text-sm animate-fade-in-up animation-delay-400">
            Free to start • No credit card required
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up animation-delay-500">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary-foreground/10">
            <div className="absolute inset-0 bg-gradient-to-b from-card/80 to-card backdrop-blur-sm" />
            <div className="relative p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded-lg w-1/3" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-muted rounded-lg" />
                  <div className="h-24 bg-muted rounded-lg" />
                  <div className="h-24 bg-muted rounded-lg" />
                </div>
                <div className="h-40 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
