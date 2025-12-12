import { 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap 
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Pitch Generation",
    description: "Get a compelling one-liner, 30-sec pitch, 2-min pitch, and deck outline generated from your inputs.",
  },
  {
    icon: MessageSquare,
    title: "Cold Email & Intro Templates",
    description: "Professional investor outreach templates customized to your startup and stage.",
  },
  {
    icon: BarChart3,
    title: "Investor Pipeline CRM",
    description: "Track every investor from first contact to check received. Never lose an opportunity.",
  },
  {
    icon: Clock,
    title: "Follow-up Reminders",
    description: "Automated reminders ensure you stay on top of every investor conversation.",
  },
  {
    icon: Shield,
    title: "Pitch Practice Mode",
    description: "Practice your pitch with AI feedback on clarity, specificity, and persuasiveness.",
  },
  {
    icon: Zap,
    title: "One-Click Export",
    description: "Copy any asset to clipboard or export as PDF. Ready for any pitch situation.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Everything You Need to Raise
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From pitch creation to investor management, we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="font-display text-xl text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
